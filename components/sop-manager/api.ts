import { SOP } from "./types"

export const fetchSOPs = async (): Promise<SOP[]> => {
  const res = await fetch('/api/sops')
  if (!res.ok) {
    throw new Error('Erreur lors du chargement des SOPs')
  }
  return res.json()
}

export const fetchUsers = async (): Promise<{ id: string; name: string }[]> => {
  const res = await fetch('/api/users')
  if (!res.ok) {
    throw new Error('Erreur lors du chargement des utilisateurs')
  }
  return res.json()
}

export const createSOP = async (newSOP: Omit<SOP, 'id' | 'createdAt' | 'updatedAt' | 'editedAt'>): Promise<SOP> => {
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
    throw new Error(errorText || 'Erreur lors de la création de la SOP')
  }
  
  return res.json()
}

export const updateSOP = async (id: string, updated: Partial<SOP>): Promise<SOP> => {
  const { id: _id, author, createdAt, updatedAt, ...rest } = updated
  const res = await fetch(`/api/sops/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...rest, updatedAt: new Date().toISOString() })
  })
  
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || 'Erreur lors de la modification de la SOP')
  }
  
  return res.json()
}

export const deleteSOP = async (id: string): Promise<void> => {
  const res = await fetch(`/api/sops/${id}`, { method: 'DELETE' })
  
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || 'Erreur lors de la suppression de la SOP')
  }
}

export const uploadMarkdown = async (file: File): Promise<SOP> => {
  const formData = new FormData()
  formData.append('file', file)
  
  const res = await fetch('/api/sops/upload', {
    method: 'POST',
    body: formData,
  })
  
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || 'Erreur lors de l\'import du markdown')
  }
  
  return res.json()
} 