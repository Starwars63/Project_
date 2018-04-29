import {
  roundPoint
} from "../layout/LayoutUtil";

import {
  center,
  delta
} from "./PositionUtil";


/**
 * Calculates the absolute point relative to the new element's position
 *
 * @param {point} point [absolute]
 * @param {bounds} oldBounds
 * @param {bounds} newBounds
 *
 * @return {point} point [absolute]
 */
export function getNewAttachPoint(point :number, oldBounds : any, newBounds: any) {
  let oldCenter = center(oldBounds),
      newCenter = center(newBounds),
      oldDelta = delta(point, oldCenter);

  let newDelta = {
    x: oldDelta.x * (newBounds.width  / oldBounds.width),
    y: oldDelta.y * (newBounds.height / oldBounds.height)
  };

  return roundPoint({
    x: newCenter.x + newDelta.x,
    y: newCenter.y + newDelta.y
  });
}


/**
 * Calculates the shape's delta relative to a new position
 * of a certain element's bounds
 *
 * @param {djs.model.Shape} point [absolute]
 * @param {bounds} oldBounds
 * @param {bounds} newBounds
 *
 * @return {delta} delta
 */
export function getNewAttachShapeDelta(shape : any, oldBounds : any, newBounds: any) :any {
  let shapeCenter = center(shape),
      oldCenter = center(oldBounds),
      newCenter = center(newBounds),
      shapeDelta = delta(shape, shapeCenter),
      oldCenterDelta = delta(shapeCenter, oldCenter);

 let newCenterDelta = {
    x: oldCenterDelta.x * (newBounds.width / oldBounds.width),
    y: oldCenterDelta.y * (newBounds.height / oldBounds.height)
  };

  let newShapeCenter = {
    x: newCenter.x + newCenterDelta.x,
    y: newCenter.y + newCenterDelta.y
  };

  return roundPoint({
    x: newShapeCenter.x + shapeDelta.x - shape.x,
    y: newShapeCenter.y + shapeDelta.y - shape.y
  });
}