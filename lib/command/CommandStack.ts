import {
  uniqueBy,
  isArray
} from 'min-dash';


/**
 * A service that offers un- and redoable execution of commands.
 *
 * The command stack is responsible for executing modeling actions
 * in a un- and redoable manner. To do this it delegates the actual
 * command execution to {@link CommandHandler}s.
 *
 * Command handlers provide {@link CommandHandler#execute(ctx)} and
 * {@link CommandHandler#revert(ctx)} methods to un- and redo a command
 * identified by a command context.
 *
 *
 * ## Life-Cycle events
 *
 * In the process the command stack fires a number of life-cycle events
 * that other components to participate in the command execution.
 *
 *    * preExecute
 *    * preExecuted
 *    * execute
 *    * executed
 *    * postExecute
 *    * postExecuted
 *    * revert
 *    * reverted
 *
 * A special event is used for validating, whether a command can be
 * performed prior to its execution.
 *
 *    * canExecute
 *
 * Each of the events is fired as `commandStack.{eventName}` and
 * `commandStack.{commandName}.{eventName}`, respectively. This gives
 * components fine grained control on where to hook into.
 *
 * The event object fired transports `command`, the name of the
 * command and `context`, the command context.
 *
 *
 * ## Creating Command Handlers
 *
 * Command handlers should provide the {@link CommandHandler#execute(ctx)}
 * and {@link CommandHandler#revert(ctx)} methods to implement
 * redoing and undoing of a command.
 *
 * A command handler _must_ ensure undo is performed properly in order
 * not to break the undo chain. It must also return the shapes that
 * got changed during the `execute` and `revert` operations.
 *
 * Command handlers may execute other modeling operations (and thus
 * commands) in their `preExecute` and `postExecute` phases. The command
 * stack will properly group all commands together into a logical unit
 * that may be re- and undone atomically.
 *
 * Command handlers must not execute other commands from within their
 * core implementation (`execute`, `revert`).
 *
 *
 * ## Change Tracking
 *
 * During the execution of the CommandStack it will keep track of all
 * elements that have been touched during the command's execution.
 *
 * At the end of the CommandStack execution it will notify interested
 * components via an 'elements.changed' event with all the dirty
 * elements.
 *
 * The event can be picked up by components that are interested in the fact
 * that elements have been changed. One use case for this is updating
 * their graphical representation after moving / resizing or deletion.
 *
 * @see CommandHandler
 *
 * @param {EventBus} eventBus
 * @param {Injector} injector
 */
export default class CommandStack{
constructor(eventBus:any, injector:any) {

  /**
   * A map of all registered command handlers.
   *
   * @type {Object}
   */
  this._handlerMap = {};

  /**
   * A stack containing all re/undoable actions on the diagram
   *
   * @type {Array<Object>}
   */
  this._stack = [];

  /**
   * The current index on the stack
   *
   * @type {Number}
   */
  this._stackIdx = -1;

  /**
   * Current active commandStack execution
   *
   * @type {Object}
   */
  this._currentExecution = {
    actions: [],
    dirty: []
  };
  

  this._injector = injector;
  this._eventBus = eventBus;

  this._uid = 1;

  eventBus.on([
    'diagram.destroy',
    'diagram.clear'
  ], function() {
    this.clear(false);
  }, this);
}
_handlerMap:any;
_injector:any;
_eventBus:any;
_uid:any;
_stack:any;
_stackIdx:any;
_currentExecution:any;
static $inject = [ 'eventBus', 'injector' ];


/**
 * Execute a command
 *
 * @param {String} command the command to execute
 * @param {Object} context the environment to execute the command in
 */
execute = function(command:any, context:any) {
  if (!command) {
    throw new Error('command required');
  }

  let action = { command: command, context: context };

  this._pushAction(action);
  this._internalExecute(action);
  this._popAction(action);
};


/**
 * Ask whether a given command can be executed.
 *
 * Implementors may hook into the mechanism on two ways:
 *
 *   * in event listeners:
 *
 *     Users may prevent the execution via an event listener.
 *     It must prevent the default action for `commandStack.(<command>.)canExecute` events.
 *
 *   * in command handlers:
 *
 *     If the method {@link CommandHandler#canExecute} is implemented in a handler
 *     it will be called to figure out whether the execution is allowed.
 *
 * @param  {String} command the command to execute
 * @param  {Object} context the environment to execute the command in
 *
 * @return {Boolean} true if the command can be executed
 */
canExecute = function(command:any, context:any) {

  let action = { command: command, context: context };

  let handler = this._getHandler(command);

  let result = this._fire(command, 'canExecute', action);

  // handler#canExecute will only be called if no listener
  // decided on a result already
  if (result === undefined) {
    if (!handler) {
      return false;
    }

    if (handler.canExecute) {
      result = handler.canExecute(context);
    }
  }

  return result;
};


/**
 * Clear the command stack, erasing all undo / redo history
 */
clear = function(emit:any) {
  this._stack.length = 0;
  this._stackIdx = -1;

  if (emit !== false) {
    this._fire('changed');
  }
};


/**
 * Undo last command(s)
 */
undo = function() {
  let action = this._getUndoAction(),
      next;

  if (action) {
    this._pushAction(action);

    while (action) {
      this._internalUndo(action);
      next = this._getUndoAction();

      if (!next || next.id !== action.id) {
        break;
      }

      action = next;
    }

    this._popAction();
  }
};


/**
 * Redo last command(s)
 */
redo = function() {
  let action = this._getRedoAction(),
      next;

  if (action) {
    this._pushAction(action);

    while (action) {
      this._internalExecute(action, true);
      next = this._getRedoAction();

      if (!next || next.id !== action.id) {
        break;
      }

      action = next;
    }

    this._popAction();
  }
};


/**
 * Register a handler instance with the command stack
 *
 * @param {String} command
 * @param {CommandHandler} handler
 */
register = function(command:any, handler:any) {
  this._setHandler(command, handler);
};


/**
 * Register a handler type with the command stack
 * by instantiating it and injecting its dependencies.
 *
 * @param {String} command
 * @param {Function} a constructor for a {@link CommandHandler}
 */
registerHandler = function(command:any, handlerCls:any) {

  if (!command || !handlerCls) {
    throw new Error('command and handlerCls must be defined');
  }

  let handler = this._injector.instantiate(handlerCls);
  this.register(command, handler);
};

canUndo = function() {
  return !!this._getUndoAction();
};

canRedo = function() {
  return !!this._getRedoAction();
};

// stack access  //////////////////////

_getRedoAction = function() {
  return this._stack[this._stackIdx + 1];
};


_getUndoAction = function() {
  return this._stack[this._stackIdx];
};


// internal functionality //////////////////////
_internalUndo = function(action:any) {
  let self = this;

  let command = action.command,
      context = action.context;

  let handler = this._getHandler(command);

  // guard against illegal nested command stack invocations
  this._atomicDo(function() {
    self._fire(command, 'revert', action);

    if (handler.revert) {
      self._markDirty(handler.revert(context));
    }

    self._revertedAction(action);

    self._fire(command, 'reverted', action);
  });
};


_fire = function(command:any, qualifier:any, even:any) {
  if (arguments.length < 3) {
    event = qualifier;
    qualifier = null;
  }

  let names = qualifier ? [ command + '.' + qualifier, qualifier ] : [ command ],
      i, name, result;

  event = this._eventBus.createEvent(event);

  for (i = 0; (name = names[i]); i++) {
    result = this._eventBus.fire('commandStack.' + name, event);

    if (event.cancelBubble) {
      break;
    }
  }

  return result;
};

_createId = function() {
  return this._uid++;
};
_atomicDo = function(fn:any) {

  let execution = this._currentExecution;

  execution.atomic = true;

  try {
    fn();
  } finally {
    execution.atomic = false;
  }
};

_internalExecute = function(action:any, redo:any) {
  let self = this;

  let command = action.command,
      context = action.context;

  let handler = this._getHandler(command);

  if (!handler) {
    throw new Error('no command handler registered for <' + command + '>');
  }

  this._pushAction(action);

  if (!redo) {
    this._fire(command, 'preExecute', action);

    if (handler.preExecute) {
      handler.preExecute(context);
    }

    this._fire(command, 'preExecuted', action);
  }

  // guard against illegal nested command stack invocations
  this._atomicDo(function() {

    self._fire(command, 'execute', action);

    if (handler.execute) {
      // actual execute + mark return results as dirty
      self._markDirty(handler.execute(context));
    }

    // log to stack
    self._executedAction(action, redo);

    self._fire(command, 'executed', action);
  });

  if (!redo) {
    this._fire(command, 'postExecute', action);

    if (handler.postExecute) {
      handler.postExecute(context);
    }

    this._fire(command, 'postExecuted', action);
  }

  this._popAction(action);
};


_pushAction = function(action:any) {

  let execution = this._currentExecution,
      actions = execution.actions;

  let baseAction = actions[0];

  if (execution.atomic) {
    throw new Error('illegal invocation in <execute> or <revert> phase (action: ' + action.command + ')');
  }

  if (!action.id) {
    action.id = (baseAction && baseAction.id) || this._createId();
  }

  actions.push(action);
};


_popAction = function() {
  let execution = this._currentExecution,
      actions = execution.actions,
      dirty = execution.dirty;

  actions.pop();

  if (!actions.length) {
    this._eventBus.fire('elements.changed', { elements: uniqueBy('id', dirty) });

    dirty.length = 0;

    this._fire('changed');
  }
};


_markDirty = function(elements:any) {
  let execution = this._currentExecution;

  if (!elements) {
    return;
  }

  elements = isArray(elements) ? elements : [ elements ];

  execution.dirty = execution.dirty.concat(elements);
};


_executedAction = function(action: any, redo:any) {
  let stackIdx = ++this._stackIdx;

  if (!redo) {
    this._stack.splice(stackIdx, this._stack.length, action);
  }
};


_revertedAction = function(action:any) {
  this._stackIdx--;
};


_getHandler = function(command:any) {
  return this._handlerMap[command];
};

_setHandler = function(command:any, handler:any) {
  if (!command || !handler) {
    throw new Error('command and handler required');
  }

  if (this._handlerMap[command]) {
    throw new Error('overriding handler for command <' + command + '>');
  }

  this._handlerMap[command] = handler;
};
}