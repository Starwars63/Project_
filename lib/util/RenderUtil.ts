import {
  attr as svgAttr,
  create as svgCreate
} from "tiny-svg";


export function componentsToPath(elements:any) {
  return elements.join(',').replace(/,?([A-z]),?/g, '$1');
}

export function toSVGPoints(points:any ) {
  var result = '';

  for (var i = 0, p; (p = points[i]); i++) {
    result += p.x + ',' + p.y + ' ';
  }

  return result;
}

export function createLine(points:any, attrs:any) {

  var line = svgCreate('polyline');
  svgAttr(line, { points: toSVGPoints(points) });

  if (attrs) {
    svgAttr(line, attrs);
  }

  return line;
}

export function updateLine(gfx: any , points:any ) {
  svgAttr(gfx, { points: toSVGPoints(points) });

  return gfx;
}
