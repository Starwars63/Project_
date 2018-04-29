import {
  add as collectionAdd,
  indexOf as collectionIdx
} from '../../../util/Collections';


/**
 * A handler that implements reversible deletion of Connections.
 *
 */
export default class DeleteConnectionHandler{
  constructor(canvas:any , modeling:any) {
  this._canvas = canvas;
  this._modeling = modeling;
}
_canvas:any;
_modeling :any

static $inject = [
  'canvas',
  'modeling'
];


/**
 * - Remove attached label
 */
preExecute = function(context:any) {

  var connection = context.connection;

  // Remove label
  if (connection.label) {
    this._modeling.removeShape(connection.label);
  }
};

execute = function(context:any) {

  var connection = context.connection,
      parent = connection.parent;

  context.parent = parent;
  context.parentIndex = collectionIdx(parent.children, connection);

  context.source = connection.source;
  context.target = connection.target;

  this._canvas.removeConnection(connection);

  connection.source = null;
  connection.target = null;
  connection.label = null;

  return connection;
};

/**
 * Command revert implementation.
 */
revert = function(context:any) {

  var connection = context.connection,
      parent = context.parent,
      parentIndex = context.parentIndex;

  connection.source = context.source;
  connection.target = context.target;

  // restore previous location in old parent
  collectionAdd(parent.children, connection, parentIndex);

  this._canvas.addConnection(connection, parent);

  return connection;
};
}
