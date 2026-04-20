# Installer Brasse Bouillon sur un téléphone Android

Ce guide s'adresse aux membres de l'équipe qui veulent **tester l'app sur leur téléphone** sans toucher au code. Aucune compétence technique requise, juste suivre les étapes.

> 📱 **Pour l'instant : Android uniquement.** Une build iOS (TestFlight) viendra plus tard.

---

## 1. Récupérer l'APK

1. Ouvre depuis ton téléphone (ou ton laptop si tu préfères scanner un QR code) :
   ```
   https://expo.dev/accounts/beniot/projects/brasse-bouillon-mobile-app/builds
   ```
2. La première ligne correspond à la build la plus récente. Clique dessus.
3. Sur la page du build, tu trouves :
   - un gros bouton **Install** (direct sur Android Chrome),
   - un **QR code** (à scanner depuis ton phone si tu es passé par le laptop).

---

## 2. Installer l'APK sur le téléphone

1. Quand Chrome finit le téléchargement du `.apk`, Android te demande si tu autorises l'installation depuis une **source inconnue**. Accepte.
2. Tape "Installer". Ça prend ~20 secondes.
3. L'app apparaît dans ton launcher sous le nom **Brasse Bouillon** avec le logo bonhomme brasseur 🍺.
4. Premier lancement : environ 1-2 secondes. Le dashboard s'affiche en mode démo (des données factices remplissent les écrans).

---

## 3. Ce qui arrive ensuite — les mises à jour

Sur la version actuelle, les modifications côté code se propagent **automatiquement** à ton téléphone sans que tu aies à réinstaller quoi que ce soit.

- **Mises à jour fréquentes (texte, écrans, calculs, design) :** à chaque fois qu'un dev pousse une amélioration, l'app vérifie en s'ouvrant qu'il y a du nouveau et télécharge la mise à jour en 5-10 secondes. Tu ne fais rien, la prochaine ouverture intègre les changements.
- **Mises à jour rares (nouvelles fonctionnalités natives, icône, accès appareil) :** il faudra télécharger un nouvel APK depuis le même lien qu'en étape 1, et l'installer par-dessus. Android te proposera "Mettre à jour", tes données locales sont conservées.

Tu n'as rien à configurer. On te préviendra dans **#annonces** quand un nouvel APK sort.

---

## 4. En cas de problème

Si l'installation échoue ou si l'app plante au lancement :

- Vérifie que tu es bien sur Android (version 8 minimum recommandée).
- Supprime complètement l'app puis réinstalle depuis la dernière build.
- Si ça persiste, poste un message dans **#dev-mobile** avec une capture d'écran de l'erreur, la marque et le modèle de ton phone, la version Android.

---

## 5. À quoi ça sert en ce moment

L'app est en **mode démo** : toutes les données que tu vois (recettes, brassins, ingrédients) sont factices. L'objectif à ce stade est de pouvoir :

- Valider visuellement les écrans sur de vrais téléphones.
- Repérer les bugs de mise en page, de navigation, de rendu.
- Montrer l'app à des amis / famille / futurs testeurs sans passer par un QR code éphémère.

La connexion au vrai backend (recettes sauvegardées, authentification, brassins réels) arrivera dans une prochaine build.

---

## Annexe — dev interne

Pour les devs qui veulent rebuilder un APK ou pousser une mise à jour JavaScript (OTA), la procédure technique détaillée est dans [packages/mobile-app/docs/EAS_BUILD.md](../../packages/mobile-app/docs/EAS_BUILD.md).
