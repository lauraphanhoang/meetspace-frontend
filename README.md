
# MeetSpace — Frontend

MeetSpace est une application web full-stack de réservation de salles, développée dans le cadre de la préparation au titre **RNCP 41133 — Concepteur Développeur d'Applications (niveau 6)**.

Ce dépôt contient l'interface utilisateur de l'application, développée avec **Next.js, React et TypeScript**.

L'application permet aux utilisateurs de consulter les salles disponibles, de gérer leurs réservations et d'accéder à leur espace personnel. Une interface d'administration permet également de gérer les salles et de consulter les données de l'application.

## Application en ligne

- **Application MeetSpace :** https://meetspace-frontend-tan.vercel.app
- **API REST :** https://meetspace-backend-5ybo.onrender.com/api

Le frontend est hébergé sur Vercel et communique avec une API NestJS déployée sur Render.

## Technologies utilisées

- **Next.js 16 / React 19** — Framework frontend et interface utilisateur
- **TypeScript 5** — Typage statique
- **Tailwind CSS 4** — Mise en forme et responsive design
- **Lucide React** — Bibliothèque d'icônes
- **ESLint** — Analyse statique du code
- **Vercel** — Hébergement du frontend

## Fonctionnalités principales

### Authentification et profil
- Inscription et connexion
- Gestion de l'authentification avec JWT
- Consultation et modification du profil
- Modification du mot de passe et de l'avatar

### Espace utilisateur
- Consultation des salles et de leurs détails
- Création, modification et suppression des réservations
- Vérification des créneaux disponibles
- Consultation de l'historique des réservations
- Interface responsive adaptée aux différents écrans

### Espace administrateur
- Tableau de bord avec statistiques
- Gestion des salles et de leurs images
- Consultation des utilisateurs
- Consultation et recherche des réservations
- Pagination des listes

## Installation en local

### Prérequis

- Node.js et npm
- Backend MeetSpace accessible localement ou en ligne

### 1. Cloner le dépôt

```bash id="j1tm3k"
git clone https://github.com/lauraphanhoang/meetspace-frontend.git
cd meetspace-frontend
```

### 2. Installer les dépendances

```bash id="0svds7"
npm install
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env.local` à la racine du projet :

```env id="ggtwka"
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Cette variable définit l'adresse de l'API utilisée par le frontend.

### 4. Démarrer l'application

```bash id="2y3sd0"
npm run dev
```

L'application est accessible sur :

http://localhost:3000

## Commandes disponibles

```bash id="92rzq1"
npm run dev    # Démarrage en développement
npm run build  # Compilation pour la production
npm run start  # Démarrage de la version compilée
npm run lint   # Analyse du code avec ESLint
```

## Communication avec le backend

Le frontend communique avec l'API REST NestJS via des requêtes HTTP.

Les appels API sont centralisés dans des fichiers de services, notamment :

- `auth.service.ts` — Authentification et profil
- `reservations.service.ts` — Salles et réservations

Après connexion, le JWT est stocké dans le `localStorage` et transmis dans l'en-tête `Authorization` des requêtes nécessitant une authentification.

Les autorisations sont vérifiées côté backend.

## Déploiement

- **Frontend :** Vercel
- **Backend :** Render
- **Base de données :** Neon (PostgreSQL)
- **Images :** Cloudinary

En production, la variable d'environnement `NEXT_PUBLIC_API_URL` est configurée avec l'adresse du backend déployé :

```env id="kg6oln"
NEXT_PUBLIC_API_URL=https://meetspace-backend-5ybo.onrender.com
```

