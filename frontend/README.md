# Frontend - React + Vite

## 🎨 Structure du Projet

```
src/
├── components/
│   ├── Header.jsx          # En-tête avec navigation
│   ├── Header.css
│   ├── Footer.jsx          # Pied de page
│   └── Footer.css
├── pages/
│   ├── Login.jsx           # Page connexion
│   ├── Register.jsx        # Page inscription
│   ├── Shop.jsx            # Boutiques (client)
│   ├── VendorDashboard.jsx # Dashboard vendeur
│   ├── AdminDashboard.jsx  # Dashboard admin
│   └── Auth.css / Shop.css / Dashboard.css
├── services/
│   └── api.js              # Client API avec Axios
├── utils/
│   └── auth.js             # Utilitaires authentification
├── App.jsx                 # Routage principal
├── main.jsx                # Point d'entrée
└── index.css               # Styles globaux
```

## 📦 Installation

```bash
npm install
```

## 🚀 Développement

```bash
npm run dev
```

Accédez à `http://localhost:3000`

## 🏗️ Build Production

```bash
npm run build
```

Générera un dossier `dist/` prêt pour déploiement.

## 📝 Configuration (.env.local)

```env
VITE_API_URL=http://localhost:5000
```

Sur production Render:
```env
VITE_API_URL=https://your-backend.onrender.com
```

## 🔑 Clés d'authentification

Les tokens JWT sont stockés dans `localStorage` et envoyés automatiquement via Axios interceptor.

Fonctions disponibles en `authUtils`:
- `getToken()` - Récupère le token
- `getUser()` - Récupère l'utilisateur courant
- `setAuth(token, user)` - Stocke le token et utilisateur
- `clearAuth()` - Déconnecte l'utilisateur
- `isLoggedIn()` - Vérifie si connecté
- `getRole()` - Récupère le rôle
- `isAdmin()`, `isVendor()`, `isClient()` - Vérifications de rôle

## 🎯 Pages Principales

### `/login` - Connexion
- Email/Mot de passe
- Redirection selon le rôle

### `/register` - Inscription
- Choix entre Client ou Vendeur
- Auto-connexion après inscription

### `/` ou `/shop` - Boutiques
- Liste des boutiques approuvées
- Accessible aux clients

### `/vendor` - Dashboard Vendeur
- Création de boutique
- Ajout de produits
- Suivi des commandes
- Rôle: `vendeur` requis

### `/admin` - Dashboard Admin
- Statistiques (boutiques, utilisateurs, commandes)
- Approbation des demandes
- Gestion des boutiques
- Liste des utilisateurs
- Suivi des commissions (5%)
- Rôle: `admin` requis

## 🔗 Appels API

Service centralisé dans `src/services/api.js`:

```javascript
import { authService, shopService, productService, orderService, userService } from './services/api';

// Authentification
await authService.register(name, email, password, role);
await authService.login(email, password);

// Boutiques
await shopService.create(name);
await shopService.getAll();
await shopService.getPending(); // admin
await shopService.approve(id);  // admin
await shopService.delete(id);   // admin

// Produits
await productService.create(payload);
await productService.getMyProducts();
await productService.getByShop(shopId);

// Commandes
await orderService.create(payload);
await orderService.getVendor();
await orderService.getAdmin();

// Utilisateurs
await userService.getAll();  // admin
```

## 🎨 Thème Couleurs

Variables CSS dans `index.css`:

```css
--primary: #6366f1      /* Indigo */
--secondary: #ec4899    /* Rose */
--success: #10b981      /* Vert */
--danger: #ef4444       /* Rouge */
--warning: #f59e0b      /* Orange */
```

## 📱 Responsive

Design mobile-first avec breakpoints:
- Tablet: 768px
- Desktop: 1200px+

## 🚀 Déploiement Render

1. Vérifiez que `vite.config.js` pointe vers le bon `VITE_API_URL`
2. Build: `npm run build`
3. Déployez le dossier `dist/` en tant que Static Site sur Render

---

## 📚 Ressources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [React Router](https://reactrouter.com)
- [Axios](https://axios-http.com)
