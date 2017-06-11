import * as THREE from 'three';
import { WebVRViewport, ResizeParams } from '../../webvr-viewport/webvr-viewport';
import WebVRViewportEffect from '../../webvr-viewport-three/webvr-viewport-effect';

import './hello-three.css';

declare var require: (string) => any;
const cubeImageUrl = require('./assets/cube-sea.png');

class HelloThreeSample {
  // WebVRViewport used for controlling the view and entering VR
  private _viewport = new WebVRViewport({
    // Default options
  });

  // Three.js Objects
  private _scene = new THREE.Scene();
  private _renderer: THREE.WebGLRenderer;
  private _effect: WebVRViewportEffect;
  private _cubeFace: THREE.Mesh;

  constructor() {

    this._renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this._viewport.canvasElement,
    });
    this._renderer.setClearColor('#000000');

    // This effect adapts the WebVRViewport output to control a Three.js Camera
    this._effect = new WebVRViewportEffect(this._renderer);

    // Set initial Size and listen for changes
    this.resize({
      width: window.innerWidth,
      height: window.innerHeight,
      fov: 60,
      aspect: window.innerWidth / window.innerHeight,
      pixelRatio: window.devicePixelRatio,
    });
    this._viewport.addEventListener('resize', this.resize.bind(this));

    // Overlay UI hooks
    document.querySelector('#canvas-container').appendChild(this._viewport.canvasElement);
    const enterFullscreenButton = document.querySelector('#enter-fullscreen-button');
    enterFullscreenButton.addEventListener('click', () => {
      this._viewport.enterFullscreen();
    });

    const enterVRButton = document.querySelector('#enter-vr-button');
    enterVRButton.addEventListener('click', () => {
      this._viewport.enterVR();
    });
    this._viewport.addEventListener('vrdisplayactivate', () => {
      enterVRButton.classList.remove('hidden');
    });
  }

  load() {
    const loader = new THREE.TextureLoader();

    // Floating WebVR logo
    const cubeFaceGeo = new THREE.PlaneGeometry(0.4, 0.4);
    const cubeFaceMat = new THREE.MeshBasicMaterial({ map: loader.load('./' + cubeImageUrl) });
    this._cubeFace = new THREE.Mesh(cubeFaceGeo, cubeFaceMat);
    this._cubeFace.position.setZ(-1);
    this._scene.add(this._cubeFace);

    // Kick off rendering
    this._viewport.addEventListener('frame', this.render.bind(this));
  }

  resize(params: ResizeParams) {
    this._effect.resize(params);
  }

  render(timestamp) {
    // Animate the z location of the quad based on the current frame timestamp
    const oscillationSpeed = Math.PI / 2;
    const z = -1 + Math.cos((oscillationSpeed * timestamp) / 1000);
    this._cubeFace.position.set(0, 0, z - 1);

    this._effect.render(this._scene, this._viewport);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Stash on global for better debugging
  (window as any).sample = new HelloThreeSample();

  // Kick off loading and rendering
  (window as any).sample.load();
});
