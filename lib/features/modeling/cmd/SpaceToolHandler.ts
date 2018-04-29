import { forEach } from 'min-dash';

import {
  resizeBounds
} from '../../space-tool/SpaceUtil';


/**
 * A handler that implements reversible creating and removing of space.
 *
 * It executes in two phases:
 *
 *  (1) resize all affected resizeShapes
 *  (2) move all affected moveElements
 */
export default class SpaceToolHandler{
constructor(modeling:any) {
  this._modeling = modeling;
}
_modeling:any

static $inject = [ 'modeling' ];

preExecute = function(context:any ) {

  // resize
  let  modeling = this._modeling,
      resizingShapes = context.resizingShapes,
      delta = context.delta,
      direction = context.direction;

  forEach(resizingShapes, function(shape) {
    let  newBounds = resizeBounds(shape, direction, delta);

    modeling.resizeShape(shape, newBounds);
  });
};

postExecute = function(context:any ) {
  // move
  let  modeling = this._modeling,
      movingShapes = context.movingShapes,
      delta = context.delta;

  modeling.moveElements(movingShapes, delta, undefined, { autoResize: false, attach: false });
};

execute = function(context:any) {};
revert = function(context:any) {};
}
