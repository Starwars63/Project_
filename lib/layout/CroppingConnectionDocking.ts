import {
  assign
} from 'min-dash';

import {
  getElementLineIntersection
} from './LayoutUtil';


function dockingToPoint(docking:any) {
  // use the dockings actual point and
  // retain the original docking
  return assign({ original: docking.point.original || docking.point }, docking.actual);
}


/**
 * A {@link ConnectionDocking} that crops connection waypoints based on
 * the path(s) of the connection source and target.
 *
 * @param {djs.core.ElementRegistry} elementRegistry
 */
export default class CroppingConnectionDocking{
constructor(elementRegistry:any, graphicsFactory:any) {
 this. _elementRegistry = elementRegistry;
  this._graphicsFactory = graphicsFactory;
}
_elementRegistry :any;
_graphicsFactory:any;
static $inject = [ 'elementRegistry', 'graphicsFactory' ];


/**
 * @inheritDoc ConnectionDocking#getCroppedWaypoints
 */
getCroppedWaypoints = function(connection:any, source:any, target:any) {

  source = source || connection.source;
  target = target || connection.target;

  let sourceDocking = this.getDockingPoint(connection, source, true),
      targetDocking = this.getDockingPoint(connection, target);

  let croppedWaypoints = connection.waypoints.slice(sourceDocking.idx + 1, targetDocking.idx);

  croppedWaypoints.unshift(dockingToPoint(sourceDocking));
  croppedWaypoints.push(dockingToPoint(targetDocking));

  return croppedWaypoints;
};

/**
 * Return the connection docking point on the specified shape
 *
 * @inheritDoc ConnectionDocking#getDockingPoint
 */
getDockingPoint = function(connection:any, shape:any, dockStart:any) {

  let waypoints = connection.waypoints,
      dockingIdx,
      dockingPoint,
      croppedPoint;

  dockingIdx = dockStart ? 0 : waypoints.length - 1;
  dockingPoint = waypoints[dockingIdx];

  croppedPoint = this._getIntersection(shape, connection, dockStart);

  return {
    point: dockingPoint,
    actual: croppedPoint || dockingPoint,
    idx: dockingIdx
  };
};


// helpers //////////////////////

_getIntersection = function(shape: any, connection:any, takeFirst:any) {

  let shapePath = this._getShapePath(shape),
      connectionPath = this._getConnectionPath(connection);

  return getElementLineIntersection(shapePath, connectionPath, takeFirst);
};
_getConnectionPath = function(connection:any) {
  return this._graphicsFactory.getConnectionPath(connection);
};

_getShapePath = function(shape:any) {
  return this._graphicsFactory.getShapePath(shape);
};

_getGfx = function(element:any) {
  return this._elementRegistry.getGraphics(element);
};
}