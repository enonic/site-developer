/* eslint-disable no-param-reassign */

//──────────────────────────────────────────────────────────────────────────────
// Imports
//──────────────────────────────────────────────────────────────────────────────
import {isSet} from '/lib/enonic/util/value';


//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
const C    = ','; // Comma
const DQ   = '"'; // Double Quotationmark
const S    = ' '; // Single space
const SQ   = "'"; // Single Quotationmark
const LIKE = 'LIKE';


//──────────────────────────────────────────────────────────────────────────────
// Private functions
//──────────────────────────────────────────────────────────────────────────────
function wrap(str, before, after) {
    after = isSet(after) ? after : before;
    return before + str + after;
}


function dq(str) {
    return wrap(str, DQ);
}


function s(str) {
    return wrap(str, S);
}


function propOpValue(prop, operator, value) {
    return prop + s(operator) + value;
}


function sq(str) {
    return wrap(str, SQ);
}


//──────────────────────────────────────────────────────────────────────────────
// Exports used later in this file
//──────────────────────────────────────────────────────────────────────────────
export function group(str) {
    return wrap(str, '(', ')');
}


export function arr2List(array) {
    return group(array.map(item => sq(item)).join(C));
}


export function like(prop, str) {
    return prop + s(LIKE) + dq(str);
}


export function propEq(prop, value) {
    return propOpValue(prop, '=', sq(value));
}


//──────────────────────────────────────────────────────────────────────────────
// Exports not used later in this file
//──────────────────────────────────────────────────────────────────────────────
export function and(...args) {
    if (Array.isArray(args)) {
        if (args.length === 1) {
            return `AND${args}`;
        }
        return args.join(' AND ');
    }
    return `AND${args}`;
}


export function childOf(path) {
    return propEq('_parentPath', path);
}


export function decendantOf(path) {
    return like('_path', `${path}/*`);
}


export function fulltext(fields, searchString, operator) {
    const o = operator ? C + sq(operator) : '';
    return `fulltext${group(sq(fields) + C + sq(searchString) + o)}`;
}


export function join(...args) {
    return args.join(' ');
}


export function ngram(fields, searchString, operator) {
    const o = operator ? C + sq(operator) : '';
    return `ngram${group(sq(fields) + C + sq(searchString) + o)}`;
}


export function or(...args) {
    if (Array.isArray(args)) {
        if (args.length === 1) {
            return `OR${args}`;
        }
        return args.join(' OR ');
    }
    return `OR${args}`;
}


export function pathMatch(field, path, memm) { // minimum_elements_must_match
    const arr = [field, path];
    if (isSet(memm)) { arr.push(memm); }
    return `pathMatch${arr2List(arr)}`;
}


export function propIn(prop, array) {
    return propOpValue(prop, 'IN', arr2List(array));
}


export function propNe(prop, value) {
    return propOpValue(prop, '!=', value);
}
