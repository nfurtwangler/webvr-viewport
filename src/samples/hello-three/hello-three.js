import * as THREE from 'three';
import WebVRViewport from '../../webvr-viewport/webvr-viewport';
import WebVRViewportEffect from '../../webvr-viewport-three/webvr-viewport-effect';
import cubeImageUrl from './assets/cube-sea.png';

import './hello-three.css';

let viewport;       // The WebVRViewport used to manage the view and projection matrices
let effect;
let scene;
let renderer;
let cubeFace;

const resize = (params) => {
  effect.resize(params);
};

const initScene = (loadedCallback) => {
  viewport = new WebVRViewport({
    // Default options
  });

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: viewport.canvasElement,
  });
  renderer.setClearColor('#000000');
  effect = new WebVRViewportEffect(renderer);

  // Set initial size and listen for changes
  resize({
    width: window.innerWidth,
    height: window.innerHeight,
    fov: 60,
    aspect: window.innerWidth / window.innerHeight,
    pixelRatio: window.devicePixelRatio,
  });
  viewport.addEventListener('resize', resize);

  // Load the texture, and add it to the scene
  const loader = new THREE.TextureLoader();
  loader.load(
    './' + cubeImageUrl,
    (texture) => {
      const cubeFaceGeo = new THREE.PlaneGeometry(0.4, 0.4);
      const cubeFaceMat = new THREE.MeshBasicMaterial({ map: texture });
      cubeFace = new THREE.Mesh(cubeFaceGeo, cubeFaceMat);
      cubeFace.position.setZ(-1);
      scene.add(cubeFace);

      // Done loading
      loadedCallback();
    }
  );

  // Provide an enter VR button overlay
  const enterVRButton = document.querySelector('#enter-vr-button');
  enterVRButton.addEventListener('click', () => {
    viewport.enterVR();
  });
};

const update = (timestamp) => {
  // Animate the z location of the quad based on the current frame timestamp
  const oscillationSpeed = Math.PI / 2;
  const z = -1 + Math.cos((oscillationSpeed * timestamp) / 1000);
  cubeFace.position.set(0, 0, z - 1);
};

const onAnimationFrame = (timestamp) => {
  // Update the scene once per frame
  update(timestamp);

  // Render using the WebVRViewport effect
  effect.render(scene, viewport);
};

document.addEventListener('DOMContentLoaded', () => {
  initScene(() => {
    viewport.addEventListener('frame', onAnimationFrame);
  });
  document.body.insertBefore(viewport.canvasElement, document.querySelector('#enter-vr-button')); // TODO: figure out best way of placing canvas on page
});
