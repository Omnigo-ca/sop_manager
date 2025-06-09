# 📊 Couverture de Tests - Guide d'utilisation

## 🚀 Commandes disponibles

### Génération rapide
```bash
# Générer et voir le rapport
npm run test:coverage

# Ouvrir directement le rapport HTML dans le navigateur
npm run coverage:view
```

### Développement
```bash
# Tests en mode watch
npm run test:watch

# Servir la couverture sur http://localhost:3001
npm run test:coverage:serve
```

## 📁 Interface HTML Interactive

Le rapport HTML se trouve dans `coverage/lcov-report/index.html` et offre :

### 🎯 Vue d'ensemble
- **Statistiques globales** : lignes, branches, fonctions, déclarations
- **Graphiques visuels** avec codes couleur
- **Seuils de couverture** configurés

### 🔍 Navigation détaillée
- **Arborescence des fichiers** avec pourcentages
- **Code source annoté** ligne par ligne
- **Branches non testées** en surbrillance
- **Fonctions manquantes** identifiées

### 🎨 Codes couleur
- 🟢 **Vert** : Bien couvert (>80%)
- 🟡 **Jaune** : Moyennement couvert (50-80%)
- 🔴 **Rouge** : Peu couvert (<50%)

## ⚙️ Configuration des seuils

Les seuils sont définis dans `jest.config.js` :

```javascript
coverageThreshold: {
  global: {
    branches: 40,
    functions: 40, 
    lines: 50,
    statements: 50,
  }
}
```

## 📈 Bonnes pratiques

### 🎯 Prioriser les tests
1. **Logique métier** (composants SOP, API routes)
2. **Fonctions utilitaires** (lib/, hooks/)
3. **Composants UI critiques**

### 🚫 Exclure intelligemment
- Fichiers de configuration
- Types TypeScript uniquement
- Composants d'UI générique (shadcn/ui)
- Layouts complexes

### 📊 Interpréter les métriques

| Métrique | Description | Cible |
|----------|-------------|-------|
| **Lines** | Lignes de code exécutées | >50% |
| **Functions** | Fonctions appelées | >40% |
| **Branches** | Conditions testées (if/else) | >40% |
| **Statements** | Instructions exécutées | >50% |

## 🔧 Résolution de problèmes

### Seuils non atteints
```bash
# Identifier les fichiers problématiques
npm run test:coverage

# Ouvrir le rapport pour voir les détails
npm run coverage:view
```

### Fichiers manqués
Vérifier dans `jest.config.js` :
- `collectCoverageFrom` : inclusions
- `coveragePathIgnorePatterns` : exclusions

## 🌐 Intégrations externes

### CI/CD avec GitHub Actions
```yaml
- name: Test Coverage
  run: npm run test:coverage
  
- name: Upload to Codecov
  uses: codecov/codecov-action@v3
```

### Badge de couverture
Utilisez les fichiers générés :
- `coverage/lcov.info` pour Codecov
- `coverage/coverage-summary.json` pour les badges

## 📝 Exemples concrets

### Voir la couverture d'un composant
1. `npm run coverage:view`
2. Naviguer vers `components/sop-manager/`
3. Cliquer sur le fichier souhaité
4. Voir les lignes non testées en rouge

### Améliorer la couverture
1. Identifier les branches manquées
2. Ajouter des tests pour les cas edge
3. Re-générer le rapport
4. Vérifier l'amélioration

---

💡 **Astuce** : Utilisez `npm run coverage:view` après chaque session de test pour voir votre progression ! 