import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { SOP } from "./types"

interface StatsOverviewProps {
  sops: SOP[]
}

export function StatsOverview({ sops }: StatsOverviewProps) {
  const totalSops = sops.length
  const highPrioritySops = sops.filter((s) => s.priority === "high").length
  const categories = [...new Set(sops.map(s => s.category))]
  const authors = [...new Set(sops.map(s => s.authorId))]
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="text-3xl font-meutas text-primary">{totalSops}</div>
          <div className="text-sm font-meutas text-muted-foreground">Total procédures</div>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="text-3xl font-meutas text-primary">{categories.length}</div>
          <div className="text-sm font-meutas text-muted-foreground">Catégories</div>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="text-3xl font-meutas text-primary">{authors.length}</div>
          <div className="text-sm font-meutas text-muted-foreground">Auteurs</div>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="text-3xl font-meutas text-primary">{highPrioritySops}</div>
          <div className="text-sm font-meutas text-muted-foreground">Haute priorité</div>
        </CardContent>
      </Card>
    </div>
  )
} 