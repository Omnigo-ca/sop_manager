#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const coveragePath = path.join(__dirname, '..', 'coverage', 'lcov-report', 'index.html');

// Vérifier si le rapport de couverture existe
if (!fs.existsSync(coveragePath)) {
  console.log('🔄 Génération du rapport de couverture...');
  try {
    execSync('npm run test:coverage', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Erreur lors de la génération du rapport de couverture');
    process.exit(1);
  }
}

console.log('🌐 Ouverture du rapport de couverture...');
console.log(`📂 Fichier: ${coveragePath}`);

// Déterminer la commande d'ouverture selon l'OS
const platform = process.platform;
let openCommand;

if (platform === 'darwin') {
  openCommand = 'open';
} else if (platform === 'win32') {
  openCommand = 'start';
} else {
  openCommand = 'xdg-open';
}

try {
  execSync(`${openCommand} "${coveragePath}"`, { stdio: 'inherit' });
  console.log('✅ Rapport de couverture ouvert dans votre navigateur');
} catch (error) {
  console.log('📋 Copier ce chemin dans votre navigateur:');
  console.log(`file://${coveragePath}`);
} 