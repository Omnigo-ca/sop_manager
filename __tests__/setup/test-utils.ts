import { SOP } from '@/components/sop-manager/types'

// Factory pour créer des SOPs de test
export const createMockSOP = (overrides?: Partial<SOP>): SOP => ({
  id: 'test-sop-id',
  title: 'Test SOP',
  description: 'Test description',
  instructions: 'Test instructions',
  author: 'Test Author',
  category: 'Test Category',
  priority: 'medium',
  tags: ['test'],
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
  ...overrides,
})

// Factory pour créer plusieurs SOPs de test
export const createMockSOPs = (count: number): SOP[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockSOP({
      id: `test-sop-${index + 1}`,
      title: `Test SOP ${index + 1}`,
      priority: index % 3 === 0 ? 'high' : index % 2 === 0 ? 'medium' : 'low',
      author: index % 2 === 0 ? 'Alice' : 'Bob',
      category: index % 2 === 0 ? 'Category A' : 'Category B',
    })
  )
}

// Mock pour Prisma client
export const createMockPrisma = () => ({
  sop: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  accessGroup: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
})

// Mock pour l'authentification
export const createMockAuth = () => ({
  getCurrentUser: jest.fn(() => Promise.resolve({
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'USER'
  })),
  checkSopPermission: jest.fn(() => Promise.resolve(true)),
  checkSopAccess: jest.fn(() => Promise.resolve(true)),
})

// Helpers pour les assertions
export const expectToContainText = (container: Element, text: string) => {
  expect(container.textContent).toContain(text)
}

export const expectElementCount = (container: Element, selector: string, count: number) => {
  const elements = container.querySelectorAll(selector)
  expect(elements).toHaveLength(count)
} 