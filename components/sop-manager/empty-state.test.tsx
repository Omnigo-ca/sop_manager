/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render } from '@testing-library/react'
import { EmptyState } from './empty-state'

// Mock des icônes Lucide React
jest.mock('lucide-react', () => ({
  AlertCircle: ({ className }: { className?: string }) => (
    <div data-testid="alert-circle-icon" className={className}>
      AlertCircle
    </div>
  ),
  Search: ({ className }: { className?: string }) => (
    <div data-testid="search-icon" className={className}>
      Search
    </div>
  ),
}))

// Mock des composants UI
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="card-content">
      {children}
    </div>
  ),
}))

describe('EmptyState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('rend l\'état vide sans SOPs', () => {
    const { container, getByTestId } = render(<EmptyState hasSops={false} />)
    
    // Vérifier que le composant est rendu
    expect(container.firstChild).toBeTruthy()
    expect(getByTestId('card')).toBeTruthy()
    expect(getByTestId('alert-circle-icon')).toBeTruthy()
    
    // Vérifier le contenu pour l'état "aucune procédure"
    expect(container.textContent).toContain('Aucune procédure')
    expect(container.textContent).toContain('Commencez par créer votre première procédure')
  })

  test('rend l\'état vide avec résultats de recherche', () => {
    const { container, getByTestId } = render(<EmptyState hasSops={true} />)
    
    // Vérifier que le composant est rendu
    expect(getByTestId('card')).toBeTruthy()
    expect(getByTestId('search-icon')).toBeTruthy()
    
    // Vérifier le contenu pour l'état "aucun résultat"
    expect(container.textContent).toContain('Aucun résultat')
    expect(container.textContent).toContain('Essayez de modifier vos critères de recherche')
  })

  test('rend par défaut l\'état sans SOPs', () => {
    const { container, getByTestId } = render(<EmptyState />)
    
    // Par défaut, hasSops = false
    expect(getByTestId('alert-circle-icon')).toBeTruthy()
    expect(container.textContent).toContain('Aucune procédure')
  })
}) 