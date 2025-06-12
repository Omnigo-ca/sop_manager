import React, { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SOP } from "../types"

interface SopDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sop: SOP | null
  onConfirm: () => void
}

export function SopDeleteDialog({ open, onOpenChange, sop, onConfirm }: SopDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  if (!sop) return null

  const handleDelete = async () => {
    if (isDeleting) return
    
    setIsDeleting(true)
    try {
      await onConfirm()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white border-black">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-meutas">
            Supprimer la procédure
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600">
            Êtes-vous sûr de vouloir supprimer la procédure "{sop.title}" ? Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            className="border-black hover:bg-gray-100"
            disabled={isDeleting}
          >
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white font-meutas"
            disabled={isDeleting}
          >
            {isDeleting ? 'Suppression...' : 'Supprimer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 