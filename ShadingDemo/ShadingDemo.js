/* global dat */

const SphereTag = "Sphere";
const BoxTag = "Box";

const shaderCon = {
  Object: SphereTag,
  Wireframe: false,
  FlatShading: false,
  FlatVertexNormals: false,
  ShowFaceNormals:false,
  ShowVertexNormals:false
};


// Initialize webGL
const canvas = document.getElementById("mycanvas");
const renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true});
renderer.context.getShaderInfoLog = function () { return '';};
renderer.setClearColor('white');    // set background color
renderer.setSize(window.innerWidth, window.innerHeight);

// Create a new Three.js scene with camera and light
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.1, 70 );
camera.position.set(0,0,2.5);
camera.lookAt(scene.position);   // camera looks at origin

window.addEventListener("resize", function(event) {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
});


const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
const spotLight = new THREE.SpotLight(0xffffff);

scene.add(spotLight);


const mat = new THREE.MeshPhongMaterial({color: 'blue',
                                         specular:'green',
                                         shininess:5,
                                         flatShading:shaderCon.FlatShading,
                                         wireframe:shaderCon.Wireframe} );

// Create sphere
const sphere = new THREE.Mesh(new THREE.SphereGeometry( 0.75, 8,8), mat);
scene.add(sphere);
// various normal vectors
const sphereFaceNormals = new THREE.FaceNormalsHelper( sphere, 0.1, 0x00ff00, 2 );
scene.add(sphereFaceNormals);
sphere.geometry.computeFlatVertexNormals();
const sphereFlatVertexNormals = new THREE.VertexNormalsHelper( sphere, 0.1, 0x00ff00, 2 );
scene.add(sphereFlatVertexNormals);
sphere.geometry.computeVertexNormals();
const sphereSmoothVertexNormals = new THREE.VertexNormalsHelper( sphere, 0.1, 0x00ff00, 2 );
scene.add(sphereSmoothVertexNormals);


// Create box
const box = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), mat);
scene.add(box);
// various normal vectors
const boxFaceNormals = new THREE.FaceNormalsHelper( box, 0.1, 0x00ff00, 2 );
scene.add(boxFaceNormals);
box.geometry.computeFlatVertexNormals();
const boxFlatVertexNormals = new THREE.VertexNormalsHelper( box, 0.15, 0x00ff00, 2 );
scene.add(boxFlatVertexNormals);
box.geometry.computeVertexNormals();
const boxSmoothVertexNormals = new THREE.VertexNormalsHelper( box, 0.15, 0x00ff00, 2 );
scene.add(boxSmoothVertexNormals);


function updateSettings() {

  if(shaderCon.Object === BoxTag) {
    box.visible = true;
    sphere.visible = false;
  } else if (shaderCon.Object === SphereTag) {
    box.visible = false;
    sphere.visible = true;
  }

  mat.flatShading = shaderCon.FlatShading;
  mat.needsUpdate = true;
  mat.wireframe = shaderCon.Wireframe;

  if(shaderCon.FlatVertexNormals) {
    sphere.geometry.computeFlatVertexNormals();
    box.geometry.computeFlatVertexNormals();
  } else {
    sphere.geometry.computeVertexNormals();
    box.geometry.computeVertexNormals();
  }

  sphereFaceNormals.visible = shaderCon.ShowFaceNormals && (shaderCon.Object === SphereTag);
  sphereFlatVertexNormals.visible = shaderCon.FlatVertexNormals && shaderCon.ShowVertexNormals && (shaderCon.Object === SphereTag);
  sphereSmoothVertexNormals.visible = (!shaderCon.FlatVertexNormals) && shaderCon.ShowVertexNormals && (shaderCon.Object === SphereTag);
  boxFaceNormals.visible = shaderCon.ShowFaceNormals && (shaderCon.Object === BoxTag);
  boxFlatVertexNormals.visible = shaderCon.FlatVertexNormals && shaderCon.ShowVertexNormals && (shaderCon.Object === BoxTag);
  boxSmoothVertexNormals.visible = (!shaderCon.FlatVertexNormals) && shaderCon.ShowVertexNormals && (shaderCon.Object === BoxTag);
}
updateSettings();

window.addEventListener("load", function() {
  const gui = new dat.GUI();

  gui.add(shaderCon, 'Object', [SphereTag, BoxTag]).onChange(updateSettings);
  gui.add(shaderCon, 'Wireframe').onChange(updateSettings);
  gui.add(shaderCon, 'FlatShading').onChange(updateSettings);
  gui.add(shaderCon, 'FlatVertexNormals').onChange(updateSettings);
  gui.add(shaderCon, 'ShowFaceNormals').onChange(updateSettings);
  gui.add(shaderCon, 'ShowVertexNormals').onChange(updateSettings);

});


// Draw everything
const controls = new THREE.TrackballControls( camera, canvas );
function render() {
  requestAnimationFrame(render);
  spotLight.position.copy(camera.position);

  controls.update();
  renderer.render(scene, camera);
}
render();
