import { mat4, quat } from 'gl-matrix';
import CameraControllerMouse from './camera-controller-mouse';
import CameraControllerOrientation from './camera-controller-orientation';

interface VRFrameData {
  leftProjectionMatrix: Float32Array,
  rightProjectionMatrix: Float32Array,
  leftViewMatrix: Float32Array,
  rightViewMatrix: Float32Array,
}

declare var VRFrameData: {
    prototype: VRFrameData;
    new(): VRFrameData;
}

interface VREyeParameters {
  offset: Float32Array,
  renderWidth: number,
  renderHeight: number,
  //...
}

interface VRLayerInit {
  leftBounds?: [number, number, number, number];
  rightBounds?: [number, number, number, number];
  source: HTMLCanvasElement
}

interface VRDisplay {
  isPresenting: boolean;
  getEyeParameters(whichEye: "left"|"right"): VREyeParameters;
  requestPresent(layers: VRLayerInit[]): Promise<void>;
  requestAnimationFrame(callback: ()=>void): void;
  getFrameData(data: VRFrameData): void;
  submitFrame():void;
}

interface Navigator {
  getVRDisplays(): Promise<VRDisplay>;
}

export type EventHandler = (arg: any) => void;

export interface ResizeParams {
  width: number,
  height: number,
  fov: number,
  aspect: number,
  pixelRatio: number,
}

export interface WebVRViewportOptions {
  width?: number,
  height?: number,
  pixelRatio?: number,
  parentElement?: HTMLElement,
}

export class WebVRViewport {
  private _canvasElement: HTMLCanvasElement;
  private _eventListeners: {[key: string]: EventHandler[]} = {};
  private _animationFrameHandler = this._onAnimationFrame.bind(this);
  private _monoProjectionMatrix = mat4.create();
  private _monoCameraMatrix = mat4.create();
  private _monoViewMatrix = mat4.create();
  private _monoRotationQuat = quat.create();
  private _parentElement: HTMLElement;
  private _monoCameraController: CameraControllerOrientation|CameraControllerMouse;
  private _fixedPixelRatio = true;
  private _pixelRatio = 1;
  private _wasPresenting = false;
  private _vrDisplay: VRDisplay;
  private _frameData: VRFrameData;
  private _resizeHandler: () => void;
  private _width: number;
  private _height: number;

  constructor(options: WebVRViewportOptions) {
    this._canvasElement = document.createElement('canvas');
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
    return this.isPresenting ? this._frameData.leftProjectionMatrix : this._monoProjectionMatrix as Float32Array;
  }

  get rightProjectionMatrix() {
    return this.isPresenting ? this._frameData.rightProjectionMatrix : this._monoProjectionMatrix as Float32Array;
  }

  get leftViewMatrix() {
    return this.isPresenting ? this._frameData.leftViewMatrix : this._monoViewMatrix as Float32Array;
  }

  get rightViewMatrix() {
    return this.isPresenting ? this._frameData.rightViewMatrix : this._monoViewMatrix as Float32Array;
  }

  get leftEyeOffset() {
    return this.isPresenting ? this._vrDisplay.getEyeParameters('left').offset : new Float32Array([0, 0, 0]);
  }

  get rightEyeOffset() {
    return this.isPresenting ? this._vrDisplay.getEyeParameters('right').offset : new Float32Array([0, 0, 0]);
  }

  addEventListener(key: string, callback: EventHandler) {
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

  enterFullscreen() {
    let fullscreenMethod = null;
    if ('requestFullscreen' in Element.prototype) {
      fullscreenMethod = 'requestFullscreen';
    } else if ('webkitRequestFullscreen' in Element.prototype) {
      fullscreenMethod = 'webkitRequestFullscreen';
    } else if ('mozRequestFullScreen' in Element.prototype) {
      fullscreenMethod = 'mozRequestFullScreen';
    } else if ('msRequestFullscreen' in Element.prototype) {
      fullscreenMethod = 'msRequestFullscreen';
    }

    const canvasElement = this.canvasElement as any;
    if (fullscreenMethod && canvasElement[fullscreenMethod]) {
      canvasElement[fullscreenMethod]();
    }
  }

  resize(newWidth: number, newHeight: number) {
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

    this._emitEvent('resize', {
      width,
      height,
      fov,
      aspect,
      pixelRatio,
    });
  }

  _addResizeHandler() {
    let last = 0;
    let timer: number|null = null;
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
    if ((navigator as any).getVRDisplays) {
      (navigator as any).getVRDisplays().then((displays: VRDisplay[]) => {
        if (displays.length > 0) {
          // We reuse this every frame to avoid generating garbage
          this._frameData = new VRFrameData(); // eslint-disable-line no-undef
          this._vrDisplay = displays[0];
          this._emitEvent('vrdisplayactivate');

          // TODO: hook vrdisplay events on window in case it disconnects or is connected later
        }
      });
    }
  }

  _emitEvent(event: string, args?: any) {
    if (this._eventListeners[event]) {
      for (const callback of this._eventListeners[event]) {
        callback(args);
      }
    }
  }

  _onFirstEventListener(key: string) {
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

  _onAnimationFrame(timestamp: number) {
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

    this._emitEvent('frame', timestamp);

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

    const orientation = (screen as any).orientation || (screen as any).mozOrientation || screen.msOrientation;
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

    let quadrant = Math.round(Number(window.orientation) / 90);
    while (quadrant < 0) {
      quadrant += 4;
    }

    while (quadrant >= 4) {
      quadrant -= 4;
    }

    return quadrant === 1 || quadrant === 3;
  }
}
