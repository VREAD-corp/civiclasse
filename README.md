# Civiclasse

**Site : https://outils.vread.fr/civiclasse/** · version bêta — relecture experte en cours

Préparation à l’examen civique (40 questions, 32/40, 45 minutes) pour les organismes : centres d’examen agréés, écoles de FLE, associations.

- Gratuit : test de 10 questions corrigées (`/entrainement/`), pages d’information avec liens vers formation-civique.interieur.gouv.fr et service-public.gouv.fr. L’examen et sa préparation officielle sont gratuits ; le site le dit sur chaque page.
- Payant (licence fondateur, pré-commande, SIREN) : espace formateur avec examens blancs imprimables, corrigés sourcés, correction rapide, fiches de progression, mode entretien scripté (cartes tirées de la Charte des droits et devoirs du citoyen français, sans IA). Paiement et livraison du code d’accès : [octave-checkout](https://github.com/VREAD-corp/octave-checkout) (`kind: 'access'`, action `access`).
- Module **Lecture B2** (`/lecture-b2/`, depuis le 14 octobre 2026) : séries imprimables de compréhension écrite pour les formateurs qui préparent la naturalisation (niveau B2 exigé depuis le 1er janvier 2026 ; seuls un diplôme ou un test officiels le prouvent, ce que chaque page rappelle). Textes du domaine public ou officiels, 10 questions par série, corrigé cité. En option d’une licence (+69 € ou +99 €, test A/B `civi-b2-prix` par onglet) ou seul (249 €). Seule la série gratuite (Renan) est dans ce dépôt (`data/lecture-b2-exemple.json`) ; les autres séries viennent du dépôt privé `civiclasse-contenu` (`lecture-b2/`, `scripts/export-b2.mjs`) et sont servies par l’action `access` (`b2`) aux licences qui ont le module.
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
