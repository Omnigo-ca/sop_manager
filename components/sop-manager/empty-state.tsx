import React from "react"
import { AlertCircle, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface EmptyStateProps {
  hasSops: boolean
}

export function EmptyState({ hasSops }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <div className="text-gray-500">
          {!hasSops ? (
            <>
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Aucun SOP créé</h3>
              <p>Commencez par créer votre première procédure</p>
            </>
          ) : (
            <>
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Aucun résultat</h3>
              <p>Essayez de modifier vos critères de recherche</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 