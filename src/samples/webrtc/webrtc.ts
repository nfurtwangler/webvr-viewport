import * as THREE from 'three';
import { WebVRViewport, ResizeParams } from '../../webvr-viewport/webvr-viewport';
import WebVRViewportEffect from '../../webvr-viewport-three/webvr-viewport-effect';

import './webrtc.css';

declare var require: (string) => any;
const chessWorldImageUrl = require('./assets/chess-world.jpg');

class WebRTCSample {
  // WebVRViewport used for controlling the view and entering VR
  private _viewport = new WebVRViewport({
    // Default options
  });

  // Three.js Objects
  private _scene = new THREE.Scene();
  private _renderer: THREE.WebGLRenderer;
  private _effect: WebVRViewportEffect;
  private _cubeFace: THREE.Mesh;
  private _localVideoElement: HTMLVideoElement;
  private _localStream: MediaStream;
  private _remoteVideoElement: HTMLVideoElement;
  private _remoteStream: MediaStream;

  private _serverConnection: WebSocket;
  private _peerConnection: RTCPeerConnection;
  private _uuid: string;
  private _peerConnectionConfig = {
    'iceServers': [
      {'urls': 'stun:stun.services.mozilla.com'},
      {'urls': 'stun:stun.l.google.com:19302'},
    ]
  };

  constructor() {
    this._uuid = this.makeUuid();
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

    const startCallButton = document.querySelector('#start-call-button');
    startCallButton.addEventListener('click', () => {
      this.connect(true);
    });

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

    this._serverConnection = new WebSocket('ws://' + window.location.hostname + ':3000');
    this._serverConnection.onmessage = this.onServerMessage.bind(this);
  }

  load() {
    const loader = new THREE.TextureLoader();

    // Local webcam
    this._localVideoElement = document.createElement('video');
    var videoLocalTexture = new THREE.VideoTexture(this._localVideoElement);
    videoLocalTexture.minFilter = THREE.LinearFilter;
    videoLocalTexture.magFilter = THREE.LinearFilter;
    videoLocalTexture.format = THREE.RGBFormat;
    const videoLocalGeo = new THREE.PlaneGeometry(0.4, 0.4);
    const videoLocalMat = new THREE.MeshBasicMaterial({ map: videoLocalTexture });
    const videoLocalMesh = new THREE.Mesh(videoLocalGeo, videoLocalMat);
    videoLocalMesh.position.set(-0.2, 0, -1);
    this._scene.add(videoLocalMesh);
     navigator.getUserMedia({ video: true}, function (stream) {
      console.log("Local stream added.");
      this._localStream = stream;
      this._localVideoElement.srcObject = this._localStream;
    }.bind(this), function (err) {
      console.log("Could not access local video camera.");
    });

    // Remote webcam
    this._remoteVideoElement = document.createElement('video');
    var videoRemoteTexture = new THREE.VideoTexture(this._remoteVideoElement);
    videoRemoteTexture.minFilter = THREE.LinearFilter;
    videoRemoteTexture.magFilter = THREE.LinearFilter;
    videoRemoteTexture.format = THREE.RGBFormat;
    const videoRemoteGeo = new THREE.PlaneGeometry(0.4, 0.4);
    const videoRemoteMat = new THREE.MeshBasicMaterial({ map: videoRemoteTexture });
    const videoRemoteMesh = new THREE.Mesh(videoRemoteGeo, videoRemoteMat);
    videoRemoteMesh.position.set(0.2, 0, -1);
    this._scene.add(videoRemoteMesh);

    // Equirect pano image for background
    const sphereGeo = new THREE.SphereGeometry(1000, 50, 50);
    const sphereMat = new THREE.MeshBasicMaterial({ map: loader.load('./' + chessWorldImageUrl) });
    sphereGeo.scale(-1, 1, 1);
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    this._scene.add(sphere);

    // Kick off rendering
    this._viewport.addEventListener('frame', this.render.bind(this));
  }

  resize(params: ResizeParams) {
    this._effect.resize(params);
  }

  render() {
    this._effect.render(this._scene, this._viewport);
  }

  onServerMessage(message) {
    if (!this._peerConnection) {
      this.connect(false);
    }

    const signal = JSON.parse(message.data);

    // Ignore messages from ourself
    if(signal.uuid == this._uuid) return;

    if(signal.sdp) {
      this._peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
        // Only create answers in response to offers
        if(signal.sdp.type == 'offer') {
          this._peerConnection.createAnswer().then(this.createdLocalDescription.bind(this)).catch((error) => {
            console.log(error);
          });
        }
      }).catch((error) => {
        console.log(error);
      });
    } else if(signal.ice) {
      this._peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch((error) => {
        console.log(error);
      });
    }
  }

  connect(isCaller) {
    const startCallButton = document.querySelector('#start-call-button') as HTMLElement;
    startCallButton.style.display = 'none';

    console.log('Creating local peer connection object');
    this._peerConnection = new RTCPeerConnection(this._peerConnectionConfig);
    this._peerConnection.onicecandidate = (e) => {
      this.iceCandidateAdded( e.candidate);
    };
    this._peerConnection.onaddstream = (e) => {
      console.log('got remote stream');
      this._remoteStream = e.stream;
      this._remoteVideoElement.srcObject = this._remoteStream;
    };

    this._peerConnection.addStream(this._localStream);

    if (isCaller) {
      this._peerConnection.createOffer(
        this.createdLocalDescription.bind(this),
        () => {
          console.log('Failed making local peer offer');
        },
        {
          offerToReceiveVideo: 1
        }
      );
    }
  }

  createdLocalDescription(description) {
    console.log('Created Description');
    this._peerConnection.setLocalDescription(description).then(() => {
      this._serverConnection.send(JSON.stringify({'sdp': this._peerConnection.localDescription, 'uuid': this._uuid}));
    }).catch(() => {
      console.log('Failed to set local description');
    });
  }

  iceCandidateAdded(candidate) {
    console.log('Local ICE candidate added');
    if(candidate != null) {
        this._serverConnection.send(JSON.stringify({'ice': candidate, 'uuid': this._uuid}));
    }
  }

  // Taken from http://stackoverflow.com/a/105074/515584
  // Strictly speaking, it's not a real UUID, but it gets the job done here
  makeUuid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Stash on global for better debugging
  (window as any).sample = new WebRTCSample();

  // Kick off loading and rendering
  (window as any).sample.load();
});
