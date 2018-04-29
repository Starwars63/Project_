import { forEach } from 'min-dash';


export default class DeleteElementsHandler{
constructor(modeling:any, elementRegistry:any) {
  this._modeling = modeling;
  this._elementRegistry = elementRegistry;
}
_modeling:any;
_elementRegistry:any;

static $inject = [
  'modeling',
  'elementRegistry'
];


postExecute = function(context:any) {

  var modeling = this._modeling,
      elementRegistry = this._elementRegistry,
      elements = context.elements;

  forEach(elements, function(element:any) {

    // element may have been removed with previous
    // remove operations already (e.g. in case of nesting)
    if (!elementRegistry.get(element.id)) {
      return;
    }

    if (element.waypoints) {
      modeling.removeConnection(element);
    } else {
      modeling.removeShape(element);
    }
  });
};
}