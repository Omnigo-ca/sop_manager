import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

/**
 * @swagger
 * /api/access-groups/{id}:
 *   put:
 *     summary: Modifie un groupe d'accès
 *     tags:
 *       - Access Groups
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Groupe d'accès modifié avec succès
 *       400:
 *         description: Paramètres manquants
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Groupe non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
export async function PUT(
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

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return new NextResponse("Le nom est requis", { status: 400 });
    }

    // Vérifier que le groupe existe
    const existingGroup = await prisma.accessGroup.findUnique({
      where: { id: params.id },
    });

    if (!existingGroup) {
      return new NextResponse("Groupe non trouvé", { status: 404 });
    }

    // Empêcher la modification du nom des groupes système "Procédures Internes" et "Procédures Publiques"
    const protectedGroups = ["Procédures Internes", "Procédures Publiques"];
    if (protectedGroups.includes(existingGroup.name) && name !== existingGroup.name) {
      return new NextResponse("Le nom de ce groupe système ne peut pas être modifié", { status: 403 });
    }

    const updatedGroup = await prisma.accessGroup.update({
      where: { id: params.id },
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(updatedGroup);
  } catch (error) {
    console.error("[ACCESS_GROUPS_PUT]", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
}

/**
 * @swagger
 * /api/access-groups/{id}:
 *   delete:
 *     summary: Supprime un groupe d'accès
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
 *         description: Groupe d'accès supprimé avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Groupe non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
export async function DELETE(
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

    // Vérifier que le groupe existe
    const existingGroup = await prisma.accessGroup.findUnique({
      where: { id: params.id },
    });

    if (!existingGroup) {
      return new NextResponse("Groupe non trouvé", { status: 404 });
    }

    // Empêcher la suppression des groupes système "Procédures Internes" et "Procédures Publiques"
    const protectedGroups = ["Procédures Internes", "Procédures Publiques"];
    if (protectedGroups.includes(existingGroup.name)) {
      return new NextResponse("Ce groupe système ne peut pas être supprimé", { status: 403 });
    }

    // Supprimer le groupe (les relations seront supprimées automatiquement grâce aux contraintes CASCADE)
    await prisma.accessGroup.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Groupe supprimé avec succès" });
  } catch (error) {
    console.error("[ACCESS_GROUPS_DELETE]", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
}

/**
 * @swagger
 * /api/access-groups/{id}:
 *   get:
 *     summary: Récupère un groupe d'accès spécifique avec ses SOP
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
 *         description: Groupe d'accès récupéré avec succès
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
    console.error("[ACCESS_GROUPS_GET_BY_ID]", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
} 