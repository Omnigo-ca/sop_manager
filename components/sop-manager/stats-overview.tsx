import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { SOP } from "./types"

interface StatsOverviewProps {
  sops: SOP[]
  filteredSops: SOP[]
  uniqueCategories: string[]
}

export function StatsOverview({ sops, filteredSops, uniqueCategories }: StatsOverviewProps) {
  const criticalSops = sops.filter((s) => s.priority === "critical").length
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{sops.length}</div>
          <div className="text-sm text-gray-600">Total SOP</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{filteredSops.length}</div>
          <div className="text-sm text-gray-600">Affichés</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{uniqueCategories.length}</div>
          <div className="text-sm text-gray-600">Catégories</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{criticalSops}</div>
          <div className="text-sm text-gray-600">Critiques</div>
        </CardContent>
      </Card>
    </div>
  )
} 