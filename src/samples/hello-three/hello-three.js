import * as THREE from 'three';
import WebVRViewport from '../../webvr-viewport/webvr-viewport';

import cubeImageUrl from './assets/cube-sea.png';

import './hello-three.css';

let viewport;       // The WebVRViewport used to manage the view and projection matrices
let scene;
let camera;
let renderer;
let cubeFace;

const resize = (width, height, fov, aspect) => {
  camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 10000);
  camera.position.z = 2;
  renderer.setSize(width, height);
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
  resize(window.innerWidth, window.innerHeight, 60, window.innerWidth / window.innerHeight);

  viewport.addEventListener('resize', resize);

  const loader = new THREE.TextureLoader();
  loader.load(
    './' + cubeImageUrl,
    (texture) => {
      const cubeFaceGeo = new THREE.PlaneGeometry(1, 1);
      const cubeFaceMat = new THREE.MeshBasicMaterial({ map: texture });
      cubeFace = new THREE.Mesh(cubeFaceGeo, cubeFaceMat);
      scene.add(cubeFace);
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

  cubeFace.position.set(0, 0, z);

  const viewportRotation = viewport.quaternion;
  camera.quaternion.set(viewportRotation[0], viewportRotation[1], viewportRotation[2], viewportRotation[3]);
  camera.updateMatrixWorld(true);
};

const onAnimationFrame = (timestamp) => {
  // Update the scene once per frame
  update(timestamp);

  renderer.render(scene, camera);
};

document.addEventListener('DOMContentLoaded', () => {
  initScene(() => {
    viewport.addEventListener('frame', onAnimationFrame);
  });
  document.body.insertBefore(viewport.canvasElement, document.querySelector('#enter-vr-button')); // TODO: figure out best way of placing canvas on page
});
