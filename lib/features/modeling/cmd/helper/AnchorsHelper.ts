import {
  getNewAttachPoint
} from '../../../../util/AttachUtil';


export function getResizedSourceAnchor(connection:any, shape:any, oldBounds:any) {

  var waypoints = safeGetWaypoints(connection),
      oldAnchor = waypoints[0];

  return getNewAttachPoint(oldAnchor.original || oldAnchor, oldBounds, shape);
}


export function getResizedTargetAnchor(connection:any, shape:any, oldBounds:any) {

  var waypoints = safeGetWaypoints(connection),
      oldAnchor = waypoints[waypoints.length - 1];

  return getNewAttachPoint(oldAnchor.original || oldAnchor, oldBounds, shape);
}


export function getMovedSourceAnchor(connection:any, source:any, moveDelta:any) {
  return getResizedSourceAnchor(connection, source, substractPosition(source, moveDelta));
}


export function getMovedTargetAnchor(connection:any, target:any, moveDelta:any) {
  return getResizedTargetAnchor(connection, target, substractPosition(target, moveDelta));
}


// helpers //////////////////////

function substractPosition(bounds:any, delta:any) {
  return {
    x: bounds.x - delta.x,
    y: bounds.y - delta.y,
    width: bounds.width,
    height: bounds.height
  };
}


/**
 * Return waypoints of given connection; throw if non exists (should not happen!!).
 *
 * @param {Connection} connection
 *
 * @return {Array<Point>}
 */
function safeGetWaypoints(connection:any) {

  var waypoints = connection.waypoints;

  if (!waypoints.length) {
    throw new Error('connection#' + connection.id + ': no waypoints');
  }

  return waypoints;
}
