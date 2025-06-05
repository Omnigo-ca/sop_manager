import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

/**
 * @swagger
 * /api/access-groups:
 *   get:
 *     summary: Récupère tous les groupes d'accès
 *     tags:
 *       - Access Groups
 *     responses:
 *       200:
 *         description: Liste des groupes d'accès récupérée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       500:
 *         description: Erreur interne du serveur
 */
export async function GET(request: NextRequest) {
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

    const accessGroups = await prisma.accessGroup.findMany({
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
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(accessGroups);
  } catch (error) {
    console.error("[ACCESS_GROUPS_GET]", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
}

/**
 * @swagger
 * /api/access-groups:
 *   post:
 *     summary: Crée un nouveau groupe d'accès
 *     tags:
 *       - Access Groups
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Groupe d'accès créé avec succès
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
    const { name, description } = body;

    if (!name) {
      return new NextResponse("Le nom est requis", { status: 400 });
    }

    const accessGroup = await prisma.accessGroup.create({
      data: {
        name,
        description
      }
    });

    return NextResponse.json(accessGroup);
  } catch (error) {
    console.error("[ACCESS_GROUPS_POST]", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
} 