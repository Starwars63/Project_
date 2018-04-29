import {
  assign,
  forEach
} from 'min-dash';

import {
  getResizedSourceAnchor,
  getResizedTargetAnchor
} from "./helper/AnchorsHelper";


/**
 * A handler that implements reversible resizing of shapes.
 *
 * @param {Modeling} modeling
 */
export default class ResizeShapeHandler{
constructor(modeling:any ) {
  this._modeling = modeling;
}
_modeling:any;
static $inject = [ 'modeling' ];

/**
 * {
 *   shape: {....}
 *   newBounds: {
 *     width:  20,
 *     height: 40,
 *     x:       5,
 *     y:      10
 *   }
 *
 * }
 */
execute = function(context:any) {
  var shape = context.shape,
      newBounds = context.newBounds,
      minBounds = context.minBounds;

  if (newBounds.x === undefined || newBounds.y === undefined ||
      newBounds.width === undefined || newBounds.height === undefined) {
    throw new Error('newBounds must have {x, y, width, height} properties');
  }

  if (minBounds && (newBounds.width < minBounds.width
    || newBounds.height < minBounds.height)) {
    throw new Error('width and height cannot be less than minimum height and width');
  } else if (!minBounds
    && newBounds.width < 10 || newBounds.height < 10) {
    throw new Error('width and height cannot be less than 10px');
  }

  // save old bbox in context
  context.oldBounds = {
    width:  shape.width,
    height: shape.height,
    x:      shape.x,
    y:      shape.y
  };

  // update shape
  assign(shape, {
    width:  newBounds.width,
    height: newBounds.height,
    x:      newBounds.x,
    y:      newBounds.y
  });

  return shape;
};

postExecute = function(context:any) {

  var shape = context.shape,
      oldBounds = context.oldBounds;

  var modeling = this._modeling;

  forEach(shape.incoming, function(c) {
    modeling.layoutConnection(c, {
      connectionEnd: getResizedTargetAnchor(c, shape, oldBounds)
    });
  });

  forEach(shape.outgoing, function(c) {
    modeling.layoutConnection(c, {
      connectionStart: getResizedSourceAnchor(c, shape, oldBounds)
    });
  });

};

revert = function(context:any) {

  var shape = context.shape,
      oldBounds = context.oldBounds;

  // restore previous bbox
  assign(shape, {
    width:  oldBounds.width,
    height: oldBounds.height,
    x:      oldBounds.x,
    y:      oldBounds.y
  });

  return shape;
};
}
