import { forEach } from 'min-dash';

/**
 * A handler that align elements in a certain way.
 *
 */
export default class AlignElements{
  constructor(modeling:any , canvas:any ) {
  this._modeling = modeling;
  this._canvas = canvas;
}
_canvas:any ;
_modeling:any;

static $inject = [ 'modeling', 'canvas' ];


preExecute = function(context:any) {
  let modeling = this._modeling;

  let elements = context.elements,
      alignment = context.alignment;


  forEach(elements, function(element:any) {
    let delta = {
      x: 0,
      y: 0
    };

    if (alignment.left) {
      delta.x = alignment.left - element.x;

    } else if (alignment.right) {
      delta.x = (alignment.right - element.width) - element.x;

    } else if (alignment.center) {
      delta.x = (alignment.center - Math.round(element.width / 2)) - element.x;

    } else if (alignment.top) {
      delta.y = alignment.top - element.y;

    } else if (alignment.bottom) {
      delta.y = (alignment.bottom - element.height) - element.y;

    } else if (alignment.middle) {
      delta.y = (alignment.middle - Math.round(element.height / 2)) - element.y;
    }

    modeling.moveElements([ element ], delta, element.parent);
  });
};

postExecute = function(context:any) {

};
}
