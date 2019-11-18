/* global dat */

"use strict";


// * Controller objects for dat.gui
// this needs to be at top of file, since the parameters are used by the rest of the app

const mouseCon = {
  SynchronizeMouse: true
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
function MaterialController() {
  this.MaterialType = PhongMatType;
  this.Emissive = '#000000';
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
                                          flatShading:false,
                                          emissive:this.Emissive,
                                          color:this.Diffuse,
                                          specular:this.Specular,
                                          shininess:this.Shininess});
    } else if(this.MaterialType === StdMatType) {
      return new THREE.MeshPhysicalMaterial({side:THREE.DoubleSide,
                                             flatShading:false,
                                             emissive:this.Emissive,
                                             color:this.Color,
                                             metalness:this.Metalness,
                                             roughness:this.Roughness});
    } else {
      throw Error(this.MaterialType + ": unknown material");
    }
  };
}
const leftMatCon = new MaterialController();
const rightMatCon = new MaterialController();


// * Setting up two renderers and two scenes for left (1) and right (2) canvases
const canv1 = document.getElementById("canv1");
const renderer1 = new THREE.WebGLRenderer({canvas:canv1,
                                           antialias:true});
renderer1.setSize(4*window.innerWidth/9, 0.9*window.innerHeight);
renderer1.setClearColor(lightCon.Background);

const canv2 = document.getElementById("canv2");
const renderer2 = new THREE.WebGLRenderer({canvas:canv2,
                                           antialias:true});
renderer2.setSize(4*window.innerWidth/9, 0.9*window.innerHeight);
renderer2.setClearColor(lightCon.Background);

const scene1 = new THREE.Scene();
const scene2 = new THREE.Scene();

// Cameras
const camera1 = new THREE.PerspectiveCamera( 75, 1, 0.1, 100);
camera1.position.set(1.5,0.8,2);
let camera2 = camera1.clone();
const controls1 = new THREE.OrbitControls(camera1, canv1);
controls1.rotateSpeed = 3.0;
let controls2 = new THREE.OrbitControls(camera2, canv2);
controls2.rotateSpeed = 3.0;

// * Light
// it is not possible to add one single light to both scenes. Therefore, we have to lights and always have to make sure
// that they have the same parameters.
const ambientLight1 = new THREE.AmbientLight(lightCon.Ambient);
const ambientLight2 = ambientLight1.clone();
scene1.add(ambientLight1);
scene2.add(ambientLight2);


const spotLight1 = new THREE.SpotLight(lightCon.SpotLight);
scene1.add(spotLight1);
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

  gui.add(mouseCon, 'SynchronizeMouse').onChange(flag => {
    if(!flag) {
      controls2 = new THREE.OrbitControls(camera2, canv2);
      controls2.rotateSpeed = 3.0;
    }
  });

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

  const leftMatFolder = gui.addFolder('Material left');
  leftMatFolder.add(leftMatCon, 'MaterialType', [PhongMatType, StdMatType]).onChange(matType => {
    teapot1UpdateMaterial();
    // this is not very elegant. How to simplify this??
    if(matType === PhongMatType) {
      leftPhongFolder.show();
      leftStdFolder.hide();
    }
    if(matType === StdMatType) {
      leftPhongFolder.hide();
      leftStdFolder.show();
    }
  });
  leftMatFolder.addColor(leftMatCon, 'Emissive').onChange(teapot1UpdateMaterial);
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

  const rightMatFolder = gui.addFolder('Material right');
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
});

//* Add teapots

const tmpMat = new THREE.MeshPhongMaterial({
  emissive:'#000000',
  color: '#ccaa40',
  specular: '#000000'});
const teapotGeo = new THREE.TeapotBufferGeometry(0.5, 10, true, true);
const teapot1 = new THREE.Mesh(teapotGeo, leftMatCon.getMat());
scene1.add(teapot1);
function teapot1UpdateMaterial() {
  teapot1.material = leftMatCon.getMat();
};

const teapot2 = new THREE.Mesh(teapotGeo, rightMatCon.getMat());
scene2.add(teapot2);
function teapot2UpdateMaterial() {
  teapot2.material = rightMatCon.getMat();
};




// * Render loop:
const computerClock = new THREE.Clock();
function render() {
  requestAnimationFrame(render);
  controls1.update(computerClock.getDelta());
  controls2.update(computerClock.getDelta());
  if(mouseCon.SynchronizeMouse) {
    camera2 = camera1.clone();
  }
  renderer1.render(scene1, camera1);
  renderer2.render(scene2, camera2);
}
render();


/**
 * update renderers and camera when window is resized.
 */
const resizeCB = function() {
  const w = 4*window.innerWidth/9;
  const h = 0.9*window.innerHeight;
  renderer1.setSize(w, h);
  renderer2.setSize(w, h);
  camera1.aspect = w/h;
  camera1.updateProjectionMatrix();
  camera2.aspect = w/h;
  camera2.updateProjectionMatrix();
};
resizeCB();
window.addEventListener("resize", resizeCB);
