/* Civiclasse A/B test (read by cro.js, which must load after this file): founder price of the Pilot licence,
 * 99 € (p99) or 129 € (p129), alternating by calendar day in Paris (no storage). ?prix=p129 forces a variant. */
window.OCTAVE_XP = [{
  id: 'civi-prix',
  variants: ['p99', 'p129'],
  mode: 'day',
  tz: 'Europe/Paris',
  param: 'prix',
  swap: { p129: [['[data-prix-pilote]', 'text', '129 €']] },
}];
