# 📚 Documentation - SOP Manager

## 📋 Index de la documentation

### 🧪 **Tests et Couverture de Code**

| Document | Description | Niveau |
|----------|-------------|---------|
| 🚀 [**Guide de démarrage rapide**](QUICK_START_COVERAGE.md) | Couverture en 30 secondes | Débutant |
| 🌐 [**Accès distant SSH/Cursor**](COVERAGE_REMOTE_ACCESS.md) | Configuration pour développement SSH | Intermédiaire |
| 📊 [**Guide complet de la couverture**](TESTING_COVERAGE.md) | Documentation exhaustive des tests | Avancé |

### 🎯 **Liens rapides par cas d'usage**

#### 👤 **Vous êtes un développeur local**
- ➡️ [Guide complet de la couverture](TESTING_COVERAGE.md)

#### 🌐 **Vous utilisez Cursor via SSH**
- ➡️ [Guide de démarrage rapide](QUICK_START_COVERAGE.md) **(Recommandé)**
- ➡️ [Configuration détaillée SSH/Cursor](COVERAGE_REMOTE_ACCESS.md)

#### 🔧 **Vous configurez l'environnement de test**
- ➡️ [Guide complet de la couverture](TESTING_COVERAGE.md)

## 🚀 **Commandes essentielles**

```bash
# ⚡ Solution simple pour SSH/Cursor (Recommandée)
npm run coverage:dev

# 📊 Couverture locale
npm run test:coverage

# 🌐 Interface locale
npm run coverage:view
```

## 📝 **Structure de la documentation**

```
docs/
├── README.md                        # 📋 Ce fichier (index)
├── QUICK_START_COVERAGE.md          # 🚀 Démarrage rapide
├── COVERAGE_REMOTE_ACCESS.md        # 🌐 Accès distant SSH/Cursor
└── TESTING_COVERAGE.md              # 📊 Guide complet
```

---

💡 **Conseil** : Commencez par le [guide de démarrage rapide](QUICK_START_COVERAGE.md) si vous utilisez Cursor via SSH ! 