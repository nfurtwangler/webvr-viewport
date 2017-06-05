import * as THREE from 'three';
import WebVRViewport from '../../webvr-viewport/webvr-viewport';
import WebVRViewportEffect from '../../webvr-viewport-three/webvr-viewport-effect';
import cubeImageUrl from './assets/cube-sea.png';
import chessWorldImageUrl from './assets/chess-world.jpg';

import './input.css';

class InputSample {
  constructor() {
    // WebVRViewport used for controlling the view and entering VR
    this._viewport = new WebVRViewport({
      // Default options
    });

    // Three.js Objects
    this._scene = new THREE.Scene();
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
    const cubeFace = new THREE.Mesh(cubeFaceGeo, cubeFaceMat);
    cubeFace.position.setZ(-1);
    this._scene.add(cubeFace);

    // Equirect pano image for background
    const sphereGeo = new THREE.SphereGeometry(1000, 50, 50);
    const sphereMat = new THREE.MeshBasicMaterial({ map: loader.load('./' + chessWorldImageUrl) });
    sphereGeo.scale(-1, 1, 1);
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    this._scene.add(sphere);

    // Kick off rendering
    this._viewport.addEventListener('frame', this.render.bind(this));
  }

  resize(params) {
    this._effect.resize(params);
  }

  render() {
    this._effect.render(this._scene, this._viewport);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Stash on global for better debugging
  window.sample = new InputSample();

  // Kick off loading and rendering
  window.sample.load();
});
