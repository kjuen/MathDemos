/* global dat */

"use strict";

import * as THREE from "../lib/build/three.module.js";
import {OrbitControls} from "../lib/examples/jsm/controls/OrbitControls.js";
import {TeapotBufferGeometry} from "../lib/examples/jsm/geometries/TeapotBufferGeometry.js";


// * Controller objects for dat.gui
// this needs to be at top of file, since the parameters are used by the rest of the app

const mouseCon = {
  SyncMouse: true
};

const lightCon = {
  Background: '#000000',
  Ambient: '#505050',
  SpotLight: '#ffffff',
  ShowLightBulb: false,

  // Light position
  R: 2.5,
  Theta: 0,
  Phi: 0,
  getPos() {
    return new THREE.Vector3(this.R*Math.sin(this.Theta)*Math.cos(this.Phi),
                             this.R*Math.sin(this.Theta)*Math.sin(this.Phi),
                             this.R*Math.cos(this.Theta));
  }
};


const PhongMatType = 'Phong Material';
const StdMatType = 'Standard Material';
const LambertMatType = 'Lambert Material';
function MaterialController() {
  this.MaterialType = PhongMatType;
  this.Emissive = '#000000';
  this.flatShading = false,
  this.wireframe = false,
  // Phong Material Parameter
  this.Diffuse = '#ccaa40';
  this.Specular = '#000000';
  this.Shininess = 5;

  // Standard Material Parameter
  this.Color= '#ccaa40';
  this.Metalness= 0.5;
  this.Roughness= 0.5;

  this.getMat = function() {
    if(this.MaterialType === PhongMatType) {
      return new THREE.MeshPhongMaterial({side:THREE.DoubleSide,
                                          flatShading:this.flatShading,
                                          emissive:this.Emissive,
                                          color:this.Diffuse,
                                          specular:this.Specular,
                                          shininess:this.Shininess,
                                          wireframe:this.wireframe});
    } else if(this.MaterialType === StdMatType) {
      return new THREE.MeshPhysicalMaterial({side:THREE.DoubleSide,
                                             flatShading:this.flatShading,
                                             emissive:this.Emissive,
                                             color:this.Color,
                                             metalness:this.Metalness,
                                             roughness:this.Roughness,
                                             wireframe:this.wireframe});
    } else if(this.MaterialType === LambertMatType) {
      return new THREE.MeshLambertMaterial({side:THREE.DoubleSide,
                                            flatShading:false,
                                            emissive:this.Emissive,
                                            color:this.Diffuse});
    } else {
      throw Error(this.MaterialType + ": unknown material");
    }
  };
}
const leftMatCon = new MaterialController();
leftMatCon.ShowSecondCanvas = false;
const rightMatCon = new MaterialController();

const shadowCon = {
  ShowShadow: false,
  ShadowCamera: false,
  SecondShadowPlane: false,
  MapSizeExp: 8
};

// * Setting up two renderers and two scenes for left (1) and right (2) canvases

let singleCanvHeight = 0.9*window.innerHeight;
let singleCanvWidth = 0.4*window.innerWidth;

const canvTable = document.getElementById("canvTable");
const tdLeft = document.createElement("td");
canvTable.appendChild(tdLeft);
const tdRight = document.createElement("td");

const renderer1 = new THREE.WebGLRenderer({antialias:true});
tdLeft.appendChild( renderer1.domElement );
renderer1.setClearColor(lightCon.Background);

const renderer2 = new THREE.WebGLRenderer({antialias:true});
tdRight.appendChild( renderer2.domElement );
renderer2.setClearColor(lightCon.Background);

const scene1 = new THREE.Scene();
const scene2 = new THREE.Scene();

// Cameras
const camera1 = new THREE.PerspectiveCamera( 75, singleCanvWidth / singleCanvHeight, 0.1, 100);
camera1.position.set(1.5,0.8,2);
let camera2 = camera1.clone();
const controls1 = new OrbitControls(camera1,renderer1.domElement );
controls1.rotateSpeed = 3.0;
let controls2 = new OrbitControls(camera2, renderer2.domElement);
controls2.rotateSpeed = 3.0;


function updateCanvSize() {
  if(canvTable.children.length === 1) {
    renderer1.setSize(2 * singleCanvWidth, singleCanvHeight);
    camera1.aspect = 2 * singleCanvWidth / singleCanvHeight;
    camera1.updateProjectionMatrix();
  } else if(canvTable.children.length === 2) {
    renderer1.setSize(singleCanvWidth, singleCanvHeight);
    camera1.aspect = singleCanvWidth / singleCanvHeight;
    camera1.updateProjectionMatrix();
    renderer2.setSize(singleCanvWidth, singleCanvHeight);
    camera2.aspect = singleCanvWidth / singleCanvHeight;
    camera2.updateProjectionMatrix();
  }
}
updateCanvSize();



function addRightCanvas() {
  if(canvTable.children.length === 1) {
    canvTable.appendChild(tdRight);
  }
  updateCanvSize();
}

function removeRightCanvas() {
  if(canvTable.children.length === 2) {
    canvTable.removeChild(tdRight);
  }
  updateCanvSize();
}

window.addEventListener("resize", () => {
  singleCanvHeight = 0.9*window.innerHeight;
  singleCanvWidth = 0.4*window.innerWidth;
  updateCanvSize();
});



// * Light
// it is not possible to add one single light to both scenes. Therefore, we have to lights and always have to make sure
// that they have the same parameters.
const ambientLight1 = new THREE.AmbientLight(lightCon.Ambient);
const ambientLight2 = ambientLight1.clone();
scene1.add(ambientLight1);
scene2.add(ambientLight2);


const spotLight1 = new THREE.SpotLight(lightCon.SpotLight);
scene1.add(spotLight1);
spotLight1.castShadow = true;
spotLight1.shadow.camera.near = 0.1;
spotLight1.shadow.camera.fov = 60;
spotLight1.shadow.camera.far =100;
// number of shadow 'pixels'
spotLight1.shadow.mapSize.width = 2**shadowCon.MapSizeExp;
spotLight1.shadow.mapSize.height = 2**shadowCon.MapSizeExp;
const shadowCamHelper = new THREE.CameraHelper(spotLight1.shadow.camera);
shadowCamHelper.material.linewidth = 2;
scene1.add(shadowCamHelper);

const spotLight2 = spotLight1.clone();
scene2.add(spotLight2);

const lightBulb1 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16),
                                  new THREE.MeshLambertMaterial({color:'#000000',
                                                                 emissive:'#ffff00'}));
lightBulb1.visible = lightCon.ShowLightBulb;
const lightBulb2 = lightBulb1.clone();
scene1.add(lightBulb1);
scene2.add(lightBulb2);

function lightPosCB() {
  spotLight1.position.copy(lightCon.getPos());
  lightBulb1.position.copy(spotLight1.position);
  spotLight2.position.copy(lightCon.getPos());
  lightBulb2.position.copy(spotLight2.position);
}
lightPosCB();


// * dat.GUI
window.addEventListener("load", function() {
  const gui = new dat.GUI();



  gui.addColor(lightCon, 'Background').onChange(c => {
    renderer1.setClearColor(c);
    renderer2.setClearColor(c);
  });
  const lightFolder = gui.addFolder('Light');
  lightFolder.addColor(lightCon, 'Ambient').onChange(c => {
    ambientLight1.color = new THREE.Color(c);
    ambientLight2.color = new THREE.Color(c);
  });
  lightFolder.addColor(lightCon, 'SpotLight').onChange(c => {
    spotLight1.color = new THREE.Color(c);
    spotLight2.color = new THREE.Color(c);
  });
  lightFolder.add(lightCon, 'R', 0, 5).onChange(lightPosCB);
  lightFolder.add(lightCon, 'Theta', 0, Math.PI).onChange(lightPosCB);
  lightFolder.add(lightCon, 'Phi', 0, 2*Math.PI).onChange(lightPosCB);
  lightFolder.add(lightCon, 'ShowLightBulb').onChange(flag => {
    lightBulb1.visible = flag;
    lightBulb2.visible = flag;
  });

  const leftMatFolder = gui.addFolder('Material');
  leftMatFolder.add(leftMatCon, 'MaterialType', [PhongMatType, StdMatType, LambertMatType]).onChange(matType => {
    teapot1UpdateMaterial();
    // this is not very elegant. How to simplify this??
    if(matType === PhongMatType) {
      leftPhongFolder.show();
      leftStdFolder.hide();
      leftLambertFolder.hide();
    }
    if(matType === StdMatType) {
      leftPhongFolder.hide();
      leftStdFolder.show();
      leftLambertFolder.hide();
    }
    if(matType === LambertMatType) {
      leftPhongFolder.hide();
      leftStdFolder.hide();
      leftLambertFolder.show();
    }
  });
  leftMatFolder.addColor(leftMatCon, 'Emissive').onChange(teapot1UpdateMaterial);
  leftMatFolder.add(leftMatCon, 'flatShading').onChange(teapot1UpdateMaterial);
  leftMatFolder.add(leftMatCon, 'wireframe').onChange(teapot1UpdateMaterial);
  const leftPhongFolder = leftMatFolder.addFolder(PhongMatType);
  leftPhongFolder.addColor(leftMatCon, 'Diffuse').onChange(teapot1UpdateMaterial);
  leftPhongFolder.addColor(leftMatCon, 'Specular').onChange(teapot1UpdateMaterial);
  leftPhongFolder.add(leftMatCon, 'Shininess', 0, 100).onChange(teapot1UpdateMaterial);
  if(leftMatCon.MaterialType !== PhongMatType) {
    leftPhongFolder.hide();
  }
  const leftStdFolder = leftMatFolder.addFolder(StdMatType);
  leftStdFolder.addColor(leftMatCon, 'Color').onChange(teapot1UpdateMaterial);
  leftStdFolder.add(leftMatCon, 'Metalness', 0, 1).onChange(teapot1UpdateMaterial);
  leftStdFolder.add(leftMatCon, 'Roughness', 0, 1 ).onChange(teapot1UpdateMaterial);
  if(leftMatCon.MaterialType !== StdMatType) {
    leftStdFolder.hide();
  }
  const leftLambertFolder = leftMatFolder.addFolder(LambertMatType);
  leftLambertFolder.addColor(leftMatCon, 'Diffuse').onChange(teapot1UpdateMaterial);
  if(leftMatCon.MaterialType !== LambertMatType) {
    leftLambertFolder.hide();
  }

  gui.add(leftMatCon, 'ShowSecondCanvas').onChange(flag => {
    if(flag) {
      addRightCanvas();
      rightMatFolder.show();
    } else {
      removeRightCanvas();
      rightMatFolder.hide();
    }
  });



  const rightMatFolder = gui.addFolder('Second Canvas');
  rightMatFolder.hide();
  rightMatFolder.add(mouseCon, 'SyncMouse').onChange(flag => {
    if(!flag) {
      controls2 = new OrbitControls(camera2, renderer2.domElement);
      controls2.rotateSpeed = 3.0;
    }
  });

  rightMatFolder.add(rightMatCon, 'MaterialType', [PhongMatType, StdMatType]).onChange(matType => {
    teapot2UpdateMaterial();
    // this is not very elegant. How to simplify this??
    if(matType === PhongMatType) {
      rightPhongFolder.show();
      rightStdFolder.hide();
    }
    if(matType === StdMatType) {
      rightPhongFolder.hide();
      rightStdFolder.show();
    }
  });

  rightMatFolder.addColor(rightMatCon, 'Emissive').onChange(teapot2UpdateMaterial);
  const rightPhongFolder = rightMatFolder.addFolder(PhongMatType);
  rightPhongFolder.addColor(rightMatCon, 'Diffuse').onChange(teapot2UpdateMaterial);
  rightPhongFolder.addColor(rightMatCon, 'Specular').onChange(teapot2UpdateMaterial);
                        rightPhongFolder.add(rightMatCon, 'Shininess', 0, 100).onChange(teapot2UpdateMaterial);
  if(rightMatCon.MaterialType !== PhongMatType) {
    rightPhongFolder.hide();
  }
  const rightStdFolder = rightMatFolder.addFolder(StdMatType);
  rightStdFolder.addColor(rightMatCon, 'Color').onChange(teapot2UpdateMaterial);
  rightStdFolder.add(rightMatCon, 'Metalness', 0, 1).onChange(teapot2UpdateMaterial);
  rightStdFolder.add(rightMatCon, 'Roughness', 0, 1 ).onChange(teapot2UpdateMaterial);
  if(rightMatCon.MaterialType !== StdMatType) {
    rightStdFolder.hide();
  }

  gui.add(shadowCon, 'ShowShadow').onChange(flag => {
    flag ? shadowFolder.show() : shadowFolder.hide();
    updateShadowFlags();
  });

  const shadowFolder = gui.addFolder('Shadow');
  shadowFolder.hide();
  shadowFolder.add(shadowCon, 'ShadowCamera').onChange(updateShadowFlags);
  // Updating mapsize doesn't work. How to fix this?
  // shadowFolder.add(shadowCon, 'MapSizeExp', 6, 10).step(1).onChange(exp=> {
  //   const ms = 2**exp;
  //   console.log('ms=', ms);

  //   spotLight1.shadow.mapSize.x = ms;
  //   spotLight1.shadow.mapSize.y = ms;
  //   renderer1.shadowMap.needsUpdate = true;
  //   spotLight1.shadow.camera.updateProjectionMatrix();
  //   spotLight1.shadow.updateMatrices(spotLight1);
  // });
  shadowFolder.add(shadowCon, 'SecondShadowPlane').onChange(updateShadowFlags);
});

//* Add teapots
const teapotGeo = new TeapotBufferGeometry(0.5, 10, true, true);
const teapot1 = new THREE.Mesh(teapotGeo, leftMatCon.getMat());
teapot1.castShadow = true;
scene1.add(teapot1);
function teapot1UpdateMaterial() {
  teapot1.material = leftMatCon.getMat();
}

const teapot2 = new THREE.Mesh(teapotGeo, rightMatCon.getMat());
scene2.add(teapot2);
function teapot2UpdateMaterial() {
  teapot2.material = rightMatCon.getMat();
}

// transparent ground plane for shadows
const col = new THREE.Color(1,1,1);   // white
const ground = new THREE.Mesh(new THREE.PlaneGeometry(8,8),
                              new THREE.MeshPhongMaterial({side: THREE.DoubleSide,
                                                           color:col}));
ground.position.z = -2;
ground.receiveShadow=true;
scene1.add(ground);

// Another shadow receiving plane
const gr2 = ground.clone();
gr2.position.z = -10;
scene1.add(gr2);

// turn on, off all shadow functionality
function updateShadowFlags() {
  renderer1.shadowMap.enabled=shadowCon.ShowShadow;  // shadow only on left canvas
  shadowCamHelper.visible=shadowCon.ShadowCamera;
  ground.visible = shadowCon.ShowShadow;
  gr2.visible = shadowCon.SecondShadowPlane;
}
updateShadowFlags();



// * Render loop:
const computerClock = new THREE.Clock();
function render() {
  requestAnimationFrame(render);
  controls1.update(computerClock.getDelta());
  controls2.update(computerClock.getDelta());
  if(mouseCon.SyncMouse) {
    camera2 = camera1.clone();
  }
  renderer1.render(scene1, camera1);
  renderer2.render(scene2, camera2);
}
render();
