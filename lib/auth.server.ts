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