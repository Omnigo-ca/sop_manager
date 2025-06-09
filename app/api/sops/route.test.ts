/**
 * @jest-environment node
 */

// Polyfills pour les APIs web dans l'environnement Node.js
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock de crypto pour Node.js
Object.defineProperty(global, 'crypto', {
  value: {
    randomBytes: jest.fn(() => Buffer.from('test')),
  },
})

// Mock de Prisma - DOIT être défini avant l'import
const mockPrisma = {
  sop: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  accessGroup: {
    findMany: jest.fn(() => Promise.resolve([
      { id: 'internal-id', name: 'INTERNAL' },
      { id: 'public-id', name: 'PUBLIC' },
      { id: 'admin-id', name: 'ADMINISTRATIVE' }
    ])),
  },
  sopAccessGroup: {
    create: jest.fn(),
  },
}

// Mock de l'authentification Clerk
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => ({ userId: 'test-user-id' })),
}))

// Mock de l'authentification personnalisée
jest.mock('@/lib/auth.server', () => ({
  getCurrentUser: jest.fn(() => Promise.resolve({
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'USER'
  })),
  checkSopPermission: jest.fn(() => Promise.resolve(true)),
  checkSopAccess: jest.fn(() => Promise.resolve(true)),
}))

// Mock de Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}))

import { NextRequest } from 'next/server'
import { GET, POST } from './route'

describe('/api/sops', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/sops', () => {
    test('retourne la liste des SOPs avec succès', async () => {
      const mockSops = [
        {
          id: '1',
          title: 'Test SOP 1',
          description: 'Description 1',
          instructions: 'Instructions 1',
          author: 'Test Author',
          category: 'Test Category',
          priority: 'high',
          tags: ['tag1'],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          user: { name: 'Test Author' },
          accessGroups: [],
        },
        {
          id: '2',
          title: 'Test SOP 2',
          description: 'Description 2',
          instructions: 'Instructions 2',
          author: 'Test Author 2',
          category: 'Test Category 2',
          priority: 'medium',
          tags: ['tag2'],
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
          user: { name: 'Test Author 2' },
          accessGroups: [],
        },
      ]

      mockPrisma.sop.findMany.mockResolvedValue(mockSops)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(2)
    })

    test('retourne une erreur 500 en cas d\'échec', async () => {
      mockPrisma.sop.findMany.mockRejectedValue(new Error('Database error'))

      const response = await GET()

      expect(response.status).toBe(500)
    })
  })

  describe('POST /api/sops', () => {
    const validSopData = {
      title: 'Nouvelle SOP',
      content: 'Contenu de test',
      priority: 'high',
      tags: ['tag1', 'tag2'],
    }

    test('crée une nouvelle SOP avec succès', async () => {
      const mockCreatedSop = {
        id: 'new-sop-id',
        ...validSopData,
        authorId: 'test-user-id',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        user: { name: 'Test User' },
      }

      mockPrisma.sop.create.mockResolvedValue(mockCreatedSop)
      mockPrisma.sop.findUnique.mockResolvedValue({
        ...mockCreatedSop,
        accessGroups: []
      })

      const request = new NextRequest('http://localhost:3000/api/sops', {
        method: 'POST',
        body: JSON.stringify(validSopData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toMatchObject(validSopData)
      expect(mockPrisma.sop.create).toHaveBeenCalled()
    })

    test('retourne une erreur 400 avec des données invalides', async () => {
      const invalidData = {
        title: '', // titre vide
        content: 'Contenu de test',
      }

      const request = new NextRequest('http://localhost:3000/api/sops', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    test('retourne une erreur 500 en cas d\'échec de création', async () => {
      mockPrisma.sop.create.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/sops', {
        method: 'POST',
        body: JSON.stringify(validSopData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
    })
  })
}) 