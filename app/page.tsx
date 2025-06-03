"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, Search, Calendar, User, Tag, AlertCircle, Edit, Save, X, Download, ChevronUp, ChevronDown, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { downloadSOPAsPDF } from "@/lib/pdfGenerator"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog"
import { useUser } from '@clerk/nextjs'

interface SOP {
  id: string
  title: string
  description: string
  instructions: string
  author: string
  authorId?: string
  category: string
  priority: "low" | "medium" | "high" | "critical"
  tags: string[]
  createdAt: string
  updatedAt: string
  editedAt?: string
  steps?: { text: string; image: string }[]
}

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
}

const priorityLabels = {
  low: "Faible",
  medium: "Moyenne",
  high: "Élevée",
  critical: "Critique",
}

export default function SOPManager() {
  const { isSignedIn, isLoaded } = useUser();

  // TOUS les hooks doivent être ici, avant tout return
  const [sops, setSops] = useState<SOP[]>([])
  const [filteredSops, setFilteredSops] = useState<SOP[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterAuthor, setFilterAuthor] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSop, setEditingSop] = useState<SOP | null>(null)
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null)
  const [selectedSop, setSelectedSop] = useState<SOP | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [sopToDelete, setSopToDelete] = useState<SOP | null>(null)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    authorId: "",
    category: "",
    priority: "medium" as SOP["priority"],
    tags: "",
  })
  const [steps, setSteps] = useState<{ text: string; image: string }[]>([])
  const [users, setUsers] = useState<{ id: string; name: string }[]>([])
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les SOP depuis l'API au montage
  useEffect(() => {
    fetch('/api/sops')
      .then(res => res.json())
      .then(data => {
        setSops(data)
        setFilteredSops(data)
      })
  }, [])

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(setUsers)
  }, [])

  // Filtrer et trier les SOPs
  useEffect(() => {
    const filtered = sops.filter((sop) => {
      const matchesSearch =
        sop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sop.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sop.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = filterCategory === "all" || sop.category === filterCategory
      const matchesPriority = filterPriority === "all" || sop.priority.toLowerCase() === filterPriority.toLowerCase()
      const matchesAuthor = filterAuthor === "all" || sop.author === filterAuthor

      return matchesSearch && matchesCategory && matchesPriority && matchesAuthor
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        case "priority":
          const priorityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 }
          return (priorityOrder[b.priority.toLowerCase()] ?? 0) - (priorityOrder[a.priority.toLowerCase()] ?? 0)
        case "author":
          return a.author.localeCompare(b.author)
        default:
          return 0
      }
    })

    setFilteredSops(filtered)
  }, [sops, searchTerm, filterCategory, filterPriority, filterAuthor, sortBy])

  // CRUD API
  const createSOP = async (newSOP: Omit<SOP, 'id' | 'createdAt' | 'updatedAt' | 'editedAt'>) => {
    try {
      const res = await fetch('/api/sops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSOP,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      })
      if (!res.ok) {
        const errorText = await res.text()
        toast({
          title: 'Erreur',
          description: errorText || 'Erreur lors de la création de la SOP',
          variant: 'destructive',
        })
        throw new Error(errorText || 'Erreur lors de la création de la SOP')
      }
      const sop = await res.json()
      setSops(prev => [sop, ...prev])
    } catch (error: any) {
      // toast déjà affiché ci-dessus
    }
  }

  const updateSOP = async (id: string, updated: Partial<SOP>) => {
    try {
      const { id: _id, author, createdAt, updatedAt, ...rest } = updated
      const res = await fetch(`/api/sops/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...rest, updatedAt: new Date().toISOString() })
      })
      if (!res.ok) {
        const errorText = await res.text()
        toast({
          title: 'Erreur',
          description: errorText || 'Erreur lors de la modification de la SOP',
          variant: 'destructive',
        })
        throw new Error(errorText || 'Erreur lors de la modification de la SOP')
      }
      const sop = await res.json()
      setSops(prev => prev.map(s => s.id === id ? sop : s))
    } catch (error: any) {
      // toast déjà affiché ci-dessus
    }
  }

  const deleteSOP = async (id: string) => {
    try {
      const res = await fetch(`/api/sops/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const errorText = await res.text()
        toast({
          title: 'Erreur',
          description: errorText || 'Erreur lors de la suppression de la SOP',
          variant: 'destructive',
        })
        throw new Error(errorText || 'Erreur lors de la suppression de la SOP')
      }
      setSops(prev => prev.filter(s => s.id !== id))
    } catch (error: any) {
      // toast déjà affiché ci-dessus
    }
  }

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

  const handleCreateSOP = () => {
    if (!formData.title || !formData.instructions || !formData.authorId) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }

    const newSOP: SOP = {
      id: Date.now().toString(),
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: steps.length > 0 ? steps : undefined,
    }

    createSOP(newSOP)
    setFormData({
      title: "",
      description: "",
      instructions: "",
      authorId: "",
      category: "",
      priority: "medium",
      tags: "",
    })
    setSteps([])
    setIsCreateDialogOpen(false)

    toast({
      title: "SOP créé",
      description: "La procédure a été créée avec succès",
    })
  }

  const handleEditSOP = (sop: SOP) => {
    setEditingSop(sop)
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
    setIsEditDialogOpen(true)
  }

  const handleUpdateSOP = () => {
    if (!formData.title || !formData.instructions || !formData.authorId || !editingSop) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }

    const updatedSOP: SOP = {
      ...editingSop,
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
      updatedAt: new Date().toISOString(),
      steps: steps,
    }

    updateSOP(editingSop.id, updatedSOP)
    setFormData({
      title: "",
      description: "",
      instructions: "",
      authorId: "",
      category: "",
      priority: "medium",
      tags: "",
    })
    setSteps([])
    setEditingSop(null)
    setIsEditDialogOpen(false)

    toast({
      title: "SOP modifié",
      description: "La procédure a été modifiée avec succès",
    })
  }

  const handleDownloadPDF = async (sop: SOP) => {
    try {
      setDownloadingPdf(sop.id)
      await downloadSOPAsPDF(sop)
      toast({
        title: "PDF téléchargé",
        description: `Le SOP "${sop.title}" a été téléchargé en PDF avec succès`,
      })
    } catch (error) {
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de générer le PDF. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setDownloadingPdf(null)
    }
  }

  const getUniqueValues = (key: keyof SOP) => {
    return [...new Set(sops.map((sop) => sop[key] as string))].filter(Boolean)
  }

  const handleDeleteSOP = (sopId: string) => {
    deleteSOP(sopId)
    setFilteredSops((prev) => prev.filter((sop) => sop.id !== sopId))
    setIsDeleteDialogOpen(false)
    setSopToDelete(null)
    setSelectedSop(null)
    toast({
      title: "SOP supprimé",
      description: "La procédure a été supprimée avec succès",
      variant: "default",
    })
  }

  // Handler upload markdown
  const handleMarkdownUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/sops/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        toast({
          title: 'Erreur',
          description: data.error || 'Erreur lors de l\'import du markdown',
          variant: 'destructive',
        });
        return;
      }
      const sop = await res.json();
      setSops(prev => [sop, ...prev]);
      toast({
        title: 'SOP importé',
        description: 'Le markdown a été converti et ajouté avec succès',
      });
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'import du markdown',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Les return conditionnels après les hooks
  if (!isLoaded) return <div>Chargement...</div>;
  if (!isSignedIn) return <div className="flex justify-center items-center h-[60vh]">Veuillez vous connecter pour accéder à l'application.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestionnaire de SOP</h1>
          <p className="text-gray-600">Créez, organisez et centralisez vos procédures opérationnelles standardisées</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher des SOP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Create Button */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Créer un SOP
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Créer un nouveau SOP</DialogTitle>
                  <DialogDescription>Remplissez les informations pour générer une nouvelle procédure</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titre *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Titre de la procédure"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Description courte de la procédure"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="instructions">Instructions *</Label>
                    <Textarea
                      id="instructions"
                      value={formData.instructions}
                      onChange={(e) => setFormData((prev) => ({ ...prev, instructions: e.target.value }))}
                      placeholder="Décrivez les étapes de la procédure..."
                      rows={6}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="author">Auteur *</Label>
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
                      <Label htmlFor="category">Catégorie</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                        placeholder="ex: IT, RH, Production"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority">Priorité</Label>
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
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
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
                        + Ajouter une étape
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleCreateSOP}>Créer le SOP</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Upload Markdown Button */}
            <>
              <Button
                type="button"
                variant="secondary"
                className="flex items-center gap-2"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                {uploading ? 'Import...' : 'Importer un markdown'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".md, .markdown, text/markdown"
                className="hidden"
                onChange={handleMarkdownUpload}
                disabled={uploading}
              />
            </>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {getUniqueValues("category").map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Toutes les priorités" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les priorités</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
                <SelectItem value="high">Élevée</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="low">Faible</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterAuthor} onValueChange={setFilterAuthor}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tous les auteurs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les auteurs</SelectItem>
                {getUniqueValues("author").map((author) => (
                  <SelectItem key={author} value={author}>
                    {author}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date de création</SelectItem>
                <SelectItem value="title">Titre</SelectItem>
                <SelectItem value="priority">Priorité</SelectItem>
                <SelectItem value="author">Auteur</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier le SOP</DialogTitle>
              <DialogDescription>Modifiez les informations de la procédure</DialogDescription>
            </DialogHeader>

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

              <div className="space-y-4">
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
                    + Ajouter une étape
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleUpdateSOP}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{sops.length}</div>
              <div className="text-sm text-gray-600">Total SOP</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{filteredSops.length}</div>
              <div className="text-sm text-gray-600">Affichés</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{getUniqueValues("category").length}</div>
              <div className="text-sm text-gray-600">Catégories</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{sops.filter((s) => s.priority === "critical").length}</div>
              <div className="text-sm text-gray-600">Critiques</div>
            </CardContent>
          </Card>
        </div>

        {/* SOP List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSops.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-500">
                  {sops.length === 0 ? (
                    <>
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium mb-2">Aucun SOP créé</h3>
                      <p>Commencez par créer votre première procédure</p>
                    </>
                  ) : (
                    <>
                      <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium mb-2">Aucun résultat</h3>
                      <p>Essayez de modifier vos critères de recherche</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredSops.map((sop) => (
              <Card key={sop.id} className="hover:shadow-md transition-shadow flex flex-col justify-between">
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg line-clamp-2">{sop.title}</CardTitle>
                        {sop.editedAt && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            Modifié
                          </Badge>
                        )}
                      </div>
                      {sop.description && (
                        <CardDescription className="text-sm line-clamp-3 mb-2">{sop.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(sop)}
                        disabled={downloadingPdf === sop.id}
                        className="flex items-center gap-1"
                      >
                        {downloadingPdf === sop.id ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                            Génération...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            PDF
                          </>
                        )}
                      </Button>
                      <Badge className={priorityColors[sop.priority.toLowerCase() as SOP["priority"]]}>{priorityLabels[sop.priority.toLowerCase() as SOP["priority"]]}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <div className="flex justify-end p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSop(sop)}
                    className="flex items-center gap-1"
                  >
                    <span>Voir plus</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Dialog de détail SOP */}
        <Dialog open={!!selectedSop} onOpenChange={(open) => { if (!open) setSelectedSop(null) }}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedSop && (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle>{selectedSop.title}</DialogTitle>
                  <DialogDescription>{selectedSop.description}</DialogDescription>
                </DialogHeader>
                {/* Instructions */}
                <div>
                  <h4 className="font-medium mb-2">Instructions:</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">{selectedSop.instructions}</pre>
                  </div>
                </div>
                {/* Étapes illustrées */}
                {selectedSop.steps && selectedSop.steps.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 mt-4">Étapes illustrées :</h4>
                    <ol className="space-y-6 list-decimal list-inside">
                      {selectedSop.steps.map((step, idx) => (
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
                    {selectedSop.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    {selectedSop.category}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Créé le {new Date(selectedSop.createdAt).toLocaleDateString("fr-FR")}
                  </div>
                  {selectedSop.editedAt && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Edit className="h-4 w-4" />
                      Modifié le {new Date(selectedSop.editedAt).toLocaleDateString("fr-FR")}
                    </div>
                  )}
                </div>
                {/* Tags */}
                {selectedSop.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedSop.tags.map((tag) => (
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
                    onClick={() => { handleEditSOP(selectedSop); setSelectedSop(null) }}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" /> Modifier
                  </Button>
                  <AlertDialog open={isDeleteDialogOpen && sopToDelete?.id === selectedSop.id} onOpenChange={(open) => {
                    setIsDeleteDialogOpen(open)
                    if (!open) setSopToDelete(null)
                  }}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => {
                          setSopToDelete(selectedSop)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <X className="h-4 w-4" /> Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer la procédure ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer la SOP "{selectedSop.title}" ? Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteSOP(selectedSop.id)} autoFocus>Supprimer</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
