import { render, screen, fireEvent } from '@testing-library/react'
import { SopDeleteDialog } from './sop-delete-dialog'
import { SOP } from '../types'

// Mock du composant AlertDialog
jest.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open }: { children: React.ReactNode, open: boolean }) => 
    open ? <div data-testid="alert-dialog">{children}</div> : null,
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="alert-dialog-content">{children}</div>,
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="alert-dialog-header">{children}</div>,
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => 
    <h2 data-testid="alert-dialog-title">{children}</h2>,
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => 
    <p data-testid="alert-dialog-description">{children}</p>,
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="alert-dialog-footer">{children}</div>,
  AlertDialogCancel: ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => (
    <button onClick={onClick} data-testid="cancel-button">{children}</button>
  ),
  AlertDialogAction: ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => (
    <button onClick={onClick} data-testid="action-button">{children}</button>
  ),
}))

describe('SopDeleteDialog', () => {
  const mockSop: SOP = {
    id: '1',
    title: 'Test SOP',
    description: 'Test description',
    instructions: 'Test instructions',
    author: 'Test Author',
    category: 'Test Category',
    priority: 'high',
    tags: ['test'],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  }

  const mockOnOpenChange = jest.fn()
  const mockOnConfirm = jest.fn()

  const mockProps = {
    sop: mockSop,
    open: true,
    onOpenChange: mockOnOpenChange,
    onConfirm: mockOnConfirm,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('affiche le dialog quand open est true', () => {
    render(<SopDeleteDialog {...mockProps} />)
    
    expect(screen.getByTestId('alert-dialog')).toBeInTheDocument()
    expect(screen.getByTestId('alert-dialog-title')).toHaveTextContent('Supprimer la procédure')
    expect(screen.getByTestId('alert-dialog-description')).toHaveTextContent('Test SOP')
  })

  test('ne rend rien quand open est false', () => {
    render(<SopDeleteDialog {...mockProps} open={false} />)
    
    expect(screen.queryByTestId('alert-dialog')).not.toBeInTheDocument()
  })

  test('appelle onConfirm quand le bouton Supprimer est cliqué', () => {
    render(<SopDeleteDialog {...mockProps} />)
    
    fireEvent.click(screen.getByTestId('action-button'))
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
  })

  test('affiche Annuler et Supprimer dans les boutons', () => {
    render(<SopDeleteDialog {...mockProps} />)
    
    expect(screen.getByTestId('cancel-button')).toHaveTextContent('Annuler')
    expect(screen.getByTestId('action-button')).toHaveTextContent('Supprimer')
  })

  test('ne rend rien quand sop est null', () => {
    render(<SopDeleteDialog {...mockProps} sop={null} />)
    
    expect(screen.queryByTestId('alert-dialog')).not.toBeInTheDocument()
  })
}) 