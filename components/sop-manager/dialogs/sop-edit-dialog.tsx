import React, { useState, useEffect } from "react"
import { X, Save, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SOP, User } from "../types"

interface SopEditDialogProps {
  sop: SOP
  users: User[]
  onUpdateSOP: (id: string, updatedSOP: Partial<SOP>) => void
  onCancel: () => void
}

export function SopEditDialog({ sop, users, onUpdateSOP, onCancel }: SopEditDialogProps) {
  const [formData, setFormData] = useState({
    title: sop.title,
    description: sop.description,
    instructions: sop.instructions,
    authorId: sop.authorId || "",
    category: sop.category,
    priority: sop.priority,
    tags: sop.tags.join(", "),
  })

  const [steps, setSteps] = useState<{ text: string; image: string }[]>(sop.steps || [])

  // Update form data when sop changes
  useEffect(() => {
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

  const handleSubmit = () => {
    if (!formData.title || !formData.instructions || !formData.authorId) {
      return
    }

    const updatedSOP: Partial<SOP> = {
      ...sop,
      title: formData.title,
      description: formData.description,
      instructions: formData.instructions,
      authorId: formData.authorId,
      category: formData.category || "Général",
      priority: formData.priority,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      steps: steps,
    }

    onUpdateSOP(sop.id, updatedSOP)
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="edit-title">Titre *</Label>
        <Input
          id="edit-title"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="Titre de la procédure"
        />
      </div>

      <div>
        <Label htmlFor="edit-description">Description</Label>
        <Textarea
          id="edit-description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Description courte de la procédure"
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="edit-instructions">Instructions *</Label>
        <Textarea
          id="edit-instructions"
          value={formData.instructions}
          onChange={(e) => setFormData((prev) => ({ ...prev, instructions: e.target.value }))}
          placeholder="Décrivez les étapes de la procédure..."
          rows={6}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-author">Auteur *</Label>
          <Select
            value={formData.authorId || undefined}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, authorId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un auteur" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="edit-category">Catégorie</Label>
          <Input
            id="edit-category"
            value={formData.category}
            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
            placeholder="ex: IT, RH, Production"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-priority">Priorité</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: SOP["priority"]) =>
              setFormData((prev) => ({ ...prev, priority: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Faible</SelectItem>
              <SelectItem value="medium">Moyenne</SelectItem>
              <SelectItem value="high">Élevée</SelectItem>
              <SelectItem value="critical">Critique</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="edit-tags">Tags</Label>
          <Input
            id="edit-tags"
            value={formData.tags}
            onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
            placeholder="tag1, tag2, tag3"
          />
        </div>
      </div>

      <div>
        <Label>Étapes illustrées</Label>
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-2 items-start md:items-end border p-3 rounded-lg bg-gray-50">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder={`Texte de l'étape #${idx + 1}`}
                  value={step.text}
                  onChange={e => handleStepChange(idx, "text", e.target.value)}
                  className="mb-2"
                />
                {step.image && (
                  <img src={step.image} alt="aperçu" className="max-h-32 rounded border mb-2" />
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      handleStepImageUpload(idx, e.target.files[0])
                    }
                  }}
                />
              </div>
              <Button variant="destructive" size="icon" onClick={() => handleRemoveStep(idx)} title="Supprimer l'étape">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={handleAddStep}>
            <Plus className="h-4 w-4 mr-2" /> Ajouter une étape
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={handleSubmit}>
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder
        </Button>
      </div>
    </div>
  )
} 