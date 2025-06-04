import React, { useState, useEffect, useRef } from "react"
import { Plus, Search } from "lucide-react"
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
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog"

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
  const [viewMode, setViewMode] = useState<ViewMode>("categories");
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSop, setEditingSop] = useState<SOP | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);
  const [selectedSop, setSelectedSop] = useState<SOP | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sopToDelete, setSopToDelete] = useState<SOP | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

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
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center mb-8">
        <div>
          <h1 className="text-3xl font-meutas font-bold text-black mb-2">Gestionnaire de procédures</h1>
          <p className="text-gray-600 font-meutas font-light">Gérez vos procédures opérationnelles standardisées</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="mb-8">
        <StatsOverview sops={sops} />
      </div>

      {/* Actions and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="flex gap-2">
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-primary hover:bg-primary-light text-white font-meutas font-semibold"
          >
            <Plus className="mr-2 h-4 w-4" /> Nouvelle procédure
          </Button>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-black focus:ring-primary focus:border-primary font-meutas font-normal"
          />
          <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
            <SelectTrigger className="w-[180px] border-black font-meutas font-normal">
              <SelectValue placeholder="Vue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid" className="font-meutas">Grille</SelectItem>
              <SelectItem value="list" className="font-meutas">Liste</SelectItem>
              <SelectItem value="compact" className="font-meutas">Compact</SelectItem>
              <SelectItem value="table" className="font-meutas">Tableau</SelectItem>
              <SelectItem value="categories" className="font-meutas">Catégories</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px] border-black font-meutas font-normal">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-meutas">Toutes les catégories</SelectItem>
              {getUniqueValues(sops, 'category').map((category) => (
                <SelectItem key={category} value={category} className="font-meutas">{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[180px] border-black font-meutas font-normal">
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-meutas">Toutes les priorités</SelectItem>
              <SelectItem value="high" className="font-meutas">Haute</SelectItem>
              <SelectItem value="medium" className="font-meutas">Moyenne</SelectItem>
              <SelectItem value="low" className="font-meutas">Basse</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-black p-4">
        {filteredSops.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {viewMode === "grid" && (
              <GridView
                sops={filteredSops}
                onEdit={handleEditSOP}
                onDelete={(sop) => {
                  setSopToDelete(sop);
                  setIsDeleteDialogOpen(true);
                }}
                onDownloadPDF={handleDownloadPDFWrapper}
                downloadingPdf={downloadingPdf}
                onSelect={setSelectedSop}
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
                onDelete={(sop) => {
                  setSopToDelete(sop);
                  setIsDeleteDialogOpen(true);
                }}
                onDownloadPDF={handleDownloadPDFWrapper}
              />
            )}
          </>
        )}
      </div>

      {/* Dialogs */}
      <SopCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateSOP}
        users={users}
      />
      
      <SopEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        sop={editingSop}
        users={users}
        onSubmit={(updatedSop) => editingSop && handleUpdateSOP(editingSop.id, updatedSop)}
      />
      
      <SopDetailDialog
        sop={selectedSop}
        onClose={() => setSelectedSop(null)}
      />
      
      <SopDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        sop={sopToDelete}
        onConfirm={() => sopToDelete && handleDeleteSOP(sopToDelete.id)}
      />
    </div>
  );
} 