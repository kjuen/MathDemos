/*global dat, THREE */

//* Initialize webGL
const canvas = document.getElementById("myCanvas");
const renderer = new THREE.WebGLRenderer({canvas:canvas});
renderer.setClearColor('rgb(255, 255, 255)');    // set background color

// Create a new Three.js scene with camera and light
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height,
                                          0.1, 1000 );
camera.position.set(20,10,20);
camera.lookAt(scene.position);

const light = new THREE.PointLight();
scene.add( light );
scene.add(new THREE.AmbientLight(0xffffff));

const DatController = function() {
  this.roll = false;
  this.reflect = true;
};
const datCrtl = new DatController();
const gui = new dat.GUI();
window.addEventListener('load', function(event) {
  event.preventDefault();
  gui.add(datCrtl, 'roll');
  gui.add(datCrtl, 'reflect');
});


//* Add floor
const floorX = 20;
const floorZ = 20;
const floorMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(floorX, floorZ, 20, 20),
                               new THREE.MeshBasicMaterial({wireframe:true,
                                                            color:0x000000,
                                                            side:THREE.DoubleSide}));
floorMesh.rotation.x = Math.PI/2;
scene.add(floorMesh);
const floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(floorX, floorZ, 20, 20),
                           new THREE.MeshBasicMaterial({wireframe:false,
                                                        color:0x505050,
                                                        side:THREE.DoubleSide}));
floor.material.transparent = true;
floor.material.opacity = 0.5;
floor.rotation.x = Math.PI/2;
scene.add(floor);

//* Add ball
const ballRadius = 2;
const ballGeo = new THREE.SphereGeometry(ballRadius, 8, 8);
const ball = new THREE.Mesh(ballGeo,  new THREE.MeshBasicMaterial( {color: 0x0000ff,
                                                                  wireframe:true}));
// initialize position
const currentPos = new THREE.Vector3(-floorX/2,  ballRadius, -floorZ/2);

scene.add(ball);
const ballSpeed = new THREE.Vector3(5*Math.random(), 0, 5*Math.random());
let rotAxis = new THREE.Vector3(0,1,0);
rotAxis.cross(ballSpeed.clone()).normalize();
let omega = ballSpeed.length()/ballRadius;
ball.matrixAutoUpdate = false;
ball.matrix.setPosition(currentPos);

//* Render loop
const computerClock = new THREE.Clock();
const controls = new THREE.TrackballControls( camera );
controls.dynamicDampingFactor = 1;
controls.rotateSpeed = 3.0;
controls.zoomSpeed = 2;
controls.panSpeed = 1;

const fricConst = 1;
function render() {
  requestAnimationFrame(render);

  const dt = computerClock.getDelta();  // must be before call to getElapsedTime, otherwise dt=0 !!!
  // Translation matrix:
  currentPos.add(ballSpeed.clone().multiplyScalar(dt));

  if(datCrtl.roll) {
    const dR = new THREE.Matrix4();
    dR.makeRotationAxis(rotAxis, omega*dt);
    ball.matrix.premultiply(dR);
    ball.matrix.setPosition(currentPos);
  } else {
    // just translation
    ball.matrix.setPosition(currentPos);
  }

  if(datCrtl.reflect) {
    if((currentPos.x + ballRadius)> floorX/2) {
      ballSpeed.x = - Math.abs(ballSpeed.x);
      ballSpeed.multiplyScalar(fricConst);
      omega = ballSpeed.length()/ballRadius;
      rotAxis = new THREE.Vector3(0,1,0);
      rotAxis.cross(ballSpeed.clone()).normalize();
    }
    if((currentPos.x - ballRadius) < -floorX/2){
      ballSpeed.x = Math.abs(ballSpeed.x);
      ballSpeed.multiplyScalar(fricConst);
      omega = ballSpeed.length()/ballRadius;
      rotAxis = new THREE.Vector3(0,1,0);
      rotAxis.cross(ballSpeed.clone()).normalize();
    }
    if((currentPos.z + ballRadius) > floorZ/2) {
      ballSpeed.z = - Math.abs(ballSpeed.z);
      ballSpeed.multiplyScalar(fricConst);
      omega = ballSpeed.length()/ballRadius;
      rotAxis = new THREE.Vector3(0,1,0);
      rotAxis.cross(ballSpeed.clone()).normalize();
    }
    if((currentPos.z - ballRadius) < -floorZ/2) {
      ballSpeed.z = Math.abs(ballSpeed.z);
      ballSpeed.multiplyScalar(fricConst);
      omega = ballSpeed.length()/ballRadius;
      rotAxis = new THREE.Vector3(0,1,0);
      rotAxis.cross(ballSpeed.clone()).normalize();
    }
  }
  controls.update();
  renderer.render(scene, camera);
}
render();
