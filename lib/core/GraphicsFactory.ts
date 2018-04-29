import {
  forEach,
  reduce
} from 'min-dash';

import {
  getChildren,
  getVisual
} from '../util/GraphicsUtil';

import { translate } from '../util/SvgTransformUtil';

import { clear as domClear } from 'min-dom';

import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  create as svgCreate,
  remove as svgRemove
} from 'tiny-svg';


/**
 * A factory that creates graphical elements
 *
 * @param {EventBus} eventBus
 * @param {ElementRegistry} elementRegistry
 */
export default class GraphicsFactory{
constructor(eventBus: any, elementRegistry:any) {
  this._eventBus = eventBus;
  this._elementRegistry = elementRegistry;
}
_eventBus:any;
_elementRegistry:any;


static $inject = [ 'eventBus' , 'elementRegistry' ];


_getChildren = function(element:any) {

  var gfx = this._elementRegistry.getGraphics(element);

  var childrenGfx;

  // root element
  if (!element.parent) {
    childrenGfx = gfx;
  } else {
    childrenGfx = getChildren(gfx);
    if (!childrenGfx) {
      childrenGfx = svgCreate('g');
      svgClasses(childrenGfx).add('djs-children');

      svgAppend(gfx.parentNode, childrenGfx);
    }
  }

  return childrenGfx;
};

/**
 * Clears the graphical representation of the element and returns the
 * cleared visual (the <g class="djs-visual" /> element).
 */
_clear = function(gfx:any) {
  let visual = getVisual(gfx);

  domClear(visual);

  return visual;
};

/**
 * Creates a gfx container for shapes and connections
 *
 * The layout is as follows:
 *
 * <g class="djs-group">
 *
 *   <!-- the gfx -->
 *   <g class="djs-element djs-(shape|connection)">
 *     <g class="djs-visual">
 *       <!-- the renderer draws in here -->
 *     </g>
 *
 *     <!-- extensions (overlays, click box, ...) goes here
 *   </g>
 *
 *   <!-- the gfx child nodes -->
 *   <g class="djs-children"></g>
 * </g>
 *
 * @param {Object} parent
 * @param {String} type the type of the element, i.e. shape | connection
 * @param {Number} [parentIndex] position to create container in parent
 */
_createContainer = function(type: string, childrenGfx:any, parentIndex:number) {
  let outerGfx = svgCreate('g');
  svgClasses(outerGfx).add('djs-group');

  // insert node at position
  if (typeof parentIndex !== 'undefined') {
    prependTo(outerGfx, childrenGfx, childrenGfx.childNodes[parentIndex]);
  } else {
    svgAppend(childrenGfx, outerGfx);
  }

  let gfx = svgCreate('g');
  svgClasses(gfx).add('djs-element');
  svgClasses(gfx).add('djs-' + type);

  svgAppend(outerGfx, gfx);

  // create visual
  let visual = svgCreate('g');
  svgClasses(visual).add('djs-visual');

  svgAppend(gfx, visual);

  return gfx;
};

create = function(type:any, element:any, parentIndex:any) {
  var childrenGfx = this._getChildren(element.parent);
  return this._createContainer(type, childrenGfx, parentIndex);
};

updateContainments = function(elements:any) {

  var self = this,
      elementRegistry = this._elementRegistry,
      parents;

  parents = reduce(elements, function(map:any, e:any) {

    if (e.parent) {
      map[e.parent.id] = e.parent;
    }

    return map;
  }, {});

  // update all parents of changed and reorganized their children
  // in the correct order (as indicated in our model)
  forEach(parents, function(parent:any) {

    let children = parent.children;

    if (!children) {
      return;
    }

    let childGfx = self._getChildren(parent);

    forEach(children.slice().reverse(), function(c:any) {
      let gfx = elementRegistry.getGraphics(c);

      prependTo(gfx.parentNode, childGfx,null);
    });
  });
};

drawShape = function(visual:any, element:any) {
  var eventBus = this._eventBus;

  return eventBus.fire('render.shape', { gfx: visual, element: element });
};

getShapePath = function(element:any) {
  var eventBus = this._eventBus;

  return eventBus.fire('render.getShapePath', element);
};

drawConnection = function(visual:any, element:any) {
  var eventBus = this._eventBus;

  return eventBus.fire('render.connection', { gfx: visual, element: element });
};

getConnectionPath = function(waypoints:any) {
  var eventBus = this._eventBus;

  return eventBus.fire('render.getConnectionPath', waypoints);
};

update = function(type:any, element:any, gfx:any) {
  // Do not update root element
  if (!element.parent) {
    return;
  }

  var visual = this._clear(gfx);

  // redraw
  if (type === 'shape') {
    this.drawShape(visual, element);

    // update positioning
    translate(gfx, element.x, element.y);
  } else
  if (type === 'connection') {
    this.drawConnection(visual, element);
  } else {
    throw new Error('unknown type: ' + type);
  }

  if (element.hidden) {
    svgAttr(gfx, 'display', 'none');
  } else {
    svgAttr(gfx, 'display', 'block');
  }
};

remove = function(element:any) {
  var gfx = this._elementRegistry.getGraphics(element);

  // remove
  svgRemove(gfx.parentNode);
};


// helpers //////////////////////

}

function prependTo(newNode:any, parentNode:any, siblingNode:any) {
  parentNode.insertBefore(newNode, siblingNode || parentNode.firstChild);
}