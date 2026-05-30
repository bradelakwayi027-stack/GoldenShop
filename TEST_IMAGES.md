# 🧪 Guide de Test - Affichage des Images

## ✅ Corrections Effectuées

### 1. Backend - Chemin d'Upload Absolu
**Fichier: `backend/routes/products.js`**
- ✅ Changement du chemin relatif `'uploads/'` en chemin absolu
- ✅ Les fichiers sont maintenant stockés correctement dans `backend/uploads/`

### 2. Frontend - Configuration FormData
**Fichier: `frontend/src/services/api.js`**
- ✅ Suppression du `Content-Type: application/json` pour les requêtes FormData
- ✅ Axios gère maintenant correctement le `multipart/form-data`

### 3. Proxy Vite ✅
**Fichier: `frontend/vite.config.js`**
- ✅ `/api` redirige vers `http://localhost:5000`
- ✅ `/uploads` redirige vers `http://localhost:5000`

---

## 🚀 Étapes de Test

### Étape 1: Redémarrer les serveurs

```bash
# Terminal 1: Arrêter le backend actuel (Ctrl+C)
# Puis relancer:
cd backend
npm run dev

# Terminal 2: Arrêter le frontend actuel (Ctrl+C)  
# Puis relancer:
cd frontend
npm run dev
```

### Étape 2: Se connecter comme Vendeur

1. Ouvrir http://localhost:3000
2. Créer un compte vendeur (ou se connecter si vous en avez un)
   - Email: `vendor@test.com`
   - Mot de passe: `vendor123`

### Étape 3: Créer une Boutique

1. Aller au "Tableau de Bord Vendeur"
2. Section "Ma Boutique":
   - Cliquer "Créer ma Boutique"
   - Remplir les informations
   - Cliquer "Créer ma Boutique"
3. **Attendre l'approbation par l'admin** (ou utiliser le compte admin)

### Étape 4: Ajouter un Produit avec Image

1. Dans le "Tableau de Bord Vendeur", section "Ajouter un Article":
   - **Nom**: `Test Produit`
   - **Catégorie**: `Électronique`
   - **Description**: `Test d'affichage d'image`
   - **Prix**: `99.99`
   - **Stock**: `10`
   - **Image**: ⭐ **Sélectionner une image locale**
   - Cliquer "Mettre en vente"

### Étape 5: Vérifier l'Affichage

1. Aller à la page "Catalogue" / "Shop"
2. Rechercher le produit créé
3. **L'image doit s'afficher normalement** (pas de carreau)

---

## 🔍 Dépannage

### Si l'image s'affiche toujours en carreau:

#### 1. Vérifier que les fichiers sont uploadés
```bash
# Dans le terminal, vérifier le dossier uploads:
Get-ChildItem "backend/uploads" -Force
```

Si vide → Le problème vient de l'upload

#### 2. Vérifier dans les DevTools du navigateur
Ouvrir F12 → Onglet **Network**:
- Chercher les requêtes vers `/uploads/...`
- Vérifier le statut HTTP (200 = succès, 404 = fichier manquant)
- Vérifier l'onglet **Console** pour les erreurs

#### 3. Tester l'URL directement
Dans la barre d'adresse, entrer:
```
http://localhost:3000/uploads/1714234567890.jpg
```

- ✅ Si l'image s'affiche → C'est un problème JavaScript
- ❌ Si erreur 404 → Les fichiers ne sont pas uploadés correctement

#### 4. Vérifier les logs du backend
Regarder les messages dans le terminal du backend lors de l'upload:
```
[multer] File uploaded: 1714234567890.jpg
```

---

## 📝 Configuration Finale Vérifiée

### Backend `server.js`:
```javascript
const uploadDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadDir));
```
✅ Sert les fichiers du dossier `uploads/`

### Backend `routes/products.js`:
```javascript
const uploadDir = path.join(__dirname, '../uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
```
✅ Sauvegarde les fichiers avec un chemin absolu

### Frontend `api.js`:
```javascript
if (config.data instanceof FormData) {
  delete config.headers['Content-Type'];
}
```
✅ Permet à Axios de gérer correctement multipart/form-data

### Frontend `vite.config.js`:
```javascript
proxy: {
  '/uploads': {
    target: 'http://localhost:5000',
    changeOrigin: true
  }
}
```
✅ Redirige `/uploads` vers le backend

---

## ✨ Résumé des Corrections

| Problème | Solution | Fichier |
|----------|----------|---------|
| Chemin upload relatif | Chemin absolu `path.join(__dirname, '../uploads')` | `backend/routes/products.js` |
| Content-Type bloque FormData | Supprimer Content-Type pour FormData | `frontend/src/services/api.js` |
| URLs images incomplètes | Utiliser `getImageUrl()` helper | `frontend/src/pages/Shop.jsx` |
| Pas de fallback images | Ajouter gestionnaire `onError` | `frontend/src/pages/*.jsx` |

Les images doivent maintenant s'afficher correctement! 🎉
