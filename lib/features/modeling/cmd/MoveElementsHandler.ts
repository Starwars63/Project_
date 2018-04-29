import MoveHelper from './helper/MoveHelper';


/**
 * A handler that implements reversible moving of shapes.
 */
export default class MoveElementsHandler{
  constructor(modeling:any) {
  this._helper = new MoveHelper(modeling);
}
_helper:any;

static $inject = [ 'modeling' ];

preExecute = function(context:any) {
  context.closure = this._helper.getClosure(context.shapes);
};

postExecute = function(context:any) {

  let  hints:any = context.hints,
      primaryShape;

  if (hints && hints.primaryShape) {
    primaryShape = hints.primaryShape;
    hints.oldParent = primaryShape.parent;
  }

  this._helper.moveClosure(
    context.closure,
    context.delta,
    context.newParent,
    context.newHost,
    primaryShape
  );
};
}