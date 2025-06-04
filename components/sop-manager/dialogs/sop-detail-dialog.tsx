import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { SOP } from "../types"

interface SopDetailDialogProps {
  sop: SOP | null
  onClose: () => void
}

export function SopDetailDialog({ sop, onClose }: SopDetailDialogProps) {
  if (!sop) return null

  return (
    <Dialog open={!!sop} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white border-black">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-meutas mb-2">{sop.title}</DialogTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <span>Créé le {new Date(sop.createdAt).toLocaleDateString()}</span>
                {sop.editedAt && (
                  <>
                    <span>•</span>
                    <span>Modifié le {new Date(sop.editedAt).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-meutas mb-2">Description</h3>
            <p className="text-gray-600">{sop.description}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div>
              <h4 className="font-meutas mb-1">Catégorie</h4>
              <Badge variant="outline" className="border-black">
                {sop.category}
              </Badge>
            </div>
            <div>
              <h4 className="font-meutas mb-1">Priorité</h4>
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
            {sop.tags && sop.tags.length > 0 && (
              <div>
                <h4 className="font-meutas mb-1">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {sop.tags.map((tag, index) => (
                    <Badge 
                      key={index}
                      variant="outline"
                      className="border-black bg-primary-light text-primary"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-meutas mb-2">Instructions</h3>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-gray-600 bg-gray-50 p-4 rounded-lg border border-black">
                {sop.instructions}
              </pre>
            </div>
          </div>

          {sop.steps && sop.steps.length > 0 && (
            <div>
              <h3 className="text-lg font-meutas mb-2">Étapes illustrées</h3>
              <div className="space-y-4">
                {sop.steps.map((step, index) => (
                  <div 
                    key={index}
                    className="p-4 border border-black rounded-lg bg-gray-50"
                  >
                    <p className="mb-2 text-gray-600">{step.text}</p>
                    {step.image && (
                      <img
                        src={step.image}
                        alt={`Étape ${index + 1}`}
                        className="max-h-48 rounded-lg border border-black"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 