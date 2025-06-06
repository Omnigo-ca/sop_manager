import React, { useState, useEffect } from "react"
import { X, Plus, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { SOP, User } from "../types"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { parseMarkdownToSop } from "@/lib/parseSopMarkdown"
import { fetchAccessGroups, AccessGroup } from "../api"

interface SopCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (newSOP: Omit<SOP, 'id' | 'createdAt' | 'updatedAt' | 'editedAt'>, accessGroupIds?: string[]) => void
}

type CreateFormData = {
  title: string
  description: string
  instructions: string
  author: string
  authorId: string
  category: string
  priority: SOP["priority"]
  tags: string
}

type Step = {
  text: string
  image: string
}

export function SopCreateDialog({ open, onOpenChange, onSubmit }: SopCreateDialogProps) {
  const [formData, setFormData] = useState<CreateFormData>({
    title: '',
    description: '',
    instructions: '',
    author: '',
    authorId: '',
    category: '',
    priority: 'medium',
    tags: '',
  })

  const [markdown, setMarkdown] = useState("")
  const [isMarkdownMode, setIsMarkdownMode] = useState(false)
  const [accessGroups, setAccessGroups] = useState<AccessGroup[]>([])
  const [selectedAccessGroups, setSelectedAccessGroups] = useState<string[]>([])
  const [steps, setSteps] = useState<Step[]>([])

  // Charger les groupes d'accès
  useEffect(() => {
    if (open) {
      fetchAccessGroups()
        .then(setAccessGroups)
        .catch(error => {
          console.error('Erreur lors du chargement des groupes d\'accès:', error)
        })
    } else {
      // Réinitialiser le formulaire quand le dialog se ferme
      setFormData({
        title: '',
        description: '',
        instructions: '',
        author: '',
        authorId: '',
        category: '',
        priority: 'medium',
        tags: '',
      })
      setMarkdown('')
      setSelectedAccessGroups([])
      setSteps([])
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isMarkdownMode) {
      if (!markdown) return
      
      const parsedSop = parseMarkdownToSop(markdown)
      const newSOP: Omit<SOP, 'id' | 'createdAt' | 'updatedAt' | 'editedAt'> = {
        title: parsedSop.title || '',
        description: parsedSop.description || '',
        instructions: parsedSop.instructions || '',
        category: parsedSop.category || '',
        priority: parsedSop.priority || 'medium',
        tags: parsedSop.tags || [],
        steps: parsedSop.steps?.map(step => ({ 
          text: step.text, 
          image: step.image || '' 
        })),
        // L'autorId sera automatiquement défini côté serveur avec l'utilisateur connecté
        authorId: '',
        author: '',
      }
      onSubmit(newSOP, selectedAccessGroups.length > 0 ? selectedAccessGroups : undefined)
      return
    }

    if (!formData.title || !formData.description) {
      return
    }

    const newSOP: Omit<SOP, 'id' | 'createdAt' | 'updatedAt' | 'editedAt'> = {
      title: formData.title,
      description: formData.description,
      instructions: formData.instructions,
      category: formData.category,
      priority: formData.priority,
      tags: formData.tags
        .split(",")
        .map((tag: string) => tag.trim())
        .filter(Boolean),
      steps: steps.length > 0 ? steps : undefined,
      // L'autorId sera automatiquement défini côté serveur avec l'utilisateur connecté
      authorId: '',
      author: '',
    }

    onSubmit(newSOP, selectedAccessGroups.length > 0 ? selectedAccessGroups : undefined)
  }

  const handleAccessGroupToggle = (groupId: string, checked: boolean) => {
    if (checked) {
      setSelectedAccessGroups(prev => [...prev, groupId])
    } else {
      setSelectedAccessGroups(prev => prev.filter(id => id !== groupId))
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white border-black">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Colonne de gauche - Formulaire */}
            <div className="space-y-4">
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
                    <Label htmlFor="instructions" className="font-meutas">Instructions</Label>
                    <Textarea
                      id="instructions"
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      className="border-black focus:ring-primary focus:border-primary"
                      placeholder="Instructions détaillées de la procédure..."
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
                      onValueChange={(value: SOP["priority"]) => setFormData({ ...formData, priority: value })}
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
                    <Label htmlFor="tags" className="font-meutas">Tags</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="Séparez les tags par des virgules"
                      className="border-black focus:ring-primary focus:border-primary"
                    />
                  </div>

                  {/* Section des étapes */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="font-meutas text-lg">Étapes de la procédure</Label>
                      <Button
                        type="button"
                        onClick={handleAddStep}
                        size="sm"
                        className="bg-primary hover:bg-primary-light text-black border border-black"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter une étape
                      </Button>
                    </div>

                    {steps.length > 0 && (
                      <ScrollArea className="max-h-[300px] w-full">
                        <div className="space-y-4">
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
                  </div>
                </div>
              )}
            </div>

            {/* Colonne de droite - Groupes d'accès */}
            <div className="space-y-4">
              <div>
                <Label className="font-meutas text-lg">Groupes d'accès</Label>
                <p className="text-sm text-gray-600 mb-3">
                  Sélectionnez les groupes qui auront accès à cette procédure. 
                  Si aucun groupe n'est sélectionné, l'assignation sera automatique basée sur la catégorie.
                </p>
                
                <ScrollArea className="h-[400px] w-full border border-black rounded-md p-3">
                  <div className="space-y-2">
                    {accessGroups.map((group) => (
                      <div key={group.id} className="flex items-center space-x-2 p-3 rounded border hover:bg-gray-50">
                        <Checkbox
                          id={`group-${group.id}`}
                          checked={selectedAccessGroups.includes(group.id)}
                          onCheckedChange={(checked) => handleAccessGroupToggle(group.id, checked as boolean)}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm font-meutas">
                            {group.name}
                          </div>
                          {group.description && (
                            <div className="text-xs text-muted-foreground">
                              {group.description}
                            </div>
                          )}
                          {group.type && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {group.type}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {selectedAccessGroups.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      {selectedAccessGroups.length} groupe(s) sélectionné(s)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
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
              className="bg-primary hover:bg-primary-light text-black font-meutas border border-black"
            >
              Créer la procédure
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 