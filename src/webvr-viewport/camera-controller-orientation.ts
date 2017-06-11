// This is heavily influenced by the OVRUI controls for ReactVR
// https://github.com/facebook/react-vr/blob/master/OVRUI/src/Control/DeviceOrientationControls.js

import { mat4, quat, vec3 } from 'gl-matrix';

function toRadian(a: number|null): number {
  return (a || 0) * Math.PI / 180;
}

class CameraControllerOrientation {
  private _cameraMatrix: mat4;
  private _cameraRotationQuat = quat.create();
  private _initialRotationQuat = quat.create();
  private _screenQuat = quat.fromValues(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
  private _yUnit = vec3.fromValues(0, 1, 0);
  private _zUnit = vec3.fromValues(0, 0, 1);
  private _initialAlpha?: number;
  private _deviceOrientation: {alpha?: number; beta?: number; gamma?: number } = {};
  private _orientationChangeHandler = this._onOrientationChange.bind(this);
  private _deviceOrientationHandler = this._onDeviceOrientation.bind(this);
  private _target: HTMLElement | Window;
  private _screenOrientation = 0;
  constructor(cameraMatrix: mat4) {
    this._cameraMatrix = cameraMatrix;
  }

  connect(target: HTMLElement|Window): void {
    this._target = target || window;
    this._screenOrientation = this._getScreenOrientation();
    window.addEventListener('orientationchange', this._orientationChangeHandler);
    window.addEventListener('deviceorientation', this._deviceOrientationHandler);
  }

  disconnect() {
    window.removeEventListener('orientationchange', this._orientationChangeHandler);
    window.removeEventListener('deviceorientation', this._deviceOrientationHandler);
  }

  update() {
    const alpha = this._deviceOrientation.alpha || 0;
    const beta = this._deviceOrientation.beta || 0;
    const gamma = this._deviceOrientation.gamma || 0;

    const orient = this._screenOrientation;

    quat.identity(this._cameraRotationQuat);
    quat.rotateY(this._cameraRotationQuat, this._cameraRotationQuat, alpha);
    quat.rotateX(this._cameraRotationQuat, this._cameraRotationQuat, beta);
    quat.rotateZ(this._cameraRotationQuat, this._cameraRotationQuat, -gamma);

    if (this._initialAlpha !== undefined) {
      quat.setAxisAngle(this._initialRotationQuat, this._yUnit, -this._initialAlpha);
      quat.multiply(this._cameraRotationQuat, this._initialRotationQuat, this._cameraRotationQuat);
    }

    quat.multiply(this._cameraRotationQuat, this._cameraRotationQuat, this._screenQuat);
    quat.setAxisAngle(this._initialRotationQuat, this._zUnit, -orient);

    quat.multiply(this._cameraRotationQuat, this._cameraRotationQuat, this._initialRotationQuat);
    mat4.fromQuat(this._cameraMatrix, this._cameraRotationQuat);
  }

  resize(width: number, height: number, fov: number, aspect: number): void {
    // Nothing to do
  }

  _onOrientationChange() {
    this._screenOrientation = this._getScreenOrientation();
  }

  _onDeviceOrientation(e: DeviceOrientationEvent) {
    const alpha = toRadian(e.alpha);
    const beta = toRadian(e.beta);
    const gamma = toRadian(e.gamma);
    if (this._initialAlpha === undefined) {
      this._initialAlpha = alpha - this._getScreenOrientation();
    }
    this._deviceOrientation.alpha = alpha;
    this._deviceOrientation.beta = beta;
    this._deviceOrientation.gamma = gamma;
  }

  _getScreenOrientation(): number {
    const orientation = (screen as any).orientation || (screen as any).mozOrientation || screen.msOrientation || {};
    const angle = orientation.angle || window.orientation || 0;
    return toRadian(angle);
  }
}

export default CameraControllerOrientation;
