import {
  forEach
} from "min-dash";


export function getTopLevel(elements : any) :any {
  var topLevel = {},
      parents: any[],
      result: any[],
      clearedParents: any[];

  forEach(elements, function(element:any): any {
    var parent = element.parent;

    if (!topLevel[parent.id]) {
      topLevel[parent.id] = [];
    }

    if (parents.indexOf(parent.id) === -1) {
      parents.push(parent.id);
    }

    topLevel[parent.id].push(element);
  });

  forEach(parents, function(parent) {
    forEach(topLevel[parent], function(element) {
      if (topLevel[element.id]) {
        clearedParents.push(element.id);
      }
    });
  });

  forEach(parents, function(parent) {
    let idx = clearedParents.indexOf(parent);

    if (idx === -1) {
      result = result.concat(topLevel[parent]);
    }
  });

  return result;
}