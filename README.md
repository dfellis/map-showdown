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

* The ``for`` loop
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
for loop perf: 6ms, 16666666.666666666 items/sec
ES5 map perf: 20ms, 5000000 items/sec
Underscore map perf: 23ms, 4347826.0869565215 items/sec
Async map perf: 98ms, 1020408.1632653062 items/sec
Queue-Flow map perf: 206ms, 485436.8932038835 items/sec
When map perf: 2619ms, 38182.512409316536 items/sec
```

So, the theoretical maximum for this operation is about 14Mops/sec in Javascript. ES5/Underscore drops about half an order of magnitude down to about 5-6Mops/sec. Async is a little under an order of magnitude at 1Mops/sec. queue-flow is down another almost order-of-magnitude at 319kops/sec, and When is an order of magnitude slower than that at 38kops/sec.

That's with the latest versions of each library. Originally queue-flow was below everything (queue-flow at 0.6.11: 6586ms, 15183.723048891588 items/sec) but is now within spitting distance (less than an order of magnitude) of Async. I don't believe its possible for queue-flow to reach the performance of underscore; reaching parity with Async is the target; then there will be no purpose (besides stylistic preferences) to choose Async of queue-flow.

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
