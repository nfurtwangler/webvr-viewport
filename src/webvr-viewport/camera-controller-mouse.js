import { mat4, vec3 } from 'gl-matrix';

class CameraControllerMouse {
  constructor(viewMatrix) {
    this._viewMatrix = viewMatrix;
    this._yUnit = vec3.fromValues(0, 1, 0);
    this._width = 0;
    this._height = 0;
    this._fov = 0;
    this._yaw = 0;
    this._pitch = 0;
    this._dragging = false;
    this._lastX = 0;
    this._lastY = 0;
    this._mouseDownHandler = this._onMouseDown.bind(this);
    this._mouseUpHandler = this._onMouseUp.bind(this);
    this._mouseMoveHandler = this._onMouseMove.bind(this);
  }

  connect(target) {
    this._target = target || window;
    this._target.addEventListener('mousedown', this._mouseDownHandler);
    this._target.addEventListener('mousemove', this._mouseMoveHandler);
    this._target.addEventListener('mouseup', this._mouseUpHandler);
  }

  disconnect() {
    this._target.removeEventListener('mousedown', this._mouseDownHandler);
    this._target.removeEventListener('mousemove', this._mouseMoveHandler);
    this._target.removeEventListener('mouseup', this._mouseUpHandler);
  }

  update() {
    mat4.fromRotation(this._viewMatrix, this._yaw, this._yUnit);
    mat4.rotateX(this._viewMatrix, this._viewMatrix, this._pitch);
  }

  resize(width, height, fov, aspect) {
    this._width = width;
    this._height = height;
    this._fov = fov;
    this._aspect = aspect;
  }

  _onMouseDown(e) {
    this._dragging = true;
    this._lastX = e.screenX;
    this._lastY = e.screenY;
  }

  _onMouseUp() {
    this._dragging = false;
  }

  _onMouseMove(e) {
    if (!this._dragging) {
      return;
    }

    const deltaX = e.screenX - this._lastX;
    const deltaY = e.screenY - this._lastY;
    this._yaw += -(deltaX / this._width) * this._fov * this._aspect * (Math.PI / 180);
    this._pitch += -deltaY / (this._height * this._fov * (Math.PI / 180));
    this._pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this._pitch));

    this._lastX = e.screenX;
    this._lastY = e.screenY;
  }
}

export default CameraControllerMouse;
