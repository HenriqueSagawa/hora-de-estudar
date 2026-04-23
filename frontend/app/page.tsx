'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Clock, 
  Users, 
  Trophy, 
  BarChart3, 
  Target,
  Zap,
  BookOpen,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'

const features = [
  {
    icon: Clock,
    title: 'Controle de Tempo',
    description: 'Cronômetro integrado para registrar suas sessões de estudo com precisão.',
  },
  {
    icon: Users,
    title: 'Salas de Estudo',
    description: 'Crie ou participe de salas para estudar junto com amigos e colegas.',
  },
  {
    icon: Trophy,
    title: 'Rankings e Competição',
    description: 'Compare seu progresso com outros estudantes e suba no ranking.',
  },
  {
    icon: BarChart3,
    title: 'Estatísticas Detalhadas',
    description: 'Acompanhe seu desempenho com gráficos e métricas completas.',
  },
  {
    icon: Target,
    title: 'Metas Personalizadas',
    description: 'Defina objetivos diários e semanais para manter o foco.',
  },
  {
    icon: BookOpen,
    title: 'Organização por Matéria',
    description: 'Categorize suas sessões por disciplina e acompanhe cada uma.',
  },
]

const benefits = [
  'Aumente sua produtividade com métricas reais',
  'Mantenha a motivação competindo com amigos',
  'Identifique seus melhores horários de estudo',
  'Acompanhe seu progresso ao longo do tempo',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Hora de Estudar</span>
          </Link>
          
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Recursos
            </Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Como Funciona
            </Link>
          </nav>
          
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">
                Criar Conta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-secondary/50 px-4 py-1.5 text-sm">
              <Zap className="h-4 w-4 text-primary" />
              <span>Comece a estudar de forma inteligente</span>
            </div>
            
            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-6xl">
              Transforme suas horas de estudo em{' '}
              <span className="text-primary">resultados reais</span>
            </h1>
            
            <p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl">
              Acompanhe seu tempo de estudo, compita com amigos em salas e alcance seus 
              objetivos acadêmicos com uma plataforma completa de gerenciamento.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Começar Gratuitamente
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Já tenho uma conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Tudo que você precisa para estudar melhor
            </h2>
            <p className="text-muted-foreground">
              Ferramentas poderosas para maximizar seu tempo de estudo e alcançar seus objetivos.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 bg-card/50 shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Simples de usar, poderoso nos resultados
              </h2>
              <p className="mb-8 text-muted-foreground">
                Nossa plataforma foi desenvolvida para ser intuitiva, permitindo que você 
                foque no que realmente importa: seus estudos.
              </p>
              
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8">
                <Link href="/register">
                  <Button size="lg" className="gap-2">
                    Criar Conta Grátis
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="rounded-2xl border bg-card p-6 shadow-lg">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tempo estudado hoje</p>
                    <p className="text-3xl font-bold">4h 32min</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                      <span className="text-sm font-medium">Matemática</span>
                    </div>
                    <span className="text-sm text-muted-foreground">2h 15min</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-chart-2" />
                      <span className="text-sm font-medium">Português</span>
                    </div>
                    <span className="text-sm text-muted-foreground">1h 30min</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-chart-3" />
                      <span className="text-sm font-medium">História</span>
                    </div>
                    <span className="text-sm text-muted-foreground">47min</span>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -right-4 -top-4 -z-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
              <div className="absolute -bottom-4 -left-4 -z-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl">
            Pronto para começar?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-primary-foreground/80">
            Junte-se a milhares de estudantes que já estão usando o Hora de Estudar 
            para alcançar seus objetivos.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="gap-2">
              Criar Conta Gratuitamente
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">Hora de Estudar</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              2024 Hora de Estudar. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
