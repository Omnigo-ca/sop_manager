import React from "react"
import { Download, Edit, User, Tag, Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SOP, priorityColors, priorityLabels } from "../types"

interface CategoriesViewProps {
  sops: SOP[]
  selectedCategory: string | null
  selectedSop: SOP | null
  downloadingPdf: string | null
  onCategorySelect: (category: string) => void
  onSopSelect: (sop: SOP) => void
  onEdit: (sop: SOP) => void
  onDownloadPDF: (sop: SOP) => Promise<void>
}

export function CategoriesView({
  sops,
  selectedCategory,
  selectedSop,
  downloadingPdf,
  onCategorySelect,
  onSopSelect,
  onEdit,
  onDownloadPDF
}: CategoriesViewProps) {
  // Get unique categories
  const categories = [...new Set(sops.map(sop => sop.category))].sort()

  return (
    <div className="flex bg-white rounded-lg shadow overflow-hidden">
      {/* Sidebar - Categories Navigation */}
      <div className="w-64 bg-gray-50 border-r overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        <div className="p-4">
          <h3 className="font-semibold text-gray-600 uppercase text-sm mb-4">Catégories</h3>
          <div className="space-y-1">
            {categories.map((category) => {
              const sopsInCategory = sops.filter((sop) => sop.category === category)
              return (
                <div key={category} className="mb-4">
                  <button
                    onClick={() => {
                      onCategorySelect(category)
                      // Déselectionner la SOP actuelle pour afficher toutes les SOPs de la catégorie
                      if (selectedSop && selectedSop.category === category) {
                        onSopSelect(null as any) // Utilise any pour éviter des erreurs TypeScript
                      }
                    }}
                    className={`text-left font-medium text-base w-full px-2 py-1.5 hover:bg-gray-200 rounded ${
                      selectedCategory === category && !selectedSop ? 'bg-gray-200 text-primary' : 'text-gray-800'
                    }`}
                  >
                    {category} ({sopsInCategory.length})
                  </button>

                  <div className="ml-3 border-l-2 pl-2 mt-1 border-gray-300 space-y-1">
                    {sopsInCategory.map((sop) => (
                      <button
                        key={sop.id}
                        onClick={() => onSopSelect(sop)}
                        className={`text-left text-sm w-full px-2 py-1 hover:bg-gray-200 rounded truncate ${
                          selectedSop?.id === sop.id ? 'bg-gray-200 text-primary font-medium' : 'text-gray-700'
                        }`}
                      >
                        {sop.title}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        {selectedSop ? (
          /* Single SOP Detail View */
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedSop.title}</h2>
                {selectedSop.description && (
                  <p className="text-gray-600 mb-4">{selectedSop.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={priorityColors[selectedSop.priority.toLowerCase() as SOP["priority"]]}>
                    {priorityLabels[selectedSop.priority.toLowerCase() as SOP["priority"]]}
                  </Badge>
                  {selectedSop.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownloadPDF(selectedSop)}
                  disabled={downloadingPdf === selectedSop.id}
                  className="flex items-center gap-1"
                >
                  {downloadingPdf === selectedSop.id ? (
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(selectedSop)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" /> Modifier
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <h4 className="font-medium text-lg mb-2">Instructions:</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{selectedSop.instructions}</pre>
              </div>
            </div>

            {/* Étapes illustrées */}
            {selectedSop.steps && selectedSop.steps.length > 0 && (
              <div>
                <h4 className="font-medium text-lg mb-2">Étapes illustrées :</h4>
                <ol className="space-y-6 list-decimal list-inside">
                  {selectedSop.steps.map((step, idx) => (
                    <li key={idx} className="mb-2">
                      <div className="font-semibold mb-1">{step.text}</div>
                      {step.image && step.image.trim() !== "" && (
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
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 border-t pt-4">
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
        ) : selectedCategory ? (
          /* Category SOPs List View */
          <div>
            <h2 className="text-xl font-bold mb-6">Catégorie: {selectedCategory}</h2>
            <div className="grid gap-4">
              {sops
                .filter(sop => sop.category === selectedCategory)
                .map((sop) => (
                  <Card key={sop.id} className="hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{sop.title}</h3>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSopSelect(sop)}
                        >
                          Voir le détail
                        </Button>
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