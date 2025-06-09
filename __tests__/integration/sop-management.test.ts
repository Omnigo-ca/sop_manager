/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/sops/route'

// Mock des services externes
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => ({ userId: 'test-user-id' })),
}))

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

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    sop: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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
  },
}))

import prisma from '@/lib/prisma'

describe('Tests d\'intégration - Gestion des SOPs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Récupération des SOPs', () => {
    test('retourne les SOPs filtrées selon les permissions utilisateur', async () => {
      const mockSops = [
        {
          id: '1',
          title: 'SOP Test 1',
          content: 'Contenu test 1',
          authorId: 'test-user-id',
          priority: 'high',
          tags: ['test'],
          user: { name: 'Test User' },
          accessGroups: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ]

      ;(prisma.sop.findMany as jest.Mock).mockResolvedValue(mockSops)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(prisma.sop.findMany).toHaveBeenCalled()
    })

    test('gère les erreurs de base de données gracieusement', async () => {
      ;(prisma.sop.findMany as jest.Mock).mockRejectedValue(new Error('Database connection failed'))

      const response = await GET()

      expect(response.status).toBe(500)
    })
  })

  describe('Création de SOPs', () => {
    test('crée une SOP avec toutes les données requises', async () => {
      const sopData = {
        title: 'Nouvelle SOP Test',
        content: 'Contenu de la SOP de test',
        priority: 'medium',
        tags: ['test', 'integration'],
      }

      const mockCreatedSop = {
        id: 'new-sop-id',
        ...sopData,
        authorId: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { name: 'Test User' },
      }

      ;(prisma.sop.create as jest.Mock).mockResolvedValue(mockCreatedSop)
      ;(prisma.sop.findUnique as jest.Mock).mockResolvedValue({
        ...mockCreatedSop,
        accessGroups: []
      })

      const request = new NextRequest('http://localhost:3000/api/sops', {
        method: 'POST',
        body: JSON.stringify(sopData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toMatchObject(sopData)
      expect(prisma.sop.create).toHaveBeenCalled()
    })

    test('valide les données d\'entrée', async () => {
      const invalidData = {
        title: '', // titre requis mais vide
        content: 'Contenu valide',
      }

      const request = new NextRequest('http://localhost:3000/api/sops', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })
  })

  describe('Workflow complet de gestion SOP', () => {
    test('cycle de vie complet : création -> lecture -> mise à jour', async () => {
      // 1. Création
      const sopData = {
        title: 'SOP Workflow Test',
        content: 'Contenu initial',
        priority: 'high',
        tags: ['workflow', 'test'],
      }

      const createdSop = {
        id: 'workflow-sop-id',
        ...sopData,
        authorId: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { name: 'Test User' },
      }

      ;(prisma.sop.create as jest.Mock).mockResolvedValue(createdSop)
      ;(prisma.sop.findUnique as jest.Mock).mockResolvedValue({
        ...createdSop,
        accessGroups: []
      })

      const request = new NextRequest('http://localhost:3000/api/sops', {
        method: 'POST',
        body: JSON.stringify(sopData),
        headers: { 'Content-Type': 'application/json' },
      })

      const createResponse = await POST(request)
      expect(createResponse.status).toBe(201)

      // 2. Lecture - vérifier que la SOP existe
      ;(prisma.sop.findMany as jest.Mock).mockResolvedValue([createdSop])

      const getResponse = await GET()
      const sops = await getResponse.json()

      expect(getResponse.status).toBe(200)
      expect(sops).toHaveLength(1)
      expect(sops[0].title).toBe(sopData.title)
    })
  })

  describe('Gestion des permissions', () => {
    test('refuse l\'accès aux utilisateurs non authentifiés', async () => {
      // Mock utilisateur non authentifié
      const { getCurrentUser } = require('@/lib/auth.server')
      getCurrentUser.mockResolvedValueOnce(null)

      const response = await GET()

      expect(response.status).toBe(401)
    })

    test('refuse la création sans permissions', async () => {
      const { checkSopPermission } = require('@/lib/auth.server')
      checkSopPermission.mockResolvedValueOnce(false)

      const request = new NextRequest('http://localhost:3000/api/sops', {
        method: 'POST',
        body: JSON.stringify({
          title: 'SOP Test',
          content: 'Contenu test',
        }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)

      expect(response.status).toBe(403)
    })
  })
}) 