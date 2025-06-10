import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SOP, User } from "../types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, Plus, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SopEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sop: SOP | null
  users: User[]
  onSubmit: (updatedSop: Partial<SOP>) => void
}

type Priority = "low" | "medium" | "high" | "critical"

type Step = {
  text: string
  image: string
}

export function SopEditDialog({ open, onOpenChange, sop, users, onSubmit }: SopEditDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    category: "",
    priority: "medium" as Priority,
    tags: "",
  })

  const [steps, setSteps] = useState<Step[]>([])

  useEffect(() => {
    if (sop) {
      setFormData({
        title: sop.title || "",
        description: sop.description || "",
        instructions: sop.instructions || "",
        category: sop.category || "",
        priority: sop.priority as Priority,
        tags: Array.isArray(sop.tags) ? sop.tags.join(", ") : "",
      })
      
      // Initialiser les étapes à partir de la SOP existante
      setSteps(sop.steps || [])
    }
  }, [sop])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description) {
      return
    }

    const updatedSop: Partial<SOP> = {
      title: formData.title,
      description: formData.description,
      instructions: formData.instructions,
      category: formData.category,
      priority: formData.priority,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      steps: steps.length > 0 ? steps : undefined,
      // On ne modifie pas l'auteur - il reste celui qui a créé la SOP
    }

    onSubmit(updatedSop)
  }

  const handleAddStep = () => {
    setSteps(prev => [...prev, { text: '', image: '' }])
  }

  const handleStepChange = (index: number, field: 'text' | 'image', value: string) => {
    setSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, [field]: value } : step
    ))
  }

  const handleRemoveStep = (index: number) => {
    setSteps(prev => prev.filter((_, i) => i !== index))
  }

  const handleImageUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        handleStepChange(index, 'image', base64)
      }
      reader.readAsDataURL(file)
    }
  }

  if (!sop) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-meutas font-bold">Modifier la procédure</DialogTitle>
          <DialogDescription className="text-gray-600 font-meutas font-light">
            Modifiez les détails de la procédure opérationnelle standardisée
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Colonne de gauche - Informations générales */}
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-meutas font-medium mb-1">
                  Titre
                </label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border-black"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-meutas font-medium mb-1">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border-black"
                  required
                />
              </div>

              <div>
                <label htmlFor="instructions" className="block text-sm font-meutas font-medium mb-1">
                  Instructions
                </label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full border-black"
                  placeholder="Instructions détaillées de la procédure..."
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-meutas font-medium mb-1">
                  Catégorie
                </label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border-black"
                  required
                />
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-meutas font-medium mb-1">
                  Priorité
                </label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: Priority) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger className="w-full border-black">
                    <SelectValue placeholder="Sélectionner une priorité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low" className="font-meutas">Basse</SelectItem>
                    <SelectItem value="medium" className="font-meutas">Moyenne</SelectItem>
                    <SelectItem value="high" className="font-meutas">Haute</SelectItem>
                    <SelectItem value="critical" className="font-meutas">Critique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-meutas font-medium mb-1">
                  Tags (séparés par des virgules)
                </label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full border-black"
                />
              </div>

              {/* Affichage de l'auteur actuel en lecture seule */}
              <div>
                <label className="block text-sm font-meutas font-medium mb-1">
                  Auteur (non modifiable)
                </label>
                <Input
                  value={sop.author || 'Auteur inconnu'}
                  readOnly
                  disabled
                  className="w-full border-black bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Colonne de droite - Étapes */}
            <div className="space-y-4">
              <div className="border-t pt-4 lg:border-t-0 lg:pt-0">
                <div className="flex items-center justify-between mb-3">
                  <Label className="font-meutas text-lg">Étapes de la procédure</Label>
                  <Button
                    type="button"
                    onClick={handleAddStep}
                    size="sm"
                    className="bg-primary hover:bg-primary-light text-primary-foreground border border-black"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter une étape
                  </Button>
                </div>

                {steps.length > 0 && (
                  <ScrollArea className="max-h-[500px] w-full border rounded-md p-2" style={{ overflowY: 'auto' }}>
                    <div className="space-y-4 pr-4">
                      {steps.map((step, index) => (
                        <div key={index} className="border border-gray-200 rounded p-3 space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="font-meutas">Étape {index + 1}</Label>
                            <Button
                              type="button"
                              onClick={() => handleRemoveStep(index)}
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div>
                            <Label htmlFor={`step-text-${index}`} className="text-sm">Texte de l'étape</Label>
                            <Textarea
                              id={`step-text-${index}`}
                              value={step.text}
                              onChange={(e) => handleStepChange(index, 'text', e.target.value)}
                              placeholder="Décrivez cette étape..."
                              className="border-black focus:ring-primary focus:border-primary"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`step-image-${index}`} className="text-sm">Image (optionnel)</Label>
                            <div className="space-y-2">
                              <Input
                                id={`step-image-${index}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(index, e)}
                                className="border-black focus:ring-primary focus:border-primary"
                              />
                              {step.image && (
                                <div className="relative">
                                  <img 
                                    src={step.image} 
                                    alt={`Étape ${index + 1}`}
                                    className="max-w-full h-32 object-cover rounded border"
                                  />
                                  <Button
                                    type="button"
                                    onClick={() => handleStepChange(index, 'image', '')}
                                    size="sm"
                                    variant="destructive"
                                    className="absolute top-1 right-1"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}

                {steps.length === 0 && (
                  <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-md">
                    <p className="font-meutas">Aucune étape définie</p>
                    <p className="text-sm">Cliquez sur "Ajouter une étape" pour commencer</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-black hover:bg-gray-100"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary-light text-primary-foreground border border-black"
            >
              Enregistrer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 