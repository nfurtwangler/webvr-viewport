// This is heavily influenced by the OVRUI controls for ReactVR
// https://github.com/facebook/react-vr/blob/master/OVRUI/src/Control/DeviceOrientationControls.js

import { glMatrix, mat4, quat, vec3 } from 'gl-matrix';

class CameraControllerOrientation {
  constructor(cameraMatrix) {
    this._cameraMatrix = cameraMatrix;
    this._cameraRotationQuat = quat.create();
    this._initialRotationQuat = quat.create();

    // -Pi/2 rotation around the X-axis
    this._screenQuat = quat.fromValues(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
    this._yUnit = vec3.fromValues(0, 1, 0);
    this._zUnit = vec3.fromValues(0, 0, 1);

    this._initialAlpha = null;
    this._deviceOrientation = {};
    this._orientationChangeHandler = this._onOrientationChange.bind(this);
    this._deviceOrientationHandler = this._onDeviceOrientation.bind(this);
  }

  connect(target) {
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

    if (this._initialAlpha !== null) {
      quat.setAxisAngle(this._initialRotationQuat, this._yUnit, -this._initialAlpha);
      quat.multiply(this._cameraRotationQuat, this._initialRotationQuat, this._cameraRotationQuat);
    }

    quat.multiply(this._cameraRotationQuat, this._cameraRotationQuat, this._screenQuat);
    quat.setAxisAngle(this._initialRotationQuat, this._zUnit, -orient);

    quat.multiply(this._cameraRotationQuat, this._cameraRotationQuat, this._initialRotationQuat);
    mat4.fromQuat(this._cameraMatrix, this._cameraRotationQuat);
  }

  resize() {
    // Nothing to do
  }

  _onOrientationChange() {
    this._screenOrientation = this._getScreenOrientation();
  }

  _onDeviceOrientation(e) {
    const alpha = glMatrix.toRadian(e.alpha);
    const beta = glMatrix.toRadian(e.beta);
    const gamma = glMatrix.toRadian(e.gamma);
    if (this._initialAlpha === null) {
      this._initialAlpha = alpha - this._getScreenOrientation();
    }
    this._deviceOrientation.alpha = alpha;
    this._deviceOrientation.beta = beta;
    this._deviceOrientation.gamma = gamma;
  }

  _getScreenOrientation() {
    const orientation = screen.orientation || screen.mozOrientation || screen.msOrientation || {};
    const angle = orientation.angle || window.orientation || 0;
    return glMatrix.toRadian(angle);
  }
}

export default CameraControllerOrientation;
