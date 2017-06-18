# webvr-viewport
A viewport controller for hosting WebVR content on desktop, mobile, and VR browsers.

WebVRViewport handles viewport size changes, device orientation changes, and the transition into WebVR and back while maintaining a proper aspect ratio and field of view for your scene.

WebVRViewport also enables simple click and drag support to change the viewMatrix on desktop, and a device orientation driven viewMatrix on mobile browsers.  Once in WebVR, the viewMatrix will seamless transition to being controlled by the WebVR frameData, so you can target one simple abstraction of the viewport across all three interaction modes.

It is not tied to a specific rendering engine, however WebVRViewportEffect has been included in webvr-viewport-three to make Three.js rendering as simple as possible.

The samples are hosted here to try out:

https://webvr-viewport.herokuapp.com/
