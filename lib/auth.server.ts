import { currentUser } from '@clerk/nextjs/server';
import { user as PrismaUser } from '@/lib/generated/prisma';
import prisma from './prisma';

/**
 * Synchronise un utilisateur Clerk avec la base de données Prisma
 * @param clerkUser L'utilisateur Clerk à synchroniser
 * @returns L'utilisateur Prisma synchronisé
 */
async function syncUserWithDatabase(clerkUser: any): Promise<PrismaUser> {
  if (!clerkUser) {
    throw new Error("Utilisateur Clerk non défini");
  }

  const { id, firstName, lastName, emailAddresses } = clerkUser;
  
  if (!emailAddresses || emailAddresses.length === 0) {
    throw new Error("Adresse email manquante pour l'utilisateur");
  }
  
  const email = emailAddresses[0].emailAddress;
  const name = `${firstName || ''} ${lastName || ''}`.trim();
  
  // Vérifier si l'utilisateur existe déjà dans Prisma
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });
  
  if (existingUser) {
    // Mettre à jour l'utilisateur existant si les données ont changé
    if (existingUser.email !== email || existingUser.name !== name) {
      return await prisma.user.update({
        where: { id },
        data: {
          email,
          name,
          updatedAt: new Date(),
        },
      });
    }
    return existingUser;
  } else {
    // Créer un nouvel utilisateur
    return await prisma.user.create({
      data: {
        id,
        email,
        name,
        role: 'USER', // Rôle par défaut
        updatedAt: new Date(),
        createdAt: new Date(),
      },
    });
  }
}

/**
 * Récupère l'utilisateur Clerk actuel et ses données associées dans Prisma
 * Cette fonction synchronise automatiquement l'utilisateur avec la base de données
 * @returns L'utilisateur Prisma avec ses données complètes ou null si non connecté
 */
export async function getCurrentUser(): Promise<PrismaUser | null> {
  try {
    // Récupérer l'utilisateur Clerk actuel
    const user = await currentUser();
    
    if (!user) {
      return null;
    }
    
    // Synchroniser l'utilisateur avec la base de données
    const prismaUser = await syncUserWithDatabase(user);
    
    return prismaUser;
  } catch (error) {
    console.error('Erreur lors de la récupération des données utilisateur:', error);
    return null;
  }
}

/**
 * Récupère un utilisateur Prisma par son ID
 * @param userId ID de l'utilisateur à récupérer
 * @returns L'utilisateur Prisma ou null si non trouvé
 */
export async function getUserById(userId: string): Promise<PrismaUser | null> {
  try {
    return await prisma.user.findUnique({
      where: { id: userId }
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'utilisateur ${userId}:`, error);
    return null;
  }
}

/**
 * Vérifie si l'utilisateur a la permission d'effectuer une opération CRUD sur les SOPs
 * @param userId ID de l'utilisateur à vérifier
 * @param operation 'create' | 'update' | 'delete' | 'read'
 * @returns true si l'utilisateur a la permission, false sinon
 */
export async function checkSopPermission(userId: string, operation: 'create' | 'update' | 'delete' | 'read'): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return false;

    // Les admins peuvent tout faire
    if (user.role === 'ADMIN') return true;

    // Les auteurs peuvent créer et mettre à jour leurs propres SOPs
    if (user.role === 'AUTHOR') {
      return operation === 'create' || operation === 'read';
    }

    // Les utilisateurs simples peuvent uniquement lire les SOPs auxquelles ils ont accès
    if (user.role === 'USER') {
      return operation === 'read';
    }

    return false;
  } catch (error) {
    console.error(`Erreur lors de la vérification des permissions pour l'utilisateur ${userId}:`, error);
    return false;
  }
}

/**
 * Vérifie si l'utilisateur a accès à une SOP spécifique
 * @param userId ID de l'utilisateur
 * @param sopId ID de la SOP
 * @returns true si l'utilisateur a accès, false sinon
 */
export async function checkSopAccess(userId: string, sopId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return false;

    // Les admins ont accès à toutes les SOPs
    if (user.role === 'ADMIN') return true;

    // Vérifier si l'utilisateur est l'auteur de la SOP
    const sop = await prisma.sop.findFirst({
      where: {
        id: sopId,
        authorId: userId
      }
    });

    if (sop) return true;

    // Vérifier si l'utilisateur a un accès explicite à la SOP
    const access = await prisma.sopAccess.findUnique({
      where: {
        userId_sopId: {
          userId: userId,
          sopId: sopId
        }
      }
    });

    return !!access;
  } catch (error) {
    console.error(`Erreur lors de la vérification de l'accès à la SOP ${sopId} pour l'utilisateur ${userId}:`, error);
    return false;
  }
} 