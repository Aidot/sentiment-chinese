/**
 * AFINN-based sentiment analysis for Node.js
 *
 * @package sentiment
 * @author Andrew Sliwinski <andrewsliwinski@acm.org>
 */

/**
 * Dependencies
 */
var assign   = require('lodash.assign');

var afinn    = require('../data/dict.json');
var notkey   = require('../data/not.json');
var degree  = require('../data/degree.json');
var tokenize = require('./tokenize');

/**
 * Performs sentiment analysis on the provided input 'phrase'.
 *
 * @param {String} Input phrase
 * @param {Object} Optional sentiment additions to AFINN (hash k/v pairs)
 *
 * @return {Object}
 */
module.exports = function (phrase, inject, callback) {
    // Parse arguments
    if (typeof phrase === 'undefined') phrase = '';
    if (typeof inject === 'undefined') inject = null;
    if (typeof inject === 'function') callback = inject;
    if (typeof callback === 'undefined') callback = null;

    // Merge
    if (inject !== null) {
        afinn = assign(afinn, inject);
    }

    // Storage objects
    var tokens      = tokenize(phrase),
        score       = 0,
        scoreEx     = 0,
        words       = [],
        nots        = [],
        degrees     = [],
        positive    = [],
        negative    = [];
    //
    var extraFn = function (type,obj) {
      if (type.hasOwnProperty(obj)) {
        var _score = 0;
        for (var k = len - 2; k < len+2; k++) {
          if (!afinn.hasOwnProperty(tokens[k])) continue;
          _score += afinn[tokens[k]];
        }
      }
      scoreEx += _score;
    }
    // Iterate over tokens
    var len = tokens.length;
    while (len--) {
        var obj = tokens[len];
        var item = afinn[obj];
        //console.log(afinn['开心']);
        // very happy = (1.75-1)*3 + 3
        // if (degree.hasOwnProperty(obj)) {
        //   var _score = 0;
        //   for (var k = len - 2; k < len+2; k++) {
        //     if (!afinn.hasOwnProperty(tokens[k])) continue;
        //     _score += afinn[tokens[k]];
        //     console.log(k, _score, tokens[k]);
        //   }
        //   item = (degree[obj] - 1)*_score;
        //   console.log('--'+item);
        //   degrees.push(obj);
        // }

        if (!afinn.hasOwnProperty(obj)) continue;

        words.push(obj);

        if (item > 0) positive.push(obj);
        if (item < 0) negative.push(obj);
        //check if has not words
        var _nScore = 0;
        for (var k = len - 2; k < len+2; k++) {
          if (!notkey.hasOwnProperty(tokens[k])) continue;
          _nScore += 2*notkey[tokens[k]]*item;
          nots.push(tokens[k]);
        }

        //onsole.log('Nscore---->',_nScore);
        item = item + _nScore;

        //check if has dgree words
        var _dScore = 0;
        for (var k = len - 2; k < len+3; k++) {
          if (!degree.hasOwnProperty(tokens[k])) continue;
          _dScore += (degree[tokens[k]] - 1)*item;
          degrees.push(tokens[k]);
        }
        //console.log('Dscore---->',_dScore);

        item = item + _dScore;
        score += item;

    }

    // Handle optional async interface
    var result = {
        score:          score,
        comparative:    score / tokens.length,
        tokens:         tokens,
        words:          words,
        not:            nots,
        degree:         degrees,
        positive:       positive,
        negative:       negative
    };

    if (callback === null) return result;
    process.nextTick(function () {
        callback(null, result);
    });
};
