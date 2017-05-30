import { mat4, quat } from 'gl-matrix';
import CameraControllerMouse from './camera-controller-mouse';
import CameraControllerOrientation from './camera-controller-orientation';

class WebVRViewport {
  constructor(options) {
    this._canvasElement = document.createElement('canvas');
    this._eventListeners = {};
    this._animationFrameHandler = this._onAnimationFrame.bind(this);

    this._monoProjectionMatrix = mat4.create();
    this._monoCameraMatrix = mat4.create();
    this._monoViewMatrix = mat4.create();
    this._monoRotationQuat = quat.create();
    this._monoCameraController = this._isDeviceOrientationSupported ?
                                 new CameraControllerOrientation(this._monoCameraMatrix) :
                                 new CameraControllerMouse(this._monoCameraMatrix);
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
    this._wasPresenting = this.isPresenting;
  }

  get canvasElement() {
    return this._canvasElement;
  }

  get isPresenting() {
    return this._vrDisplay !== undefined && this._vrDisplay.isPresenting;
  }

  get leftProjectionMatrix() {
    return this.isPresenting ? this._frameData.leftProjectionMatrix : this._monoProjectionMatrix;
  }

  get rightProjectionMatrix() {
    return this.isPresenting ? this._frameData.rightProjectionMatrix : this._monoProjectionMatrix;
  }

  get leftViewMatrix() {
    return this.isPresenting ? this._frameData.leftViewMatrix : this._monoViewMatrix;
  }

  get rightViewMatrix() {
    return this.isPresenting ? this._frameData.rightViewMatrix : this._monoViewMatrix;
  }

  get leftEyeOffset() {
    return this.isPresenting ? this._vrDisplay.getEyeParameters('left').offset : [0, 0, 0];
  }

  get rightEyeOffset() {
    return this.isPresenting ? this._vrDisplay.getEyeParameters('right').offset : [0, 0, 0];
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
      this._vrDisplay.requestPresent([{ source: this._canvasElement }]).then(() => {
        console.log('webvr-viewport enterVR - Finished');
      }).catch((err) => {
        console.log('webvr-viewport enterVR - ERROR:  ' + JSON.stringify(err));
      });
    }
  }

  resize(newWidth, newHeight) {
    let width = newWidth;
    let height = newHeight;
    if (!this._fixedPixelRatio) {
      this._pixelRatio = window.devicePixelRatio || 1;
    }
    let pixelRatio = this._pixelRatio;

    let fov;
    if (this._isMobileInLandscapeOrientation) {
      // clamp the range of fov
      fov = Math.max(30, Math.min(70, 60 / (width / height)));
    } else {
      fov = 60;
    }

    let aspect = width / height;

    if (this.isPresenting) {
      const leftEye = this._vrDisplay.getEyeParameters('left');
      const rightEye = this._vrDisplay.getEyeParameters('right');

      // For simplicity we will render each eye at the same resolution
      width = Math.max(leftEye.renderWidth, rightEye.renderWidth);
      height = Math.max(leftEye.renderHeight, rightEye.renderHeight);
      fov = 60; // Should come from VRDisplay?
      pixelRatio = 1;
      aspect = 1;
    }

    this._canvasElement.width = width * pixelRatio * (this.isPresenting ? 2 : 1);
    this._canvasElement.height = height * pixelRatio;

    mat4.perspective(this._monoProjectionMatrix, (fov * Math.PI) / 180, aspect, 0.01, 10000.0);

    this._monoCameraController.resize(width, height, fov, aspect);

    if (this._eventListeners['resize']) {
      const resizeParams = {
        width,
        height,
        fov,
        aspect,
        pixelRatio,
      };

      for (const callback of this._eventListeners['resize']) {
        callback(resizeParams);
      }
    }
  }

  _addResizeHandler() {
    let last = 0;
    let timer = null;
    const delay = 100;

    // Throttled window resize handler
    this._resizeHandler = () => {
      if (this.isPresenting) {
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

    if (this.isPresenting !== this._wasPresenting) {
      this._wasPresenting = this.isPresenting;
      this.resize(this._width, this._height);
    }

    if (this.isPresenting) {
      this._vrDisplay.getFrameData(this._frameData);
    } else {
      // Update the mono camera and save the rotation quaternion
      this._monoCameraController.update();
      mat4.invert(this._monoViewMatrix, this._monoCameraMatrix);
    }

    for (const callback of this._eventListeners['frame']) {
      callback(timestamp);
    }

    if (this.isPresenting) {
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
