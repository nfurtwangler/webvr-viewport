/**
 * Heavily inspired by VREffect by dmarcos and mrdoob
 * https://github.com/mrdoob/three.js/
 */

import * as THREE from 'three';
import { mat4, quat, vec3 } from 'gl-matrix';

const DEFAULT_LEFT_BOUNDS = [0.0, 0.0, 0.5, 1.0];
const DEFAULT_RIGHT_BOUNDS = [0.5, 0.0, 0.5, 1.0];

export default class WebVRViewportEffect {
  constructor(renderer) {
    this._leftCamera = new THREE.PerspectiveCamera();
    this._leftCamera.layers.enable(1);
    this._leftCamera.viewID = 0;

    this._rightCamera = new THREE.PerspectiveCamera();
    this._rightCamera.layers.enable(2);
    this._rightCamera.viewID = 1;

    this._leftEyeOffset = new THREE.Vector3();
    this._rightEyeOffset = new THREE.Vector3();

    // These are intermediate viarables used to convert from gl-matrix to THREE math types
    this._leftCameraMatrix = mat4.create();
    this._rightCameraMatrix = mat4.create();
    this._leftViewTranslation = vec3.create();
    this._rightViewTranslation = vec3.create();
    this._leftViewRotation = quat.create();
    this._rightViewRotation = quat.create();

    this._renderer = renderer;
    this._leftBounds = DEFAULT_LEFT_BOUNDS;
    this._rightBounds = DEFAULT_RIGHT_BOUNDS;
  }

  resize(params) {
    this._monoCamera = new THREE.PerspectiveCamera(params.fov, params.aspect, 0.1, 10000);
    this._renderer.setSize(params.width, params.height);
    this._renderer.setPixelRatio(params.pixelRatio);
  }

  render(scene, viewport) {
    if (viewport.isPresenting) {
      // VR Stereo Rendering
      const preserveAutoUpdate = scene.autoUpdate;
      if (preserveAutoUpdate) {
        scene.updateMatrixWorld();
        scene.autoUpdate = false;
      }

      this._leftEyeOffset.fromArray(viewport.leftEyeOffset);
      this._rightEyeOffset.fromArray(viewport.rightEyeOffset);

      const size = this._renderer.getSize();
      const leftRect = {
        x: Math.round(size.width * this._leftBounds[0]),
        y: Math.round(size.height * this._leftBounds[1]),
        width: Math.round(size.width * this._leftBounds[2]),
        height: Math.round(size.height * this._leftBounds[3]),
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

      this._monoCamera.updateMatrixWorld();

      mat4.invert(this._leftCameraMatrix, viewport.leftViewMatrix);
      mat4.getTranslation(this._leftViewTranslation, this._leftCameraMatrix);
      mat4.getRotation(this._leftViewRotation, this._leftCameraMatrix);
      this._leftCamera.position.set(this._leftViewTranslation[0], this._leftViewTranslation[1], this._leftViewTranslation[2]);
      this._leftCamera.quaternion.set(this._leftViewRotation[0], this._leftViewRotation[1], this._leftViewRotation[2], this._leftViewRotation[3]);
      this._leftCamera.translateOnAxis(this._leftEyeOffset, 1);

      mat4.invert(this._rightCameraMatrix, viewport.rightViewMatrix);
      mat4.getTranslation(this._rightViewTranslation, this._rightCameraMatrix);
      mat4.getRotation(this._rightViewRotation, this._rightCameraMatrix);
      this._rightCamera.position.set(this._rightViewTranslation[0], this._rightViewTranslation[1], this._rightViewTranslation[2]);
      this._rightCamera.quaternion.set(this._rightViewRotation[0], this._rightViewRotation[1], this._rightViewRotation[2], this._rightViewRotation[3]);
      this._rightCamera.translateOnAxis(this._rightEyeOffset, 1);

      this._leftCamera.projectionMatrix.elements = viewport.leftProjectionMatrix;
      this._rightCamera.projectionMatrix.elements = viewport.rightProjectionMatrix;

      // Prepare the scene backgrounds for each eye if ready
      const backupScene = scene.background;

      // Only allow stereo background rendering if both backgrounds have been set
      // otherwise the user will see the background in only one eye.
      const isStereoBackgroundReady = !!scene.backgroundLeft && !!scene.backgroundRight;

      // Swap in our left eye background if both backgrounds are ready
      if (isStereoBackgroundReady) {
        scene.background = scene.backgroundLeft;
      }

      // Set up the left eye viewport and scissor then render the left eye
      this._renderer.setViewport(leftRect.x, leftRect.y, leftRect.width, leftRect.height);
      this._renderer.setScissor(leftRect.x, leftRect.y, leftRect.width, leftRect.height);
      this._renderer.render(scene, this._leftCamera);

      // Swap in our right eye background if both backgrounds are ready
      if (isStereoBackgroundReady) {
        scene.background = scene.backgroundRight;
      }

      // Set up the right eye viewport and scissor then render the right eye
      this._renderer.setViewport(rightRect.x, rightRect.y, rightRect.width, rightRect.height);
      this._renderer.setScissor(rightRect.x, rightRect.y, rightRect.width, rightRect.height);
      this._renderer.render(scene, this._rightCamera);

      // Reset the previous background
      scene.background = backupScene;

      // Reset viewport
      this._renderer.setViewport(0, 0, size.width, size.height);
      this._renderer.setScissorTest(false);

      // Restores the scene's autoupdate property
      if (preserveAutoUpdate) {
        scene.autoUpdate = true;
      }
    } else {
      // Mono rendering
      const viewportRotation = viewport.quaternion;
      this._monoCamera.quaternion.set(viewportRotation[0], viewportRotation[1], viewportRotation[2], viewportRotation[3]);
      this._monoCamera.updateMatrixWorld(true);
      this._renderer.render(scene, this._monoCamera);
    }
  }
}
