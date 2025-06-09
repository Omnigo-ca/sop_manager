#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const port = process.env.COVERAGE_PORT || 3001;
const coveragePath = path.join(__dirname, '..', 'coverage', 'lcov-report');
const indexPath = path.join(coveragePath, 'index.html');

console.log('🧪 Génération du rapport de couverture (sans seuils)...\n');

try {
  // Générer la couverture sans seuils
  execSync('npm run test:coverage:no-threshold', { stdio: 'inherit' });
  console.log('\n✅ Rapport de couverture généré avec succès !');
} catch (error) {
  console.error('❌ Erreur lors de la génération du rapport');
  process.exit(1);
}

// Vérifier que le rapport existe
if (!fs.existsSync(indexPath)) {
  console.error('❌ Fichier de couverture non trouvé:', indexPath);
  process.exit(1);
}

// Afficher les informations
console.log('\n╭─────────────────────────────────────────────╮');
console.log('│           📊 RAPPORT DE COUVERTURE          │');
console.log('├─────────────────────────────────────────────┤');
console.log('│ 🌍 Accès depuis Windows (Cursor SSH):      │');
console.log(`│    http://localhost:${port}                    │`);
console.log('│                                             │');
console.log('│ 💡 Instructions:                            │');
console.log(`│ 1. Port forwarding ${port} dans Cursor        │`);
console.log('│ 2. Ouvrir l\'URL dans Firefox Windows       │');
console.log('│                                             │');
console.log('│ 🛑 Arrêt: Ctrl+C                           │');
console.log('╰─────────────────────────────────────────────╯\n');

console.log('🚀 Démarrage du serveur...');

// Démarrer le serveur
const serverProcess = spawn('npx', ['serve', coveragePath, '-l', port], {
  stdio: 'inherit'
});

// Gestion de l'arrêt
const cleanup = () => {
  console.log('\n🛑 Arrêt du serveur de couverture...');
  serverProcess.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

console.log(`✅ Serveur lancé ! Ouvrez http://localhost:${port}\n`); 