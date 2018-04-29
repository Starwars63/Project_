import {
  set as cursorSet,
  unset as cursorUnset
} from "../../util/Cursor";

import {
  install as installClickTrap
} from "../../util/ClickTrap";

import {
  delta as deltaPos
} from "../../util/PositionUtil";

import {
  event as domEvent,
  closest as domClosest
} from "min-dom";

import {
  toPoint
} from "../../util/Event";
import { eventNames } from "cluster";


function length(point:any ) {
  return Math.sqrt(Math.pow(point.x, 2) + Math.pow(point.y, 2));
}

let THRESHOLD = 15;


export default class MoveCanvas{
constructor (eventBus:any, canvas:any) {

  let context:any;

  function handleMove(event:any) {

    let start = context.start,
        position = toPoint(event),
        delta = deltaPos(position, start);

    if (!context.dragging && length(delta) > THRESHOLD) {
      context.dragging = true;

      installClickTrap(eventBus,"");

      cursorSet('grab');
    }

    if (context.dragging) {

      let lastPosition = context.last || context.start;

      delta = deltaPos(position, lastPosition);

      canvas.scroll({
        dx: delta.x,
        dy: delta.y
      });

      context.last = position;
    }

    // prevent select
    event.preventDefault();
  }


  function handleEnd(event: any) {
    domEvent.unbind(document, 'mousemove', handleMove);
    domEvent.unbind(document, 'mouseup', handleEnd);

    context = null;

    cursorUnset();
  }

  function handleStart(event:any) {
    // event is already handled by '.djs-draggable'
    if (domClosest(event.target, '.djs-draggable')) {
      return false;
    }


    // reject non-left left mouse button or modifier key
    if (event.button || event.ctrlKey || event.shiftKey || event.altKey) {
      return false;
    }

    context = {
      start: toPoint(event)
    };

    domEvent.bind(document, 'mousemove', handleMove);
    domEvent.bind(document, 'mouseup', handleEnd);

    // we've handled the event
    return true;
  }

  // listen for move on element mouse down;
  // allow others to hook into the event before us though
  // (dragging / element moving will do this)
  eventBus.on('element.mousedown', 500, function(e:any) {
    return handleStart(e.originalEvent);
  });

}


 static $inject = [ 'eventBus', 'canvas' ];
}