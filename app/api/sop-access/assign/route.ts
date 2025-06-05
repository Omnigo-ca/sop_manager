import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

/**
 * @swagger
 * /api/sop-access/assign:
 *   post:
 *     summary: Assigne des SOP à un groupe d'accès
 *     tags:
 *       - SOP Access
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accessGroupId:
 *                 type: string
 *               sopIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: SOP assignées avec succès
 *       400:
 *         description: Paramètres manquants
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Groupe d'accès non trouvé
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
    const { accessGroupId, sopIds } = body;

    if (!accessGroupId || !Array.isArray(sopIds)) {
      return new NextResponse("L'ID du groupe d'accès et la liste des SOP sont requis", { status: 400 });
    }

    // Vérifier que le groupe d'accès existe
    const accessGroup = await prisma.accessGroup.findUnique({
      where: { id: accessGroupId },
    });

    if (!accessGroup) {
      return new NextResponse("Groupe d'accès non trouvé", { status: 404 });
    }

    // Utiliser une transaction pour la cohérence des données
    await prisma.$transaction(async (tx) => {
      // Supprimer toutes les assignations actuelles du groupe
      await tx.sopAccessGroup.deleteMany({
        where: { accessGroupId },
      });

      // Créer les nouvelles assignations
      if (sopIds.length > 0) {
        await tx.sopAccessGroup.createMany({
          data: sopIds.map((sopId: string) => ({
            sopId,
            accessGroupId,
          })),
        });
      }
    });

    return NextResponse.json({ 
      message: "SOP assignées avec succès",
      assignedCount: sopIds.length 
    });
  } catch (error) {
    console.error("[SOP_ACCESS_ASSIGN]", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
} 