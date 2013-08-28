# map-showdown

A simple benchmark of various methods of performing a map operation. Used to improve the performance of queue-flow.

## Usage

```
npm install
npm test
```

## Test Criteria

This is a simple test of an array of 100,000 integers and mapping it into an array of another 100,000 integers after a bit of simple algebra. This test was chosen specifically to be very bad for queue-flow:

* This test has a fixed-length array, where queue-flow allows the input to be unbounded (a constant stream of data).
* This test can be done synchronously, where queue-flow allows data to be processed synchronously or asynchronously.
* This test is a very simple map operation, no need for events, queues, or anything of the sort, while queue-flow supports all of these.

## The Contestants

* The ``for`` loop in threee forms: an implementation in C (to sober you all on JS perf), an Emscripten-ified version of the C implementation (not a magic bullet), and a pure-JS implementation (to sober you on all of the ``map`` implementations, below)
* The ES5 ``map`` method
* The Underscore ``map`` method
* Async's ``map`` method
* When's ``map`` method
* queue-flow's ``map`` method

The ``for`` loop is the tried-and-true mechanism for iterating through a set of values. Nothing is pushed/popped on the stack, everything happens within one event loop tick. It's the theoretical maximum speed for this sort of operation, and if you need speed and can use it, you should.

The ES5 ``map`` method is the functional-style, synchronous mechanism for altering a set of values. Extra method calls must be paid for, so it cannot possibly be as fast as the ``for`` loop, but just how big is the performance penalty?

The Underscore ``map`` method is included because many front-end devs use it instead of the ES5 mechanism so they don't have to worry about older browsers. Conceptually identical, just included to see what the performance penalty of a JS-only implementation of ``map`` is.

Async's ``map`` method is the first that supports asynchronous processing and results. Async is designed to be a collection of async patterns and is as barebones as possible. It takes care of the nesting you'd normally have for single-level operations (like this) but composing multiple async operations one after another can start getting ugly.

When's ``map`` method converts promises for turning an array of values into another array of values and resolves them. [When claims to be the fastest promises implementation](https://github.com/cujojs/promise-perf-tests#test-results) so I used it for that style of async data handling.

queue-flow's ``map`` method converts input values into their mapped values synchronously or asynchronously, and can handle either a fixed array or a continuous input stream. All other solutions assume a bounded array, so this is sort of apples-to-oranges.

## Results (on my machine)

```
C for perf: 567ms, speed 176366843033.509705 items/sec
Emscripten-ified C for perf: 80ms, speed 12500000.000000 items/sec
for loop perf: 12ms, 10749166.666666666 items/sec
ES5 map perf: 13ms, 9922307.692307692 items/sec
Underscore map perf: 13ms, 9922307.692307692 items/sec
Async map perf: 109ms, 1183394.495412844 items/sec
Queue-Flow map perf: 142ms, 908380.2816901408 items/sec
When map perf: 2808ms, 45936.609686609685 items/sec
Q sorta-map perf: 4289ms, 30074.60946607601 items/sec
```

That's with the latest versions of each library. Originally queue-flow was below everything (queue-flow at 0.6.11: ``6586ms, 15183.723048891588 items/sec``) but is now almost perfectly equal to Async. I don't believe its possible for queue-flow to reach the performance of underscore, but now there is no purpose (besides stylistic preferences) to choose Async over queue-flow.

## JS performance as a percentage of C performance (on my machine)

Simple math, but I think it should be easily accessible. It also lists how many times slower each JS mechanism is compared to C:

```
Type                           percentage     times slower
---------------------------    -----------    ----------------
C for perf                     100.000000%    0
Emscripten-ified C for perf    0.007088%      14108.3474426808
for loop perf                  0.006095%      16406.4898550439
ES5 map perf                   0.005626%      17773.7806762976
Underscore map perf            0.005626%      17773.7806762976
Async map perf                 0.000671%      149033.699516649
Queue-Flow map perf            0.000515%      194154.29661802
When map perf                  0.000026%      3839351.62608028
Q sorta-map perf               0.000017%      5864309.33235695
```

The *best* Javascript can do is run C code via emscripten and still be **fourteen thousand** times slower than the C code. That means in the time emscripten processed one value, native did fourteen thousand of them. A pure JS for loop is **sixteen thousand** times slower than the C code. I suspect the dynamic allocation and resizing of the output array is the source of the difference. Perhaps when V8 gets an asm.js static compiler like Mozilla is building for Firefox this difference will increase.

The ES5 and Underscore pure-synchronous ``map`` mechanisms aren't noticeably slower than a ``for`` loop in V8, so if your target is Node, feel free to use them. Still, it's almost **eighteen thousand** times slower than native.

From there it goes downhill. ``async`` takes roughly **one hundred fifty thousand** times and ``queue-flow`` takes roughly **one hundred ninety thousand** times as long as native -- they're doing their work in a single JS tick (mostly), so this is just the extra overhead of being able to handle asynchronous functions that cross the event loop (and emitting events useful for debugging, in ``queue-flow``'s case).

Once the event loop is *required* (remember this requires a full Javascript context tear-down and set-up between each tick), it becomes silly: ``when`` takes about **three million eight hundred fourty thousand** times as long as native, and ``Q`` takes about *five million eight hundred sixty thousand** times.

There's a reason Node dropped promises from core in its early days.

## License (MIT)

Copyright (C) 2013 by David Ellis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
