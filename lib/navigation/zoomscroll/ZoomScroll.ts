import {
  event as domEvent,
  closest as domClosest
} from "min-dom";

import {
  getStepSize,
  cap
} from "./ZoomUtil";

import {
  log10
} from "../../util/Math";

import {
  bind
} from "min-dash";

let sign = Math.sin || function(n:any):number {
  return n >= 0 ? 1 : -1;
};

let RANGE = { min: 0.2, max: 4 },
    NUM_STEPS = 10;

let DELTA_THRESHOLD = 0.1;

let DEFAULT_SCALE = 0.75;

/**
 * An implementation of zooming and scrolling within the
 * {@link Canvas} via the mouse wheel.
 *
 * Mouse wheel zooming / scrolling may be disabled using
 * the {@link toggle(enabled)} method.
 *
 * @param {Object} [config]
 * @param {Boolean} [config.enabled=true] default enabled state
 * @param {Number} [config.scale=.75] scroll sensivity
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
export default class ZoomScroll{
  constructor(config:any, eventBus:any, canvas:any) {

  config = config || {};

  this._enabled = false;

  this._canvas = canvas;
  this._container = canvas._container;

  this._handleWheel = bind(this.handleWheel, this);

  this._totalDelta = 0;
  this._scale = config.scale || DEFAULT_SCALE;

  var self = this;

  eventBus.on('canvas.init', function(e:any) {
    self._init(config.enabled !== false);
  });
} 
_enabled :boolean;

_canvas :any;
_container :any ;

_handleWheel: any;

_totalDelta: number;
_scale: any ;

 static $inject = [
  'config.zoomScroll',
  'eventBus',
  'canvas'
];

scroll = function scroll(delta:number) {
  this._canvas.scroll(delta);
};


reset = function reset() {
  this._canvas.zoom('fit-viewport');
};

/**
 * Zoom depending on delta.
 *
 * @param {number} delta - Zoom delta.
 * @param {Object} position - Zoom position.
 */
zoom = function zoom(delta:number, position:Object) {

  // zoom with half the step size of stepZoom
  let stepSize = getStepSize(RANGE, NUM_STEPS * 2);

  // add until threshold reached
  this._totalDelta += delta;

  if (Math.abs(this._totalDelta) > DELTA_THRESHOLD) {
    this._zoom(delta, position, stepSize);

    // reset
    this._totalDelta = 0;
  }
};


handleWheel = function handleWheel(event:any) {
  // event is already handled by '.djs-scrollable'
  if (domClosest(event.target, '.djs-scrollable', true)) {
    return;
  }

  let element = this._container;

  event.preventDefault();

  // pinch to zoom is mapped to wheel + ctrlKey = true
  // in modern browsers (!)

  let isZoom = event.ctrlKey;

  var isHorizontalScroll = event.shiftKey;

  var factor = -1 * this._scale,
      delta;

  if (isZoom) {
    factor *= event.deltaMode === 0 ? 0.020 : 0.32;
  } else {
    factor *= event.deltaMode === 0 ? 1.0 : 16.0;
  }

  if (isZoom) {
    let elementRect = element.getBoundingClientRect();

    let offset = {
      x: event.clientX - elementRect.left,
      y: event.clientY - elementRect.top
    };

    delta = (
      Math.sqrt(
        Math.pow(event.deltaY, 2) +
        Math.pow(event.deltaX, 2)
      ) * sign(event.deltaY) * factor
    );

    // zoom in relative to diagram {x,y} coordinates
    this.zoom(delta, offset);
  } else {

    if (isHorizontalScroll) {
      delta = {
        dx: factor * event.deltaY,
        dy: 0
      };
    } else {
      delta = {
        dx: factor * event.deltaX,
        dy: factor * event.deltaY
      };
    }

    this.scroll(delta);
  }
};

/**
 * Zoom with fixed step size.
 *
 * @param {number} delta - Zoom delta (1 for zooming in, -1 for out).
 * @param {Object} position - Zoom position.
 */
stepZoom = function stepZoom(delta:any, position:any) {

  let stepSize = getStepSize(RANGE, NUM_STEPS);

  this._zoom(delta, position, stepSize);
};


/**
 * Zoom in/out given a step size.
 *
 * @param {number} delta - Zoom delta. Can be positive or negative.
 * @param {Object} position - Zoom position.
 * @param {number} stepSize - Step size.
 */
_zoom = function(delta:number, position:Object, stepSize:number) {
  let canvas = this._canvas;

  let direction = delta > 0 ? 1 : -1;

  let currentLinearZoomLevel = log10(canvas.zoom());

  // snap to a proximate zoom step
  let newLinearZoomLevel = Math.round(currentLinearZoomLevel / stepSize) * stepSize;

  // increase or decrease one zoom step in the given direction
  newLinearZoomLevel += stepSize * direction;

  // calculate the absolute logarithmic zoom level based on the linear zoom level
  // (e.g. 2 for an absolute x2 zoom)
  let newLogZoomLevel = Math.pow(10, newLinearZoomLevel);

  canvas.zoom(cap(RANGE, newLogZoomLevel), position);
};

/**
 * Toggle the zoom scroll ability via mouse wheel.
 *
 * @param  {Boolean} [newEnabled] new enabled state
 */
toggle = function toggle(newEnabled:any) {

  let element = this._container;
  let handleWheel = this._handleWheel;

  let oldEnabled = this._enabled;

  if (typeof newEnabled === 'undefined') {
    newEnabled = !oldEnabled;
  }

  // only react on actual changes
  if (oldEnabled !== newEnabled) {

    // add or remove wheel listener based on
    // changed enabled state
    domEvent[newEnabled ? 'bind' : 'unbind'](element, 'wheel', handleWheel, false);
  }

  this._enabled = newEnabled;

  return newEnabled;
};


_init = function(newEnabled:any) {
  this.toggle(newEnabled);
};
}