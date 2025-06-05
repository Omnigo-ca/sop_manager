import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

/**
 * @swagger
 * /api/access-groups/assign:
 *   post:
 *     summary: Assigne des utilisateurs à un groupe d'accès
 *     tags:
 *       - Access Groups
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accessGroupId:
 *                 type: string
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Utilisateurs assignés avec succès
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
    const { userId } = getAuth(request);

    if (!userId) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Non autorisé", { status: 403 });
    }

    const body = await request.json();
    const { accessGroupId, userIds } = body;

    if (!accessGroupId || !userIds || !Array.isArray(userIds)) {
      return new NextResponse("accessGroupId et userIds (tableau) sont requis", { status: 400 });
    }

    // Vérifier que le groupe d'accès existe
    const accessGroup = await prisma.accessGroup.findUnique({
      where: { id: accessGroupId },
    });

    if (!accessGroup) {
      return new NextResponse("Groupe d'accès non trouvé", { status: 404 });
    }

    // Supprimer toutes les assignations existantes pour ce groupe
    await prisma.userAccessGroup.deleteMany({
      where: { accessGroupId },
    });

    // Créer les nouvelles assignations
    const assignments = await Promise.all(
      userIds.map(async (targetUserId: string) => {
        return prisma.userAccessGroup.create({
          data: {
            accessGroupId,
            userId: targetUserId,
            assignedBy: userId
          },
        });
      })
    );

    return NextResponse.json({ 
      message: "Utilisateurs assignés avec succès",
      assignments: assignments.length 
    });
  } catch (error) {
    console.error("[ACCESS_GROUPS_ASSIGN]", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
}

/**
 * @swagger
 * /api/access-groups/assign:
 *   delete:
 *     summary: Retire un utilisateur d'un groupe d'accès
 *     tags:
 *       - Access Groups
 *     parameters:
 *       - in: query
 *         name: accessGroupId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur retiré avec succès
 *       400:
 *         description: Paramètres manquants
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       500:
 *         description: Erreur interne du serveur
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Non autorisé", { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const accessGroupId = searchParams.get('accessGroupId');
    const targetUserId = searchParams.get('userId');

    if (!accessGroupId || !targetUserId) {
      return new NextResponse("accessGroupId et userId sont requis", { status: 400 });
    }

    await prisma.userAccessGroup.delete({
      where: {
        userId_accessGroupId: {
          userId: targetUserId,
          accessGroupId: accessGroupId
        }
      }
    });

    return NextResponse.json({ message: "Utilisateur retiré avec succès" });
  } catch (error) {
    console.error("[ACCESS_GROUPS_REMOVE]", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
} 