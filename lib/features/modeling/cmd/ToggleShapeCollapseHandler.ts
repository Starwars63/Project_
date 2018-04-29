/**
 * A handler that toggles the collapsed state of an element
 * and the visibility of all its children.
 *
 * @param {Modeling} modeling
 */
export default class ToggleShapeCollapseHandler{
  constructor(modeling:any) {
  this._modeling = modeling;
}
_modeling:any;

static $inject = [ 'modeling' ];

execute = function(context:any) {

  var shape = context.shape,
      children = shape.children;

  // remember previous visibility of children
  context.oldChildrenVisibility = getElementsVisibility(children);

  // toggle state
  shape.collapsed = !shape.collapsed;

  // hide/show children
  setHidden(children, shape.collapsed);

  return [shape].concat(children);
};

revert = function(context:any) {

  var shape = context.shape,
      oldChildrenVisibility = context.oldChildrenVisibility;

  var children = shape.children;

  // set old visability of children
  restoreVisibility(children, oldChildrenVisibility);

  // retoggle state
  shape.collapsed = !shape.collapsed;

  return [shape].concat(children);
};


}

// helpers //////////////////////

/**
 * Return a map { elementId -> hiddenState}.
 *
 * @param {Array<djs.model.Shape>} elements
 *
 * @return {Object}
 */
function getElementsVisibility(elements:any) {

  let result:any = {};

  elements.forEach(function(e:any) {
    result[e.id] = e.hidden;
  });

  return result;
}


function setHidden(elements:any, newHidden:any) {
  elements.forEach(function(element:any) {
    element.hidden = newHidden;
  });
}

function restoreVisibility(elements:any, lastState:any) {
  elements.forEach(function(e:any) {
    e.hidden = lastState[e.id];
  });
}