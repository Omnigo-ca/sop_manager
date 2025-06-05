import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, checkSopPermission } from "@/lib/auth.server";
import crypto from "crypto";

/**
 * @swagger
 * /api/sops/create-with-group:
 *   post:
 *     summary: Crée une nouvelle SOP avec assignation automatique à un groupe d'accès
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
 *               accessGroupId:
 *                 type: string
 *                 description: ID du groupe d'accès à assigner
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
    const { accessGroupId, ...sopData } = data;
    
    // Vérifier que le groupe d'accès est fourni
    if (!accessGroupId) {
      return NextResponse.json({ error: 'accessGroupId est requis' }, { status: 400 });
    }

    // Vérifier que le groupe d'accès existe
    const accessGroup = await prisma.accessGroup.findUnique({
      where: { id: accessGroupId }
    });

    if (!accessGroup) {
      return NextResponse.json({ error: 'Groupe d\'accès non trouvé' }, { status: 404 });
    }

    // Récupérer le groupe ADMINISTRATIVE pour l'assigner aussi
    const administrativeGroup = await prisma.accessGroup.findFirst({
      where: { type: 'ADMINISTRATIVE' }
    });

    if (!administrativeGroup) {
      return NextResponse.json({ error: 'Groupe ADMINISTRATIVE non trouvé' }, { status: 500 });
    }
    
    // Générer un ID unique pour la SOP
    const id = 'sop-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex');
    
    // Convertir la priorité en minuscules si elle est fournie
    if (sopData.priority) {
      sopData.priority = sopData.priority.toLowerCase();
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

    // Assigner la SOP au groupe spécifié ET au groupe ADMINISTRATIVE si différent
    const groupsToAssign = [accessGroupId];
    
    // Ajouter le groupe administratif seulement si ce n'est pas déjà le groupe spécifié
    if (accessGroupId !== administrativeGroup.id) {
      // Vérifier si c'est une procédure administrative
      const isAdministrative = (title, category) => {
        const titleLower = title?.toLowerCase() || '';
        const categoryLower = category?.toLowerCase() || '';
        return titleLower.includes('gestion') || 
               titleLower.includes('administration') || 
               titleLower.includes('audit') ||
               titleLower.includes('contrôle') ||
               titleLower.includes('formation') ||
               categoryLower.includes('admin') ||
               categoryLower.includes('rh') ||
               categoryLower.includes('formation');
      };
      
      if (isAdministrative(sopData.title, sopData.category)) {
        groupsToAssign.push(administrativeGroup.id);
      }
    }
    
    const uniqueGroups = [...new Set(groupsToAssign)]; // Éviter les doublons
    
    await Promise.all(uniqueGroups.map(groupId =>
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