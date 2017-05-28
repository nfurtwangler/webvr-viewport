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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
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

/***/ })
/******/ ]);
//# sourceMappingURL=webvr-viewport.js.map