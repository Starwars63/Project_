import {
  clear as domClear,
  delegate as domDelegate,
  query as domQuery,
  classes as domClasses,
  attr as domAttr,
  domify as domify
} from 'min-dom';

import {
  getBBox as getBoundingBox
} from '../../util/Elements';


/**
 * Provides searching infrastructure
 */
export default class SearchPad{
  constructor(canvas:any, eventBus:any, overlays:any, selection:any) {
  this._open = false;
  this._results = [];
  this._eventMaps = [];

  this._canvas = canvas;
  this._eventBus = eventBus;
  this._overlays = overlays;
  this._selection = selection;

  // setup elements
  this._container = domify(this.BOX_HTML);
  this._searchInput = domQuery(this.INPUT_SELECTOR, this._container);
  this._resultsContainer = domQuery(this.RESULTS_CONTAINER_SELECTOR, this._container);

  // attach search pad
  this._canvas.getContainer().appendChild(this._container);

  // cleanup on destroy
  eventBus.on([ 'canvas.destroy', 'diagram.destroy' ], this.close, this);
}
_open:any; _results:any; _eventMaps:any;
_canvas:any; _eventBus:any; _overlays:any; _selection:any;
_container:any; _searchInput:any; _resultsContainer:any;



static $inject = [
  'canvas',
  'eventBus',
  'overlays',
  'selection'
];


/**
 * CONSTANTS
 */
CONTAINER_SELECTOR = '.djs-search-container';
INPUT_SELECTOR = '.djs-search-input input';
RESULTS_CONTAINER_SELECTOR = '.djs-search-results';
RESULT_SELECTOR = '.djs-search-result';
RESULT_SELECTED_CLASS = 'djs-search-result-selected';
RESULT_SELECTED_SELECTOR = '.' + this.RESULT_SELECTED_CLASS;
RESULT_ID_ATTRIBUTE = 'data-result-id';
RESULT_HIGHLIGHT_CLASS = 'djs-search-highlight';
OVERLAY_CLASS = 'djs-search-overlay';

BOX_HTML =
  '<div class="djs-search-container djs-draggable djs-scrollable">' +
    '<div class="djs-search-input">' +
      '<input type="text"/>' +
    '</div>' +
    '<div class="djs-search-results"></div>' +
  '</div>';

RESULT_HTML =
  '<div class="djs-search-result"></div>';

RESULT_PRIMARY_HTML =
  '<div class="djs-search-result-primary"></div>';

RESULT_SECONDARY_HTML =
  '<p class="djs-search-result-secondary"></p>';


/**
 * Binds and keeps track of all event listereners
 */
_bindEvents = function() {
  let  self = this;

  function listen(el:any, selector:any, type:any, fn:any) {
    self._eventMaps.push({
      el: el,
      type: type,
      listener: domDelegate.bind(el, selector, type, fn)
    });
  }

  // close search on clicking anywhere outside
  listen(document, 'html', 'click', function(e:any) {
    self.close();
  });

  // stop event from propagating and closing search
  // focus on input
  listen(this._container, this.INPUT_SELECTOR, 'click', function(e:any) {
    e.stopPropagation();
    e.delegateTarget.focus();
  });

  // preselect result on hover
  listen(this._container, this.RESULT_SELECTOR, 'mouseover', function(e:any) {
    e.stopPropagation();
    self._scrollToNode(e.delegateTarget);
    self._preselect(e.delegateTarget);
  });

  // selects desired result on mouse click
  listen(this._container, this.RESULT_SELECTOR, 'click', function(e:any) {
    e.stopPropagation();
    self._select(e.delegateTarget);
  });

  // prevent cursor in input from going left and right when using up/down to
  // navigate results
  listen(this._container, this.INPUT_SELECTOR, 'keydown', function(e:any) {
    // up
    if (e.keyCode === 38) {
      e.preventDefault();
    }

    // down
    if (e.keyCode === 40) {
      e.preventDefault();
    }
  });

  // handle keyboard input
  listen(this._container, this.INPUT_SELECTOR, 'keyup', function(e:any) {
    // escape
    if (e.keyCode === 27) {
      return self.close();
    }

    // enter
    if (e.keyCode === 13) {
      let  selected = self._getCurrentResult();

      return selected ? self._select(selected) : self.close();
    }

    // up
    if (e.keyCode === 38) {
      return self._scrollToDirection(true);
    }

    // down
    if (e.keyCode === 40) {
      return self._scrollToDirection();
    }

    // left && right
    // do not search while navigating text input
    if (e.keyCode === 37 || e.keyCode === 39) {
      return;
    }

    // anything else
    self._search(e.delegateTarget.value);
  });
};


/**
 * Unbinds all previously established listeners
 */
_unbindEvents = function() {
  this._eventMaps.forEach(function(m:any) {
    domDelegate.unbind(m.el, m.type, m.listener);
  });
};


/**
 * Performs a search for the given pattern.
 *
 * @param  {String} pattern
 */
_search = function(pattern:any) {
  let  self = this;

  this._clearResults();

  // do not search on empty query
  if (!pattern || pattern === '') {
    return;
  }

  let  searchResults = this._searchProvider.find(pattern);

  if (!searchResults.length) {
    return;
  }

  // append new results
  searchResults.forEach(function(result:any) {
    let  id = result.element.id;
    let  node = self._createResultNode(result, id);
    self._results[id] = {
      element: result.element,
      node: node
    };
  });

  // preselect first result
  let  node :any = domQuery(this.RESULT_SELECTOR, this._resultsContainer);
  this._scrollToNode(node);
  this._preselect(node);
};


/**
 * Navigate to the previous/next result. Defaults to next result.
 * @param  {Boolean} previous
 */
_scrollToDirection = function(previous:any) {
  let  selected = this._getCurrentResult();
  if (!selected) {
    return;
  }

  let  node = previous ? selected.previousElementSibling : selected.nextElementSibling;
  if (node) {
    this._scrollToNode(node);
    this._preselect(node);
  }
};


/**
 * Scroll to the node if it is not visible.
 *
 * @param  {Element} node
 */
_scrollToNode = function(node:any) {
  if (!node || node === this._getCurrentResult()) {
    return;
  }

  let  nodeOffset:any = node.offsetTop;
  let  containerScroll:any = this._resultsContainer.scrollTop;

  let  bottomScroll:any = nodeOffset - this._resultsContainer.clientHeight + node.clientHeight;

  if (nodeOffset < containerScroll) {
    this._resultsContainer.scrollTop = nodeOffset;
  } else if (containerScroll < bottomScroll) {
    this._resultsContainer.scrollTop = bottomScroll;
  }
};


/**
 * Clears all results data.
 */
_clearResults = function() {
  domClear(this._resultsContainer);

  this._results = [];

  this._resetOverlay();

  this._eventBus.fire('searchPad.cleared');
};


/**
 * Get currently selected result.
 *
 * @return {Element}
 */
_getCurrentResult = function() {
  return domQuery(this.RESULT_SELECTED_SELECTOR, this._resultsContainer);
};


/**
 * Create result DOM element within results container
 * that corresponds to a search result.
 *
 * 'result' : one of the elements returned by SearchProvider
 * 'id' : id attribute value to assign to the new DOM node
 * return : created DOM element
 *
 * @param  {SearchResult} result
 * @param  {String} id
 * @return {Element}
 */
_createResultNode = function(result:any, id:any) {
  let  node:any = domify(this.RESULT_HTML);

  // create only if available
  if (result.primaryTokens.length > 0) {
    createInnerTextNode(node, result.primaryTokens, this.RESULT_PRIMARY_HTML);
  }

  // secondary tokens (represent element ID) are allways available
  createInnerTextNode(node, result.secondaryTokens, this.ECONDARY_HTML);

  domAttr(node, this.RESULT_ID_ATTRIBUTE, id);

  this._resultsContainer.appendChild(node);

  return node;
};


/**
 * Register search element provider.
 *
 * SearchProvider.find - provides search function over own elements
 *  (pattern) => [{ text: <String>, element: <Element>}, ...]
 *
 * @param  {SearchProvider} provider
 */
registerProvider = function(provider:any) {
  this._searchProvider = provider;
};


/**
 * Open search pad.
 */
open = function() {
  if (!this._searchProvider) {
    throw new Error('no search provider registered');
  }

  if (this.isOpen()) {
    return;
  }

  this._bindEvents();

  this._open = true;

  domClasses(this._container).add('open');

  this._searchInput.focus();

  this._eventBus.fire('searchPad.opened');
};


/**
 * Close search pad.
 */
close = function() {
  if (!this.isOpen()) {
    return;
  }

  this._unbindEvents();

  this._open = false;

  domClasses(this._container).remove('open');

  this._clearResults();

  this._searchInput.value = '';
  this._searchInput.blur();

  this._resetOverlay();

  this._eventBus.fire('searchPad.closed');
};


/**
 * Toggles search pad on/off.
 */
toggle = function() {
  this.isOpen() ? this.close() : this.open();
};


/**
 * Report state of search pad.
 */
isOpen = function() {
  return this._open;
};


/**
 * Preselect result entry.
 *
 * @param  {Element} element
 */
_preselect = function(node:any) {
  let  selectedNode = this._getCurrentResult();

  // already selected
  if (node === selectedNode) {
    return;
  }

  // removing preselection from current node
  if (selectedNode) {
    domClasses(selectedNode).remove(this.RESULT_SELECTED_CLASS);
  }

  let  id = domAttr(node, this.RESULT_ID_ATTRIBUTE);
  let  element = this._results[id].element;

  domClasses(node).add(this.RESULT_SELECTED_CLASS);

  this._resetOverlay(element);

  this._centerViewbox(element);

  this._selection.select(element);

  this._eventBus.fire('searchPad.preselected', element);
};


/**
 * Select result node.
 *
 * @param  {Element} element
 */
_select = function(node:any) {
  let  id :any = domAttr(node, this.RESULT_ID_ATTRIBUTE);
  let  element:any = this._results[id].element;

  this.close();

  this._resetOverlay();

  this._centerViewbox(element);

  this._selection.select(element);

  this._eventBus.fire('searchPad.selected', element);
};


/**
 * Center viewbox on the element middle point.
 *
 * @param  {Element} element
 */
_centerViewbox = function(element:any) {
  let  viewbox = this._canvas.viewbox();

  let  box:any= getBoundingBox(element,null);

  let  newViewbox = {
    x: (box.x + box.width/2) - viewbox.outer.width/2,
    y: (box.y + box.height/2) - viewbox.outer.height/2,
    width: viewbox.outer.width,
    height: viewbox.outer.height
  };

  this._canvas.viewbox(newViewbox);

  this._canvas.zoom(viewbox.scale);
};


/**
 * Reset overlay removes and, optionally, set
 * overlay to a new element.
 *
 * @param  {Element} element
 */
_resetOverlay = function(element:any) {
  if (this._overlayId) {
    this._overlays.remove(this._overlayId);
  }

  if (element) {
    let  box:any = getBoundingBox(element,null);
    let  overlay :any= constructOverlay(box);
    this._overlayId = this._overlays.add(element, overlay);
  }
};


}

/**
 * Construct overlay object for the given bounding box.
 *
 * @param  {BoundingBox} box
 * @return {Object}
 */
function constructOverlay(box:any) {

  let  offset = 6;
  let  w = box.width + offset * 2;
  let  h = box.height + offset * 2;

  let  styles = [
    'width: '+ w +'px',
    'height: '+ h + 'px'
  ].join('; ');

  return {
    position: {
      bottom: h - offset,
      right: w - offset
    },
    show: true,
    html: '<div style="' + styles + '" class="' + this.OVERLAY_CLASS + '"></div>'
  };
}


/**
 * Creates and appends child node from result tokens and HTML template.
 *
 * @param  {Element} node
 * @param  {Array<Object>} tokens
 * @param  {String} template
 */
function createInnerTextNode(parentNode:any, tokens:any, template:any) {
  let  text = createHtmlText(tokens);
  let  childNode = domify(template);
  childNode.innerHTML = text;
  parentNode.appendChild(childNode);
}

/**
 * Create internal HTML markup from result tokens.
 * Caters for highlighting pattern matched tokens.
 *
 * @param  {Array<Object>} tokens
 * @return {String}
 */
function createHtmlText(tokens:any) {
  let  htmlText = '';

  tokens.forEach(function(t:any) {
    if (t.matched) {
      htmlText += '<strong class="' + this.RESULT_HIGHLIGHT_CLASS + '">' + t.matched + '</strong>';
    } else {
      htmlText += t.normal;
    }
  });

  return htmlText !== '' ? htmlText : null;
}