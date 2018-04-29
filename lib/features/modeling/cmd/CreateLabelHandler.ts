import {inherits} from "inherits";

import CreateShapeHandler from './CreateShapeHandler';


/**
 * A handler that attaches a label to a given target shape.
 *
 * @param {Canvas} canvas
 */
export default class CreateLabelHandler
{
  constructor(canvas:any) {
  CreateShapeHandler.call(this, canvas);
  inherits(CreateLabelHandler, CreateShapeHandler);
}



static $inject = [ 'canvas' ];


// api //////////////////////

  originalExecute = CreateShapeHandler.prototype.execute;
  
/**
 * Appends a label to a target shape.
 *
 * @method CreateLabelHandler#execute
 *
 * @param {Object} context
 * @param {ElementDescriptor} context.target the element the label is attached to
 * @param {ElementDescriptor} context.parent the parent object
 * @param {Point} context.position position of the new element
 */
execute = function(context:any) {

  let  label = context.shape;

  ensureValidDimensions(label);

  label.labelTarget = context.labelTarget;

  return this.originalExecute.call(this, context);
};

 originalRevert = CreateShapeHandler.prototype.revert;

/**
 * Undo append by removing the shape
 */
revert = function(context:any) {
  context.shape.labelTarget = null;

  return this.originalRevert.call(this, context);
};


// helpers //////////////////////



}
function ensureValidDimensions(label:any) {
  // make sure a label has valid { width, height } dimensions
  [ 'width', 'height' ].forEach(function(prop) {
    if (typeof label[prop] === 'undefined') {
      label[prop] = 0;
    }
  })}