import {
  pointDistance
} from "./Geometry";


import {findPathIntersections} from "path-intersection";


let round = Math.round,
    max = Math.max;


function circlePath(center: any, r: any) {
  let x = center.x,
      y = center.y;

  return [
    ['M', x, y],
    ['m', 0, -r],
    ['a', r, r, 0, 1, 1, 0, 2 * r],
    ['a', r, r, 0, 1, 1, 0, -2 * r],
    ['z']
  ];
}

function linePath(points: any) {
  let segments:any[];

  points.forEach(function(p:any, idx:any) {
    segments.push([ idx === 0 ? 'M' : 'L', p.x, p.y ]);
  });

  return segments;
}


let INTERSECTION_THRESHOLD = 10;

function getBendpointIntersection(waypoints: any, reference:any) {

  let i, w;

  for (i = 0; (w = waypoints[i]); i++) {

    if (pointDistance(w, reference) <= INTERSECTION_THRESHOLD) {
      return {
        point: waypoints[i],
        bendpoint: true,
        index: i
      };
    }
  }

  return null;
}

function getPathIntersection(waypoints: any, reference: any) {

  let intersections = findPathIntersections(circlePath(reference, INTERSECTION_THRESHOLD), linePath(waypoints), null);

  let a = intersections[0],
      b = intersections[intersections.length - 1],
      idx;

  if (!a) {
    // no intersection
    return null;
  }

  if (a !== b) {

    if (a.segment2 !== b.segment2) {
      // we use the bendpoint in between both segments
      // as the intersection point

      idx = max(a.segment2, b.segment2) - 1;

      return {
        point: waypoints[idx],
        bendpoint: true,
        index: idx
      };
    }

    return {
      point: {
        x: (round(a.x + b.x) / 2),
        y: (round(a.y + b.y) / 2)
      },
      index: a.segment2
    };
  }

  return {
    point: {
      x: round(a.x),
      y: round(a.y)
    },
    index: a.segment2
  };
}

/**
 * Returns the closest point on the connection towards a given reference point.
 *
 * @param  {Array<Point>} waypoints
 * @param  {Point} reference
 *
 * @return {Object} intersection data (segment, point)
 */
export function getApproxIntersection(waypoints: any, reference:any) {
  return getBendpointIntersection(waypoints, reference) || getPathIntersection(waypoints, reference);
}
