# 📦 Structure Complète du Projet

## 🎯 Organisation des Dossiers

```
site d'E-commerce/
│
├── 📁 backend/                    # API Express.js + MongoDB
│   ├── 📁 models/
│   │   ├── User.js               # Modèle utilisateur (Admin/Vendeur/Client)
│   │   ├── Shop.js               # Modèle boutique avec approval
│   │   ├── Product.js            # Modèle produit
│   │   └── Order.js              # Modèle commande + commission
│   ├── 📁 routes/
│   │   ├── auth.js               # POST register, login
│   │   ├── shop.js               # CRUD boutiques + approval (admin)
│   │   ├── products.js           # CRUD produits (vendeur)
│   │   ├── order.js              # Création commande + 5% commission
│   │   └── users.js              # List users (admin)
│   ├── 📁 middleware/
│   │   └── auth.js               # Vérification JWT + roles
│   ├── server.js                 # Express app + MongoDB connexion
│   ├── seedAdmin.js              # Script pour créer admin initial
│   ├── package.json
│   ├── .env.example
│   ├── .env                       # À créer localement
│   └── README.md
│
├── 📁 frontend/                   # React + Vite
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── Header.jsx        # Navigation + user info + logout
│   │   │   ├── Header.css        # Gradient, responsive navbar
│   │   │   ├── Footer.jsx        # Footer avec liens
│   │   │   └── Footer.css
│   │   ├── 📁 pages/
│   │   │   ├── Home.jsx          # Accueil premium avec features
│   │   │   ├── Home.css          # Hero + cards animées
│   │   │   ├── Login.jsx         # Connexion JWT
│   │   │   ├── Register.jsx      # Inscription (Client/Vendeur)
│   │   │   ├── Auth.css          # Forme connexion/inscription
│   │   │   ├── Shop.jsx          # List boutiques approuvées
│   │   │   ├── Shop.css          # Cards boutiques
│   │   │   ├── VendorDashboard.jsx  # Créer boutique/produits/commandes
│   │   │   ├── AdminDashboard.jsx   # Gestion complète admin
│   │   │   └── Dashboard.css     # Tables, stats, tabs
│   │   ├── 📁 services/
│   │   │   └── api.js            # Axios client + tous les endpoints
│   │   ├── 📁 utils/
│   │   │   └── auth.js           # authUtils (token, user, role checks)
│   │   ├── App.jsx               # Routing principal + PrivateRoute
│   │   ├── main.jsx              # React entry point
│   │   └── index.css             # Variables CSS + reset global
│   ├── index.html                # Template HTML
│   ├── vite.config.js            # Config Vite + proxy
│   ├── package.json
│   ├── .env.example
│   ├── .env.local                # À créer localement
│   └── README.md
│
├── README.md                      # Guide complet (tech, déploiement)
├── QUICK_START.md                 # Démarrage rapide local
└── (Anciens fichiers HTML - à supprimer)
    ├── e-commerce.html
    ├── login.html
    ├── page_administrator.html
    ├── vendor_dashboard.html
    └── style*.css
```

## 🔗 Architecture Complète

### Communication Backend ↔ Frontend

```
FRONTEND (React)
├── services/api.js (Axios)
│   └── authHeader() ← JWT Token
│       └── /api/auth/login → { token, user }
│       └── /api/auth/register → { message }
│
├── /api/shops
│   ├── GET → Liste boutiques
│   ├── POST → Créer (vendeur)
│   ├── GET /pending → En attente (admin)
│   ├── PUT /:id/approve → Approuver (admin)
│   └── DELETE /:id → Supprimer (admin)
│
├── /api/products
│   ├── POST → Créer (vendeur)
│   ├── GET /my → Mes produits
│   ├── GET /shop/:shopId → Par boutique
│   ├── PUT /:id → Modifier
│   └── DELETE /:id → Supprimer
│
└── /api/orders
    ├── POST → Créer (client) + calcul 5%
    ├── GET /vendor → Pour mes boutiques
    ├── GET /admin → Toutes + totalCommission
    └── User auth: ← JWT Middleware

BACKEND (Express + MongoDB)
```

## 🔐 Flux Authentification

```
1. Utilisateur → POST /api/auth/register
   ↓
   Backend: Hash password, créé User (admin/vendeur/client)
   ↓
   Réponse: { message: "Inscrit" }

2. Utilisateur → POST /api/auth/login
   ↓
   Backend: Vérifie credentials, crée JWT
   ↓
   Réponse: { token: "jwt_here", user: { id, name, email, role } }

3. Frontend localStorage.setItem('token', token)
   ↓
   Axios interceptor ajoute: Authorization: Bearer token
   
4. Backend middleware vérifie token JWT
   ↓
   req.user = { id, role } passé aux routes
```

## 👥 Rôles & Permissions

### Admin (admin@example.com / admin123)
✅ Voir toutes les boutiques
✅ Approuver/Rejeter demandes vendeur
✅ Supprimer boutiques
✅ Voir tous utilisateurs
✅ Voir toutes commandes
✅ Voir commissions totales (5%)

### Vendeur
✅ Créer une boutique (en attente)
✅ Attendre approbation admin
✅ Ajouter produits (si approuvé)
✅ Voir ses commandes
✅ Voir ses commissions par commande

### Client
✅ Voir boutiques approuvées
✅ Ajouter produits au panier (futur)
✅ Passer commandes
❌ Pas accès dashboards

## 📊 Modèles Données

### User
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "admin" | "vendeur" | "client",
  createdAt: Date,
  updatedAt: Date
}
```

### Shop
```javascript
{
  _id: ObjectId,
  name: String,
  owner: ObjectId (→ User),
  isApproved: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Product
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  shop: ObjectId (→ Shop),
  createdBy: ObjectId (→ User),
  stock: Number,
  image: String (URL),
  createdAt: Date,
  updatedAt: Date
}
```

### Order
```javascript
{
  _id: ObjectId,
  items: [{
    product: String,
    quantity: Number,
    price: Number
  }],
  total: Number,
  user: ObjectId (→ User / client),
  shop: ObjectId (→ Shop),
  commission: Number (5% du total),
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 Design & Thème

- **Couleur primaire**: #6366f1 (Indigo)
- **Couleur secondaire**: #ec4899 (Rose)
- **Succès**: #10b981 (Vert)
- **Danger**: #ef4444 (Rouge)
- **Font**: Segoe UI, Tahoma, Geneva
- **Responsive**: Mobile-first (768px, 1200px breakpoints)

## 🚀 Déploiement Render

### Backend URL: https://backend-name.onrender.com
- Variables: MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASS
- Command: `node server.js`

### Frontend URL: https://frontend-name.onrender.com
- Build: `npm run build`
- Publish: `dist/`
- VITE_API_URL: https://backend-name.onrender.com

## ✅ Checklist Final

- [x] Backend structuré avec Express + MongoDB
- [x] Routes protégées JWT
- [x] Modèles Mongoose (User/Shop/Product/Order)
- [x] Admin panel (approval, users, commissions)
- [x] Vendor dashboard (create shop, products, orders)
- [x] Client shop (voir boutiques approuvées)
- [x] Auth pages (login, register)
- [x] React + Vite setup
- [x] Routing avec protection
- [x] Axios client centralisé
- [x] Design professionnel
- [x] Responsive mobile
- [x] .env configuration
- [x] Documentation complète

## 📝 Prochaines Étapes (Optionnel)

- [ ] Panier shopping client
- [ ] Système de paiement intégré
- [ ] Notifications email
- [ ] Reviews/Ratings
- [ ] Système de recherche
- [ ] Filtres avancés
- [ ] Dashboard vendeur: Statistiques ventes
- [ ] Export données CSV
