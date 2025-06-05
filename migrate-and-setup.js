#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Démarrage de la migration vers les groupes d\'accès...\n');

try {
  // 1. Générer la migration Prisma
  console.log('📝 Génération de la migration Prisma...');
  execSync('npx prisma migrate dev --name add_access_groups', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // 2. Générer le client Prisma
  console.log('\n🔧 Génération du client Prisma...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // 3. Exécuter le script de migration des données
  console.log('\n📊 Migration des données vers les groupes d\'accès...');
  execSync('node migration-to-access-groups.js', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('\n✅ Migration terminée avec succès!');
  console.log('\n📋 Prochaines étapes:');
  console.log('  1. Vérifiez que l\'application fonctionne correctement');
  console.log('  2. Testez la nouvelle interface de gestion des groupes d\'accès');
  console.log('  3. Une fois confirmé, vous pourrez supprimer l\'ancien modèle SopAccess');
  
} catch (error) {
  console.error('❌ Erreur lors de la migration:', error.message);
  console.log('\n🔧 Solutions possibles:');
  console.log('  1. Vérifiez que la base de données est accessible');
  console.log('  2. Vérifiez les variables d\'environnement DATABASE_URL');
  console.log('  3. Redémarrez la base de données si nécessaire');
  process.exit(1);
} 