import {
  add as collectionAdd,
  indexOf as collectionIdx
} from '../../../util/Collections';

import { saveClear } from '../../../util/Removal';


/**
 * A handler that implements reversible deletion of shapes.
 *
 */
export default class DeleteShapeHandler
{
  constructor(canvas:any, modeling:any) {
  this._canvas = canvas;
  this._modeling = modeling;
}
_canvas:any;
_modeling:any;


static $inject = [ 'canvas', 'modeling' ];


/**
 * - Remove connections
 * - Remove all direct children
 */
preExecute = function(context:any) {

  let  modeling = this._modeling;

  let  shape = context.shape,
      label = shape.label;

  // Clean up on removeShape(label)
  if (shape.labelTarget) {
    context.labelTarget = shape.labelTarget;
    shape.labelTarget = null;
  }

  // Remove label
  if (label) {
    this._modeling.removeShape(label, { nested: true });
  }

  // remove connections
  saveClear(shape.incoming, function(connection:any) {
    // To make sure that the connection isn't removed twice
    // For example if a container is removed
    modeling.removeConnection(connection, { nested: true });
  });

  saveClear(shape.outgoing, function(connection:any) {
    modeling.removeConnection(connection, { nested: true });
  });

  // remove child shapes and connections
  saveClear(shape.children, function(child:any) {
    if (isConnection(child)) {
      modeling.removeConnection(child, { nested: true });
    } else {
      modeling.removeShape(child, { nested: true });
    }
  });
};

/**
 * Remove shape and remember the parent
 */
execute = function(context:any) {
  let  canvas = this._canvas;

  let  shape = context.shape,
      oldParent = shape.parent;

  context.oldParent = oldParent;
  context.oldParentIndex = collectionIdx(oldParent.children, shape);

  shape.label = null;

  canvas.removeShape(shape);

  return shape;
};


/**
 * Command revert implementation
 */
revert = function(context:any) {

  let  canvas = this._canvas;

  let  shape = context.shape,
      oldParent = context.oldParent,
      oldParentIndex = context.oldParentIndex,
      labelTarget = context.labelTarget;

  // restore previous location in old oldParent
  collectionAdd(oldParent.children, shape, oldParentIndex);

  if (labelTarget) {
    labelTarget.label = shape;
  }

  canvas.addShape(shape, oldParent);

  return shape;
};


}
function isConnection(element:any) {
  return element.waypoints;
}