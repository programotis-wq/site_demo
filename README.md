# Dépanneur du Lac

Site web démo d'un dépanneur, avec un formulaire « Créer un profil » connecté à une base de données PostgreSQL. Il sert d'environnement de test à l'API de capture d'erreurs (dépôt `api-capture-erreurs`), qui valide les adresses saisies dans le formulaire.

## Technologies utilisées

- HTML, CSS et JavaScript (pages du site et formulaire)
- Node.js et Express (serveur du site, dossier `serveur-depanneur`)
- PostgreSQL (base de données)
- Geoapify (autocomplétion d'adresse dans le navigateur)
- `widget.js` de l'API de capture d'erreurs (validation de l'adresse)

## Fonctionnalités

- Site de plusieurs pages (accueil, boucherie, conserves, pains)
- En-tête commun chargé dynamiquement dans chaque page
- Formulaire « Créer un profil » avec autocomplétion d'adresse
- Enregistrement des profils dans PostgreSQL (route `POST /clients`)
- Intégration du widget de validation d'adresse de l'API de capture d'erreurs
- Référence anonyme (UUID) enregistrée avec chaque profil, pour retrouver une adresse signalée par l'API

## Utilisation

Le client remplit le formulaire « Créer un profil ». À l'envoi, le widget vérifie l'adresse auprès de l'API de capture d'erreurs. Si l'adresse est introuvable, une page de saisie manuelle s'affiche sous le formulaire sans effacer les autres champs. Le profil est ensuite enregistré dans la base de données avec une référence qui permet de relier le profil au signalement.

## Installation

Les fichiers nécessaires à l'installation et la procédure sont disponibles sur demande.

## Évolution

Le projet est en développement continu.

## Auteur


## Auteur

Sylvain Otis
Courriel : sylvainotis_11@hotmail.com
