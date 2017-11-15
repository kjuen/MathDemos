/* global dat */
"use strict";

//* Setting up renderer and scene
const canv1 = document.getElementById("canv1");
const renderer = new THREE.WebGLRenderer({canvas:canv1,
                                          antialias:true});
renderer.setSize(4*window.innerWidth/9, 0.9*window.innerHeight);
renderer.setClearColor("black");

const canv2 = document.getElementById("canv2");
const renderer2 = new THREE.WebGLRenderer({canvas:canv2,
                                           antialias:true});
renderer2.setSize(4*window.innerWidth/9, 0.9*window.innerHeight);
renderer2.setClearColor("black");


const scene = new THREE.Scene();
scene.add(new THREE.AxisHelper(2));

// main camera
const camera = new THREE.PerspectiveCamera( 75, renderer.getSize().width / renderer.getSize().height,
                                            0.1, 100);
camera.position.z = 20;



//* second camera
const camera2 = new THREE.PerspectiveCamera();
scene.add(camera2);


const camera2Ball = new THREE.Mesh(new THREE.SphereGeometry(0.1),
                                   new THREE.MeshBasicMaterial({color:'red'}));
camera2.add(camera2Ball);
const camera2Helper = new THREE.CameraHelper(camera2);
camera2Helper.material.linewidth = 2;
scene.add(camera2Helper);

//* Camera controller
const camCon = {
  fov: 60,
  near: 1,
  far: 10,
  pos: {x: 10, y: 0, z: 0},
  lookat: {x: 0, y: 0, z: 0},
  up: {x: 0, y: 1, z: 0},
  aspect: renderer2.getSize().width / renderer2.getSize().height
};

function updateCam() {
  camera2.fov = camCon.fov;
  camera2.near = camCon.near;
  camera2.far = camCon.far;
  camera2.aspect = camCon.aspect;
  camera2.position.copy(new THREE.Vector3(camCon.pos.x, camCon.pos.y, camCon.pos.z));
  camera2.lookAt(new THREE.Vector3(camCon.lookat.x, camCon.lookat.y, camCon.lookat.z));
  camera2.up.copy(new THREE.Vector3(camCon.up.x, camCon.up.y, camCon.up.z));
  // Necessary, because mouse control internally calls camera2.lookAt
  // controls.target.set(camCon.x, camCon.y, camCon.z);
  camera2.updateProjectionMatrix();
  camera2Helper.update();
}
updateCam();


window.addEventListener("load", function() {
  const gui = new dat.GUI();
  gui.add(camCon, 'fov', 25, 120).onChange(updateCam);
  gui.add(camCon, 'aspect', 0.5,1.5).onChange(updateCam);
  gui.add(camCon, 'near', 0.1, 5).onChange(updateCam);
  gui.add(camCon, 'far', 5, 25).onChange(updateCam);
  const pos = gui.addFolder('Position');
  pos.add(camCon.pos, 'x', -20, 20).onChange(updateCam);
  pos.add(camCon.pos, 'y', -20, 20).onChange(updateCam);
  pos.add(camCon.pos, 'z', -20, 20).onChange(updateCam);
  const lookAt = gui.addFolder('Look at');
  lookAt.add(camCon.lookat, 'x', -20, 20).onChange(updateCam);
  lookAt.add(camCon.lookat, 'y', -20, 20).onChange(updateCam);
  lookAt.add(camCon.lookat, 'z', -20, 20).onChange(updateCam);
  const up = gui.addFolder('Up');
  up.add(camCon.up, 'x', -5, 5).onChange(updateCam);
  up.add(camCon.up, 'y', -5, 5).onChange(updateCam);
  up.add(camCon.up, 'z', -5, 5).onChange(updateCam);
});


/**
 * update renderers and first camera when window is resized. Second camera isn't resized updated,
 * since its parameters are controlled by dat.gui
 */
window.addEventListener("resize", function() {
  renderer.setSize(4*window.innerWidth/9, 0.9*window.innerHeight);
  renderer2.setSize(4*window.innerWidth/9, 0.9*window.innerHeight);
  camera.aspect = renderer.getSize().width / renderer.getSize().height;
  camera.updateProjectionMatrix();
});




//* Adding light
const ambientLight = new THREE.AmbientLight('#404040');
scene.add(ambientLight);

const spotLight = new THREE.SpotLight('#ffffff');
spotLight.position.z = 10;
scene.add(spotLight);



//* Place some objects
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.75, 32, 32),
                              new THREE.MeshPhongMaterial({color: '#ccaa40',
                                                           specular: '#aa4040'}));
sphere.position.set(3,3,3);
scene.add(sphere);

const cube = new THREE.Mesh(new THREE.BoxGeometry(1,1,1),
                            new THREE.MeshPhongMaterial({color: '#ccff10',
                                                         specular: '#0000ff'}));
cube.position.set(-1,-3,2);
scene.add(cube);


//* Mouse control and render loop
const computerClock = new THREE.Clock();
const controls = new THREE.OrbitControls(camera, canv1);
controls.rotateSpeed = 3.0;
function render() {
  requestAnimationFrame(render);

  controls.update(computerClock.getDelta());
  // controls2.update(computerClock.getDelta());
  renderer.render(scene, camera);
  renderer2.render(scene, camera2);
}
render();
