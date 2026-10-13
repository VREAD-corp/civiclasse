# Civiclasse

**Site : https://outils.vread.fr/civiclasse/** · version bêta — relecture experte en cours

Préparation à l’examen civique (40 questions, 32/40, 45 minutes) pour les organismes : centres d’examen agréés, écoles de FLE, associations.

- Gratuit : test de 10 questions corrigées (`/entrainement/`), pages d’information avec liens vers formation-civique.interieur.gouv.fr et service-public.gouv.fr. L’examen et sa préparation officielle sont gratuits ; le site le dit sur chaque page.
- Payant (licence fondateur, pré-commande, SIREN) : espace formateur avec examens blancs imprimables, corrigés sourcés, correction rapide, fiches de progression, mode entretien scripté (cartes tirées de la Charte des droits et devoirs du citoyen français, sans IA). Paiement et livraison du code d’accès : [octave-checkout](https://github.com/VREAD-corp/octave-checkout) (`kind: 'access'`, action `access`).
- La banque payante (373 questions vérifiées) n’est **pas** dans ce dépôt public : elle vit dans le dépôt privé `VREAD-corp/civiclasse-contenu` et dans le backend Apps Script. Seules les 10 questions du test gratuit sont ici (`data/demo.json`).

## Développement

```sh
npm ci
npm test                 # node:test : logique des examens, conformité des pages, prix, scripts vendus
npm run build            # dist/
npm run serve            # http://localhost:4173/civiclasse/
npx playwright test      # e2e local (endpoint simulé avec une fixture sans contenu payant)
OCTAVE_CHECKOUT_WEB=../octave-checkout/gas/web npm test   # vérifie aussi que pay/order/mesure/cro = maître
```

`sales.config.json` : prix (= `Config.js` d’octave-checkout), `deliveryDate` = date promise de la version relue (**provisoire, à confirmer par le dirigeant**). Mesure d’audience : `mesure.js` (v:2) + `cro.js` copiés à l’identique depuis octave-checkout ; test A/B `civi-prix` (99 € / 129 €, par jour) dans `src/assets/xp.js`.

Déploiement : GitHub Actions → GitHub Pages à chaque push sur `main`.

Code : MIT. Textes, questions et cartes : © READ FRANCE SAS. Textes officiels : voir `/sources/`.
