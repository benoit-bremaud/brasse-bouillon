# Contraintes Techniques pour BeerToBeer

## 1. Compatibilité Multiplateforme

BeerToBeer doit fonctionner de manière optimale sur les plateformes suivantes :

- **Android** : Compatibilité avec les versions récentes (API minimale 26, Android 8.0 Oreo).
- **iOS** : Prise en charge des dernières versions, avec un design conforme aux guidelines d’Apple (Human Interface Guidelines). Version minimale : iOS 13.

### Solutions techniques

- Utilisation de **React Native** pour garantir un développement unique et une expérience utilisateur homogène.
- Tests d’adaptabilité pour les tailles d’écran courantes : smartphones et tablettes.
- Intégration d’Expo pour simplifier le développement multiplateforme.

---

## 2. Normes d’Accessibilité

L’application doit être conforme aux normes suivantes :

- **WCAG (Web Content Accessibility Guidelines)** : Respect des contrastes, tailles de police adaptatives.
- **RGAA (Référentiel Général d’Amélioration de l’Accessibilité)** : Pour garantir une utilisation fluide par les personnes en situation de handicap.

### Bonnes pratiques

- Utilisation de composants accessibles (ARIA pour les étiquettes, navigation au clavier).
- Taille de police minimale de 16px pour les textes principaux.
- Ajouter une option de contraste élevé pour les utilisateurs malvoyants.
- Tester avec des outils comme Axe, Lighthouse, VoiceOver (iOS) et TalkBack (Android).

---

## 3. Sécurité et RGPD

L’application doit respecter le RGPD en garantissant la confidentialité des données des utilisateurs.

### Exigences

- Collecte minimale des données personnelles.
- Présence d’un écran d’information sur la gestion des données (politique de confidentialité).
- Cryptage des données sensibles (mot de passe, données de session).

### Bonnes pratiques

- Utiliser `bcrypt` pour le hachage des mots de passe.
- Intégrer `jsonwebtoken` pour sécuriser les sessions utilisateur.
- Implémenter un popup de consentement RGPD au premier lancement, permettant de :
  - Accepter ou refuser la collecte des données personnelles.
  - Afficher un lien vers une politique de confidentialité détaillée.

---

## 4. Performances

Pour offrir une expérience fluide, BeerToBeer doit :

- Utiliser des ressources graphiques optimisées :
  - Formats : SVG pour les icônes, PNG compressés pour les images.
  - Limiter les animations lourdes.
- Optimiser les chargements :
  - Mise en cache des données fréquentes.
  - Chargement asynchrone des écrans non critiques.

### Métriques cibles

- Temps de chargement des écrans principaux : < 2 secondes.
- Taille maximale des ressources graphiques : < 500 Ko par image PNG compressée.

### Outils recommandés

- Utilisation de `react-native-fast-image` pour un chargement plus rapide des images.

---

## 5. Tests Techniques

Des tests réguliers garantiront le respect des contraintes techniques définies :

- **Tests unitaires** : Validation des composants critiques (ex. : calculs IBU/ABV).
- **Tests de performance** : Mesurer les temps de chargement avec Lighthouse ou Flipper.
- **Tests d’accessibilité** : Identifier et corriger les problèmes avec des outils comme Axe.
- **Tests de sécurité** : Vérification des vulnérabilités à l’aide d’OWASP ZAP.

---

### Conclusion

Ces contraintes techniques guideront le développement et la conception de l’application BeerToBeer, en assurant une compatibilité, une accessibilité, une sécurité et des performances de haute qualité.
