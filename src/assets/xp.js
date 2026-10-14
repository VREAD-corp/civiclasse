/* Civiclasse A/B tests (read by cro.js, which must load after this file).
 * 'civi-prix': founder price of the Pilot licence, 99 € (p99) or 129 € (p129), alternating by calendar day in Paris
 *   (no storage). ?prix=p129 forces a variant.
 * 'civi-b2-prix': price of the Lecture B2 add-on, +69 € (a69) or +99 € (b99), drawn once per tab (sessionStorage,
 *   cleared when the tab closes). Not 'day': two 2-variant day-mode tests would always fall on the same days.
 *   ?b2=b99 forces a variant. */
window.OCTAVE_XP = [{
  id: 'civi-prix',
  variants: ['p99', 'p129'],
  mode: 'day',
  tz: 'Europe/Paris',
  param: 'prix',
  swap: { p129: [['[data-prix-pilote]', 'text', '129 €']] },
}, {
  id: 'civi-b2-prix',
  variants: ['a69', 'b99'],
  mode: 'tab',
  param: 'b2',
  swap: { b99: [['[data-prix-b2]', 'text', '+99 €']] },
}];
