import { glMatrix, mat4, quat, vec3 } from 'gl-matrix';

class CameraControllerOrientation {
  constructor(viewMatrix) {
    this._viewMatrix = viewMatrix;
    this._viewQuat = quat.create();
    this._rotationQuat = quat.create();

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

    quat.identity(this._viewQuat);
    quat.rotateY(this._viewQuat, this._viewQuat, alpha);
    quat.rotateX(this._viewQuat, this._viewQuat, beta);
    quat.rotateZ(this._viewQuat, this._viewQuat, -gamma);

    if (this._initialAlpha !== null) {
      quat.setAxisAngle(this._rotationQuat, this._yUnit, -this._initialAlpha);
      quat.multiply(this._viewQuat, this._rotationQuat, this._viewQuat);
    }

    quat.multiply(this._viewQuat, this._viewQuat, this._screenQuat);
    quat.setAxisAngle(this._rotationQuat, this._zUnit, -orient);

    quat.multiply(this._viewQuat, this._viewQuat, this._rotationQuat); // Account for system-level screen rotation
    quat.invert(this._viewQuat, this._viewQuat);
    mat4.fromQuat(this._viewMatrix, this._viewQuat);
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
