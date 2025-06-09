#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Démarrage de la suite de tests complète...\n');

// Configuration des tests à exécuter
const testSuites = [
  {
    name: 'Tests unitaires - Utilitaires',
    pattern: 'components/**/*.test.ts',
    description: 'Tests des fonctions utilitaires (formatDate, filterSops, etc.)'
  },
  {
    name: 'Tests unitaires - Composants React',
    pattern: 'components/**/*.test.tsx',
    description: 'Tests des composants React (EmptyState, StatsOverview, etc.)'
  },
  {
    name: 'Tests d\'API',
    pattern: 'app/api/**/*.test.ts',
    description: 'Tests des endpoints API REST'
  },
  {
    name: 'Tests d\'intégration',
    pattern: '__tests__/integration/**/*.test.ts',
    description: 'Tests de bout en bout et workflows complets'
  }
];

// Fonction pour exécuter un test suite
function runTestSuite(suite) {
  return new Promise((resolve, reject) => {
    console.log(`📋 ${suite.name}`);
    console.log(`   ${suite.description}`);
    
    const jest = spawn('npx', ['jest', suite.pattern, '--verbose'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    jest.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${suite.name} - SUCCÈS\n`);
        resolve();
      } else {
        console.log(`❌ ${suite.name} - ÉCHEC\n`);
        reject(new Error(`Test suite failed with code ${code}`));
      }
    });

    jest.on('error', (error) => {
      console.error(`❌ Erreur lors de l'exécution de ${suite.name}:`, error);
      reject(error);
    });
  });
}

// Fonction principale
async function runAllTests() {
  let passed = 0;
  let failed = 0;

  for (const suite of testSuites) {
    try {
      await runTestSuite(suite);
      passed++;
    } catch (error) {
      failed++;
      console.error(`❌ Échec: ${error.message}`);
    }
  }

  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('='.repeat(50));
  console.log(`✅ Suites réussies: ${passed}`);
  console.log(`❌ Suites échouées: ${failed}`);
  console.log(`📈 Total: ${passed + failed}`);
  
  if (failed > 0) {
    console.log('\n⚠️  Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
    process.exit(1);
  } else {
    console.log('\n🎉 Tous les tests sont passés avec succès !');
    process.exit(0);
  }
}

// Fonction pour exécuter tous les tests en parallèle (plus rapide)
async function runAllTestsParallel() {
  console.log('⚡ Exécution en parallèle...\n');
  
  const testPromises = testSuites.map(async (suite) => {
    try {
      await runTestSuite(suite);
      return { suite: suite.name, status: 'success' };
    } catch (error) {
      return { suite: suite.name, status: 'failed', error: error.message };
    }
  });

  const results = await Promise.allSettled(testPromises);
  
  console.log('📊 RÉSUMÉ DES TESTS (PARALLÈLE)');
  console.log('='.repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  results.forEach((result, index) => {
    const suite = testSuites[index];
    if (result.status === 'fulfilled' && result.value.status === 'success') {
      console.log(`✅ ${suite.name}`);
      passed++;
    } else {
      console.log(`❌ ${suite.name}`);
      failed++;
    }
  });
  
  console.log(`\n✅ Suites réussies: ${passed}`);
  console.log(`❌ Suites échouées: ${failed}`);
  
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('\n🎉 Tous les tests sont passés avec succès !');
    process.exit(0);
  }
}

// Vérifier les arguments de ligne de commande
const args = process.argv.slice(2);
const parallel = args.includes('--parallel') || args.includes('-p');

if (parallel) {
  runAllTestsParallel().catch(console.error);
} else {
  runAllTests().catch(console.error);
} 