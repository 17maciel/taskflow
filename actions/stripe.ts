"use server"

import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server" // Use server client
import { PLANS } from "@/types/plans"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
})

export async function createStripeCheckoutSession(planId: string, userId: string, userEmail: string) {
  const plan = PLANS.find((p) => p.id === planId)

  if (!plan || plan.price === 0) {
    return { error: "Plano inválido ou gratuito." }
  }

  const supabase = createClient() // Use server client
  if (!supabase) {
    return { error: "Erro de configuração do Supabase." }
  }

  try {
    // Check if customer already exists in Stripe
    let customerId: string | null = null
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "Usuário não autenticado." }
    }

    // Try to retrieve existing customer by Supabase user ID
    const { data: existingCustomerData, error: customerFetchError } = await supabase
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single()

    if (existingCustomerData) {
      customerId = existingCustomerData.stripe_customer_id
    } else {
      // Create new customer if not found
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          supabase_user_id: userId,
        },
      })
      customerId = customer.id

      // Store new customer ID in Supabase
      const { error: insertError } = await supabase.from("stripe_customers").insert({
        user_id: userId,
        stripe_customer_id: customerId,
      })
      if (insertError) {
        console.error("Error inserting stripe customer ID:", insertError)
        return { error: "Erro ao salvar informações do cliente Stripe." }
      }
    }

    if (!customerId) {
      return { error: "Não foi possível obter ou criar o cliente Stripe." }
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: plan.price * 100, // Price in cents
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}/cadastro?payment=cancelled`,
      metadata: {
        userId: userId,
        planId: planId,
      },
    })

    return { url: checkoutSession.url }
  } catch (error: any) {
    console.error("Stripe checkout session creation error:", error)
    return { error: error.message || "Erro ao criar sessão de checkout." }
  }
}
