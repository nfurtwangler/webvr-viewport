/**
 * Heavily inspired by VREffect by dmarcos and mrdoob
 * https://github.com/mrdoob/three.js/
 */

import * as THREE from 'three';
import { mat4, quat, vec3 } from 'gl-matrix';
import { WebVRViewport, ResizeParams } from '../webvr-viewport/webvr-viewport';

const DEFAULT_MONO_BOUNDS = [0.0, 0.0, 1.0, 1.0];
const DEFAULT_LEFT_BOUNDS = [0.0, 0.0, 0.5, 1.0];
const DEFAULT_RIGHT_BOUNDS = [0.5, 0.0, 0.5, 1.0];

export default class WebVRViewportEffect {
  private _leftCamera = new THREE.PerspectiveCamera();
  private _rightCamera = new THREE.PerspectiveCamera();
  private _leftEyeOffset = new THREE.Vector3();
  private _rightEyeOffset = new THREE.Vector3();
  private _leftCameraMatrix = mat4.create();
  private _rightCameraMatrix = mat4.create();
  private _leftViewTranslation = vec3.create();
  private _rightViewTranslation = vec3.create();
  private _leftViewRotation = quat.create();
  private _rightViewRotation = quat.create();
  private _monoBounds = DEFAULT_MONO_BOUNDS;
  private _leftBounds = DEFAULT_LEFT_BOUNDS;
  private _rightBounds = DEFAULT_RIGHT_BOUNDS;
  private _renderer: THREE.WebGLRenderer;

  constructor(renderer: THREE.WebGLRenderer) {
    this._renderer = renderer;

    this._leftCamera.layers.enable(1);
    this._rightCamera.layers.enable(2);
  }

  resize(params: ResizeParams) {
    this._renderer.setSize(params.width, params.height);
    this._renderer.setPixelRatio(params.pixelRatio);
  }

  render(scene: THREE.Scene, viewport: WebVRViewport) {
    const preserveAutoUpdate = scene.autoUpdate;
    if (preserveAutoUpdate) {
      scene.updateMatrixWorld(false);
      scene.autoUpdate = false;
    }

    (this._leftEyeOffset as any).fromArray(viewport.leftEyeOffset);
    (this._rightEyeOffset as any).fromArray(viewport.rightEyeOffset);

    const size = this._renderer.getSize();
    const leftBounds = viewport.isPresenting ? this._leftBounds : this._monoBounds;
    const leftRect = {
      x: Math.round(size.width * leftBounds[0]),
      y: Math.round(size.height * leftBounds[1]),
      width: Math.round(size.width * leftBounds[2]),
      height: Math.round(size.height * leftBounds[3]),
    };
    const rightRect = {
      x: Math.round(size.width * this._rightBounds[0]),
      y: Math.round(size.height * this._rightBounds[1]),
      width: Math.round(size.width * this._rightBounds[2]),
      height: Math.round(size.height * this._rightBounds[3]),
    };

    this._renderer.setScissorTest(true);

    if (this._renderer.autoClear) {
      this._renderer.clear();
    }

    mat4.invert(this._leftCameraMatrix, viewport.leftViewMatrix as mat4);
    mat4.getTranslation(this._leftViewTranslation, this._leftCameraMatrix);
    mat4.getRotation(this._leftViewRotation, this._leftCameraMatrix);
    this._leftCamera.position.set(this._leftViewTranslation[0], this._leftViewTranslation[1], this._leftViewTranslation[2]);
    this._leftCamera.quaternion.set(this._leftViewRotation[0], this._leftViewRotation[1], this._leftViewRotation[2], this._leftViewRotation[3]);
    this._leftCamera.translateOnAxis(this._leftEyeOffset, 1);
    this._leftCamera.projectionMatrix.elements = viewport.leftProjectionMatrix;

    // Prepare the scene backgrounds for each eye if ready
    const backupScene = scene.background;

    // Set up the left eye viewport and scissor
    this._renderer.setViewport(leftRect.x, leftRect.y, leftRect.width, leftRect.height);
    this._renderer.setScissor(leftRect.x, leftRect.y, leftRect.width, leftRect.height);

    // Always render left eye even if we are in mono
    this._renderer.render(scene, this._leftCamera);

    if (viewport.isPresenting) {
      // The right eye will only render if we are presenting
      mat4.invert(this._rightCameraMatrix, viewport.rightViewMatrix as mat4);
      mat4.getTranslation(this._rightViewTranslation, this._rightCameraMatrix);
      mat4.getRotation(this._rightViewRotation, this._rightCameraMatrix);
      this._rightCamera.position.set(this._rightViewTranslation[0], this._rightViewTranslation[1], this._rightViewTranslation[2]);
      this._rightCamera.quaternion.set(this._rightViewRotation[0], this._rightViewRotation[1], this._rightViewRotation[2], this._rightViewRotation[3]);
      this._rightCamera.translateOnAxis(this._rightEyeOffset, 1);
      this._rightCamera.projectionMatrix.elements = viewport.rightProjectionMatrix;

      // Set up the right eye viewport and scissor then render the right eye
      this._renderer.setViewport(rightRect.x, rightRect.y, rightRect.width, rightRect.height);
      this._renderer.setScissor(rightRect.x, rightRect.y, rightRect.width, rightRect.height);
      this._renderer.render(scene, this._rightCamera);
    }

    // Reset the previous background
    scene.background = backupScene;

    // Reset viewport
    this._renderer.setViewport(0, 0, size.width, size.height);
    this._renderer.setScissorTest(false);

    // Restores the scene's autoupdate property
    if (preserveAutoUpdate) {
      scene.autoUpdate = true;
    }
  }
}
