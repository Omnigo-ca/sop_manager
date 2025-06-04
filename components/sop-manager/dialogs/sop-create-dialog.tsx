import React, { useState } from "react"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SOP, User } from "../types"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { parseMarkdownToSop } from "@/lib/parseSopMarkdown"

interface SopCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (newSOP: Omit<SOP, 'id' | 'createdAt' | 'updatedAt' | 'editedAt'>) => void
  users: User[]
}

export function SopCreateDialog({ open, onOpenChange, onSubmit, users }: SopCreateDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    authorId: "",
    category: "",
    priority: "medium" as SOP["priority"],
    tags: "",
  })

  const [markdown, setMarkdown] = useState("")
  const [isMarkdownMode, setIsMarkdownMode] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isMarkdownMode) {
      if (!markdown) return
      
      const parsedSop = parseMarkdownToSop(markdown)
      const newSOP: Omit<SOP, 'id' | 'createdAt' | 'updatedAt' | 'editedAt'> = {
        ...parsedSop,
        authorId: formData.authorId || users[0]?.id, // Utiliser le premier utilisateur par défaut
      }
      onSubmit(newSOP)
      return
    }

    if (!formData.title || !formData.instructions || !formData.authorId) {
      return
    }

    const newSOP: Omit<SOP, 'id' | 'createdAt' | 'updatedAt' | 'editedAt'> = {
      title: formData.title,
      description: formData.description,
      instructions: formData.instructions,
      author: '',
      authorId: formData.authorId,
      category: formData.category || "Général",
      priority: formData.priority,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
    }

    onSubmit(newSOP)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white border-black">
        <DialogHeader>
          <DialogTitle className="text-2xl font-meutas">Nouvelle procédure</DialogTitle>
          <DialogDescription className="text-gray-600">
            Créez une nouvelle procédure opérationnelle standardisée
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsMarkdownMode(!isMarkdownMode)}
            className="w-full border-black hover:bg-gray-100"
          >
            {isMarkdownMode ? "Mode formulaire" : "Mode Markdown"}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isMarkdownMode ? (
            <>
              <div>
                <Label htmlFor="markdown" className="font-meutas">Contenu Markdown</Label>
                <Textarea
                  id="markdown"
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  className="min-h-[400px] border-black focus:ring-primary focus:border-primary font-mono"
                  placeholder="Collez votre contenu markdown ici..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="author" className="font-meutas">Auteur</Label>
                <Select
                  value={formData.authorId}
                  onValueChange={(value) => setFormData({ ...formData, authorId: value })}
                >
                  <SelectTrigger className="border-black">
                    <SelectValue placeholder="Sélectionner un auteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="font-meutas">Titre</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="border-black focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="font-meutas">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="border-black focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <Label htmlFor="category" className="font-meutas">Catégorie</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="border-black focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              <div>
                <Label htmlFor="priority" className="font-meutas">Priorité</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger className="border-black">
                    <SelectValue placeholder="Sélectionner une priorité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="low">Basse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="author" className="font-meutas">Auteur</Label>
                <Select
                  value={formData.authorId}
                  onValueChange={(value) => setFormData({ ...formData, authorId: value })}
                >
                  <SelectTrigger className="border-black">
                    <SelectValue placeholder="Sélectionner un auteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tags" className="font-meutas">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Séparez les tags par des virgules"
                  className="border-black focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <Label htmlFor="instructions" className="font-meutas">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="min-h-[200px] border-black focus:ring-primary focus:border-primary"
                  required
                />
              </div>
            </div>
          )}

          <DialogFooter>
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
              className="bg-primary hover:bg-primary-light text-white font-meutas"
            >
              Créer la procédure
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 