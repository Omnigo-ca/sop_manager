import { SOP } from "./types"

export const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export const getUniqueValues = (sops: SOP[], key: keyof SOP): string[] => {
  return [...new Set(sops.map((sop) => sop[key] as string))].filter(Boolean)
}

export const filterSops = (
  sops: SOP[], 
  searchTerm: string, 
  filterCategory: string, 
  filterPriority: string, 
  filterAuthor: string
): SOP[] => {
  return sops.filter((sop) => {
    const matchesSearch =
      sop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sop.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sop.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = filterCategory === "all" || sop.category === filterCategory
    const matchesPriority = filterPriority === "all" || sop.priority.toLowerCase() === filterPriority.toLowerCase()
    const matchesAuthor = filterAuthor === "all" || sop.author === filterAuthor

    return matchesSearch && matchesCategory && matchesPriority && matchesAuthor
  })
}

export const sortSops = (sops: SOP[], sortBy: string): SOP[] => {
  return [...sops].sort((a, b) => {
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
}

export const handleStepImageUpload = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      resolve(base64)
    }
    reader.readAsDataURL(file)
  })
} 