import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/auth/sync-current-user:
 *   get:
 *     summary: Synchronise l'utilisateur actuel avec la base de données
 *     description: Récupère les informations de l'utilisateur connecté depuis Clerk et les synchronise avec la base de données Prisma
 *     tags:
 *       - Authentification
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Utilisateur synchronisé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Utilisateur mis à jour"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "user_2fj38fj"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     role:
 *                       type: string
 *                       example: "USER"
 *       401:
 *         description: Utilisateur non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Utilisateur non authentifié"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur de synchronisation"
 *                 message:
 *                   type: string
 *                   example: "Détails de l'erreur"
 */
export async function GET() {
  try {
    // Récupérer l'utilisateur actuel via Clerk
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non authentifié' }, { status: 401 });
    }

    const { id, firstName, lastName, emailAddresses } = user;
    
    if (!emailAddresses || emailAddresses.length === 0) {
      return NextResponse.json({ error: 'Adresse email manquante' }, { status: 400 });
    }
    
    const email = emailAddresses[0].emailAddress;
    const name = `${firstName || ''} ${lastName || ''}`.trim();
    
    // Vérifier si l'utilisateur existe déjà dans Prisma
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    
    let syncedUser;
    
    if (existingUser) {
      // Mettre à jour l'utilisateur si les données ont changé
      if (existingUser.email !== email || existingUser.name !== name) {
        syncedUser = await prisma.user.update({
          where: { id },
          data: {
            email,
            name,
            updatedAt: new Date(),
          },
        });
      } else {
        syncedUser = existingUser;
      }
    } else {
      // Créer un nouvel utilisateur
      syncedUser = await prisma.user.create({
        data: {
          id,
          email,
          name,
          role: 'USER', // Rôle par défaut
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
    
    return NextResponse.json({
      success: true,
      message: existingUser ? 'Utilisateur mis à jour' : 'Utilisateur créé',
      user: {
        id: syncedUser.id,
        email: syncedUser.email,
        name: syncedUser.name,
        role: syncedUser.role,
      }
    });
  } catch (error: any) {
    console.error('Erreur lors de la synchronisation de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur de synchronisation', message: error.message },
      { status: 500 }
    );
  }
} 