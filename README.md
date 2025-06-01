<div align="center">

# 🏦 EBank Client Angular

![Angular](https://img.shields.io/badge/Angular-18.0.1-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4.2-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38B2AC)
![Chart.js](https://img.shields.io/badge/Chart.js-4.4.1-pink)

**Une interface utilisateur moderne pour la gestion bancaire**

</div>

## 📋 Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Structure du Projet](#structure-du-projet)
- [API Backend](#api-backend)
- [Sécurité](#sécurité)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [Contribuer](#contribuer)

## 🌟 Vue d'ensemble

EBank Client Angular est une application frontale moderne développée avec Angular 18 qui fournit une interface utilisateur pour un système de gestion bancaire. Cette application permet aux utilisateurs de gérer leurs comptes bancaires, effectuer des transactions, visualiser l'historique des opérations et gérer leurs informations personnelles.

Le client communique avec un backend Spring Boot sécurisé via JWT, offrant une expérience utilisateur fluide et sécurisée pour les opérations bancaires.

## 💼 Fonctionnalités

- **Authentication sécurisée**
  - Login avec JWT
  - Protection des routes avec guards
  - Gestion des sessions utilisateur
  - Changement de mot de passe

- **Gestion des clients**
  - Liste des clients
  - Création et édition de profils clients
  - Visualisation détaillée des informations clients

- **Gestion des comptes**
  - Consultation des comptes bancaires
  - Création de nouveaux comptes
  - Visualisation des détails du compte
  - Opérations sur compte (dépôt, retrait, virement)

- **Suivi des transactions**
  - Historique des opérations
  - Filtrage et recherche d'opérations
  - Visualisation détaillée des transactions

- **Tableau de bord**
  - Affichage des statistiques et graphiques
  - Vue d'ensemble des activités récentes
  - Indicateurs de performance financière

## 🏗️ Architecture

L'application est construite selon une architecture modulaire avec une séparation claire des responsabilités :

- **Modules** : Organisation par fonctionnalités principales
- **Services** : Logique métier et communication avec l'API
- **Composants** : Éléments d'interface utilisateur réutilisables
- **Guards** : Protection des routes et contrôle d'accès
- **Intercepteurs** : Gestion des requêtes HTTP et des tokens JWT
- **Models** : Interfaces TypeScript pour la typographie stricte

## 🔧 Technologies

- **Framework** : Angular 18.0.1
- **Langage** : TypeScript 5.4.2
- **Style** : TailwindCSS 3.4.17
- **UI Components** : Angular Material 17
- **Graphiques** : Chart.js 4.4.1 avec ng2-charts 5.0.4
- **Authentification** : JWT avec jwt-decode 4.0.0
- **Réactivité** : RxJS 7.8.0
- **Tests** : Jasmine et Karma

## 🚀 Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-username/ebank-client-angular.git

# Accéder au répertoire du projet
cd ebank-client-angular

# Installer les dépendances
npm install
```

## ⚙️ Configuration

1. **Environnement de développement**

   Modifiez le fichier `src/environments/environment.ts` pour configurer l'URL de l'API et d'autres variables d'environnement :

   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:8080/api'
   };
   ```

2. **Environnement de production**

   Pour la production, mettez à jour `src/environments/environment.prod.ts`.

## 🖥️ Utilisation

### Développement

```bash
# Démarrer le serveur de développement
ng serve

# Accéder à l'application
# Ouvrez votre navigateur à http://localhost:4200/
```

### Construction

```bash
# Build pour le développement
ng build

# Build pour la production
ng build --configuration production
```

### Tests

```bash
# Tests unitaires
ng test

# Tests end-to-end (nécessite un package supplémentaire)
ng e2e
```

## 📁 Structure du Projet

```
src/
├── app/                      # Code source de l'application
│   ├── accounts/             # Composants de gestion des comptes
│   ├── components/           # Composants partagés
│   ├── config/               # Configuration
│   ├── customers/            # Gestion des clients
│   ├── dashboard/            # Tableau de bord principal
│   ├── guards/               # Authentication guards
│   ├── interceptors/         # Intercepteurs HTTP
│   ├── login/                # Authentification
│   ├── models/               # Interfaces et modèles de données
│   ├── services/             # Services partagés
│   └── shared/               # Modules et utilitaires partagés
├── assets/                   # Assets statiques
└── environments/             # Configuration par environnement
```

## 🔄 API Backend

Cette application frontend se connecte à un backend Spring Boot JWT (`spring-jwt`) qui expose les API RESTful suivantes :

- `/api/auth/*` - Endpoints d'authentification
- `/api/customers/*` - Gestion des clients
- `/api/accounts/*` - Gestion des comptes
- `/api/operations/*` - Opérations bancaires

## 🔒 Sécurité

- Authentification basée sur JWT
- Interception des requêtes HTTP pour ajouter des tokens d'authentification
- Protection des routes avec Angular Guards
- Validation des entrées utilisateur
- Gestion sécurisée des sessions

## 🛠️ Déploiement

Pour déployer l'application en production :

1. Construisez l'application avec `ng build --configuration production`
2. Le résultat de la construction se trouve dans le répertoire `dist/`
3. Déployez le contenu du répertoire `dist/` sur votre serveur web (Apache, Nginx, etc.)

## 🤝 Contribuer

1. Forkez le projet
2. Créez votre branche de fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add some amazing feature'`)
4. Poussez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

---

<div align="center">

**EBank Client Angular** - Développé avec ❤️ pour une expérience bancaire moderne

</div>
