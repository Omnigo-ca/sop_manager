import React from "react"
import { X, Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SOP } from "../types"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "../utils"

interface SopDetailDialogProps {
  sop: SOP | null
  onClose: () => void
  canEdit: boolean
  canDelete: boolean
  onEdit: (sop: SOP) => void
  onDelete: (sop: SOP) => void
}

export function SopDetailDialog({ sop, onClose, canEdit, canDelete, onEdit, onDelete }: SopDetailDialogProps) {
  if (!sop) return null;

  return (
    <Dialog open={!!sop} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle className="text-2xl font-meutas font-bold">{sop.title}</DialogTitle>
            <div className="flex gap-2">
              {canEdit && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(sop)}
                  className="border-black hover:bg-gray-100"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDelete(sop)}
                  className="border-black hover:bg-gray-100"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={onClose}
                className="border-black hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600">
            <span>Par {sop.author}</span>
            <span>•</span>
            <span>Créé le {formatDate(sop.createdAt)}</span>
            {sop.editedAt && (
              <>
                <span>•</span>
                <span>Modifié le {formatDate(sop.editedAt)}</span>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-black">
              {sop.category}
            </Badge>
            <Badge variant="outline" className="border-black capitalize">
              {sop.priority}
            </Badge>
            {sop.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="border-black">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="prose prose-sm max-w-none">
            <h3 className="text-lg font-meutas font-semibold">Description</h3>
            <p>{sop.description}</p>

            <h3 className="text-lg font-meutas font-semibold mt-6">Instructions</h3>
            <div className="whitespace-pre-wrap">{sop.instructions}</div>

            {sop.steps && sop.steps.length > 0 && (
              <>
                <h3 className="text-lg font-meutas font-semibold mt-6">Étapes</h3>
                <div className="space-y-4">
                  {sop.steps.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      {step.image && (
                        <img
                          src={step.image}
                          alt={`Étape ${index + 1}`}
                          className="w-24 h-24 object-cover rounded"
                        />
                      )}
                      <div>{step.text}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 