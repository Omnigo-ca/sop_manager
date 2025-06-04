import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

/**
 * @swagger
 * /api/sop-access/assign:
 *   post:
 *     summary: Assigne l'accès à une SOP à une liste d'utilisateurs (remplace les accès existants)
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
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Associations mises à jour avec succès
 *       400:
 *         description: Paramètres manquants ou SOP non trouvée
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       500:
 *         description: Erreur interne du serveur
 */

export async function POST(request: Request) {
  try {
    const { userId } = getAuth(request);

    // Vérifier si l'utilisateur est connecté et est un admin
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
    const { sopId, userIds } = body;

    if (!sopId || !userIds) {
      return new NextResponse("sopId et userIds sont requis", { status: 400 });
    }

    // Vérifier si la SOP existe
    const existingSOP = await prisma.sop.findUnique({
      where: { id: sopId },
    });

    if (!existingSOP) {
      return new NextResponse("SOP non trouvée", { status: 404 });
    }

    // Supprimer toutes les associations existantes pour cette SOP
    await prisma.sopAccess.deleteMany({
      where: { sopId },
    });

    // Créer les nouvelles associations
    await Promise.all(
      userIds.map((userId: string) =>
        prisma.sopAccess.create({
          data: {
            sopId,
            userId,
          },
        })
      )
    );

    return new NextResponse("Associations mises à jour avec succès", { status: 200 });
  } catch (error) {
    console.error("[SOP_ACCESS_ASSIGN]", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
} 