# ▶️ DÉMARRER LE PROJET

## 🔧 Prérequis

- Node.js v16+ installé
- MongoDB (cloud Atlas ou local)
- Git

## 📥 Setup Rapide (5 minutes)

### 1️⃣ Backend

```bash
# Ouvrir Terminal 1
cd backend

# Installer dépendances
npm install

# Créer fichier .env (copier .env.example)
cat > .env << EOF
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=my_super_secret_key_123
ADMIN_EMAIL=admin@example.com
ADMIN_PASS=admin123
PORT=5000
NODE_ENV=development
EOF

# Créer l'admin
node seedAdmin.js

# Démarrer le serveur
npm run dev

# ✅ Résultat attendu:
# Server is running on port 5000
# MongoDB connected
```

### 2️⃣ Frontend

```bash
# Ouvrir Terminal 2
cd frontend

# Installer dépendances
npm install

# Créer fichier .env.local
cat > .env.local << EOF
VITE_API_URL=http://localhost:5000
EOF

# Démarrer le serveur dev
npm run dev

# ✅ Résultat attendu:
# VITE v5.0.0 running at:
# Local: http://localhost:3000
```

## 🌐 Accès au Site

Ouvrir le navigateur:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000 (ou http://localhost:5000 → "Backend is running")

## 🔐 Comptes de Test

### Admin
- Email: `admin@example.com`
- Mot de passe: `admin123`

### Créer Vendeur (depuis le site)
- S'inscrire → Sélectionner "Vendeur"
- Ex: `vendor@test.com` / `vendor123`

### Créer Client (depuis le site)
- S'inscrire → Sélectionner "Client"
- Ex: `client@test.com` / `client123`

## 🧪 Tester le Flux Complet

1. **Admin approuve boutique**
   - Login admin
   - Aller sur `/admin` → Onglet "Demandes"
   - Approuver la boutique du vendeur

2. **Vendeur crée produit**
   - Login vendeur
   - Aller `/vendor` → Ajouter produit

3. **Client achète**
   - Login client
   - Aller `/shop` → Voir les boutiques approuvées

4. **Admin voit commissions**
   - Login admin
   - Onglet "Statistiques" → voir les commissions (5%)

## 📖 Documentation

- `README.md` - Guide complet
- `QUICK_START.md` - Démarrage rapide
- `ARCHITECTURE.md` - Organisation des dossiers
- `frontend/README.md` - Dev frontend
- `backend/README.md` - Dev backend

## 🐛 Troubleshooting

### ❌ "ECONNREFUSED" sur frontend
→ Vérifier que le backend tourne sur le port 5000

### ❌ "MongoDB connection error"
→ Vérifier MONGO_URI dans .env
→ Si MongoDB local: `mongod` doit tourner

### ❌ "Token invalid"
→ Vérifier JWT_SECRET même dans backend et frontend

### ❌ "404 sur les images produit"
→ Normal pour le moment (pas d'upload)

## 🎯 Prochaines Actions

1. ✅ Backend et frontend sont maintenant 100% séparés et organisés
2. ✅ Routes protégées et authentification JWT fonctionnelle
3. ✅ UI complète avec React + design premium
4. ✅ .env configuré pour chaque partie
5. ✅ Commission 5% calculée automatiquement

## 📦 Déploiement

Voir `README.md` section "Déploiement sur Render"

---

## 💪 C'est bon? Vous êtes prêt! 🚀

Enjoy!
