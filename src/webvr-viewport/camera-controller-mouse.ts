// This is heavily influenced by the OVRUI controls for ReactVR
// https://github.com/facebook/react-vr/blob/master/OVRUI/src/Control/MousePanControls.js

import { mat4, vec3 } from 'gl-matrix';

class CameraControllerMouse {
  private _yUnit = vec3.fromValues(0, 1, 0);
  private _width = 0;
  private _height = 0;
  private _fov = 0;
  private _yaw = 0;
  private _pitch = 0;
  private _dragging = false;
  private _lastX = 0;
  private _lastY = 0;
  private _mouseDownHandler = this._onMouseDown.bind(this);
  private _mouseUpHandler = this._onMouseUp.bind(this);
  private _mouseMoveHandler = this._onMouseMove.bind(this);
  private _viewMatrix: mat4;
  private _target?: HTMLElement|Window = undefined;
  private _aspect = 1;
  constructor(viewMatrix: mat4) {
    this._viewMatrix = viewMatrix;
  }

  connect(target: HTMLElement|Window): void {
    this._target = target || window;
    this._target.addEventListener('mousedown', this._mouseDownHandler);
    this._target.addEventListener('mousemove', this._mouseMoveHandler);
    this._target.addEventListener('mouseup', this._mouseUpHandler);
  }

  disconnect() {
    if (this._target) {
      this._target.removeEventListener('mousedown', this._mouseDownHandler);
      this._target.removeEventListener('mousemove', this._mouseMoveHandler);
      this._target.removeEventListener('mouseup', this._mouseUpHandler);
    }
  }

  update() {
    mat4.fromRotation(this._viewMatrix, this._yaw, this._yUnit);
    mat4.rotateX(this._viewMatrix, this._viewMatrix, this._pitch);
  }

  resize(width: number, height: number, fov: number, aspect: number): void {
    this._width = width;
    this._height = height;
    this._fov = fov;
    this._aspect = aspect;
  }

  _onMouseDown(e: MouseEvent) {
    this._dragging = true;
    this._lastX = e.screenX;
    this._lastY = e.screenY;
  }

  _onMouseUp() {
    this._dragging = false;
  }

  _onMouseMove(e: MouseEvent) {
    if (!this._dragging) {
      return;
    }

    const deltaX = e.screenX - this._lastX;
    const deltaY = e.screenY - this._lastY;
    this._yaw += (deltaX / this._width) * this._fov * this._aspect * (Math.PI / 180);
    this._pitch += deltaY / (this._height * this._fov * (Math.PI / 180));
    this._pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this._pitch));

    this._lastX = e.screenX;
    this._lastY = e.screenY;
  }
}

export default CameraControllerMouse;
