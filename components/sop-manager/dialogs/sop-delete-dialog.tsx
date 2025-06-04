import React from "react"
import { 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogAction, 
  AlertDialogCancel
} from "@/components/ui/alert-dialog"
import { SOP } from "../types"

interface SopDeleteDialogProps {
  sop: SOP
  onConfirm: (id: string) => void
  onCancel: () => void
}

export function SopDeleteDialog({ sop, onConfirm, onCancel }: SopDeleteDialogProps) {
  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Supprimer la procédure ?</AlertDialogTitle>
        <AlertDialogDescription>
          Êtes-vous sûr de vouloir supprimer la SOP "{sop.title}" ? Cette action est irréversible.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel}>Annuler</AlertDialogCancel>
        <AlertDialogAction onClick={() => onConfirm(sop.id)} autoFocus>Supprimer</AlertDialogAction>
      </AlertDialogFooter>
    </>
  )
} 