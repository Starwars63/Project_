import {
  isObject,
  assign,
  pick,
  forEach,
  reduce
} from "min-dash";

import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  remove as svgRemove
} from "tiny-svg";

let DEFAULT_BOX_PADDING = 0;

let DEFAULT_LABEL_SIZE = {
  width: 150,
  height: 50
};


function parseAlign(align:any) {

  let parts = align.split('-');

  return {
    horizontal: parts[0] || 'center',
    vertical: parts[1] || 'top'
  };
}

function parsePadding(padding:any) {

  if (isObject(padding)) {
    return assign({ top: 0, left: 0, right: 0, bottom: 0 }, padding);
  } else {
    return {
      top: padding,
      left: padding,
      right: padding,
      bottom: padding
    };
  }
}

function getTextBBox(text: any, fakeText:any) {

  fakeText.textContent = text;

  try {
    var bbox,
        emptyLine = text === '';

    // add dummy text, when line is empty to determine correct height
    fakeText.textContent = emptyLine ? 'dummy' : text;

    bbox = pick(fakeText.getBBox(), [ 'width', 'height' ]);

    if (emptyLine) {
      // correct width
      bbox.width = 0;
    }

    return bbox;
  } catch (e) {
    return { width: 0, height: 0 };
  }
}


/**
 * Layout the next line and return the layouted element.
 *
 * Alters the lines passed.
 *
 * @param  {Array<String>} lines
 * @return {Object} the line descriptor, an object { width, height, text }
 */
function layoutNext(lines: any, maxWidth: any, fakeText:any) {

  var originalLine = lines.shift(),
      fitLine = originalLine;

  var textBBox;

  for (;;) {
    textBBox = getTextBBox(fitLine, fakeText);

    textBBox.width = fitLine ? textBBox.width : 0;

    // try to fit
    if (fitLine === ' ' || fitLine === '' || textBBox.width < Math.round(maxWidth) || fitLine.length < 2) {
      return fit(lines, fitLine, originalLine, textBBox);
    }

    fitLine = shortenLine(fitLine, textBBox.width, maxWidth);
  }
}

function fit(lines:any, fitLine:any, originalLine:any, textBBox:any) {
  if (fitLine.length < originalLine.length) {
    var remainder = originalLine.slice(fitLine.length).trim();

    lines.unshift(remainder);
  }
  return { width: textBBox.width, height: textBBox.height, text: fitLine };
}


/**
 * Shortens a line based on spacing and hyphens.
 * Returns the shortened result on success.
 *
 * @param  {String} line
 * @param  {Number} maxLength the maximum characters of the string
 * @return {String} the shortened string
 */
function semanticShorten(line:any, maxLength:any) {
  var parts = line.split(/(\s|-)/g),
      part,
      shortenedParts = [],
      length = 0;

  // try to shorten via spaces + hyphens
  if (parts.length > 1) {
    while ((part = parts.shift())) {
      if (part.length + length < maxLength) {
        shortenedParts.push(part);
        length += part.length;
      } else {
        // remove previous part, too if hyphen does not fit anymore
        if (part === '-') {
          shortenedParts.pop();
        }

        break;
      }
    }
  }

  return shortenedParts.join('');
}


function shortenLine(line:any, width:any, maxWidth:any) {
  var length = Math.max(line.length * (maxWidth / width), 1);

  // try to shorten semantically (i.e. based on spaces and hyphens)
  let shortenedLine = semanticShorten(line, length);

  if (!shortenedLine) {

    // force shorten by cutting the long word
    shortenedLine = line.slice(0, Math.max(Math.round(length - 1), 1));
  }

  return shortenedLine;
}


function getHelperSvg() {
  let helperSvg:HTMLElement = document.getElementById('helper-svg');

  if (!helperSvg) {
   let chelperSvg: SVGElement = svgCreate('svg');

    svgAttr(chelperSvg, {
      id: 'helper-svg',
      width: 0,
      height: 0,
      style: 'visibility: hidden; position: fixed'
    });

    document.body.appendChild(chelperSvg);
  }

  return helperSvg;
}


/**
 * Creates a new label utility
 *
 * @param {Object} config
 * @param {Dimensions} config.size
 * @param {Number} config.padding
 * @param {Object} config.style
 * @param {String} config.align
 */
export default function Text(config:any) {

  this._config = assign({}, {
    size: DEFAULT_LABEL_SIZE,
    padding: DEFAULT_BOX_PADDING,
    style: {},
    align: 'center-top'
  }, config || {});
}

/**
 * Returns the layouted text as an SVG element.
 *
 * @param {String} text
 * @param {Object} options
 *
 * @return {SVGElement}
 */
Text.prototype.createText = function(text:any, options:any) {
  return this.layoutText(text, options).element;
};

/**
 * Returns a labels layouted dimensions.
 *
 * @param {String} text to layout
 * @param {Object} options
 *
 * @return {Dimensions}
 */
Text.prototype.getDimensions = function(text:any, options:any) {
  return this.layoutText(text, options).dimensions;
};

/**
 * Creates and returns a label and its bounding box.
 *
 * @method Text#createText
 *
 * @param {String} text the text to render on the label
 * @param {Object} options
 * @param {String} options.align how to align in the bounding box.
 *                               Any of { 'center-middle', 'center-top' },
 *                               defaults to 'center-top'.
 * @param {String} options.style style to be applied to the text
 * @param {boolean} options.fitBox indicates if box will be recalculated to
 *                                 fit text
 *
 * @return {Object} { element, dimensions }
 */
Text.prototype.layoutText = function(text:any, options:any) {
  let box = assign({}, this._config.size, options.box),
      style = assign({}, this._config.style, options.style),
      align = parseAlign(options.align || this._config.align),
      padding = parsePadding(options.padding !== undefined ? options.padding : this._config.padding),
      fitBox = options.fitBox || false;

  let lines = text.split(/\r?\n/g),
      layouted = [];

  let maxWidth = box.width - padding.left - padding.right;

  // ensure correct rendering by attaching helper text node to invisible SVG
  let helperText = svgCreate('text');
  svgAttr(helperText, { x: 0, y: 0 });
  svgAttr(helperText, style);

  let helperSvg = getHelperSvg();

  svgAppend(helperSvg, helperText);

  while (lines.length) {
    layouted.push(layoutNext(lines, maxWidth, helperText));
  }

  let totalHeight = reduce(layouted, function(sum:any, line:any, idx:any) {
    return sum + line.height;
  }, null);

  let maxLineWidth = reduce(layouted, function(sum:any, line:any, idx:any) {
    return line.width > sum ? line.width : sum;
  }, null);

  // the y position of the next line
  let y: any, x:any;

  switch (align.vertical) {
  case 'middle':
    y = (box.height - totalHeight) / 2 - layouted[0].height / 4;
    break;

  default:
    y = padding.top;
  }

  let textElement = svgCreate('text');

  svgAttr(textElement, style);

  // layout each line taking into account that parent
  // shape might resize to fit text size
  forEach(layouted, function(line:any) {
    y += line.height;

    switch (align.horizontal) {
    case 'left':
      x = padding.left;
      break;

    case 'right':
      x = ((fitBox ? maxLineWidth : maxWidth)
        - padding.right - line.width);
      break;

    default:
      // aka center
      x = Math.max((((fitBox ? maxLineWidth : maxWidth)
        - line.width) / 2 + padding.left), 0);
    }

    let tspan = svgCreate('tspan');
    svgAttr(tspan, { x , y });

    tspan.textContent = line.text;

    svgAppend(textElement, tspan);
  });

  svgRemove(helperText);

  let dimensions = {
    width: maxLineWidth,
    height: totalHeight
  };

  return {
    dimensions: dimensions,
    element: textElement
  };
};
