# Backend (Express + MongoDB)

Pré-requis:

- Node.js
- MongoDB (URI dans `MONGO_URI`)

Installation:

```bash
cd backend
npm install
```

Démarrage en dev:

```bash
export MONGO_URI="your_mongo_uri"
export JWT_SECRET="a_secret"
node seedAdmin.js   # crée un admin si nécessaire
npm run dev
```

Sur Windows PowerShell, utilisez `setx` ou définissez les variables d'environnement en conséquence.

Endpoints utiles:

- `POST /api/auth/register` { name, email, password, role }
- `POST /api/auth/login` { email, password }
- `GET /api/shops` liste (admin voit tout)
- `POST /api/shops` créer boutique (vendeur)
- `GET /api/shops/pending` (admin)
- `PUT /api/shops/:id/approve` (admin)
- `DELETE /api/shops/:id` (admin)
- `POST /api/orders` créer commande

Pour déploiement sur Render, définissez les variables `MONGO_URI` et `JWT_SECRET` dans le dashboard et déployez `backend`.
