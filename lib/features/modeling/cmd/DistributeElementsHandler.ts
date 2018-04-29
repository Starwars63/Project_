import {
  forEach,
  sortBy
} from 'min-dash';


/**
 * A handler that distributes elements evenly.
 */
export default class DistributeElements{
constructor(modeling:any) {
  this._modeling = modeling;
}
_modeling:any;

static $inject = [ 'modeling' ];

 OFF_AXIS:any = {
  x: 'y',
  y: 'x'
};
preExecute = function(context:any) {
  let modeling = this._modeling;

  let groups:any = context.groups,
      axis :any = context.axis,
      dimension :any = context.dimension;

  function updateRange(group:any, element:any) {
    group.range.min = Math.min(element[axis], group.range.min);
    group.range.max = Math.max(element[axis] + element[dimension], group.range.max);
  }

  function center(element:any) {
    return element[axis] + element[dimension] / 2;
  }

  function lastIdx(arr:any) {
    return arr.length - 1;
  }

  function rangeDiff(range:any) {
    return range.max - range.min;
  }

  function centerElement(refCenter:any, element:any) {
    let  delta:any = { y: 0 };

    delta[axis] = refCenter - center(element);

    if (delta[axis]) {

      delta[this.OFF_AXIS[axis]] = 0;

      modeling.moveElements([ element ], delta, element.parent);
    }
  }

  let  firstGroup :any = groups[0],
      lastGroupIdx:any  = lastIdx(groups),
      lastGroup :any = groups[ lastGroupIdx ];

  let  margin:any;
    let   spaceInBetween:any;
         let   groupsSize:any = 0; // the size of each range

  forEach(groups, function(group:any, idx:any) {
    let  sortedElements:any;
      let  refElem:any;
       let refCenter:any;

    if (group.elements.length < 2) {
      if (idx && idx !== groups.length - 1) {
        updateRange(group, group.elements[0]);

        groupsSize += rangeDiff(group.range);
      }
      return;
    }

    sortedElements = sortBy(group.elements, axis);

    refElem = sortedElements[0];

    if (idx === lastGroupIdx) {
      refElem = sortedElements[lastIdx(sortedElements)];
    }

    refCenter = center(refElem);

    // wanna update the ranges after the shapes have been centered
    group.range = null;

    forEach(sortedElements, function(element:any) {

      centerElement(refCenter, element);

      if (group.range === null) {
        group.range = {
          min: element[axis],
          max: element[axis] + element[dimension]
        };

        return;
      }

      // update group's range after centering the range elements
      updateRange(group, element);
    });

    if (idx && idx !== groups.length - 1) {
      groupsSize += rangeDiff(group.range);
    }
  });

  spaceInBetween = Math.abs(lastGroup.range.min - firstGroup.range.max);

  margin = Math.round((spaceInBetween - groupsSize) / (groups.length - 1));

  if (margin < groups.length - 1) {
    return;
  }

  forEach(groups, function(group:any, groupIdx:any) {
    let  delta:any  = {},
        prevGroup:any ;

    if (group === firstGroup || group === lastGroup) {
      return;
    }

    prevGroup = groups[groupIdx - 1];

    group.range.max = 0;

    forEach(group.elements, function(element:any, idx:any) {
      delta[this.OFF_AXIS[axis]] = 0;
      delta[axis] = (prevGroup.range.max - element[axis]) + margin;

      if (group.range.min !== element[axis]) {
        delta[axis] += element[axis] - group.range.min;
      }

      if (delta[axis]) {
        modeling.moveElements([ element ], delta, element.parent);
      }

      group.range.max = Math.max(element[axis] + element[dimension], idx ? group.range.max : 0);
    });
  });
};

postExecute = function(context:any) {

};
}