import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

/**
 * @swagger
 * /api/access-groups/{id}/sops:
 *   get:
 *     summary: Récupère un groupe d'accès avec ses SOP assignées
 *     tags:
 *       - Access Groups
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Groupe d'accès avec SOP récupéré avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Groupe non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const accessGroup = await prisma.accessGroup.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            sops: true,
            users: true
          }
        },
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        sops: {
          include: {
            sop: {
              select: {
                id: true,
                title: true,
                category: true,
                description: true,
                priority: true
              }
            }
          }
        }
      }
    });

    if (!accessGroup) {
      return new NextResponse("Groupe non trouvé", { status: 404 });
    }

    return NextResponse.json(accessGroup);
  } catch (error) {
    console.error("[ACCESS_GROUPS_SOPS_GET]", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
} 