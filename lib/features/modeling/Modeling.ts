import { forEach } from 'min-dash';

import {
  Base
} from '../../model';

import AppendShapeHandler from './cmd/AppendShapeHandler';
import CreateShapeHandler from './cmd/CreateShapeHandler';
import DeleteShapeHandler from './cmd/DeleteShapeHandler';
import MoveShapeHandler from './cmd/MoveShapeHandler';
import ResizeShapeHandler from './cmd/ResizeShapeHandler';
import ReplaceShapeHandler from './cmd/ReplaceShapeHandler';
import ToggleShapeCollapseHandler from './cmd/ToggleShapeCollapseHandler';
import SpaceToolHandler from './cmd/SpaceToolHandler';
import CreateLabelHandler from './cmd/CreateLabelHandler';
import CreateConnectionHandler from './cmd/CreateConnectionHandler';
import DeleteConnectionHandler from './cmd/DeleteConnectionHandler';
import MoveConnectionHandler from './cmd/MoveConnectionHandler';
import LayoutConnectionHandler from './cmd/LayoutConnectionHandler';
import UpdateWaypointsHandler from './cmd/UpdateWaypointsHandler';
import ReconnectConnectionHandler from './cmd/ReconnectConnectionHandler';
import MoveElementsHandler from './cmd/MoveElementsHandler';
import DeleteElementsHandler from './cmd/DeleteElementsHandler';
import DistributeElementsHandler from './cmd/DistributeElementsHandler';
import AlignElementsHandler from './cmd/AlignElementsHandler';
import UpdateAttachmentHandler from './cmd/UpdateAttachmentHandler';
import PasteHandler from './cmd/PasteHandler';


/**
 * The basic modeling entry point.
 *
 * @param {EventBus} eventBus
 * @param {ElementFactory} elementFactory
 * @param {CommandStack} commandStack
 */
export default class Modeling
{constructor(eventBus:any , elementFactory:any, commandStack:any) {
  this._eventBus = eventBus;
  this._elementFactory = elementFactory;
  this._commandStack = commandStack;
  
  let self = this;

  eventBus.on('diagram.init', function() {
    // register modeling handlers
    self.registerHandlers(commandStack);
  });
  
}_eventBus:any ;
_elementFactory:any;
_commandStack:any;

static $inject = [ 'eventBus', 'elementFactory', 'commandStack' ];


MgetHandlers = function() {
  return {
    'shape.append': AppendShapeHandler,
    'shape.create': CreateShapeHandler,
    'shape.delete': DeleteShapeHandler,
    'shape.move': MoveShapeHandler,
    'shape.resize': ResizeShapeHandler,
    'shape.replace': ReplaceShapeHandler,
    'shape.toggleCollapse': ToggleShapeCollapseHandler,

    'spaceTool': SpaceToolHandler,

    'label.create': CreateLabelHandler,

    'connection.create': CreateConnectionHandler,
    'connection.delete': DeleteConnectionHandler,
    'connection.move': MoveConnectionHandler,
    'connection.layout': LayoutConnectionHandler,

    'connection.updateWaypoints': UpdateWaypointsHandler,

    'connection.reconnectStart': ReconnectConnectionHandler,
    'connection.reconnectEnd': ReconnectConnectionHandler,

    'elements.move': MoveElementsHandler,
    'elements.delete': DeleteElementsHandler,

    'elements.distribute': DistributeElementsHandler,
    'elements.align': AlignElementsHandler,

    'element.updateAttachment': UpdateAttachmentHandler,

    'elements.paste': PasteHandler
  };
};

/**
 * Register handlers with the command stack
 *
 * @param {CommandStack} commandStack
 */
registerHandlers = function(commandStack:any ) {
  forEach(this.getHandlers(), function(handler, id) {
    commandStack.registerHandler(id, handler);
  });
};


// modeling helpers //////////////////////

moveShape = function(shape:any , delta:any, newParent:any, newParentIndex:any, hints:any) {

  if (typeof newParentIndex === 'object') {
    hints = newParentIndex;
    newParentIndex = null;
  }

  let context = {
    shape: shape,
    delta:  delta,
    newParent: newParent,
    newParentIndex: newParentIndex,
    hints: hints || {}
  };

  this._commandStack.execute('shape.move', context);
};


/**
 * Update the attachment of the given shape.
 *
 * @param {djs.mode.Base} shape
 * @param {djs.model.Base} [newHost]
 */
updateAttachment = function(shape:any , newHost:any) {
  let context:any = {
    shape: shape,
    newHost: newHost
  };

  this._commandStack.execute('element.updateAttachment', context);
};


/**
 * Move a number of shapes to a new target, either setting it as
 * the new parent or attaching it.
 *
 * @param {Array<djs.mode.Base>} shapes
 * @param {Point} delta
 * @param {djs.model.Base} [target]
 * @param {Object} [hints]
 * @param {Boolean} [hints.attach=false]
 */
moveElements = function(shapes:any, delta:any, target:any, hints:any) {

  hints = hints || {};

  let attach = hints.attach;

  let newParent = target,
      newHost;

  if (attach === true) {
    newHost = target;
    newParent = target.parent;
  } else

  if (attach === false) {
    newHost = null;
  }

  let context = {
    shapes: shapes,
    delta: delta,
    newParent: newParent,
    newHost: newHost,
    hints: hints
  };

  this._commandStack.execute('elements.move', context);
};


moveConnection = function(connection:any , delta:any , newParent:any, newParentIndex:any, hints:any) {

  if (typeof newParentIndex === 'object') {
    hints = newParentIndex;
    newParentIndex = undefined;
  }

  let context = {
    connection: connection,
    delta: delta,
    newParent: newParent,
    newParentIndex: newParentIndex,
    hints: hints || {}
  };

  this._commandStack.execute('connection.move', context);
};


layoutConnection = function(connection:any , hints:any) {
  let context = {
    connection: connection,
    hints: hints || {}
  };

  this._commandStack.execute('connection.layout', context);
};


/**
 * Create connection.
 *
 * @param {djs.model.Base} source
 * @param {djs.model.Base} target
 * @param {Number} [targetIndex]
 * @param {Object|djs.model.Connection} connection
 * @param {djs.model.Base} parent
 * @param {Object} hints
 *
 * @return {djs.model.Connection} the created connection.
 */
createConnection = function(source:any , target:any , parentIndex:any , connection:any , parent:any, hints:any) {

  if (typeof parentIndex === 'object') {
    hints = parent;
    parent = connection;
    connection = parentIndex;
    parentIndex = undefined;
  }

  connection = this._create('connection', connection);

  let context = {
    source: source,
    target: target,
    parent: parent,
    parentIndex: parentIndex,
    connection: connection,
    hints: hints
  };

  this._commandStack.execute('connection.create', context);

  return context.connection;
};


/**
 * Create a shape at the specified position.
 *
 * @param {djs.model.Shape|Object} shape
 * @param {Point} position
 * @param {djs.model.Shape|djs.model.Root} target
 * @param {Number} [parentIndex] position in parents children list
 * @param {Object} [hints]
 * @param {Boolean} [hints.attach] whether to attach to target or become a child
 *
 * @return {djs.model.Shape} the created shape
 */
createShape = function(shape:any , position:any , target:any , parentIndex:any , hints:any) {

  if (typeof parentIndex !== 'number') {
    hints = parentIndex;
    parentIndex = undefined;
  }

  hints = hints || {};

  let attach = hints.attach,
      parent,
      host;

  shape = this._create('shape', shape);

  if (attach) {
    parent = target.parent;
    host = target;
  } else {
    parent = target;
  }

  let context = {
    position: position,
    shape: shape,
    parent: parent,
    parentIndex: parentIndex,
    host: host,
    hints: hints
  };

  this._commandStack.execute('shape.create', context);

  return context.shape;
};


createLabel = function(labelTarget:any, position:any , label:any , parent:any) {

  label = this._create('label', label);

  let context = {
    labelTarget: labelTarget,
    position: position,
    parent: parent || labelTarget.parent,
    shape: label
  };

  this._commandStack.execute('label.create', context);

  return context.shape;
};


/**
 * Append shape to given source, drawing a connection
 * between source and the newly created shape.
 *
 * @param {djs.model.Shape} source
 * @param {djs.model.Shape|Object} shape
 * @param {Point} position
 * @param {djs.model.Shape} target
 * @param {Object} [hints]
 * @param {Boolean} [hints.attach]
 * @param {djs.model.Connection|Object} [hints.connection]
 * @param {djs.model.Base} [hints.connectionParent]
 *
 * @return {djs.model.Shape} the newly created shape
 */
appendShape = function(source:any, shape:any, position:any, target:any, hints:any) {

  hints = hints || {};

  shape = this._create('shape', shape);

  let context = {
    source: source,
    position: position,
    target: target,
    shape: shape,
    connection: hints.connection,
    connectionParent: hints.connectionParent,
    attach: hints.attach
  };

  this._commandStack.execute('shape.append', context);

  return context.shape;
};


removeElements = function(elements:any) {
  let context = {
    elements: elements
  };

  this._commandStack.execute('elements.delete', context);
};


distributeElements = function(groups:any, axis:any, dimension:any) {
  let context = {
    groups: groups,
    axis: axis,
    dimension: dimension
  };

  this._commandStack.execute('elements.distribute', context);
};


removeShape = function(shape:any, hints:any) {
  let context = {
    shape: shape,
    hints: hints || {}
  };

  this._commandStack.execute('shape.delete', context);
};


removeConnection = function(connection:any, hints:any) {
  let context = {
    connection: connection,
    hints: hints || {}
  };

  this._commandStack.execute('connection.delete', context);
};

replaceShape = function(oldShape:any, newShape:any, hints:any) {
  let context:any = {
    oldShape: oldShape,
    newData: newShape,
    hints: hints || {}
  };

  this._commandStack.execute('shape.replace', context);

  return context.newShape;
};

pasteElements = function(tree:any, topParent:any, position:any) {
  let context = {
    tree: tree,
    topParent: topParent,
    position: position
  };

  this._commandStack.execute('elements.paste', context);
};

alignElements = function(elements:any, alignment:any) {
  let context = {
    elements: elements,
    alignment: alignment
  };

  this._commandStack.execute('elements.align', context);
};

resizeShape = function(shape:any, newBounds:any, minBounds:any) {
  let context = {
    shape: shape,
    newBounds: newBounds,
    minBounds: minBounds
  };

  this._commandStack.execute('shape.resize', context);
};

createSpace = function(movingShapes:any, resizingShapes:any, delta:any, direction:any) {
  let context = {
    movingShapes: movingShapes,
    resizingShapes: resizingShapes,
    delta: delta,
    direction: direction
  };

  this._commandStack.execute('spaceTool', context);
};

updateWaypoints = function(connection:any, newWaypoints:any, hints:any) {
  let context = {
    connection: connection,
    newWaypoints: newWaypoints,
    hints: hints || {}
  };

  this._commandStack.execute('connection.updateWaypoints', context);
};

reconnectStart = function(connection:any, newSource:any, dockingOrPoints:any) {
  let context = {
    connection: connection,
    newSource: newSource,
    dockingOrPoints: dockingOrPoints
  };

  this._commandStack.execute('connection.reconnectStart', context);
};

reconnectEnd = function(connection:any, newTarget:any, dockingOrPoints:any) {
  let context = {
    connection: connection,
    newTarget: newTarget,
    dockingOrPoints: dockingOrPoints
  };

  this._commandStack.execute('connection.reconnectEnd', context);
};

connect = function(source:any, target:any, attrs:any, hints:any) {
  return this.createConnection(source, target, attrs || {}, source.parent, hints);
};

_create = function(type:any , attrs:any) {
  if (attrs instanceof Base) {
    return attrs;
  } else {
    return this._elementFactory.create(type, attrs);
  }
};

toggleCollapse = function(shape:any, hints:any) {
  let context = {
    shape: shape,
    hints: hints || {}
  };

  this._commandStack.execute('shape.toggleCollapse', context);
};
}