import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { getCurrentUser, checkSopPermission } from '@/lib/auth.server';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/sops/access:
 *   get:
 *     summary: Récupère la liste des utilisateurs ayant accès à une SOP
 *     tags:
 *       - SOPs
 *     parameters:
 *       - in: query
 *         name: sopId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la SOP
 *     responses:
 *       200:
 *         description: Liste des accès récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   userName:
 *                     type: string
 *                   userEmail:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       400:
 *         description: Paramètre sopId manquant
 *       500:
 *         description: Erreur serveur
 *   post:
 *     summary: Ajoute un accès à une SOP pour un utilisateur
 *     tags:
 *       - SOPs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sopId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Accès ajouté avec succès
 *       400:
 *         description: Paramètres manquants
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: SOP ou utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 *   delete:
 *     summary: Supprime un accès à une SOP pour un utilisateur
 *     tags:
 *       - SOPs
 *     parameters:
 *       - in: query
 *         name: sopId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la SOP
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Accès supprimé avec succès
 *       400:
 *         description: Paramètres manquants
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Accès non trouvé
 *       500:
 *         description: Erreur serveur
 */

// Ajouter un accès à une SOP pour un utilisateur
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { sopId, userId } = await req.json();

    if (!sopId || !userId) {
      return NextResponse.json({ error: 'sopId et userId sont requis' }, { status: 400 });
    }

    // Vérifier que l'utilisateur courant a le droit de gérer les accès
    const hasPermission = await checkSopPermission(currentUser.id, 'update');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Vérifier que la SOP existe
    const sop = await prisma.sop.findUnique({
      where: { id: sopId }
    });

    if (!sop) {
      return NextResponse.json({ error: 'SOP non trouvée' }, { status: 404 });
    }

    // Vérifier que l'utilisateur cible existe
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Ajouter l'accès
    const access = await prisma.sopAccess.create({
      data: {
        userId: userId,
        sopId: sopId
      }
    });

    return NextResponse.json(access);
  } catch (error: any) {
    console.error('Erreur lors de l\'ajout de l\'accès:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      message: error.message 
    }, { status: 500 });
  }
}

// Supprimer un accès à une SOP pour un utilisateur
export async function DELETE(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sopId = searchParams.get('sopId');
    const userId = searchParams.get('userId');

    if (!sopId || !userId) {
      return NextResponse.json({ error: 'sopId et userId sont requis' }, { status: 400 });
    }

    // Vérifier que l'utilisateur courant a le droit de gérer les accès
    const hasPermission = await checkSopPermission(currentUser.id, 'update');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Supprimer l'accès
    await prisma.sopAccess.delete({
      where: {
        userId_sopId: {
          userId: userId,
          sopId: sopId
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur lors de la suppression de l\'accès:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      message: error.message 
    }, { status: 500 });
  }
}

// Récupérer la liste des utilisateurs ayant accès à une SOP
export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sopId = searchParams.get('sopId');

    if (!sopId) {
      return NextResponse.json({ error: 'sopId est requis' }, { status: 400 });
    }

    // Vérifier que l'utilisateur a le droit de voir les accès
    const hasPermission = await checkSopPermission(currentUser.id, 'read');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Récupérer la liste des accès
    const accesses = await prisma.sopAccess.findMany({
      where: { sopId: sopId },
      include: { user: true }
    });

    return NextResponse.json(accesses.map(access => ({
      id: access.id,
      userId: access.userId,
      userName: access.user.name,
      userEmail: access.user.email,
      createdAt: access.createdAt
    })));
  } catch (error: any) {
    console.error('Erreur lors de la récupération des accès:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      message: error.message 
    }, { status: 500 });
  }
} 