import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, checkSopPermission } from "@/lib/auth.server";
import crypto from "crypto";

/**
 * @swagger
 * /api/sops/create-with-groups:
 *   post:
 *     summary: Crée une nouvelle SOP avec assignation à plusieurs groupes d'accès
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
 *               description:
 *                 type: string
 *               instructions:
 *                 type: string
 *               category:
 *                 type: string
 *               priority:
 *                 type: string
 *               tags:
 *                 type: array
 *               steps:
 *                 type: array
 *               accessGroupIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs des groupes d'accès à assigner
 *     responses:
 *       200:
 *         description: SOP créée avec succès
 *       400:
 *         description: Paramètres manquants
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       500:
 *         description: Erreur interne du serveur
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    const hasPermission = await checkSopPermission(currentUser.id, 'create');
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const data = await request.json();
    const { accessGroupIds, author, ...sopData } = data;
    
    // Vérifier que les groupes d'accès sont fournis
    if (!accessGroupIds || !Array.isArray(accessGroupIds) || accessGroupIds.length === 0) {
      return NextResponse.json({ error: 'Au moins un groupe d\'accès doit être sélectionné' }, { status: 400 });
    }

    // Vérifier que tous les groupes d'accès existent
    const accessGroups = await prisma.accessGroup.findMany({
      where: { id: { in: accessGroupIds } }
    });

    if (accessGroups.length !== accessGroupIds.length) {
      return NextResponse.json({ error: 'Un ou plusieurs groupes d\'accès sont introuvables' }, { status: 404 });
    }
    
    // Générer un ID unique pour la SOP
    const id = 'sop-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex');
    
    // Convertir la priorité en minuscules si elle est fournie
    if (sopData.priority) {
      sopData.priority = sopData.priority.toLowerCase();
    }
    
    // S'assurer que steps a une valeur par défaut si non fourni
    if (!sopData.steps) {
      sopData.steps = [];
    }
    
    // Créer la SOP
    const sop = await prisma.sop.create({ 
      data: { 
        ...sopData,
        id,
        authorId: currentUser.id,
        updatedAt: new Date()
      }, 
      include: { 
        user: true
      } 
    });

    // Assigner la SOP aux groupes d'accès spécifiés
    await Promise.all(accessGroupIds.map(groupId =>
      prisma.sopAccessGroup.create({
        data: {
          sopId: sop.id,
          accessGroupId: groupId
        }
      })
    ));

    // Récupérer la SOP avec les groupes assignés
    const sopWithGroups = await prisma.sop.findUnique({
      where: { id: sop.id },
      include: { 
        user: true,
        accessGroups: {
          include: {
            accessGroup: true
          }
        }
      }
    });
    
    return NextResponse.json({
      ...sopWithGroups,
      author: sopWithGroups?.user?.name || sopWithGroups?.authorId,
    });
  } catch (error: any) {
    console.error('Erreur lors de la création de la SOP:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      message: error.message 
    }, { status: 500 });
  }
} 