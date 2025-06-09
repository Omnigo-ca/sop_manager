#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const coveragePath = path.join(__dirname, '..', 'coverage', 'lcov-report');
const indexPath = path.join(coveragePath, 'index.html');

// Vérifier si le rapport de couverture existe
if (!fs.existsSync(indexPath)) {
  console.log('🔄 Génération du rapport de couverture...');
  try {
    execSync('npm run test:coverage', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Erreur lors de la génération du rapport de couverture');
    process.exit(1);
  }
}

console.log('🌐 Démarrage du serveur de couverture...');
console.log('📂 Dossier servi:', coveragePath);

// Vérifier si npx serve est disponible
try {
  execSync('npx serve --version', { stdio: 'ignore' });
} catch (error) {
  console.log('📦 Installation de serve...');
  execSync('npm install -g serve', { stdio: 'inherit' });
}

// Démarrer le serveur sur le port 3001 (ou autre port disponible)
const port = process.env.COVERAGE_PORT || 3001;

console.log(`\n🚀 Serveur de couverture démarré !`);
console.log(`📊 Rapport disponible sur : http://localhost:${port}`);
console.log(`🌍 Depuis Windows via Cursor : http://localhost:${port}`);
console.log(`\n💡 Astuce : Configurez le port forwarding ${port} dans Cursor\n`);

// Lancer le serveur
const serverProcess = spawn('npx', ['serve', coveragePath, '-l', port], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..')
});

// Gérer l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur de couverture...');
  serverProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  serverProcess.kill();
  process.exit(0);
}); 