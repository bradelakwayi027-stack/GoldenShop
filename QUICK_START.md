# 🚀 QUICK START GUIDE

## Démarrage Rapide (Local)

### Terminal 1 - Backend
```bash
cd backend
npm install
# Éditez .env (copie de .env.example)
node seedAdmin.js
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
# Vérifiez .env.local avec VITE_API_URL=http://localhost:5000
npm run dev
```

### Accès
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📊 Flux Utilisateur

### 1. Admin (admin@example.com / admin123)
```
Login → Admin Dashboard
  ├── Statistiques (boutiques, utilisateurs, commandes, commissions)
  ├── Approuver demandes de vendeurs
  ├── Gérer boutiques (supprimer)
  └── Voir tous les utilisateurs
```

### 2. Vendeur (Inscription → Vendeur)
```
Login → Vendor Dashboard
  ├── Créer boutique (en attente approbation)
  ├── Une fois approuvée: Ajouter produits
  ├── Voir commandes reçues
  └── Voir les commissions gagnées
```

### 3. Client (Inscription → Client)
```
Login → Shop
  ├── Voir boutiques approuvées
  ├── (Futur) Ajouter articles au panier
  ├── (Futur) Passer commandes
  └── Commission 5% est calculée automatiquement
```

## 🌍 Déploiement Render

### 1. Backend
```bash
# Sur Render Web Service
Build: npm install
Start: node server.js
Environment variables:
  MONGO_URI=mongodb+srv://...
  JWT_SECRET=strong_key
  ADMIN_EMAIL=admin@example.com
  ADMIN_PASS=admin123
```

### 2. Frontend
```bash
# Sur Render Static Site
Build: npm install && npm run build
Publish: dist
Environment: VITE_API_URL=https://backend-url.onrender.com
```

## 📋 Checklist

- [ ] Backend démarrage OK (port 5000)
- [ ] Frontend démarrage OK (port 3000)
- [ ] Admin login fonctionne
- [ ] Inscription vendeur fonctionne
- [ ] Création boutique fonctionne
- [ ] Approbation admin fonctionne
- [ ] Création produit fonctionne
- [ ] Commission 5% calculée

## 🐛 Troubleshooting

**Backend ne démarre pas?**
- Vérifiez `.env` (MONGO_URI)
- Vérifiez MongoDB est accessible

**Frontend ne parle pas au backend?**
- Vérifiez `.env.local` (VITE_API_URL)
- Vérifiez CORS activé dans backend

**Login échoue?**
- Vérifiez admin créé: `node seedAdmin.js`
- Vérifiez les credentials: admin@example.com / admin123

---

Tout est prêt! 🎉
