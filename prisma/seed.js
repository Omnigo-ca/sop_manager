const { PrismaClient } = require('../lib/generated/prisma');
const prisma = new PrismaClient();
const defaultSops = require('../data/defaultSops.json');

async function main() {
  // Création des utilisateurs
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      id: 'user-admin',
      email: 'admin@example.com',
      name: 'Admin',
      role: 'ADMIN',
      updatedAt: new Date(),
    },
  });

  const author = await prisma.user.upsert({
    where: { email: 'author@example.com' },
    update: {},
    create: {
      id: 'user-author',
      email: 'author@example.com',
      name: 'Auteur',
      role: 'AUTHOR',
      updatedAt: new Date(),
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      id: 'user-user',
      email: 'user@example.com',
      name: 'Utilisateur',
      role: 'USER',
      updatedAt: new Date(),
    },
  });

  // Map des noms d'auteurs vers les IDs utilisateurs
  const authorMap = {
    'Admin': admin.id,
    'Auteur': author.id,
    'Utilisateur': user.id,
    'Sophie Martin': admin.id,
    'Thomas Dubois': author.id,
    'Marie Leroy': author.id,
    'Julien Rousseau': author.id,
    'Claire Moreau': author.id,
    'Antoine Bernard': author.id,
    'Sarah Petit': author.id,
    'Lucas Girard': author.id,
    'Emma Lefevre': author.id,
    'Vincent Moreau': author.id,
  };

  // Insertion de toutes les SOP par défaut
  for (const sop of defaultSops) {
    await prisma.sop.upsert({
      where: { id: sop.id },
      update: {},
      create: {
        id: sop.id,
        title: sop.title,
        description: sop.description,
        instructions: sop.instructions,
        category: sop.category,
        priority: sop.priority.toLowerCase(),
        tags: sop.tags,
        steps: sop.steps,
        authorId: authorMap[sop.author] || admin.id,
        createdAt: new Date(sop.createdAt),
        updatedAt: new Date(sop.updatedAt),
      },
    });
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 