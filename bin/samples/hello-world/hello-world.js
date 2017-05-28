/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WebVRViewport = function () {
  function WebVRViewport(width, height) {
    _classCallCheck(this, WebVRViewport);

    this._canvasElement = document.createElement('canvas');
    this._canvasElement.width = width;
    this._canvasElement.height = height;
    this._eventListeners = {};
    this._boundOnAnimationFrame = this._onAnimationFrame.bind(this);
    this._isPresenting = false;

    this._projectionMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

    this._viewMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

    this._initVrDisplay();
  }

  _createClass(WebVRViewport, [{
    key: 'addEventListener',
    value: function addEventListener(key, callback) {
      var listeners = this._eventListeners[key];
      var isFirst = false;
      if (!listeners) {
        listeners = [];
        this._eventListeners[key] = listeners;
        isFirst = true;
      }

      if (listeners.indexOf(callback) < 0) {
        listeners.push(callback);
      }

      if (isFirst) {
        this._onFirstEventListener(key);
      }
    }
  }, {
    key: 'enterVR',
    value: function enterVR() {
      var _this = this;

      if (this._vrDisplay) {
        // We must adjust the canvas (our VRLayer source) to match the VRDisplay
        var leftEye = this._vrDisplay.getEyeParameters('left');
        var rightEye = this._vrDisplay.getEyeParameters('right');

        // This layer source is a canvas so we will update its width and height based on the eye parameters.
        // For simplicity we will render each eye at the same resolution
        this._canvasElement.width = Math.max(leftEye.renderWidth, rightEye.renderWidth) * 2;
        this._canvasElement.height = Math.max(leftEye.renderHeight, rightEye.renderHeight);

        this._vrDisplay.requestPresent([{ source: this._canvasElement }]).then(function () {
          // TODO: emit event
          _this._isPresenting = true;
        }).catch(function (err) {
          // TODO: emit event
          console.log('webvr-viewport enterVR - ERROR:  ' + JSON.stringify(err));
        });
      }
    }
  }, {
    key: '_initVrDisplay',
    value: function _initVrDisplay() {
      var _this2 = this;

      if (navigator.getVRDisplays) {
        navigator.getVRDisplays().then(function (displays) {
          if (displays.length > 0) {
            // We reuse this every frame to avoid generating garbage
            _this2._frameData = new VRFrameData(); // eslint-disable-line no-undef
            _this2._vrDisplay = displays[0];

            // TODO: emit an event here that indicates VR display is available
            // TODO: hook vrdisplay events on window in case it disconnects or is connected later
          }
        });
      }
    }
  }, {
    key: '_onFirstEventListener',
    value: function _onFirstEventListener(key) {
      if (key === 'frame') {
        this._requestAnimationFrame();
      }
    }
  }, {
    key: '_requestAnimationFrame',
    value: function _requestAnimationFrame() {
      if (this._vrDisplay) {
        this._vrDisplay.requestAnimationFrame(this._boundOnAnimationFrame);
      } else {
        window.requestAnimationFrame(this._boundOnAnimationFrame);
      }
    }
  }, {
    key: '_onAnimationFrame',
    value: function _onAnimationFrame(timestamp) {
      this._requestAnimationFrame();

      if (this._isPresenting && this._vrDisplay) {
        this._vrDisplay.getFrameData(this._frameData);
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this._eventListeners['frame'][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var callback = _step.value;

          callback(timestamp);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (this._isPresenting && this._vrDisplay) {
        this._vrDisplay.submitFrame();
      }
    }
  }, {
    key: 'canvasElement',
    get: function get() {
      return this._canvasElement;
    }
  }, {
    key: 'isPresenting',
    get: function get() {
      return this._isPresenting;
    }
  }, {
    key: 'leftProjectionMatrix',
    get: function get() {
      return this._isPresenting ? this._frameData.leftProjectionMatrix : this._projectionMatrix;
    }
  }, {
    key: 'rightProjectionMatrix',
    get: function get() {
      return this._isPresenting ? this._frameData.rightProjectionMatrix : this._projectionMatrix;
    }
  }, {
    key: 'leftViewMatrix',
    get: function get() {
      return this._isPresenting ? this._frameData.leftViewMatrix : this._viewMatrix;
    }
  }, {
    key: 'rightViewMatrix',
    get: function get() {
      return this._isPresenting ? this._frameData.rightViewMatrix : this._viewMatrix;
    }
  }]);

  return WebVRViewport;
}();

exports.default = WebVRViewport;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "1cbe5d588671425f3a279b293c5d573e.png";

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(4);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(6)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!./hello-world.css", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!./hello-world.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _webvrViewport = __webpack_require__(0);

var _webvrViewport2 = _interopRequireDefault(_webvrViewport);

var _cubeSea = __webpack_require__(1);

var _cubeSea2 = _interopRequireDefault(_cubeSea);

__webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var viewport = new _webvrViewport2.default(1024, 1024);
var gl = void 0; // The webgl context of the canvas element, used to render the scene
var quadProgram = void 0; // The WebGLProgram we will create, a simple quad rendering program
var attribs = void 0; // A map of shader attributes to their location in the program
var uniforms = void 0; // A map of shader uniforms to their location in the program
var vertBuffer = void 0; // Vertex buffer used for rendering the scene
var texture = void 0; // The texture that will be bound to the diffuse sampler
var quadModelMat = void 0; // The quad's model matrix which we will animate

var initScene = function initScene(loadedCallback) {
  var layerSource = viewport.canvasElement;

  var glAttribs = {
    alpha: false, // The canvas will not contain an alpha channel
    antialias: true, // We want the canvas to perform anti-aliasing
    preserveDrawingBuffer: false };

  gl = layerSource.getContext('webgl', glAttribs);
  if (!gl) {
    gl = layerSource.getContext('experimental-webgl', glAttribs);
  }

  var quadVS = ['uniform mat4 projectionMat;', 'uniform mat4 viewMat;', 'uniform mat4 modelMat;', 'attribute vec3 position;', 'attribute vec2 texCoord;', 'varying vec2 vTexCoord;', 'void main() {', '  vTexCoord = texCoord;', '  gl_Position = projectionMat * viewMat * modelMat * vec4(position, 1.0);', '}'].join('\n');

  var quadFS = ['precision mediump float;', 'uniform sampler2D diffuse;', 'varying vec2 vTexCoord;', 'void main() {', '  gl_FragColor = texture2D(diffuse, vTexCoord);', '}'].join('\n');

  quadProgram = gl.createProgram();

  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.attachShader(quadProgram, vertexShader);
  gl.shaderSource(vertexShader, quadVS);
  gl.compileShader(vertexShader);

  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.attachShader(quadProgram, fragmentShader);
  gl.shaderSource(fragmentShader, quadFS);
  gl.compileShader(fragmentShader);

  attribs = {
    position: 0,
    texCoord: 1
  };

  gl.bindAttribLocation(quadProgram, attribs.position, 'position');
  gl.bindAttribLocation(quadProgram, attribs.texCoord, 'texCoord');

  gl.linkProgram(quadProgram);

  uniforms = {
    projectionMat: gl.getUniformLocation(quadProgram, 'projectionMat'),
    modelMat: gl.getUniformLocation(quadProgram, 'modelMat'),
    viewMat: gl.getUniformLocation(quadProgram, 'viewMat'),
    diffuse: gl.getUniformLocation(quadProgram, 'diffuse')
  };

  var size = 0.2;
  var quadVerts = [];

  var x = 0;
  var y = 0;
  var z = -1;
  quadVerts.push(x - size, y - size, z + size, 0.0, 1.0);
  quadVerts.push(x + size, y - size, z + size, 1.0, 1.0);
  quadVerts.push(x + size, y + size, z + size, 1.0, 0.0);
  quadVerts.push(x - size, y + size, z + size, 0.0, 0.0);

  vertBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadVerts), gl.STATIC_DRAW);

  quadModelMat = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

  texture = gl.createTexture();

  var image = new Image();

  // When the image is loaded, we will copy it to the GL texture
  image.addEventListener('load', function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);

    // To avoid bad aliasing artifacts we will generate mip maps to use when rendering this texture at various distances
    gl.generateMipmap(gl.TEXTURE_2D);
    loadedCallback();
  }, false);

  // Start loading the image
  image.src = _cubeSea2.default;

  // Provide an enter VR button overlay
  var enterVRButton = document.querySelector('#enter-vr-button');
  enterVRButton.addEventListener('click', function () {
    viewport.enterVR();
  });
};

var update = function update(timestamp) {
  // Animate the z location of the quad based on the current frame timestamp
  var oscillationSpeed = Math.PI / 2;
  var z = -1 + Math.cos(oscillationSpeed * timestamp / 1000);
  quadModelMat[14] = z;
};

var render = function render(projectionMat, viewMat) {
  gl.useProgram(quadProgram);

  gl.uniformMatrix4fv(uniforms.projectionMat, false, projectionMat);
  gl.uniformMatrix4fv(uniforms.viewMat, false, viewMat);

  gl.uniformMatrix4fv(uniforms.modelMat, false, quadModelMat);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);

  gl.enableVertexAttribArray(attribs.position);
  gl.enableVertexAttribArray(attribs.texCoord);

  gl.vertexAttribPointer(attribs.position, 3, gl.FLOAT, false, 20, 0);
  gl.vertexAttribPointer(attribs.texCoord, 2, gl.FLOAT, false, 20, 12);

  gl.activeTexture(gl.TEXTURE0);
  gl.uniform1i(uniforms.diffuse, 0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
};

var onAnimationFrame = function onAnimationFrame(timestamp) {
  // Clear the layer source - we do this outside of render to avoid clearing twice
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Update the scene once per frame
  update(timestamp);

  var viewportWidth = viewport.canvasElement.width;
  var viewportHeight = viewport.canvasElement.height;
  if (viewport.isPresenting) {
    // Left Eye
    gl.viewport(0, 0, viewportWidth * 0.5, viewportHeight);
    render(viewport.leftProjectionMatrix, viewport.leftViewMatrix);

    // Right eye
    gl.viewport(viewportWidth * 0.5, 0, viewportWidth * 0.5, viewportHeight);
    render(viewport.rightProjectionMatrix, viewport.rightViewMatrix);
  } else {
    // Monoscopic, just use left eye
    gl.viewport(0, 0, viewportWidth, viewportHeight);
    render(viewport.leftProjectionMatrix, viewport.leftViewMatrix);
  }
};

document.addEventListener('DOMContentLoaded', function () {
  initScene(function () {
    viewport.addEventListener('frame', onAnimationFrame);
  });
  document.body.insertBefore(viewport.canvasElement, document.querySelector('#enter-vr-button')); // TODO: figure out best way of placing canvas on page
});

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(5)();
// imports


// module
exports.push([module.i, "canvas {\n  position: absolute;\n  left: 0px;\n  top: 0px;\n  width: 1024px;\n  height: 1024px;\n}\n\n.button {\n  position: absolute;\n  left: 0px;\n  top: 0px;\n  width: 80px;\n  height: 30px;\n  line-height: 30px;\n  background-color: white;\n  color: black;\n  border: 4px solid #acacac;\n  font-family: Arial, Helvetica, sans-serif;\n  text-align: center;\n  cursor: pointer;\n}\n", ""]);

// exports


/***/ }),
/* 5 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function() {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		var result = [];
		for(var i = 0; i < this.length; i++) {
			var item = this[i];
			if(item[2]) {
				result.push("@media " + item[2] + "{" + item[1] + "}");
			} else {
				result.push(item[1]);
			}
		}
		return result.join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};


/***/ }),
/* 6 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var stylesInDom = {},
	memoize = function(fn) {
		var memo;
		return function () {
			if (typeof memo === "undefined") memo = fn.apply(this, arguments);
			return memo;
		};
	},
	isOldIE = memoize(function() {
		return /msie [6-9]\b/.test(self.navigator.userAgent.toLowerCase());
	}),
	getHeadElement = memoize(function () {
		return document.head || document.getElementsByTagName("head")[0];
	}),
	singletonElement = null,
	singletonCounter = 0,
	styleElementsInsertedAtTop = [];

module.exports = function(list, options) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};
	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (typeof options.singleton === "undefined") options.singleton = isOldIE();

	// By default, add <style> tags to the bottom of <head>.
	if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

	var styles = listToStyles(list);
	addStylesToDom(styles, options);

	return function update(newList) {
		var mayRemove = [];
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			domStyle.refs--;
			mayRemove.push(domStyle);
		}
		if(newList) {
			var newStyles = listToStyles(newList);
			addStylesToDom(newStyles, options);
		}
		for(var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];
			if(domStyle.refs === 0) {
				for(var j = 0; j < domStyle.parts.length; j++)
					domStyle.parts[j]();
				delete stylesInDom[domStyle.id];
			}
		}
	};
}

function addStylesToDom(styles, options) {
	for(var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];
		if(domStyle) {
			domStyle.refs++;
			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}
			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];
			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}
			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles(list) {
	var styles = [];
	var newStyles = {};
	for(var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};
		if(!newStyles[id])
			styles.push(newStyles[id] = {id: id, parts: [part]});
		else
			newStyles[id].parts.push(part);
	}
	return styles;
}

function insertStyleElement(options, styleElement) {
	var head = getHeadElement();
	var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
	if (options.insertAt === "top") {
		if(!lastStyleElementInsertedAtTop) {
			head.insertBefore(styleElement, head.firstChild);
		} else if(lastStyleElementInsertedAtTop.nextSibling) {
			head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			head.appendChild(styleElement);
		}
		styleElementsInsertedAtTop.push(styleElement);
	} else if (options.insertAt === "bottom") {
		head.appendChild(styleElement);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement(styleElement) {
	styleElement.parentNode.removeChild(styleElement);
	var idx = styleElementsInsertedAtTop.indexOf(styleElement);
	if(idx >= 0) {
		styleElementsInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement(options) {
	var styleElement = document.createElement("style");
	styleElement.type = "text/css";
	insertStyleElement(options, styleElement);
	return styleElement;
}

function createLinkElement(options) {
	var linkElement = document.createElement("link");
	linkElement.rel = "stylesheet";
	insertStyleElement(options, linkElement);
	return linkElement;
}

function addStyle(obj, options) {
	var styleElement, update, remove;

	if (options.singleton) {
		var styleIndex = singletonCounter++;
		styleElement = singletonElement || (singletonElement = createStyleElement(options));
		update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
		remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
	} else if(obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function") {
		styleElement = createLinkElement(options);
		update = updateLink.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
			if(styleElement.href)
				URL.revokeObjectURL(styleElement.href);
		};
	} else {
		styleElement = createStyleElement(options);
		update = applyToTag.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
		};
	}

	update(obj);

	return function updateStyle(newObj) {
		if(newObj) {
			if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
				return;
			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;
		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag(styleElement, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = styleElement.childNodes;
		if (childNodes[index]) styleElement.removeChild(childNodes[index]);
		if (childNodes.length) {
			styleElement.insertBefore(cssNode, childNodes[index]);
		} else {
			styleElement.appendChild(cssNode);
		}
	}
}

function applyToTag(styleElement, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		styleElement.setAttribute("media", media)
	}

	if(styleElement.styleSheet) {
		styleElement.styleSheet.cssText = css;
	} else {
		while(styleElement.firstChild) {
			styleElement.removeChild(styleElement.firstChild);
		}
		styleElement.appendChild(document.createTextNode(css));
	}
}

function updateLink(linkElement, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	if(sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = linkElement.href;

	linkElement.href = URL.createObjectURL(blob);

	if(oldSrc)
		URL.revokeObjectURL(oldSrc);
}


/***/ })
/******/ ]);
//# sourceMappingURL=hello-world.js.map