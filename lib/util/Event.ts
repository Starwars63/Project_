function __stopPropagation(event: any) {
  if (!event || typeof event.stopPropagation !== 'function') {
    return;
  }

  event.stopPropagation();
}


export function getOriginal(event: any) {
  return event.originalEvent || event.srcEvent;
}


export function stopPropagation(event: any, immediate: any) {
  __stopPropagation(event);
  __stopPropagation(getOriginal(event));
}


export function toPoint(event: any) {

  if (event.pointers && event.pointers.length) {
    event = event.pointers[0];
  }

  if (event.touches && event.touches.length) {
    event = event.touches[0];
  }

  return event ? {
    x: event.clientX,
    y: event.clientY
  } : null;
}