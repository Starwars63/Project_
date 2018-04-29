declare module "path-intersection"
{
    import * as pa from "path-intersection"
    
    
  
    export function is(o:any , type:any):any;
    export function clone(obj:any):any;
    
    export function repush(array:any, item:any) :any;
    
    export function cacher(f:any, scope:any, postprocessor:any):any;
    
    export function parsePathString(pathString:any):any;
    
    export function paths(ps:any):any;
    
    export function box(x:any, y:any, width:any, height:any):any;
    
    export function pathToString():string;
    
    export function pathClone(pathArray:any):any;
    
    export function findDotsAtSegment(p1x:any, p1y:any, c1x:any, c1y:any, c2x:any, c2y:any, p2x:any, p2y:any, t:any):any;
    
    export function bezierBBox(p1x:any, p1y:any, c1x:any, c1y:any, c2x:any, c2y:any, p2x:any, p2y:any):any;
    
    export function isPointInsideBBox(bbox:any, x:any, y:any):any;
    
    export function isBBoxIntersect(bbox1:any, bbox2:any):any;
    
    export function base3(t:any, p1:any, p2:any, p3:any, p4:any):any;
    
    export function bezlen(x1:any, y1:any, x2:any, y2:any, x3:any, y3:any, x4:any, y4:any, z:any):any;
    
    export function intersectLines(x1:any, y1:any, x2:any, y2:any, x3:any, y3:any, x4:any, y4:any):any;
    
    export function findBezierIntersections(bez1:any, bez2:any, justCount:any):any;
    
    export function findPathIntersections(path1:any, path2:any, justCount:any):any;
   
    
    export function rectPath(x:any, y:any, w:any, h:any, r:any):any;
    
    export function ellipsePath(x:any, y:any, rx:any, ry:any, a:any):any;
    
    export function pathToAbsolute(pathArray:any):any;
    
    export function lineToCurve(x1:any, y1:any, x2:any, y2:any):any;
    
    export function qubicToCurve(x1:any, y1:any, ax:any, ay:any, x2:any, y2:any):any;
    
    export function arcToCurve(x1:any, y1:any, rx:any, ry:any, angle:any, large_arc_flag:any, sweep_flag:any, x2:any, y2:any, recursive:any):any;
    
    export function catmulRomToBezier(crp:any, z:any):any
    
    export function curveBBox(x0:any, y0:any, x1:any, y1:any, x2:any, y2:any, x3:any, y3:any):any;
    
    export function pathToCurve(path:any, path2:any):any;
    }
    