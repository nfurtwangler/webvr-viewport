import WebVRViewport from '../../webvr-viewport/webvr-viewport';

import './hello-world.css';

const initScene = () => {
  const viewport = new WebVRViewport();

  const enterVRButton = document.querySelector('#enter-vr-button');
  enterVRButton.addEventListener('click', () => {
    viewport.enterVR();
  });
};

document.addEventListener('DOMContentLoaded', () => {
  initScene();
});
