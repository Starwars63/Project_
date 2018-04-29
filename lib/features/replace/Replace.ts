/**
 * Service that allow replacing of elements.
 */
export default class Replace{
  constructor(modeling:any) {

  this._modeling = modeling;
}
_modeling :any;
static $inject = [ 'modeling' ];

/**
 * @param {Element} oldElement - Element to be replaced
 * @param {Object}  newElementData - Containing information about the new Element, for example height, width, type.
 * @param {Object}  options - Custom options that will be attached to the context. It can be used to inject data
 *                            that is needed in the command chain. For example it could be used in
 *                            eventbus.on('commandStack.shape.replace.postExecute') to change shape attributes after
 *                            shape creation.
 */
replaceElement = function(oldElement:any , newElementData:any, options:any) {

  let modeling = this._modeling;

  let newElement = null;

  if (oldElement.waypoints) {
    // TODO
    // modeling.replaceConnection
  } else {
    // set center of element for modeling API
    // if no new width / height is given use old elements size
    newElementData.x = Math.ceil(oldElement.x + (newElementData.width || oldElement.width) / 2);
    newElementData.y = Math.ceil(oldElement.y + (newElementData.height || oldElement.height) / 2);

    newElement = modeling.replaceShape(oldElement, newElementData, options);
  }

  return newElement;
};
}