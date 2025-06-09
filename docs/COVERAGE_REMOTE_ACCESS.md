# 🌐 Accès distant au rapport de couverture (SSH/Cursor)

## 🎯 Votre situation
- **Ubuntu/Linux** : Serveur de développement (où tourne le code)
- **Windows** : Poste client (avec Cursor + Firefox)
- **SSH** : Connexion via Cursor avec port forwarding

## 🚀 Solutions pour visualiser la couverture

### ✅ **Solution 1 : Commande tout-en-un (Recommandée)**

```bash
npm run coverage:remote
```

Cette commande :
1. ✅ Génère automatiquement le rapport de couverture
2. 🌐 Lance un serveur HTTP sur le port 3001
3. 📋 Affiche les instructions de connexion
4. 🔄 Reste active jusqu'à `Ctrl+C`

### ✅ **Solution 2 : Étapes séparées**

```bash
# 1. Générer la couverture
npm run test:coverage

# 2. Servir le rapport
npm run coverage:serve
```

## 🔧 Configuration Cursor

### 1. **Activer le port forwarding**

Dans Cursor, configurez le port forwarding pour le port **3001** :

**Option A : Via l'interface Cursor**
- Ouvrir la palette de commandes (`Ctrl+Shift+P`)
- Chercher "Port Forward" 
- Ajouter le port `3001`

**Option B : Via SSH config**
```bash
# Dans votre terminal SSH
ssh -L 3001:localhost:3001 user@your-ubuntu-server
```

### 2. **Accéder au rapport**

Une fois le serveur lancé et le port forwardé :

1. 🌐 Ouvrez Firefox sur Windows
2. 📍 Naviguez vers : `http://localhost:3001`
3. 📊 Explorez le rapport interactif !

## 🎮 Utilisation pratique

### Workflow de développement typique

```bash
# 1. Lancer les tests et servir la couverture
npm run coverage:remote

# 2. Dans Firefox Windows : http://localhost:3001
# 3. Développer et ajouter des tests
# 4. Relancer pour voir les améliorations
# Ctrl+C pour arrêter, puis relancer npm run coverage:remote
```

### Variables d'environnement

```bash
# Changer le port si 3001 est occupé
COVERAGE_PORT=3002 npm run coverage:remote
```

## 🔍 Interface du rapport

L'interface HTML interactive vous permet de :

### 📊 **Vue globale**
- Statistiques de couverture par métrique
- Codes couleur visuels (rouge/jaune/vert)
- Graphiques de progression

### 🗂️ **Navigation par fichiers**
- Arborescence complète du projet
- Pourcentages par fichier/dossier
- Filtrage et recherche

### 🎯 **Analyse détaillée**
- Code source ligne par ligne
- Branches non testées en surbrillance
- Compteurs d'exécution
- Liens vers les tests

### 📈 **Métriques disponibles**
- **Lines** : Lignes de code exécutées
- **Functions** : Fonctions appelées 
- **Branches** : Conditions testées (if/else)
- **Statements** : Instructions exécutées

## 🛠️ Résolution de problèmes

### Port déjà utilisé
```bash
# Vérifier quel processus utilise le port 3001
lsof -i :3001

# Utiliser un autre port
COVERAGE_PORT=3002 npm run coverage:remote
```

### Serveur non accessible
1. ✅ Vérifier que le serveur est bien lancé
2. ✅ Confirmer le port forwarding dans Cursor
3. ✅ Tester localement : `curl http://localhost:3001`

### Rapport non généré
```bash
# Forcer la régénération
rm -rf coverage/
npm run test:coverage
npm run coverage:serve
```

## 💡 Astuces pro

### **Raccourci développement**
Ajoutez un alias dans votre shell :
```bash
echo "alias cov='npm run coverage:remote'" >> ~/.bashrc
source ~/.bashrc

# Utilisation
cov
```

### **Surveillance continue**
```bash
# Terminal 1 : Tests en mode watch
npm run test:watch

# Terminal 2 : Serveur de couverture
npm run coverage:serve

# Régénérer la couverture quand nécessaire
npm run test:coverage
```

### **Bookmark Firefox**
Sauvegardez `http://localhost:3001` en favori pour un accès rapide !

---

🎉 **Profitez de votre interface de couverture professionnelle accessible depuis Windows !** 