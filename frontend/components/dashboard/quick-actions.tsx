'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Timer, PlusCircle, Users, BarChart3 } from 'lucide-react'

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        <CardDescription>Comece a estudar agora</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Button asChild className="w-full justify-start gap-3 h-12">
          <Link href="/dashboard/timer">
            <Timer className="h-5 w-5" />
            Iniciar Cronômetro
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start gap-3 h-12">
          <Link href="/dashboard/sessions?action=create">
            <PlusCircle className="h-5 w-5" />
            Registrar Sessão Manual
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start gap-3 h-12">
          <Link href="/dashboard/rooms">
            <Users className="h-5 w-5" />
            Minhas Salas
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start gap-3 h-12">
          <Link href="/dashboard/statistics">
            <BarChart3 className="h-5 w-5" />
            Ver Estatísticas
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
