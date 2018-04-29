import { assign } from 'min-dash';


/**
 * A handler that implements reversible moving of shapes.
 */
export default class  LayoutConnectionHandler{
  constructor(layouter:any , canvas:any ) {
  this._layouter = layouter;
  this._canvas = canvas;
}
_layouter:any ;
_canvas:any;

static $inject = [ 'layouter', 'canvas' ];

execute = function(context:any) {

  let  connection = context.connection;

  let  oldWaypoints = connection.waypoints;

  assign(context, {
    oldWaypoints: oldWaypoints
  });

  connection.waypoints = this._layouter.layoutConnection(connection, context.hints);

  return connection;
};

revert = function(context:any) {

  let  connection = context.connection;

  connection.waypoints = context.oldWaypoints;

  return connection;
};
}
