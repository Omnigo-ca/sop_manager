# 🚀 Guide rapide - Couverture de code (SSH/Cursor)

## ⚡ Démarrage en 30 secondes

### 1. Lancer le serveur de couverture
```bash
npm run coverage:dev
```

### 2. Configurer Cursor
- `Ctrl+Shift+P` → "Port Forward" 
- Ajouter le port `3001`

### 3. Ouvrir dans Firefox Windows
- Naviguer vers : `http://localhost:3001`
- Profiter de l'interface interactive ! 📊

## 🛠️ Commandes disponibles

| Commande | Description |
|----------|-------------|
| `npm run coverage:dev` | **Solution simple** - Génère et sert (sans seuils) |
| `npm run coverage:remote` | Solution complète avec gestion d'erreurs |
| `npm run test:coverage:no-threshold` | Génération seule (sans seuils) |
| `npm run coverage:serve` | Servir un rapport existant |

## 🔧 En cas de problème

### Port 3001 occupé ?
```bash
COVERAGE_PORT=3002 npm run coverage:dev
```

### Serveur ne répond pas ?
1. Vérifier le port forwarding dans Cursor
2. Tester localement : `curl http://localhost:3001`
3. Redémarrer : `Ctrl+C` puis relancer

### Rapport non généré ?
```bash
# Nettoyage et regénération
rm -rf coverage/
npm run coverage:dev
```

## 💡 Astuces

- **Bookmark** : Sauvegardez `http://localhost:3001` 
- **Raccourci** : `alias cov='npm run coverage:dev'`
- **Watch mode** : Utilisez `npm run test:watch` en parallèle

---

🎯 **Recommandation** : Utilisez `npm run coverage:dev` pour un démarrage simple et fiable ! 