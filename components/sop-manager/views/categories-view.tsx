import React, { useState } from "react"
import { Download, Edit, User, Tag, Calendar, Trash2, ChevronRight, ChevronDown } from "lucide-react"
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
    <div className="flex bg-white rounded-lg shadow overflow-hidden">
      {/* Sidebar - Categories Navigation */}
      <div className="w-64 bg-gray-50 border-r overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        <div className="p-4">
          <h3 className="font-semibold text-gray-600 uppercase text-sm mb-4">Catégories</h3>
          <div className="space-y-1">
            {categories.map((category) => {
              const sopsInCategory = sops.filter((sop) => sop.category === category)
              const isExpanded = expandedCategories.has(category)
              return (
                <div key={category} className="space-y-1">
                  <Button
                    variant={selectedCategory === category ? "secondary" : "ghost"}
                    className="w-full justify-start font-normal"
                    onClick={() => toggleCategory(category)}
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                    <span className="truncate">{category}</span>
                    <span className="ml-auto text-xs text-gray-500">{sopsInCategory.length}</span>
                  </Button>
                  
                  {/* Liste des procédures de la catégorie */}
                  {isExpanded && (
                    <div className="ml-6 space-y-1">
                      {sopsInCategory.map((sop) => (
                        <Button
                          key={sop.id}
                          variant="ghost"
                          className={`w-full justify-start pl-2 py-1 text-sm ${selectedSop?.id === sop.id ? 'bg-gray-100 text-primary font-medium' : 'text-gray-700'}`}
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
                <p className="text-gray-600 text-lg mb-6">{selectedSop.description}</p>

                {selectedSop.steps && selectedSop.steps.length > 0 && (
                  <div className="mt-8">
                    <h4 className="font-medium text-lg mb-4">Étapes illustrées :</h4>
                    <ol className="space-y-6 list-decimal list-inside">
                      {selectedSop.steps.map((step, idx) => (
                        <li key={idx} className="mb-4">
                          <div className="font-semibold mb-2">{step.text}</div>
                          {step.image && (
                            <img
                              src={step.image}
                              alt={step.text}
                              className="max-w-full h-auto rounded border shadow-sm"
                              style={{ maxHeight: 200 }}
                            />
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 border-t mt-8 pt-4">
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
                          <p className="text-gray-600 text-sm line-clamp-2 mb-2">{sop.description}</p>
                        )}
                        <div className="flex gap-2 items-center">
                          <Badge className={priorityColors[sop.priority.toLowerCase() as SOP["priority"]]}>
                            {priorityLabels[sop.priority.toLowerCase() as SOP["priority"]]}
                          </Badge>
                          <span className="text-xs text-gray-500">
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
            <div className="mb-4 text-gray-400">
              <Tag className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium mb-2">Sélectionnez une catégorie</h3>
            <p className="text-gray-500">
              Choisissez une catégorie dans le menu de gauche pour afficher les SOPs correspondantes
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 