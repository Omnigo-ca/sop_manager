import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

/**
 * @swagger
 * /api/sops/public/{id}:
 *   get:
 *     summary: Récupère une procédure publique spécifique
 *     tags:
 *       - Public SOPs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Procédure publique récupérée avec succès
 *       403:
 *         description: Procédure non publique
 *       404:
 *         description: Procédure non trouvée
 *       500:
 *         description: Erreur interne du serveur
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Récupérer le groupe "Procédures Publiques"
    const publicGroup = await prisma.accessGroup.findFirst({
      where: { name: "Procédures Publiques" },
    });

    if (!publicGroup) {
      return new NextResponse("Groupe des procédures publiques non trouvé", { status: 404 });
    }

    // Vérifier que la SOP existe et qu'elle est dans le groupe public
    const sop = await prisma.sop.findFirst({
      where: {
        id: params.id,
        accessGroups: {
          some: {
            accessGroupId: publicGroup.id
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!sop) {
      return new NextResponse("Procédure non trouvée ou non publique", { status: 404 });
    }

    return NextResponse.json(sop);
  } catch (error) {
    console.error("[PUBLIC_SOP_GET]", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
} 