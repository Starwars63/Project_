/**
 * A simple translation stub to be used for multi-language support
 * in diagrams. Can be easily replaced with a more sophisticated
 * solution.
 *
 * @example
 *
 * // use it inside any diagram component by injecting `translate`.
 *
 * function MyService(translate) {
 *   alert(translate('HELLO {you}', { you: 'You!' }));
 * }
 *
 * @param {String} template to interpolate
 * @param {Object} [replacements] a map with substitutes
 *
 * @return {String} the translated string
 */
export default function translate(template:any  , replacements:any ) {

  replacements = replacements || {};

  return template.replace(/{([^}]+)}/g, function(_:any , key:any) {
    return replacements[key] || '{' + key + '}';
  });
}