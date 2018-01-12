var C = ',';
var DQ = '"';
var SQ = "'";

// Functions used later
exports.dq = function(str) {
  return DQ + str + DQ;
}


exports.group = function(str) {
  return '(' + str + ')';
}


exports.sq = function(str) {
  return SQ + str + SQ;
}


exports.arr2List = function(array) {
  return exports.group(array.map(function(item) {
    return exports.sq(item);
  }).join(C));
}


// Functions not used later
exports.and = function(str) {
  if (!arguments.length) {return '';}
  if (arguments.length === 1) {return 'AND' + str;}
  var args = Array.prototype.slice.call(arguments);
  return args.join(' AND ');

}


exports.fulltext = function(fields, searchString, operator) {
  var o = operator ? C + exports.sq(operator) : '';
  return 'fulltext' + exports.group(
    exports.sq(fields) + C +
    exports.sq(searchString) + o
  );
}


exports.join = function() {
  var args = Array.prototype.slice.call(arguments);
  return args.join(' ');
}


exports.like = function(prop, str) {
  return prop + ' LIKE ' + exports.dq(str);
}


exports.ngram = function(fields, searchString, operator) {
  var o = operator ? C + exports.sq(operator) : '';
  return 'ngram' + exports.group(
    exports.sq(fields) + C +
    exports.sq(searchString) + o
  );
}


exports.or = function() {
  if (!arguments.length) {return '';}
  if (arguments.length === 1) {return 'OR' + str;}
  var args = Array.prototype.slice.call(arguments);
  return args.join(' OR ');
}


exports.propIn = function(prop, array) {
  return prop + ' IN ' + exports.arr2List(array);
}
