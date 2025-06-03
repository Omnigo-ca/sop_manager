import React from "react"
import { Download, ChevronDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SOP, priorityColors, priorityLabels } from "../types"

interface GridViewProps {
  sops: SOP[]
  downloadingPdf: string | null
  onViewDetails: (sop: SOP) => void
  onDownloadPDF: (sop: SOP) => Promise<void>
}

export function GridView({ sops, downloadingPdf, onViewDetails, onDownloadPDF }: GridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sops.map((sop) => (
        <Card key={sop.id} className="hover:shadow-md transition-shadow flex flex-col justify-between">
          <CardHeader>
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-lg line-clamp-2">{sop.title}</CardTitle>
                  {sop.editedAt && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      Modifié
                    </Badge>
                  )}
                </div>
                {sop.description && (
                  <CardDescription className="text-sm line-clamp-3 mb-2">{sop.description}</CardDescription>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
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
                <Badge className={priorityColors[sop.priority.toLowerCase() as SOP["priority"]]}>
                  {priorityLabels[sop.priority.toLowerCase() as SOP["priority"]]}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <div className="flex justify-end p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(sop)}
              className="flex items-center gap-1"
            >
              <span>Voir plus</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
} 