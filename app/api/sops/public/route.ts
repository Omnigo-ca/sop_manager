import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

/**
 * @swagger
 * /api/sops/public:
 *   get:
 *     summary: Récupère toutes les procédures publiques
 *     tags:
 *       - Public SOPs
 *     responses:
 *       200:
 *         description: Liste des procédures publiques récupérée avec succès
 *       500:
 *         description: Erreur interne du serveur
 */
export async function GET(request: NextRequest) {
  try {
    // Récupérer le groupe "Procédures Publiques"
    const publicGroup = await prisma.accessGroup.findFirst({
      where: { name: "Procédures Publiques" },
    });

    if (!publicGroup) {
      return NextResponse.json([]);
    }

    // Récupérer toutes les SOPs assignées au groupe public
    const publicSops = await prisma.sop.findMany({
      where: {
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
      orderBy: [
        { updatedAt: "desc" },
        { createdAt: "desc" }
      ],
    });

    return NextResponse.json(publicSops);
  } catch (error) {
    console.error("[PUBLIC_SOPS_GET]", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
} 