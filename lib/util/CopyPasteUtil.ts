import {
  forEach
} from "min-dash";


export function getTopLevel(elements : any) :any {
  let topLevel: any = {},
      parents:any [],
      result: any[],
      clearedParents: any[];

  forEach(elements, function(element:any): any {
    let parent = element.parent;

    if (!topLevel[parent.id]) {
      topLevel[parent.id] = [];
    }

    if (parents.indexOf(parent.id) === -1) {
      parents.push(parent.id);
    }

    topLevel[parent.id].push(element);
  });

  forEach(parents, function(parent : any) {
    forEach(topLevel[parent], function(element:any) {
      if (topLevel[element.id]) {
        clearedParents.push(element.id);
      }
    });
  });

  forEach(parents, function(parent: any) {
    let idx = clearedParents.indexOf(parent);

    if (idx === -1) {
      result = result.concat(topLevel[parent]);
    }
  });

  return result;
}