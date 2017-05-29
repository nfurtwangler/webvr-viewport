import { mat4 } from 'gl-matrix';
import CameraControllerMouse from './camera-controller-mouse';
import CameraControllerOrientation from './camera-controller-orientation';

class WebVRViewport {
  constructor(options) {
    this._canvasElement = document.createElement('canvas');
    this._eventListeners = {};
    this._animationFrameHandler = this._onAnimationFrame.bind(this);

    this._projectionMatrix = mat4.create();
    this._viewMatrix = mat4.create();
    this._monoCameraController = this._isDeviceOrientationSupported ?
                                 new CameraControllerOrientation(this._viewMatrix) :
                                 new CameraControllerMouse(this._viewMatrix);
    this._monoCameraController.connect(this._canvasElement);

    this._parentElement = options.parentElement || document.body;
    this._parentElement.appendChild(this._canvasElement);

    let width = options.width;
    let height = options.height;
    let pixelRatio = options.pixelRatio;
    let fixedSize = true;
    if (!width) {
      if (this._parentElement === document.body) {
        fixedSize = false;
        width = window.innerWidth;
      } else {
        width = this._parentElement.clientWidth;
      }
    }
    if (!height) {
      if (this._parentElement === document.body) {
        fixedSize = false;
        height = window.innerHeight;
      } else {
        height = this._parentElement.clientHeight;
      }
    }
    if (!pixelRatio) {
      this._fixedPixelRatio = false;
      pixelRatio = window.devicePixelRatio || 1;
    } else {
      this._fixedPixelRatio = true;
    }

    this._pixelRatio = pixelRatio;
    this.resize(width, height);

    if (!fixedSize && this._parentElement === document.body) {
      this._addResizeHandler();
    }

    this._initVrDisplay();
  }

  get canvasElement() {
    return this._canvasElement;
  }

  get isPresenting() {
    return this._vrDisplay && this._vrDisplay.isPresenting;
  }

  get leftProjectionMatrix() {
    return this.isPresenting ? this._frameData.leftProjectionMatrix : this._projectionMatrix;
  }

  get rightProjectionMatrix() {
    return this.isPresenting ? this._frameData.rightProjectionMatrix : this._projectionMatrix;
  }

  get leftViewMatrix() {
    return this.isPresenting ? this._frameData.leftViewMatrix : this._viewMatrix;
  }

  get rightViewMatrix() {
    return this.isPresenting ? this._frameData.rightViewMatrix : this._viewMatrix;
  }

  addEventListener(key, callback) {
    let listeners = this._eventListeners[key];
    let isFirst = false;
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

  enterVR() {
    if (this._vrDisplay) {
      // We must adjust the canvas (our VRLayer source) to match the VRDisplay
      const leftEye = this._vrDisplay.getEyeParameters('left');
      const rightEye = this._vrDisplay.getEyeParameters('right');

      // This layer source is a canvas so we will update its width and height based on the eye parameters.
      // For simplicity we will render each eye at the same resolution
      this._canvasElement.width = Math.max(leftEye.renderWidth, rightEye.renderWidth) * 2;
      this._canvasElement.height = Math.max(leftEye.renderHeight, rightEye.renderHeight);

      this._vrDisplay.requestPresent([{ source: this._canvasElement }]).then(() => {
        // TODO: emit event
        console.log('webvr-viewport enterVR - Finished');
      }).catch((err) => {
        // TODO: emit event
        console.log('webvr-viewport enterVR - ERROR:  ' + JSON.stringify(err));
      });
    }
  }

  resize(width, height) {
    if (!this._fixedPixelRatio) {
      this._pixelRatio = window.devicePixelRatio || 1;
    }
    this._canvasElement.width = width * this._pixelRatio;
    this._canvasElement.height = height * this._pixelRatio;

    let fov;
    if (this._isMobileInLandscapeOrientation) {
      // clamp the range of fov
      fov = Math.max(30, Math.min(70, 60 / (width / height)));
    } else {
      fov = 60;
    }

    const aspect = width / height;

    mat4.perspective(this._projectionMatrix, (fov * Math.PI) / 180, aspect, 0.01, 10000.0);

    this._monoCameraController.resize(width, height, fov, aspect);
  }

  _addResizeHandler() {
    let last = 0;
    let timer = null;
    const delay = 100;

    // Throttled window resize handler
    this._resizeHandler = () => {
      if (this._vrDisplay && this._vrDisplay.isPresenting) {
        return;
      }

      const now = Date.now();

      if (!last) {
        last = now;
      }

      if (timer) {
        clearTimeout(timer);
      }

      if (now > last + delay) {
        last = now;
        this.resize(window.innerWidth, window.innerHeight);
        return;
      }

      timer = setTimeout(() => {
        last = now;
        this.resize(window.innerWidth, window.innerHeight);
      }, delay);
    };

    window.addEventListener('resize', this._resizeHandler);
  }

  _initVrDisplay() {
    if (navigator.getVRDisplays) {
      navigator.getVRDisplays().then((displays) => {
        if (displays.length > 0) {
          // We reuse this every frame to avoid generating garbage
          this._frameData = new VRFrameData(); // eslint-disable-line no-undef
          this._vrDisplay = displays[0];

          // TODO: emit an event here that indicates VR display is available
          // TODO: hook vrdisplay events on window in case it disconnects or is connected later
        }
      });
    }
  }
  _onFirstEventListener(key) {
    if (key === 'frame') {
      this._requestAnimationFrame();
    }
  }

  _requestAnimationFrame() {
    if (this._vrDisplay) {
      this._vrDisplay.requestAnimationFrame(this._animationFrameHandler);
    } else {
      window.requestAnimationFrame(this._animationFrameHandler);
    }
  }

  _onAnimationFrame(timestamp) {
    this._requestAnimationFrame();

    if (this._vrDisplay && this._vrDisplay.isPresenting) {
      this._vrDisplay.getFrameData(this._frameData);
    } else {
      this._monoCameraController.update();
    }

    for (const callback of this._eventListeners['frame']) {
      callback(timestamp);
    }

    if (this._vrDisplay && this._vrDisplay.isPresenting) {
      this._vrDisplay.submitFrame();
    }
  }

  get _isMobile() {
    return /Mobi/i.test(navigator.userAgent);
  }

  get _isDeviceOrientationSupported() {
    return (
      'DeviceOrientationEvent' in window &&
      this._isMobile &&
      !/OculusBrowser/i.test(navigator.userAgent)
    );
  }

  get _isMobileInLandscapeOrientation() {
    if (!this._isMobile) {
      return false;
    }

    const orientation = screen.orientation || screen.mozOrientation || screen.msOrientation;
    if (orientation) {
      if (orientation.type === 'landscape-primary' || orientation.type === 'landscape-secondary') {
        return true;
      } else if (
        orientation.type === 'portrait-secondary' ||
        orientation.type === 'portrait-primary') {
        return false;
      }
    }

    // fall back to window.orientation
    if (!window.orientation) {
      return false;
    }

    let quadrant = Math.round(window.orientation / 90);
    while (quadrant < 0) {
      quadrant += 4;
    }

    while (quadrant >= 4) {
      quadrant -= 4;
    }

    return quadrant === 1 || quadrant === 3;
  }
}

export default WebVRViewport;
