export interface SOP {
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

export const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
}

export const priorityLabels = {
  low: "Faible",
  medium: "Moyenne",
  high: "Élevée",
  critical: "Critique",
}

export type FormData = {
  title: string
  description: string
  instructions: string
  authorId: string
  category: string
  priority: SOP["priority"]
  tags: string
}

export type User = {
  id: string
  name: string
}

export type ViewMode = "grid" | "list" | "compact" | "table" | "categories" 