"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText, Eye, Calendar, User, Filter, ChevronRight, ChevronDown, Tag } from "lucide-react";
import Link from "next/link";

interface SOP {
  id: string;
  title: string;
  description: string;
  instructions: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
  updatedAt: string;
  steps: Array<{
    text: string;
    image?: string;
  }>;
  user: {
    name: string;
    email: string;
  };
}

export default function PublicProceduresPage() {
  const router = useRouter();
  const [sops, setSops] = useState<SOP[]>([]);
  const [filteredSops, setFilteredSops] = useState<SOP[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // États pour l'affichage par catégorie
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSop, setSelectedSop] = useState<SOP | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  // État pour la largeur de la sidebar redimensionnable
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const resizerRef = useRef<HTMLDivElement>(null);

  // Obtenir les catégories uniques
  const categories = Array.from(new Set(sops.map((sop) => sop.category))).filter(Boolean);

  useEffect(() => {
    const fetchPublicSops = async () => {
      try {
        const response = await fetch("/api/sops/public");
        if (!response.ok) {
          throw new Error("Failed to fetch public SOPs");
        }
        const data = await response.json();
        setSops(data);
        setFilteredSops(data);
      } catch (error) {
        console.error("Error fetching public SOPs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicSops();
  }, []);

  // Effet pour filtrer les SOPs
  useEffect(() => {
    let filtered = sops;

    if (searchTerm) {
      filtered = filtered.filter(
        (sop) =>
          sop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sop.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sop.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSops(filtered);
  }, [searchTerm, sops]);

  // Gestion du redimensionnement de la sidebar
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.max(200, Math.min(500, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.classList.remove('resizing');
    };

    if (isResizing) {
      document.body.classList.add('resizing');
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('resizing');
    };
  }, [isResizing]);

  // Fonction pour basculer l'expansion d'une catégorie
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
    setSelectedCategory(category);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "default";
      case "LOW":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "Haute";
      case "MEDIUM":
        return "Moyenne";
      case "LOW":
        return "Faible";
      default:
        return priority;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <p className="font-meutas">Chargement des procédures publiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-meutas mb-2">Procédures Publiques</h1>
        <p className="text-muted-foreground font-meutas">
          Consultez nos procédures accessibles au public
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher une procédure..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 font-meutas"
          />
        </div>
      </div>

      {/* Affichage par catégorie */}
      {filteredSops.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium font-meutas mb-2">Aucune procédure trouvée</h3>
          <p className="text-muted-foreground font-meutas">
            {sops.length === 0
              ? "Aucune procédure publique n'est disponible pour le moment."
              : "Essayez de modifier vos critères de recherche."}
          </p>
        </div>
      ) : (
        <div className="flex bg-card rounded-lg shadow overflow-hidden">
          {/* Sidebar - Navigation des catégories */}
          <div 
            className="bg-muted border-r overflow-y-auto" 
            style={{ 
              width: `${sidebarWidth}px`,
              maxHeight: 'calc(100vh - 200px)',
              flexShrink: 0
            }}
          >
            <div className="p-4">
              <h3 className="font-semibold text-muted-foreground uppercase text-sm mb-4 font-meutas">Catégories</h3>
              <div className="space-y-1">
                {categories.map((category) => {
                  const sopsInCategory = filteredSops.filter((sop) => sop.category === category);
                  const isExpanded = expandedCategories.has(category);
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center">
                        <Button
                          variant={selectedCategory === category ? "secondary" : "ghost"}
                          className="flex-1 justify-start font-normal font-meutas"
                          onClick={() => toggleCategory(category)}
                        >
                          {isExpanded ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                          <span className="truncate">{category}</span>
                          <span className="ml-auto text-xs text-muted-foreground">{sopsInCategory.length}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-1 h-8 w-8"
                          onClick={() => {
                            setSelectedCategory(category);
                            setSelectedSop(null);
                          }}
                        >
                          <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </Button>
                      </div>
                      
                      {/* Liste des procédures de la catégorie */}
                      {isExpanded && (
                        <div className="ml-6 space-y-1">
                          {sopsInCategory.map((sop) => (
                            <Button
                              key={sop.id}
                              variant="ghost"
                              className={`w-full justify-start pl-2 py-1 text-sm font-meutas ${selectedSop?.id === sop.id ? 'bg-accent text-primary font-medium' : 'text-muted-foreground'}`}
                              onClick={() => setSelectedSop(sop)}
                            >
                              <span className="truncate">{sop.title}</span>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Resizer */}
          <div
            ref={resizerRef}
            className="w-1 bg-border hover:bg-primary hover:w-1 cursor-col-resize transition-colors"
            onMouseDown={() => setIsResizing(true)}
            style={{
              touchAction: 'none',
              flexShrink: 0
            }}
          />

          {/* Contenu principal */}
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {selectedSop ? (
              /* Vue détaillée d'une SOP sélectionnée */
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <h2 className="text-2xl font-bold font-meutas">{selectedSop.title}</h2>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(selectedSop.priority) as any} className="font-meutas">
                        Priorité {getPriorityLabel(selectedSop.priority)}
                      </Badge>
                    </div>
                  </div>

                  <div className="prose prose-sm max-w-none">
                    <p 
                      className="text-muted-foreground text-lg mb-6 font-meutas"
                      dangerouslySetInnerHTML={{ __html: selectedSop.description }}
                    />

                    {/* Étapes illustrées */}
                    {selectedSop.steps && selectedSop.steps.length > 0 && (
                      <div className="mt-8">
                        <h4 className="font-medium text-lg mb-6 font-meutas">Étapes illustrées :</h4>
                        <div className="space-y-8">
                          {selectedSop.steps.map((step, idx) => (
                            <div key={idx} className="border border-border rounded-lg p-6 bg-muted">
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                                  {idx + 1}
                                </div>
                                <div className="flex-1">
                                  {step.text && (
                                    <div 
                                      className="font-semibold text-lg mb-4 text-foreground font-meutas"
                                      dangerouslySetInnerHTML={{ __html: step.text }}
                                    />
                                  )}
                                  {step.image && (
                                    <div className="mt-4">
                                      <img
                                        src={step.image}
                                        alt={step.text}
                                        className="max-w-full h-auto rounded-lg border shadow-md hover:shadow-lg transition-shadow"
                                        style={{ maxHeight: 400, cursor: 'pointer' }}
                                        onClick={() => window.open(step.image, '_blank')}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contenu complet de la procédure (si pas d'étapes illustrées) */}
                    {(!selectedSop.steps || selectedSop.steps.length === 0) && selectedSop.instructions && (
                      <div className="mt-8">
                        <h4 className="font-medium text-lg mb-6 font-meutas">Contenu de la procédure :</h4>
                        <div 
                          className="prose prose-sm max-w-none font-meutas bg-muted/50 p-6 rounded-lg border"
                          dangerouslySetInnerHTML={{ __html: selectedSop.instructions }}
                        />
                      </div>
                    )}

                    {/* Métadonnées */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-t border-border mt-8 pt-4">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span className="font-meutas">Créé par {selectedSop.user.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        <span className="font-meutas">{selectedSop.category}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span className="font-meutas">
                          Créé le {new Date(selectedSop.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span className="font-meutas">
                          Mis à jour le {new Date(selectedSop.updatedAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>

                    {/* Informations de contact */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 font-meutas">
                        <strong>Contact :</strong> Pour toute question concernant cette procédure, 
                        vous pouvez contacter {selectedSop.user.name} à l'adresse : {selectedSop.user.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedCategory ? (
              /* Vue liste des SOPs d'une catégorie */
              <div className="p-6">
                <h2 className="text-xl font-bold mb-6 font-meutas">Catégorie: {selectedCategory}</h2>
                <div className="grid gap-4">
                  {filteredSops
                    .filter(sop => sop.category === selectedCategory)
                    .map((sop) => (
                      <Card key={sop.id} className="hover:shadow-md transition-shadow">
                        <div className="p-4 flex justify-between items-start">
                          <div>
                            <h3 
                              className="font-semibold text-lg mb-1 cursor-pointer hover:text-primary transition-colors font-meutas"
                              onClick={() => setSelectedSop(sop)}
                            >
                              {sop.title}
                            </h3>
                            {sop.description && (
                              <p 
                                className="text-muted-foreground text-sm line-clamp-2 mb-2 font-meutas"
                                dangerouslySetInnerHTML={{ __html: sop.description }}
                              />
                            )}
                                                         <div className="flex gap-2 items-center">
                               <Badge variant={getPriorityColor(sop.priority) as any} className="font-meutas">
                                 {getPriorityLabel(sop.priority)}
                               </Badge>
                              <span className="text-xs text-muted-foreground font-meutas">
                                {new Date(sop.createdAt).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/public-procedures/${sop.id}`}>
                              <Button variant="outline" size="sm" className="font-meutas">
                                <Eye className="h-4 w-4 mr-2" />
                                Consulter
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            ) : (
              /* Aucune sélection - Instructions */
              <div className="text-center py-10">
                <div className="mb-4 text-muted-foreground">
                  <Tag className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-medium mb-2 text-foreground font-meutas">Sélectionnez une catégorie</h3>
                <p className="text-muted-foreground font-meutas">
                  Choisissez une catégorie dans le menu de gauche pour afficher les procédures correspondantes
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 