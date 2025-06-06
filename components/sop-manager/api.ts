import { SOP, User } from "./types"

export type AccessGroup = {
  id: string
  name: string
  description?: string
  type?: string
}

export const fetchSOPs = async (): Promise<SOP[]> => {
  const res = await fetch('/api/sops')
  if (!res.ok) {
    throw new Error('Erreur lors du chargement des SOPs')
  }
  return res.json()
}

export const fetchUsers = async (): Promise<User[]> => {
  const res = await fetch('/api/users')
  
  if (!res.ok) {
    throw new Error('Erreur lors de la récupération des utilisateurs')
  }
  
  return res.json()
}

export const fetchAccessGroups = async () => {
  const res = await fetch('/api/access-groups')
  
  if (!res.ok) {
    throw new Error('Erreur lors de la récupération des groupes d\'accès')
  }
  
  return res.json()
}

export const createSOP = async (newSOP: Omit<SOP, 'id' | 'createdAt' | 'updatedAt' | 'editedAt'>, accessGroupIds?: string[]): Promise<SOP> => {
  // Si des groupes d'accès sont spécifiés, utiliser l'endpoint create-with-group
  if (accessGroupIds && accessGroupIds.length > 0) {
    const res = await fetch('/api/sops/create-with-groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newSOP,
        accessGroupIds,
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
  
  // Sinon, utiliser l'endpoint standard qui assigne automatiquement les groupes
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