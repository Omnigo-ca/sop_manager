import React, { useState, useEffect } from "react"
import { X, Save, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SOP, User } from "../types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface SopEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sop: SOP | null
  users: User[]
  onSubmit: (updatedSop: Partial<SOP>) => void
}

type Priority = "low" | "medium" | "high" | "critical"

export function SopEditDialog({ open, onOpenChange, sop, users, onSubmit }: SopEditDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    authorId: "",
    category: "",
    priority: "medium" as Priority,
    tags: "",
  })

  const [steps, setSteps] = useState<{ text: string; image: string }[]>(sop?.steps || [])

  useEffect(() => {
    if (sop) {
      setFormData({
        title: sop.title,
        description: sop.description,
        instructions: sop.instructions,
        authorId: sop.authorId || "",
        category: sop.category,
        priority: sop.priority,
        tags: sop.tags.join(", "),
      })
      setSteps(sop.steps || [])
    }
  }, [sop])

  const handleAddStep = () => {
    setSteps((prev) => [...prev, { text: "", image: "" }])
  }

  const handleStepChange = (idx: number, field: "text" | "image", value: string) => {
    setSteps((prev) => prev.map((step, i) => i === idx ? { ...step, [field]: value } : step))
  }

  const handleRemoveStep = (idx: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleStepImageUpload = (idx: number, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      handleStepChange(idx, "image", base64)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      steps: steps,
    })
  }

  if (!sop) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-meutas font-bold">Modifier la procédure</DialogTitle>
          <DialogDescription className="text-gray-600 font-meutas font-light">
            Modifiez les détails de la procédure opérationnelle standardisée
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              <label htmlFor="author" className="block text-sm font-meutas font-medium mb-1">
                Auteur
              </label>
              <Select
                value={formData.authorId}
                onValueChange={(value) => setFormData({ ...formData, authorId: value })}
              >
                <SelectTrigger className="w-full border-black">
                  <SelectValue placeholder="Sélectionner un auteur" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id} className="font-meutas">
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              className="bg-primary hover:bg-primary-light text-black border border-black"
            >
              Enregistrer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 