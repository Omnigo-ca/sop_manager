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
          accessGroups: {
            include: {
              accessGroup: {
                include: {
                  users: {
                    include: {
                      user: true
                    }
                  }
                }
              }
            }
          }
        },
      });
    } else {
      // Les autres utilisateurs voient uniquement les SOPs auxquelles ils ont accès via les groupes d'accès
      sops = await prisma.sop.findMany({
        where: {
          OR: [
            { authorId: currentUser.id }, // SOPs dont ils sont auteurs
            {
              accessGroups: {
                some: {
                  accessGroup: {
                    users: {
                      some: {
                        userId: currentUser.id // SOPs auxquelles ils ont accès via leur groupe
                      }
                    }
                  }
                }
              }
            }
          ]
        },
        include: {
          user: true,
          accessGroups: {
            include: {
              accessGroup: {
                include: {
                  users: {
                    include: {
                      user: true
                    }
                  }
                }
              }
            }
          }
        },
      });
    }

    // Transformer les données pour inclure les utilisateurs associés via les groupes
    const formattedSops = sops.map(sop => ({
      ...sop,
      author: sop.user?.name || sop.authorId,
      users: sop.accessGroups?.flatMap(groupLink => 
        groupLink.accessGroup?.users?.map(userGroup => ({
          id: userGroup.user.id,
          name: userGroup.user.name || 'Sans nom',
        })) || []
      ).filter((user, index, self) => 
        index === self.findIndex(u => u.id === user.id) // Supprimer les doublons
      ) || [],
      accessGroups: undefined, // Supprimer le champ accessGroups de la réponse
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
    
    // Récupérer les groupes d'accès pour assigner automatiquement
    const groups = await prisma.accessGroup.findMany();
    const internalGroup = groups.find(g => g.type === 'INTERNAL');
    const publicGroup = groups.find(g => g.type === 'PUBLIC');
    const administrativeGroup = groups.find(g => g.type === 'ADMINISTRATIVE');
    
    if (!internalGroup || !administrativeGroup) {
      return NextResponse.json({ error: 'Groupes d\'accès manquants' }, { status: 500 });
    }
    
    // Déterminer le groupe d'accès principal en fonction de la catégorie
    let primaryGroupId = internalGroup.id; // Par défaut, groupe interne
    
    if (rest.category && rest.category.toLowerCase().includes('public')) {
      primaryGroupId = publicGroup?.id || internalGroup.id;
    } else if (rest.category && rest.category.toLowerCase().includes('client')) {
      primaryGroupId = publicGroup?.id || internalGroup.id;
    }
    
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
    
    // Créer la SOP
    const sop = await prisma.sop.create({ 
      data: { 
        ...rest,
        id,
        authorId: currentUser.id,
        updatedAt: new Date()
      }, 
      include: { 
        user: true
      } 
    });
    
    // Assigner la SOP au groupe principal et au groupe administratif si applicable
    let groupsToAssign = [primaryGroupId];
    if (isAdministrative(rest.title, rest.category)) {
      groupsToAssign.push(administrativeGroup.id);
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
    console.error('Erreur lors de la création du SOP:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      message: error.message 
    }, { status: 500 });
  }
}