import WebVRViewport from '../../webvr-viewport/webvr-viewport';

import cubeImageUrl from './assets/cube-sea.png';

import './hello-world.css';

let viewport;       // The WebVRViewport used to manage the view and projection matrices
let gl;             // The webgl context of the canvas element, used to render the scene
let quadProgram;    // The WebGLProgram we will create, a simple quad rendering program
let attribs;        // A map of shader attributes to their location in the program
let uniforms;       // A map of shader uniforms to their location in the program
let vertBuffer;     // Vertex buffer used for rendering the scene
let texture;        // The texture that will be bound to the diffuse sampler
let quadModelMat;   // The quad's model matrix which we will animate

const initScene = (loadedCallback) => {
  viewport = new WebVRViewport({
    // Default options
  });

  const layerSource = viewport.canvasElement;

  const glAttribs = {
    alpha: false,                   // The canvas will not contain an alpha channel
    antialias: true,                // We want the canvas to perform anti-aliasing
    preserveDrawingBuffer: false,   // We don't want our drawing to be retained between frames
  };

  gl = layerSource.getContext('webgl', glAttribs);
  if (!gl) {
    gl = layerSource.getContext('experimental-webgl', glAttribs);
  }

  const quadVS = [
    'uniform mat4 projectionMat;',
    'uniform mat4 viewMat;',
    'uniform mat4 modelMat;',
    'attribute vec3 position;',
    'attribute vec2 texCoord;',
    'varying vec2 vTexCoord;',

    'void main() {',
    '  vTexCoord = texCoord;',
    '  gl_Position = projectionMat * viewMat * modelMat * vec4(position, 1.0);',
    '}',
  ].join('\n');

  const quadFS = [
    'precision mediump float;',
    'uniform sampler2D diffuse;',
    'varying vec2 vTexCoord;',

    'void main() {',
    '  gl_FragColor = texture2D(diffuse, vTexCoord);',
    '}',
  ].join('\n');

  quadProgram = gl.createProgram();

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.attachShader(quadProgram, vertexShader);
  gl.shaderSource(vertexShader, quadVS);
  gl.compileShader(vertexShader);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.attachShader(quadProgram, fragmentShader);
  gl.shaderSource(fragmentShader, quadFS);
  gl.compileShader(fragmentShader);

  attribs = {
    position: 0,
    texCoord: 1,
  };

  gl.bindAttribLocation(quadProgram, attribs.position, 'position');
  gl.bindAttribLocation(quadProgram, attribs.texCoord, 'texCoord');

  gl.linkProgram(quadProgram);

  uniforms = {
    projectionMat: gl.getUniformLocation(quadProgram, 'projectionMat'),
    modelMat: gl.getUniformLocation(quadProgram, 'modelMat'),
    viewMat: gl.getUniformLocation(quadProgram, 'viewMat'),
    diffuse: gl.getUniformLocation(quadProgram, 'diffuse'),
  };

  const size = 0.2;
  const quadVerts = [];

  const x = 0;
  const y = 0;
  const z = -1;
  quadVerts.push(x - size, y - size, z + size, 0.0, 1.0);
  quadVerts.push(x + size, y - size, z + size, 1.0, 1.0);
  quadVerts.push(x + size, y + size, z + size, 1.0, 0.0);
  quadVerts.push(x - size, y + size, z + size, 0.0, 0.0);

  vertBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadVerts), gl.STATIC_DRAW);

  quadModelMat = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);

  texture = gl.createTexture();

  const image = new Image();

  // When the image is loaded, we will copy it to the GL texture
  image.addEventListener('load', () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);

    // To avoid bad aliasing artifacts we will generate mip maps to use when rendering this texture at various distances
    gl.generateMipmap(gl.TEXTURE_2D);
    loadedCallback();
  }, false);

  // Start loading the image
  image.src = cubeImageUrl;

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
  quadModelMat[14] = z;
};

const render = (projectionMat, viewMat) => {
  gl.useProgram(quadProgram);

  gl.uniformMatrix4fv(uniforms.projectionMat, false, projectionMat);
  gl.uniformMatrix4fv(uniforms.viewMat, false, viewMat);

  gl.uniformMatrix4fv(uniforms.modelMat, false, quadModelMat);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);

  gl.enableVertexAttribArray(attribs.position);
  gl.enableVertexAttribArray(attribs.texCoord);

  gl.vertexAttribPointer(attribs.position, 3, gl.FLOAT, false, 20, 0);
  gl.vertexAttribPointer(attribs.texCoord, 2, gl.FLOAT, false, 20, 12);

  gl.activeTexture(gl.TEXTURE0);
  gl.uniform1i(uniforms.diffuse, 0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
};

const onAnimationFrame = (timestamp) => {
  // Clear the layer source - we do this outside of render to avoid clearing twice
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Update the scene once per frame
  update(timestamp);

  const viewportWidth = viewport.canvasElement.width;
  const viewportHeight = viewport.canvasElement.height;
  if (viewport.isPresenting) {
    // Left Eye
    gl.viewport(0, 0, viewportWidth * 0.5, viewportHeight);
    render(viewport.leftProjectionMatrix, viewport.leftViewMatrix);

    // Right eye
    gl.viewport(viewportWidth * 0.5, 0, viewportWidth * 0.5, viewportHeight);
    render(viewport.rightProjectionMatrix, viewport.rightViewMatrix);
  } else {
    // Monoscopic, just use left eye
    gl.viewport(0, 0, viewportWidth, viewportHeight);
    render(viewport.leftProjectionMatrix, viewport.leftViewMatrix);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initScene(() => {
    viewport.addEventListener('frame', onAnimationFrame);
  });
  document.body.insertBefore(viewport.canvasElement, document.querySelector('#enter-vr-button')); // TODO: figure out best way of placing canvas on page
});
