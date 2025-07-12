"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CheckCircle,
  BarChart,
  Users,
  Settings,
  Globe,
  Star,
  ArrowRight,
  Zap,
  Shield,
  Clock,
  Target,
  TrendingUp,
  Award,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { PLANS } from "@/types/plans" // Ensure PLANS is imported from types/plans.ts

const features = [
  {
    icon: BarChart,
    title: "Análise Avançada",
    description: "Dashboards intuitivos com métricas em tempo real para acompanhar o progresso dos seus projetos.",
  },
  {
    icon: Users,
    title: "Colaboração Inteligente",
    description: "Trabalhe em equipe com ferramentas de comunicação integradas e controle de permissões.",
  },
  {
    icon: Settings,
    title: "Automação Completa",
    description: "Automatize tarefas repetitivas e configure workflows personalizados para sua equipe.",
  },
  {
    icon: Globe,
    title: "Acesso Universal",
    description: "Plataforma 100% web, acessível de qualquer dispositivo, a qualquer hora e lugar.",
  },
]

const benefits = [
  {
    icon: Zap,
    title: "Aumento de 40% na Produtividade",
    description: "Equipes relatam significativo aumento na eficiência após implementar o TaskFlow.",
    color: "from-yellow-400 to-orange-500",
  },
  {
    icon: Shield,
    title: "Segurança Empresarial",
    description: "Criptografia de ponta a ponta e conformidade com LGPD para proteger seus dados.",
    color: "from-green-400 to-blue-500",
  },
  {
    icon: Clock,
    title: "Economia de 15h/semana",
    description: "Reduza tempo gasto em reuniões e relatórios com automação inteligente.",
    color: "from-purple-400 to-pink-500",
  },
]

const testimonials = [
  {
    quote:
      "O TaskFlow transformou completamente nossa gestão de projetos. Conseguimos entregar 30% mais projetos no mesmo período.",
    name: "Ana Paula Silva",
    title: "Diretora de Projetos, TechCorp",
    rating: 5,
    initials: "AP",
  },
  {
    quote: "Interface intuitiva e recursos poderosos. Nossa equipe adotou a ferramenta em menos de uma semana.",
    name: "Carlos Eduardo Santos",
    title: "CEO, StartupFlow",
    rating: 5,
    initials: "CE",
  },
  {
    quote: "Finalmente uma solução que cresce com nossa empresa. Desde startups até grandes corporações.",
    name: "Mariana Costa",
    title: "Gerente de Operações, ScaleUp",
    rating: 5,
    initials: "MC",
  },
]

const stats = [
  { number: "10.000+", label: "Equipes Ativas" },
  { number: "40%", label: "Aumento Produtividade" },
  { number: "15h", label: "Economia/Semana" },
  { number: "4.9/5", label: "Avaliação Clientes" },
]

export default function HomePage() {
  const router = useRouter()

  const handleGetStarted = (planId?: string) => {
    if (planId) {
      router.push(`/cadastro?plan=${planId}`)
    } else {
      router.push("/cadastro")
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="#" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">TaskFlow</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#recursos" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Recursos
            </Link>
            <Link href="#beneficios" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Benefícios
            </Link>
            <Link href="#precos" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Preços
            </Link>
            <Link href="#depoimentos" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Depoimentos
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Button onClick={() => handleGetStarted("free")} className="bg-blue-600 hover:bg-blue-700">
              Começar Grátis
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>

          <div className="container px-4 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                    🚀 Mais de 10.000 equipes confiam no TaskFlow
                  </Badge>
                  <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                    Gerencie projetos com
                    <span className="text-blue-600"> inteligência</span>
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Transforme a gestão da sua equipe com a plataforma mais completa do mercado. Planeje, execute e
                    monitore projetos com eficiência máxima.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    onClick={() => handleGetStarted("free")}
                    className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
                  >
                    Começar Grátis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleGetStarted("professional")}
                    className="text-lg px-8 py-6"
                  >
                    Ver Planos Pro
                  </Button>
                </div>

                <div className="flex items-center space-x-8 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Teste grátis por 15 dias</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Sem cartão de crédito</span>
                  </div>
                </div>
              </div>

              {/* Visual Dashboard Mockup */}
              <div className="relative">
                <div className="relative bg-white rounded-2xl shadow-2xl p-6 border">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-sm text-gray-500">TaskFlow Dashboard</div>
                  </div>

                  {/* Dashboard Content */}
                  <div className="space-y-4">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                        <div className="flex items-center space-x-2">
                          <Target className="h-5 w-5" />
                          <div>
                            <div className="text-2xl font-bold">24</div>
                            <div className="text-xs opacity-80">Projetos Ativos</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-5 w-5" />
                          <div>
                            <div className="text-2xl font-bold">87%</div>
                            <div className="text-xs opacity-80">Taxa Conclusão</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Website Redesign</span>
                          <span>75%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Mobile App</span>
                          <span>45%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Marketing Campaign</span>
                          <span>90%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: "90%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Stats */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-4 border">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">+40% Produtividade</span>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-4 border">
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">4.9/5 ⭐</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white border-b">
          <div className="container px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="beneficios" className="py-20 bg-gray-50">
          <div className="container px-4">
            <div className="text-center space-y-4 mb-16">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Resultados Comprovados
              </Badge>
              <h2 className="text-3xl lg:text-5xl font-bold">Por que escolher o TaskFlow?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Mais de 10.000 equipes já transformaram sua produtividade com nossa plataforma
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card
                  key={index}
                  className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${benefit.color} rounded-full flex items-center justify-center mx-auto mb-6`}
                  >
                    <benefit.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="recursos" className="py-20 bg-white">
          <div className="container px-4">
            <div className="text-center space-y-4 mb-16">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                Recursos Avançados
              </Badge>
              <h2 className="text-3xl lg:text-5xl font-bold">Tudo que sua equipe precisa</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Ferramentas profissionais para gestão completa de projetos e equipes
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="depoimentos" className="py-20 bg-gray-50">
          <div className="container px-4">
            <div className="text-center space-y-4 mb-16">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                ⭐ Avaliação 4.9/5
              </Badge>
              <h2 className="text-3xl lg:text-5xl font-bold">O que nossos clientes dizem</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Histórias reais de transformação e sucesso</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-6 italic">"{testimonial.quote}"</blockquote>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {testimonial.initials}
                    </div>
                    <div>
                      <div className="font-bold">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.title}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="precos" className="py-20 bg-white">
          <div className="container px-4">
            <div className="text-center space-y-4 mb-16">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Planos Flexíveis
              </Badge>
              <h2 className="text-3xl lg:text-5xl font-bold">Escolha o plano ideal</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comece grátis e escale conforme sua equipe cresce
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {PLANS.map((plan, index) => (
                <Card
                  key={plan.id}
                  className={`relative p-8 transition-all duration-300 hover:scale-105 ${
                    plan.popular
                      ? "border-2 border-blue-500 shadow-xl bg-gradient-to-b from-blue-50 to-white"
                      : "border shadow-lg hover:shadow-xl"
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                      Mais Popular
                    </Badge>
                  )}

                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <p className="text-gray-600">{plan.description}</p>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.price === 0 ? "Grátis" : `R$${plan.price}`}</span>
                      {plan.price !== 0 && <span className="text-gray-500">/mês</span>}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.limits.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full mt-8 transition-all duration-300 ${
                        plan.popular ? "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl" : "hover:bg-blue-50"
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handleGetStarted(plan.id)}
                    >
                      {plan.id === "free" ? "Começar Grátis" : "Escolher Plano"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Cpath d='m0 40l40-40h-40v40zm40 0v-40h-40l40 40z'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>
          <div className="container px-4 text-center relative">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl lg:text-5xl font-bold">Pronto para transformar sua gestão?</h2>
              <p className="text-xl opacity-90">
                Junte-se a mais de 10.000 equipes que já revolucionaram sua produtividade
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => handleGetStarted("free")}
                  className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Começar Grátis Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">TaskFlow</span>
              </div>
              <p className="text-gray-400">A plataforma de gestão de projetos mais completa do mercado.</p>
            </div>

            <div>
              <h3 className="font-bold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#recursos" className="hover:text-white transition-colors">
                    Recursos
                  </Link>
                </li>
                <li>
                  <Link href="#precos" className="hover:text-white transition-colors">
                    Preços
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Integrações
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Sobre
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Carreiras
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Central de Ajuda
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contato
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">&copy; 2024 TaskFlow. Todos os direitos reservados.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacidade
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Termos
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                LGPD
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
