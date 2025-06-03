import { clerkClient } from '@clerk/clerk-sdk-node';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

/**
 * @swagger
 * /api/auth/sync-users:
 *   get:
 *     summary: Synchroniser tous les utilisateurs Clerk avec la base de données
 *     description: |
 *       Récupère tous les utilisateurs depuis Clerk et s'assure qu'ils existent dans la base de données Prisma.
 *       Cette opération est utile lorsque les webhooks Clerk ne fonctionnent pas correctement ou pour forcer une synchronisation complète.
 *     tags:
 *       - Authentification
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Synchronisation réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 totalUsers:
 *                   type: integer
 *                   example: 10
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "user_123456789"
 *                       email:
 *                         type: string
 *                         example: "user@example.com"
 *                       status:
 *                         type: string
 *                         enum: [created, updated, error]
 *                         example: "updated"
 *                       message:
 *                         type: string
 *                         example: "Erreur base de données"
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé (l'utilisateur n'a pas les permissions requises)
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur serveur"
 *                 message:
 *                   type: string
 *                   example: "Une erreur est survenue lors de la récupération des utilisateurs"
 */
export async function GET() {
  try {
    // Vérifier l'authentification et les autorisations
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    // Vérification des droits d'administration (à adapter selon votre logique d'autorisation)
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    
    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }
    
    // Vérifier si les clés Clerk sont configurées
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    
    if (!clerkSecretKey) {
      return NextResponse.json({
        error: 'Configuration manquante',
        message: 'CLERK_SECRET_KEY n\'est pas défini dans les variables d\'environnement',
        requiredEnvVars: {
          'CLERK_SECRET_KEY': 'La clé secrète Clerk (commençant par sk_test_ ou sk_live_)',
          'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': 'La clé publique Clerk (commençant par pk_test_ ou pk_live_)',
        },
        documentation: 'https://clerk.com/docs/quickstarts/nextjs'
      }, { status: 500 });
    }

    // Récupérer tous les utilisateurs Clerk
    try {
      const users = await clerkClient.users.getUserList();

      const results = [];
      
      // Synchroniser chaque utilisateur
      for (const clerkUser of users) {
        const { id, firstName, lastName, emailAddresses } = clerkUser;
        
        if (!emailAddresses || emailAddresses.length === 0) {
          results.push({ id, status: 'error', message: 'No email address' });
          continue;
        }
        
        const email = emailAddresses[0].emailAddress;
        const name = `${firstName || ''} ${lastName || ''}`.trim();
        
        // Vérifier si l'utilisateur existe déjà dans Prisma
        try {
          const existingUser = await prisma.user.findUnique({
            where: { id },
          });
          
          if (existingUser) {
            // Mettre à jour l'utilisateur existant
            await prisma.user.update({
              where: { id },
              data: {
                email,
                name,
                updatedAt: new Date(),
              },
            });
            results.push({ id, email, status: 'updated' });
          } else {
            // Créer un nouvel utilisateur
            await prisma.user.create({
              data: {
                id,
                email,
                name,
                role: 'USER', // Rôle par défaut
                updatedAt: new Date(),
                createdAt: new Date(),
              },
            });
            results.push({ id, email, status: 'created' });
          }
        } catch (prismaError: any) {
          results.push({ 
            id, 
            email, 
            status: 'error', 
            message: prismaError.message || 'Erreur base de données' 
          });
        }
      }
      
      // Retourner les résultats
      return NextResponse.json({
        success: true,
        totalUsers: users.length,
        results,
      });
    } catch (clerkError: any) {
      return NextResponse.json({
        error: 'Erreur Clerk API',
        message: clerkError.message || 'Une erreur est survenue lors de la récupération des utilisateurs',
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      error: 'Erreur serveur',
      message: error.message || 'Une erreur inconnue est survenue',
    }, { status: 500 });
  }
} 