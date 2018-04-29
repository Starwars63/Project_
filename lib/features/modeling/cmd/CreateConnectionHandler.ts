export default class CreateConnectionHandler{
  constructor(canvas:any, layouter:any) {
  this._canvas = canvas;
  this._layouter = layouter;
}
_canvas:any;
_layouter:any;

static $inject = [ 'canvas', 'layouter' ];


// api //////////////////////


/**
 * Appends a shape to a target shape
 *
 * @param {Object} context
 * @param {djs.element.Base} context.source the source object
 * @param {djs.element.Base} context.target the parent object
 * @param {Point} context.position position of the new element
 */
execute = function(context:any ) {

  let  connection = context.connection,
      source = context.source,
      target = context.target,
      parent = context.parent,
      parentIndex = context.parentIndex,
      hints = context.hints;

  if (!source || !target) {
    throw new Error('source and target required');
  }

  if (!parent) {
    throw new Error('parent required');
  }

  connection.source = source;
  connection.target = target;

  if (!connection.waypoints) {
    connection.waypoints = this._layouter.layoutConnection(connection, hints);
  }

  // add connection
  this._canvas.addConnection(connection, parent, parentIndex);

  return connection;
};

revert = function(context:any) {
  let  connection = context.connection;

  this._canvas.removeConnection(connection);

  connection.source = null;
  connection.target = null;
};
}