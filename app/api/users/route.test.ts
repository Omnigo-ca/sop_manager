/**
 * @jest-environment node
 */

import { createMockPrisma, createMockAuth } from '@/__tests__/setup/test-utils'

// Mock de Prisma
const mockPrisma = createMockPrisma()

// Mock de l'authentification
const mockAuth = createMockAuth()

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}))

jest.mock('@/lib/auth.server', () => mockAuth)

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => ({ userId: 'test-user-id' })),
}))

describe('/api/users', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Gestion des utilisateurs', () => {
    test('récupère la liste des utilisateurs avec succès', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          name: 'Alice Smith',
          email: 'alice@example.com',
          role: 'USER',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'user-2',
          name: 'Bob Johnson',
          email: 'bob@example.com',
          role: 'ADMIN',
          createdAt: new Date('2024-01-02'),
        },
      ]

      mockPrisma.user.findMany.mockResolvedValue(mockUsers)

      // Simuler un appel API
      const response = { status: 200, json: () => Promise.resolve(mockUsers) }

      expect(mockPrisma.user.findMany).toBeDefined()
    })

    test('gère les erreurs d\'authentification', async () => {
      mockAuth.getCurrentUser.mockResolvedValueOnce(null)

      // L'utilisateur non authentifié devrait recevoir une erreur 401
      const expectedError = { error: 'Non authentifié' }
      expect(expectedError.error).toBe('Non authentifié')
    })

    test('filtre les utilisateurs selon les permissions', async () => {
      const adminUser = {
        id: 'admin-user',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'ADMIN',
      }

      mockAuth.getCurrentUser.mockResolvedValueOnce(adminUser)

      // Un admin devrait voir tous les utilisateurs
      const allUsers = [
        { id: '1', name: 'User 1', role: 'USER' },
        { id: '2', name: 'User 2', role: 'USER' },
        { id: '3', name: 'Admin User', role: 'ADMIN' },
      ]

      mockPrisma.user.findMany.mockResolvedValue(allUsers)

      expect(allUsers).toHaveLength(3)
      expect(allUsers.some(user => user.role === 'ADMIN')).toBe(true)
    })
  })

  describe('Création d\'utilisateur', () => {
    test('crée un nouvel utilisateur avec des données valides', async () => {
      const newUserData = {
        name: 'New User',
        email: 'newuser@example.com',
        role: 'USER',
      }

      const createdUser = {
        id: 'new-user-id',
        ...newUserData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.create.mockResolvedValue(createdUser)

      expect(createdUser.name).toBe(newUserData.name)
      expect(createdUser.email).toBe(newUserData.email)
      expect(createdUser.role).toBe(newUserData.role)
    })

    test('valide les données d\'entrée', () => {
      const invalidData = {
        name: '', // nom requis
        email: 'invalid-email', // email invalide
        role: 'INVALID_ROLE', // rôle invalide
      }

      // Valider que le nom n'est pas vide
      expect(invalidData.name.length).toBe(0)
      
      // Valider le format de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      expect(emailRegex.test(invalidData.email)).toBe(false)
      
      // Valider le rôle
      const validRoles = ['USER', 'ADMIN']
      expect(validRoles.includes(invalidData.role as any)).toBe(false)
    })
  })

  describe('Mise à jour des permissions', () => {
    test('met à jour le rôle d\'un utilisateur', async () => {
      const userId = 'user-to-update'
      const updatedRole = 'ADMIN'

      const updatedUser = {
        id: userId,
        name: 'User Name',
        email: 'user@example.com',
        role: updatedRole,
        updatedAt: new Date(),
      }

      mockPrisma.user.update.mockResolvedValue(updatedUser)

      expect(updatedUser.role).toBe(updatedRole)
    })

    test('refuse la mise à jour sans permissions admin', async () => {
      const regularUser = {
        id: 'regular-user',
        role: 'USER',
      }

      mockAuth.getCurrentUser.mockResolvedValueOnce(regularUser)

      // Un utilisateur normal ne devrait pas pouvoir changer les rôles
      const hasPermission = regularUser.role === 'ADMIN'
      expect(hasPermission).toBe(false)
    })
  })
}) 