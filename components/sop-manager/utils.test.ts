import { formatDate, getUniqueValues, filterSops, sortSops, handleStepImageUpload } from './utils'
import { SOP } from './types'

describe('utils.ts', () => {
  const sops: SOP[] = [
    {
      id: '1',
      title: 'Procédure A',
      description: 'Description A',
      instructions: 'Étape 1',
      author: 'Alice',
      category: 'Catégorie 1',
      priority: 'high',
      tags: ['tag1', 'tag2'],
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z',
    },
    {
      id: '2',
      title: 'Procédure B',
      description: 'Description B',
      instructions: 'Étape 2',
      author: 'Bob',
      category: 'Catégorie 2',
      priority: 'medium',
      tags: ['tag2', 'tag3'],
      createdAt: '2024-02-01T10:00:00Z',
      updatedAt: '2024-02-01T10:00:00Z',
    },
    {
      id: '3',
      title: 'Procédure C',
      description: 'Description C',
      instructions: 'Étape 3',
      author: 'Alice',
      category: 'Catégorie 1',
      priority: 'low',
      tags: ['tag1'],
      createdAt: '2024-03-01T10:00:00Z',
      updatedAt: '2024-03-01T10:00:00Z',
    },
  ]

  test('formatDate retourne une date formatée en français', () => {
    expect(formatDate('2024-01-01T10:00:00Z')).toMatch(/1 janvier 2024|1 janvier 2024/)
  })

  test('getUniqueValues retourne les valeurs uniques pour une clé donnée', () => {
    expect(getUniqueValues(sops, 'author').sort()).toEqual(['Alice', 'Bob'])
    expect(getUniqueValues(sops, 'category').sort()).toEqual(['Catégorie 1', 'Catégorie 2'])
  })

  test('filterSops filtre correctement selon le terme de recherche', () => {
    const result = filterSops(sops, 'Procédure A', 'all', 'all', 'all')
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Procédure A')
  })

  test('filterSops filtre selon la catégorie', () => {
    const result = filterSops(sops, '', 'Catégorie 2', 'all', 'all')
    expect(result).toHaveLength(1)
    expect(result[0].category).toBe('Catégorie 2')
  })

  test('filterSops filtre selon la priorité', () => {
    const result = filterSops(sops, '', 'all', 'low', 'all')
    expect(result).toHaveLength(1)
    expect(result[0].priority).toBe('low')
  })

  test('filterSops filtre selon l\'auteur', () => {
    const result = filterSops(sops, '', 'all', 'all', 'Alice')
    expect(result).toHaveLength(2)
    expect(result[0].author).toBe('Alice')
  })

  test('sortSops trie par date décroissante', () => {
    const sorted = sortSops(sops, 'date')
    expect(sorted[0].id).toBe('3')
    expect(sorted[2].id).toBe('1')
  })

  test('sortSops trie par titre', () => {
    const sorted = sortSops(sops, 'title')
    expect(sorted[0].title).toBe('Procédure A')
    expect(sorted[2].title).toBe('Procédure C')
  })

  test('sortSops trie par priorité', () => {
    const sorted = sortSops(sops, 'priority')
    expect(sorted[0].priority).toBe('high')
    expect(sorted[1].priority).toBe('medium')
    expect(sorted[2].priority).toBe('low')
  })

  test('sortSops trie par auteur', () => {
    const sorted = sortSops(sops, 'author')
    expect(sorted[0].author).toBe('Alice')
    expect(sorted[2].author).toBe('Bob')
  })

  test('handleStepImageUpload convertit un fichier en base64', async () => {
    // Mock d'un fichier image
    const file = new File(['test image content'], 'test.jpg', { type: 'image/jpeg' })
    
    // Mock de FileReader
    const mockFileReader = {
      onload: null as any,
      readAsDataURL: jest.fn(function(this: any) {
        this.onload({ target: { result: 'data:image/jpeg;base64,dGVzdCBpbWFnZSBjb250ZW50' } })
      })
    }
    
    global.FileReader = jest.fn(() => mockFileReader) as any

    const result = await handleStepImageUpload(file)
    
    expect(result).toBe('data:image/jpeg;base64,dGVzdCBpbWFnZSBjb250ZW50')
    expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(file)
  })
}) 