import React, { useState, useRef, useEffect } from "react"
import { Download, Edit, User, Tag, Calendar, Trash2, ChevronRight, ChevronDown, Eye } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SOP, priorityColors, priorityLabels } from "../types"

interface CategoriesViewProps {
  sops: SOP[]
  selectedCategory: string | null
  selectedSop: SOP | null
  onSelectCategory: (category: string | null) => void
  onSelectSop: (sop: SOP | null) => void
  onEdit?: (sop: SOP) => void
  onDelete?: (sop: SOP) => void
}

export function CategoriesView({
  sops,
  selectedCategory,
  selectedSop,
  onSelectCategory,
  onSelectSop,
  onEdit,
  onDelete,
}: CategoriesViewProps) {
  // Get unique categories
  const categories = [...new Set(sops.map(sop => sop.category))].sort()
  
  // State for expanded categories
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // State and refs for resizing
  const [sidebarWidth, setSidebarWidth] = useState(300) 
  const [isResizing, setIsResizing] = useState(false)
  const resizerRef = useRef<HTMLDivElement>(null)

  // Handle mouse events for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      // Calculate new width (minimum 200px, maximum 500px)
      const newWidth = Math.max(200, Math.min(500, e.clientX))
      setSidebarWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.classList.remove('resizing')
    }

    if (isResizing) {
      document.body.classList.add('resizing')
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.classList.remove('resizing')
    }
  }, [isResizing])

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
    onSelectCategory(category)
  }

  return (
    <div className="flex bg-card rounded-lg shadow overflow-hidden">
      {/* Sidebar - Categories Navigation */}
      <div 
        className="bg-muted border-r overflow-y-auto" 
        style={{ 
          width: `${sidebarWidth}px`,
          maxHeight: 'calc(100vh - 300px)',
          flexShrink: 0
        }}
      >
        <div className="p-4">
          <h3 className="font-semibold text-muted-foreground uppercase text-sm mb-4">Catégories</h3>
          <div className="space-y-1">
            {categories.map((category) => {
              const sopsInCategory = sops.filter((sop) => sop.category === category)
              const isExpanded = expandedCategories.has(category)
              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center">
                    <Button
                      variant={selectedCategory === category ? "secondary" : "ghost"}
                      className="flex-1 justify-start font-normal"
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
                        onSelectCategory(category)
                        onSelectSop(null)
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
                          className={`w-full justify-start pl-2 py-1 text-sm ${selectedSop?.id === sop.id ? 'bg-accent text-primary font-medium' : 'text-muted-foreground'}`}
                          onClick={() => onSelectSop(sop)}
                        >
                          <span className="truncate">{sop.title}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )
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

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        {selectedSop ? (
          /* Selected SOP Detail View */
          <div className="p-6">
            <div className="mb-6">
              <div className="flex justify-between items-start gap-4 mb-4">
                <h2 className="text-2xl font-bold">{selectedSop.title}</h2>
                <div className="flex gap-2">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(selectedSop)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-4 w-4" /> Modifier
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(selectedSop)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" /> Supprimer
                    </Button>
                  )}
                </div>
              </div>

              <div className="prose prose-sm max-w-none">
                <p 
                  className="text-muted-foreground text-lg mb-6"
                  dangerouslySetInnerHTML={{ __html: selectedSop.description }}
                />

                {selectedSop.steps && selectedSop.steps.length > 0 && (
                  <div className="mt-8">
                    <h4 className="font-medium text-lg mb-6">Étapes illustrées :</h4>
                    <div className="space-y-8">
                      {selectedSop.steps.map((step, idx) => (
                        <div key={idx} className="border border-border rounded-lg p-6 bg-muted">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <div 
                                className="font-semibold text-lg mb-4 text-foreground"
                                dangerouslySetInnerHTML={{ __html: step.text }}
                              />
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

                {/* Metadata */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-t border-border mt-8 pt-4">
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
                    <div className="flex items-center gap-1 text-primary border-b border-border">
                      <Edit className="h-4 w-4" />
                      Modifié le {new Date(selectedSop.editedAt).toLocaleDateString("fr-FR")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : selectedCategory ? (
          /* Category SOPs List View */
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6">Catégorie: {selectedCategory}</h2>
            <div className="grid gap-4">
              {sops
                .filter(sop => sop.category === selectedCategory)
                .map((sop) => (
                  <Card key={sop.id} className="hover:shadow-md transition-shadow">
                    <div className="p-4 flex justify-between items-start">
                      <div>
                        <h3 
                          className="font-semibold text-lg mb-1 cursor-pointer hover:text-primary transition-colors"
                          onClick={() => onSelectSop(sop)}
                        >
                          {sop.title}
                        </h3>
                        {sop.description && (
                          <p 
                            className="text-muted-foreground text-sm line-clamp-2 mb-2"
                            dangerouslySetInnerHTML={{ __html: sop.description }}
                          />
                        )}
                        <div className="flex gap-2 items-center">
                          <Badge className={priorityColors[sop.priority.toLowerCase() as SOP["priority"]]}>
                            {priorityLabels[sop.priority.toLowerCase() as SOP["priority"]]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(sop.createdAt).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {onEdit && (
                          <Button variant="ghost" size="icon" onClick={() => onEdit(sop)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button variant="ghost" size="icon" onClick={() => onDelete(sop)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        ) : (
          /* No selection - Instructions */
          <div className="text-center py-10">
            <div className="mb-4 text-muted-foreground">
              <Tag className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-foreground">Sélectionnez une catégorie</h3>
            <p className="text-muted-foreground">
              Choisissez une catégorie dans le menu de gauche pour afficher les SOPs correspondantes
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 