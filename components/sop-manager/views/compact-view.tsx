import React from "react"
import { Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SOP, priorityColors, priorityLabels } from "../types"

interface CompactViewProps {
  sops: SOP[]
  onViewDetails: (sop: SOP) => void
  onEdit?: (sop: SOP) => void
}

export function CompactView({ sops, onViewDetails, onEdit }: CompactViewProps) {
  return (
    <div className="bg-card rounded-lg shadow overflow-hidden">
      <div className="divide-y divide-border">
        {sops.map((sop) => (
          <div key={sop.id} className="p-4 hover:bg-muted transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Badge className={priorityColors[sop.priority.toLowerCase() as SOP["priority"]]}>
                {priorityLabels[sop.priority.toLowerCase() as SOP["priority"]]}
              </Badge>
              <div>
                <h3 className="font-medium text-card-foreground">{sop.title}</h3>
                <div className="text-sm text-muted-foreground flex gap-3 mt-1">
                  <span>{sop.category}</span>
                  <span>•</span>
                  <span>{sop.author}</span>
                  <span>•</span>
                  <span>{new Date(sop.createdAt).toLocaleDateString("fr-FR")}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(sop)}
                className="flex items-center gap-1"
              >
                Voir
              </Button>
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(sop)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 