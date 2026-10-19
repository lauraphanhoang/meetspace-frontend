
# MeetSpace — Frontend

MeetSpace est une application web de réservation de salles, développée dans le cadre de mon projet de certification RNCP 41133 — Concepteur Développeur d'Applications.

Ce dépôt contient le frontend de l'application, développé avec Next.js, React, TypeScript et Tailwind CSS.

Site déployé : https://meetspace-frontend-tan.vercel.app


## Technologies utilisées

- **Next.js 16.2.12** — Framework React avec App Router
- **React 19.2.4** — Développement des interfaces
- **TypeScript 5** — Typage du code
- **Tailwind CSS 4** — Mise en forme et responsive design
- **Lucide React** — Icônes de l'interface
- **ESLint 9** — Analyse statique du code
- **Vercel** — Hébergement du frontend


## Fonctionnalités

### Authentification
- Inscription et connexion
- Déconnexion
- Redirection selon le rôle (USER ou ADMIN)
- Consultation et modification du profil
- Modification du mot de passe
- Gestion de l'avatar

### Espace utilisateur
- Tableau de bord personnel
- Consultation des salles disponibles
- Affichage des détails et des images des salles
- Création de réservations
- Vérification des disponibilités
- Modification et suppression de ses réservations
- Historique des réservations avec pagination

### Espace administrateur
- Tableau de bord avec statistiques
- Gestion des salles (création, modification, suppression)
- Gestion des images des salles
- Consultation des utilisateurs
- Consultation des réservations
- Recherche et pagination

L'administrateur dispose d'un accès en lecture seule aux réservations des utilisateurs.

## Architecture du projet

Le frontend utilise l'App Router de Next.js.

L'application comprend :
- Des pages organisées par routes
- Des composants réutilisables
- Des services pour communiquer avec l'API REST
- Des interfaces adaptées aux ordinateurs et aux mobiles
- Des Server Components et Client Components selon les besoins

## Installation

### Prérequis

- Node.js
- npm
- Backend MeetSpace fonctionnel

### Cloner le dépôt

```bash
git clone <URL_DU_DEPOT_FRONTEND>
cd meetspace-frontend
```

### Installer les dépendances

```bash
npm install
```

### Configurer les variables d'environnement

Créer un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Cette variable définit l'adresse de l'API backend.

### Lancer le projet

```bash
npm run dev
```

### Créer une version de production

```bash
npm run build
```

### Lancer la version de production

```bash
npm run start
```
## Communication avec le backend

Le frontend communique avec l'API NestJS à l'aide de requêtes HTTP.

Après connexion, un JWT est conservé dans le `localStorage` et transmis dans l'en-tête `Authorization` pour les requêtes nécessitant une authentification.

Les autorisations sont vérifiées côté backend.

## Déploiement

Le frontend est hébergé sur Vercel : https://meetspace-frontend-tan.vercel.app

Le dépôt GitHub est connecté à Vercel afin de permettre le déploiement des nouvelles versions.

La variable `NEXT_PUBLIC_API_URL` est configurée avec l'adresse publique du backend hébergé sur Render.

## Améliorations envisagées

- Synchronisation avec Google Calendar
- Notifications par e-mail
- Authentification Google ou Microsoft
- Amélioration de la gestion des sessions
- Renforcement de l'accessibilité

## Contexte du projet

Projet personnel réalisé dans le cadre de la préparation au titre RNCP 41133 — Concepteur Développeur d'Applications, niveau 6.
