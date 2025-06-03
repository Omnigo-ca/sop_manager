import React, { useState, useEffect, useRef } from "react"
import { Plus, Search, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useUser } from '@clerk/nextjs'

import { SOP, FormData, ViewMode, User } from "./types"
import { fetchSOPs, fetchUsers, createSOP, updateSOP, deleteSOP, uploadMarkdown } from "./api"
import { getUniqueValues, filterSops, sortSops, handleDownloadPDF, handleStepImageUpload } from "./utils"
import { GridView, ListView, CompactView, TableView, CategoriesView } from "./views"
import { EmptyState } from "./empty-state"
import { StatsOverview } from "./stats-overview"
import { SopCreateDialog, SopEditDialog, SopDetailDialog, SopDeleteDialog } from "./dialogs"

export function SOPManager() {
  const { isSignedIn, isLoaded } = useUser();
  const { toast } = useToast();

  // State
  const [sops, setSops] = useState<SOP[]>([]);
  const [filteredSops, setFilteredSops] = useState<SOP[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterAuthor, setFilterAuthor] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSop, setEditingSop] = useState<SOP | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);
  const [selectedSop, setSelectedSop] = useState<SOP | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sopToDelete, setSopToDelete] = useState<SOP | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    instructions: "",
    authorId: "",
    category: "",
    priority: "medium",
    tags: "",
  });
  
  const [steps, setSteps] = useState<{ text: string; image: string }[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch data
  useEffect(() => {
    fetchSOPs()
      .then(data => {
        setSops(data);
        setFilteredSops(data);
      })
      .catch(error => {
        toast({
          title: 'Erreur',
          description: error.message,
          variant: 'destructive',
        });
      });
  }, [toast]);

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(error => {
        toast({
          title: 'Erreur',
          description: error.message,
          variant: 'destructive',
        });
      });
  }, [toast]);

  // Filter and sort SOPs
  useEffect(() => {
    const filtered = filterSops(sops, searchTerm, filterCategory, filterPriority, filterAuthor);
    const sorted = sortSops(filtered, sortBy);
    setFilteredSops(sorted);
  }, [sops, searchTerm, filterCategory, filterPriority, filterAuthor, sortBy]);

  // Event handlers
  const handleCreateSOP = async (newSOP: Omit<SOP, 'id' | 'createdAt' | 'updatedAt' | 'editedAt'>) => {
    try {
      const sop = await createSOP(newSOP);
      setSops(prev => [sop, ...prev]);
      setIsCreateDialogOpen(false);
      
      toast({
        title: "SOP créé",
        description: "La procédure a été créée avec succès",
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateSOP = async (id: string, updatedSOP: Partial<SOP>) => {
    try {
      const sop = await updateSOP(id, updatedSOP);
      setSops(prev => prev.map(s => s.id === id ? sop : s));
      setIsEditDialogOpen(false);
      setEditingSop(null);
      
      toast({
        title: "SOP modifié",
        description: "La procédure a été modifiée avec succès",
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSOP = async (sopId: string) => {
    try {
      await deleteSOP(sopId);
      setSops(prev => prev.filter(s => s.id !== sopId));
      setIsDeleteDialogOpen(false);
      setSopToDelete(null);
      setSelectedSop(null);
      
      toast({
        title: "SOP supprimé",
        description: "La procédure a été supprimée avec succès",
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEditSOP = (sop: SOP) => {
    setEditingSop(sop);
    setFormData({
      title: sop.title,
      description: sop.description,
      instructions: sop.instructions,
      authorId: sop.authorId || "",
      category: sop.category,
      priority: sop.priority,
      tags: sop.tags.join(", "),
    });
    setSteps(sop.steps || []);
    setIsEditDialogOpen(true);
  };

  const handleDownloadPDFWrapper = async (sop: SOP) => {
    try {
      setDownloadingPdf(sop.id);
      await handleDownloadPDF(sop);
      toast({
        title: "PDF téléchargé",
        description: `Le SOP "${sop.title}" a été téléchargé en PDF avec succès`,
      });
    } catch (error) {
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de générer le PDF. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setDownloadingPdf(null);
    }
  };

  const handleMarkdownUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    
    try {
      const sop = await uploadMarkdown(file);
      setSops(prev => [sop, ...prev]);
      
      toast({
        title: 'SOP importé',
        description: 'Le markdown a été converti et ajouté avec succès',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleViewModeChange = (value: string) => {
    setViewMode(value as ViewMode);
    if (value === "categories") {
      setSelectedCategory(null);
      setSelectedSop(null);
    } else {
      setSelectedCategory(null);
      setSelectedSop(null);
    }
  };

  // Conditional rendering
  if (!isLoaded) return <div>Chargement...</div>;
  if (!isSignedIn) return <div className="flex justify-center items-center h-[60vh]">Veuillez vous connecter pour accéder à l'application.</div>;

  // Extract unique values for filters
  const uniqueCategories = getUniqueValues(sops, "category");
  const uniqueAuthors = getUniqueValues(sops, "author");
  
  // Render component
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
            <Button 
              className="flex items-center gap-2"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Créer un SOP
            </Button>

            {/* Upload Markdown Button */}
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
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {uniqueCategories.sort().map((category) => (
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
                {uniqueAuthors.sort().map((author) => (
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

            <Select value={viewMode} onValueChange={handleViewModeChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Mode d'affichage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grille</SelectItem>
                <SelectItem value="list">Liste détaillée</SelectItem>
                <SelectItem value="compact">Liste compacte</SelectItem>
                <SelectItem value="table">Tableau</SelectItem>
                <SelectItem value="categories">Bibliothèque</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Statistics */}
        <StatsOverview 
          sops={sops} 
          filteredSops={filteredSops} 
          uniqueCategories={uniqueCategories} 
        />

        {/* SOP Display - Empty State */}
        {filteredSops.length === 0 && (
          <EmptyState hasSops={sops.length > 0} />
        )}

        {/* SOP Display - Content based on View Mode */}
        {filteredSops.length > 0 && (
          <>
            {viewMode === "grid" && (
              <GridView 
                sops={filteredSops}
                downloadingPdf={downloadingPdf}
                onViewDetails={setSelectedSop}
                onDownloadPDF={handleDownloadPDFWrapper}
              />
            )}

            {viewMode === "list" && (
              <ListView 
                sops={filteredSops}
                downloadingPdf={downloadingPdf}
                onViewDetails={setSelectedSop}
                onEdit={handleEditSOP}
                onDownloadPDF={handleDownloadPDFWrapper}
              />
            )}

            {viewMode === "compact" && (
              <CompactView 
                sops={filteredSops}
                onViewDetails={setSelectedSop}
                onEdit={handleEditSOP}
              />
            )}

            {viewMode === "table" && (
              <TableView 
                sops={filteredSops}
                onViewDetails={setSelectedSop}
                onEdit={handleEditSOP}
              />
            )}

            {viewMode === "categories" && (
              <CategoriesView 
                sops={filteredSops}
                selectedCategory={selectedCategory}
                selectedSop={selectedSop}
                downloadingPdf={downloadingPdf}
                onCategorySelect={setSelectedCategory}
                onSopSelect={setSelectedSop}
                onEdit={handleEditSOP}
                onDownloadPDF={handleDownloadPDFWrapper}
              />
            )}
          </>
        )}

        {/* Dialogs */}
        <Dialog open={!!selectedSop && viewMode !== "categories"} onOpenChange={(open) => { 
          if (!open) setSelectedSop(null) 
        }}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedSop && (
              <SopDetailDialog 
                sop={selectedSop} 
                onEdit={() => { 
                  handleEditSOP(selectedSop); 
                  setSelectedSop(null);
                }} 
                onDelete={() => {
                  setSopToDelete(selectedSop);
                  setIsDeleteDialogOpen(true);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un nouveau SOP</DialogTitle>
              <DialogDescription>Remplissez les informations pour générer une nouvelle procédure</DialogDescription>
            </DialogHeader>
            
            <SopCreateDialog 
              users={users}
              onCreateSOP={handleCreateSOP}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier le SOP</DialogTitle>
              <DialogDescription>Modifiez les informations de la procédure</DialogDescription>
            </DialogHeader>
            
            {editingSop && (
              <SopEditDialog 
                sop={editingSop}
                users={users}
                onUpdateSOP={handleUpdateSOP}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            {sopToDelete && (
              <SopDeleteDialog 
                sop={sopToDelete}
                onConfirm={handleDeleteSOP}
                onCancel={() => setIsDeleteDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 