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

## 2) Cloner le monorepo

Le mobile fait partie du monorepo `brasse-bouillon`. On clone le repo racine, pas ce package isolément.

```bash
# HTTPS
git clone https://github.com/benoit-bremaud/brasse-bouillon.git
cd brasse-bouillon

# ou SSH
git clone git@github.com:benoit-bremaud/brasse-bouillon.git
cd brasse-bouillon
```

Voir le [README racine](../../README.md) pour la vue d'ensemble (prérequis macOS/Linux, API, website, beer-encyclopedia).

---

## 3) Installer les dépendances du projet

Depuis la **racine du monorepo** (un seul `npm install` couvre tous les workspaces) :

```bash
npm install
```

---

## 4) Environment Variables

General workflow (templates, file precedence, secrets policy): see [root README § Environment Variables](../../README.md#environment-variables). This section lists the mobile-app-specific variables.

### Quick start

```bash
make setup                                       # from monorepo root (recommended)
# or
cp packages/mobile-app/.env.example packages/mobile-app/.env
```

`make setup` automatically detects your machine's LAN IP and writes `EXPO_PUBLIC_API_URL=http://<LAN-IP>:3000` into the `.env`, so Expo Go on a phone can reach the backend without further edits.

### Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EXPO_PUBLIC_API_URL` | ✅ | `http://localhost:3000` | URL of the NestJS backend (`packages/api`). Use `localhost` for an emulator on the same machine; use the LAN or Tailscale IP for Expo Go on a physical phone. |
| `EXPO_PUBLIC_BEER_ENCYCLOPEDIA_URL` | ✅ | `http://localhost:8000` | URL of the FastAPI beer-encyclopedia (`packages/beer-encyclopedia`). Used by the `/scan` flow as a fallback when the NestJS lookup returns 404 (ADR-0005). Must point to the same host as `EXPO_PUBLIC_API_URL` when testing from a physical phone. |
| `EXPO_PUBLIC_USE_DEMO_DATA` | No | `false` | When `true`, the build exposes a "Connexion démo" button on the login screen and lets typing demo credentials switch the app to mock data (`src/mocks/`). Set to `false` for builds shipped to real users. |

> Variables prefixed with `EXPO_PUBLIC_` are **embedded into the JavaScript bundle** sent to the device. Never put a secret in one — assume any value is publicly readable.

### Two modes for running the app

**Mode A — Demo (no backend required)** — set `EXPO_PUBLIC_USE_DEMO_DATA=true` in your `.env`. The app uses the deterministic mocks from `src/mocks/`. Useful for screenshots, App Store reviews, and quick UI work.

**Mode B — Live API (default)** — set `EXPO_PUBLIC_USE_DEMO_DATA=false` and start the backend from the monorepo root with `make dev-api` (or `npm run dev:api`). On a physical phone via Expo Go, replace `localhost` in `EXPO_PUBLIC_API_URL` with your machine's reachable address.

### Finding your machine's LAN IP

`make setup` does this for you. If you need it by hand:

| OS | Command |
|----|---------|
| macOS | `ipconfig getifaddr en0` (Wi-Fi) or `ipconfig getifaddr en1` (Ethernet) |
| Linux | `hostname -I \| awk '{print $1}'` |
| Windows | `ipconfig \| findstr IPv4` |

For the most reliable cross-network setup (corporate Wi-Fi with AP isolation, multiple networks, etc.), use a Tailscale IP instead — see the LAN troubleshooting section further below.

---

## 5) Installer Expo Go sur mobile

- **iPhone** : installer _Expo Go_ depuis l’App Store
- **Android** : installer _Expo Go_ depuis le Play Store

> Aucun package npm supplémentaire n’est nécessaire pour Expo Go côté frontend : c’est une app mobile à installer sur ton téléphone.

---

## 6) Lancer le frontend

Toutes les commandes ci-dessous se lancent **depuis la racine du monorepo**
(`brasse-bouillon/`), pas depuis `packages/mobile-app/`. C'est important : un
`npx expo start` lancé à la racine bundle le mauvais dossier, et un `npx expo
start` lancé à l'intérieur du package contourne les scripts du workspace.

### Chemin 1 — Wi-Fi commun sans isolation (recommandé)

```bash
npm run dev:mobile-app
```

Phone et laptop doivent être sur le même Wi-Fi _et_ ce Wi-Fi ne doit pas avoir
l'isolation client (certains réseaux pro/école l'activent). Scanner le QR code
affiché.

### Chemin 2 — Tunnel public via cloudflared (Wi-Fi isolé, hotspot, 4G)

Passe par Cloudflare, donc fonctionne quel que soit le réseau (contourne les
blocages carrier qui cassent ngrok en France).

Prérequis : installer [cloudflared](https://developers.cloudflare.com/cloudflared/downloads/).

```bash
# Debian / Ubuntu
sudo apt install cloudflared

# macOS
brew install cloudflared
```

Lancer en deux terminaux depuis la racine du monorepo :

```bash
# Terminal 1 — Metro (Expo)
npm run dev:mobile-app

# Terminal 2 — tunnel Cloudflare vers Metro (port 8081)
cloudflared tunnel --url http://localhost:8081
```

Cloudflare imprime une URL `https://xxxxx.trycloudflare.com`. Dans Expo Go,
choisir **Enter URL manually** et coller `exp://xxxxx.trycloudflare.com`.

### Chemin 3 — Android en USB (déterministe, pas de Wi-Fi)

```bash
# 1. Active USB debugging sur le phone et branche-le
adb reverse tcp:8081 tcp:8081
# 2. Dans un autre terminal
npm run dev:mobile-app
# 3. Dans Expo Go : Enter URL manually → exp://localhost:8081
```

---

## 7) Voir l'application sur mobile (Expo Go + QR code)

1. Choisir le chemin de lancement adapté à ton réseau (voir §6).
2. Ouvrir **Expo Go** sur le téléphone.
3. Soit scanner le QR code affiché dans le terminal (chemin 1), soit coller
   l'URL fournie dans **Enter URL manually** (chemins 2 et 3).

### Si rien ne charge et Expo Go reste bloqué sur le spinner

Dans l'ordre :

- Chemin 1 → passer au **chemin 2** (le Wi-Fi bloque probablement phone↔laptop).
- Erreur `Failed to download remote update` → même diagnostic : chemin 2.
- Erreur `TypeError: Cannot read properties of undefined (reading 'body')` sur
  `npx expo start --tunnel` → tu tournes sous Node 22 ; le monorepo pinne Node 20
  via `.nvmrc` (+ `engines` dans `package.json`). Vérifie avec `node --version`
  et aligne via `nvm use` à la racine.

---

## 8) Lancer sur émulateur / simulateur

### Android Emulator

> ⚠️ Nécessite Android Studio installé, un AVD configuré et un émulateur déjà lancé. `npm run android` (script `expo start --android`) ouvre Expo sur un appareil/émulateur déjà disponible.

```bash
npm run android
```

### iOS Simulator (macOS uniquement + Xcode)

> ⚠️ Nécessite Xcode **installé complètement** (y compris les _Command Line Tools_), ouvert au moins une fois et configuré.

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
