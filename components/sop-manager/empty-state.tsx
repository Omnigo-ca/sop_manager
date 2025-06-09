import React from "react"
import { AlertCircle, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface EmptyStateProps {
  hasSops?: boolean
}

export function EmptyState({ hasSops = false }: EmptyStateProps) {
  return (
    <Card className="border-black bg-white dark:bg-background dark:border-none dark:rounded-none">
      <CardContent className="p-8 text-center">
        <div className="text-black dark:text-white">
          {!hasSops ? (
            <>
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-meutas mb-2">Aucune procédure</h3>
              <p className="text-gray-600 dark:text-gray-400">Commencez par créer votre première procédure</p>
            </>
          ) : (
            <>
              <Search className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-meutas mb-2">Aucun résultat</h3>
              <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 