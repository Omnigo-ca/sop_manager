import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/webhooks/clerk:
 *   post:
 *     summary: Webhook pour la synchronisation des événements Clerk
 *     description: |
 *       Point de terminaison pour recevoir les événements webhook de Clerk.
 *       Gère la création, la mise à jour et la suppression d'utilisateurs.
 *     tags:
 *       - Webhooks
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: Type d'événement Clerk (user.created, user.updated, user.deleted)
 *               data:
 *                 type: object
 *                 description: Données de l'événement
 *     responses:
 *       200:
 *         description: Événement traité avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       400:
 *         description: Requête invalide
 *       500:
 *         description: Erreur serveur
 */
export async function POST(req: Request) {
  // Vérification de la configuration
  const secret = process.env.CLERK_SECRET_KEY;
  if (!secret) {
    console.error('Erreur: CLERK_SECRET_KEY manquant dans les variables d\'environnement');
    return NextResponse.json({ error: 'Configuration incorrecte' }, { status: 500 });
  }

  // Vérification et validation du webhook
  try {
    // Récupérer les en-têtes et le corps de la requête
    const headersList = await headers();
    const body = await req.text();
    
    // Vérifier que les en-têtes nécessaires sont présents
    if (!headersList.get('svix-id') || !headersList.get('svix-timestamp') || !headersList.get('svix-signature')) {
      console.error('En-têtes Svix manquants');
      return NextResponse.json({ error: 'En-têtes de webhook manquants' }, { status: 400 });
    }
    
    // Créer l'instance Webhook et vérifier la signature
    const wh = new Webhook(secret);
    
    let event;
    try {
      event = wh.verify(body, {
        'svix-id': headersList.get('svix-id')!,
        'svix-timestamp': headersList.get('svix-timestamp')!,
        'svix-signature': headersList.get('svix-signature')!,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Erreur de vérification du webhook:', err);
      return NextResponse.json({ error: 'Signature de webhook invalide' }, { status: 400 });
    }

    // Gestion des différents événements Clerk
    
    switch (event.type) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name } = event.data;
        
        if (!email_addresses || email_addresses.length === 0) {
          console.error('Adresse email manquante pour l\'utilisateur:', id);
          return NextResponse.json({ error: 'Adresse email manquante' }, { status: 400 });
        }

        const newUser = await prisma.user.upsert({
          where: { id },
          update: {},
          create: {
            id,
            email: email_addresses[0].email_address,
            name: `${first_name || ''} ${last_name || ''}`.trim(),
            role: 'USER', // Rôle par défaut
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        
        return NextResponse.json({ success: true, user: newUser });
      }
      
      case 'user.updated': {
        const { id, email_addresses, first_name, last_name } = event.data;
        
        if (!email_addresses || email_addresses.length === 0) {
          console.error('Adresse email manquante pour la mise à jour de l\'utilisateur:', id);
          return NextResponse.json({ error: 'Adresse email manquante' }, { status: 400 });
        }

        // Vérifier si l'utilisateur existe
        const user = await prisma.user.findUnique({ where: { id } });
        
        if (user) {
          const updatedUser = await prisma.user.update({
            where: { id },
            data: {
              email: email_addresses[0].email_address,
              name: `${first_name || ''} ${last_name || ''}`.trim(),
              updatedAt: new Date(),
            },
          });
          
          return NextResponse.json({ success: true, user: updatedUser });
        } else {
          // L'utilisateur n'existe pas encore dans la base de données, le créer
          const newUser = await prisma.user.create({
            data: {
              id,
              email: email_addresses[0].email_address,
              name: `${first_name || ''} ${last_name || ''}`.trim(),
              role: 'USER',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
          
          return NextResponse.json({ success: true, user: newUser });
        }
      }
      
      case 'user.deleted': {
        const { id } = event.data;
        
        // Option 1: Supprimer l'utilisateur
        // await prisma.user.delete({ where: { id } });
        
        // Option 2: Anonymiser l'utilisateur (recommandé pour préserver les références)
        const deletedUser = await prisma.user.update({
          where: { id },
          data: {
            email: `deleted-${id}@example.com`,
            name: 'Utilisateur supprimé',
            updatedAt: new Date(),
          },
        });
        
        return NextResponse.json({ success: true, user: deletedUser });
      }
      
      default:
        // Ignorer les autres types d'événements
        return NextResponse.json({ success: true, message: 'Événement ignoré' });
    }
  } catch (error: any) {
    console.error('Erreur générale webhook Clerk:', error);
    return NextResponse.json(
      { error: 'Erreur de traitement du webhook', message: error.message }, 
      { status: 500 }
    );
  }
} 