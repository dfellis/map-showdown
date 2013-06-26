var _ = require('underscore');
var async = require('async');
var when = require('when');
var whenNodeFn = require('when/node/function');
var q = require('queue-flow');

var testArray = [];
for(var i = 0; i < 100000; i++) {
    testArray[i] = i;
}

function perfPrint(name, start, end) {
    var time = end - start;
    var speed = 1000 * 100000 / time;
    console.log(name + ' perf: ' + time + 'ms, ' + speed + ' items/sec');
}

// for loop perf
var startFor = Date.now();
var outFor = [];
for(var i = 0; i < testArray.length; i++) {
    outFor[i] = 2*testArray[i]+1;
}
var endFor = Date.now();
perfPrint('for loop', startFor, endFor);

// es5 map perf
var startES5 = Date.now();
var outES5 = testArray.map(function(val) { return 2*val+1; });
var endES5 = Date.now();
perfPrint('ES5 map', startES5, endES5);

// underscore map perf
var startUnderscore = Date.now();
var outUnderscore = _.map(testArray, function(val) { return 2*val+1; });
var endUnderscore = Date.now();
perfPrint('Underscore map', startUnderscore, endUnderscore);

// outer async to handle the async nature of the next three
// shouldn't affect test results
async.series([
    function(done) {
        var startAsync = Date.now();
        async.map(testArray, function(val, callback) { callback(null, 2*val+1); }, function(err, outAsync) {
            var endAsync = Date.now();
            perfPrint('Async map', startAsync, endAsync);
            done();
        });
    },
    function(done) {
        var startWhen = Date.now();
        when.map(testArray, function(val) { return 2*val+1; }).then(function(outWhen) {
            var endWhen = Date.now();
            perfPrint('When map', startWhen, endWhen);
            done();
        });
    },
    function(done) {
        var startQ = Date.now();
        q(testArray).map(function(val) { return 2*val+1; }).toArray(function(outQ) {
            var endQ = Date.now();
            perfPrint('Queue-Flow map', startQ, endQ);
            done();
        });
    }
]);
