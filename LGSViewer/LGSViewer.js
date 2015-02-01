/*global addWorldAxes, dat */

// Initialize webGL
var canvas = document.getElementById("mycanvas");
var renderer = new THREE.WebGLRenderer({canvas:canvas});
renderer.setClearColor('rgb(255,255,255)');    // set background color

// Create a new Three.js scene and a camera
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height,
                                         0.1, 1000 );
camera.position.set(8,8,8);

var planeSize = 5;
var planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
var planeCol1 = 0x505000;
var planeCol2 = 0x005050;
var planeCol3 = "rgb(200, 0, 200)"; // 0xaa00aa;
var planeMat = new THREE.MeshBasicMaterial( {color: planeCol3, side: THREE.DoubleSide} );


function createPlane(col, size) {
    size = (size === undefined ?  5 : size);

    var geometry = new THREE.PlaneGeometry(size, size);
    var material = new THREE.MeshBasicMaterial( {color: new THREE.Color(col),
                                                  side: THREE.DoubleSide} );
    var plane = new THREE.Mesh( geometry, material );

    return plane;
}


addWorldAxes(scene);
var plane1 = createPlane('rgb(200, 200, 0)');
scene.add( plane1 );
var plane2 = createPlane('rgb(200, 0, 200)');
plane2.position.z = 2;
scene.add( plane2 );
var plane3 = createPlane('rgb(0, 200, 200)');
plane3.position.z = 4;
scene.add( plane3 );




var lgsCon = {
    fov: 75
};

window.onload = function() {
   var gui = new dat.GUI();
   gui.add(lgsCon, 'fov', 45, 90);

};

var controls = new THREE.OrbitControls( camera, canvas );
function render(t) {
   requestAnimationFrame(render);
   if(t===undefined) t=0;
   t = t/1000;

   camera.fov = lgsCon.fov;
   camera.updateProjectionMatrix();

   controls.update();
   renderer.render(scene, camera);
}
render();
