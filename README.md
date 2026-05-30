# E-Commerce Pro - Guide Complet

## 📋 Architecture

```
site d'E-commerce/
├── backend/          # Express.js + MongoDB
│   ├── models/       # Schemas MongoDB
│   ├── routes/       # Routes API
│   ├── middleware/   # Auth middleware
│   ├── server.js     # Serveur principal
│   ├── seedAdmin.js  # Script de seed
│   └── .env          # Variables d'environnement
└── frontend/         # React + Vite
    ├── src/
    │   ├── components/    # Composants réutilisables
    │   ├── pages/         # Pages principales
    │   ├── services/      # API client
    │   ├── utils/         # Utilitaires
    │   ├── App.jsx        # Routage
    │   └── main.jsx       # Point d'entrée
    ├── index.html
    ├── vite.config.js
    └── .env.local
```

## 🚀 Démarrage Local

### 1. Backend (Port 5000)

```bash
cd backend
npm install
# Créer un fichier .env avec les variables (voir .env.example)
node seedAdmin.js          # Créer admin@example.com / admin123
npm run dev                 # Démarrer avec nodemon
```

### 2. Frontend (Port 3000)

```bash
cd frontend
npm install
# Créer .env.local (voir .env.example)
npm run dev
```

Puis accédez à `http://localhost:3000`

---

## 🔐 Authentification

### Rôles disponibles :

1. **Admin** (admin@example.com / admin123)
   - Voir toutes les boutiques
   - Approuver/Refuser les demandes de vendeur
   - Supprimer les boutiques
   - Voir tous les utilisateurs
   - Voir les commandes et commissions (5%)

2. **Vendeur**
   - Créer une boutique
   - Ajouter des produits
   - Voir les commandes reçues
   - Suivre les commissions

3. **Client**
   - Voir les boutiques approuvées
   - Acheter des produits
   - Passer des commandes

---

## 🌐 Variables d'Environnement

### Backend (.env)

```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecommerce
JWT_SECRET=your_secret_key_here
ADMIN_EMAIL=admin@example.com
ADMIN_PASS=admin123
PORT=5000
NODE_ENV=development
```

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:5000
```

---

## 📦 Déploiement sur Render

### Backend

1. Push le code sur GitHub
2. Allez sur [render.com](https://render.com)
3. Créez un **New Web Service**
4. Sélectionnez votre repo et branche `backend`
5. Runtime: **Node**
6. Build command: `npm install`
7. Start command: `node server.js`
8. Variables d'environnement:
   - `MONGO_URI` (MongoDB Atlas URI)
   - `JWT_SECRET` (clé secrète forte)
   - `ADMIN_EMAIL` et `ADMIN_PASS`
   - `NODE_ENV=production`

### Frontend

1. Créez un **New Static Site**
2. Sélectionnez votre repo et branche `frontend`
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Définir `VITE_API_URL` comme l'URL du backend Render

---

## 📡 Endpoints API Principaux

### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Shops
- `POST /api/shops` - Créer boutique
- `GET /api/shops` - Lister boutiques
- `GET /api/shops/pending` - Boutiques en attente (admin)
- `PUT /api/shops/:id/approve` - Approuver (admin)
- `DELETE /api/shops/:id` - Supprimer (admin)

### Products
- `POST /api/products` - Créer produit
- `GET /api/products/my` - Mes produits
- `GET /api/products/shop/:shopId` - Produits d'une boutique
- `PUT /api/products/:id` - Modifier produit
- `DELETE /api/products/:id` - Supprimer produit

### Orders
- `POST /api/orders` - Créer commande
- `GET /api/orders/vendor` - Commandes reçues (vendeur)
- `GET /api/orders/admin` - Toutes commandes (admin)

### Users
- `GET /api/users` - Lister utilisateurs (admin)

---

## 💡 Flux Complet

1. **Inscription** → Client s'inscrit comme Client ou Vendeur
2. **Vendeur crée boutique** → Demande en attente d'approbation
3. **Admin approuve** → Boutique devient active
4. **Vendeur crée produits** → Dans sa boutique approuvée
5. **Client achète** → Crée une commande, 5% de commission au plateforme
6. **Admin voit commissions** → Suivi des revenus

---

## 🎨 Design

- **Couleurs principales**: Indigo (#6366f1) et Rose (#ec4899)
- **Responsive**: Mobile-first design
- **Animations**: Transitions fluides et feedback utilisateur
- **Accessibilité**: WCAG compliant

---

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB (Mongoose)
- JWT pour l'auth
- bcryptjs pour les mots de passe

**Frontend:**
- React 18
- React Router v6
- Axios
- CSS3

---

## ❓ FAQ

**Q: Comment créer un nouvel utilisateur admin?**
A: Modifiez `backend/seedAdmin.js` et exécutez `node seedAdmin.js`

**Q: La commission est de combien?**
A: 5% sur le total de chaque commande

**Q: Puis-je modifier les rôles existants?**
A: Les rôles sont: admin, vendeur, client. Changez les énums dans les modèles si nécessaire.

---

## 📝 Licence

Propriétaire. Tous droits réservés 2026.
