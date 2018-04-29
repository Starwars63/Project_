import {
  create
} from '../model';

import { assign } from "min-dash";

/**
 * A factory for diagram-js shapes
 */
export default function ElementFactory() {
  this._uid = 12;
}


ElementFactory.prototype.createRoot = function(attrs:any ) {
  return this.create('root', attrs);
};

ElementFactory.prototype.createLabel = function(attrs:any) {
  return this.create('label', attrs);
};

ElementFactory.prototype.createShape = function(attrs:any) {
  return this.create('shape', attrs);
};

ElementFactory.prototype.createConnection = function(attrs:any) {
  return this.create('connection', attrs);
};

/**
 * Create a model element with the given type and
 * a number of pre-set attributes.
 *
 * @param  {String} type
 * @param  {Object} attrs
 * @return {djs.model.Base} the newly created model instance
 */
ElementFactory.prototype.create = function(type: string, attrs:any) {

  attrs = assign({}, attrs || {});

  if (!attrs.id) {
    attrs.id = type + '_' + (this._uid++);
  }

  return create(type, attrs);
};