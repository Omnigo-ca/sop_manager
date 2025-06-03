import React from "react"
import { Download, Edit, User, Tag, Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SOP, priorityColors, priorityLabels } from "../types"

interface ListViewProps {
  sops: SOP[]
  downloadingPdf: string | null
  onViewDetails: (sop: SOP) => void
  onEdit: (sop: SOP) => void
  onDownloadPDF: (sop: SOP) => Promise<void>
}

export function ListView({ sops, downloadingPdf, onViewDetails, onEdit, onDownloadPDF }: ListViewProps) {
  return (
    <div className="space-y-4">
      {sops.map((sop) => (
        <Card key={sop.id} className="hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-semibold">{sop.title}</h3>
                  {sop.editedAt && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      Modifié
                    </Badge>
                  )}
                  <Badge className={priorityColors[sop.priority.toLowerCase() as SOP["priority"]]}>
                    {priorityLabels[sop.priority.toLowerCase() as SOP["priority"]]}
                  </Badge>
                </div>
                {sop.description && (
                  <p className="text-gray-600 mb-4">{sop.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {sop.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    {sop.category}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Créé le {new Date(sop.createdAt).toLocaleDateString("fr-FR")}
                  </div>
                </div>
                {sop.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {sop.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownloadPDF(sop)}
                  disabled={downloadingPdf === sop.id}
                  className="flex items-center gap-1"
                >
                  {downloadingPdf === sop.id ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      Génération...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      PDF
                    </>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onViewDetails(sop)}
                  className="flex items-center gap-1"
                >
                  Détails
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(sop)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
} 