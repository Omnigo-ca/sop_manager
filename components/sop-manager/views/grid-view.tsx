import React from "react"
import { Download, ChevronDown, Edit, Trash } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SOP } from "../types"

interface GridViewProps {
  sops: SOP[]
  downloadingPdf: string | null
  onSelect: (sop: SOP) => void
  onEdit: (sop: SOP) => void
  onDelete: (sop: SOP) => void
  onDownloadPDF: (sop: SOP) => Promise<void>
}

export function GridView({ sops, downloadingPdf, onSelect, onEdit, onDelete, onDownloadPDF }: GridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sops.map((sop) => (
        <Card 
          key={sop.id} 
          className="hover:shadow-md transition-shadow flex flex-col justify-between border-black bg-white"
        >
          <CardHeader className="space-y-2">
            <div className="flex justify-between items-start gap-2">
              <CardTitle 
                className="text-lg font-meutas line-clamp-2 flex-1 cursor-pointer hover:text-primary transition-colors"
                onClick={() => onSelect(sop)}
              >
                {sop.title}
              </CardTitle>
              <Badge 
                className={`${
                  sop.priority === "high" 
                    ? "bg-red-100 text-red-800 border-red-200" 
                    : sop.priority === "medium"
                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                    : "bg-green-100 text-green-800 border-green-200"
                } font-meutas`}
              >
                {sop.priority === "high" ? "Haute" : sop.priority === "medium" ? "Moyenne" : "Basse"}
              </Badge>
            </div>

            {sop.description && (
              <CardDescription className="text-sm line-clamp-3 text-gray-600">
                {sop.description}
              </CardDescription>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Catégorie: {sop.category}</span>
              {sop.editedAt && (
                <Badge variant="outline" className="text-xs bg-primary-light text-primary border-primary">
                  Modifié
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(sop)}
                  className="border-black hover:bg-primary-light hover:text-white transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(sop)}
                  className="border-black hover:bg-red-500 hover:text-white transition-colors"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownloadPDF(sop)}
                disabled={downloadingPdf === sop.id}
                className="border-black hover:bg-primary hover:text-white transition-colors flex items-center gap-1"
              >
                {downloadingPdf === sop.id ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    PDF
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    PDF
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 