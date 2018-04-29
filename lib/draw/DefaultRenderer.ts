import {inherits} from 'inherits';

import BaseRenderer from './BaseRenderer';

import {
  componentsToPath,
  createLine
} from '../util/RenderUtil';

import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate
} from 'tiny-svg';

// apply default renderer with lowest possible priority
// so that it only kicks in if noone else could render
var DEFAULT_RENDER_PRIORITY = 1;

/**
 * The default renderer used for shapes and connections.
 *
 * @param {EventBus} eventBus
 * @param {Styles} styles
 */
export default class DefaultRenderer{
constructor(eventBus:any, styles:any) {
  //
  BaseRenderer.call(this, eventBus, DEFAULT_RENDER_PRIORITY);

  this.CONNECTION_STYLE = styles.style([ 'no-fill' ], { strokeWidth: 5, stroke: 'fuchsia' });
  this.SHAPE_STYLE = styles.style({ fill: 'white', stroke: 'fuchsia', strokeWidth: 2 });
}
CONNECTION_STYLE:any ;
SHAPE_STYLE:any




canRender = function() {
  return true;
};

drawShape = function drawShape(visuals:any, element:any) {

  let rect:any = svgCreate('rect');
  svgAttr(rect, {
    x: 0,
    y: 0,
    width: element.width || 0,
    height: element.height || 0
  });
  svgAttr(rect, this.SHAPE_STYLE);

  svgAppend(visuals, rect);

  return rect;
};


drawConnection = function drawConnection(visuals:any, connection:any) {

  let line = createLine(connection.waypoints, this.CONNECTION_STYLE);
  svgAppend(visuals, line);

  return line;
};

getShapePath = function getShapePath(shape:any) {

  let x = shape.x,
      y = shape.y,
      width = shape.width,
      height = shape.height;

  let shapePath = [
    ['M', x, y],
    ['l', width, 0],
    ['l', 0, height],
    ['l', -width, 0],
    ['z']
  ];

  return componentsToPath(shapePath);
};
getConnectionPath = function getConnectionPath(connection:any) {
  let waypoints = connection.waypoints;

  let idx, point, connectionPath = [];

  for (idx = 0; (point = waypoints[idx]); idx++) {

    // take invisible docking into account
    // when creating the path
    point = point.original || point;

    connectionPath.push([ idx === 0 ? 'M' : 'L', point.x, point.y ]);
  }

  return componentsToPath(connectionPath);
};


static $inject = [ 'eventBus', 'styles' ];
}
inherits(DefaultRenderer, BaseRenderer);