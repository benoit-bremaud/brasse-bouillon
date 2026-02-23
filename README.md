# Brasse Bouillon — Frontend (Expo / React Native)

Frontend mobile de Brasse Bouillon, construit avec React Native + Expo Router.

Ce README explique **pas à pas** :

- comment cloner le repo,
- comment installer toutes les dépendances,
- comment installer Expo Go,
- et comment voir l’application sur mobile via QR code.

---

## 1) Prérequis

### Outils obligatoires

- **Git**
- **Node.js 20 LTS**
- **npm** (installé avec Node)
- **Expo Go** sur téléphone :
  - iOS : App Store
  - Android : Google Play Store

### Vérifier les versions

```bash
node -v
npm -v
git --version
```

---

## 2) Cloner le repo frontend

### Option recommandée (HTTPS)

```bash
git clone https://github.com/benoit-bremaud/brasse-bouillon-frontend.git
cd brasse-bouillon-frontend
```

### Option SSH (si ta clé SSH GitHub est déjà configurée)

```bash
git clone git@github.com:benoit-bremaud/brasse-bouillon-frontend.git
cd brasse-bouillon-frontend
```

---

## 3) Installer les dépendances du projet

```bash
npm install
```

---

## 4) Configurer l’environnement (`.env`)

Créer ton fichier local à partir de l’exemple :

```bash
cp .env.example .env
```

Variables disponibles :

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_USE_DEMO_DATA=false
```

### Mode A — Démo (sans backend local)

Pour démarrer rapidement sans API live :

```bash
EXPO_PUBLIC_USE_DEMO_DATA=true
```

### Mode B — API live (backend local)

1. Lancer le backend `brasse-bouillon-backend` (port 3000).
2. Mettre `EXPO_PUBLIC_USE_DEMO_DATA=false`.
3. Remplacer `EXPO_PUBLIC_API_URL` par l’IP locale de ton PC (pas `localhost` si tu testes sur téléphone).

Exemple :

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.42:3000
EXPO_PUBLIC_USE_DEMO_DATA=false
```

Trouver ton IP locale :

- macOS : `ipconfig getifaddr en0`
- Linux : `hostname -I`
- Windows : `ipconfig` (prendre l’IPv4)

---

## 5) Installer Expo Go sur mobile

- **iPhone** : installer _Expo Go_ depuis l’App Store
- **Android** : installer _Expo Go_ depuis le Play Store

> Aucun package npm supplémentaire n’est nécessaire pour Expo Go côté frontend : c’est une app mobile à installer sur ton téléphone.

---

## 6) Lancer le frontend

### Recommandé pour mobile réel (LAN)

```bash
npm run start:lan
```

### Mode standard

```bash
npm run start
```

### Fallback réseau (si LAN bloqué)

```bash
npx expo start --tunnel
```

---

## 7) Voir l’application sur mobile (Expo Go + QR code)

1. Vérifier que le téléphone et le PC sont sur le **même Wi-Fi**.
2. Lancer le projet (`npm run start:lan`).
3. Ouvrir **Expo Go** sur le téléphone.
4. Scanner le QR code affiché dans le terminal (ou dans l’onglet web Expo).

### Si le scan QR ne marche pas

- Dans Expo Go, utiliser **Enter URL manually**
- Copier/coller l’URL `exp://...` affichée par Expo dans le terminal

---

## 8) Lancer sur émulateur / simulateur

### Android Emulator

```bash
npm run android
```

### iOS Simulator (macOS uniquement + Xcode)

```bash
npm run ios
```

### Web

```bash
npm run web
```

---

## 9) Scripts utiles

```bash
npm run start        # Expo dev server
npm run start:lan    # Expo en LAN (mobile réel)
npm run android      # Ouvrir Android emulator
npm run ios          # Ouvrir iOS simulator (macOS)
npm run web          # Version web
npm test             # Tests unitaires/intégration
npm run ci:check     # Lint + typecheck + format check
```

---

## 10) Dépannage (problèmes fréquents)

### A) QR scanné mais impossible d’ouvrir l’app

- Vérifier que téléphone + PC sont sur le même réseau
- Essayer `npx expo start --tunnel`
- Désactiver temporairement VPN/proxy/firewall strict

### B) L’app s’ouvre mais les appels API échouent

- Ne pas utiliser `localhost` dans `EXPO_PUBLIC_API_URL` pour un test sur téléphone
- Utiliser l’IP LAN de la machine backend (`http://<ip-locale>:3000`)
- Vérifier que le backend tourne bien sur le port 3000

### C) Expo Go ne scanne pas le QR

- Utiliser la saisie manuelle de l’URL `exp://...`
- Tester depuis l’onglet web Expo si le QR terminal est illisible

### D) Metro cache / comportement incohérent

```bash
npx expo start -c
```

---

## 11) Architecture (résumé)

```text
src/
  core/
    auth/
    config/
    data/
    http/
    theme/
    ui/
  features/
    <feature>/
      domain/
      data/
      application/
      presentation/
app/
  # Expo Router (file-based routing)
```

Les routes `app/` délèguent aux écrans `src/features/*/presentation`.

---

## 12) Notes API

Les réponses backend sont encapsulées :

```json
{ "success": true, "statusCode": 200, "message": "...", "data": {} }
```

Le client HTTP frontend dépaquette automatiquement `data`.
