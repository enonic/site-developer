//──────────────────────────────────────────────────────────────────────────────
// Imports
//──────────────────────────────────────────────────────────────────────────────
var libs = {
  v: require('/lib/enonic/util/value')
};

// Imported functions
var isSet = libs.v.isSet;

//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
var C    = ','; // Comma
var DQ   = '"'; // Double Quotationmark
var S    = ' '; // Single space
var SQ   = "'"; // Single Quotationmark
var LIKE = 'LIKE';

//──────────────────────────────────────────────────────────────────────────────
// Functions used later
//──────────────────────────────────────────────────────────────────────────────
function wrap(str, before, after) {
  after = isSet(after) ? after : before;
  return before + str + after;
}
exports.wrap = wrap;


function dq(str) {
  return wrap(str, DQ);
}
exports.dq = dq;


function s(str) {
  return wrap(str, S);
}
exports.s = s;


function group(str) {
  return wrap(str, '(', ')');
}
exports.group = group;


function like(prop, str) {
  return prop + s(LIKE) + dq(str);
}
exports.like = like;


function propOpValue(prop, operator, value) {
  return prop + s(operator) + value;
}
exports.propOpValue = propOpValue;


function propEq(prop, value) {
  return propOpValue(prop, '=', value);
}
exports.propEq = propEq;


function sq(str) {
  return wrap(str, SQ);
}
exports.sq = sq;


function arr2List(array) {
  return group(array.map(function(item) {
    return sq(item);
  }).join(C));
}
exports.arr2List = arr2List;


//──────────────────────────────────────────────────────────────────────────────
// Functions not used later
//──────────────────────────────────────────────────────────────────────────────
exports.and = function(str) {
  if (!arguments.length) {return '';}
  if (arguments.length === 1) {return 'AND' + str;}
  var args = Array.prototype.slice.call(arguments);
  return args.join(' AND ');

}


exports.childOf = function(path) {
  return propEq('_parentPath', path);
}


exports.decendantOf = function(path) {
  return like('_path', path + '/*');
}


exports.fulltext = function(fields, searchString, operator) {
  var o = operator ? C + sq(operator) : '';
  return 'fulltext' + group(
    sq(fields) + C +
    sq(searchString) + o
  );
}


exports.join = function() {
  var args = Array.prototype.slice.call(arguments);
  return args.join(' ');
}


exports.ngram = function(fields, searchString, operator) {
  var o = operator ? C + sq(operator) : '';
  return 'ngram' + group(
    sq(fields) + C +
    sq(searchString) + o
  );
}


exports.or = function() {
  if (!arguments.length) {return '';}
  if (arguments.length === 1) {return 'OR' + str;}
  var args = Array.prototype.slice.call(arguments);
  return args.join(' OR ');
}


exports.pathMatch = function(field, path, memm) { // minimum_elements_must_match
  var arr = [field, path];
  isSet(memm) && arr.push(memm);
  return 'pathMatch' + arr2List(arr)
}





exports.propIn = function(prop, array) {
  return propOpValue(prop, 'IN', arr2List(array));
}


exports.propNe = function(prop, value) {
  return propOpValue(prop, '!=', value);
}
