import React from "react"
import { Edit, X, User, Tag, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { SOP, priorityColors, priorityLabels } from "../types"

interface SopDetailDialogProps {
  sop: SOP
  onEdit: () => void
  onDelete: () => void
}

export function SopDetailDialog({ sop, onEdit, onDelete }: SopDetailDialogProps) {
  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>{sop.title}</DialogTitle>
        <DialogDescription>{sop.description}</DialogDescription>
      </DialogHeader>
      
      {/* Instructions */}
      <div>
        <h4 className="font-medium mb-2">Instructions:</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="whitespace-pre-wrap text-sm">{sop.instructions}</pre>
        </div>
      </div>
      
      {/* Étapes illustrées */}
      {sop.steps && sop.steps.length > 0 && (
        <div>
          <h4 className="font-medium mb-2 mt-4">Étapes illustrées :</h4>
          <ol className="space-y-6 list-decimal list-inside">
            {sop.steps.map((step, idx) => (
              <li key={idx} className="mb-2">
                <div className="font-semibold mb-1">{step.text}</div>
                <img
                  src={step.image}
                  alt={step.text}
                  className="max-w-full h-auto rounded border shadow-sm"
                  style={{ maxHeight: 200 }}
                />
              </li>
            ))}
          </ol>
        </div>
      )}
      
      {/* Metadata */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
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
        {sop.editedAt && (
          <div className="flex items-center gap-1 text-blue-600">
            <Edit className="h-4 w-4" />
            Modifié le {new Date(sop.editedAt).toLocaleDateString("fr-FR")}
          </div>
        )}
      </div>
      
      {/* Tags */}
      {sop.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {sop.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      
      {/* Boutons Modifier et Supprimer */}
      <div className="flex gap-2 justify-end pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="flex items-center gap-1"
        >
          <Edit className="h-4 w-4" /> Modifier
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="flex items-center gap-1"
          onClick={onDelete}
        >
          <X className="h-4 w-4" /> Supprimer
        </Button>
      </div>
    </div>
  )
} 