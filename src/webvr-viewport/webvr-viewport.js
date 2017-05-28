class WebVRViewport {
  constructor(width, height) {
    this._canvasElement = document.createElement('canvas');
    this._canvasElement.width = width;
    this._canvasElement.height = height;
    this._eventListeners = {};
    this._boundOnAnimationFrame = this._onAnimationFrame.bind(this);
    this._isPresenting = false;

    this._projectionMatrix = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);

    this._viewMatrix = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);

    this._initVrDisplay();
  }

  get canvasElement() {
    return this._canvasElement;
  }

  get isPresenting() {
    return this._isPresenting;
  }

  get leftProjectionMatrix() {
    return this._isPresenting ? this._frameData.leftProjectionMatrix : this._projectionMatrix;
  }

  get rightProjectionMatrix() {
    return this._isPresenting ? this._frameData.rightProjectionMatrix : this._projectionMatrix;
  }

  get leftViewMatrix() {
    return this._isPresenting ? this._frameData.leftViewMatrix : this._viewMatrix;
  }

  get rightViewMatrix() {
    return this._isPresenting ? this._frameData.rightViewMatrix : this._viewMatrix;
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
        this._isPresenting = true;
      }).catch((err) => {
        // TODO: emit event
        console.log('webvr-viewport enterVR - ERROR:  ' + JSON.stringify(err));
      });
    }
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
      this._vrDisplay.requestAnimationFrame(this._boundOnAnimationFrame);
    } else {
      window.requestAnimationFrame(this._boundOnAnimationFrame);
    }
  }

  _onAnimationFrame(timestamp) {
    this._requestAnimationFrame();

    if (this._isPresenting && this._vrDisplay) {
      this._vrDisplay.getFrameData(this._frameData);
    }

    for (const callback of this._eventListeners['frame']) {
      callback(timestamp);
    }

    if (this._isPresenting && this._vrDisplay) {
      this._vrDisplay.submitFrame();
    }
  }
}

export default WebVRViewport;
