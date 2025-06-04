import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import markdownIt from 'markdown-it';
import { NextRequest } from 'next/server';
import { parseSopMarkdown } from '@/lib/parseSopMarkdown';
import crypto from 'crypto';
import { getCurrentUser, checkSopPermission, checkSopAccess } from '@/lib/auth.server';
import prisma from "@/lib/prisma";

const prismaClient = new PrismaClient();

/**
 * @swagger
 * /api/sops:
 *   get:
 *     summary: Récupère la liste de tous les SOPs
 *     tags:
 *       - SOPs
 *     responses:
 *       200:
 *         description: Liste des SOPs récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *                   authorId:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                   author:
 *                     type: string
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    let sops;

    // Les admins voient toutes les SOPs
    if (currentUser.role === 'ADMIN') {
      sops = await prisma.sop.findMany({
        include: {
          user: true,
          access: {
            include: {
              user: true,
            },
          },
        },
      });
    } else {
      // Les autres utilisateurs voient uniquement les SOPs auxquelles ils ont accès
      sops = await prisma.sop.findMany({
        where: {
          OR: [
            { authorId: currentUser.id }, // SOPs dont ils sont auteurs
            {
              access: {
                some: {
                  userId: currentUser.id // SOPs auxquelles ils ont accès explicitement
                }
              }
            }
          ]
        },
        include: {
          user: true,
          access: {
            include: {
              user: true,
            },
          },
        },
      });
    }

    // Transformer les données pour inclure les utilisateurs associés
    const formattedSops = sops.map(sop => ({
      ...sop,
      author: sop.user?.name || sop.authorId,
      users: sop.access.map(access => ({
        id: access.user.id,
        name: access.user.name || 'Sans nom',
      })),
      access: undefined, // Supprimer le champ access de la réponse
      user: undefined, // Supprimer le champ user de la réponse
    }));

    return NextResponse.json(formattedSops);
  } catch (error) {
    console.error("[SOPS_GET]", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
}

/**
 * @swagger
 * /api/sops:
 *   post:
 *     summary: Crée un nouveau SOP
 *     tags:
 *       - SOPs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               authorId:
 *                 type: string
 *               priority:
 *                 type: string
 *     responses:
 *       200:
 *         description: SOP créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *                 authorId:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 author:
 *                   type: string
 */
export async function POST(req: Request) {
  try {
    // Vérifier l'authentification et les permissions
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    const hasPermission = await checkSopPermission(currentUser.id, 'create');
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const data = await req.json();
    const { author, ...rest } = data;
    
    // Generate a unique ID for the SOP
    const id = 'sop-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex');
    
    if (rest.priority) rest.priority = rest.priority.toLowerCase();
    
    const sop = await prismaClient.sop.create({ 
      data: { 
        ...rest,
        id,
        authorId: currentUser.id // Utiliser l'ID de l'utilisateur connecté
      }, 
      include: { user: true } 
    });
    
    return NextResponse.json({
      ...sop,
      author: sop.user?.name || sop.authorId,
    });
  } catch (error: any) {
    console.error('Erreur lors de la création du SOP:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      message: error.message 
    }, { status: 500 });
  }
}