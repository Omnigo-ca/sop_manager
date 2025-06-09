/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render } from '@testing-library/react'
import { StatsOverview } from './stats-overview'
import { SOP } from './types'

// Mock des composants UI
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">{children}</div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className} data-testid="card-content">{children}</div>
  ),
}))

describe('StatsOverview', () => {
  const mockSops: SOP[] = [
    {
      id: '1',
      title: 'SOP 1',
      description: 'Description 1',
      instructions: 'Instructions 1',
      author: 'Alice',
      authorId: 'alice',
      category: 'Category A',
      priority: 'high',
      tags: ['tag1'],
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z',
    },
    {
      id: '2',
      title: 'SOP 2',
      description: 'Description 2',
      instructions: 'Instructions 2',
      author: 'Bob',
      authorId: 'bob',
      category: 'Category B',
      priority: 'medium',
      tags: ['tag2'],
      createdAt: '2024-01-02T10:00:00Z',
      updatedAt: '2024-01-02T10:00:00Z',
    },
    {
      id: '3',
      title: 'SOP 3',
      description: 'Description 3',
      instructions: 'Instructions 3',
      author: 'Alice',
      authorId: 'alice',
      category: 'Category A',
      priority: 'low',
      tags: ['tag3'],
      createdAt: '2024-01-03T10:00:00Z',
      updatedAt: '2024-01-03T10:00:00Z',
    },
  ]

  test('rend les statistiques correctement', () => {
    const { container } = render(<StatsOverview sops={mockSops} />)
    
    // Vérifier que le composant est rendu
    expect(container.firstChild).toBeTruthy()
    
    // Vérifier les cartes de statistiques
    const cards = container.querySelectorAll('[data-testid="card"]')
    expect(cards).toHaveLength(4) // Total, Catégories, Auteurs, Priorité élevée
  })

  test('calcule le nombre total de SOPs', () => {
    const { container } = render(<StatsOverview sops={mockSops} />)
    
    // Le total devrait être 3
    expect(container.textContent).toContain('3')
    expect(container.textContent).toContain('Total procédures')
  })

  test('calcule le nombre d\'auteurs uniques', () => {
    const { container } = render(<StatsOverview sops={mockSops} />)
    
    // 2 auteurs uniques : alice et bob
    expect(container.textContent).toContain('2')
    expect(container.textContent).toContain('Auteurs')
  })

  test('calcule le nombre de catégories uniques', () => {
    const { container } = render(<StatsOverview sops={mockSops} />)
    
    // 2 catégories uniques : Category A et Category B
    expect(container.textContent).toContain('2')
    expect(container.textContent).toContain('Catégories')
  })

  test('calcule le nombre de SOPs haute priorité', () => {
    const { container } = render(<StatsOverview sops={mockSops} />)
    
    // 1 SOP haute priorité
    expect(container.textContent).toContain('1')
    expect(container.textContent).toContain('Haute priorité')
  })

  test('gère une liste vide de SOPs', () => {
    const { container } = render(<StatsOverview sops={[]} />)
    
    // Toutes les statistiques devraient être 0
    expect(container.textContent).toContain('0')
  })

  test('affiche tous les labels de statistiques', () => {
    const { container } = render(<StatsOverview sops={mockSops} />)
    
    // Vérifier que tous les labels sont présents
    expect(container.textContent).toContain('Total procédures')
    expect(container.textContent).toContain('Catégories')
    expect(container.textContent).toContain('Auteurs')
    expect(container.textContent).toContain('Haute priorité')
  })
}) 