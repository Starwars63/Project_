import {
  filter,
  forEach,
  sortBy
} from 'min-dash';

function last(arr:any) {
  return arr && arr[arr.length - 1];
}

function sortTopOrMiddle(element:any) {
  return element.y;
}

function sortLeftOrCenter(element:any) {
  return element.x;
}

/**
 * Sorting functions for different types of alignment
 *
 * @type {Object}
 *
 * @return {Function}
 */
let  ALIGNMENT_SORTING:any = {
  left: sortLeftOrCenter,
  center: sortLeftOrCenter,
  
  right: function(element:any) {
    return element.x + element.width;
  },
  top: sortTopOrMiddle,
  middle: sortTopOrMiddle,
  bottom: function(element:any) {
    return element.y + element.height;
  }
};


export default class AlignElements{
  constructor(modeling:any) {
  this._modeling = modeling;
}
_modeling:any;

/**
 * Executes the alignment of a selection of elements
 *
 * @param  {Array} elements [description]
 * @param  {String} type left|right|center|top|bottom|middle
 */
trigger = function(elements:any, type:any) {
  let  modeling = this._modeling;

  let  filteredElements = filter(elements, function(element:any) {
    return !(element.waypoints || element.host || element.labelTarget);
  });

  let  sortFn = ALIGNMENT_SORTING[type];

  let  sortedElements = sortBy(filteredElements, sortFn);

  let  alignment = this._alignmentPosition(type, sortedElements);

  modeling.alignElements(sortedElements, alignment);
};
static $inject = [ 'modeling' ];


/**
 * Get the relevant "axis" and "dimension" related to the current type of alignment
 *
 * @param  {String} type left|right|center|top|bottom|middle
 *
 * @return {Object} { axis, dimension }
 */
_getOrientationDetails = function(type:any) {
  let  vertical = [ 'top', 'bottom', 'middle' ],
      axis = 'x',
      dimension = 'width';

  if (vertical.indexOf(type) !== -1) {
    axis = 'y';
    dimension = 'height';
  }

  return {
    axis: axis,
    dimension: dimension
  };
};

_isType = function(type:any, types:any) {
  return types.indexOf(type) !== -1;
};

/**
 * Get a point on the relevant axis where elements should align to
 *
 * @param  {String} type left|right|center|top|bottom|middle
 * @param  {Array} sortedElements
 *
 * @return {Object}
 */
_alignmentPosition = function(type:any, sortedElements:any) {
  let  orientation: any = this._getOrientationDetails(type),
      axis :any = orientation.axis,
      dimension:any = orientation.dimension,
      alignment:any = {},
      centers:any = {},
      hasSharedCenters:any = false,
      centeredElements:any,
      firstElement:any,
      lastElement:any;
     

  function getMiddleOrTop(first:any, last:any) {
    return Math.round((first[axis] + last[axis] + last[dimension]) / 2);
  }

  if (this._isType(type, [ 'left', 'top' ])) {
    alignment[type] = sortedElements[0][axis];

  } else if (this._isType(type, [ 'right', 'bottom' ])) {
    lastElement = last(sortedElements);

    alignment[type] = lastElement[axis] + lastElement[dimension];

  } else if (this._isType(type, [ 'center', 'middle' ])) {

    // check if there is a center shared by more than one shape
    // if not, just take the middle of the range
    forEach(sortedElements, function(element:any) {
      let  center = element[axis] + Math.round(element[dimension] / 2);

      if (centers[center]) {
        centers[center].elements.push(element);
      } else {
        centers[center] = {
          elements: [ element ],
          center: center
        };
      }
    });

    centeredElements = sortBy(centers, function(center:any) {
      if (center.elements.length > 1) {
        hasSharedCenters = true;
      }

      return center.elements.length;
    });

    if (hasSharedCenters) {
      alignment[type] = last(centeredElements).center;

      return alignment;
    }

    firstElement = sortedElements[0];

    sortedElements = sortBy(sortedElements, function(element:any) {
      return element[axis] + element[dimension];
    });

    lastElement = last(sortedElements);

    alignment[type] = getMiddleOrTop(firstElement, lastElement);
  }

  return alignment;
};

}
