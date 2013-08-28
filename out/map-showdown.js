// Note: Some Emscripten settings will significantly limit the speed of the generated code.
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');
// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function(filename) { return Module['read'](filename, true) };
  Module['load'] = function(f) {
    globalEval(read(f));
  };
  Module['arguments'] = process['argv'].slice(2);
  module.exports = Module;
}
if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  Module['read'] = read;
  Module['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  this['Module'] = Module;
}
if (ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) {
  Module['print'] = function(x) {
    console.log(x);
  };
  Module['printErr'] = function(x) {
    console.log(x);
  };
  this['Module'] = Module;
}
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
}
if (ENVIRONMENT_IS_WORKER) {
  // We can do very little here...
  var TRY_USE_DUMP = false;
  Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
    dump(x);
  }) : (function(x) {
    // self.postMessage(x); // enable this if you want stdout to be sent as messages
  }));
  Module['load'] = importScripts;
}
if (!ENVIRONMENT_IS_WORKER && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_SHELL) {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];
// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (type == 'i64' || type == 'double' || vararg) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          alignSize = type.alignSize || QUANTUM_SIZE;
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      assert(args.length == sig.length-1);
      return FUNCTION_TABLE[ptr].apply(null, args);
    } else {
      assert(sig.length == 1);
      return FUNCTION_TABLE[ptr]();
    }
  },
  addFunction: function (func) {
    var table = FUNCTION_TABLE;
    var ret = table.length;
    table.push(func);
    table.push(0);
    return ret;
  },
  removeFunction: function (index) {
    var table = FUNCTION_TABLE;
    table[index] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xff;
      if (needed) {
        buffer.push(code);
        needed--;
      }
      if (buffer.length == 0) {
        if (code < 128) return String.fromCharCode(code);
        buffer.push(code);
        if (code > 191 && code < 224) {
          needed = 1;
        } else {
          needed = 2;
        }
        return '';
      }
      if (needed > 0) return '';
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var ret;
      if (c1 > 191 && c1 < 224) {
        ret = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
      } else {
        ret = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3);(assert((STACKTOP|0) < (STACK_MAX|0))|0); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + (assert(DYNAMICTOP > 0),size))|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? (((low)>>>(0))+(((high)>>>(0))*4294967296)) : (((low)>>>(0))+(((high)|(0))*4294967296))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var setjmpId = 1; // Used in setjmp/longjmp
var setjmpLabels = {};
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,Math.min(Math.floor((value)/4294967296), 4294967295)>>>0],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    assert(type, 'Must know what type to store in allocate!');
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited
var runtimeInitialized = false;
function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;
function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;
function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;
function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;
function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledInit = false, calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 10000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    } 
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  // always do this asynchronously, to keep shell and web as similar as possible
  addOnPreRun(function() {
    if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
      applyData(Module['readBinary'](filename));
    } else {
      Browser.asyncLoad(filename, function(data) {
        applyData(data);
      }, function(data) {
        throw 'could not load memory initializer ' + filename;
      });
    }
  });
}
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 560;
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });
/* memory initializer */ allocate([69,109,115,99,114,105,112,116,101,110,45,105,102,105,101,100,32,67,32,102,111,114,0,0,37,115,32,112,101,114,102,58,32,37,100,109,115,44,32,115,112,101,101,100,32,37,102,32,105,116,101,109,115,47,115,101,99,10,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
function runPostSets() {
}
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:35,EIDRM:36,ECHRNG:37,EL2NSYNC:38,EL3HLT:39,EL3RST:40,ELNRNG:41,EUNATCH:42,ENOCSI:43,EL2HLT:44,EDEADLK:45,ENOLCK:46,EBADE:50,EBADR:51,EXFULL:52,ENOANO:53,EBADRQC:54,EBADSLT:55,EDEADLOCK:56,EBFONT:57,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:74,ELBIN:75,EDOTDOT:76,EBADMSG:77,EFTYPE:79,ENOTUNIQ:80,EBADFD:81,EREMCHG:82,ELIBACC:83,ELIBBAD:84,ELIBSCN:85,ELIBMAX:86,ELIBEXEC:87,ENOSYS:88,ENMFILE:89,ENOTEMPTY:90,ENAMETOOLONG:91,ELOOP:92,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:106,EPROTOTYPE:107,ENOTSOCK:108,ENOPROTOOPT:109,ESHUTDOWN:110,ECONNREFUSED:111,EADDRINUSE:112,ECONNABORTED:113,ENETUNREACH:114,ENETDOWN:115,ETIMEDOUT:116,EHOSTDOWN:117,EHOSTUNREACH:118,EINPROGRESS:119,EALREADY:120,EDESTADDRREQ:121,EMSGSIZE:122,EPROTONOSUPPORT:123,ESOCKTNOSUPPORT:124,EADDRNOTAVAIL:125,ENETRESET:126,EISCONN:127,ENOTCONN:128,ETOOMANYREFS:129,EPROCLIM:130,EUSERS:131,EDQUOT:132,ESTALE:133,ENOTSUP:134,ENOMEDIUM:135,ENOSHARE:136,ECASECLASH:137,EILSEQ:138,EOVERFLOW:139,ECANCELED:140,ENOTRECOVERABLE:141,EOWNERDEAD:142,ESTRPIPE:143};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  var __impure_ptr=allocate(1, "i32*", ALLOC_STATIC);var FS={currentPath:"/",nextInode:2,streams:[null],checkStreams:function () {
        for (var i in FS.streams) if (FS.streams.hasOwnProperty(i)) assert(i >= 0 && i < FS.streams.length); // no keys not in dense span
        for (var i = 0; i < FS.streams.length; i++) assert(typeof FS.streams[i] == 'object'); // no non-null holes in dense span
      },ignorePermissions:true,createFileHandle:function (stream, fd) {
        if (typeof stream === 'undefined') {
          stream = null;
        }
        if (!fd) {
          if (stream && stream.socket) {
            for (var i = 1; i < 64; i++) {
              if (!FS.streams[i]) {
                fd = i;
                break;
              }
            }
            assert(fd, 'ran out of low fds for sockets');
          } else {
            fd = Math.max(FS.streams.length, 64);
            for (var i = FS.streams.length; i < fd; i++) {
              FS.streams[i] = null; // Keep dense
            }
          }
        }
        // Close WebSocket first if we are about to replace the fd (i.e. dup2)
        if (FS.streams[fd] && FS.streams[fd].socket && FS.streams[fd].socket.close) {
          FS.streams[fd].socket.close();
        }
        FS.streams[fd] = stream;
        return fd;
      },removeFileHandle:function (fd) {
        FS.streams[fd] = null;
      },joinPath:function (parts, forceRelative) {
        var ret = parts[0];
        for (var i = 1; i < parts.length; i++) {
          if (ret[ret.length-1] != '/') ret += '/';
          ret += parts[i];
        }
        if (forceRelative && ret[0] == '/') ret = ret.substr(1);
        return ret;
      },absolutePath:function (relative, base) {
        if (typeof relative !== 'string') return null;
        if (base === undefined) base = FS.currentPath;
        if (relative && relative[0] == '/') base = '';
        var full = base + '/' + relative;
        var parts = full.split('/').reverse();
        var absolute = [''];
        while (parts.length) {
          var part = parts.pop();
          if (part == '' || part == '.') {
            // Nothing.
          } else if (part == '..') {
            if (absolute.length > 1) absolute.pop();
          } else {
            absolute.push(part);
          }
        }
        return absolute.length == 1 ? '/' : absolute.join('/');
      },analyzePath:function (path, dontResolveLastLink, linksVisited) {
        var ret = {
          isRoot: false,
          exists: false,
          error: 0,
          name: null,
          path: null,
          object: null,
          parentExists: false,
          parentPath: null,
          parentObject: null
        };
        path = FS.absolutePath(path);
        if (path == '/') {
          ret.isRoot = true;
          ret.exists = ret.parentExists = true;
          ret.name = '/';
          ret.path = ret.parentPath = '/';
          ret.object = ret.parentObject = FS.root;
        } else if (path !== null) {
          linksVisited = linksVisited || 0;
          path = path.slice(1).split('/');
          var current = FS.root;
          var traversed = [''];
          while (path.length) {
            if (path.length == 1 && current.isFolder) {
              ret.parentExists = true;
              ret.parentPath = traversed.length == 1 ? '/' : traversed.join('/');
              ret.parentObject = current;
              ret.name = path[0];
            }
            var target = path.shift();
            if (!current.isFolder) {
              ret.error = ERRNO_CODES.ENOTDIR;
              break;
            } else if (!current.read) {
              ret.error = ERRNO_CODES.EACCES;
              break;
            } else if (!current.contents.hasOwnProperty(target)) {
              ret.error = ERRNO_CODES.ENOENT;
              break;
            }
            current = current.contents[target];
            if (current.link && !(dontResolveLastLink && path.length == 0)) {
              if (linksVisited > 40) { // Usual Linux SYMLOOP_MAX.
                ret.error = ERRNO_CODES.ELOOP;
                break;
              }
              var link = FS.absolutePath(current.link, traversed.join('/'));
              ret = FS.analyzePath([link].concat(path).join('/'),
                                   dontResolveLastLink, linksVisited + 1);
              return ret;
            }
            traversed.push(target);
            if (path.length == 0) {
              ret.exists = true;
              ret.path = traversed.join('/');
              ret.object = current;
            }
          }
        }
        return ret;
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },createObject:function (parent, name, properties, canRead, canWrite) {
        if (!parent) parent = '/';
        if (typeof parent === 'string') parent = FS.findObject(parent);
        if (!parent) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent path must exist.');
        }
        if (!parent.isFolder) {
          ___setErrNo(ERRNO_CODES.ENOTDIR);
          throw new Error('Parent must be a folder.');
        }
        if (!parent.write && !FS.ignorePermissions) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent folder must be writeable.');
        }
        if (!name || name == '.' || name == '..') {
          ___setErrNo(ERRNO_CODES.ENOENT);
          throw new Error('Name must not be empty.');
        }
        if (parent.contents.hasOwnProperty(name)) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          throw new Error("Can't overwrite object.");
        }
        parent.contents[name] = {
          read: canRead === undefined ? true : canRead,
          write: canWrite === undefined ? false : canWrite,
          timestamp: Date.now(),
          inodeNumber: FS.nextInode++
        };
        for (var key in properties) {
          if (properties.hasOwnProperty(key)) {
            parent.contents[name][key] = properties[key];
          }
        }
        return parent.contents[name];
      },createFolder:function (parent, name, canRead, canWrite) {
        var properties = {isFolder: true, isDevice: false, contents: {}};
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createPath:function (parent, path, canRead, canWrite) {
        var current = FS.findObject(parent);
        if (current === null) throw new Error('Invalid parent.');
        path = path.split('/').reverse();
        while (path.length) {
          var part = path.pop();
          if (!part) continue;
          if (!current.contents.hasOwnProperty(part)) {
            FS.createFolder(current, part, canRead, canWrite);
          }
          current = current.contents[part];
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        properties.isFolder = false;
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createDataFile:function (parent, name, data, canRead, canWrite) {
        if (typeof data === 'string') {
          var dataArray = new Array(data.length);
          for (var i = 0, len = data.length; i < len; ++i) dataArray[i] = data.charCodeAt(i);
          data = dataArray;
        }
        var properties = {
          isDevice: false,
          contents: data.subarray ? data.subarray(0) : data // as an optimization, create a new array wrapper (not buffer) here, to help JS engines understand this object
        };
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          var LazyUint8Array = function() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
              if (!hasByteServing) chunkSize = datalength;
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile) {
        Browser.init();
        var fullname = FS.joinPath([parent, name], true);
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },createLink:function (parent, name, target, canRead, canWrite) {
        var properties = {isDevice: false, link: target};
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createDevice:function (parent, name, input, output) {
        if (!(input || output)) {
          throw new Error('A device must have at least one callback defined.');
        }
        var ops = {isDevice: true, input: input, output: output};
        return FS.createFile(parent, name, ops, Boolean(input), Boolean(output));
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },staticInit:function () {
        // The main file system tree. All the contents are inside this.
        FS.root = {
          read: true,
          write: true,
          isFolder: true,
          isDevice: false,
          timestamp: Date.now(),
          inodeNumber: 1,
          contents: {}
        };
        // Create the temporary folder, if not already created
        try {
          FS.createFolder('/', 'tmp', true, true);
        } catch(e) {}
        FS.createFolder('/', 'dev', true, true);
      },init:function (input, output, error) {
        // Make sure we initialize only once.
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        input = input || Module['stdin'];
        output = output || Module['stdout'];
        error = error || Module['stderr'];
        // Default handlers.
        var stdinOverridden = true, stdoutOverridden = true, stderrOverridden = true;
        if (!input) {
          stdinOverridden = false;
          input = function() {
            if (!input.cache || !input.cache.length) {
              var result;
              if (typeof window != 'undefined' &&
                  typeof window.prompt == 'function') {
                // Browser.
                result = window.prompt('Input: ');
                if (result === null) result = String.fromCharCode(0); // cancel ==> EOF
              } else if (typeof readline == 'function') {
                // Command line.
                result = readline();
              }
              if (!result) result = '';
              input.cache = intArrayFromString(result + '\n', true);
            }
            return input.cache.shift();
          };
        }
        var utf8 = new Runtime.UTF8Processor();
        function createSimpleOutput() {
          var fn = function (val) {
            if (val === null || val === 10) {
              fn.printer(fn.buffer.join(''));
              fn.buffer = [];
            } else {
              fn.buffer.push(utf8.processCChar(val));
            }
          };
          return fn;
        }
        if (!output) {
          stdoutOverridden = false;
          output = createSimpleOutput();
        }
        if (!output.printer) output.printer = Module['print'];
        if (!output.buffer) output.buffer = [];
        if (!error) {
          stderrOverridden = false;
          error = createSimpleOutput();
        }
        if (!error.printer) error.printer = Module['printErr'];
        if (!error.buffer) error.buffer = [];
        // Create the I/O devices.
        var stdin = FS.createDevice('/dev', 'stdin', input);
        stdin.isTerminal = !stdinOverridden;
        var stdout = FS.createDevice('/dev', 'stdout', null, output);
        stdout.isTerminal = !stdoutOverridden;
        var stderr = FS.createDevice('/dev', 'stderr', null, error);
        stderr.isTerminal = !stderrOverridden;
        FS.createDevice('/dev', 'tty', input, output);
        FS.createDevice('/dev', 'null', function(){}, function(){});
        // Create default streams.
        FS.streams[1] = {
          path: '/dev/stdin',
          object: stdin,
          position: 0,
          isRead: true,
          isWrite: false,
          isAppend: false,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[2] = {
          path: '/dev/stdout',
          object: stdout,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[3] = {
          path: '/dev/stderr',
          object: stderr,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          error: false,
          eof: false,
          ungotten: []
        };
        // TODO: put these low in memory like we used to assert on: assert(Math.max(_stdin, _stdout, _stderr) < 15000); // make sure these are low, we flatten arrays with these
        HEAP32[((_stdin)>>2)]=1;
        HEAP32[((_stdout)>>2)]=2;
        HEAP32[((_stderr)>>2)]=3;
        // Other system paths
        FS.createPath('/', 'dev/shm/tmp', true, true); // temp files
        // Newlib initialization
        for (var i = FS.streams.length; i < Math.max(_stdin, _stdout, _stderr) + 4; i++) {
          FS.streams[i] = null; // Make sure to keep FS.streams dense
        }
        FS.streams[_stdin] = FS.streams[1];
        FS.streams[_stdout] = FS.streams[2];
        FS.streams[_stderr] = FS.streams[3];
        FS.checkStreams();
        // see previous TODO on stdin etc.: assert(FS.streams.length < 1024); // at this early stage, we should not have a large set of file descriptors - just a few
        allocate([ allocate(
          [0, 0, 0, 0, _stdin, 0, 0, 0, _stdout, 0, 0, 0, _stderr, 0, 0, 0],
          'void*', ALLOC_NORMAL) ], 'void*', ALLOC_NONE, __impure_ptr);
      },quit:function () {
        if (!FS.init.initialized) return;
        // Flush any partially-printed lines in stdout and stderr. Careful, they may have been closed
        if (FS.streams[2] && FS.streams[2].object.output.buffer.length > 0) FS.streams[2].object.output(10);
        if (FS.streams[3] && FS.streams[3].object.output.buffer.length > 0) FS.streams[3].object.output(10);
      },standardizePath:function (path) {
        if (path.substr(0, 2) == './') path = path.substr(2);
        return path;
      },deleteFile:function (path) {
        path = FS.analyzePath(path);
        if (!path.parentExists || !path.exists) {
          throw 'Invalid path ' + path;
        }
        delete path.parentObject.contents[path.name];
      }};
  function _send(fd, buf, len, flags) {
      var info = FS.streams[fd];
      if (!info) return -1;
      info.sender(HEAPU8.subarray(buf, buf+len));
      return len;
    }
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var contents = stream.object.contents;
        while (contents.length < offset) contents.push(0);
        for (var i = 0; i < nbyte; i++) {
          contents[offset + i] = HEAPU8[(((buf)+(i))|0)];
        }
        stream.object.timestamp = Date.now();
        return i;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (stream && ('socket' in stream)) {
          return _send(fildes, buf, nbyte, 0);
      } else if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        if (stream.object.isDevice) {
          if (stream.object.output) {
            for (var i = 0; i < nbyte; i++) {
              try {
                stream.object.output(HEAP8[(((buf)+(i))|0)]);
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
            }
            stream.object.timestamp = Date.now();
            return i;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var bytesWritten = _pwrite(fildes, buf, nbyte, stream.position);
          if (bytesWritten != -1) stream.position += bytesWritten;
          return bytesWritten;
        }
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  function _strlen(ptr) {
      ptr = ptr|0;
      var curr = 0;
      curr = ptr;
      while (HEAP8[(curr)]) {
        curr = (curr + 1)|0;
      }
      return (curr - ptr)|0;
    }
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (flagAlwaysSigned) {
                if (currArg < 0) {
                  prefix = '-' + prefix;
                } else {
                  prefix = '+' + prefix;
                }
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (flagAlwaysSigned && currArg >= 0) {
                  argText = '+' + argText;
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }
  function _clock() {
      if (_clock.start === undefined) _clock.start = Date.now();
      return Math.floor((Date.now() - _clock.start) * (1000/1000));
    }
  function _abort() {
      Module['abort']();
    }
  function ___errno_location() {
      return ___errno_state;
    }var ___errno=___errno_location;
  function _memcpy(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      var ret = 0;
      ret = dest|0;
      if ((dest&3) == (src&3)) {
        while (dest & 3) {
          if ((num|0) == 0) return ret|0;
          HEAP8[(dest)]=HEAP8[(src)];
          dest = (dest+1)|0;
          src = (src+1)|0;
          num = (num-1)|0;
        }
        while ((num|0) >= 4) {
          HEAP32[((dest)>>2)]=HEAP32[((src)>>2)];
          dest = (dest+4)|0;
          src = (src+4)|0;
          num = (num-4)|0;
        }
      }
      while ((num|0) > 0) {
        HEAP8[(dest)]=HEAP8[(src)];
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      return ret|0;
    }var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
        case 10: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }
  function _memset(ptr, value, num) {
      ptr = ptr|0; value = value|0; num = num|0;
      var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
      stop = (ptr + num)|0;
      if ((num|0) >= 20) {
        // This is unaligned, but quite large, so work hard to get to aligned settings
        value = value & 0xff;
        unaligned = ptr & 3;
        value4 = value | (value << 8) | (value << 16) | (value << 24);
        stop4 = stop & ~3;
        if (unaligned) {
          unaligned = (ptr + 4 - unaligned)|0;
          while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
            HEAP8[(ptr)]=value;
            ptr = (ptr+1)|0;
          }
        }
        while ((ptr|0) < (stop4|0)) {
          HEAP32[((ptr)>>2)]=value4;
          ptr = (ptr+4)|0;
        }
      }
      while ((ptr|0) < (stop|0)) {
        HEAP8[(ptr)]=value;
        ptr = (ptr+1)|0;
      }
    }
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : console.log("warning: cannot create object URLs");
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          assert(typeof url == 'string', 'createObjectURL must return a url as a string');
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            assert(typeof url == 'string', 'createObjectURL must return a url as a string');
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x = event.pageX - (window.scrollX + rect.left);
          var y = event.pageY - (window.scrollY + rect.top);
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var FUNCTION_TABLE = [0, 0];
// EMSCRIPTEN_START_FUNCS
function _perfPrint($name, $start, $end) {
 var label = 0;
 var sp  = STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var $name_addr;
 var $start_addr;
 var $end_addr;
 var $time;
 var $speed;
 $name_addr=$name;
 $start_addr=$start;
 $end_addr=$end;
 var $0=$end_addr;
 var $1=$start_addr;
 var $sub=((($0)-($1))|0);
 var $div=(((($sub)>>>(0)))&-1);
 $time=$div;
 var $2=$time;
 var $conv=(($2)|(0));
 var $div1=(1000000000)/($conv);
 $speed=$div1;
 var $3=$name_addr;
 var $4=$time;
 var $5=$speed;
 var $call=_printf(((32)|0), (tempInt=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempInt)>>2)]=$3,HEAP32[(((tempInt)+(8))>>2)]=$4,HEAPF64[(((tempInt)+(16))>>3)]=$5,tempInt));
 STACKTOP = sp;
 return;
}
function _main() {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $retval;
   var $testArray;
   var $i;
   var $outFor;
   var $startFor;
   var $i3;
   var $endFor;
   $retval=0;
   var $call=_malloc(4000000);
   var $0=$call;
   $testArray=$0;
   $i=0;
   label = 2; break;
  case 2: 
   var $1=$i;
   var $cmp=(($1)|(0)) < 1000000;
   if ($cmp) { label = 3; break; } else { label = 5; break; }
  case 3: 
   var $2=$i;
   var $3=$i;
   var $4=$testArray;
   var $arrayidx=(($4+($3<<2))|0);
   HEAP32[(($arrayidx)>>2)]=$2;
   label = 4; break;
  case 4: 
   var $5=$i;
   var $inc=((($5)+(1))|0);
   $i=$inc;
   label = 2; break;
  case 5: 
   var $call1=_malloc(4000000);
   var $6=$call1;
   $outFor=$6;
   var $call2=_clock();
   $startFor=$call2;
   $i3=0;
   label = 6; break;
  case 6: 
   var $7=$i3;
   var $cmp5=(($7)|(0)) < 1000000;
   if ($cmp5) { label = 7; break; } else { label = 9; break; }
  case 7: 
   var $8=$i3;
   var $9=$testArray;
   var $arrayidx7=(($9+($8<<2))|0);
   var $10=HEAP32[(($arrayidx7)>>2)];
   var $mul=($10<<1);
   var $add=((($mul)+(1))|0);
   var $11=$i3;
   var $12=$outFor;
   var $arrayidx8=(($12+($11<<2))|0);
   HEAP32[(($arrayidx8)>>2)]=$add;
   label = 8; break;
  case 8: 
   var $13=$i3;
   var $inc10=((($13)+(1))|0);
   $i3=$inc10;
   label = 6; break;
  case 9: 
   var $call12=_clock();
   $endFor=$call12;
   var $14=$startFor;
   var $15=$endFor;
   _perfPrint(((8)|0), $14, $15);
   return 0;
  default: assert(0, "bad label: " + label);
 }
}
Module["_main"] = _main;
function _malloc($bytes) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $cmp=(($bytes)>>>(0)) < 245;
   if ($cmp) { label = 2; break; } else { label = 78; break; }
  case 2: 
   var $cmp1=(($bytes)>>>(0)) < 11;
   if ($cmp1) { var $cond = 16;label = 4; break; } else { label = 3; break; }
  case 3: 
   var $add2=((($bytes)+(11))|0);
   var $and=$add2 & -8;
   var $cond = $and;label = 4; break;
  case 4: 
   var $cond;
   var $shr=$cond >>> 3;
   var $0=HEAP32[((((96)|0))>>2)];
   var $shr3=$0 >>> (($shr)>>>(0));
   var $and4=$shr3 & 3;
   var $cmp5=(($and4)|(0))==0;
   if ($cmp5) { label = 12; break; } else { label = 5; break; }
  case 5: 
   var $neg=$shr3 & 1;
   var $and7=$neg ^ 1;
   var $add8=((($and7)+($shr))|0);
   var $shl=$add8 << 1;
   var $arrayidx=((136+($shl<<2))|0);
   var $1=$arrayidx;
   var $arrayidx_sum=((($shl)+(2))|0);
   var $2=((136+($arrayidx_sum<<2))|0);
   var $3=HEAP32[(($2)>>2)];
   var $fd9=(($3+8)|0);
   var $4=HEAP32[(($fd9)>>2)];
   var $cmp10=(($1)|(0))==(($4)|(0));
   if ($cmp10) { label = 6; break; } else { label = 7; break; }
  case 6: 
   var $shl12=1 << $add8;
   var $neg13=$shl12 ^ -1;
   var $and14=$0 & $neg13;
   HEAP32[((((96)|0))>>2)]=$and14;
   label = 11; break;
  case 7: 
   var $5=$4;
   var $6=HEAP32[((((112)|0))>>2)];
   var $cmp15=(($5)>>>(0)) < (($6)>>>(0));
   if ($cmp15) { label = 10; break; } else { label = 8; break; }
  case 8: 
   var $bk=(($4+12)|0);
   var $7=HEAP32[(($bk)>>2)];
   var $cmp16=(($7)|(0))==(($3)|(0));
   if ($cmp16) { label = 9; break; } else { label = 10; break; }
  case 9: 
   HEAP32[(($bk)>>2)]=$1;
   HEAP32[(($2)>>2)]=$4;
   label = 11; break;
  case 10: 
   _abort();
   throw "Reached an unreachable!";
  case 11: 
   var $shl22=$add8 << 3;
   var $or23=$shl22 | 3;
   var $head=(($3+4)|0);
   HEAP32[(($head)>>2)]=$or23;
   var $8=$3;
   var $add_ptr_sum106=$shl22 | 4;
   var $head25=(($8+$add_ptr_sum106)|0);
   var $9=$head25;
   var $10=HEAP32[(($9)>>2)];
   var $or26=$10 | 1;
   HEAP32[(($9)>>2)]=$or26;
   var $11=$fd9;
   var $mem_0 = $11;label = 344; break;
  case 12: 
   var $12=HEAP32[((((104)|0))>>2)];
   var $cmp29=(($cond)>>>(0)) > (($12)>>>(0));
   if ($cmp29) { label = 13; break; } else { var $nb_0 = $cond;label = 161; break; }
  case 13: 
   var $cmp31=(($shr3)|(0))==0;
   if ($cmp31) { label = 27; break; } else { label = 14; break; }
  case 14: 
   var $shl35=$shr3 << $shr;
   var $shl37=2 << $shr;
   var $sub=(((-$shl37))|0);
   var $or40=$shl37 | $sub;
   var $and41=$shl35 & $or40;
   var $sub42=(((-$and41))|0);
   var $and43=$and41 & $sub42;
   var $sub44=((($and43)-(1))|0);
   var $shr45=$sub44 >>> 12;
   var $and46=$shr45 & 16;
   var $shr47=$sub44 >>> (($and46)>>>(0));
   var $shr48=$shr47 >>> 5;
   var $and49=$shr48 & 8;
   var $add50=$and49 | $and46;
   var $shr51=$shr47 >>> (($and49)>>>(0));
   var $shr52=$shr51 >>> 2;
   var $and53=$shr52 & 4;
   var $add54=$add50 | $and53;
   var $shr55=$shr51 >>> (($and53)>>>(0));
   var $shr56=$shr55 >>> 1;
   var $and57=$shr56 & 2;
   var $add58=$add54 | $and57;
   var $shr59=$shr55 >>> (($and57)>>>(0));
   var $shr60=$shr59 >>> 1;
   var $and61=$shr60 & 1;
   var $add62=$add58 | $and61;
   var $shr63=$shr59 >>> (($and61)>>>(0));
   var $add64=((($add62)+($shr63))|0);
   var $shl65=$add64 << 1;
   var $arrayidx66=((136+($shl65<<2))|0);
   var $13=$arrayidx66;
   var $arrayidx66_sum=((($shl65)+(2))|0);
   var $14=((136+($arrayidx66_sum<<2))|0);
   var $15=HEAP32[(($14)>>2)];
   var $fd69=(($15+8)|0);
   var $16=HEAP32[(($fd69)>>2)];
   var $cmp70=(($13)|(0))==(($16)|(0));
   if ($cmp70) { label = 15; break; } else { label = 16; break; }
  case 15: 
   var $shl72=1 << $add64;
   var $neg73=$shl72 ^ -1;
   var $and74=$0 & $neg73;
   HEAP32[((((96)|0))>>2)]=$and74;
   label = 20; break;
  case 16: 
   var $17=$16;
   var $18=HEAP32[((((112)|0))>>2)];
   var $cmp76=(($17)>>>(0)) < (($18)>>>(0));
   if ($cmp76) { label = 19; break; } else { label = 17; break; }
  case 17: 
   var $bk78=(($16+12)|0);
   var $19=HEAP32[(($bk78)>>2)];
   var $cmp79=(($19)|(0))==(($15)|(0));
   if ($cmp79) { label = 18; break; } else { label = 19; break; }
  case 18: 
   HEAP32[(($bk78)>>2)]=$13;
   HEAP32[(($14)>>2)]=$16;
   label = 20; break;
  case 19: 
   _abort();
   throw "Reached an unreachable!";
  case 20: 
   var $shl90=$add64 << 3;
   var $sub91=((($shl90)-($cond))|0);
   var $or93=$cond | 3;
   var $head94=(($15+4)|0);
   HEAP32[(($head94)>>2)]=$or93;
   var $20=$15;
   var $add_ptr95=(($20+$cond)|0);
   var $21=$add_ptr95;
   var $or96=$sub91 | 1;
   var $add_ptr95_sum103=$cond | 4;
   var $head97=(($20+$add_ptr95_sum103)|0);
   var $22=$head97;
   HEAP32[(($22)>>2)]=$or96;
   var $add_ptr98=(($20+$shl90)|0);
   var $prev_foot=$add_ptr98;
   HEAP32[(($prev_foot)>>2)]=$sub91;
   var $23=HEAP32[((((104)|0))>>2)];
   var $cmp99=(($23)|(0))==0;
   if ($cmp99) { label = 26; break; } else { label = 21; break; }
  case 21: 
   var $24=HEAP32[((((116)|0))>>2)];
   var $shr101=$23 >>> 3;
   var $shl102=$shr101 << 1;
   var $arrayidx103=((136+($shl102<<2))|0);
   var $25=$arrayidx103;
   var $26=HEAP32[((((96)|0))>>2)];
   var $shl105=1 << $shr101;
   var $and106=$26 & $shl105;
   var $tobool107=(($and106)|(0))==0;
   if ($tobool107) { label = 22; break; } else { label = 23; break; }
  case 22: 
   var $or110=$26 | $shl105;
   HEAP32[((((96)|0))>>2)]=$or110;
   var $arrayidx103_sum_pre=((($shl102)+(2))|0);
   var $_pre=((136+($arrayidx103_sum_pre<<2))|0);
   var $F104_0 = $25;var $_pre_phi = $_pre;label = 25; break;
  case 23: 
   var $arrayidx103_sum104=((($shl102)+(2))|0);
   var $27=((136+($arrayidx103_sum104<<2))|0);
   var $28=HEAP32[(($27)>>2)];
   var $29=$28;
   var $30=HEAP32[((((112)|0))>>2)];
   var $cmp113=(($29)>>>(0)) < (($30)>>>(0));
   if ($cmp113) { label = 24; break; } else { var $F104_0 = $28;var $_pre_phi = $27;label = 25; break; }
  case 24: 
   _abort();
   throw "Reached an unreachable!";
  case 25: 
   var $_pre_phi;
   var $F104_0;
   HEAP32[(($_pre_phi)>>2)]=$24;
   var $bk122=(($F104_0+12)|0);
   HEAP32[(($bk122)>>2)]=$24;
   var $fd123=(($24+8)|0);
   HEAP32[(($fd123)>>2)]=$F104_0;
   var $bk124=(($24+12)|0);
   HEAP32[(($bk124)>>2)]=$25;
   label = 26; break;
  case 26: 
   HEAP32[((((104)|0))>>2)]=$sub91;
   HEAP32[((((116)|0))>>2)]=$21;
   var $31=$fd69;
   var $mem_0 = $31;label = 344; break;
  case 27: 
   var $32=HEAP32[((((100)|0))>>2)];
   var $cmp128=(($32)|(0))==0;
   if ($cmp128) { var $nb_0 = $cond;label = 161; break; } else { label = 28; break; }
  case 28: 
   var $sub_i=(((-$32))|0);
   var $and_i=$32 & $sub_i;
   var $sub2_i=((($and_i)-(1))|0);
   var $shr_i=$sub2_i >>> 12;
   var $and3_i=$shr_i & 16;
   var $shr4_i=$sub2_i >>> (($and3_i)>>>(0));
   var $shr5_i=$shr4_i >>> 5;
   var $and6_i=$shr5_i & 8;
   var $add_i=$and6_i | $and3_i;
   var $shr7_i=$shr4_i >>> (($and6_i)>>>(0));
   var $shr8_i=$shr7_i >>> 2;
   var $and9_i=$shr8_i & 4;
   var $add10_i=$add_i | $and9_i;
   var $shr11_i=$shr7_i >>> (($and9_i)>>>(0));
   var $shr12_i=$shr11_i >>> 1;
   var $and13_i=$shr12_i & 2;
   var $add14_i=$add10_i | $and13_i;
   var $shr15_i=$shr11_i >>> (($and13_i)>>>(0));
   var $shr16_i=$shr15_i >>> 1;
   var $and17_i=$shr16_i & 1;
   var $add18_i=$add14_i | $and17_i;
   var $shr19_i=$shr15_i >>> (($and17_i)>>>(0));
   var $add20_i=((($add18_i)+($shr19_i))|0);
   var $arrayidx_i=((400+($add20_i<<2))|0);
   var $33=HEAP32[(($arrayidx_i)>>2)];
   var $head_i=(($33+4)|0);
   var $34=HEAP32[(($head_i)>>2)];
   var $and21_i=$34 & -8;
   var $sub22_i=((($and21_i)-($cond))|0);
   var $t_0_i = $33;var $v_0_i = $33;var $rsize_0_i = $sub22_i;label = 29; break;
  case 29: 
   var $rsize_0_i;
   var $v_0_i;
   var $t_0_i;
   var $arrayidx23_i=(($t_0_i+16)|0);
   var $35=HEAP32[(($arrayidx23_i)>>2)];
   var $cmp_i=(($35)|(0))==0;
   if ($cmp_i) { label = 30; break; } else { var $cond7_i = $35;label = 31; break; }
  case 30: 
   var $arrayidx27_i=(($t_0_i+20)|0);
   var $36=HEAP32[(($arrayidx27_i)>>2)];
   var $cmp28_i=(($36)|(0))==0;
   if ($cmp28_i) { label = 32; break; } else { var $cond7_i = $36;label = 31; break; }
  case 31: 
   var $cond7_i;
   var $head29_i=(($cond7_i+4)|0);
   var $37=HEAP32[(($head29_i)>>2)];
   var $and30_i=$37 & -8;
   var $sub31_i=((($and30_i)-($cond))|0);
   var $cmp32_i=(($sub31_i)>>>(0)) < (($rsize_0_i)>>>(0));
   var $sub31_rsize_0_i=$cmp32_i ? $sub31_i : $rsize_0_i;
   var $cond_v_0_i=$cmp32_i ? $cond7_i : $v_0_i;
   var $t_0_i = $cond7_i;var $v_0_i = $cond_v_0_i;var $rsize_0_i = $sub31_rsize_0_i;label = 29; break;
  case 32: 
   var $38=$v_0_i;
   var $39=HEAP32[((((112)|0))>>2)];
   var $cmp33_i=(($38)>>>(0)) < (($39)>>>(0));
   if ($cmp33_i) { label = 76; break; } else { label = 33; break; }
  case 33: 
   var $add_ptr_i=(($38+$cond)|0);
   var $40=$add_ptr_i;
   var $cmp35_i=(($38)>>>(0)) < (($add_ptr_i)>>>(0));
   if ($cmp35_i) { label = 34; break; } else { label = 76; break; }
  case 34: 
   var $parent_i=(($v_0_i+24)|0);
   var $41=HEAP32[(($parent_i)>>2)];
   var $bk_i=(($v_0_i+12)|0);
   var $42=HEAP32[(($bk_i)>>2)];
   var $cmp40_i=(($42)|(0))==(($v_0_i)|(0));
   if ($cmp40_i) { label = 40; break; } else { label = 35; break; }
  case 35: 
   var $fd_i=(($v_0_i+8)|0);
   var $43=HEAP32[(($fd_i)>>2)];
   var $44=$43;
   var $cmp45_i=(($44)>>>(0)) < (($39)>>>(0));
   if ($cmp45_i) { label = 39; break; } else { label = 36; break; }
  case 36: 
   var $bk47_i=(($43+12)|0);
   var $45=HEAP32[(($bk47_i)>>2)];
   var $cmp48_i=(($45)|(0))==(($v_0_i)|(0));
   if ($cmp48_i) { label = 37; break; } else { label = 39; break; }
  case 37: 
   var $fd50_i=(($42+8)|0);
   var $46=HEAP32[(($fd50_i)>>2)];
   var $cmp51_i=(($46)|(0))==(($v_0_i)|(0));
   if ($cmp51_i) { label = 38; break; } else { label = 39; break; }
  case 38: 
   HEAP32[(($bk47_i)>>2)]=$42;
   HEAP32[(($fd50_i)>>2)]=$43;
   var $R_1_i = $42;label = 47; break;
  case 39: 
   _abort();
   throw "Reached an unreachable!";
  case 40: 
   var $arrayidx61_i=(($v_0_i+20)|0);
   var $47=HEAP32[(($arrayidx61_i)>>2)];
   var $cmp62_i=(($47)|(0))==0;
   if ($cmp62_i) { label = 41; break; } else { var $R_0_i = $47;var $RP_0_i = $arrayidx61_i;label = 42; break; }
  case 41: 
   var $arrayidx65_i=(($v_0_i+16)|0);
   var $48=HEAP32[(($arrayidx65_i)>>2)];
   var $cmp66_i=(($48)|(0))==0;
   if ($cmp66_i) { var $R_1_i = 0;label = 47; break; } else { var $R_0_i = $48;var $RP_0_i = $arrayidx65_i;label = 42; break; }
  case 42: 
   var $RP_0_i;
   var $R_0_i;
   var $arrayidx71_i=(($R_0_i+20)|0);
   var $49=HEAP32[(($arrayidx71_i)>>2)];
   var $cmp72_i=(($49)|(0))==0;
   if ($cmp72_i) { label = 43; break; } else { var $R_0_i = $49;var $RP_0_i = $arrayidx71_i;label = 42; break; }
  case 43: 
   var $arrayidx75_i=(($R_0_i+16)|0);
   var $50=HEAP32[(($arrayidx75_i)>>2)];
   var $cmp76_i=(($50)|(0))==0;
   if ($cmp76_i) { label = 44; break; } else { var $R_0_i = $50;var $RP_0_i = $arrayidx75_i;label = 42; break; }
  case 44: 
   var $51=$RP_0_i;
   var $cmp81_i=(($51)>>>(0)) < (($39)>>>(0));
   if ($cmp81_i) { label = 46; break; } else { label = 45; break; }
  case 45: 
   HEAP32[(($RP_0_i)>>2)]=0;
   var $R_1_i = $R_0_i;label = 47; break;
  case 46: 
   _abort();
   throw "Reached an unreachable!";
  case 47: 
   var $R_1_i;
   var $cmp90_i=(($41)|(0))==0;
   if ($cmp90_i) { label = 67; break; } else { label = 48; break; }
  case 48: 
   var $index_i=(($v_0_i+28)|0);
   var $52=HEAP32[(($index_i)>>2)];
   var $arrayidx94_i=((400+($52<<2))|0);
   var $53=HEAP32[(($arrayidx94_i)>>2)];
   var $cmp95_i=(($v_0_i)|(0))==(($53)|(0));
   if ($cmp95_i) { label = 49; break; } else { label = 51; break; }
  case 49: 
   HEAP32[(($arrayidx94_i)>>2)]=$R_1_i;
   var $cond5_i=(($R_1_i)|(0))==0;
   if ($cond5_i) { label = 50; break; } else { label = 57; break; }
  case 50: 
   var $54=HEAP32[(($index_i)>>2)];
   var $shl_i=1 << $54;
   var $neg_i=$shl_i ^ -1;
   var $55=HEAP32[((((100)|0))>>2)];
   var $and103_i=$55 & $neg_i;
   HEAP32[((((100)|0))>>2)]=$and103_i;
   label = 67; break;
  case 51: 
   var $56=$41;
   var $57=HEAP32[((((112)|0))>>2)];
   var $cmp107_i=(($56)>>>(0)) < (($57)>>>(0));
   if ($cmp107_i) { label = 55; break; } else { label = 52; break; }
  case 52: 
   var $arrayidx113_i=(($41+16)|0);
   var $58=HEAP32[(($arrayidx113_i)>>2)];
   var $cmp114_i=(($58)|(0))==(($v_0_i)|(0));
   if ($cmp114_i) { label = 53; break; } else { label = 54; break; }
  case 53: 
   HEAP32[(($arrayidx113_i)>>2)]=$R_1_i;
   label = 56; break;
  case 54: 
   var $arrayidx121_i=(($41+20)|0);
   HEAP32[(($arrayidx121_i)>>2)]=$R_1_i;
   label = 56; break;
  case 55: 
   _abort();
   throw "Reached an unreachable!";
  case 56: 
   var $cmp126_i=(($R_1_i)|(0))==0;
   if ($cmp126_i) { label = 67; break; } else { label = 57; break; }
  case 57: 
   var $59=$R_1_i;
   var $60=HEAP32[((((112)|0))>>2)];
   var $cmp130_i=(($59)>>>(0)) < (($60)>>>(0));
   if ($cmp130_i) { label = 66; break; } else { label = 58; break; }
  case 58: 
   var $parent135_i=(($R_1_i+24)|0);
   HEAP32[(($parent135_i)>>2)]=$41;
   var $arrayidx137_i=(($v_0_i+16)|0);
   var $61=HEAP32[(($arrayidx137_i)>>2)];
   var $cmp138_i=(($61)|(0))==0;
   if ($cmp138_i) { label = 62; break; } else { label = 59; break; }
  case 59: 
   var $62=$61;
   var $63=HEAP32[((((112)|0))>>2)];
   var $cmp142_i=(($62)>>>(0)) < (($63)>>>(0));
   if ($cmp142_i) { label = 61; break; } else { label = 60; break; }
  case 60: 
   var $arrayidx148_i=(($R_1_i+16)|0);
   HEAP32[(($arrayidx148_i)>>2)]=$61;
   var $parent149_i=(($61+24)|0);
   HEAP32[(($parent149_i)>>2)]=$R_1_i;
   label = 62; break;
  case 61: 
   _abort();
   throw "Reached an unreachable!";
  case 62: 
   var $arrayidx154_i=(($v_0_i+20)|0);
   var $64=HEAP32[(($arrayidx154_i)>>2)];
   var $cmp155_i=(($64)|(0))==0;
   if ($cmp155_i) { label = 67; break; } else { label = 63; break; }
  case 63: 
   var $65=$64;
   var $66=HEAP32[((((112)|0))>>2)];
   var $cmp159_i=(($65)>>>(0)) < (($66)>>>(0));
   if ($cmp159_i) { label = 65; break; } else { label = 64; break; }
  case 64: 
   var $arrayidx165_i=(($R_1_i+20)|0);
   HEAP32[(($arrayidx165_i)>>2)]=$64;
   var $parent166_i=(($64+24)|0);
   HEAP32[(($parent166_i)>>2)]=$R_1_i;
   label = 67; break;
  case 65: 
   _abort();
   throw "Reached an unreachable!";
  case 66: 
   _abort();
   throw "Reached an unreachable!";
  case 67: 
   var $cmp174_i=(($rsize_0_i)>>>(0)) < 16;
   if ($cmp174_i) { label = 68; break; } else { label = 69; break; }
  case 68: 
   var $add177_i=((($rsize_0_i)+($cond))|0);
   var $or178_i=$add177_i | 3;
   var $head179_i=(($v_0_i+4)|0);
   HEAP32[(($head179_i)>>2)]=$or178_i;
   var $add_ptr181_sum_i=((($add177_i)+(4))|0);
   var $head182_i=(($38+$add_ptr181_sum_i)|0);
   var $67=$head182_i;
   var $68=HEAP32[(($67)>>2)];
   var $or183_i=$68 | 1;
   HEAP32[(($67)>>2)]=$or183_i;
   label = 77; break;
  case 69: 
   var $or186_i=$cond | 3;
   var $head187_i=(($v_0_i+4)|0);
   HEAP32[(($head187_i)>>2)]=$or186_i;
   var $or188_i=$rsize_0_i | 1;
   var $add_ptr_sum_i175=$cond | 4;
   var $head189_i=(($38+$add_ptr_sum_i175)|0);
   var $69=$head189_i;
   HEAP32[(($69)>>2)]=$or188_i;
   var $add_ptr_sum1_i=((($rsize_0_i)+($cond))|0);
   var $add_ptr190_i=(($38+$add_ptr_sum1_i)|0);
   var $prev_foot_i=$add_ptr190_i;
   HEAP32[(($prev_foot_i)>>2)]=$rsize_0_i;
   var $70=HEAP32[((((104)|0))>>2)];
   var $cmp191_i=(($70)|(0))==0;
   if ($cmp191_i) { label = 75; break; } else { label = 70; break; }
  case 70: 
   var $71=HEAP32[((((116)|0))>>2)];
   var $shr194_i=$70 >>> 3;
   var $shl195_i=$shr194_i << 1;
   var $arrayidx196_i=((136+($shl195_i<<2))|0);
   var $72=$arrayidx196_i;
   var $73=HEAP32[((((96)|0))>>2)];
   var $shl198_i=1 << $shr194_i;
   var $and199_i=$73 & $shl198_i;
   var $tobool200_i=(($and199_i)|(0))==0;
   if ($tobool200_i) { label = 71; break; } else { label = 72; break; }
  case 71: 
   var $or204_i=$73 | $shl198_i;
   HEAP32[((((96)|0))>>2)]=$or204_i;
   var $arrayidx196_sum_pre_i=((($shl195_i)+(2))|0);
   var $_pre_i=((136+($arrayidx196_sum_pre_i<<2))|0);
   var $F197_0_i = $72;var $_pre_phi_i = $_pre_i;label = 74; break;
  case 72: 
   var $arrayidx196_sum2_i=((($shl195_i)+(2))|0);
   var $74=((136+($arrayidx196_sum2_i<<2))|0);
   var $75=HEAP32[(($74)>>2)];
   var $76=$75;
   var $77=HEAP32[((((112)|0))>>2)];
   var $cmp208_i=(($76)>>>(0)) < (($77)>>>(0));
   if ($cmp208_i) { label = 73; break; } else { var $F197_0_i = $75;var $_pre_phi_i = $74;label = 74; break; }
  case 73: 
   _abort();
   throw "Reached an unreachable!";
  case 74: 
   var $_pre_phi_i;
   var $F197_0_i;
   HEAP32[(($_pre_phi_i)>>2)]=$71;
   var $bk218_i=(($F197_0_i+12)|0);
   HEAP32[(($bk218_i)>>2)]=$71;
   var $fd219_i=(($71+8)|0);
   HEAP32[(($fd219_i)>>2)]=$F197_0_i;
   var $bk220_i=(($71+12)|0);
   HEAP32[(($bk220_i)>>2)]=$72;
   label = 75; break;
  case 75: 
   HEAP32[((((104)|0))>>2)]=$rsize_0_i;
   HEAP32[((((116)|0))>>2)]=$40;
   label = 77; break;
  case 76: 
   _abort();
   throw "Reached an unreachable!";
  case 77: 
   var $add_ptr225_i=(($v_0_i+8)|0);
   var $78=$add_ptr225_i;
   var $mem_0 = $78;label = 344; break;
  case 78: 
   var $cmp138=(($bytes)>>>(0)) > 4294967231;
   if ($cmp138) { var $nb_0 = -1;label = 161; break; } else { label = 79; break; }
  case 79: 
   var $add143=((($bytes)+(11))|0);
   var $and144=$add143 & -8;
   var $79=HEAP32[((((100)|0))>>2)];
   var $cmp145=(($79)|(0))==0;
   if ($cmp145) { var $nb_0 = $and144;label = 161; break; } else { label = 80; break; }
  case 80: 
   var $sub_i107=(((-$and144))|0);
   var $shr_i108=$add143 >>> 8;
   var $cmp_i109=(($shr_i108)|(0))==0;
   if ($cmp_i109) { var $idx_0_i = 0;label = 83; break; } else { label = 81; break; }
  case 81: 
   var $cmp1_i=(($and144)>>>(0)) > 16777215;
   if ($cmp1_i) { var $idx_0_i = 31;label = 83; break; } else { label = 82; break; }
  case 82: 
   var $sub4_i=((($shr_i108)+(1048320))|0);
   var $shr5_i111=$sub4_i >>> 16;
   var $and_i112=$shr5_i111 & 8;
   var $shl_i113=$shr_i108 << $and_i112;
   var $sub6_i=((($shl_i113)+(520192))|0);
   var $shr7_i114=$sub6_i >>> 16;
   var $and8_i=$shr7_i114 & 4;
   var $add_i115=$and8_i | $and_i112;
   var $shl9_i=$shl_i113 << $and8_i;
   var $sub10_i=((($shl9_i)+(245760))|0);
   var $shr11_i116=$sub10_i >>> 16;
   var $and12_i=$shr11_i116 & 2;
   var $add13_i=$add_i115 | $and12_i;
   var $sub14_i=(((14)-($add13_i))|0);
   var $shl15_i=$shl9_i << $and12_i;
   var $shr16_i117=$shl15_i >>> 15;
   var $add17_i=((($sub14_i)+($shr16_i117))|0);
   var $shl18_i=$add17_i << 1;
   var $add19_i=((($add17_i)+(7))|0);
   var $shr20_i=$and144 >>> (($add19_i)>>>(0));
   var $and21_i118=$shr20_i & 1;
   var $add22_i=$and21_i118 | $shl18_i;
   var $idx_0_i = $add22_i;label = 83; break;
  case 83: 
   var $idx_0_i;
   var $arrayidx_i119=((400+($idx_0_i<<2))|0);
   var $80=HEAP32[(($arrayidx_i119)>>2)];
   var $cmp24_i=(($80)|(0))==0;
   if ($cmp24_i) { var $v_2_i = 0;var $rsize_2_i = $sub_i107;var $t_1_i = 0;label = 90; break; } else { label = 84; break; }
  case 84: 
   var $cmp26_i=(($idx_0_i)|(0))==31;
   if ($cmp26_i) { var $cond_i = 0;label = 86; break; } else { label = 85; break; }
  case 85: 
   var $shr27_i=$idx_0_i >>> 1;
   var $sub30_i=(((25)-($shr27_i))|0);
   var $cond_i = $sub30_i;label = 86; break;
  case 86: 
   var $cond_i;
   var $shl31_i=$and144 << $cond_i;
   var $v_0_i123 = 0;var $rsize_0_i122 = $sub_i107;var $t_0_i121 = $80;var $sizebits_0_i = $shl31_i;var $rst_0_i = 0;label = 87; break;
  case 87: 
   var $rst_0_i;
   var $sizebits_0_i;
   var $t_0_i121;
   var $rsize_0_i122;
   var $v_0_i123;
   var $head_i124=(($t_0_i121+4)|0);
   var $81=HEAP32[(($head_i124)>>2)];
   var $and32_i=$81 & -8;
   var $sub33_i=((($and32_i)-($and144))|0);
   var $cmp34_i=(($sub33_i)>>>(0)) < (($rsize_0_i122)>>>(0));
   if ($cmp34_i) { label = 88; break; } else { var $v_1_i = $v_0_i123;var $rsize_1_i = $rsize_0_i122;label = 89; break; }
  case 88: 
   var $cmp36_i=(($and32_i)|(0))==(($and144)|(0));
   if ($cmp36_i) { var $v_2_i = $t_0_i121;var $rsize_2_i = $sub33_i;var $t_1_i = $t_0_i121;label = 90; break; } else { var $v_1_i = $t_0_i121;var $rsize_1_i = $sub33_i;label = 89; break; }
  case 89: 
   var $rsize_1_i;
   var $v_1_i;
   var $arrayidx40_i=(($t_0_i121+20)|0);
   var $82=HEAP32[(($arrayidx40_i)>>2)];
   var $shr41_i=$sizebits_0_i >>> 31;
   var $arrayidx44_i=(($t_0_i121+16+($shr41_i<<2))|0);
   var $83=HEAP32[(($arrayidx44_i)>>2)];
   var $cmp45_i125=(($82)|(0))==0;
   var $cmp46_i=(($82)|(0))==(($83)|(0));
   var $or_cond_i=$cmp45_i125 | $cmp46_i;
   var $rst_1_i=$or_cond_i ? $rst_0_i : $82;
   var $cmp49_i=(($83)|(0))==0;
   var $shl52_i=$sizebits_0_i << 1;
   if ($cmp49_i) { var $v_2_i = $v_1_i;var $rsize_2_i = $rsize_1_i;var $t_1_i = $rst_1_i;label = 90; break; } else { var $v_0_i123 = $v_1_i;var $rsize_0_i122 = $rsize_1_i;var $t_0_i121 = $83;var $sizebits_0_i = $shl52_i;var $rst_0_i = $rst_1_i;label = 87; break; }
  case 90: 
   var $t_1_i;
   var $rsize_2_i;
   var $v_2_i;
   var $cmp54_i=(($t_1_i)|(0))==0;
   var $cmp56_i=(($v_2_i)|(0))==0;
   var $or_cond18_i=$cmp54_i & $cmp56_i;
   if ($or_cond18_i) { label = 91; break; } else { var $t_2_ph_i = $t_1_i;label = 93; break; }
  case 91: 
   var $shl59_i=2 << $idx_0_i;
   var $sub62_i=(((-$shl59_i))|0);
   var $or_i=$shl59_i | $sub62_i;
   var $and63_i=$79 & $or_i;
   var $cmp64_i=(($and63_i)|(0))==0;
   if ($cmp64_i) { var $nb_0 = $and144;label = 161; break; } else { label = 92; break; }
  case 92: 
   var $sub66_i=(((-$and63_i))|0);
   var $and67_i=$and63_i & $sub66_i;
   var $sub69_i=((($and67_i)-(1))|0);
   var $shr71_i=$sub69_i >>> 12;
   var $and72_i=$shr71_i & 16;
   var $shr74_i=$sub69_i >>> (($and72_i)>>>(0));
   var $shr75_i=$shr74_i >>> 5;
   var $and76_i=$shr75_i & 8;
   var $add77_i=$and76_i | $and72_i;
   var $shr78_i=$shr74_i >>> (($and76_i)>>>(0));
   var $shr79_i=$shr78_i >>> 2;
   var $and80_i=$shr79_i & 4;
   var $add81_i=$add77_i | $and80_i;
   var $shr82_i=$shr78_i >>> (($and80_i)>>>(0));
   var $shr83_i=$shr82_i >>> 1;
   var $and84_i=$shr83_i & 2;
   var $add85_i=$add81_i | $and84_i;
   var $shr86_i=$shr82_i >>> (($and84_i)>>>(0));
   var $shr87_i=$shr86_i >>> 1;
   var $and88_i=$shr87_i & 1;
   var $add89_i=$add85_i | $and88_i;
   var $shr90_i=$shr86_i >>> (($and88_i)>>>(0));
   var $add91_i=((($add89_i)+($shr90_i))|0);
   var $arrayidx93_i=((400+($add91_i<<2))|0);
   var $84=HEAP32[(($arrayidx93_i)>>2)];
   var $t_2_ph_i = $84;label = 93; break;
  case 93: 
   var $t_2_ph_i;
   var $cmp9628_i=(($t_2_ph_i)|(0))==0;
   if ($cmp9628_i) { var $rsize_3_lcssa_i = $rsize_2_i;var $v_3_lcssa_i = $v_2_i;label = 96; break; } else { var $t_229_i = $t_2_ph_i;var $rsize_330_i = $rsize_2_i;var $v_331_i = $v_2_i;label = 94; break; }
  case 94: 
   var $v_331_i;
   var $rsize_330_i;
   var $t_229_i;
   var $head98_i=(($t_229_i+4)|0);
   var $85=HEAP32[(($head98_i)>>2)];
   var $and99_i=$85 & -8;
   var $sub100_i=((($and99_i)-($and144))|0);
   var $cmp101_i=(($sub100_i)>>>(0)) < (($rsize_330_i)>>>(0));
   var $sub100_rsize_3_i=$cmp101_i ? $sub100_i : $rsize_330_i;
   var $t_2_v_3_i=$cmp101_i ? $t_229_i : $v_331_i;
   var $arrayidx105_i=(($t_229_i+16)|0);
   var $86=HEAP32[(($arrayidx105_i)>>2)];
   var $cmp106_i=(($86)|(0))==0;
   if ($cmp106_i) { label = 95; break; } else { var $t_229_i = $86;var $rsize_330_i = $sub100_rsize_3_i;var $v_331_i = $t_2_v_3_i;label = 94; break; }
  case 95: 
   var $arrayidx112_i=(($t_229_i+20)|0);
   var $87=HEAP32[(($arrayidx112_i)>>2)];
   var $cmp96_i=(($87)|(0))==0;
   if ($cmp96_i) { var $rsize_3_lcssa_i = $sub100_rsize_3_i;var $v_3_lcssa_i = $t_2_v_3_i;label = 96; break; } else { var $t_229_i = $87;var $rsize_330_i = $sub100_rsize_3_i;var $v_331_i = $t_2_v_3_i;label = 94; break; }
  case 96: 
   var $v_3_lcssa_i;
   var $rsize_3_lcssa_i;
   var $cmp115_i=(($v_3_lcssa_i)|(0))==0;
   if ($cmp115_i) { var $nb_0 = $and144;label = 161; break; } else { label = 97; break; }
  case 97: 
   var $88=HEAP32[((((104)|0))>>2)];
   var $sub117_i=((($88)-($and144))|0);
   var $cmp118_i=(($rsize_3_lcssa_i)>>>(0)) < (($sub117_i)>>>(0));
   if ($cmp118_i) { label = 98; break; } else { var $nb_0 = $and144;label = 161; break; }
  case 98: 
   var $89=$v_3_lcssa_i;
   var $90=HEAP32[((((112)|0))>>2)];
   var $cmp120_i=(($89)>>>(0)) < (($90)>>>(0));
   if ($cmp120_i) { label = 159; break; } else { label = 99; break; }
  case 99: 
   var $add_ptr_i128=(($89+$and144)|0);
   var $91=$add_ptr_i128;
   var $cmp122_i=(($89)>>>(0)) < (($add_ptr_i128)>>>(0));
   if ($cmp122_i) { label = 100; break; } else { label = 159; break; }
  case 100: 
   var $parent_i129=(($v_3_lcssa_i+24)|0);
   var $92=HEAP32[(($parent_i129)>>2)];
   var $bk_i130=(($v_3_lcssa_i+12)|0);
   var $93=HEAP32[(($bk_i130)>>2)];
   var $cmp127_i=(($93)|(0))==(($v_3_lcssa_i)|(0));
   if ($cmp127_i) { label = 106; break; } else { label = 101; break; }
  case 101: 
   var $fd_i131=(($v_3_lcssa_i+8)|0);
   var $94=HEAP32[(($fd_i131)>>2)];
   var $95=$94;
   var $cmp132_i=(($95)>>>(0)) < (($90)>>>(0));
   if ($cmp132_i) { label = 105; break; } else { label = 102; break; }
  case 102: 
   var $bk135_i=(($94+12)|0);
   var $96=HEAP32[(($bk135_i)>>2)];
   var $cmp136_i=(($96)|(0))==(($v_3_lcssa_i)|(0));
   if ($cmp136_i) { label = 103; break; } else { label = 105; break; }
  case 103: 
   var $fd138_i=(($93+8)|0);
   var $97=HEAP32[(($fd138_i)>>2)];
   var $cmp139_i=(($97)|(0))==(($v_3_lcssa_i)|(0));
   if ($cmp139_i) { label = 104; break; } else { label = 105; break; }
  case 104: 
   HEAP32[(($bk135_i)>>2)]=$93;
   HEAP32[(($fd138_i)>>2)]=$94;
   var $R_1_i139 = $93;label = 113; break;
  case 105: 
   _abort();
   throw "Reached an unreachable!";
  case 106: 
   var $arrayidx150_i=(($v_3_lcssa_i+20)|0);
   var $98=HEAP32[(($arrayidx150_i)>>2)];
   var $cmp151_i=(($98)|(0))==0;
   if ($cmp151_i) { label = 107; break; } else { var $R_0_i137 = $98;var $RP_0_i136 = $arrayidx150_i;label = 108; break; }
  case 107: 
   var $arrayidx154_i133=(($v_3_lcssa_i+16)|0);
   var $99=HEAP32[(($arrayidx154_i133)>>2)];
   var $cmp155_i134=(($99)|(0))==0;
   if ($cmp155_i134) { var $R_1_i139 = 0;label = 113; break; } else { var $R_0_i137 = $99;var $RP_0_i136 = $arrayidx154_i133;label = 108; break; }
  case 108: 
   var $RP_0_i136;
   var $R_0_i137;
   var $arrayidx160_i=(($R_0_i137+20)|0);
   var $100=HEAP32[(($arrayidx160_i)>>2)];
   var $cmp161_i=(($100)|(0))==0;
   if ($cmp161_i) { label = 109; break; } else { var $R_0_i137 = $100;var $RP_0_i136 = $arrayidx160_i;label = 108; break; }
  case 109: 
   var $arrayidx164_i=(($R_0_i137+16)|0);
   var $101=HEAP32[(($arrayidx164_i)>>2)];
   var $cmp165_i=(($101)|(0))==0;
   if ($cmp165_i) { label = 110; break; } else { var $R_0_i137 = $101;var $RP_0_i136 = $arrayidx164_i;label = 108; break; }
  case 110: 
   var $102=$RP_0_i136;
   var $cmp170_i=(($102)>>>(0)) < (($90)>>>(0));
   if ($cmp170_i) { label = 112; break; } else { label = 111; break; }
  case 111: 
   HEAP32[(($RP_0_i136)>>2)]=0;
   var $R_1_i139 = $R_0_i137;label = 113; break;
  case 112: 
   _abort();
   throw "Reached an unreachable!";
  case 113: 
   var $R_1_i139;
   var $cmp179_i=(($92)|(0))==0;
   if ($cmp179_i) { label = 133; break; } else { label = 114; break; }
  case 114: 
   var $index_i140=(($v_3_lcssa_i+28)|0);
   var $103=HEAP32[(($index_i140)>>2)];
   var $arrayidx183_i=((400+($103<<2))|0);
   var $104=HEAP32[(($arrayidx183_i)>>2)];
   var $cmp184_i=(($v_3_lcssa_i)|(0))==(($104)|(0));
   if ($cmp184_i) { label = 115; break; } else { label = 117; break; }
  case 115: 
   HEAP32[(($arrayidx183_i)>>2)]=$R_1_i139;
   var $cond20_i=(($R_1_i139)|(0))==0;
   if ($cond20_i) { label = 116; break; } else { label = 123; break; }
  case 116: 
   var $105=HEAP32[(($index_i140)>>2)];
   var $shl191_i=1 << $105;
   var $neg_i141=$shl191_i ^ -1;
   var $106=HEAP32[((((100)|0))>>2)];
   var $and193_i=$106 & $neg_i141;
   HEAP32[((((100)|0))>>2)]=$and193_i;
   label = 133; break;
  case 117: 
   var $107=$92;
   var $108=HEAP32[((((112)|0))>>2)];
   var $cmp197_i=(($107)>>>(0)) < (($108)>>>(0));
   if ($cmp197_i) { label = 121; break; } else { label = 118; break; }
  case 118: 
   var $arrayidx203_i=(($92+16)|0);
   var $109=HEAP32[(($arrayidx203_i)>>2)];
   var $cmp204_i=(($109)|(0))==(($v_3_lcssa_i)|(0));
   if ($cmp204_i) { label = 119; break; } else { label = 120; break; }
  case 119: 
   HEAP32[(($arrayidx203_i)>>2)]=$R_1_i139;
   label = 122; break;
  case 120: 
   var $arrayidx211_i=(($92+20)|0);
   HEAP32[(($arrayidx211_i)>>2)]=$R_1_i139;
   label = 122; break;
  case 121: 
   _abort();
   throw "Reached an unreachable!";
  case 122: 
   var $cmp216_i=(($R_1_i139)|(0))==0;
   if ($cmp216_i) { label = 133; break; } else { label = 123; break; }
  case 123: 
   var $110=$R_1_i139;
   var $111=HEAP32[((((112)|0))>>2)];
   var $cmp220_i=(($110)>>>(0)) < (($111)>>>(0));
   if ($cmp220_i) { label = 132; break; } else { label = 124; break; }
  case 124: 
   var $parent225_i=(($R_1_i139+24)|0);
   HEAP32[(($parent225_i)>>2)]=$92;
   var $arrayidx227_i=(($v_3_lcssa_i+16)|0);
   var $112=HEAP32[(($arrayidx227_i)>>2)];
   var $cmp228_i=(($112)|(0))==0;
   if ($cmp228_i) { label = 128; break; } else { label = 125; break; }
  case 125: 
   var $113=$112;
   var $114=HEAP32[((((112)|0))>>2)];
   var $cmp232_i=(($113)>>>(0)) < (($114)>>>(0));
   if ($cmp232_i) { label = 127; break; } else { label = 126; break; }
  case 126: 
   var $arrayidx238_i=(($R_1_i139+16)|0);
   HEAP32[(($arrayidx238_i)>>2)]=$112;
   var $parent239_i=(($112+24)|0);
   HEAP32[(($parent239_i)>>2)]=$R_1_i139;
   label = 128; break;
  case 127: 
   _abort();
   throw "Reached an unreachable!";
  case 128: 
   var $arrayidx244_i=(($v_3_lcssa_i+20)|0);
   var $115=HEAP32[(($arrayidx244_i)>>2)];
   var $cmp245_i=(($115)|(0))==0;
   if ($cmp245_i) { label = 133; break; } else { label = 129; break; }
  case 129: 
   var $116=$115;
   var $117=HEAP32[((((112)|0))>>2)];
   var $cmp249_i=(($116)>>>(0)) < (($117)>>>(0));
   if ($cmp249_i) { label = 131; break; } else { label = 130; break; }
  case 130: 
   var $arrayidx255_i=(($R_1_i139+20)|0);
   HEAP32[(($arrayidx255_i)>>2)]=$115;
   var $parent256_i=(($115+24)|0);
   HEAP32[(($parent256_i)>>2)]=$R_1_i139;
   label = 133; break;
  case 131: 
   _abort();
   throw "Reached an unreachable!";
  case 132: 
   _abort();
   throw "Reached an unreachable!";
  case 133: 
   var $cmp264_i=(($rsize_3_lcssa_i)>>>(0)) < 16;
   if ($cmp264_i) { label = 134; break; } else { label = 135; break; }
  case 134: 
   var $add267_i=((($rsize_3_lcssa_i)+($and144))|0);
   var $or269_i=$add267_i | 3;
   var $head270_i=(($v_3_lcssa_i+4)|0);
   HEAP32[(($head270_i)>>2)]=$or269_i;
   var $add_ptr272_sum_i=((($add267_i)+(4))|0);
   var $head273_i=(($89+$add_ptr272_sum_i)|0);
   var $118=$head273_i;
   var $119=HEAP32[(($118)>>2)];
   var $or274_i=$119 | 1;
   HEAP32[(($118)>>2)]=$or274_i;
   label = 160; break;
  case 135: 
   var $or277_i=$and144 | 3;
   var $head278_i=(($v_3_lcssa_i+4)|0);
   HEAP32[(($head278_i)>>2)]=$or277_i;
   var $or279_i=$rsize_3_lcssa_i | 1;
   var $add_ptr_sum_i143174=$and144 | 4;
   var $head280_i=(($89+$add_ptr_sum_i143174)|0);
   var $120=$head280_i;
   HEAP32[(($120)>>2)]=$or279_i;
   var $add_ptr_sum1_i144=((($rsize_3_lcssa_i)+($and144))|0);
   var $add_ptr281_i=(($89+$add_ptr_sum1_i144)|0);
   var $prev_foot_i145=$add_ptr281_i;
   HEAP32[(($prev_foot_i145)>>2)]=$rsize_3_lcssa_i;
   var $shr282_i=$rsize_3_lcssa_i >>> 3;
   var $cmp283_i=(($rsize_3_lcssa_i)>>>(0)) < 256;
   if ($cmp283_i) { label = 136; break; } else { label = 141; break; }
  case 136: 
   var $shl287_i=$shr282_i << 1;
   var $arrayidx288_i=((136+($shl287_i<<2))|0);
   var $121=$arrayidx288_i;
   var $122=HEAP32[((((96)|0))>>2)];
   var $shl290_i=1 << $shr282_i;
   var $and291_i=$122 & $shl290_i;
   var $tobool292_i=(($and291_i)|(0))==0;
   if ($tobool292_i) { label = 137; break; } else { label = 138; break; }
  case 137: 
   var $or296_i=$122 | $shl290_i;
   HEAP32[((((96)|0))>>2)]=$or296_i;
   var $arrayidx288_sum_pre_i=((($shl287_i)+(2))|0);
   var $_pre_i146=((136+($arrayidx288_sum_pre_i<<2))|0);
   var $F289_0_i = $121;var $_pre_phi_i147 = $_pre_i146;label = 140; break;
  case 138: 
   var $arrayidx288_sum16_i=((($shl287_i)+(2))|0);
   var $123=((136+($arrayidx288_sum16_i<<2))|0);
   var $124=HEAP32[(($123)>>2)];
   var $125=$124;
   var $126=HEAP32[((((112)|0))>>2)];
   var $cmp300_i=(($125)>>>(0)) < (($126)>>>(0));
   if ($cmp300_i) { label = 139; break; } else { var $F289_0_i = $124;var $_pre_phi_i147 = $123;label = 140; break; }
  case 139: 
   _abort();
   throw "Reached an unreachable!";
  case 140: 
   var $_pre_phi_i147;
   var $F289_0_i;
   HEAP32[(($_pre_phi_i147)>>2)]=$91;
   var $bk310_i=(($F289_0_i+12)|0);
   HEAP32[(($bk310_i)>>2)]=$91;
   var $add_ptr_sum14_i=((($and144)+(8))|0);
   var $fd311_i=(($89+$add_ptr_sum14_i)|0);
   var $127=$fd311_i;
   HEAP32[(($127)>>2)]=$F289_0_i;
   var $add_ptr_sum15_i=((($and144)+(12))|0);
   var $bk312_i=(($89+$add_ptr_sum15_i)|0);
   var $128=$bk312_i;
   HEAP32[(($128)>>2)]=$121;
   label = 160; break;
  case 141: 
   var $129=$add_ptr_i128;
   var $shr317_i=$rsize_3_lcssa_i >>> 8;
   var $cmp318_i=(($shr317_i)|(0))==0;
   if ($cmp318_i) { var $I315_0_i = 0;label = 144; break; } else { label = 142; break; }
  case 142: 
   var $cmp322_i=(($rsize_3_lcssa_i)>>>(0)) > 16777215;
   if ($cmp322_i) { var $I315_0_i = 31;label = 144; break; } else { label = 143; break; }
  case 143: 
   var $sub328_i=((($shr317_i)+(1048320))|0);
   var $shr329_i=$sub328_i >>> 16;
   var $and330_i=$shr329_i & 8;
   var $shl332_i=$shr317_i << $and330_i;
   var $sub333_i=((($shl332_i)+(520192))|0);
   var $shr334_i=$sub333_i >>> 16;
   var $and335_i=$shr334_i & 4;
   var $add336_i=$and335_i | $and330_i;
   var $shl337_i=$shl332_i << $and335_i;
   var $sub338_i=((($shl337_i)+(245760))|0);
   var $shr339_i=$sub338_i >>> 16;
   var $and340_i=$shr339_i & 2;
   var $add341_i=$add336_i | $and340_i;
   var $sub342_i=(((14)-($add341_i))|0);
   var $shl343_i=$shl337_i << $and340_i;
   var $shr344_i=$shl343_i >>> 15;
   var $add345_i=((($sub342_i)+($shr344_i))|0);
   var $shl346_i=$add345_i << 1;
   var $add347_i=((($add345_i)+(7))|0);
   var $shr348_i=$rsize_3_lcssa_i >>> (($add347_i)>>>(0));
   var $and349_i=$shr348_i & 1;
   var $add350_i=$and349_i | $shl346_i;
   var $I315_0_i = $add350_i;label = 144; break;
  case 144: 
   var $I315_0_i;
   var $arrayidx354_i=((400+($I315_0_i<<2))|0);
   var $add_ptr_sum2_i=((($and144)+(28))|0);
   var $index355_i=(($89+$add_ptr_sum2_i)|0);
   var $130=$index355_i;
   HEAP32[(($130)>>2)]=$I315_0_i;
   var $add_ptr_sum3_i=((($and144)+(16))|0);
   var $child356_i=(($89+$add_ptr_sum3_i)|0);
   var $child356_sum_i=((($and144)+(20))|0);
   var $arrayidx357_i=(($89+$child356_sum_i)|0);
   var $131=$arrayidx357_i;
   HEAP32[(($131)>>2)]=0;
   var $arrayidx359_i=$child356_i;
   HEAP32[(($arrayidx359_i)>>2)]=0;
   var $132=HEAP32[((((100)|0))>>2)];
   var $shl361_i=1 << $I315_0_i;
   var $and362_i=$132 & $shl361_i;
   var $tobool363_i=(($and362_i)|(0))==0;
   if ($tobool363_i) { label = 145; break; } else { label = 146; break; }
  case 145: 
   var $or367_i=$132 | $shl361_i;
   HEAP32[((((100)|0))>>2)]=$or367_i;
   HEAP32[(($arrayidx354_i)>>2)]=$129;
   var $133=$arrayidx354_i;
   var $add_ptr_sum4_i=((($and144)+(24))|0);
   var $parent368_i=(($89+$add_ptr_sum4_i)|0);
   var $134=$parent368_i;
   HEAP32[(($134)>>2)]=$133;
   var $add_ptr_sum5_i=((($and144)+(12))|0);
   var $bk369_i=(($89+$add_ptr_sum5_i)|0);
   var $135=$bk369_i;
   HEAP32[(($135)>>2)]=$129;
   var $add_ptr_sum6_i=((($and144)+(8))|0);
   var $fd370_i=(($89+$add_ptr_sum6_i)|0);
   var $136=$fd370_i;
   HEAP32[(($136)>>2)]=$129;
   label = 160; break;
  case 146: 
   var $137=HEAP32[(($arrayidx354_i)>>2)];
   var $cmp373_i=(($I315_0_i)|(0))==31;
   if ($cmp373_i) { var $cond382_i = 0;label = 148; break; } else { label = 147; break; }
  case 147: 
   var $shr377_i=$I315_0_i >>> 1;
   var $sub380_i=(((25)-($shr377_i))|0);
   var $cond382_i = $sub380_i;label = 148; break;
  case 148: 
   var $cond382_i;
   var $head38522_i=(($137+4)|0);
   var $138=HEAP32[(($head38522_i)>>2)];
   var $and38623_i=$138 & -8;
   var $cmp38724_i=(($and38623_i)|(0))==(($rsize_3_lcssa_i)|(0));
   if ($cmp38724_i) { var $T_0_lcssa_i = $137;label = 155; break; } else { label = 149; break; }
  case 149: 
   var $shl383_i=$rsize_3_lcssa_i << $cond382_i;
   var $T_025_i = $137;var $K372_026_i = $shl383_i;label = 151; break;
  case 150: 
   var $shl394_i=$K372_026_i << 1;
   var $head385_i=(($140+4)|0);
   var $139=HEAP32[(($head385_i)>>2)];
   var $and386_i=$139 & -8;
   var $cmp387_i=(($and386_i)|(0))==(($rsize_3_lcssa_i)|(0));
   if ($cmp387_i) { var $T_0_lcssa_i = $140;label = 155; break; } else { var $T_025_i = $140;var $K372_026_i = $shl394_i;label = 151; break; }
  case 151: 
   var $K372_026_i;
   var $T_025_i;
   var $shr390_i=$K372_026_i >>> 31;
   var $arrayidx393_i=(($T_025_i+16+($shr390_i<<2))|0);
   var $140=HEAP32[(($arrayidx393_i)>>2)];
   var $cmp395_i=(($140)|(0))==0;
   if ($cmp395_i) { label = 152; break; } else { label = 150; break; }
  case 152: 
   var $141=$arrayidx393_i;
   var $142=HEAP32[((((112)|0))>>2)];
   var $cmp400_i=(($141)>>>(0)) < (($142)>>>(0));
   if ($cmp400_i) { label = 154; break; } else { label = 153; break; }
  case 153: 
   HEAP32[(($arrayidx393_i)>>2)]=$129;
   var $add_ptr_sum11_i=((($and144)+(24))|0);
   var $parent405_i=(($89+$add_ptr_sum11_i)|0);
   var $143=$parent405_i;
   HEAP32[(($143)>>2)]=$T_025_i;
   var $add_ptr_sum12_i=((($and144)+(12))|0);
   var $bk406_i=(($89+$add_ptr_sum12_i)|0);
   var $144=$bk406_i;
   HEAP32[(($144)>>2)]=$129;
   var $add_ptr_sum13_i=((($and144)+(8))|0);
   var $fd407_i=(($89+$add_ptr_sum13_i)|0);
   var $145=$fd407_i;
   HEAP32[(($145)>>2)]=$129;
   label = 160; break;
  case 154: 
   _abort();
   throw "Reached an unreachable!";
  case 155: 
   var $T_0_lcssa_i;
   var $fd412_i=(($T_0_lcssa_i+8)|0);
   var $146=HEAP32[(($fd412_i)>>2)];
   var $147=$T_0_lcssa_i;
   var $148=HEAP32[((((112)|0))>>2)];
   var $cmp414_i=(($147)>>>(0)) < (($148)>>>(0));
   if ($cmp414_i) { label = 158; break; } else { label = 156; break; }
  case 156: 
   var $149=$146;
   var $cmp418_i=(($149)>>>(0)) < (($148)>>>(0));
   if ($cmp418_i) { label = 158; break; } else { label = 157; break; }
  case 157: 
   var $bk425_i=(($146+12)|0);
   HEAP32[(($bk425_i)>>2)]=$129;
   HEAP32[(($fd412_i)>>2)]=$129;
   var $add_ptr_sum8_i=((($and144)+(8))|0);
   var $fd427_i=(($89+$add_ptr_sum8_i)|0);
   var $150=$fd427_i;
   HEAP32[(($150)>>2)]=$146;
   var $add_ptr_sum9_i=((($and144)+(12))|0);
   var $bk428_i=(($89+$add_ptr_sum9_i)|0);
   var $151=$bk428_i;
   HEAP32[(($151)>>2)]=$T_0_lcssa_i;
   var $add_ptr_sum10_i=((($and144)+(24))|0);
   var $parent429_i=(($89+$add_ptr_sum10_i)|0);
   var $152=$parent429_i;
   HEAP32[(($152)>>2)]=0;
   label = 160; break;
  case 158: 
   _abort();
   throw "Reached an unreachable!";
  case 159: 
   _abort();
   throw "Reached an unreachable!";
  case 160: 
   var $add_ptr436_i=(($v_3_lcssa_i+8)|0);
   var $153=$add_ptr436_i;
   var $mem_0 = $153;label = 344; break;
  case 161: 
   var $nb_0;
   var $154=HEAP32[((((104)|0))>>2)];
   var $cmp155=(($nb_0)>>>(0)) > (($154)>>>(0));
   if ($cmp155) { label = 166; break; } else { label = 162; break; }
  case 162: 
   var $sub159=((($154)-($nb_0))|0);
   var $155=HEAP32[((((116)|0))>>2)];
   var $cmp161=(($sub159)>>>(0)) > 15;
   if ($cmp161) { label = 163; break; } else { label = 164; break; }
  case 163: 
   var $156=$155;
   var $add_ptr165=(($156+$nb_0)|0);
   var $157=$add_ptr165;
   HEAP32[((((116)|0))>>2)]=$157;
   HEAP32[((((104)|0))>>2)]=$sub159;
   var $or166=$sub159 | 1;
   var $add_ptr165_sum=((($nb_0)+(4))|0);
   var $head167=(($156+$add_ptr165_sum)|0);
   var $158=$head167;
   HEAP32[(($158)>>2)]=$or166;
   var $add_ptr168=(($156+$154)|0);
   var $prev_foot169=$add_ptr168;
   HEAP32[(($prev_foot169)>>2)]=$sub159;
   var $or171=$nb_0 | 3;
   var $head172=(($155+4)|0);
   HEAP32[(($head172)>>2)]=$or171;
   label = 165; break;
  case 164: 
   HEAP32[((((104)|0))>>2)]=0;
   HEAP32[((((116)|0))>>2)]=0;
   var $or175=$154 | 3;
   var $head176=(($155+4)|0);
   HEAP32[(($head176)>>2)]=$or175;
   var $159=$155;
   var $add_ptr177_sum=((($154)+(4))|0);
   var $head178=(($159+$add_ptr177_sum)|0);
   var $160=$head178;
   var $161=HEAP32[(($160)>>2)];
   var $or179=$161 | 1;
   HEAP32[(($160)>>2)]=$or179;
   label = 165; break;
  case 165: 
   var $add_ptr181=(($155+8)|0);
   var $162=$add_ptr181;
   var $mem_0 = $162;label = 344; break;
  case 166: 
   var $163=HEAP32[((((108)|0))>>2)];
   var $cmp183=(($nb_0)>>>(0)) < (($163)>>>(0));
   if ($cmp183) { label = 167; break; } else { label = 168; break; }
  case 167: 
   var $sub187=((($163)-($nb_0))|0);
   HEAP32[((((108)|0))>>2)]=$sub187;
   var $164=HEAP32[((((120)|0))>>2)];
   var $165=$164;
   var $add_ptr190=(($165+$nb_0)|0);
   var $166=$add_ptr190;
   HEAP32[((((120)|0))>>2)]=$166;
   var $or191=$sub187 | 1;
   var $add_ptr190_sum=((($nb_0)+(4))|0);
   var $head192=(($165+$add_ptr190_sum)|0);
   var $167=$head192;
   HEAP32[(($167)>>2)]=$or191;
   var $or194=$nb_0 | 3;
   var $head195=(($164+4)|0);
   HEAP32[(($head195)>>2)]=$or194;
   var $add_ptr196=(($164+8)|0);
   var $168=$add_ptr196;
   var $mem_0 = $168;label = 344; break;
  case 168: 
   var $169=HEAP32[((((72)|0))>>2)];
   var $cmp_i148=(($169)|(0))==0;
   if ($cmp_i148) { label = 169; break; } else { label = 172; break; }
  case 169: 
   var $call_i_i=_sysconf(8);
   var $sub_i_i=((($call_i_i)-(1))|0);
   var $and_i_i=$sub_i_i & $call_i_i;
   var $cmp1_i_i=(($and_i_i)|(0))==0;
   if ($cmp1_i_i) { label = 171; break; } else { label = 170; break; }
  case 170: 
   _abort();
   throw "Reached an unreachable!";
  case 171: 
   HEAP32[((((80)|0))>>2)]=$call_i_i;
   HEAP32[((((76)|0))>>2)]=$call_i_i;
   HEAP32[((((84)|0))>>2)]=-1;
   HEAP32[((((88)|0))>>2)]=2097152;
   HEAP32[((((92)|0))>>2)]=0;
   HEAP32[((((540)|0))>>2)]=0;
   var $call6_i_i=_time(0);
   var $xor_i_i=$call6_i_i & -16;
   var $and7_i_i=$xor_i_i ^ 1431655768;
   HEAP32[((((72)|0))>>2)]=$and7_i_i;
   label = 172; break;
  case 172: 
   var $add_i149=((($nb_0)+(48))|0);
   var $170=HEAP32[((((80)|0))>>2)];
   var $sub_i150=((($nb_0)+(47))|0);
   var $add9_i=((($170)+($sub_i150))|0);
   var $neg_i151=(((-$170))|0);
   var $and11_i=$add9_i & $neg_i151;
   var $cmp12_i=(($and11_i)>>>(0)) > (($nb_0)>>>(0));
   if ($cmp12_i) { label = 173; break; } else { var $mem_0 = 0;label = 344; break; }
  case 173: 
   var $171=HEAP32[((((536)|0))>>2)];
   var $cmp15_i=(($171)|(0))==0;
   if ($cmp15_i) { label = 175; break; } else { label = 174; break; }
  case 174: 
   var $172=HEAP32[((((528)|0))>>2)];
   var $add17_i152=((($172)+($and11_i))|0);
   var $cmp19_i=(($add17_i152)>>>(0)) <= (($172)>>>(0));
   var $cmp21_i=(($add17_i152)>>>(0)) > (($171)>>>(0));
   var $or_cond1_i=$cmp19_i | $cmp21_i;
   if ($or_cond1_i) { var $mem_0 = 0;label = 344; break; } else { label = 175; break; }
  case 175: 
   var $173=HEAP32[((((540)|0))>>2)];
   var $and26_i=$173 & 4;
   var $tobool27_i=(($and26_i)|(0))==0;
   if ($tobool27_i) { label = 176; break; } else { var $tsize_1_i = 0;label = 199; break; }
  case 176: 
   var $174=HEAP32[((((120)|0))>>2)];
   var $cmp29_i=(($174)|(0))==0;
   if ($cmp29_i) { label = 182; break; } else { label = 177; break; }
  case 177: 
   var $175=$174;
   var $sp_0_i_i = ((544)|0);label = 178; break;
  case 178: 
   var $sp_0_i_i;
   var $base_i_i=(($sp_0_i_i)|0);
   var $176=HEAP32[(($base_i_i)>>2)];
   var $cmp_i9_i=(($176)>>>(0)) > (($175)>>>(0));
   if ($cmp_i9_i) { label = 180; break; } else { label = 179; break; }
  case 179: 
   var $size_i_i=(($sp_0_i_i+4)|0);
   var $177=HEAP32[(($size_i_i)>>2)];
   var $add_ptr_i_i=(($176+$177)|0);
   var $cmp2_i_i=(($add_ptr_i_i)>>>(0)) > (($175)>>>(0));
   if ($cmp2_i_i) { label = 181; break; } else { label = 180; break; }
  case 180: 
   var $next_i_i=(($sp_0_i_i+8)|0);
   var $178=HEAP32[(($next_i_i)>>2)];
   var $cmp3_i_i=(($178)|(0))==0;
   if ($cmp3_i_i) { label = 182; break; } else { var $sp_0_i_i = $178;label = 178; break; }
  case 181: 
   var $cmp32_i154=(($sp_0_i_i)|(0))==0;
   if ($cmp32_i154) { label = 182; break; } else { label = 189; break; }
  case 182: 
   var $call34_i=_sbrk(0);
   var $cmp35_i156=(($call34_i)|(0))==-1;
   if ($cmp35_i156) { var $tsize_0758385_i = 0;label = 198; break; } else { label = 183; break; }
  case 183: 
   var $179=$call34_i;
   var $180=HEAP32[((((76)|0))>>2)];
   var $sub38_i=((($180)-(1))|0);
   var $and39_i=$sub38_i & $179;
   var $cmp40_i157=(($and39_i)|(0))==0;
   if ($cmp40_i157) { var $ssize_0_i = $and11_i;label = 185; break; } else { label = 184; break; }
  case 184: 
   var $add43_i=((($sub38_i)+($179))|0);
   var $neg45_i=(((-$180))|0);
   var $and46_i=$add43_i & $neg45_i;
   var $sub47_i=((($and11_i)-($179))|0);
   var $add48_i=((($sub47_i)+($and46_i))|0);
   var $ssize_0_i = $add48_i;label = 185; break;
  case 185: 
   var $ssize_0_i;
   var $181=HEAP32[((((528)|0))>>2)];
   var $add51_i=((($181)+($ssize_0_i))|0);
   var $cmp52_i=(($ssize_0_i)>>>(0)) > (($nb_0)>>>(0));
   var $cmp54_i158=(($ssize_0_i)>>>(0)) < 2147483647;
   var $or_cond_i159=$cmp52_i & $cmp54_i158;
   if ($or_cond_i159) { label = 186; break; } else { var $tsize_0758385_i = 0;label = 198; break; }
  case 186: 
   var $182=HEAP32[((((536)|0))>>2)];
   var $cmp57_i=(($182)|(0))==0;
   if ($cmp57_i) { label = 188; break; } else { label = 187; break; }
  case 187: 
   var $cmp60_i=(($add51_i)>>>(0)) <= (($181)>>>(0));
   var $cmp63_i=(($add51_i)>>>(0)) > (($182)>>>(0));
   var $or_cond2_i=$cmp60_i | $cmp63_i;
   if ($or_cond2_i) { var $tsize_0758385_i = 0;label = 198; break; } else { label = 188; break; }
  case 188: 
   var $call65_i=_sbrk($ssize_0_i);
   var $cmp66_i160=(($call65_i)|(0))==(($call34_i)|(0));
   var $ssize_0__i=$cmp66_i160 ? $ssize_0_i : 0;
   var $call34__i=$cmp66_i160 ? $call34_i : -1;
   var $tbase_0_i = $call34__i;var $tsize_0_i = $ssize_0__i;var $br_0_i = $call65_i;var $ssize_1_i = $ssize_0_i;label = 191; break;
  case 189: 
   var $183=HEAP32[((((108)|0))>>2)];
   var $add74_i=((($add9_i)-($183))|0);
   var $and77_i=$add74_i & $neg_i151;
   var $cmp78_i=(($and77_i)>>>(0)) < 2147483647;
   if ($cmp78_i) { label = 190; break; } else { var $tsize_0758385_i = 0;label = 198; break; }
  case 190: 
   var $call80_i=_sbrk($and77_i);
   var $184=HEAP32[(($base_i_i)>>2)];
   var $185=HEAP32[(($size_i_i)>>2)];
   var $add_ptr_i162=(($184+$185)|0);
   var $cmp82_i=(($call80_i)|(0))==(($add_ptr_i162)|(0));
   var $and77__i=$cmp82_i ? $and77_i : 0;
   var $call80__i=$cmp82_i ? $call80_i : -1;
   var $tbase_0_i = $call80__i;var $tsize_0_i = $and77__i;var $br_0_i = $call80_i;var $ssize_1_i = $and77_i;label = 191; break;
  case 191: 
   var $ssize_1_i;
   var $br_0_i;
   var $tsize_0_i;
   var $tbase_0_i;
   var $sub109_i=(((-$ssize_1_i))|0);
   var $cmp86_i=(($tbase_0_i)|(0))==-1;
   if ($cmp86_i) { label = 192; break; } else { var $tsize_291_i = $tsize_0_i;var $tbase_292_i = $tbase_0_i;label = 202; break; }
  case 192: 
   var $cmp88_i=(($br_0_i)|(0))!=-1;
   var $cmp90_i163=(($ssize_1_i)>>>(0)) < 2147483647;
   var $or_cond3_i=$cmp88_i & $cmp90_i163;
   var $cmp93_i=(($ssize_1_i)>>>(0)) < (($add_i149)>>>(0));
   var $or_cond4_i=$or_cond3_i & $cmp93_i;
   if ($or_cond4_i) { label = 193; break; } else { var $ssize_2_i = $ssize_1_i;label = 197; break; }
  case 193: 
   var $186=HEAP32[((((80)|0))>>2)];
   var $sub96_i=((($sub_i150)-($ssize_1_i))|0);
   var $add98_i=((($sub96_i)+($186))|0);
   var $neg100_i=(((-$186))|0);
   var $and101_i=$add98_i & $neg100_i;
   var $cmp102_i=(($and101_i)>>>(0)) < 2147483647;
   if ($cmp102_i) { label = 194; break; } else { var $ssize_2_i = $ssize_1_i;label = 197; break; }
  case 194: 
   var $call104_i=_sbrk($and101_i);
   var $cmp105_i=(($call104_i)|(0))==-1;
   if ($cmp105_i) { label = 196; break; } else { label = 195; break; }
  case 195: 
   var $add107_i=((($and101_i)+($ssize_1_i))|0);
   var $ssize_2_i = $add107_i;label = 197; break;
  case 196: 
   var $call110_i=_sbrk($sub109_i);
   var $tsize_0758385_i = $tsize_0_i;label = 198; break;
  case 197: 
   var $ssize_2_i;
   var $cmp115_i164=(($br_0_i)|(0))==-1;
   if ($cmp115_i164) { var $tsize_0758385_i = $tsize_0_i;label = 198; break; } else { var $tsize_291_i = $ssize_2_i;var $tbase_292_i = $br_0_i;label = 202; break; }
  case 198: 
   var $tsize_0758385_i;
   var $187=HEAP32[((((540)|0))>>2)];
   var $or_i165=$187 | 4;
   HEAP32[((((540)|0))>>2)]=$or_i165;
   var $tsize_1_i = $tsize_0758385_i;label = 199; break;
  case 199: 
   var $tsize_1_i;
   var $cmp124_i=(($and11_i)>>>(0)) < 2147483647;
   if ($cmp124_i) { label = 200; break; } else { label = 343; break; }
  case 200: 
   var $call128_i=_sbrk($and11_i);
   var $call129_i=_sbrk(0);
   var $notlhs_i=(($call128_i)|(0))!=-1;
   var $notrhs_i=(($call129_i)|(0))!=-1;
   var $or_cond6_not_i=$notrhs_i & $notlhs_i;
   var $cmp134_i=(($call128_i)>>>(0)) < (($call129_i)>>>(0));
   var $or_cond7_i=$or_cond6_not_i & $cmp134_i;
   if ($or_cond7_i) { label = 201; break; } else { label = 343; break; }
  case 201: 
   var $sub_ptr_lhs_cast_i=$call129_i;
   var $sub_ptr_rhs_cast_i=$call128_i;
   var $sub_ptr_sub_i=((($sub_ptr_lhs_cast_i)-($sub_ptr_rhs_cast_i))|0);
   var $add137_i=((($nb_0)+(40))|0);
   var $cmp138_i166=(($sub_ptr_sub_i)>>>(0)) > (($add137_i)>>>(0));
   var $sub_ptr_sub_tsize_1_i=$cmp138_i166 ? $sub_ptr_sub_i : $tsize_1_i;
   if ($cmp138_i166) { var $tsize_291_i = $sub_ptr_sub_tsize_1_i;var $tbase_292_i = $call128_i;label = 202; break; } else { label = 343; break; }
  case 202: 
   var $tbase_292_i;
   var $tsize_291_i;
   var $188=HEAP32[((((528)|0))>>2)];
   var $add147_i=((($188)+($tsize_291_i))|0);
   HEAP32[((((528)|0))>>2)]=$add147_i;
   var $189=HEAP32[((((532)|0))>>2)];
   var $cmp148_i=(($add147_i)>>>(0)) > (($189)>>>(0));
   if ($cmp148_i) { label = 203; break; } else { label = 204; break; }
  case 203: 
   HEAP32[((((532)|0))>>2)]=$add147_i;
   label = 204; break;
  case 204: 
   var $190=HEAP32[((((120)|0))>>2)];
   var $cmp154_i=(($190)|(0))==0;
   if ($cmp154_i) { label = 205; break; } else { var $sp_0110_i = ((544)|0);label = 212; break; }
  case 205: 
   var $191=HEAP32[((((112)|0))>>2)];
   var $cmp156_i=(($191)|(0))==0;
   var $cmp159_i168=(($tbase_292_i)>>>(0)) < (($191)>>>(0));
   var $or_cond8_i=$cmp156_i | $cmp159_i168;
   if ($or_cond8_i) { label = 206; break; } else { label = 207; break; }
  case 206: 
   HEAP32[((((112)|0))>>2)]=$tbase_292_i;
   label = 207; break;
  case 207: 
   HEAP32[((((544)|0))>>2)]=$tbase_292_i;
   HEAP32[((((548)|0))>>2)]=$tsize_291_i;
   HEAP32[((((556)|0))>>2)]=0;
   var $192=HEAP32[((((72)|0))>>2)];
   HEAP32[((((132)|0))>>2)]=$192;
   HEAP32[((((128)|0))>>2)]=-1;
   var $i_02_i_i = 0;label = 208; break;
  case 208: 
   var $i_02_i_i;
   var $shl_i_i=$i_02_i_i << 1;
   var $arrayidx_i_i=((136+($shl_i_i<<2))|0);
   var $193=$arrayidx_i_i;
   var $arrayidx_sum_i_i=((($shl_i_i)+(3))|0);
   var $194=((136+($arrayidx_sum_i_i<<2))|0);
   HEAP32[(($194)>>2)]=$193;
   var $arrayidx_sum1_i_i=((($shl_i_i)+(2))|0);
   var $195=((136+($arrayidx_sum1_i_i<<2))|0);
   HEAP32[(($195)>>2)]=$193;
   var $inc_i_i=((($i_02_i_i)+(1))|0);
   var $cmp_i11_i=(($inc_i_i)>>>(0)) < 32;
   if ($cmp_i11_i) { var $i_02_i_i = $inc_i_i;label = 208; break; } else { label = 209; break; }
  case 209: 
   var $sub169_i=((($tsize_291_i)-(40))|0);
   var $add_ptr_i12_i=(($tbase_292_i+8)|0);
   var $196=$add_ptr_i12_i;
   var $and_i13_i=$196 & 7;
   var $cmp_i14_i=(($and_i13_i)|(0))==0;
   if ($cmp_i14_i) { var $cond_i_i = 0;label = 211; break; } else { label = 210; break; }
  case 210: 
   var $197=(((-$196))|0);
   var $and3_i_i=$197 & 7;
   var $cond_i_i = $and3_i_i;label = 211; break;
  case 211: 
   var $cond_i_i;
   var $add_ptr4_i_i=(($tbase_292_i+$cond_i_i)|0);
   var $198=$add_ptr4_i_i;
   var $sub5_i_i=((($sub169_i)-($cond_i_i))|0);
   HEAP32[((((120)|0))>>2)]=$198;
   HEAP32[((((108)|0))>>2)]=$sub5_i_i;
   var $or_i_i=$sub5_i_i | 1;
   var $add_ptr4_sum_i_i=((($cond_i_i)+(4))|0);
   var $head_i_i=(($tbase_292_i+$add_ptr4_sum_i_i)|0);
   var $199=$head_i_i;
   HEAP32[(($199)>>2)]=$or_i_i;
   var $add_ptr6_sum_i_i=((($tsize_291_i)-(36))|0);
   var $head7_i_i=(($tbase_292_i+$add_ptr6_sum_i_i)|0);
   var $200=$head7_i_i;
   HEAP32[(($200)>>2)]=40;
   var $201=HEAP32[((((88)|0))>>2)];
   HEAP32[((((124)|0))>>2)]=$201;
   label = 341; break;
  case 212: 
   var $sp_0110_i;
   var $base184_i=(($sp_0110_i)|0);
   var $202=HEAP32[(($base184_i)>>2)];
   var $size185_i=(($sp_0110_i+4)|0);
   var $203=HEAP32[(($size185_i)>>2)];
   var $add_ptr186_i=(($202+$203)|0);
   var $cmp187_i=(($tbase_292_i)|(0))==(($add_ptr186_i)|(0));
   if ($cmp187_i) { label = 214; break; } else { label = 213; break; }
  case 213: 
   var $next_i=(($sp_0110_i+8)|0);
   var $204=HEAP32[(($next_i)>>2)];
   var $cmp183_i=(($204)|(0))==0;
   if ($cmp183_i) { label = 219; break; } else { var $sp_0110_i = $204;label = 212; break; }
  case 214: 
   var $sflags190_i=(($sp_0110_i+12)|0);
   var $205=HEAP32[(($sflags190_i)>>2)];
   var $and191_i=$205 & 8;
   var $tobool192_i=(($and191_i)|(0))==0;
   if ($tobool192_i) { label = 215; break; } else { label = 219; break; }
  case 215: 
   var $206=$190;
   var $cmp200_i=(($206)>>>(0)) >= (($202)>>>(0));
   var $cmp206_i=(($206)>>>(0)) < (($tbase_292_i)>>>(0));
   var $or_cond94_i=$cmp200_i & $cmp206_i;
   if ($or_cond94_i) { label = 216; break; } else { label = 219; break; }
  case 216: 
   var $add209_i=((($203)+($tsize_291_i))|0);
   HEAP32[(($size185_i)>>2)]=$add209_i;
   var $207=HEAP32[((((120)|0))>>2)];
   var $208=HEAP32[((((108)|0))>>2)];
   var $add212_i=((($208)+($tsize_291_i))|0);
   var $209=$207;
   var $add_ptr_i23_i=(($207+8)|0);
   var $210=$add_ptr_i23_i;
   var $and_i24_i=$210 & 7;
   var $cmp_i25_i=(($and_i24_i)|(0))==0;
   if ($cmp_i25_i) { var $cond_i28_i = 0;label = 218; break; } else { label = 217; break; }
  case 217: 
   var $211=(((-$210))|0);
   var $and3_i26_i=$211 & 7;
   var $cond_i28_i = $and3_i26_i;label = 218; break;
  case 218: 
   var $cond_i28_i;
   var $add_ptr4_i29_i=(($209+$cond_i28_i)|0);
   var $212=$add_ptr4_i29_i;
   var $sub5_i30_i=((($add212_i)-($cond_i28_i))|0);
   HEAP32[((((120)|0))>>2)]=$212;
   HEAP32[((((108)|0))>>2)]=$sub5_i30_i;
   var $or_i31_i=$sub5_i30_i | 1;
   var $add_ptr4_sum_i32_i=((($cond_i28_i)+(4))|0);
   var $head_i33_i=(($209+$add_ptr4_sum_i32_i)|0);
   var $213=$head_i33_i;
   HEAP32[(($213)>>2)]=$or_i31_i;
   var $add_ptr6_sum_i34_i=((($add212_i)+(4))|0);
   var $head7_i35_i=(($209+$add_ptr6_sum_i34_i)|0);
   var $214=$head7_i35_i;
   HEAP32[(($214)>>2)]=40;
   var $215=HEAP32[((((88)|0))>>2)];
   HEAP32[((((124)|0))>>2)]=$215;
   label = 341; break;
  case 219: 
   var $216=HEAP32[((((112)|0))>>2)];
   var $cmp215_i=(($tbase_292_i)>>>(0)) < (($216)>>>(0));
   if ($cmp215_i) { label = 220; break; } else { label = 221; break; }
  case 220: 
   HEAP32[((((112)|0))>>2)]=$tbase_292_i;
   label = 221; break;
  case 221: 
   var $add_ptr224_i=(($tbase_292_i+$tsize_291_i)|0);
   var $sp_1106_i = ((544)|0);label = 222; break;
  case 222: 
   var $sp_1106_i;
   var $base223_i=(($sp_1106_i)|0);
   var $217=HEAP32[(($base223_i)>>2)];
   var $cmp225_i=(($217)|(0))==(($add_ptr224_i)|(0));
   if ($cmp225_i) { label = 224; break; } else { label = 223; break; }
  case 223: 
   var $next228_i=(($sp_1106_i+8)|0);
   var $218=HEAP32[(($next228_i)>>2)];
   var $cmp221_i=(($218)|(0))==0;
   if ($cmp221_i) { label = 306; break; } else { var $sp_1106_i = $218;label = 222; break; }
  case 224: 
   var $sflags232_i=(($sp_1106_i+12)|0);
   var $219=HEAP32[(($sflags232_i)>>2)];
   var $and233_i=$219 & 8;
   var $tobool234_i=(($and233_i)|(0))==0;
   if ($tobool234_i) { label = 225; break; } else { label = 306; break; }
  case 225: 
   HEAP32[(($base223_i)>>2)]=$tbase_292_i;
   var $size242_i=(($sp_1106_i+4)|0);
   var $220=HEAP32[(($size242_i)>>2)];
   var $add243_i=((($220)+($tsize_291_i))|0);
   HEAP32[(($size242_i)>>2)]=$add243_i;
   var $add_ptr_i38_i=(($tbase_292_i+8)|0);
   var $221=$add_ptr_i38_i;
   var $and_i39_i=$221 & 7;
   var $cmp_i40_i=(($and_i39_i)|(0))==0;
   if ($cmp_i40_i) { var $cond_i43_i = 0;label = 227; break; } else { label = 226; break; }
  case 226: 
   var $222=(((-$221))|0);
   var $and3_i41_i=$222 & 7;
   var $cond_i43_i = $and3_i41_i;label = 227; break;
  case 227: 
   var $cond_i43_i;
   var $add_ptr4_i44_i=(($tbase_292_i+$cond_i43_i)|0);
   var $add_ptr224_sum_i=((($tsize_291_i)+(8))|0);
   var $add_ptr5_i_i=(($tbase_292_i+$add_ptr224_sum_i)|0);
   var $223=$add_ptr5_i_i;
   var $and6_i45_i=$223 & 7;
   var $cmp7_i_i=(($and6_i45_i)|(0))==0;
   if ($cmp7_i_i) { var $cond15_i_i = 0;label = 229; break; } else { label = 228; break; }
  case 228: 
   var $224=(((-$223))|0);
   var $and13_i_i=$224 & 7;
   var $cond15_i_i = $and13_i_i;label = 229; break;
  case 229: 
   var $cond15_i_i;
   var $add_ptr224_sum132_i=((($cond15_i_i)+($tsize_291_i))|0);
   var $add_ptr16_i_i=(($tbase_292_i+$add_ptr224_sum132_i)|0);
   var $225=$add_ptr16_i_i;
   var $sub_ptr_lhs_cast_i47_i=$add_ptr16_i_i;
   var $sub_ptr_rhs_cast_i48_i=$add_ptr4_i44_i;
   var $sub_ptr_sub_i49_i=((($sub_ptr_lhs_cast_i47_i)-($sub_ptr_rhs_cast_i48_i))|0);
   var $add_ptr4_sum_i50_i=((($cond_i43_i)+($nb_0))|0);
   var $add_ptr17_i_i=(($tbase_292_i+$add_ptr4_sum_i50_i)|0);
   var $226=$add_ptr17_i_i;
   var $sub18_i_i=((($sub_ptr_sub_i49_i)-($nb_0))|0);
   var $or19_i_i=$nb_0 | 3;
   var $add_ptr4_sum1_i_i=((($cond_i43_i)+(4))|0);
   var $head_i51_i=(($tbase_292_i+$add_ptr4_sum1_i_i)|0);
   var $227=$head_i51_i;
   HEAP32[(($227)>>2)]=$or19_i_i;
   var $228=HEAP32[((((120)|0))>>2)];
   var $cmp20_i_i=(($225)|(0))==(($228)|(0));
   if ($cmp20_i_i) { label = 230; break; } else { label = 231; break; }
  case 230: 
   var $229=HEAP32[((((108)|0))>>2)];
   var $add_i_i=((($229)+($sub18_i_i))|0);
   HEAP32[((((108)|0))>>2)]=$add_i_i;
   HEAP32[((((120)|0))>>2)]=$226;
   var $or22_i_i=$add_i_i | 1;
   var $add_ptr17_sum39_i_i=((($add_ptr4_sum_i50_i)+(4))|0);
   var $head23_i_i=(($tbase_292_i+$add_ptr17_sum39_i_i)|0);
   var $230=$head23_i_i;
   HEAP32[(($230)>>2)]=$or22_i_i;
   label = 305; break;
  case 231: 
   var $231=HEAP32[((((116)|0))>>2)];
   var $cmp24_i_i=(($225)|(0))==(($231)|(0));
   if ($cmp24_i_i) { label = 232; break; } else { label = 233; break; }
  case 232: 
   var $232=HEAP32[((((104)|0))>>2)];
   var $add26_i_i=((($232)+($sub18_i_i))|0);
   HEAP32[((((104)|0))>>2)]=$add26_i_i;
   HEAP32[((((116)|0))>>2)]=$226;
   var $or28_i_i=$add26_i_i | 1;
   var $add_ptr17_sum37_i_i=((($add_ptr4_sum_i50_i)+(4))|0);
   var $head29_i_i=(($tbase_292_i+$add_ptr17_sum37_i_i)|0);
   var $233=$head29_i_i;
   HEAP32[(($233)>>2)]=$or28_i_i;
   var $add_ptr17_sum38_i_i=((($add26_i_i)+($add_ptr4_sum_i50_i))|0);
   var $add_ptr30_i53_i=(($tbase_292_i+$add_ptr17_sum38_i_i)|0);
   var $prev_foot_i54_i=$add_ptr30_i53_i;
   HEAP32[(($prev_foot_i54_i)>>2)]=$add26_i_i;
   label = 305; break;
  case 233: 
   var $add_ptr16_sum_i_i=((($tsize_291_i)+(4))|0);
   var $add_ptr224_sum133_i=((($add_ptr16_sum_i_i)+($cond15_i_i))|0);
   var $head32_i_i=(($tbase_292_i+$add_ptr224_sum133_i)|0);
   var $234=$head32_i_i;
   var $235=HEAP32[(($234)>>2)];
   var $and33_i_i=$235 & 3;
   var $cmp34_i_i=(($and33_i_i)|(0))==1;
   if ($cmp34_i_i) { label = 234; break; } else { var $oldfirst_0_i_i = $225;var $qsize_0_i_i = $sub18_i_i;label = 281; break; }
  case 234: 
   var $and37_i_i=$235 & -8;
   var $shr_i55_i=$235 >>> 3;
   var $cmp38_i_i=(($235)>>>(0)) < 256;
   if ($cmp38_i_i) { label = 235; break; } else { label = 247; break; }
  case 235: 
   var $add_ptr16_sum3233_i_i=$cond15_i_i | 8;
   var $add_ptr224_sum143_i=((($add_ptr16_sum3233_i_i)+($tsize_291_i))|0);
   var $fd_i_i=(($tbase_292_i+$add_ptr224_sum143_i)|0);
   var $236=$fd_i_i;
   var $237=HEAP32[(($236)>>2)];
   var $add_ptr16_sum34_i_i=((($tsize_291_i)+(12))|0);
   var $add_ptr224_sum144_i=((($add_ptr16_sum34_i_i)+($cond15_i_i))|0);
   var $bk_i56_i=(($tbase_292_i+$add_ptr224_sum144_i)|0);
   var $238=$bk_i56_i;
   var $239=HEAP32[(($238)>>2)];
   var $shl_i57_i=$shr_i55_i << 1;
   var $arrayidx_i58_i=((136+($shl_i57_i<<2))|0);
   var $240=$arrayidx_i58_i;
   var $cmp41_i_i=(($237)|(0))==(($240)|(0));
   if ($cmp41_i_i) { label = 238; break; } else { label = 236; break; }
  case 236: 
   var $241=$237;
   var $242=HEAP32[((((112)|0))>>2)];
   var $cmp42_i_i=(($241)>>>(0)) < (($242)>>>(0));
   if ($cmp42_i_i) { label = 246; break; } else { label = 237; break; }
  case 237: 
   var $bk43_i_i=(($237+12)|0);
   var $243=HEAP32[(($bk43_i_i)>>2)];
   var $cmp44_i_i=(($243)|(0))==(($225)|(0));
   if ($cmp44_i_i) { label = 238; break; } else { label = 246; break; }
  case 238: 
   var $cmp46_i60_i=(($239)|(0))==(($237)|(0));
   if ($cmp46_i60_i) { label = 239; break; } else { label = 240; break; }
  case 239: 
   var $shl48_i_i=1 << $shr_i55_i;
   var $neg_i_i=$shl48_i_i ^ -1;
   var $244=HEAP32[((((96)|0))>>2)];
   var $and49_i_i=$244 & $neg_i_i;
   HEAP32[((((96)|0))>>2)]=$and49_i_i;
   label = 280; break;
  case 240: 
   var $cmp54_i_i=(($239)|(0))==(($240)|(0));
   if ($cmp54_i_i) { label = 241; break; } else { label = 242; break; }
  case 241: 
   var $fd68_pre_i_i=(($239+8)|0);
   var $fd68_pre_phi_i_i = $fd68_pre_i_i;label = 244; break;
  case 242: 
   var $245=$239;
   var $246=HEAP32[((((112)|0))>>2)];
   var $cmp57_i_i=(($245)>>>(0)) < (($246)>>>(0));
   if ($cmp57_i_i) { label = 245; break; } else { label = 243; break; }
  case 243: 
   var $fd59_i_i=(($239+8)|0);
   var $247=HEAP32[(($fd59_i_i)>>2)];
   var $cmp60_i_i=(($247)|(0))==(($225)|(0));
   if ($cmp60_i_i) { var $fd68_pre_phi_i_i = $fd59_i_i;label = 244; break; } else { label = 245; break; }
  case 244: 
   var $fd68_pre_phi_i_i;
   var $bk67_i_i=(($237+12)|0);
   HEAP32[(($bk67_i_i)>>2)]=$239;
   HEAP32[(($fd68_pre_phi_i_i)>>2)]=$237;
   label = 280; break;
  case 245: 
   _abort();
   throw "Reached an unreachable!";
  case 246: 
   _abort();
   throw "Reached an unreachable!";
  case 247: 
   var $248=$add_ptr16_i_i;
   var $add_ptr16_sum23_i_i=$cond15_i_i | 24;
   var $add_ptr224_sum134_i=((($add_ptr16_sum23_i_i)+($tsize_291_i))|0);
   var $parent_i62_i=(($tbase_292_i+$add_ptr224_sum134_i)|0);
   var $249=$parent_i62_i;
   var $250=HEAP32[(($249)>>2)];
   var $add_ptr16_sum4_i_i=((($tsize_291_i)+(12))|0);
   var $add_ptr224_sum135_i=((($add_ptr16_sum4_i_i)+($cond15_i_i))|0);
   var $bk74_i_i=(($tbase_292_i+$add_ptr224_sum135_i)|0);
   var $251=$bk74_i_i;
   var $252=HEAP32[(($251)>>2)];
   var $cmp75_i_i=(($252)|(0))==(($248)|(0));
   if ($cmp75_i_i) { label = 253; break; } else { label = 248; break; }
  case 248: 
   var $add_ptr16_sum2930_i_i=$cond15_i_i | 8;
   var $add_ptr224_sum136_i=((($add_ptr16_sum2930_i_i)+($tsize_291_i))|0);
   var $fd78_i_i=(($tbase_292_i+$add_ptr224_sum136_i)|0);
   var $253=$fd78_i_i;
   var $254=HEAP32[(($253)>>2)];
   var $255=$254;
   var $256=HEAP32[((((112)|0))>>2)];
   var $cmp81_i_i=(($255)>>>(0)) < (($256)>>>(0));
   if ($cmp81_i_i) { label = 252; break; } else { label = 249; break; }
  case 249: 
   var $bk82_i_i=(($254+12)|0);
   var $257=HEAP32[(($bk82_i_i)>>2)];
   var $cmp83_i_i=(($257)|(0))==(($248)|(0));
   if ($cmp83_i_i) { label = 250; break; } else { label = 252; break; }
  case 250: 
   var $fd85_i_i=(($252+8)|0);
   var $258=HEAP32[(($fd85_i_i)>>2)];
   var $cmp86_i_i=(($258)|(0))==(($248)|(0));
   if ($cmp86_i_i) { label = 251; break; } else { label = 252; break; }
  case 251: 
   HEAP32[(($bk82_i_i)>>2)]=$252;
   HEAP32[(($fd85_i_i)>>2)]=$254;
   var $R_1_i_i = $252;label = 260; break;
  case 252: 
   _abort();
   throw "Reached an unreachable!";
  case 253: 
   var $add_ptr16_sum56_i_i=$cond15_i_i | 16;
   var $add_ptr224_sum141_i=((($add_ptr16_sum_i_i)+($add_ptr16_sum56_i_i))|0);
   var $arrayidx96_i_i=(($tbase_292_i+$add_ptr224_sum141_i)|0);
   var $259=$arrayidx96_i_i;
   var $260=HEAP32[(($259)>>2)];
   var $cmp97_i_i=(($260)|(0))==0;
   if ($cmp97_i_i) { label = 254; break; } else { var $R_0_i_i = $260;var $RP_0_i_i = $259;label = 255; break; }
  case 254: 
   var $add_ptr224_sum142_i=((($add_ptr16_sum56_i_i)+($tsize_291_i))|0);
   var $child_i_i=(($tbase_292_i+$add_ptr224_sum142_i)|0);
   var $arrayidx99_i_i=$child_i_i;
   var $261=HEAP32[(($arrayidx99_i_i)>>2)];
   var $cmp100_i_i=(($261)|(0))==0;
   if ($cmp100_i_i) { var $R_1_i_i = 0;label = 260; break; } else { var $R_0_i_i = $261;var $RP_0_i_i = $arrayidx99_i_i;label = 255; break; }
  case 255: 
   var $RP_0_i_i;
   var $R_0_i_i;
   var $arrayidx103_i_i=(($R_0_i_i+20)|0);
   var $262=HEAP32[(($arrayidx103_i_i)>>2)];
   var $cmp104_i_i=(($262)|(0))==0;
   if ($cmp104_i_i) { label = 256; break; } else { var $R_0_i_i = $262;var $RP_0_i_i = $arrayidx103_i_i;label = 255; break; }
  case 256: 
   var $arrayidx107_i_i=(($R_0_i_i+16)|0);
   var $263=HEAP32[(($arrayidx107_i_i)>>2)];
   var $cmp108_i_i=(($263)|(0))==0;
   if ($cmp108_i_i) { label = 257; break; } else { var $R_0_i_i = $263;var $RP_0_i_i = $arrayidx107_i_i;label = 255; break; }
  case 257: 
   var $264=$RP_0_i_i;
   var $265=HEAP32[((((112)|0))>>2)];
   var $cmp112_i_i=(($264)>>>(0)) < (($265)>>>(0));
   if ($cmp112_i_i) { label = 259; break; } else { label = 258; break; }
  case 258: 
   HEAP32[(($RP_0_i_i)>>2)]=0;
   var $R_1_i_i = $R_0_i_i;label = 260; break;
  case 259: 
   _abort();
   throw "Reached an unreachable!";
  case 260: 
   var $R_1_i_i;
   var $cmp120_i64_i=(($250)|(0))==0;
   if ($cmp120_i64_i) { label = 280; break; } else { label = 261; break; }
  case 261: 
   var $add_ptr16_sum26_i_i=((($tsize_291_i)+(28))|0);
   var $add_ptr224_sum137_i=((($add_ptr16_sum26_i_i)+($cond15_i_i))|0);
   var $index_i65_i=(($tbase_292_i+$add_ptr224_sum137_i)|0);
   var $266=$index_i65_i;
   var $267=HEAP32[(($266)>>2)];
   var $arrayidx123_i_i=((400+($267<<2))|0);
   var $268=HEAP32[(($arrayidx123_i_i)>>2)];
   var $cmp124_i_i=(($248)|(0))==(($268)|(0));
   if ($cmp124_i_i) { label = 262; break; } else { label = 264; break; }
  case 262: 
   HEAP32[(($arrayidx123_i_i)>>2)]=$R_1_i_i;
   var $cond41_i_i=(($R_1_i_i)|(0))==0;
   if ($cond41_i_i) { label = 263; break; } else { label = 270; break; }
  case 263: 
   var $269=HEAP32[(($266)>>2)];
   var $shl131_i_i=1 << $269;
   var $neg132_i_i=$shl131_i_i ^ -1;
   var $270=HEAP32[((((100)|0))>>2)];
   var $and133_i_i=$270 & $neg132_i_i;
   HEAP32[((((100)|0))>>2)]=$and133_i_i;
   label = 280; break;
  case 264: 
   var $271=$250;
   var $272=HEAP32[((((112)|0))>>2)];
   var $cmp137_i_i=(($271)>>>(0)) < (($272)>>>(0));
   if ($cmp137_i_i) { label = 268; break; } else { label = 265; break; }
  case 265: 
   var $arrayidx143_i_i=(($250+16)|0);
   var $273=HEAP32[(($arrayidx143_i_i)>>2)];
   var $cmp144_i_i=(($273)|(0))==(($248)|(0));
   if ($cmp144_i_i) { label = 266; break; } else { label = 267; break; }
  case 266: 
   HEAP32[(($arrayidx143_i_i)>>2)]=$R_1_i_i;
   label = 269; break;
  case 267: 
   var $arrayidx151_i_i=(($250+20)|0);
   HEAP32[(($arrayidx151_i_i)>>2)]=$R_1_i_i;
   label = 269; break;
  case 268: 
   _abort();
   throw "Reached an unreachable!";
  case 269: 
   var $cmp156_i_i=(($R_1_i_i)|(0))==0;
   if ($cmp156_i_i) { label = 280; break; } else { label = 270; break; }
  case 270: 
   var $274=$R_1_i_i;
   var $275=HEAP32[((((112)|0))>>2)];
   var $cmp160_i_i=(($274)>>>(0)) < (($275)>>>(0));
   if ($cmp160_i_i) { label = 279; break; } else { label = 271; break; }
  case 271: 
   var $parent165_i_i=(($R_1_i_i+24)|0);
   HEAP32[(($parent165_i_i)>>2)]=$250;
   var $add_ptr16_sum2728_i_i=$cond15_i_i | 16;
   var $add_ptr224_sum138_i=((($add_ptr16_sum2728_i_i)+($tsize_291_i))|0);
   var $child166_i_i=(($tbase_292_i+$add_ptr224_sum138_i)|0);
   var $arrayidx167_i_i=$child166_i_i;
   var $276=HEAP32[(($arrayidx167_i_i)>>2)];
   var $cmp168_i_i=(($276)|(0))==0;
   if ($cmp168_i_i) { label = 275; break; } else { label = 272; break; }
  case 272: 
   var $277=$276;
   var $278=HEAP32[((((112)|0))>>2)];
   var $cmp172_i_i=(($277)>>>(0)) < (($278)>>>(0));
   if ($cmp172_i_i) { label = 274; break; } else { label = 273; break; }
  case 273: 
   var $arrayidx178_i_i=(($R_1_i_i+16)|0);
   HEAP32[(($arrayidx178_i_i)>>2)]=$276;
   var $parent179_i_i=(($276+24)|0);
   HEAP32[(($parent179_i_i)>>2)]=$R_1_i_i;
   label = 275; break;
  case 274: 
   _abort();
   throw "Reached an unreachable!";
  case 275: 
   var $add_ptr224_sum139_i=((($add_ptr16_sum_i_i)+($add_ptr16_sum2728_i_i))|0);
   var $arrayidx184_i_i=(($tbase_292_i+$add_ptr224_sum139_i)|0);
   var $279=$arrayidx184_i_i;
   var $280=HEAP32[(($279)>>2)];
   var $cmp185_i_i=(($280)|(0))==0;
   if ($cmp185_i_i) { label = 280; break; } else { label = 276; break; }
  case 276: 
   var $281=$280;
   var $282=HEAP32[((((112)|0))>>2)];
   var $cmp189_i_i=(($281)>>>(0)) < (($282)>>>(0));
   if ($cmp189_i_i) { label = 278; break; } else { label = 277; break; }
  case 277: 
   var $arrayidx195_i_i=(($R_1_i_i+20)|0);
   HEAP32[(($arrayidx195_i_i)>>2)]=$280;
   var $parent196_i_i=(($280+24)|0);
   HEAP32[(($parent196_i_i)>>2)]=$R_1_i_i;
   label = 280; break;
  case 278: 
   _abort();
   throw "Reached an unreachable!";
  case 279: 
   _abort();
   throw "Reached an unreachable!";
  case 280: 
   var $add_ptr16_sum7_i_i=$and37_i_i | $cond15_i_i;
   var $add_ptr224_sum140_i=((($add_ptr16_sum7_i_i)+($tsize_291_i))|0);
   var $add_ptr205_i_i=(($tbase_292_i+$add_ptr224_sum140_i)|0);
   var $283=$add_ptr205_i_i;
   var $add206_i_i=((($and37_i_i)+($sub18_i_i))|0);
   var $oldfirst_0_i_i = $283;var $qsize_0_i_i = $add206_i_i;label = 281; break;
  case 281: 
   var $qsize_0_i_i;
   var $oldfirst_0_i_i;
   var $head208_i_i=(($oldfirst_0_i_i+4)|0);
   var $284=HEAP32[(($head208_i_i)>>2)];
   var $and209_i_i=$284 & -2;
   HEAP32[(($head208_i_i)>>2)]=$and209_i_i;
   var $or210_i_i=$qsize_0_i_i | 1;
   var $add_ptr17_sum_i_i=((($add_ptr4_sum_i50_i)+(4))|0);
   var $head211_i_i=(($tbase_292_i+$add_ptr17_sum_i_i)|0);
   var $285=$head211_i_i;
   HEAP32[(($285)>>2)]=$or210_i_i;
   var $add_ptr17_sum8_i_i=((($qsize_0_i_i)+($add_ptr4_sum_i50_i))|0);
   var $add_ptr212_i_i=(($tbase_292_i+$add_ptr17_sum8_i_i)|0);
   var $prev_foot213_i_i=$add_ptr212_i_i;
   HEAP32[(($prev_foot213_i_i)>>2)]=$qsize_0_i_i;
   var $shr214_i_i=$qsize_0_i_i >>> 3;
   var $cmp215_i_i=(($qsize_0_i_i)>>>(0)) < 256;
   if ($cmp215_i_i) { label = 282; break; } else { label = 287; break; }
  case 282: 
   var $shl221_i_i=$shr214_i_i << 1;
   var $arrayidx223_i_i=((136+($shl221_i_i<<2))|0);
   var $286=$arrayidx223_i_i;
   var $287=HEAP32[((((96)|0))>>2)];
   var $shl226_i_i=1 << $shr214_i_i;
   var $and227_i_i=$287 & $shl226_i_i;
   var $tobool228_i_i=(($and227_i_i)|(0))==0;
   if ($tobool228_i_i) { label = 283; break; } else { label = 284; break; }
  case 283: 
   var $or232_i_i=$287 | $shl226_i_i;
   HEAP32[((((96)|0))>>2)]=$or232_i_i;
   var $arrayidx223_sum_pre_i_i=((($shl221_i_i)+(2))|0);
   var $_pre_i67_i=((136+($arrayidx223_sum_pre_i_i<<2))|0);
   var $F224_0_i_i = $286;var $_pre_phi_i68_i = $_pre_i67_i;label = 286; break;
  case 284: 
   var $arrayidx223_sum25_i_i=((($shl221_i_i)+(2))|0);
   var $288=((136+($arrayidx223_sum25_i_i<<2))|0);
   var $289=HEAP32[(($288)>>2)];
   var $290=$289;
   var $291=HEAP32[((((112)|0))>>2)];
   var $cmp236_i_i=(($290)>>>(0)) < (($291)>>>(0));
   if ($cmp236_i_i) { label = 285; break; } else { var $F224_0_i_i = $289;var $_pre_phi_i68_i = $288;label = 286; break; }
  case 285: 
   _abort();
   throw "Reached an unreachable!";
  case 286: 
   var $_pre_phi_i68_i;
   var $F224_0_i_i;
   HEAP32[(($_pre_phi_i68_i)>>2)]=$226;
   var $bk246_i_i=(($F224_0_i_i+12)|0);
   HEAP32[(($bk246_i_i)>>2)]=$226;
   var $add_ptr17_sum23_i_i=((($add_ptr4_sum_i50_i)+(8))|0);
   var $fd247_i_i=(($tbase_292_i+$add_ptr17_sum23_i_i)|0);
   var $292=$fd247_i_i;
   HEAP32[(($292)>>2)]=$F224_0_i_i;
   var $add_ptr17_sum24_i_i=((($add_ptr4_sum_i50_i)+(12))|0);
   var $bk248_i_i=(($tbase_292_i+$add_ptr17_sum24_i_i)|0);
   var $293=$bk248_i_i;
   HEAP32[(($293)>>2)]=$286;
   label = 305; break;
  case 287: 
   var $294=$add_ptr17_i_i;
   var $shr253_i_i=$qsize_0_i_i >>> 8;
   var $cmp254_i_i=(($shr253_i_i)|(0))==0;
   if ($cmp254_i_i) { var $I252_0_i_i = 0;label = 290; break; } else { label = 288; break; }
  case 288: 
   var $cmp258_i_i=(($qsize_0_i_i)>>>(0)) > 16777215;
   if ($cmp258_i_i) { var $I252_0_i_i = 31;label = 290; break; } else { label = 289; break; }
  case 289: 
   var $sub262_i_i=((($shr253_i_i)+(1048320))|0);
   var $shr263_i_i=$sub262_i_i >>> 16;
   var $and264_i_i=$shr263_i_i & 8;
   var $shl265_i_i=$shr253_i_i << $and264_i_i;
   var $sub266_i_i=((($shl265_i_i)+(520192))|0);
   var $shr267_i_i=$sub266_i_i >>> 16;
   var $and268_i_i=$shr267_i_i & 4;
   var $add269_i_i=$and268_i_i | $and264_i_i;
   var $shl270_i_i=$shl265_i_i << $and268_i_i;
   var $sub271_i_i=((($shl270_i_i)+(245760))|0);
   var $shr272_i_i=$sub271_i_i >>> 16;
   var $and273_i_i=$shr272_i_i & 2;
   var $add274_i_i=$add269_i_i | $and273_i_i;
   var $sub275_i_i=(((14)-($add274_i_i))|0);
   var $shl276_i_i=$shl270_i_i << $and273_i_i;
   var $shr277_i_i=$shl276_i_i >>> 15;
   var $add278_i_i=((($sub275_i_i)+($shr277_i_i))|0);
   var $shl279_i_i=$add278_i_i << 1;
   var $add280_i_i=((($add278_i_i)+(7))|0);
   var $shr281_i_i=$qsize_0_i_i >>> (($add280_i_i)>>>(0));
   var $and282_i_i=$shr281_i_i & 1;
   var $add283_i_i=$and282_i_i | $shl279_i_i;
   var $I252_0_i_i = $add283_i_i;label = 290; break;
  case 290: 
   var $I252_0_i_i;
   var $arrayidx287_i_i=((400+($I252_0_i_i<<2))|0);
   var $add_ptr17_sum9_i_i=((($add_ptr4_sum_i50_i)+(28))|0);
   var $index288_i_i=(($tbase_292_i+$add_ptr17_sum9_i_i)|0);
   var $295=$index288_i_i;
   HEAP32[(($295)>>2)]=$I252_0_i_i;
   var $add_ptr17_sum10_i_i=((($add_ptr4_sum_i50_i)+(16))|0);
   var $child289_i_i=(($tbase_292_i+$add_ptr17_sum10_i_i)|0);
   var $child289_sum_i_i=((($add_ptr4_sum_i50_i)+(20))|0);
   var $arrayidx290_i_i=(($tbase_292_i+$child289_sum_i_i)|0);
   var $296=$arrayidx290_i_i;
   HEAP32[(($296)>>2)]=0;
   var $arrayidx292_i_i=$child289_i_i;
   HEAP32[(($arrayidx292_i_i)>>2)]=0;
   var $297=HEAP32[((((100)|0))>>2)];
   var $shl294_i_i=1 << $I252_0_i_i;
   var $and295_i_i=$297 & $shl294_i_i;
   var $tobool296_i_i=(($and295_i_i)|(0))==0;
   if ($tobool296_i_i) { label = 291; break; } else { label = 292; break; }
  case 291: 
   var $or300_i_i=$297 | $shl294_i_i;
   HEAP32[((((100)|0))>>2)]=$or300_i_i;
   HEAP32[(($arrayidx287_i_i)>>2)]=$294;
   var $298=$arrayidx287_i_i;
   var $add_ptr17_sum11_i_i=((($add_ptr4_sum_i50_i)+(24))|0);
   var $parent301_i_i=(($tbase_292_i+$add_ptr17_sum11_i_i)|0);
   var $299=$parent301_i_i;
   HEAP32[(($299)>>2)]=$298;
   var $add_ptr17_sum12_i_i=((($add_ptr4_sum_i50_i)+(12))|0);
   var $bk302_i_i=(($tbase_292_i+$add_ptr17_sum12_i_i)|0);
   var $300=$bk302_i_i;
   HEAP32[(($300)>>2)]=$294;
   var $add_ptr17_sum13_i_i=((($add_ptr4_sum_i50_i)+(8))|0);
   var $fd303_i_i=(($tbase_292_i+$add_ptr17_sum13_i_i)|0);
   var $301=$fd303_i_i;
   HEAP32[(($301)>>2)]=$294;
   label = 305; break;
  case 292: 
   var $302=HEAP32[(($arrayidx287_i_i)>>2)];
   var $cmp306_i_i=(($I252_0_i_i)|(0))==31;
   if ($cmp306_i_i) { var $cond315_i_i = 0;label = 294; break; } else { label = 293; break; }
  case 293: 
   var $shr310_i_i=$I252_0_i_i >>> 1;
   var $sub313_i_i=(((25)-($shr310_i_i))|0);
   var $cond315_i_i = $sub313_i_i;label = 294; break;
  case 294: 
   var $cond315_i_i;
   var $head31743_i_i=(($302+4)|0);
   var $303=HEAP32[(($head31743_i_i)>>2)];
   var $and31844_i_i=$303 & -8;
   var $cmp31945_i_i=(($and31844_i_i)|(0))==(($qsize_0_i_i)|(0));
   if ($cmp31945_i_i) { var $T_0_lcssa_i70_i = $302;label = 301; break; } else { label = 295; break; }
  case 295: 
   var $shl316_i_i=$qsize_0_i_i << $cond315_i_i;
   var $T_046_i_i = $302;var $K305_047_i_i = $shl316_i_i;label = 297; break;
  case 296: 
   var $shl326_i_i=$K305_047_i_i << 1;
   var $head317_i_i=(($305+4)|0);
   var $304=HEAP32[(($head317_i_i)>>2)];
   var $and318_i_i=$304 & -8;
   var $cmp319_i_i=(($and318_i_i)|(0))==(($qsize_0_i_i)|(0));
   if ($cmp319_i_i) { var $T_0_lcssa_i70_i = $305;label = 301; break; } else { var $T_046_i_i = $305;var $K305_047_i_i = $shl326_i_i;label = 297; break; }
  case 297: 
   var $K305_047_i_i;
   var $T_046_i_i;
   var $shr322_i_i=$K305_047_i_i >>> 31;
   var $arrayidx325_i_i=(($T_046_i_i+16+($shr322_i_i<<2))|0);
   var $305=HEAP32[(($arrayidx325_i_i)>>2)];
   var $cmp327_i_i=(($305)|(0))==0;
   if ($cmp327_i_i) { label = 298; break; } else { label = 296; break; }
  case 298: 
   var $306=$arrayidx325_i_i;
   var $307=HEAP32[((((112)|0))>>2)];
   var $cmp332_i_i=(($306)>>>(0)) < (($307)>>>(0));
   if ($cmp332_i_i) { label = 300; break; } else { label = 299; break; }
  case 299: 
   HEAP32[(($arrayidx325_i_i)>>2)]=$294;
   var $add_ptr17_sum20_i_i=((($add_ptr4_sum_i50_i)+(24))|0);
   var $parent337_i_i=(($tbase_292_i+$add_ptr17_sum20_i_i)|0);
   var $308=$parent337_i_i;
   HEAP32[(($308)>>2)]=$T_046_i_i;
   var $add_ptr17_sum21_i_i=((($add_ptr4_sum_i50_i)+(12))|0);
   var $bk338_i_i=(($tbase_292_i+$add_ptr17_sum21_i_i)|0);
   var $309=$bk338_i_i;
   HEAP32[(($309)>>2)]=$294;
   var $add_ptr17_sum22_i_i=((($add_ptr4_sum_i50_i)+(8))|0);
   var $fd339_i_i=(($tbase_292_i+$add_ptr17_sum22_i_i)|0);
   var $310=$fd339_i_i;
   HEAP32[(($310)>>2)]=$294;
   label = 305; break;
  case 300: 
   _abort();
   throw "Reached an unreachable!";
  case 301: 
   var $T_0_lcssa_i70_i;
   var $fd344_i_i=(($T_0_lcssa_i70_i+8)|0);
   var $311=HEAP32[(($fd344_i_i)>>2)];
   var $312=$T_0_lcssa_i70_i;
   var $313=HEAP32[((((112)|0))>>2)];
   var $cmp346_i_i=(($312)>>>(0)) < (($313)>>>(0));
   if ($cmp346_i_i) { label = 304; break; } else { label = 302; break; }
  case 302: 
   var $314=$311;
   var $cmp350_i_i=(($314)>>>(0)) < (($313)>>>(0));
   if ($cmp350_i_i) { label = 304; break; } else { label = 303; break; }
  case 303: 
   var $bk357_i_i=(($311+12)|0);
   HEAP32[(($bk357_i_i)>>2)]=$294;
   HEAP32[(($fd344_i_i)>>2)]=$294;
   var $add_ptr17_sum17_i_i=((($add_ptr4_sum_i50_i)+(8))|0);
   var $fd359_i_i=(($tbase_292_i+$add_ptr17_sum17_i_i)|0);
   var $315=$fd359_i_i;
   HEAP32[(($315)>>2)]=$311;
   var $add_ptr17_sum18_i_i=((($add_ptr4_sum_i50_i)+(12))|0);
   var $bk360_i_i=(($tbase_292_i+$add_ptr17_sum18_i_i)|0);
   var $316=$bk360_i_i;
   HEAP32[(($316)>>2)]=$T_0_lcssa_i70_i;
   var $add_ptr17_sum19_i_i=((($add_ptr4_sum_i50_i)+(24))|0);
   var $parent361_i_i=(($tbase_292_i+$add_ptr17_sum19_i_i)|0);
   var $317=$parent361_i_i;
   HEAP32[(($317)>>2)]=0;
   label = 305; break;
  case 304: 
   _abort();
   throw "Reached an unreachable!";
  case 305: 
   var $add_ptr4_sum1415_i_i=$cond_i43_i | 8;
   var $add_ptr368_i_i=(($tbase_292_i+$add_ptr4_sum1415_i_i)|0);
   var $mem_0 = $add_ptr368_i_i;label = 344; break;
  case 306: 
   var $318=$190;
   var $sp_0_i_i_i = ((544)|0);label = 307; break;
  case 307: 
   var $sp_0_i_i_i;
   var $base_i_i_i=(($sp_0_i_i_i)|0);
   var $319=HEAP32[(($base_i_i_i)>>2)];
   var $cmp_i_i_i=(($319)>>>(0)) > (($318)>>>(0));
   if ($cmp_i_i_i) { label = 309; break; } else { label = 308; break; }
  case 308: 
   var $size_i_i_i=(($sp_0_i_i_i+4)|0);
   var $320=HEAP32[(($size_i_i_i)>>2)];
   var $add_ptr_i_i_i=(($319+$320)|0);
   var $cmp2_i_i_i=(($add_ptr_i_i_i)>>>(0)) > (($318)>>>(0));
   if ($cmp2_i_i_i) { label = 310; break; } else { label = 309; break; }
  case 309: 
   var $next_i_i_i=(($sp_0_i_i_i+8)|0);
   var $321=HEAP32[(($next_i_i_i)>>2)];
   var $sp_0_i_i_i = $321;label = 307; break;
  case 310: 
   var $add_ptr_sum_i_i=((($320)-(47))|0);
   var $add_ptr2_sum_i_i=((($320)-(39))|0);
   var $add_ptr3_i_i=(($319+$add_ptr2_sum_i_i)|0);
   var $322=$add_ptr3_i_i;
   var $and_i15_i=$322 & 7;
   var $cmp_i16_i=(($and_i15_i)|(0))==0;
   if ($cmp_i16_i) { var $cond_i18_i = 0;label = 312; break; } else { label = 311; break; }
  case 311: 
   var $323=(((-$322))|0);
   var $and6_i_i=$323 & 7;
   var $cond_i18_i = $and6_i_i;label = 312; break;
  case 312: 
   var $cond_i18_i;
   var $add_ptr2_sum1_i_i=((($add_ptr_sum_i_i)+($cond_i18_i))|0);
   var $add_ptr7_i_i=(($319+$add_ptr2_sum1_i_i)|0);
   var $add_ptr82_i_i=(($190+16)|0);
   var $add_ptr8_i_i=$add_ptr82_i_i;
   var $cmp9_i_i=(($add_ptr7_i_i)>>>(0)) < (($add_ptr8_i_i)>>>(0));
   var $cond13_i_i=$cmp9_i_i ? $318 : $add_ptr7_i_i;
   var $add_ptr14_i_i=(($cond13_i_i+8)|0);
   var $324=$add_ptr14_i_i;
   var $sub16_i_i=((($tsize_291_i)-(40))|0);
   var $add_ptr_i11_i_i=(($tbase_292_i+8)|0);
   var $325=$add_ptr_i11_i_i;
   var $and_i_i_i=$325 & 7;
   var $cmp_i12_i_i=(($and_i_i_i)|(0))==0;
   if ($cmp_i12_i_i) { var $cond_i_i_i = 0;label = 314; break; } else { label = 313; break; }
  case 313: 
   var $326=(((-$325))|0);
   var $and3_i_i_i=$326 & 7;
   var $cond_i_i_i = $and3_i_i_i;label = 314; break;
  case 314: 
   var $cond_i_i_i;
   var $add_ptr4_i_i_i=(($tbase_292_i+$cond_i_i_i)|0);
   var $327=$add_ptr4_i_i_i;
   var $sub5_i_i_i=((($sub16_i_i)-($cond_i_i_i))|0);
   HEAP32[((((120)|0))>>2)]=$327;
   HEAP32[((((108)|0))>>2)]=$sub5_i_i_i;
   var $or_i_i_i=$sub5_i_i_i | 1;
   var $add_ptr4_sum_i_i_i=((($cond_i_i_i)+(4))|0);
   var $head_i_i_i=(($tbase_292_i+$add_ptr4_sum_i_i_i)|0);
   var $328=$head_i_i_i;
   HEAP32[(($328)>>2)]=$or_i_i_i;
   var $add_ptr6_sum_i_i_i=((($tsize_291_i)-(36))|0);
   var $head7_i_i_i=(($tbase_292_i+$add_ptr6_sum_i_i_i)|0);
   var $329=$head7_i_i_i;
   HEAP32[(($329)>>2)]=40;
   var $330=HEAP32[((((88)|0))>>2)];
   HEAP32[((((124)|0))>>2)]=$330;
   var $head_i19_i=(($cond13_i_i+4)|0);
   var $331=$head_i19_i;
   HEAP32[(($331)>>2)]=27;
   assert(16 % 1 === 0);HEAP32[(($add_ptr14_i_i)>>2)]=HEAP32[(((((544)|0)))>>2)];HEAP32[((($add_ptr14_i_i)+(4))>>2)]=HEAP32[((((((544)|0)))+(4))>>2)];HEAP32[((($add_ptr14_i_i)+(8))>>2)]=HEAP32[((((((544)|0)))+(8))>>2)];HEAP32[((($add_ptr14_i_i)+(12))>>2)]=HEAP32[((((((544)|0)))+(12))>>2)];
   HEAP32[((((544)|0))>>2)]=$tbase_292_i;
   HEAP32[((((548)|0))>>2)]=$tsize_291_i;
   HEAP32[((((556)|0))>>2)]=0;
   HEAP32[((((552)|0))>>2)]=$324;
   var $add_ptr2419_i_i=(($cond13_i_i+28)|0);
   var $332=$add_ptr2419_i_i;
   HEAP32[(($332)>>2)]=7;
   var $333=(($cond13_i_i+32)|0);
   var $cmp2720_i_i=(($333)>>>(0)) < (($add_ptr_i_i_i)>>>(0));
   if ($cmp2720_i_i) { var $add_ptr2421_i_i = $332;label = 315; break; } else { label = 316; break; }
  case 315: 
   var $add_ptr2421_i_i;
   var $334=(($add_ptr2421_i_i+4)|0);
   HEAP32[(($334)>>2)]=7;
   var $335=(($add_ptr2421_i_i+8)|0);
   var $336=$335;
   var $cmp27_i_i=(($336)>>>(0)) < (($add_ptr_i_i_i)>>>(0));
   if ($cmp27_i_i) { var $add_ptr2421_i_i = $334;label = 315; break; } else { label = 316; break; }
  case 316: 
   var $cmp28_i_i=(($cond13_i_i)|(0))==(($318)|(0));
   if ($cmp28_i_i) { label = 341; break; } else { label = 317; break; }
  case 317: 
   var $sub_ptr_lhs_cast_i_i=$cond13_i_i;
   var $sub_ptr_rhs_cast_i_i=$190;
   var $sub_ptr_sub_i_i=((($sub_ptr_lhs_cast_i_i)-($sub_ptr_rhs_cast_i_i))|0);
   var $add_ptr30_i_i=(($318+$sub_ptr_sub_i_i)|0);
   var $add_ptr30_sum_i_i=((($sub_ptr_sub_i_i)+(4))|0);
   var $head31_i_i=(($318+$add_ptr30_sum_i_i)|0);
   var $337=$head31_i_i;
   var $338=HEAP32[(($337)>>2)];
   var $and32_i_i=$338 & -2;
   HEAP32[(($337)>>2)]=$and32_i_i;
   var $or33_i_i=$sub_ptr_sub_i_i | 1;
   var $head34_i_i=(($190+4)|0);
   HEAP32[(($head34_i_i)>>2)]=$or33_i_i;
   var $prev_foot_i_i=$add_ptr30_i_i;
   HEAP32[(($prev_foot_i_i)>>2)]=$sub_ptr_sub_i_i;
   var $shr_i_i=$sub_ptr_sub_i_i >>> 3;
   var $cmp36_i_i=(($sub_ptr_sub_i_i)>>>(0)) < 256;
   if ($cmp36_i_i) { label = 318; break; } else { label = 323; break; }
  case 318: 
   var $shl_i21_i=$shr_i_i << 1;
   var $arrayidx_i22_i=((136+($shl_i21_i<<2))|0);
   var $339=$arrayidx_i22_i;
   var $340=HEAP32[((((96)|0))>>2)];
   var $shl39_i_i=1 << $shr_i_i;
   var $and40_i_i=$340 & $shl39_i_i;
   var $tobool_i_i=(($and40_i_i)|(0))==0;
   if ($tobool_i_i) { label = 319; break; } else { label = 320; break; }
  case 319: 
   var $or44_i_i=$340 | $shl39_i_i;
   HEAP32[((((96)|0))>>2)]=$or44_i_i;
   var $arrayidx_sum_pre_i_i=((($shl_i21_i)+(2))|0);
   var $_pre_i_i=((136+($arrayidx_sum_pre_i_i<<2))|0);
   var $F_0_i_i = $339;var $_pre_phi_i_i = $_pre_i_i;label = 322; break;
  case 320: 
   var $arrayidx_sum10_i_i=((($shl_i21_i)+(2))|0);
   var $341=((136+($arrayidx_sum10_i_i<<2))|0);
   var $342=HEAP32[(($341)>>2)];
   var $343=$342;
   var $344=HEAP32[((((112)|0))>>2)];
   var $cmp46_i_i=(($343)>>>(0)) < (($344)>>>(0));
   if ($cmp46_i_i) { label = 321; break; } else { var $F_0_i_i = $342;var $_pre_phi_i_i = $341;label = 322; break; }
  case 321: 
   _abort();
   throw "Reached an unreachable!";
  case 322: 
   var $_pre_phi_i_i;
   var $F_0_i_i;
   HEAP32[(($_pre_phi_i_i)>>2)]=$190;
   var $bk_i_i=(($F_0_i_i+12)|0);
   HEAP32[(($bk_i_i)>>2)]=$190;
   var $fd54_i_i=(($190+8)|0);
   HEAP32[(($fd54_i_i)>>2)]=$F_0_i_i;
   var $bk55_i_i=(($190+12)|0);
   HEAP32[(($bk55_i_i)>>2)]=$339;
   label = 341; break;
  case 323: 
   var $345=$190;
   var $shr58_i_i=$sub_ptr_sub_i_i >>> 8;
   var $cmp59_i_i=(($shr58_i_i)|(0))==0;
   if ($cmp59_i_i) { var $I57_0_i_i = 0;label = 326; break; } else { label = 324; break; }
  case 324: 
   var $cmp63_i_i=(($sub_ptr_sub_i_i)>>>(0)) > 16777215;
   if ($cmp63_i_i) { var $I57_0_i_i = 31;label = 326; break; } else { label = 325; break; }
  case 325: 
   var $sub67_i_i=((($shr58_i_i)+(1048320))|0);
   var $shr68_i_i=$sub67_i_i >>> 16;
   var $and69_i_i=$shr68_i_i & 8;
   var $shl70_i_i=$shr58_i_i << $and69_i_i;
   var $sub71_i_i=((($shl70_i_i)+(520192))|0);
   var $shr72_i_i=$sub71_i_i >>> 16;
   var $and73_i_i=$shr72_i_i & 4;
   var $add74_i_i=$and73_i_i | $and69_i_i;
   var $shl75_i_i=$shl70_i_i << $and73_i_i;
   var $sub76_i_i=((($shl75_i_i)+(245760))|0);
   var $shr77_i_i=$sub76_i_i >>> 16;
   var $and78_i_i=$shr77_i_i & 2;
   var $add79_i_i=$add74_i_i | $and78_i_i;
   var $sub80_i_i=(((14)-($add79_i_i))|0);
   var $shl81_i_i=$shl75_i_i << $and78_i_i;
   var $shr82_i_i=$shl81_i_i >>> 15;
   var $add83_i_i=((($sub80_i_i)+($shr82_i_i))|0);
   var $shl84_i_i=$add83_i_i << 1;
   var $add85_i_i=((($add83_i_i)+(7))|0);
   var $shr86_i_i=$sub_ptr_sub_i_i >>> (($add85_i_i)>>>(0));
   var $and87_i_i=$shr86_i_i & 1;
   var $add88_i_i=$and87_i_i | $shl84_i_i;
   var $I57_0_i_i = $add88_i_i;label = 326; break;
  case 326: 
   var $I57_0_i_i;
   var $arrayidx91_i_i=((400+($I57_0_i_i<<2))|0);
   var $index_i_i=(($190+28)|0);
   var $I57_0_c_i_i=$I57_0_i_i;
   HEAP32[(($index_i_i)>>2)]=$I57_0_c_i_i;
   var $arrayidx92_i_i=(($190+20)|0);
   HEAP32[(($arrayidx92_i_i)>>2)]=0;
   var $346=(($190+16)|0);
   HEAP32[(($346)>>2)]=0;
   var $347=HEAP32[((((100)|0))>>2)];
   var $shl95_i_i=1 << $I57_0_i_i;
   var $and96_i_i=$347 & $shl95_i_i;
   var $tobool97_i_i=(($and96_i_i)|(0))==0;
   if ($tobool97_i_i) { label = 327; break; } else { label = 328; break; }
  case 327: 
   var $or101_i_i=$347 | $shl95_i_i;
   HEAP32[((((100)|0))>>2)]=$or101_i_i;
   HEAP32[(($arrayidx91_i_i)>>2)]=$345;
   var $parent_i_i=(($190+24)|0);
   var $_c_i_i=$arrayidx91_i_i;
   HEAP32[(($parent_i_i)>>2)]=$_c_i_i;
   var $bk102_i_i=(($190+12)|0);
   HEAP32[(($bk102_i_i)>>2)]=$190;
   var $fd103_i_i=(($190+8)|0);
   HEAP32[(($fd103_i_i)>>2)]=$190;
   label = 341; break;
  case 328: 
   var $348=HEAP32[(($arrayidx91_i_i)>>2)];
   var $cmp106_i_i=(($I57_0_i_i)|(0))==31;
   if ($cmp106_i_i) { var $cond115_i_i = 0;label = 330; break; } else { label = 329; break; }
  case 329: 
   var $shr110_i_i=$I57_0_i_i >>> 1;
   var $sub113_i_i=(((25)-($shr110_i_i))|0);
   var $cond115_i_i = $sub113_i_i;label = 330; break;
  case 330: 
   var $cond115_i_i;
   var $head11814_i_i=(($348+4)|0);
   var $349=HEAP32[(($head11814_i_i)>>2)];
   var $and11915_i_i=$349 & -8;
   var $cmp12016_i_i=(($and11915_i_i)|(0))==(($sub_ptr_sub_i_i)|(0));
   if ($cmp12016_i_i) { var $T_0_lcssa_i_i = $348;label = 337; break; } else { label = 331; break; }
  case 331: 
   var $shl116_i_i=$sub_ptr_sub_i_i << $cond115_i_i;
   var $T_017_i_i = $348;var $K105_018_i_i = $shl116_i_i;label = 333; break;
  case 332: 
   var $shl127_i_i=$K105_018_i_i << 1;
   var $head118_i_i=(($351+4)|0);
   var $350=HEAP32[(($head118_i_i)>>2)];
   var $and119_i_i=$350 & -8;
   var $cmp120_i_i=(($and119_i_i)|(0))==(($sub_ptr_sub_i_i)|(0));
   if ($cmp120_i_i) { var $T_0_lcssa_i_i = $351;label = 337; break; } else { var $T_017_i_i = $351;var $K105_018_i_i = $shl127_i_i;label = 333; break; }
  case 333: 
   var $K105_018_i_i;
   var $T_017_i_i;
   var $shr123_i_i=$K105_018_i_i >>> 31;
   var $arrayidx126_i_i=(($T_017_i_i+16+($shr123_i_i<<2))|0);
   var $351=HEAP32[(($arrayidx126_i_i)>>2)];
   var $cmp128_i_i=(($351)|(0))==0;
   if ($cmp128_i_i) { label = 334; break; } else { label = 332; break; }
  case 334: 
   var $352=$arrayidx126_i_i;
   var $353=HEAP32[((((112)|0))>>2)];
   var $cmp133_i_i=(($352)>>>(0)) < (($353)>>>(0));
   if ($cmp133_i_i) { label = 336; break; } else { label = 335; break; }
  case 335: 
   HEAP32[(($arrayidx126_i_i)>>2)]=$345;
   var $parent138_i_i=(($190+24)|0);
   var $T_0_c7_i_i=$T_017_i_i;
   HEAP32[(($parent138_i_i)>>2)]=$T_0_c7_i_i;
   var $bk139_i_i=(($190+12)|0);
   HEAP32[(($bk139_i_i)>>2)]=$190;
   var $fd140_i_i=(($190+8)|0);
   HEAP32[(($fd140_i_i)>>2)]=$190;
   label = 341; break;
  case 336: 
   _abort();
   throw "Reached an unreachable!";
  case 337: 
   var $T_0_lcssa_i_i;
   var $fd145_i_i=(($T_0_lcssa_i_i+8)|0);
   var $354=HEAP32[(($fd145_i_i)>>2)];
   var $355=$T_0_lcssa_i_i;
   var $356=HEAP32[((((112)|0))>>2)];
   var $cmp147_i_i=(($355)>>>(0)) < (($356)>>>(0));
   if ($cmp147_i_i) { label = 340; break; } else { label = 338; break; }
  case 338: 
   var $357=$354;
   var $cmp150_i_i=(($357)>>>(0)) < (($356)>>>(0));
   if ($cmp150_i_i) { label = 340; break; } else { label = 339; break; }
  case 339: 
   var $bk155_i_i=(($354+12)|0);
   HEAP32[(($bk155_i_i)>>2)]=$345;
   HEAP32[(($fd145_i_i)>>2)]=$345;
   var $fd157_i_i=(($190+8)|0);
   var $_c6_i_i=$354;
   HEAP32[(($fd157_i_i)>>2)]=$_c6_i_i;
   var $bk158_i_i=(($190+12)|0);
   var $T_0_c_i_i=$T_0_lcssa_i_i;
   HEAP32[(($bk158_i_i)>>2)]=$T_0_c_i_i;
   var $parent159_i_i=(($190+24)|0);
   HEAP32[(($parent159_i_i)>>2)]=0;
   label = 341; break;
  case 340: 
   _abort();
   throw "Reached an unreachable!";
  case 341: 
   var $358=HEAP32[((((108)|0))>>2)];
   var $cmp250_i=(($358)>>>(0)) > (($nb_0)>>>(0));
   if ($cmp250_i) { label = 342; break; } else { label = 343; break; }
  case 342: 
   var $sub253_i=((($358)-($nb_0))|0);
   HEAP32[((((108)|0))>>2)]=$sub253_i;
   var $359=HEAP32[((((120)|0))>>2)];
   var $360=$359;
   var $add_ptr255_i=(($360+$nb_0)|0);
   var $361=$add_ptr255_i;
   HEAP32[((((120)|0))>>2)]=$361;
   var $or257_i=$sub253_i | 1;
   var $add_ptr255_sum_i=((($nb_0)+(4))|0);
   var $head258_i=(($360+$add_ptr255_sum_i)|0);
   var $362=$head258_i;
   HEAP32[(($362)>>2)]=$or257_i;
   var $or260_i=$nb_0 | 3;
   var $head261_i=(($359+4)|0);
   HEAP32[(($head261_i)>>2)]=$or260_i;
   var $add_ptr262_i=(($359+8)|0);
   var $363=$add_ptr262_i;
   var $mem_0 = $363;label = 344; break;
  case 343: 
   var $call265_i=___errno_location();
   HEAP32[(($call265_i)>>2)]=12;
   var $mem_0 = 0;label = 344; break;
  case 344: 
   var $mem_0;
   return $mem_0;
  default: assert(0, "bad label: " + label);
 }
}
Module["_malloc"] = _malloc;
function _free($mem) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $cmp=(($mem)|(0))==0;
   if ($cmp) { label = 143; break; } else { label = 2; break; }
  case 2: 
   var $add_ptr=((($mem)-(8))|0);
   var $0=$add_ptr;
   var $1=HEAP32[((((112)|0))>>2)];
   var $cmp1=(($add_ptr)>>>(0)) < (($1)>>>(0));
   if ($cmp1) { label = 142; break; } else { label = 3; break; }
  case 3: 
   var $head=((($mem)-(4))|0);
   var $2=$head;
   var $3=HEAP32[(($2)>>2)];
   var $and=$3 & 3;
   var $cmp2=(($and)|(0))==1;
   if ($cmp2) { label = 142; break; } else { label = 4; break; }
  case 4: 
   var $and5=$3 & -8;
   var $add_ptr_sum=((($and5)-(8))|0);
   var $add_ptr6=(($mem+$add_ptr_sum)|0);
   var $4=$add_ptr6;
   var $and8=$3 & 1;
   var $tobool9=(($and8)|(0))==0;
   if ($tobool9) { label = 5; break; } else { var $p_0 = $0;var $psize_0 = $and5;label = 56; break; }
  case 5: 
   var $prev_foot=$add_ptr;
   var $5=HEAP32[(($prev_foot)>>2)];
   var $cmp13=(($and)|(0))==0;
   if ($cmp13) { label = 143; break; } else { label = 6; break; }
  case 6: 
   var $add_ptr_sum232=(((-8)-($5))|0);
   var $add_ptr16=(($mem+$add_ptr_sum232)|0);
   var $6=$add_ptr16;
   var $add17=((($5)+($and5))|0);
   var $cmp18=(($add_ptr16)>>>(0)) < (($1)>>>(0));
   if ($cmp18) { label = 142; break; } else { label = 7; break; }
  case 7: 
   var $7=HEAP32[((((116)|0))>>2)];
   var $cmp22=(($6)|(0))==(($7)|(0));
   if ($cmp22) { label = 54; break; } else { label = 8; break; }
  case 8: 
   var $shr=$5 >>> 3;
   var $cmp25=(($5)>>>(0)) < 256;
   if ($cmp25) { label = 9; break; } else { label = 21; break; }
  case 9: 
   var $add_ptr16_sum269=((($add_ptr_sum232)+(8))|0);
   var $fd=(($mem+$add_ptr16_sum269)|0);
   var $8=$fd;
   var $9=HEAP32[(($8)>>2)];
   var $add_ptr16_sum270=((($add_ptr_sum232)+(12))|0);
   var $bk=(($mem+$add_ptr16_sum270)|0);
   var $10=$bk;
   var $11=HEAP32[(($10)>>2)];
   var $shl=$shr << 1;
   var $arrayidx=((136+($shl<<2))|0);
   var $12=$arrayidx;
   var $cmp29=(($9)|(0))==(($12)|(0));
   if ($cmp29) { label = 12; break; } else { label = 10; break; }
  case 10: 
   var $13=$9;
   var $cmp31=(($13)>>>(0)) < (($1)>>>(0));
   if ($cmp31) { label = 20; break; } else { label = 11; break; }
  case 11: 
   var $bk34=(($9+12)|0);
   var $14=HEAP32[(($bk34)>>2)];
   var $cmp35=(($14)|(0))==(($6)|(0));
   if ($cmp35) { label = 12; break; } else { label = 20; break; }
  case 12: 
   var $cmp42=(($11)|(0))==(($9)|(0));
   if ($cmp42) { label = 13; break; } else { label = 14; break; }
  case 13: 
   var $shl45=1 << $shr;
   var $neg=$shl45 ^ -1;
   var $15=HEAP32[((((96)|0))>>2)];
   var $and46=$15 & $neg;
   HEAP32[((((96)|0))>>2)]=$and46;
   var $p_0 = $6;var $psize_0 = $add17;label = 56; break;
  case 14: 
   var $cmp50=(($11)|(0))==(($12)|(0));
   if ($cmp50) { label = 15; break; } else { label = 16; break; }
  case 15: 
   var $fd67_pre=(($11+8)|0);
   var $fd67_pre_phi = $fd67_pre;label = 18; break;
  case 16: 
   var $16=$11;
   var $cmp53=(($16)>>>(0)) < (($1)>>>(0));
   if ($cmp53) { label = 19; break; } else { label = 17; break; }
  case 17: 
   var $fd56=(($11+8)|0);
   var $17=HEAP32[(($fd56)>>2)];
   var $cmp57=(($17)|(0))==(($6)|(0));
   if ($cmp57) { var $fd67_pre_phi = $fd56;label = 18; break; } else { label = 19; break; }
  case 18: 
   var $fd67_pre_phi;
   var $bk66=(($9+12)|0);
   HEAP32[(($bk66)>>2)]=$11;
   HEAP32[(($fd67_pre_phi)>>2)]=$9;
   var $p_0 = $6;var $psize_0 = $add17;label = 56; break;
  case 19: 
   _abort();
   throw "Reached an unreachable!";
  case 20: 
   _abort();
   throw "Reached an unreachable!";
  case 21: 
   var $18=$add_ptr16;
   var $add_ptr16_sum261=((($add_ptr_sum232)+(24))|0);
   var $parent=(($mem+$add_ptr16_sum261)|0);
   var $19=$parent;
   var $20=HEAP32[(($19)>>2)];
   var $add_ptr16_sum262=((($add_ptr_sum232)+(12))|0);
   var $bk73=(($mem+$add_ptr16_sum262)|0);
   var $21=$bk73;
   var $22=HEAP32[(($21)>>2)];
   var $cmp74=(($22)|(0))==(($18)|(0));
   if ($cmp74) { label = 27; break; } else { label = 22; break; }
  case 22: 
   var $add_ptr16_sum266=((($add_ptr_sum232)+(8))|0);
   var $fd78=(($mem+$add_ptr16_sum266)|0);
   var $23=$fd78;
   var $24=HEAP32[(($23)>>2)];
   var $25=$24;
   var $cmp80=(($25)>>>(0)) < (($1)>>>(0));
   if ($cmp80) { label = 26; break; } else { label = 23; break; }
  case 23: 
   var $bk82=(($24+12)|0);
   var $26=HEAP32[(($bk82)>>2)];
   var $cmp83=(($26)|(0))==(($18)|(0));
   if ($cmp83) { label = 24; break; } else { label = 26; break; }
  case 24: 
   var $fd86=(($22+8)|0);
   var $27=HEAP32[(($fd86)>>2)];
   var $cmp87=(($27)|(0))==(($18)|(0));
   if ($cmp87) { label = 25; break; } else { label = 26; break; }
  case 25: 
   HEAP32[(($bk82)>>2)]=$22;
   HEAP32[(($fd86)>>2)]=$24;
   var $R_1 = $22;label = 34; break;
  case 26: 
   _abort();
   throw "Reached an unreachable!";
  case 27: 
   var $child_sum=((($add_ptr_sum232)+(20))|0);
   var $arrayidx99=(($mem+$child_sum)|0);
   var $28=$arrayidx99;
   var $29=HEAP32[(($28)>>2)];
   var $cmp100=(($29)|(0))==0;
   if ($cmp100) { label = 28; break; } else { var $R_0 = $29;var $RP_0 = $28;label = 29; break; }
  case 28: 
   var $add_ptr16_sum263=((($add_ptr_sum232)+(16))|0);
   var $child=(($mem+$add_ptr16_sum263)|0);
   var $arrayidx103=$child;
   var $30=HEAP32[(($arrayidx103)>>2)];
   var $cmp104=(($30)|(0))==0;
   if ($cmp104) { var $R_1 = 0;label = 34; break; } else { var $R_0 = $30;var $RP_0 = $arrayidx103;label = 29; break; }
  case 29: 
   var $RP_0;
   var $R_0;
   var $arrayidx108=(($R_0+20)|0);
   var $31=HEAP32[(($arrayidx108)>>2)];
   var $cmp109=(($31)|(0))==0;
   if ($cmp109) { label = 30; break; } else { var $R_0 = $31;var $RP_0 = $arrayidx108;label = 29; break; }
  case 30: 
   var $arrayidx113=(($R_0+16)|0);
   var $32=HEAP32[(($arrayidx113)>>2)];
   var $cmp114=(($32)|(0))==0;
   if ($cmp114) { label = 31; break; } else { var $R_0 = $32;var $RP_0 = $arrayidx113;label = 29; break; }
  case 31: 
   var $33=$RP_0;
   var $cmp118=(($33)>>>(0)) < (($1)>>>(0));
   if ($cmp118) { label = 33; break; } else { label = 32; break; }
  case 32: 
   HEAP32[(($RP_0)>>2)]=0;
   var $R_1 = $R_0;label = 34; break;
  case 33: 
   _abort();
   throw "Reached an unreachable!";
  case 34: 
   var $R_1;
   var $cmp127=(($20)|(0))==0;
   if ($cmp127) { var $p_0 = $6;var $psize_0 = $add17;label = 56; break; } else { label = 35; break; }
  case 35: 
   var $add_ptr16_sum264=((($add_ptr_sum232)+(28))|0);
   var $index=(($mem+$add_ptr16_sum264)|0);
   var $34=$index;
   var $35=HEAP32[(($34)>>2)];
   var $arrayidx130=((400+($35<<2))|0);
   var $36=HEAP32[(($arrayidx130)>>2)];
   var $cmp131=(($18)|(0))==(($36)|(0));
   if ($cmp131) { label = 36; break; } else { label = 38; break; }
  case 36: 
   HEAP32[(($arrayidx130)>>2)]=$R_1;
   var $cond279=(($R_1)|(0))==0;
   if ($cond279) { label = 37; break; } else { label = 44; break; }
  case 37: 
   var $37=HEAP32[(($34)>>2)];
   var $shl138=1 << $37;
   var $neg139=$shl138 ^ -1;
   var $38=HEAP32[((((100)|0))>>2)];
   var $and140=$38 & $neg139;
   HEAP32[((((100)|0))>>2)]=$and140;
   var $p_0 = $6;var $psize_0 = $add17;label = 56; break;
  case 38: 
   var $39=$20;
   var $40=HEAP32[((((112)|0))>>2)];
   var $cmp143=(($39)>>>(0)) < (($40)>>>(0));
   if ($cmp143) { label = 42; break; } else { label = 39; break; }
  case 39: 
   var $arrayidx149=(($20+16)|0);
   var $41=HEAP32[(($arrayidx149)>>2)];
   var $cmp150=(($41)|(0))==(($18)|(0));
   if ($cmp150) { label = 40; break; } else { label = 41; break; }
  case 40: 
   HEAP32[(($arrayidx149)>>2)]=$R_1;
   label = 43; break;
  case 41: 
   var $arrayidx157=(($20+20)|0);
   HEAP32[(($arrayidx157)>>2)]=$R_1;
   label = 43; break;
  case 42: 
   _abort();
   throw "Reached an unreachable!";
  case 43: 
   var $cmp162=(($R_1)|(0))==0;
   if ($cmp162) { var $p_0 = $6;var $psize_0 = $add17;label = 56; break; } else { label = 44; break; }
  case 44: 
   var $42=$R_1;
   var $43=HEAP32[((((112)|0))>>2)];
   var $cmp165=(($42)>>>(0)) < (($43)>>>(0));
   if ($cmp165) { label = 53; break; } else { label = 45; break; }
  case 45: 
   var $parent170=(($R_1+24)|0);
   HEAP32[(($parent170)>>2)]=$20;
   var $add_ptr16_sum265=((($add_ptr_sum232)+(16))|0);
   var $child171=(($mem+$add_ptr16_sum265)|0);
   var $arrayidx172=$child171;
   var $44=HEAP32[(($arrayidx172)>>2)];
   var $cmp173=(($44)|(0))==0;
   if ($cmp173) { label = 49; break; } else { label = 46; break; }
  case 46: 
   var $45=$44;
   var $46=HEAP32[((((112)|0))>>2)];
   var $cmp176=(($45)>>>(0)) < (($46)>>>(0));
   if ($cmp176) { label = 48; break; } else { label = 47; break; }
  case 47: 
   var $arrayidx182=(($R_1+16)|0);
   HEAP32[(($arrayidx182)>>2)]=$44;
   var $parent183=(($44+24)|0);
   HEAP32[(($parent183)>>2)]=$R_1;
   label = 49; break;
  case 48: 
   _abort();
   throw "Reached an unreachable!";
  case 49: 
   var $child171_sum=((($add_ptr_sum232)+(20))|0);
   var $arrayidx188=(($mem+$child171_sum)|0);
   var $47=$arrayidx188;
   var $48=HEAP32[(($47)>>2)];
   var $cmp189=(($48)|(0))==0;
   if ($cmp189) { var $p_0 = $6;var $psize_0 = $add17;label = 56; break; } else { label = 50; break; }
  case 50: 
   var $49=$48;
   var $50=HEAP32[((((112)|0))>>2)];
   var $cmp192=(($49)>>>(0)) < (($50)>>>(0));
   if ($cmp192) { label = 52; break; } else { label = 51; break; }
  case 51: 
   var $arrayidx198=(($R_1+20)|0);
   HEAP32[(($arrayidx198)>>2)]=$48;
   var $parent199=(($48+24)|0);
   HEAP32[(($parent199)>>2)]=$R_1;
   var $p_0 = $6;var $psize_0 = $add17;label = 56; break;
  case 52: 
   _abort();
   throw "Reached an unreachable!";
  case 53: 
   _abort();
   throw "Reached an unreachable!";
  case 54: 
   var $add_ptr6_sum=((($and5)-(4))|0);
   var $head209=(($mem+$add_ptr6_sum)|0);
   var $51=$head209;
   var $52=HEAP32[(($51)>>2)];
   var $and210=$52 & 3;
   var $cmp211=(($and210)|(0))==3;
   if ($cmp211) { label = 55; break; } else { var $p_0 = $6;var $psize_0 = $add17;label = 56; break; }
  case 55: 
   HEAP32[((((104)|0))>>2)]=$add17;
   var $53=HEAP32[(($51)>>2)];
   var $and215=$53 & -2;
   HEAP32[(($51)>>2)]=$and215;
   var $or=$add17 | 1;
   var $add_ptr16_sum=((($add_ptr_sum232)+(4))|0);
   var $head216=(($mem+$add_ptr16_sum)|0);
   var $54=$head216;
   HEAP32[(($54)>>2)]=$or;
   var $prev_foot218=$add_ptr6;
   HEAP32[(($prev_foot218)>>2)]=$add17;
   label = 143; break;
  case 56: 
   var $psize_0;
   var $p_0;
   var $55=$p_0;
   var $cmp225=(($55)>>>(0)) < (($add_ptr6)>>>(0));
   if ($cmp225) { label = 57; break; } else { label = 142; break; }
  case 57: 
   var $add_ptr6_sum259=((($and5)-(4))|0);
   var $head228=(($mem+$add_ptr6_sum259)|0);
   var $56=$head228;
   var $57=HEAP32[(($56)>>2)];
   var $and229=$57 & 1;
   var $phitmp=(($and229)|(0))==0;
   if ($phitmp) { label = 142; break; } else { label = 58; break; }
  case 58: 
   var $and237=$57 & 2;
   var $tobool238=(($and237)|(0))==0;
   if ($tobool238) { label = 59; break; } else { label = 114; break; }
  case 59: 
   var $58=HEAP32[((((120)|0))>>2)];
   var $cmp240=(($4)|(0))==(($58)|(0));
   if ($cmp240) { label = 60; break; } else { label = 64; break; }
  case 60: 
   var $59=HEAP32[((((108)|0))>>2)];
   var $add243=((($59)+($psize_0))|0);
   HEAP32[((((108)|0))>>2)]=$add243;
   HEAP32[((((120)|0))>>2)]=$p_0;
   var $or244=$add243 | 1;
   var $head245=(($p_0+4)|0);
   HEAP32[(($head245)>>2)]=$or244;
   var $60=HEAP32[((((116)|0))>>2)];
   var $cmp246=(($p_0)|(0))==(($60)|(0));
   if ($cmp246) { label = 61; break; } else { label = 62; break; }
  case 61: 
   HEAP32[((((116)|0))>>2)]=0;
   HEAP32[((((104)|0))>>2)]=0;
   label = 62; break;
  case 62: 
   var $61=HEAP32[((((124)|0))>>2)];
   var $cmp250=(($add243)>>>(0)) > (($61)>>>(0));
   if ($cmp250) { label = 63; break; } else { label = 143; break; }
  case 63: 
   var $62=_sys_trim(0);
   label = 143; break;
  case 64: 
   var $63=HEAP32[((((116)|0))>>2)];
   var $cmp255=(($4)|(0))==(($63)|(0));
   if ($cmp255) { label = 65; break; } else { label = 66; break; }
  case 65: 
   var $64=HEAP32[((((104)|0))>>2)];
   var $add258=((($64)+($psize_0))|0);
   HEAP32[((((104)|0))>>2)]=$add258;
   HEAP32[((((116)|0))>>2)]=$p_0;
   var $or259=$add258 | 1;
   var $head260=(($p_0+4)|0);
   HEAP32[(($head260)>>2)]=$or259;
   var $add_ptr261=(($55+$add258)|0);
   var $prev_foot262=$add_ptr261;
   HEAP32[(($prev_foot262)>>2)]=$add258;
   label = 143; break;
  case 66: 
   var $and265=$57 & -8;
   var $add266=((($and265)+($psize_0))|0);
   var $shr267=$57 >>> 3;
   var $cmp268=(($57)>>>(0)) < 256;
   if ($cmp268) { label = 67; break; } else { label = 79; break; }
  case 67: 
   var $fd272=(($mem+$and5)|0);
   var $65=$fd272;
   var $66=HEAP32[(($65)>>2)];
   var $add_ptr6_sum253254=$and5 | 4;
   var $bk274=(($mem+$add_ptr6_sum253254)|0);
   var $67=$bk274;
   var $68=HEAP32[(($67)>>2)];
   var $shl277=$shr267 << 1;
   var $arrayidx278=((136+($shl277<<2))|0);
   var $69=$arrayidx278;
   var $cmp279=(($66)|(0))==(($69)|(0));
   if ($cmp279) { label = 70; break; } else { label = 68; break; }
  case 68: 
   var $70=$66;
   var $71=HEAP32[((((112)|0))>>2)];
   var $cmp282=(($70)>>>(0)) < (($71)>>>(0));
   if ($cmp282) { label = 78; break; } else { label = 69; break; }
  case 69: 
   var $bk285=(($66+12)|0);
   var $72=HEAP32[(($bk285)>>2)];
   var $cmp286=(($72)|(0))==(($4)|(0));
   if ($cmp286) { label = 70; break; } else { label = 78; break; }
  case 70: 
   var $cmp295=(($68)|(0))==(($66)|(0));
   if ($cmp295) { label = 71; break; } else { label = 72; break; }
  case 71: 
   var $shl298=1 << $shr267;
   var $neg299=$shl298 ^ -1;
   var $73=HEAP32[((((96)|0))>>2)];
   var $and300=$73 & $neg299;
   HEAP32[((((96)|0))>>2)]=$and300;
   label = 112; break;
  case 72: 
   var $cmp304=(($68)|(0))==(($69)|(0));
   if ($cmp304) { label = 73; break; } else { label = 74; break; }
  case 73: 
   var $fd321_pre=(($68+8)|0);
   var $fd321_pre_phi = $fd321_pre;label = 76; break;
  case 74: 
   var $74=$68;
   var $75=HEAP32[((((112)|0))>>2)];
   var $cmp307=(($74)>>>(0)) < (($75)>>>(0));
   if ($cmp307) { label = 77; break; } else { label = 75; break; }
  case 75: 
   var $fd310=(($68+8)|0);
   var $76=HEAP32[(($fd310)>>2)];
   var $cmp311=(($76)|(0))==(($4)|(0));
   if ($cmp311) { var $fd321_pre_phi = $fd310;label = 76; break; } else { label = 77; break; }
  case 76: 
   var $fd321_pre_phi;
   var $bk320=(($66+12)|0);
   HEAP32[(($bk320)>>2)]=$68;
   HEAP32[(($fd321_pre_phi)>>2)]=$66;
   label = 112; break;
  case 77: 
   _abort();
   throw "Reached an unreachable!";
  case 78: 
   _abort();
   throw "Reached an unreachable!";
  case 79: 
   var $77=$add_ptr6;
   var $add_ptr6_sum234=((($and5)+(16))|0);
   var $parent330=(($mem+$add_ptr6_sum234)|0);
   var $78=$parent330;
   var $79=HEAP32[(($78)>>2)];
   var $add_ptr6_sum235236=$and5 | 4;
   var $bk332=(($mem+$add_ptr6_sum235236)|0);
   var $80=$bk332;
   var $81=HEAP32[(($80)>>2)];
   var $cmp333=(($81)|(0))==(($77)|(0));
   if ($cmp333) { label = 85; break; } else { label = 80; break; }
  case 80: 
   var $fd337=(($mem+$and5)|0);
   var $82=$fd337;
   var $83=HEAP32[(($82)>>2)];
   var $84=$83;
   var $85=HEAP32[((((112)|0))>>2)];
   var $cmp339=(($84)>>>(0)) < (($85)>>>(0));
   if ($cmp339) { label = 84; break; } else { label = 81; break; }
  case 81: 
   var $bk342=(($83+12)|0);
   var $86=HEAP32[(($bk342)>>2)];
   var $cmp343=(($86)|(0))==(($77)|(0));
   if ($cmp343) { label = 82; break; } else { label = 84; break; }
  case 82: 
   var $fd346=(($81+8)|0);
   var $87=HEAP32[(($fd346)>>2)];
   var $cmp347=(($87)|(0))==(($77)|(0));
   if ($cmp347) { label = 83; break; } else { label = 84; break; }
  case 83: 
   HEAP32[(($bk342)>>2)]=$81;
   HEAP32[(($fd346)>>2)]=$83;
   var $R331_1 = $81;label = 92; break;
  case 84: 
   _abort();
   throw "Reached an unreachable!";
  case 85: 
   var $child360_sum=((($and5)+(12))|0);
   var $arrayidx361=(($mem+$child360_sum)|0);
   var $88=$arrayidx361;
   var $89=HEAP32[(($88)>>2)];
   var $cmp362=(($89)|(0))==0;
   if ($cmp362) { label = 86; break; } else { var $R331_0 = $89;var $RP359_0 = $88;label = 87; break; }
  case 86: 
   var $add_ptr6_sum237=((($and5)+(8))|0);
   var $child360=(($mem+$add_ptr6_sum237)|0);
   var $arrayidx366=$child360;
   var $90=HEAP32[(($arrayidx366)>>2)];
   var $cmp367=(($90)|(0))==0;
   if ($cmp367) { var $R331_1 = 0;label = 92; break; } else { var $R331_0 = $90;var $RP359_0 = $arrayidx366;label = 87; break; }
  case 87: 
   var $RP359_0;
   var $R331_0;
   var $arrayidx373=(($R331_0+20)|0);
   var $91=HEAP32[(($arrayidx373)>>2)];
   var $cmp374=(($91)|(0))==0;
   if ($cmp374) { label = 88; break; } else { var $R331_0 = $91;var $RP359_0 = $arrayidx373;label = 87; break; }
  case 88: 
   var $arrayidx378=(($R331_0+16)|0);
   var $92=HEAP32[(($arrayidx378)>>2)];
   var $cmp379=(($92)|(0))==0;
   if ($cmp379) { label = 89; break; } else { var $R331_0 = $92;var $RP359_0 = $arrayidx378;label = 87; break; }
  case 89: 
   var $93=$RP359_0;
   var $94=HEAP32[((((112)|0))>>2)];
   var $cmp385=(($93)>>>(0)) < (($94)>>>(0));
   if ($cmp385) { label = 91; break; } else { label = 90; break; }
  case 90: 
   HEAP32[(($RP359_0)>>2)]=0;
   var $R331_1 = $R331_0;label = 92; break;
  case 91: 
   _abort();
   throw "Reached an unreachable!";
  case 92: 
   var $R331_1;
   var $cmp394=(($79)|(0))==0;
   if ($cmp394) { label = 112; break; } else { label = 93; break; }
  case 93: 
   var $add_ptr6_sum247=((($and5)+(20))|0);
   var $index398=(($mem+$add_ptr6_sum247)|0);
   var $95=$index398;
   var $96=HEAP32[(($95)>>2)];
   var $arrayidx399=((400+($96<<2))|0);
   var $97=HEAP32[(($arrayidx399)>>2)];
   var $cmp400=(($77)|(0))==(($97)|(0));
   if ($cmp400) { label = 94; break; } else { label = 96; break; }
  case 94: 
   HEAP32[(($arrayidx399)>>2)]=$R331_1;
   var $cond280=(($R331_1)|(0))==0;
   if ($cond280) { label = 95; break; } else { label = 102; break; }
  case 95: 
   var $98=HEAP32[(($95)>>2)];
   var $shl407=1 << $98;
   var $neg408=$shl407 ^ -1;
   var $99=HEAP32[((((100)|0))>>2)];
   var $and409=$99 & $neg408;
   HEAP32[((((100)|0))>>2)]=$and409;
   label = 112; break;
  case 96: 
   var $100=$79;
   var $101=HEAP32[((((112)|0))>>2)];
   var $cmp412=(($100)>>>(0)) < (($101)>>>(0));
   if ($cmp412) { label = 100; break; } else { label = 97; break; }
  case 97: 
   var $arrayidx418=(($79+16)|0);
   var $102=HEAP32[(($arrayidx418)>>2)];
   var $cmp419=(($102)|(0))==(($77)|(0));
   if ($cmp419) { label = 98; break; } else { label = 99; break; }
  case 98: 
   HEAP32[(($arrayidx418)>>2)]=$R331_1;
   label = 101; break;
  case 99: 
   var $arrayidx426=(($79+20)|0);
   HEAP32[(($arrayidx426)>>2)]=$R331_1;
   label = 101; break;
  case 100: 
   _abort();
   throw "Reached an unreachable!";
  case 101: 
   var $cmp431=(($R331_1)|(0))==0;
   if ($cmp431) { label = 112; break; } else { label = 102; break; }
  case 102: 
   var $103=$R331_1;
   var $104=HEAP32[((((112)|0))>>2)];
   var $cmp434=(($103)>>>(0)) < (($104)>>>(0));
   if ($cmp434) { label = 111; break; } else { label = 103; break; }
  case 103: 
   var $parent441=(($R331_1+24)|0);
   HEAP32[(($parent441)>>2)]=$79;
   var $add_ptr6_sum248=((($and5)+(8))|0);
   var $child442=(($mem+$add_ptr6_sum248)|0);
   var $arrayidx443=$child442;
   var $105=HEAP32[(($arrayidx443)>>2)];
   var $cmp444=(($105)|(0))==0;
   if ($cmp444) { label = 107; break; } else { label = 104; break; }
  case 104: 
   var $106=$105;
   var $107=HEAP32[((((112)|0))>>2)];
   var $cmp447=(($106)>>>(0)) < (($107)>>>(0));
   if ($cmp447) { label = 106; break; } else { label = 105; break; }
  case 105: 
   var $arrayidx453=(($R331_1+16)|0);
   HEAP32[(($arrayidx453)>>2)]=$105;
   var $parent454=(($105+24)|0);
   HEAP32[(($parent454)>>2)]=$R331_1;
   label = 107; break;
  case 106: 
   _abort();
   throw "Reached an unreachable!";
  case 107: 
   var $child442_sum=((($and5)+(12))|0);
   var $arrayidx459=(($mem+$child442_sum)|0);
   var $108=$arrayidx459;
   var $109=HEAP32[(($108)>>2)];
   var $cmp460=(($109)|(0))==0;
   if ($cmp460) { label = 112; break; } else { label = 108; break; }
  case 108: 
   var $110=$109;
   var $111=HEAP32[((((112)|0))>>2)];
   var $cmp463=(($110)>>>(0)) < (($111)>>>(0));
   if ($cmp463) { label = 110; break; } else { label = 109; break; }
  case 109: 
   var $arrayidx469=(($R331_1+20)|0);
   HEAP32[(($arrayidx469)>>2)]=$109;
   var $parent470=(($109+24)|0);
   HEAP32[(($parent470)>>2)]=$R331_1;
   label = 112; break;
  case 110: 
   _abort();
   throw "Reached an unreachable!";
  case 111: 
   _abort();
   throw "Reached an unreachable!";
  case 112: 
   var $or479=$add266 | 1;
   var $head480=(($p_0+4)|0);
   HEAP32[(($head480)>>2)]=$or479;
   var $add_ptr481=(($55+$add266)|0);
   var $prev_foot482=$add_ptr481;
   HEAP32[(($prev_foot482)>>2)]=$add266;
   var $112=HEAP32[((((116)|0))>>2)];
   var $cmp483=(($p_0)|(0))==(($112)|(0));
   if ($cmp483) { label = 113; break; } else { var $psize_1 = $add266;label = 115; break; }
  case 113: 
   HEAP32[((((104)|0))>>2)]=$add266;
   label = 143; break;
  case 114: 
   var $and491=$57 & -2;
   HEAP32[(($56)>>2)]=$and491;
   var $or492=$psize_0 | 1;
   var $head493=(($p_0+4)|0);
   HEAP32[(($head493)>>2)]=$or492;
   var $add_ptr494=(($55+$psize_0)|0);
   var $prev_foot495=$add_ptr494;
   HEAP32[(($prev_foot495)>>2)]=$psize_0;
   var $psize_1 = $psize_0;label = 115; break;
  case 115: 
   var $psize_1;
   var $shr497=$psize_1 >>> 3;
   var $cmp498=(($psize_1)>>>(0)) < 256;
   if ($cmp498) { label = 116; break; } else { label = 121; break; }
  case 116: 
   var $shl504=$shr497 << 1;
   var $arrayidx505=((136+($shl504<<2))|0);
   var $113=$arrayidx505;
   var $114=HEAP32[((((96)|0))>>2)];
   var $shl507=1 << $shr497;
   var $and508=$114 & $shl507;
   var $tobool509=(($and508)|(0))==0;
   if ($tobool509) { label = 117; break; } else { label = 118; break; }
  case 117: 
   var $or512=$114 | $shl507;
   HEAP32[((((96)|0))>>2)]=$or512;
   var $arrayidx505_sum_pre=((($shl504)+(2))|0);
   var $_pre=((136+($arrayidx505_sum_pre<<2))|0);
   var $F506_0 = $113;var $_pre_phi = $_pre;label = 120; break;
  case 118: 
   var $arrayidx505_sum246=((($shl504)+(2))|0);
   var $115=((136+($arrayidx505_sum246<<2))|0);
   var $116=HEAP32[(($115)>>2)];
   var $117=$116;
   var $118=HEAP32[((((112)|0))>>2)];
   var $cmp515=(($117)>>>(0)) < (($118)>>>(0));
   if ($cmp515) { label = 119; break; } else { var $F506_0 = $116;var $_pre_phi = $115;label = 120; break; }
  case 119: 
   _abort();
   throw "Reached an unreachable!";
  case 120: 
   var $_pre_phi;
   var $F506_0;
   HEAP32[(($_pre_phi)>>2)]=$p_0;
   var $bk525=(($F506_0+12)|0);
   HEAP32[(($bk525)>>2)]=$p_0;
   var $fd526=(($p_0+8)|0);
   HEAP32[(($fd526)>>2)]=$F506_0;
   var $bk527=(($p_0+12)|0);
   HEAP32[(($bk527)>>2)]=$113;
   label = 143; break;
  case 121: 
   var $119=$p_0;
   var $shr531=$psize_1 >>> 8;
   var $cmp532=(($shr531)|(0))==0;
   if ($cmp532) { var $I530_0 = 0;label = 124; break; } else { label = 122; break; }
  case 122: 
   var $cmp536=(($psize_1)>>>(0)) > 16777215;
   if ($cmp536) { var $I530_0 = 31;label = 124; break; } else { label = 123; break; }
  case 123: 
   var $sub=((($shr531)+(1048320))|0);
   var $shr540=$sub >>> 16;
   var $and541=$shr540 & 8;
   var $shl542=$shr531 << $and541;
   var $sub543=((($shl542)+(520192))|0);
   var $shr544=$sub543 >>> 16;
   var $and545=$shr544 & 4;
   var $add546=$and545 | $and541;
   var $shl547=$shl542 << $and545;
   var $sub548=((($shl547)+(245760))|0);
   var $shr549=$sub548 >>> 16;
   var $and550=$shr549 & 2;
   var $add551=$add546 | $and550;
   var $sub552=(((14)-($add551))|0);
   var $shl553=$shl547 << $and550;
   var $shr554=$shl553 >>> 15;
   var $add555=((($sub552)+($shr554))|0);
   var $shl556=$add555 << 1;
   var $add557=((($add555)+(7))|0);
   var $shr558=$psize_1 >>> (($add557)>>>(0));
   var $and559=$shr558 & 1;
   var $add560=$and559 | $shl556;
   var $I530_0 = $add560;label = 124; break;
  case 124: 
   var $I530_0;
   var $arrayidx563=((400+($I530_0<<2))|0);
   var $index564=(($p_0+28)|0);
   var $I530_0_c=$I530_0;
   HEAP32[(($index564)>>2)]=$I530_0_c;
   var $arrayidx566=(($p_0+20)|0);
   HEAP32[(($arrayidx566)>>2)]=0;
   var $120=(($p_0+16)|0);
   HEAP32[(($120)>>2)]=0;
   var $121=HEAP32[((((100)|0))>>2)];
   var $shl569=1 << $I530_0;
   var $and570=$121 & $shl569;
   var $tobool571=(($and570)|(0))==0;
   if ($tobool571) { label = 125; break; } else { label = 126; break; }
  case 125: 
   var $or574=$121 | $shl569;
   HEAP32[((((100)|0))>>2)]=$or574;
   HEAP32[(($arrayidx563)>>2)]=$119;
   var $parent575=(($p_0+24)|0);
   var $_c=$arrayidx563;
   HEAP32[(($parent575)>>2)]=$_c;
   var $bk576=(($p_0+12)|0);
   HEAP32[(($bk576)>>2)]=$p_0;
   var $fd577=(($p_0+8)|0);
   HEAP32[(($fd577)>>2)]=$p_0;
   label = 139; break;
  case 126: 
   var $122=HEAP32[(($arrayidx563)>>2)];
   var $cmp580=(($I530_0)|(0))==31;
   if ($cmp580) { var $cond = 0;label = 128; break; } else { label = 127; break; }
  case 127: 
   var $shr582=$I530_0 >>> 1;
   var $sub585=(((25)-($shr582))|0);
   var $cond = $sub585;label = 128; break;
  case 128: 
   var $cond;
   var $head587282=(($122+4)|0);
   var $123=HEAP32[(($head587282)>>2)];
   var $and588283=$123 & -8;
   var $cmp589284=(($and588283)|(0))==(($psize_1)|(0));
   if ($cmp589284) { var $T_0_lcssa = $122;label = 135; break; } else { label = 129; break; }
  case 129: 
   var $shl586=$psize_1 << $cond;
   var $T_0285 = $122;var $K579_0286 = $shl586;label = 131; break;
  case 130: 
   var $shl596=$K579_0286 << 1;
   var $head587=(($125+4)|0);
   var $124=HEAP32[(($head587)>>2)];
   var $and588=$124 & -8;
   var $cmp589=(($and588)|(0))==(($psize_1)|(0));
   if ($cmp589) { var $T_0_lcssa = $125;label = 135; break; } else { var $T_0285 = $125;var $K579_0286 = $shl596;label = 131; break; }
  case 131: 
   var $K579_0286;
   var $T_0285;
   var $shr592=$K579_0286 >>> 31;
   var $arrayidx595=(($T_0285+16+($shr592<<2))|0);
   var $125=HEAP32[(($arrayidx595)>>2)];
   var $cmp597=(($125)|(0))==0;
   if ($cmp597) { label = 132; break; } else { label = 130; break; }
  case 132: 
   var $126=$arrayidx595;
   var $127=HEAP32[((((112)|0))>>2)];
   var $cmp601=(($126)>>>(0)) < (($127)>>>(0));
   if ($cmp601) { label = 134; break; } else { label = 133; break; }
  case 133: 
   HEAP32[(($arrayidx595)>>2)]=$119;
   var $parent606=(($p_0+24)|0);
   var $T_0_c243=$T_0285;
   HEAP32[(($parent606)>>2)]=$T_0_c243;
   var $bk607=(($p_0+12)|0);
   HEAP32[(($bk607)>>2)]=$p_0;
   var $fd608=(($p_0+8)|0);
   HEAP32[(($fd608)>>2)]=$p_0;
   label = 139; break;
  case 134: 
   _abort();
   throw "Reached an unreachable!";
  case 135: 
   var $T_0_lcssa;
   var $fd613=(($T_0_lcssa+8)|0);
   var $128=HEAP32[(($fd613)>>2)];
   var $129=$T_0_lcssa;
   var $130=HEAP32[((((112)|0))>>2)];
   var $cmp614=(($129)>>>(0)) < (($130)>>>(0));
   if ($cmp614) { label = 138; break; } else { label = 136; break; }
  case 136: 
   var $131=$128;
   var $cmp617=(($131)>>>(0)) < (($130)>>>(0));
   if ($cmp617) { label = 138; break; } else { label = 137; break; }
  case 137: 
   var $bk624=(($128+12)|0);
   HEAP32[(($bk624)>>2)]=$119;
   HEAP32[(($fd613)>>2)]=$119;
   var $fd626=(($p_0+8)|0);
   var $_c242=$128;
   HEAP32[(($fd626)>>2)]=$_c242;
   var $bk627=(($p_0+12)|0);
   var $T_0_c=$T_0_lcssa;
   HEAP32[(($bk627)>>2)]=$T_0_c;
   var $parent628=(($p_0+24)|0);
   HEAP32[(($parent628)>>2)]=0;
   label = 139; break;
  case 138: 
   _abort();
   throw "Reached an unreachable!";
  case 139: 
   var $132=HEAP32[((((128)|0))>>2)];
   var $dec=((($132)-(1))|0);
   HEAP32[((((128)|0))>>2)]=$dec;
   var $cmp632=(($dec)|(0))==0;
   if ($cmp632) { var $sp_0_in_i = ((552)|0);label = 140; break; } else { label = 143; break; }
  case 140: 
   var $sp_0_in_i;
   var $sp_0_i=HEAP32[(($sp_0_in_i)>>2)];
   var $cmp_i=(($sp_0_i)|(0))==0;
   var $next4_i=(($sp_0_i+8)|0);
   if ($cmp_i) { label = 141; break; } else { var $sp_0_in_i = $next4_i;label = 140; break; }
  case 141: 
   HEAP32[((((128)|0))>>2)]=-1;
   label = 143; break;
  case 142: 
   _abort();
   throw "Reached an unreachable!";
  case 143: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
Module["_free"] = _free;
function _sys_trim($pad) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $0=HEAP32[((((72)|0))>>2)];
   var $cmp=(($0)|(0))==0;
   if ($cmp) { label = 2; break; } else { label = 5; break; }
  case 2: 
   var $call_i=_sysconf(8);
   var $sub_i=((($call_i)-(1))|0);
   var $and_i=$sub_i & $call_i;
   var $cmp1_i=(($and_i)|(0))==0;
   if ($cmp1_i) { label = 4; break; } else { label = 3; break; }
  case 3: 
   _abort();
   throw "Reached an unreachable!";
  case 4: 
   HEAP32[((((80)|0))>>2)]=$call_i;
   HEAP32[((((76)|0))>>2)]=$call_i;
   HEAP32[((((84)|0))>>2)]=-1;
   HEAP32[((((88)|0))>>2)]=2097152;
   HEAP32[((((92)|0))>>2)]=0;
   HEAP32[((((540)|0))>>2)]=0;
   var $call6_i=_time(0);
   var $xor_i=$call6_i & -16;
   var $and7_i=$xor_i ^ 1431655768;
   HEAP32[((((72)|0))>>2)]=$and7_i;
   label = 5; break;
  case 5: 
   var $cmp1=(($pad)>>>(0)) < 4294967232;
   if ($cmp1) { label = 6; break; } else { var $released_2 = 0;label = 21; break; }
  case 6: 
   var $1=HEAP32[((((120)|0))>>2)];
   var $cmp2=(($1)|(0))==0;
   if ($cmp2) { var $released_2 = 0;label = 21; break; } else { label = 7; break; }
  case 7: 
   var $add=((($pad)+(40))|0);
   var $2=HEAP32[((((108)|0))>>2)];
   var $cmp3=(($2)>>>(0)) > (($add)>>>(0));
   if ($cmp3) { label = 8; break; } else { label = 19; break; }
  case 8: 
   var $3=HEAP32[((((80)|0))>>2)];
   var $add_neg=(((-40)-($pad))|0);
   var $sub6=((($add_neg)-(1))|0);
   var $sub=((($sub6)+($2))|0);
   var $add7=((($sub)+($3))|0);
   var $div=((((($add7)>>>(0)))/((($3)>>>(0))))&-1);
   var $sub8=((($div)-(1))|0);
   var $4=$1;
   var $sp_0_i = ((544)|0);label = 9; break;
  case 9: 
   var $sp_0_i;
   var $base_i=(($sp_0_i)|0);
   var $5=HEAP32[(($base_i)>>2)];
   var $cmp_i1=(($5)>>>(0)) > (($4)>>>(0));
   if ($cmp_i1) { label = 11; break; } else { label = 10; break; }
  case 10: 
   var $size_i=(($sp_0_i+4)|0);
   var $6=HEAP32[(($size_i)>>2)];
   var $add_ptr_i=(($5+$6)|0);
   var $cmp2_i=(($add_ptr_i)>>>(0)) > (($4)>>>(0));
   if ($cmp2_i) { label = 12; break; } else { label = 11; break; }
  case 11: 
   var $next_i=(($sp_0_i+8)|0);
   var $7=HEAP32[(($next_i)>>2)];
   var $sp_0_i = $7;label = 9; break;
  case 12: 
   var $mul=(Math.imul($sub8,$3)|0);
   var $sflags=(($sp_0_i+12)|0);
   var $8=HEAP32[(($sflags)>>2)];
   var $and=$8 & 8;
   var $tobool11=(($and)|(0))==0;
   if ($tobool11) { label = 13; break; } else { label = 19; break; }
  case 13: 
   var $call20=_sbrk(0);
   var $9=HEAP32[(($base_i)>>2)];
   var $10=HEAP32[(($size_i)>>2)];
   var $add_ptr=(($9+$10)|0);
   var $cmp21=(($call20)|(0))==(($add_ptr)|(0));
   if ($cmp21) { label = 14; break; } else { label = 19; break; }
  case 14: 
   var $sub19=(((-2147483648)-($3))|0);
   var $cmp17=(($mul)>>>(0)) > 2147483646;
   var $sub19_mul=$cmp17 ? $sub19 : $mul;
   var $sub23=(((-$sub19_mul))|0);
   var $call24=_sbrk($sub23);
   var $call25=_sbrk(0);
   var $cmp26=(($call24)|(0))!=-1;
   var $cmp28=(($call25)>>>(0)) < (($call20)>>>(0));
   var $or_cond=$cmp26 & $cmp28;
   if ($or_cond) { label = 15; break; } else { label = 19; break; }
  case 15: 
   var $sub_ptr_lhs_cast=$call20;
   var $sub_ptr_rhs_cast=$call25;
   var $sub_ptr_sub=((($sub_ptr_lhs_cast)-($sub_ptr_rhs_cast))|0);
   var $cmp34=(($call20)|(0))==(($call25)|(0));
   if ($cmp34) { label = 19; break; } else { label = 16; break; }
  case 16: 
   var $11=HEAP32[(($size_i)>>2)];
   var $sub37=((($11)-($sub_ptr_sub))|0);
   HEAP32[(($size_i)>>2)]=$sub37;
   var $12=HEAP32[((((528)|0))>>2)];
   var $sub38=((($12)-($sub_ptr_sub))|0);
   HEAP32[((((528)|0))>>2)]=$sub38;
   var $13=HEAP32[((((120)|0))>>2)];
   var $14=HEAP32[((((108)|0))>>2)];
   var $sub41=((($14)-($sub_ptr_sub))|0);
   var $15=$13;
   var $add_ptr_i3=(($13+8)|0);
   var $16=$add_ptr_i3;
   var $and_i4=$16 & 7;
   var $cmp_i5=(($and_i4)|(0))==0;
   if ($cmp_i5) { var $cond_i = 0;label = 18; break; } else { label = 17; break; }
  case 17: 
   var $17=(((-$16))|0);
   var $and3_i=$17 & 7;
   var $cond_i = $and3_i;label = 18; break;
  case 18: 
   var $cond_i;
   var $add_ptr4_i=(($15+$cond_i)|0);
   var $18=$add_ptr4_i;
   var $sub5_i=((($sub41)-($cond_i))|0);
   HEAP32[((((120)|0))>>2)]=$18;
   HEAP32[((((108)|0))>>2)]=$sub5_i;
   var $or_i=$sub5_i | 1;
   var $add_ptr4_sum_i=((($cond_i)+(4))|0);
   var $head_i=(($15+$add_ptr4_sum_i)|0);
   var $19=$head_i;
   HEAP32[(($19)>>2)]=$or_i;
   var $add_ptr6_sum_i=((($sub41)+(4))|0);
   var $head7_i=(($15+$add_ptr6_sum_i)|0);
   var $20=$head7_i;
   HEAP32[(($20)>>2)]=40;
   var $21=HEAP32[((((88)|0))>>2)];
   HEAP32[((((124)|0))>>2)]=$21;
   var $phitmp=(($call20)|(0))!=(($call25)|(0));
   var $phitmp9=(($phitmp)&(1));
   var $released_2 = $phitmp9;label = 21; break;
  case 19: 
   var $22=HEAP32[((((108)|0))>>2)];
   var $23=HEAP32[((((124)|0))>>2)];
   var $cmp47=(($22)>>>(0)) > (($23)>>>(0));
   if ($cmp47) { label = 20; break; } else { var $released_2 = 0;label = 21; break; }
  case 20: 
   HEAP32[((((124)|0))>>2)]=-1;
   var $released_2 = 0;label = 21; break;
  case 21: 
   var $released_2;
   return $released_2;
  default: assert(0, "bad label: " + label);
 }
}
// EMSCRIPTEN_END_FUNCS
// EMSCRIPTEN_END_FUNCS
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
var initialStackTop;
var inMain;
Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  initialStackTop = STACKTOP;
  inMain = true;
  var ret;
  try {
    ret = Module['_main'](argc, argv, 0);
  }
  catch(e) {
    if (e && typeof e == 'object' && e.type == 'ExitStatus') {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      Module.print('Exit Status: ' + e.value);
      return e.value;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
    } else {
      throw e;
    }
  } finally {
    inMain = false;
  }
  // if we're not running an evented main loop, it's time to exit
  if (!Module['noExitRuntime']) {
    exit(ret);
  }
}
function run(args) {
  args = args || Module['arguments'];
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }
  preRun();
  if (runDependencies > 0) {
    // a preRun added a dependency, run will be called later
    return;
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    calledRun = true;
    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }
    postRun();
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;
function exit(status) {
  ABORT = true;
  STACKTOP = initialStackTop;
  // TODO call externally added 'exit' callbacks with the status code.
  // It'd be nice to provide the same interface for all Module events (e.g.
  // prerun, premain, postmain). Perhaps an EventEmitter so we can do:
  // Module.on('exit', function (status) {});
  // exit the runtime
  exitRuntime();
  if (inMain) {
    // if we're still inside the callMain's try/catch, we need to throw an
    // exception in order to immediately terminate execution.
    throw { type: 'ExitStatus', value: status };
  }
}
Module['exit'] = Module.exit = exit;
function abort(text) {
  if (text) {
    Module.print(text);
  }
  ABORT = true;
  throw 'abort() at ' + (new Error().stack);
}
Module['abort'] = Module.abort = abort;
// {{PRE_RUN_ADDITIONS}}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
// {{MODULE_ADDITIONS}}
//@ sourceMappingURL=map-showdown.js.map