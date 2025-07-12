import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server" // Importe o cliente Supabase do servidor

// Inicialize o Stripe com sua chave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
})

// Certifique-se de que STRIPE_WEBHOOK_SECRET está configurado nas suas variáveis de ambiente
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const supabase = createClient()

  // Lide com os eventos do Stripe
  switch (event.type) {
    case "checkout.session.completed":
      const checkoutSession = event.data.object as Stripe.Checkout.Session
      const userId = checkoutSession.metadata?.userId as string
      const planId = checkoutSession.metadata?.planId as string
      const customerId = checkoutSession.customer as string
      const subscriptionId = checkoutSession.subscription as string

      console.log(`Checkout Session Completed for User: ${userId}, Plan: ${planId}`)

      if (userId && planId && customerId && subscriptionId) {
        // Atualize o banco de dados do Supabase para registrar a assinatura
        // E resete o contador de uso de IA para 0
        const { error } = await supabase
          .from("profiles")
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: "active",
            plan_id: planId,
            trial_ends_at: null,
            ai_predictions_this_month: 0, // Resetar o contador de IA
          })
          .eq("id", userId)

        if (error) {
          console.error("Error updating user profile on checkout.session.completed:", error)
          return new NextResponse(`Database update error: ${error.message}`, { status: 500 })
        }
      } else {
        console.warn("Missing metadata for checkout.session.completed event.")
      }
      break

    case "customer.subscription.updated":
      const subscriptionUpdated = event.data.object as Stripe.Subscription
      const updatedSubscriptionId = subscriptionUpdated.id
      const updatedCustomerId = subscriptionUpdated.customer as string
      const updatedStatus = subscriptionUpdated.status
      const updatedPlanId = subscriptionUpdated.items.data[0]?.price?.metadata?.planId || null

      console.log(`Subscription Updated: ${updatedSubscriptionId}, Status: ${updatedStatus}`)

      const { data: userProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", updatedCustomerId)
        .single()

      if (fetchError || !userProfile) {
        console.error("Error fetching user profile for subscription update:", fetchError?.message || "User not found")
        return new NextResponse(`User not found for subscription update`, { status: 404 })
      }

      // Lógica para resetar o contador de IA em uma nova fatura/ciclo de faturamento
      // Isso é mais complexo e geralmente requer verificar `event.request.id` ou `invoice.payment_succeeded`
      // Para simplificar, vamos resetar se o status for 'active' e o plano mudar, ou se for uma renovação
      let resetAIAmount = {}
      if (
        updatedStatus === "active" &&
        subscriptionUpdated.current_period_start !== subscriptionUpdated.current_period_end
      ) {
        // Esta é uma simplificação. Em produção, você pode querer um cron job
        // ou verificar eventos de fatura para resetar mensalmente.
        resetAIAmount = { ai_predictions_this_month: 0 }
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          subscription_status: updatedStatus,
          plan_id: updatedPlanId,
          ...resetAIAmount, // Aplica o reset se a condição for verdadeira
        })
        .eq("id", userProfile.id)

      if (updateError) {
        console.error("Error updating user profile on customer.subscription.updated:", updateError)
        return new NextResponse(`Database update error: ${updateError.message}`, { status: 500 })
      }
      break

    case "customer.subscription.deleted":
      const subscriptionDeleted = event.data.object as Stripe.Subscription
      const deletedSubscriptionId = subscriptionDeleted.id
      const deletedCustomerId = subscriptionDeleted.customer as string

      console.log(`Subscription Deleted: ${deletedSubscriptionId}`)

      const { data: deletedUserProfile, error: deletedFetchError } = await supabase
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", deletedCustomerId)
        .single()

      if (deletedFetchError || !deletedUserProfile) {
        console.error(
          "Error fetching user profile for subscription deletion:",
          deletedFetchError?.message || "User not found",
        )
        return new NextResponse(`User not found for subscription deletion`, { status: 404 })
      }

      const { error: deleteError } = await supabase
        .from("profiles")
        .update({
          subscription_status: "canceled",
          plan_id: "free",
          stripe_subscription_id: null,
          stripe_customer_id: null,
          trial_ends_at: null,
          ai_predictions_this_month: 0, // Reseta o contador de IA ao cancelar
        })
        .eq("id", deletedUserProfile.id)

      if (deleteError) {
        console.error("Error updating user profile on customer.subscription.deleted:", deleteError)
        return new NextResponse(`Database update error: ${deleteError.message}`, { status: 500 })
      }
      break

    default:
      console.warn(`Unhandled event type ${event.type}`)
  }

  return new NextResponse(JSON.stringify({ received: true }), { status: 200 })
}
