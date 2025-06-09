#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const port = process.env.COVERAGE_PORT || 3001;

console.log('🧪 Génération du rapport de couverture...');

try {
  // Générer la couverture sans échec sur les seuils
  execSync('npm run test:coverage', { 
    stdio: 'inherit',
    // Ignorer les erreurs de seuils de couverture
    env: { ...process.env, SKIP_COVERAGE_THRESHOLD: 'true' }
  });
  
  console.log('✅ Rapport de couverture généré avec succès !');
} catch (error) {
  // Vérifier si c'est juste un problème de seuils
  const coveragePath = path.join(__dirname, '..', 'coverage', 'lcov-report', 'index.html');
  
  if (fs.existsSync(coveragePath)) {
    console.log('⚠️  Tests passés mais seuils de couverture non atteints');
    console.log('✅ Rapport de couverture tout de même disponible !');
  } else {
    console.error('❌ Erreur lors de la génération du rapport');
    console.error('Essayez: npm run test:coverage');
    process.exit(1);
  }
}

const coveragePath = path.join(__dirname, '..', 'coverage', 'lcov-report');
const indexPath = path.join(coveragePath, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('❌ Fichier de couverture non trouvé');
  console.error('📁 Chemin attendu:', indexPath);
  process.exit(1);
}

console.log('\n🌐 Démarrage du serveur de couverture...');

// Afficher les informations de connexion
console.log(`\n╭─────────────────────────────────────────────╮`);
console.log(`│           📊 RAPPORT DE COUVERTURE          │`);
console.log(`├─────────────────────────────────────────────┤`);
console.log(`│ 🌍 URL depuis Windows:                      │`);
console.log(`│    http://localhost:${port}                    │`);
console.log(`│                                             │`);
console.log(`│ 💡 Instructions Cursor:                     │`);
console.log(`│ 1. Port forwarding du port ${port}            │`);
console.log(`│ 2. Ouvrez l'URL ci-dessus dans Firefox     │`);
console.log(`│                                             │`);
console.log(`│ 🛑 Arrêt: Ctrl+C                           │`);
console.log(`╰─────────────────────────────────────────────╯\n`);

// Vérifier si serve est disponible
try {
  execSync('npx serve --version', { stdio: 'ignore' });
} catch (error) {
  console.log('📦 Installation de serve...');
  try {
    execSync('npm install -g serve', { stdio: 'inherit' });
  } catch (installError) {
    console.error('❌ Impossible d\'installer serve');
    console.log('💡 Essayez manuellement: npm install -g serve');
    process.exit(1);
  }
}

// Démarrer le serveur
console.log('🚀 Lancement du serveur...');

const serverProcess = spawn('npx', ['serve', coveragePath, '-l', port, '-s'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  cwd: path.join(__dirname, '..')
});

let serverReady = false;

serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Accepting connections') || output.includes('Local:')) {
    if (!serverReady) {
      console.log('✅ Serveur prêt ! Ouvrez http://localhost:' + port);
      serverReady = true;
    }
  }
});

serverProcess.stderr.on('data', (data) => {
  const error = data.toString();
  if (!error.includes('serve:')) { // Ignorer les messages de serve
    console.error(`Erreur serveur: ${error}`);
  }
});

// Afficher un message après quelques secondes si pas de confirmation
setTimeout(() => {
  if (!serverReady) {
    console.log('🌐 Serveur probablement prêt sur http://localhost:' + port);
  }
}, 3000);

// Gestion propre de l'arrêt
const cleanup = () => {
  console.log('\n🛑 Arrêt du serveur de couverture...');
  serverProcess.kill('SIGTERM');
  setTimeout(() => {
    process.exit(0);
  }, 1000);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Garder le script en vie
process.stdin.resume(); 