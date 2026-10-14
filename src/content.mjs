// Civiclasse: texts of every page (French). Facts about the exam come from the official pages listed on /sources/,
// read on 13 October 2026. Prices and the delivery date come from sales.config.json (Config.js is the authority).
export const OFFICIAL = {
  info: 'https://formation-civique.interieur.gouv.fr/examen-civique/informations-g%C3%A9n%C3%A9rales-sur-lexamen-civique/',
  home: 'https://formation-civique.interieur.gouv.fr/',
  fiches: 'https://formation-civique.interieur.gouv.fr/fiches-par-thematiques/',
  csp: 'https://formation-civique.interieur.gouv.fr/examen-civique/liste-officielle-des-questions-de-connaissance-csp/',
  cr: 'https://formation-civique.interieur.gouv.fr/examen-civique/liste-officielle-des-questions-de-connaissance-cr/',
  nat: 'https://www.immigration.interieur.gouv.fr/sites/dgef/files/medias/documents/2026-01/examen-civique-naturalisation-questions-de-connaissance-20251212.pdf',
  livret: 'https://www.immigration.interieur.gouv.fr/sites/dgef/files/medias/documents/2026-07/LIVRET-DU-CITOYEN-2026.pdf',
  sp_titre: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F39530',
  sp_nat: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F39426',
  sp_natu: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F2213',
  arrete: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000052381620',
  charte: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000025263486',
  quiz: 'https://www.ensemble-en-france.org/quiz-examen-civique-gratuit-debutant/',
};

/** Bank figures, set by the build from data/bank-stats.json. */
export const STATS = { kept: 0, removed: 0, total: 0, cards: 0 };

const ext = (href, text) => `<a href="${href}" rel="noopener">${text}</a>`;

/** « 15 janvier 2027 » from 2027-01-15. */
export const frLongDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  return `${d === 1 ? '1er' : d} ${months[m - 1]} ${y}`;
};

/** The free-official-preparation block, shown on the home page, the offer page and the practice test. */
export const freeOfficialBlock = (u) => `<section class="callout" id="gratuit" data-section="gratuit" aria-labelledby="gratuit-h">
<h2 id="gratuit-h" style="margin-top:0">L’examen et sa préparation officielle sont gratuits</h2>
<p>Le ministère de l’Intérieur l’écrit sur son site : « La préparation à l’examen civique peut se faire de manière totalement gratuite. Il n’est pas nécessaire de payer pour accéder à des questions ou à des tests d’entraînement. » Il ajoute que les sites payants ne sont pas gérés par le ministère et peuvent contenir de fausses informations (${ext(OFFICIAL.info, 'informations générales sur l’examen civique')}).</p>
<p>Un candidat peut donc tout préparer sans nous, avec :</p>
<ul>
<li>les ${ext(OFFICIAL.fiches, 'fiches par thématique')} et les listes officielles des questions de connaissance (${ext(OFFICIAL.csp, 'carte de séjour pluriannuelle')}, ${ext(OFFICIAL.cr, 'carte de résident')}, ${ext(OFFICIAL.nat, 'naturalisation, PDF')}) ;</li>
<li>le ${ext(OFFICIAL.livret, 'Livret du citoyen 2026')} pour la naturalisation ;</li>
<li>les fiches de service-public.gouv.fr : ${ext(OFFICIAL.sp_titre, 'titre de séjour')} et ${ext(OFFICIAL.sp_nat, 'naturalisation')} ;</li>
<li>le ${ext(OFFICIAL.quiz, 'quiz gratuit de 50 questions')} de l’association France Fraternité, cité par le ministère.</li>
</ul>
<p>Civiclasse est un service privé de READ FRANCE SAS, sans lien avec le ministère de l’Intérieur. Notre <a href="${u('entrainement/')}">test de 10 questions</a> et nos pages d’information sont gratuits. La licence payante s’adresse aux organismes qui animent des séances de préparation : elle leur fait gagner le temps de fabriquer et de corriger les supports (détail <a href="${u('licence/')}#ajoute">ci-dessous</a>).</p>
</section>`;

export const betaBlock = (delivery) => `<div class="callout callout-warn" role="note">
<p><span class="beta-pill">version bêta — relecture experte en cours</span></p>
<p>Les réponses et les explications de nos questions ont été rédigées par READ FRANCE, avec l’aide d’un outil d’IA, puis vérifiées une à une contre un texte officiel (fiches du ministère, Constitution, Livret du citoyen, service-public.gouv.fr). Toute question dont la bonne réponse ne figurait pas mot pour mot dans une source officielle a été retirée : ${STATS.removed} sur ${STATS.total}. Aucun expert n’a encore relu la banque. La version relue est promise au plus tard le ${delivery}.</p>
</div>`;

export function homeBody({ u, pilot, annual, delivery }) {
  return `<section class="hero" data-section="hero">
<p><span class="beta-pill">version bêta — relecture experte en cours</span></p>
<h1>Examen civique : des examens blancs prêts à imprimer pour vos groupes</h1>
<p class="lead">Pour les centres d’examen agréés, les écoles de FLE, les associations et les organismes qui préparent des adultes à l’examen civique (carte de séjour pluriannuelle, carte de résident, naturalisation).</p>
<p>Chaque examen blanc suit le format officiel : 40 questions, dont 28 de connaissance et 12 mises en situation, réparties par thème comme dans l’arrêté du 10 octobre 2025. Le corrigé donne, pour chaque réponse, l’extrait du texte officiel qui la justifie.</p>
<div class="btn-row">
<a class="btn" href="${u('entrainement/')}">Essayer 10 questions gratuitement</a>
<a class="btn secondary" href="${u('licence/')}">Voir la licence fondateur</a>
</div>
</section>
${freeOfficialBlock(u)}
<section id="ajoute" data-section="ajoute">
<h2>Ce que la licence ajoute pour un formateur</h2>
<div class="grid2">
<div class="card"><h3>Examens blancs à imprimer</h3><p>Un sujet de 40 questions par mention (CSP, CR ou naturalisation) en un clic, avec sa grille de réponses. Le numéro de série permet de réimprimer le même sujet pour un autre groupe. Un nouveau numéro donne un autre tirage.</p></div>
<div class="card"><h3>Corrigés sourcés</h3><p>Pour chaque question : la bonne lettre, une explication courte et l’extrait officiel avec son lien. Utile quand un apprenant conteste une réponse en séance.</p></div>
<div class="card"><h3>Correction rapide et fiches de progression</h3><p>Vous tapez les 40 lettres d’un apprenant, l’outil donne la note sur 40, le seuil de 32 et les points faibles par thème. La fiche de groupe s’imprime. Les noms restent sur votre ordinateur.</p></div>
<div class="card"><h3>Entretien de naturalisation en jeu de rôle</h3><p>${STATS.cards} cartes de questions d’entraînement tirées de la Charte des droits et devoirs du citoyen français, avec relance, chronomètre et liste des points à vérifier. Le formateur joue l’agent. Aucune IA n’intervient.</p></div>
</div>
</section>
<section id="tarifs" data-section="tarifs">
<h2>Licence fondateur, en pré-commande</h2>
${betaBlock(delivery)}
<div class="offers">
<div class="card offer"><h3>Pilote</h3><p class="price"><span data-prix-pilote>${pilot}</span> <s>149 €</s></p><p>3 mois à partir de la livraison de la version relue, jusqu’à 60 apprenants. Accès bêta dès le paiement.</p></div>
<div class="card offer"><h3>Annuelle</h3><p class="price">${annual} <s>490 €</s></p><p>12 mois à partir de la livraison de la version relue, jusqu’à 300 apprenants. Accès bêta dès le paiement.</p></div>
</div>
<p class="small muted">Prix nets, TVA non applicable (art. 293 B du CGI). Les prix barrés sont ceux prévus après la relecture. Vente aux organismes immatriculés (SIREN), paiement par carte. Si la version relue n’est pas livrée le ${delivery}, vous pouvez demander le remboursement intégral.</p>
<div class="btn-row"><a class="btn" href="${u('commander/')}">Pré-commander</a><a class="btn secondary" href="${u('licence/')}">Détail de la licence</a></div>
</section>
<section id="lecture-b2" data-section="lecture-b2">
<h2>Nouveau : le module Lecture B2</h2>
<p>Depuis le 1er janvier 2026, la naturalisation exige le niveau B2 en français, à l’oral et à l’écrit. Le module Lecture B2 ajoute des séries de compréhension écrite à imprimer : textes de Renan, Hugo, Jaurès, Jules Ferry, Déclaration de 1789, loi de 1905. Il n’atteste aucun niveau : seuls un diplôme ou un test officiels le font. <a href="${u('lecture-b2/')}">Voir le module et la série gratuite</a>.</p>
</section>
<section id="faq" data-section="faq">
<h2>Questions fréquentes</h2>
<details id="faq-officiel"><summary>Est-ce un site officiel ?</summary><p>Non. Civiclasse est un service privé de READ FRANCE SAS. Les seules sources officielles sont le ministère de l’Intérieur (formation-civique.interieur.gouv.fr), service-public.gouv.fr et Légifrance. Nous ne vendons ni inscription ni attestation : on s’inscrit à l’examen dans un centre agréé par la CCI Paris Île-de-France ou France Éducation International.</p></details>
<details id="faq-candidat"><summary>Je suis candidat : dois-je acheter la licence ?</summary><p>Non. Les ressources officielles suffisent et elles sont gratuites (liste ci-dessus). La licence sert aux formateurs qui préparent des groupes.</p></details>
<details id="faq-questions"><summary>D’où viennent les questions ?</summary><p>Les questions de connaissance reprennent mot pour mot les listes officielles publiées par le ministère. Ces listes ne donnent ni les réponses proposées ni la bonne réponse : nous les avons rédigées. Les mises en situation officielles ne sont pas publiées : les nôtres sont des exercices du même type, rédigés par nous et rattachés à une fiche officielle. Le détail est sur la page <a href="${u('sources/')}">Sources</a>.</p></details>
<details id="faq-beta"><summary>Que veut dire « version bêta » ?</summary><p>Chaque bonne réponse a été comparée à un extrait de texte officiel, mais aucun expert n’a encore relu l’ensemble. Pendant la bêta, signalez une erreur depuis l’espace formateur : la question est corrigée ou retirée.</p></details>
<details id="faq-association"><summary>Notre association n’a pas de SIREN. Comment faire ?</summary><p>Le paiement en ligne demande un numéro SIREN (beaucoup d’associations employeuses ou subventionnées en ont un). Sinon, écrivez-nous à <a href="mailto:octave@vread.fr">octave@vread.fr</a>.</p></details>
<details id="faq-reussite"><summary>Garantissez-vous la réussite ?</summary><p>Non. Personne ne peut la garantir. Le seuil officiel est de 32 bonnes réponses sur 40, en 45 minutes au plus.</p></details>
</section>`;
}

export function licenceBody({ u, pilot, annual, delivery, b2a, b2solo }) {
  return `<h1>Licence fondateur Civiclasse</h1>
<p class="lead">Une licence par organisme, payée une fois, pour toute l’équipe pédagogique. Pas de compte par apprenant, pas d’abonnement.</p>
${betaBlock(delivery)}
<section id="ajoute" data-section="ajoute">
<h2>Ce que vous payez, et ce qui reste gratuit</h2>
<div class="table-wrap"><table>
<thead><tr><th scope="col">Besoin</th><th scope="col">Gratuit (officiel ou Civiclasse)</th><th scope="col">Licence Civiclasse</th></tr></thead>
<tbody>
<tr><td>Connaître le format, les thèmes, le seuil</td><td>${ext(OFFICIAL.info, 'Ministère')}, ${ext(OFFICIAL.sp_titre, 'service-public')}, notre page <a href="${u('examen-civique/')}">L’examen civique</a></td><td>Rien de plus</td></tr>
<tr><td>Réviser les questions de connaissance</td><td>${ext(OFFICIAL.csp, 'Listes officielles')} (questions sans réponses) et ${ext(OFFICIAL.fiches, 'fiches thématiques')}</td><td>Les mêmes questions avec 4 réponses, la bonne réponse et l’extrait officiel</td></tr>
<tr><td>S’entraîner en conditions d’examen</td><td>${ext(OFFICIAL.quiz, 'Quiz France Fraternité')} (50 questions), notre <a href="${u('entrainement/')}">test de 10 questions</a></td><td>Examens blancs de 40 questions par mention, sujets imprimables et réimprimables</td></tr>
<tr><td>Corriger un groupe</td><td>À la main</td><td>Grille de réponses, corrigé, correction rapide et fiche de progression</td></tr>
<tr><td>S’entraîner à lire un texte de niveau B2 (naturalisation)</td><td>Notre <a href="${u('lecture-b2/exemple/')}">série gratuite sur Renan</a> ; ${ext(B2_OFFICIAL.f11926, 'fiche F11926')} pour les justificatifs</td><td>Option Lecture B2 : séries imprimables avec questions et corrigé cité (<a href="${u('lecture-b2/')}">détail</a>)</td></tr>
<tr><td>Préparer l’entretien de naturalisation</td><td>${ext(OFFICIAL.livret, 'Livret du citoyen')} et ${ext(OFFICIAL.charte, 'Charte des droits et devoirs')}</td><td>${STATS.cards} cartes de jeu de rôle avec relances et points à vérifier</td></tr>
</tbody></table></div>
</section>
<section id="formules" data-section="formules">
<h2>Formules</h2>
<div class="offers">
<div class="card offer"><h3>Pilote</h3><p class="price"><span data-prix-pilote>${pilot}</span> <s>149 €</s></p><ul><li>Accès bêta dès le paiement</li><li>Version relue livrée au plus tard le ${delivery}</li><li>3 mois de licence à partir de cette livraison</li><li>Jusqu’à 60 apprenants préparés avec les supports</li></ul></div>
<div class="card offer"><h3>Annuelle</h3><p class="price">${annual} <s>490 €</s></p><ul><li>Accès bêta dès le paiement</li><li>Version relue livrée au plus tard le ${delivery}</li><li>12 mois de licence à partir de cette livraison</li><li>Jusqu’à 300 apprenants préparés avec les supports</li></ul></div>
<div class="card offer"><h3>Option Lecture B2</h3><p class="price"><span data-prix-b2>+${b2a}</span></p><ul><li>Séries de compréhension écrite pour les candidats à la naturalisation</li><li>Ajoutée à la Pilote ou à l’Annuelle, même durée</li><li>12 séries relues au plus tard le ${delivery}</li><li>Aussi vendue seule : ${b2solo}</li></ul><p class="small"><a href="${u('lecture-b2/')}">Voir le module</a></p></div>
</div>
<p class="small muted">Prix nets, TVA non applicable (art. 293 B du CGI). Prix barrés : prix prévus après la relecture. Facture envoyée avec le code d’accès. Si la version relue n’est pas livrée le ${delivery}, vous pouvez demander le remboursement intégral (article 6 des <a href="${u('cgv-pro/')}">CGV</a>).</p>
<div class="btn-row"><a class="btn" href="${u('commander/')}">Pré-commander</a></div>
</section>
<section id="comment" data-section="comment">
<h2>Comment ça se passe</h2>
<ol>
<li>Vous payez par carte sur la page de commande (raison sociale et SIREN demandés).</li>
<li>Vous recevez par e-mail un code d’accès CIVI-XXXX-XXXX-XXXX-XXXX et la facture.</li>
<li>Vous ouvrez l’<a href="${u('espace-formateur/')}">espace formateur</a> avec ce code, depuis n’importe quel ordinateur de l’équipe.</li>
<li>Le jour de la livraison de la version relue, le même code donne accès aux questions relues. Nous vous écrivons à ce moment-là.</li>
</ol>
</section>
${freeOfficialBlock(u)}`;
}

export function examBody({ u }) {
  return `<h1>L’examen civique en 2026 : ce que disent les textes</h1>
<p class="lead">Résumé des pages officielles, lues le 13 octobre 2026. En cas de doute, la page officielle fait foi : chaque point renvoie à sa source.</p>
<h2>Qui doit le passer ?</h2>
<ul>
<li>Depuis le 1er janvier 2026, l’étranger majeur signataire du contrat d’intégration républicaine qui demande une <strong>première</strong> carte de séjour pluriannuelle (CSP) ou une <strong>première</strong> carte de résident (CR). Les renouvellements ne sont pas concernés (${ext(OFFICIAL.sp_titre, 'service-public F39530')}, ${ext(OFFICIAL.info, 'ministère')}).</li>
<li>Le candidat à la naturalisation ou à la réintégration <strong>par décret</strong>. L’acquisition par déclaration (mariage avec un Français, ascendant, frère ou sœur d’un Français) n’est pas concernée (${ext(OFFICIAL.sp_nat, 'service-public F39426')}).</li>
<li>Ne sont pas soumis à l’examen pour la CSP ou la CR : les personnes de plus de 65 ans, et certaines situations (protection internationale, apatridie, titres non soumis au contrat d’intégration républicaine, certains accords bilatéraux). Une dispense est possible si le handicap ou l’état de santé rend l’évaluation impossible (${ext(OFFICIAL.sp_titre, 'F39530')}).</li>
</ul>
<h2>Comment se passe l’épreuve ?</h2>
<div class="table-wrap"><table>
<tbody>
<tr><th scope="row">Questions</th><td>40 questions à choix multiples en français, 1 seule bonne réponse parmi 4</td></tr>
<tr><th scope="row">Types</th><td>28 questions de connaissance et 12 mises en situation</td></tr>
<tr><th scope="row">Seuil</th><td>32 bonnes réponses au moins (80 %)</td></tr>
<tr><th scope="row">Durée</th><td>45 minutes au plus, sur tablette ou ordinateur</td></tr>
<tr><th scope="row">Niveaux</th><td>« différents niveaux de difficulté en fonction du titre de séjour visé (CSP ou CR) »</td></tr>
<tr><th scope="row">Nouvelle tentative</th><td>à tout moment et autant de fois que nécessaire</td></tr>
<tr><th scope="row">Attestation</th><td>sans durée de validité ; la mention CR vaut aussi pour une demande de CSP</td></tr>
<tr><th scope="row">Fraude</th><td>interdiction de repasser l’examen pendant 2 ans</td></tr>
</tbody></table></div>
<p class="small muted">Sources : ${ext(OFFICIAL.info, 'ministère de l’Intérieur, informations générales')}, ${ext(OFFICIAL.sp_titre, 'service-public F39530')} (vérifiée le 10 février 2026), ${ext(OFFICIAL.sp_nat, 'service-public F39426')} (vérifiée le 16 juillet 2026), ${ext(OFFICIAL.arrete, 'arrêté du 10 octobre 2025')}.</p>
<h2>Les cinq thèmes et leur poids</h2>
<p>L’arrêté du 10 octobre 2025 (article 3) fixe la répartition des 40 questions. Nos examens blancs la reprennent.</p>
<div class="table-wrap"><table>
<thead><tr><th scope="col">Thème</th><th scope="col">Questions</th><th scope="col">Dont mises en situation</th></tr></thead>
<tbody>
<tr><td>Principes et valeurs de la République</td><td>11</td><td>6</td></tr>
<tr><td>Système institutionnel et politique</td><td>6</td><td>0</td></tr>
<tr><td>Droits et devoirs</td><td>11</td><td>6</td></tr>
<tr><td>Histoire, géographie et culture</td><td>8</td><td>0</td></tr>
<tr><td>Vivre dans la société française</td><td>4</td><td>0</td></tr>
</tbody></table></div>
<h2>Les questions sont-elles publiques ?</h2>
<p>Les questions de connaissance, oui : le ministère publie une liste par mention (${ext(OFFICIAL.csp, 'CSP')}, ${ext(OFFICIAL.cr, 'CR')}, ${ext(OFFICIAL.nat, 'naturalisation')}), sans les réponses. Les mises en situation « ne sont pas rendues publiques ».</p>
<h2>Où s’inscrire ?</h2>
<p>Dans un centre agréé par la chambre de commerce et d’industrie de Paris Île-de-France (CCIP) ou par France Éducation International (FEI). Le ministère donne les liens vers les cartes des centres sur sa ${ext(OFFICIAL.info, 'page d’information')}. Le prix de l’inscription est fixé par chaque centre.</p>
<h2>Et l’entretien de naturalisation ?</h2>
<p>Pour la naturalisation, l’assimilation est vérifiée par l’examen civique et par un entretien en préfecture (${ext(OFFICIAL.sp_natu, 'service-public F2213')}). Voir notre page <a href="${u('entretien/')}">Entretien</a>.</p>
${freeOfficialBlock(u)}`;
}

export function interviewBody({ u, sample }) {
  const cards = sample.cards.map((c) => `<div class="card"><p class="small muted">${c.theme}</p><p class="card-q">${c.question}</p><p class="small"><strong>Relance :</strong> ${c.relance}</p><details><summary>Points à vérifier et texte de la Charte</summary><ul>${c.points.map((p) => `<li>${p}</li>`).join('')}</ul><p class="charte">${c.charte}</p></details></div>`).join('\n');
  return `<h1>Préparer l’entretien de naturalisation</h1>
<p class="lead">L’entretien en préfecture existe toujours pour la naturalisation par décret, en plus de l’examen civique.</p>
${sample.purpose.map((p) => `<blockquote class="card"><p>« ${p.text} »</p><p class="small muted">${ext(p.url, p.source)}</p></blockquote>`).join('\n')}
<p>À la fin de l’entretien, le candidat signe la ${ext(OFFICIAL.charte, 'Charte des droits et devoirs du citoyen français')}. Le Livret du citoyen la reproduit (pages 79 et 80).</p>
<h2>Trois cartes d’entraînement</h2>
<p>${sample.intro}</p>
${cards}
<p>L’espace formateur contient les ${STATS.cards} cartes, un tirage au hasard, un chronomètre de 2 minutes par question, la case à cocher de chaque point abordé et une version imprimable pour travailler en binômes. <a href="${u('licence/')}">Voir la licence</a>.</p>`;
}

export function demoBody({ u }) {
  return `<h1>Test gratuit : 10 questions d’examen civique</h1>
<p class="lead">8 questions de connaissance des listes officielles et 2 mises en situation. Après chaque réponse, vous voyez la correction et l’extrait officiel qui la justifie.</p>
<p class="small"><span class="beta-pill">version bêta — relecture experte en cours</span> Au vrai examen : 40 questions, 45 minutes, 32 bonnes réponses pour réussir.</p>
<div id="quiz" class="card" aria-live="polite"><noscript><p>Ce test a besoin de JavaScript.</p></noscript><p class="muted">Chargement…</p></div>
<p class="small muted">Rien n’est envoyé : vos réponses restent dans votre navigateur.</p>
${freeOfficialBlock(u)}`;
}

export function spaceBody({ u, delivery }) {
  return `<h1>Espace formateur</h1>
<div id="login" class="card controls">
<form id="code-form" novalidate>
<label class="field"><span>Code d’accès reçu par e-mail</span><input type="text" name="code" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="CIVI-XXXX-XXXX-XXXX-XXXX" required maxlength="40"></label>
<button class="btn" type="submit" id="code-button">Ouvrir l’espace</button>
<p id="code-error" class="status err" role="alert" hidden></p>
</form>
<p class="small muted">Pas encore de code ? <a href="${u('licence/')}">Voir la licence fondateur</a>. Le code est valable pour toute l’équipe pédagogique de l’organisme. Il reste en mémoire dans cet onglet seulement.</p>
</div>
<div id="space" hidden>
<p id="licence-line" class="card"></p>
<div class="callout callout-warn"><p><span class="beta-pill">version bêta — relecture experte en cours</span> Version relue promise au plus tard le ${delivery}. Chaque corrigé cite l’extrait officiel. Une erreur ? Le bouton « Signaler » sous chaque question ouvre un e-mail prérempli.</p></div>
<div class="tabs" role="tablist">
<button role="tab" aria-selected="true" aria-controls="p-exam" id="t-exam">Examens blancs</button>
<button role="tab" aria-selected="false" aria-controls="p-corr" id="t-corr">Correction et progression</button>
<button role="tab" aria-selected="false" aria-controls="p-int" id="t-int">Entretien scripté</button>
<button role="tab" aria-selected="false" aria-controls="p-bank" id="t-bank">Banque de questions</button>
<button role="tab" aria-selected="false" aria-controls="p-b2" id="t-b2" hidden>Lecture B2</button>
</div>
<div class="panel-area">
<section class="panel" id="p-exam" role="tabpanel" aria-labelledby="t-exam">
<div class="card controls">
<form id="exam-form" class="grid2">
<label class="field"><span>Mention</span><select name="mention"><option value="csp">Carte de séjour pluriannuelle (CSP)</option><option value="cr">Carte de résident (CR)</option><option value="nat">Naturalisation</option></select></label>
<label class="field"><span>Numéro de série (même numéro = même sujet)</span><input type="number" name="seed" min="1" max="999999" required></label>
<label class="field"><span>Groupe (imprimé sur le sujet, facultatif)</span><input type="text" name="group" maxlength="60"></label>
<label class="field"><span>Date de la séance (facultatif)</span><input type="date" name="date"></label>
<div class="btn-row"><button class="btn" type="submit">Générer le sujet</button></div>
</form>
<div class="btn-row" id="exam-print" hidden><button class="btn secondary" type="button" data-print="exam">Imprimer le sujet et la grille</button><button class="btn secondary" type="button" data-print="key">Imprimer le corrigé</button></div>
<p id="exam-warn" class="small muted" hidden></p>
</div>
<div id="exam-out"></div>
</section>
<section class="panel" id="p-corr" role="tabpanel" aria-labelledby="t-corr" hidden>
<div class="card controls">
<p>Correction rapide d’une copie : choisissez la série corrigée (le sujet généré en dernier dans l’onglet « Examens blancs »), puis tapez les 40 lettres de l’apprenant dans l’ordre (« - » pour une question sans réponse).</p>
<form id="corr-form">
<label class="field"><span>Apprenant (nom ou initiales, reste sur cet ordinateur)</span><input type="text" name="learner" maxlength="40" required></label>
<label class="field"><span>Réponses (40 lettres A, B, C, D)</span><input type="text" name="answers" maxlength="120" autocomplete="off" spellcheck="false" placeholder="ABDC BACD …" required></label>
<div class="btn-row"><button class="btn" type="submit">Corriger</button></div>
</form>
<p id="corr-result" role="status"></p>
</div>
<div class="sheet sheet-progress" id="progress"></div>
<div class="btn-row"><button class="btn secondary" type="button" data-print="progress">Imprimer la fiche de progression</button><button class="btn secondary" type="button" id="progress-clear">Effacer la fiche de ce groupe</button></div>
<p class="small muted">La fiche est enregistrée dans le stockage local de ce navigateur uniquement (aucun envoi). Une fiche vierge s’imprime aussi : elle prévoit 20 lignes.</p>
</section>
<section class="panel" id="p-int" role="tabpanel" aria-labelledby="t-int" hidden>
<div id="interview"></div>
</section>
<section class="panel" id="p-bank" role="tabpanel" aria-labelledby="t-bank" hidden>
<div class="card controls"><label class="field"><span>Rechercher (mot de la question ou de la réponse)</span><input type="search" id="bank-q" maxlength="60"></label><p id="bank-count" class="small muted"></p></div>
<div id="bank-out"></div>
</section>
<section class="panel" id="p-b2" role="tabpanel" aria-labelledby="t-b2" hidden>
<div class="card controls">
<p>Module Lecture B2 (compréhension écrite, version bêta). Choisissez une série, puis imprimez la série pour les apprenants et le corrigé pour vous. Ces séries n’attestent aucun niveau : seuls un diplôme ou un test officiels le font.</p>
<form id="b2-form" class="grid2">
<label class="field"><span>Série</span><select name="set" id="b2-set"></select></label>
<label class="field"><span>Groupe (imprimé sur la série, facultatif)</span><input type="text" name="group" maxlength="60"></label>
</form>
<div class="btn-row"><button class="btn secondary" type="button" data-print="b2">Imprimer la série</button><button class="btn secondary" type="button" data-print="b2key">Imprimer le corrigé</button></div>
<p id="b2-meta" class="small muted"></p>
</div>
<div id="b2-out"></div>
</section>
</div>
</div>`;
}

export const B2_SOURCES = [];
export function sourcesBody({ u }) {
  return `<h1>Sources et méthode</h1>
<h2>Textes officiels utilisés</h2>
<ul>
<li>Ministère de l’Intérieur, site de la formation civique : ${ext(OFFICIAL.home, 'formation-civique.interieur.gouv.fr')}, fiches par thématique et listes officielles des questions de connaissance (${ext(OFFICIAL.csp, 'CSP')}, ${ext(OFFICIAL.cr, 'CR')}). Licence Ouverte etalab 2.0 (mention du site : « Sauf mention explicite de propriété intellectuelle détenue par des tiers, les contenus de ce site sont proposés sous licence etalab-2.0 »). Pages lues le 13 octobre 2026.</li>
<li>Ministère de l’Intérieur, ${ext(OFFICIAL.nat, 'liste officielle des questions de connaissance, mention naturalisation')} (PDF du 12 décembre 2025), lue le 13 octobre 2026. Réutilisation des informations publiques (code des relations entre le public et l’administration, article L321-1).</li>
<li>${ext(OFFICIAL.livret, 'Livret du citoyen, édition mai 2026')} (ministère de l’Intérieur, direction générale des étrangers en France, « Copyright : Ministère de l’intérieur »). Nous n’en citons que de courts extraits, avec la source, au titre du droit de courte citation.</li>
<li>Charte des droits et devoirs du citoyen français, approuvée par le ${ext(OFFICIAL.charte, 'décret n° 2012-127 du 30 janvier 2012')} : texte réglementaire, cité d’après le Livret du citoyen.</li>
<li>Constitution du 4 octobre 1958 et Déclaration des droits de l’homme et du citoyen de 1789, textes du site du Conseil constitutionnel.</li>
<li>service-public.gouv.fr : fiches ${ext(OFFICIAL.sp_titre, 'F39530')}, ${ext(OFFICIAL.sp_nat, 'F39426')} et ${ext(OFFICIAL.sp_natu, 'F2213')}.</li>
<li>${ext(OFFICIAL.arrete, 'Arrêté du 10 octobre 2025')} relatif au programme, aux épreuves et aux modalités d’organisation de l’examen civique (répartition des questions).</li>
</ul>
<h2 id="lecture-b2">Textes du module Lecture B2</h2>
<p>Chaque série reprend un extrait sans en changer les mots (seuls les retours à la ligne de la numérisation sont supprimés). Les œuvres littéraires sont d’auteurs morts avant 1925, publiées avant 1931 et écrites en français : elles sont dans le domaine public en France et aux États-Unis, sans droits de traduction. Les transcriptions viennent de Wikisource (mise en page sous licence CC BY-SA, que nous créditons). Les textes officiels ne sont pas protégés par le droit d’auteur ; la fiche de service-public.gouv.fr est sous licence etalab-2.0.</p>
<div class="table-wrap"><table>
<thead><tr><th scope="col">Texte</th><th scope="col">Auteur</th><th scope="col">Statut</th><th scope="col">Source</th></tr></thead>
<tbody>
${B2_SOURCES.map((s) => `<tr><td>${s.title} (${s.year})</td><td>${s.author}</td><td>${s.status}</td><td>${s.links}</td></tr>`).join('\n')}
</tbody></table></div>
<p>Les questions, le vocabulaire et les corrigés sont rédigés par READ FRANCE, hors ligne, sans outil d’IA au moment de l’usage. Un script vérifie pour chaque question que la citation du corrigé figure mot pour mot dans le texte, qu’il y a 4 réponses distinctes et une seule bonne, et qu’aucune question n’est en double. Aucun examinateur n’a encore relu les séries.</p>
<h2>Comment la banque est construite</h2>
<ol>
<li>Les questions de connaissance sont copiées des listes officielles. Les listes ne donnent ni les 4 propositions ni la bonne réponse : READ FRANCE les a rédigées, avec l’aide d’un outil d’IA, en octobre 2026.</li>
<li>Les mises en situation officielles ne sont pas publiées. Les nôtres sont rédigées par READ FRANCE et rattachées à une fiche officielle.</li>
<li>Chaque question a ensuite été comparée à un extrait de texte officiel. Un script vérifie que l’extrait cité figure mot pour mot dans la source. Une question est retirée si l’extrait manque, si deux propositions peuvent être justes, si deux sources officielles se contredisent ou si un détail de la réponse n’est pas dans la source. Résultat : ${STATS.kept} questions gardées, ${STATS.removed} retirées sur ${STATS.total}.</li>
<li>Aucun expert n’a encore relu la banque : c’est la version bêta. La relecture experte est en cours.</li>
</ol>
<p>Aucune question ne vient d’un site concurrent ou d’un manuel. Les textes de l’extrait sont ceux de la source, parfois avec une coquille de numérisation corrigée.</p>
<p>Code du site : licence MIT. Textes, questions et cartes rédigés par READ FRANCE : tous droits réservés.</p>`;
}

export function legalBody({ contact }) {
  return `<h1>Mentions légales</h1>
<h2>Éditeur</h2>
<p>Civiclasse est un service de READ FRANCE, société par actions simplifiée (SAS) au capital de 1 000 €<br>SIREN 988 741 773 (RCS Paris), SIRET du siège 988 741 773 00010<br>Siège social : 11 rue Rouvet, 75019 Paris, France</p>
<p>Directeur de la publication : Tanguy Warsmann, président.</p>
<p>Contact : <a href="mailto:${contact}">${contact}</a>. Les messages sont lus par Octave, l’assistant IA de READ FRANCE, et par l’équipe.</p>
<h2>Hébergement</h2>
<p>GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis (GitHub Pages). Paiement : Stripe Payments Europe, Ltd. (Dublin, Irlande). E-mails, registre des commandes : Google (Apps Script, Gmail, Sheets, Drive).</p>
<h2>Indépendance</h2>
<p>Civiclasse n’est pas un service public. Il n’est ni agréé, ni financé, ni recommandé par le ministère de l’Intérieur, la CCI Paris Île-de-France ou France Éducation International. Il ne délivre aucune attestation et ne garantit pas la réussite à l’examen.</p>
<h2>Propriété intellectuelle</h2>
<p>Voir la page Sources pour les textes officiels réutilisés et leurs licences.</p>`;
}

export function privacyBody({ contact }) {
  return `<h1>Confidentialité</h1>
<h2>Visiteurs du site</h2>
<ul>
<li>Pas de compte, pas de cookie, pas de traceur publicitaire. Le test gratuit fonctionne dans votre navigateur : vos réponses ne sont envoyées nulle part.</li>
<li>L’espace formateur envoie le code d’accès saisi à notre serveur (Google Apps Script) pour vérifier la licence. Le code est gardé dans l’onglet (sessionStorage) jusqu’à sa fermeture.</li>
<li>Les noms d’apprenants et les notes saisis dans la correction rapide restent dans le stockage local du navigateur (localStorage) de l’ordinateur utilisé. Ils ne sont jamais envoyés. Le bouton « Effacer la fiche de ce groupe » les supprime.</li>
<li>L’hébergeur GitHub peut enregistrer des données techniques de connexion (adresse IP, par exemple) pour la sécurité du service : voir la <a href="https://docs.github.com/fr/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener">déclaration de confidentialité de GitHub</a>.</li>
</ul>
<h2>Mesure d’audience et de comportement</h2>
<p>Nous mesurons la fréquentation et l’usage du site de façon anonyme et agrégée, pour ses propres statistiques et pour l’améliorer : pages vues, clics vers la page de commande et étapes de la commande, domaine du site d’origine et paramètres de campagne (utm), profondeur de défilement, sections atteintes, temps avant le premier clic sur un bouton, formulaires commencés ou envoyés et le <em>nom</em> du dernier champ touché (jamais son contenu), questions de la FAQ ouvertes, liens sortants (nom de domaine seulement), erreurs techniques (empreinte anonyme du message), vitesse d’affichage et clics répétés. Seuls des totaux journaliers sont conservés, dans un tableur de READ FRANCE hébergé par Google.</p>
<ul>
<li>Aucun cookie, aucun identifiant, aucune adresse IP conservée, aucune donnée personnelle, aucun suivi d’un site à l’autre. Rien n’est partagé, vendu ou recoupé.</li>
<li>Test A/B : selon le jour, le prix fondateur de la formule Pilote affiché est 99 € ou 129 €. Le choix dépend de la date (aucun stockage) et n’est rattaché à personne. Le prix payé est toujours celui affiché sur la page de commande.</li>
<li>Second test A/B, sur le prix de l’option Lecture B2 (+69 € ou +99 €) : la variante est tirée au hasard une fois par onglet et gardée dans le stockage de session de l’onglet (sessionStorage) jusqu’à sa fermeture. Ce n’est pas un cookie, rien n’identifie le visiteur et rien n’est envoyé d’autre que le compteur agrégé de la variante.</li>
<li>Opposition : le réglage « Do Not Track » ou « Global Privacy Control » du navigateur arrête toute mesure.</li>
<li>Cette mesure, agrégée et limitée aux statistiques propres au site, entre dans l’exemption de consentement prévue pour la mesure d’audience (article 82 de la loi Informatique et Libertés, lignes directrices et recommandation de la CNIL du 17 septembre 2020) : il n’y a donc pas de bandeau de consentement.</li>
</ul>
<h2>Clients (commande d’une licence)</h2>
<p>READ FRANCE SAS, responsable de traitement, utilise l’adresse e-mail, la raison sociale, le SIREN et l’adresse de facturation donnés à la commande pour exécuter la commande, envoyer le code d’accès et la facture, tenir sa comptabilité et prévenir la fraude (base légale : contrat et obligations légales). Les données de carte sont traitées par Stripe, jamais par nous. Prestataires : Stripe (paiement), Google (e-mails, registre des commandes et des factures). Durées : pièces comptables 10 ans, autres données de commande 5 ans. Vos droits (accès, rectification, effacement, limitation, opposition, portabilité) s’exercent à <a href="mailto:${contact}">${contact}</a> ; réclamation possible auprès de la <a href="https://www.cnil.fr/fr/plaintes" rel="noopener">CNIL</a>.</p>
<p class="hint">Mise à jour : 14 octobre 2026.</p>`;
}

export function cgvBody({ u, pilot99, pilot129, annual, delivery, termsVersion, contact, b2a, b2b, b2solo }) {
  return `<!--
  CGV B2B rédigées par Octave (assistant IA de READ FRANCE SAS) le 13 octobre 2026, complétées le 14 octobre 2026 pour le
  module Lecture B2. CE N'EST PAS UN CONSEIL JURIDIQUE : à faire relire. La date de livraison (${delivery}) est PROVISOIRE :
  elle doit être confirmée par le dirigeant (sales.config.json deliveryDate + Config.js CIVICLASSE).
-->
<h1>Conditions générales de vente aux professionnels</h1>
<p class="small muted">Civiclasse, licences fondateur et module Lecture B2 — version du 14 octobre 2026 (référence ${termsVersion}). Elle remplace la version du 13 octobre 2026, qui reste applicable aux commandes passées sous cette version.</p>
<h2>1. Vendeur</h2>
<p>READ FRANCE, société par actions simplifiée (SAS) au capital de 1 000 €, 11 rue Rouvet, 75019 Paris, SIREN 988 741 773 (RCS Paris), bénéficiant de la franchise en base de TVA (TVA non applicable, art. 293 B du CGI), représentée par Tanguy Warsmann, président (« le Vendeur »). Contact : <a href="mailto:${contact}">${contact}</a>.</p>
<h2>2. Champ d’application</h2>
<p>Ces conditions s’appliquent aux ventes en ligne des licences Civiclasse et du module Lecture B2 à un <strong>professionnel</strong> immatriculé en France et identifié par son SIREN (entreprise, organisme de formation, association), qui commande pour les besoins de son activité (« l’Acheteur »). Les ventes aux consommateurs ne sont pas proposées. La personne qui commande déclare pouvoir engager l’Acheteur. L’Acheteur accepte ces conditions en cochant la case prévue avant le paiement ; la version acceptée est conservée avec la commande.</p>
<h2>3. Services et caractère de pré-commande</h2>
<p>Civiclasse est un espace en ligne pour les formateurs qui préparent des adultes à l’examen civique : examens blancs imprimables, corrigés, outils de correction et de suivi, cartes d’entraînement à l’entretien de naturalisation. Le module <strong>Lecture B2</strong> ajoute des séries imprimables de compréhension écrite (un texte, des questions, un corrigé) pour les formateurs qui préparent des candidats à la naturalisation. Les services sont fournis par un accès au site au moyen d’un code personnel à l’Acheteur.</p>
<p>Les ventes sont des <strong>pré-commandes</strong>. À la date de la commande, la banque de questions de l’examen civique et les séries du module Lecture B2 sont en <strong>version bêta</strong> : elles ont été contrôlées contre leurs sources, mais aucun expert ne les a encore relues. Le Vendeur s’engage à livrer, <strong>au plus tard le ${delivery}</strong> : la version relue de la banque de questions (licences) ; <strong>12 séries relues</strong> du module Lecture B2 (module). Jusqu’à cette livraison, l’Acheteur dispose de la version bêta sans supplément.</p>
<p>Civiclasse est un service privé, sans lien avec le ministère de l’Intérieur, France Éducation International ou la CCI Paris Île-de-France. Il ne délivre aucune attestation, ne remplace pas les ressources officielles, qui sont gratuites, et ne garantit ni la réussite à l’examen civique ni un niveau de langue. Le module Lecture B2 ne prouve pas le niveau B2 exigé pour la naturalisation : seuls les diplômes et attestations prévus par les textes le prouvent. Il ne reproduit pas les épreuves du TCF ou du TEF.</p>
<h2>4. Prix</h2>
<ul>
<li>Licence fondateur Pilote : ${pilot99} ou ${pilot129} net selon le prix affiché le jour de la commande (test de prix), pour 3 mois de licence et jusqu’à 60 apprenants.</li>
<li>Licence fondateur Annuelle : ${annual} net, pour 12 mois de licence et jusqu’à 300 apprenants.</li>
<li>Option Lecture B2 ajoutée à une licence : ${b2a} ou ${b2b} net de plus selon le prix affiché (test de prix), pour la durée et le nombre d’apprenants de la licence choisie.</li>
<li>Module Lecture B2 seul : ${b2solo} net, pour 12 mois et jusqu’à 300 apprenants.</li>
</ul>
<p>TVA non applicable, art. 293 B du CGI. Le prix applicable est celui affiché sur la page de commande au moment du paiement ; il est payable en une fois, sans abonnement ni renouvellement automatique.</p>
<h2>5. Commande, paiement, accès</h2>
<p>L’Acheteur indique son adresse électronique, sa raison sociale, son SIREN et son adresse de facturation, puis paie par carte bancaire via Stripe (Stripe Payments Europe, Ltd.) ; le Vendeur n’a jamais accès aux données de carte. Le contrat est formé à la confirmation du paiement. Le code d’accès et la facture acquittée sont envoyés par e-mail dans les minutes qui suivent, et au plus tard sous 24 heures ; à défaut, l’Acheteur prévient le Vendeur, qui renvoie le code sans frais.</p>
<h2>6. Livraison des versions relues et remboursement</h2>
<p>La période de licence (3 ou 12 mois) commence le jour où la version relue est mise à disposition, annoncée par e-mail. <strong>Si la version relue de la banque de questions n’est pas mise à disposition le ${delivery} au plus tard, l’Acheteur d’une licence peut demander le remboursement intégral du prix payé</strong>, option Lecture B2 comprise.</p>
<p><strong>Si les 12 séries relues du module Lecture B2 ne sont pas mises à disposition le ${delivery} au plus tard</strong>, l’Acheteur peut demander : s’il a acheté le module seul, le remboursement intégral ; s’il l’a acheté en option d’une licence, le remboursement de la part du prix correspondant à l’option (${b2a} ou ${b2b} selon le prix payé), la licence restant due si sa propre version relue a été livrée.</p>
<p>La demande se fait par simple e-mail dans les 30 jours qui suivent cette date ; le remboursement est fait sur la carte utilisée, l’accès au service remboursé prend fin et une facture d’avoir est émise.</p>
<h2>7. Absence de droit de rétractation</h2>
<p>La vente étant conclue entre professionnels, le droit de rétractation du code de la consommation ne s’applique pas, sous réserve de l’article 6.</p>
<h2>8. Licence d’utilisation</h2>
<p>Le Vendeur reste titulaire des droits sur les questions, explications, corrigés, encadrés de vocabulaire, cartes et outils qu’il a rédigés. L’Acheteur reçoit une licence <strong>non exclusive et non cessible</strong>, pour la durée prévue à l’article 6, lui permettant : d’utiliser l’espace formateur par les membres de son équipe pédagogique ; d’imprimer et de distribuer les sujets, séries, grilles et corrigés à ses propres apprenants, dans la limite du nombre d’apprenants de la formule. Sont interdits : la communication du code d’accès à des tiers ou à des apprenants, la revente, la mise en ligne des contenus et leur reprise dans un autre produit. Les textes officiels et les œuvres du domaine public reproduits restent soumis à leur propre régime (page <a href="${u('sources/')}">Sources</a>).</p>
<h2>9. Exactitude des contenus</h2>
<p>Le Vendeur vérifie les contenus avec soin et corrige ou retire toute question signalée comme erronée, dans un délai raisonnable. Les textes et les examens peuvent évoluer : les pages officielles font foi. Les contenus ne constituent pas un conseil juridique et ne portent pas sur la situation administrative d’une personne.</p>
<h2>10. Responsabilité</h2>
<p>Le Vendeur est tenu d’une obligation de moyens. Sa responsabilité, limitée aux dommages directs prouvés, ne peut excéder le prix payé. Il ne répond pas des résultats des apprenants aux examens ou aux tests de langue ni des décisions administratives. Ces limites ne s’appliquent pas en cas de faute lourde ou dolosive.</p>
<h2>11. Facturation</h2>
<p>Une facture conforme à l’article 242 nonies A de l’annexe II du CGI est envoyée avec le code. Le prix étant payé comptant, aucun escompte n’est accordé. Toute somme non payée à l’échéance entraîne des pénalités au taux de trois fois le taux d’intérêt légal et l’indemnité forfaitaire de 40 € (articles L441-10 et D441-5 du code de commerce).</p>
<h2>12. Données personnelles</h2>
<p>Voir la page <a href="${u('confidentialite/')}">Confidentialité</a>.</p>
<h2>13. Droit applicable</h2>
<p>Droit français. Après une tentative de règlement amiable, tout litige relève de la compétence exclusive des tribunaux de Paris.</p>
<p class="small muted">Version du 14 octobre 2026.</p>`;
}

/* ------------------------------------------------------------------ Lecture B2 (V4-56) */

export const B2_OFFICIAL = {
  f11926: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F11926',
  decret93: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000699753',
  decret2025: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000051900519',
  fei: 'https://www.france-education-international.fr/',
  tef: 'https://www.lefrancaisdesaffaires.fr/candidat/test-evaluation-francais/tef-irn/presentation/',
};

/** The 2026 language rule and what proves the level: on the module page, the sample and the order page. */
export const b2RuleBlock = () => `<section class="callout" id="regle-b2" data-section="regle-b2" aria-labelledby="regle-b2-h">
<h2 id="regle-b2-h" style="margin-top:0">Naturalisation : le niveau B2 est exigé depuis le 1er janvier 2026</h2>
<p>Pour une demande de naturalisation par décret déposée depuis le 1er janvier 2026, il faut justifier d’une connaissance du français « à l’oral et à l’écrit au moins égale au niveau B2 » du CECRL. La même règle vaut pour la déclaration de nationalité par mariage. Avant 2026, le niveau demandé était B1. Textes : ${ext(B2_OFFICIAL.decret2025, 'décret n° 2025-648 du 15 juillet 2025')}, qui modifie les articles 14 et 37 du ${ext(B2_OFFICIAL.decret93, 'décret n° 93-1362 du 30 décembre 1993')} ; résumé officiel sur ${ext(B2_OFFICIAL.f11926, 'service-public.gouv.fr, fiche F11926')} (vérifiée le 1er janvier 2026).</p>
<p><strong>Seul un diplôme ou une attestation officiels prouvent ce niveau.</strong> La fiche F11926 accepte le diplôme national du brevet, un diplôme ou une certification professionnelle de niveau 3 au moins, un diplôme attestant le niveau B2 (le DELF B2 ou le DALF, par exemple), ou une attestation de réussite au TCF (France Éducation International) ou au TEF (CCI Paris Île-de-France) de moins de 2 ans.</p>
<p>Civiclasse ne prouve aucun niveau et ne délivre aucune attestation. Le module Lecture B2 entraîne à la compréhension écrite, une seule des quatre compétences évaluées (compréhension et expression, à l’oral et à l’écrit). Il ne reproduit pas les épreuves du TCF ou du TEF, ne les imite pas et ne promet ni un niveau ni une réussite.</p>
</section>`;

const b2SetsTable = (cat) => `<div class="table-wrap"><table>
<thead><tr><th scope="col">Série</th><th scope="col">Texte</th><th scope="col">Thème</th><th scope="col">Longueur</th></tr></thead>
<tbody>
${cat.sets.map((s) => `<tr><td>${s.order}${s.free ? ' (gratuite)' : ''}</td><td><strong>${esc2(s.title)}</strong><br><span class="small">${esc2(s.author)}${s.authorDates ? ` (${esc2(s.authorDates)})` : ''}, ${s.year}</span></td><td>${esc2(s.theme)}</td><td>${s.words} mots, ${s.questions} questions</td></tr>`).join('\n')}
</tbody></table></div>`;
const esc2 = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function lectureB2Body({ u, delivery, b2a, b2solo, b2cat }) {
  const n = b2cat.sets.length;
  return `<section class="hero" data-section="hero">
<p><span class="beta-pill">version bêta — relecture experte en cours</span></p>
<h1>Lecture B2 : des textes sur la France à lire et à comprendre, prêts à imprimer</h1>
<p class="lead">Un module de Civiclasse pour les formateurs qui préparent des adultes à la naturalisation. Chaque série réunit un texte de 450 à 600 mots, 10 questions de compréhension, un encadré de vocabulaire et un corrigé qui cite, pour chaque réponse, le passage du texte.</p>
<p>Les textes sont des œuvres du domaine public (Renan, Hugo, Jaurès, Jules Ferry) ou des textes officiels (Déclaration de 1789, loi de 1905, fiche de service-public.gouv.fr). En une séance, le groupe s’entraîne à lire un texte argumenté et révise les repères de l’examen civique.</p>
<div class="btn-row">
<a class="btn" href="${u('lecture-b2/exemple/')}" data-cta>Voir la série gratuite (Renan)</a>
<a class="btn secondary" href="${u('commander/?module=lecture-b2')}">Ajouter le module à une licence</a>
</div>
</section>
${b2RuleBlock()}
<section id="contenu" data-section="contenu">
<h2>Ce que contient le module</h2>
<p>Compréhension écrite seulement. Le module ne travaille ni l’oral ni l’expression écrite.</p>
<div class="grid2">
<div class="card"><h3>Une série = une séance</h3><p>Le texte avec ses paragraphes numérotés, le contexte en trois lignes, 6 à 9 mots expliqués, 10 questions à une seule bonne réponse et une grille de réponses. Durée conseillée : 30 minutes.</p></div>
<div class="card"><h3>Un corrigé qui se vérifie</h3><p>Pour chaque question : la bonne lettre, la compétence travaillée (repérer, déduire, comprendre un mot, saisir l’intention, voir la structure) et la phrase exacte du texte qui la justifie. Un script contrôle que chaque citation figure mot pour mot dans le texte.</p></div>
<div class="card"><h3>Des textes libres de droits</h3><p>Auteurs morts avant 1925, textes publiés avant 1931, originaux en français : ils sont dans le domaine public en France comme aux États-Unis. Les textes officiels sont repris sans modification, avec leur source. Le détail est sur la page <a href="${u('sources/')}#lecture-b2">Sources</a>.</p></div>
<div class="card"><h3>Pour le formateur</h3><p>Les séries s’impriment depuis l’espace formateur, avec le même code d’accès que la licence. Rien n’est demandé aux apprenants : pas de compte, pas de saisie en ligne.</p></div>
</div>
<h3>Les ${n} séries disponibles aujourd’hui</h3>
${b2SetsTable(b2cat)}
<p class="small muted">Version bêta : questions rédigées par READ FRANCE et contrôlées par programme, pas encore relues par un examinateur. Le module complet, 12 séries relues, est promis au plus tard le ${delivery}.</p>
</section>
<section id="prix-b2" data-section="prix-b2">
<h2>Prix</h2>
<div class="offers">
<div class="card offer"><h3>En option d’une licence</h3><p class="price"><span data-prix-b2>+${b2a}</span></p><p>Ajouté à la licence Pilote ou Annuelle, pour la même durée et le même nombre d’apprenants.</p></div>
<div class="card offer"><h3>Seul, sans licence</h3><p class="price">${b2solo}</p><p>12 mois à partir de la livraison de la version relue, jusqu’à 300 apprenants. Pour un organisme qui ne prépare pas l’examen civique.</p></div>
</div>
<p class="small muted">Prix nets, TVA non applicable (art. 293 B du CGI). Pré-commande : les ${n} séries bêta sont disponibles dès le paiement ; si les 12 séries relues ne sont pas livrées le ${delivery}, vous pouvez demander le remboursement (article 6 des <a href="${u('cgv-pro/')}">CGV</a>). Vente aux organismes immatriculés (SIREN).</p>
<div class="btn-row"><a class="btn" href="${u('commander/?module=lecture-b2')}">Pré-commander avec une licence</a><a class="btn secondary" href="${u('commander/?module=lecture-b2-seul')}">Pré-commander le module seul</a></div>
</section>
<section id="faq-b2" data-section="faq">
<h2>Questions fréquentes</h2>
<details id="faq-b2-preuve"><summary>Un candidat qui réussit ces séries a-t-il le niveau B2 ?</summary><p>On ne peut pas le dire. Seuls un diplôme ou une attestation officiels (TCF ou TEF de moins de 2 ans, DELF B2, DALF, brevet…) prouvent le niveau. Nos séries servent à s’entraîner à lire.</p></details>
<details id="faq-b2-tcf"><summary>Est-ce un entraînement au TCF ou au TEF ?</summary><p>Non. Les épreuves de ces tests appartiennent à leurs éditeurs (France Éducation International, CCI Paris Île-de-France) et nous ne les reproduisons pas. Les questions de nos séries portent sur un texte long et argumenté, avec une seule bonne réponse, comme beaucoup d’exercices de compréhension écrite de niveau B2.</p></details>
<details id="faq-b2-gratuit"><summary>Existe-t-il des ressources gratuites ?</summary><p>Oui. France Éducation International et la CCI Paris Île-de-France présentent leurs tests sur leurs sites ; la fiche ${ext(B2_OFFICIAL.f11926, 'F11926')} liste les justificatifs. Notre série sur Renan est gratuite et complète.</p></details>
<details id="faq-b2-niveau"><summary>Comment le niveau des textes a-t-il été choisi ?</summary><p>D’après les descripteurs B2 du CECRL en lecture : textes de 450 à 600 mots, argumentés, sur des sujets de société, avec des questions de repérage, de déduction, de vocabulaire et d’intention. Aucun examinateur ne les a encore relus : c’est la bêta.</p></details>
<details id="faq-b2-apprenants"><summary>Les apprenants doivent-ils créer un compte ?</summary><p>Non. Le formateur imprime les séries. Aucune donnée d’apprenant n’est collectée.</p></details>
</section>`;
}

export function b2ExempleBody({ u, sheet, key, set }) {
  return `<h1>Série gratuite « ${esc2(set.title)} » d’Ernest Renan</h1>
<p class="lead">La série complète, telle qu’elle s’imprime depuis l’espace formateur : texte, vocabulaire, 10 questions, grille de réponses et corrigé.</p>
<p class="small"><span class="beta-pill">version bêta — relecture experte en cours</span> Libre d’usage en classe. Le texte de Renan est dans le domaine public ; questions et corrigé © READ FRANCE SAS.</p>
<div class="btn-row no-print"><button type="button" class="btn" data-print-b2="sheet">Imprimer la série</button><button type="button" class="btn secondary" data-print-b2="key">Imprimer le corrigé</button><a class="btn secondary" href="${u('lecture-b2/')}">Le module Lecture B2</a></div>
${sheet}
${key}
<div class="no-print">${b2RuleBlock()}</div>`;
}
