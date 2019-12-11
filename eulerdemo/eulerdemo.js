/*global dat */
// Euler angle demo

"use strict";

import * as THREE from "../lib/build/three.module.js";
import {OrbitControls} from "../lib/examples/jsm/controls/OrbitControls.js";

//* Initialize webGL with camera and lights
const canvas = document.getElementById("mycanvas");
const renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor('rgb(255,255,255)');
// create scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight,
                                           0.1, 1000);
camera.position.x = 100;
camera.position.y = 250;
camera.position.z = 100;

const ambientLight = new THREE.AmbientLight(0x909090);
scene.add(ambientLight);
const light = new THREE.DirectionalLight(0x444444);
light.position.set( 1.5,1,1 );
scene.add(light);

//* Helper functions
function addWorldAxes(parent, opts) {

  if(opts.len===undefined) opts.len = 1.5;
  if(opts.thick===undefined) opts.thick = opts.len/100;
  if(opts.highlight===undefined) opts.highlight = 'A';
  const blackMat = new THREE.MeshBasicMaterial({color: 'rgb(100, 100, 100)'});
  blackMat.transparent = true;
  blackMat.opacity = 0.5;
  const redMat = new THREE.MeshBasicMaterial({color: 'red'});
  const greenMat = new THREE.MeshBasicMaterial({color: 'green'});
  const blueMat = new THREE.MeshBasicMaterial({color: 'blue'});
  const axisGeo = new THREE.CylinderGeometry(opts.thick, opts.thick, opts.len, 48);
  // const axis = new THREE.Mesh(axisGeo, blackMat);
  const headGeo = new THREE.CylinderGeometry(0, 3*opts.thick, 3*opts.thick, 48);

  const xAxis = new THREE.Object3D();
  let ax = opts.highlight.toLowerCase() === 'x' ?
      new THREE.Mesh(axisGeo, redMat) : new THREE.Mesh(axisGeo, blackMat);
  xAxis.add(ax);
  let head = new THREE.Mesh(headGeo, redMat);
  head.position.y = opts.len/2+opts.thick;
  xAxis.add(head);
  xAxis.rotation.z = -Math.PI/2;
  xAxis.position.x = opts.len/6;
  parent.add(xAxis);

  const yAxis = new THREE.Object3D();
  ax = opts.highlight.toLowerCase() === 'y' ?
    new THREE.Mesh(axisGeo, greenMat) : new THREE.Mesh(axisGeo, blackMat);
  yAxis.add(ax);
  head = new THREE.Mesh(headGeo, greenMat);
  head.position.y = opts.len/2+opts.thick;
  yAxis.add(head);
  yAxis.position.y=opts.len/6;
  parent.add(yAxis);


  const zAxis = new THREE.Object3D();
  ax = opts.highlight.toLowerCase() === 'z' ?
    new THREE.Mesh(axisGeo, blueMat) : new THREE.Mesh(axisGeo, blackMat);
  zAxis.add(ax);
  head = new THREE.Mesh(headGeo, blueMat);
  head.position.y = opts.len/2+opts.thick;
  zAxis.add(head);
  zAxis.rotation.x = Math.PI/2;
  zAxis.position.z = opts.len/6;
  parent.add(zAxis);
}


function createRingGeo(N) {

  const innerRadius = 100;
  const outerRadius = 110;

  if(N===undefined) N = 96;
  const ringGeo = new THREE.Geometry();
  ringGeo.vertices = new Array(2*N);
  const deltaPhi = 2*Math.PI/N;
  for(let k=0; k<N; ++k) {
    ringGeo.vertices[2*k] = new THREE.Vector3(innerRadius*Math.cos(k*deltaPhi),
                                              innerRadius*Math.sin(k*deltaPhi),
                                              0);
    ringGeo.vertices[2*k+1] = new THREE.Vector3(outerRadius*Math.cos(k*deltaPhi),
                                                outerRadius*Math.sin(k*deltaPhi),
                                                0);
  }
  ringGeo.faces = new Array(2*N);
  for(let k=0; k<N; ++k) {
    ringGeo.faces[2*k] = new THREE.Face3(2*k, 2*k+1, (2*k+2)%(2*N));
    ringGeo.faces[2*k+1] = new THREE.Face3(2*k+1, (2*k+3)%(2*N), (2*k+2)%(2*N));
  }
  ringGeo.computeFaceNormals();
  ringGeo.computeVertexNormals();

  ringGeo.faceVertexUvs = new Array(1);   // just one uv map
  ringGeo.faceVertexUvs[0] = new Array(ringGeo.faces.length);   // each face has a uv-map
  for(let k=0; k<N; ++k) {
    ringGeo.faceVertexUvs[0][2*k] = new Array(3);
    ringGeo.faceVertexUvs[0][2*k][0] = new THREE.Vector2(1,k/N);
    ringGeo.faceVertexUvs[0][2*k][1] = new THREE.Vector2(0,k/N);
    ringGeo.faceVertexUvs[0][2*k][2] = new THREE.Vector2(1,((k+1)%N)/N);
    ringGeo.faceVertexUvs[0][2*k+1] = new Array(3);
    ringGeo.faceVertexUvs[0][2*k+1][0] = new THREE.Vector2(0,k/N);
    ringGeo.faceVertexUvs[0][2*k+1][1] = new THREE.Vector2(0,((k+1)%N)/N);
    ringGeo.faceVertexUvs[0][2*k+1][2] = new THREE.Vector2(1,((k+1)%N)/N);
  }

  return ringGeo;
}

function xyzToCol(letter) {
  letter = letter.toLowerCase();
  if(letter === 'x') return new THREE.Color('rgb(255,0,0)');
  else if(letter === 'y') return new THREE.Color('rgb(0,255,0)');
  else if(letter === 'z') return new THREE.Color('rgb(0,0, 255)');
  else {
    throw "Wrong rotation: " + letter;
  }
}




// create plane
const planeMaterial = new THREE.MeshPhongMaterial( { color: 0x95E4FB, specular: 0x505050, shininess: 100 } );

const airplane = new THREE.Object3D();

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry( 15, 32, 16 ), planeMaterial );
// nose
sphere.rotation.x = 90 * Math.PI/180;
sphere.scale.y = 3.0;
sphere.position.y = 0;
sphere.position.z = 70;
airplane.add( sphere );

let cylinder = new THREE.Mesh(
  new THREE.CylinderGeometry( 15, 15, 180, 32 ), planeMaterial );
// body
cylinder.rotation.x = 90 * Math.PI/180;
cylinder.position.y = 0;
cylinder.position.z = -20;
airplane.add( cylinder );

cylinder = new THREE.Mesh(
  new THREE.CylinderGeometry( 20, 20, 250, 32 ), planeMaterial );
// wing
cylinder.scale.x = 0.2;
cylinder.rotation.z = 90 * Math.PI/180;
cylinder.position.y = 5;
airplane.add( cylinder );

cylinder = new THREE.Mesh(
  new THREE.CylinderGeometry( 15, 15, 100, 32 ), planeMaterial );
// tail wing
cylinder.scale.x = 0.2;
cylinder.rotation.z = 90 * Math.PI/180;
cylinder.position.y = 5;
cylinder.position.z = -90;
airplane.add( cylinder );

cylinder = new THREE.Mesh(
  new THREE.CylinderGeometry( 10, 15, 40, 32 ), planeMaterial );
// tail
cylinder.scale.x = 0.15;
cylinder.rotation.x = -10 * Math.PI/180;
cylinder.position.y = 20;
cylinder.position.z = -96;
airplane.add( cylinder );
scene.add( airplane );


//* Coordinates systems
//* dat.gui
const guiData = {
  X:0,
  Y:0,
  Z:0,
  Order: 'XYZ',
  WorldCoordinates:false,
  PrimedCoordinates:false,
  BodyCoordinates:false,
  Plane:true
};
const d2r = function(d) {return d*Math.PI/180;};

let worldCoords;
let rotPlaneWorld;
let primedCoords;
let rotPlanePrimed;
let bodyCoords;
let rotPlaneBody;

function createCoords() {

  const rotPlaneGeo = createRingGeo(); // new THREE.PlaneGeometry(100, 100);
  const rotPlaneMat = new THREE.MeshBasicMaterial( {side: THREE.DoubleSide} );
  rotPlaneMat.transparent = true;
  rotPlaneMat.opacity =0.35;
  const coords = new THREE.Object3D();

  worldCoords = new THREE.Object3D();
  worldCoords.visible = guiData.WorldCoordinates;
  addWorldAxes(worldCoords, {len:150, highlight:guiData.Order[0]});
  coords.add(worldCoords);
  rotPlaneWorld = new THREE.Mesh(rotPlaneGeo, rotPlaneMat.clone());
  rotPlaneWorld.material.color = xyzToCol(guiData.Order[0]);
  worldCoords.add(rotPlaneWorld);

  primedCoords = new THREE.Object3D();
  primedCoords.visible = guiData.PrimedCoordinates;
  coords.add(primedCoords);
  addWorldAxes(primedCoords, {len:125, highlight:guiData.Order[1]});
  rotPlanePrimed = new THREE.Mesh(rotPlaneGeo, rotPlaneMat.clone());
  rotPlanePrimed.material.color = xyzToCol(guiData.Order[1]);
  primedCoords.add(rotPlanePrimed);

  bodyCoords = new THREE.Object3D();
  bodyCoords.visible = guiData.BodyCoordinates;
  coords.add(bodyCoords);
  addWorldAxes(bodyCoords, {len:75, highlight:guiData.Order[2]});
  rotPlaneBody = new THREE.Mesh(rotPlaneGeo, rotPlaneMat);
  rotPlaneMat.color = xyzToCol(guiData.Order[2]);
  bodyCoords.add(rotPlaneBody);

  return coords;
}
let coords = createCoords();
scene.add(coords);

function orderPlanes(newOrd) {
  if(newOrd[0] === 'X') {
    rotPlaneWorld.rotation.y = Math.PI/2;
    primedCoords.rotation.x = bodyCoords.rotation.x;
    rotPlanePrimed.rotation.x = Math.PI/2;
  }
  else if(newOrd[0] === 'Y') {
    rotPlaneWorld.rotation.x = Math.PI/2;
    primedCoords.rotation.y = bodyCoords.rotation.y;
  }
  else if(newOrd[0] === 'Z') {
    primedCoords.rotation.z = bodyCoords.rotation.z;
  }
}
orderPlanes(guiData.Order);


// window.onload = function() {
window.addEventListener("load",function() {
  const gui = new dat.GUI();
  gui.add(guiData, 'X', -180, 180).step(1);
  gui.add(guiData, 'Y', -180, 180).step(1);
  gui.add(guiData, 'Z', -180, 180).step(1);
  const ord = gui.add(guiData, 'Order', [ 'XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX' ]);
  ord.onChange(function(newOrd) {
    scene.remove(coords);
    coords = createCoords();
    scene.add(coords);
    worldCoords.rotation.order = newOrd;
    primedCoords.rotation.order = newOrd;
    bodyCoords.rotation.order = newOrd;

    orderPlanes(newOrd);
  });
  const wccheck = gui.add(guiData, 'WorldCoordinates');
  wccheck.onChange(function(value) {
    worldCoords.visible = value;
  });
  const pccheck = gui.add(guiData, 'PrimedCoordinates');
  pccheck.onChange(function(value) {
    primedCoords.visible = value;
  });
  const bccheck = gui.add(guiData, 'BodyCoordinates');
  bccheck.onChange(function(value) {
    bodyCoords.visible = value;
  });
  const planecheck = gui.add(guiData, 'Plane');
  planecheck.onChange(function(value) {
    airplane.visible = value;
  });
});

//* Render loop
const controls = new OrbitControls( camera, canvas );
controls.zoomSpeed = 1/2;

function render() {
  requestAnimationFrame(render);

  // rotation of body coordinates:
  bodyCoords.rotation.x = d2r(guiData.X);
  bodyCoords.rotation.y = d2r(guiData.Y);
  bodyCoords.rotation.z = d2r(guiData.Z);
  airplane.rotation.copy(bodyCoords.rotation.clone());

  // The primed coordinate systems just does the rotation w.r.t. the world frame:
  if(guiData.Order[0] === 'X') primedCoords.rotation.x = d2r(guiData.X);
  if(guiData.Order[0] === 'Y') primedCoords.rotation.y = d2r(guiData.Y);
  if(guiData.Order[0] === 'Z') primedCoords.rotation.z = d2r(guiData.Z);

  controls.update();
  renderer.render(scene, camera);
}

render();
