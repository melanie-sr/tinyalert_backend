## 📦 Installation

Assurez-vous d'avoir **Node.js** installé sur votre machine.  
Clonez le projet, allez dans le dossier 'frontend_web', puis installez les dépendances :

```bash
npm install
```

# Compléter le .env

--> Commande pour générer votre clé perso JWT : `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

## 🚀 Lancement

```bash
npm run dev
```

## Tests API 

### Organisation des tests

tests/auth/register.test.js -> teste l’inscription

tests/auth/login.test.js -> teste la connexion 

tests/auth/logout.test.js -> teste la déconnexion 

tests/user/getMe.test.js -> teste les tokens 

tests/user/updateProfile.test.js -> teste la mise à jour du profile 

tests/scores.test.js -> teste les scores des joueurs 

tests/setup/db.js → utilitaires de connexion/déconnexion MongoDB pour Jest

Chaque test :

- Connecte la DB (beforeAll)
- Vide les collections après chaque test (afterEach)
- Déconnecte la DB en fin de suite (afterAll)

### . env 

Avant de lancer les tests s'assurer que la bdd connecter est : maDB_test
```
MONGO_URI=lien/maDB_test
JWT_SECRET=mdpsecret
```

### Lancer les tests 

Pour lancer les tests globalement : 

``` npm run test```

Pour lancer un test en particulier (describe): 

``` npx jest -t "Nom du describe" ```