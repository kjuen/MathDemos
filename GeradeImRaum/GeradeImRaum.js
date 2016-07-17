/*global dat, THREE */

// TODO: Pfeilspietze endet nicht genau am gewuenschten Punkt.

//* Initialize webGL
var renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
renderer.setClearColor('black');    // set background color

// Create a new Three.js scene and a camera
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight,
                                          0.1, 1000 );
camera.position.set(5,5,5);
window.addEventListener('resize', function() {
  renderer.setSize( window.innerWidth, window.innerHeight );
  camera.aspect= window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}, false);


// In render loop, position is set to camera position
var light = new THREE.PointLight( 0xffffff );
scene.add( light );
scene.add(new THREE.AmbientLight(0xaaaaaa));



//* General helper functions
var makeTextLabel = function( message, fontsize, col )
{
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  context.font = "Bold " + fontsize + "px Arial";

  // get size data (height depends only on font size)
  context.fillStyle = col.getStyle();
  context.fillText( message, fontsize, fontsize);

  // canvas contents will be used for a texture
  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  var spriteMaterial = new THREE.SpriteMaterial({ map: texture});
  var sprite = new THREE.Sprite( spriteMaterial );
  return sprite;
};


/**
 * create an arrow pointing into y direction
 */
function createTubeArrow(opts) {
  // set defaults
  opts = opts || {};
  opts.len = opts.len || 1;
  opts.thick = opts.thick || 1/50;
  opts.col = opts.col || new THREE.Color('darkslategray');
  if(opts.head === undefined) opts.head = true;

  var mat = new THREE.MeshPhongMaterial({color: opts.col,
                                         specular: opts.col,
                                         side:THREE.DoubleSide});
  var tubeGeo = new THREE.CylinderGeometry(opts.thick, opts.thick, opts.len, 32);
  var tube = new THREE.Mesh(tubeGeo, mat);
  tube.position.y = opts.len/2;
  var axis = new THREE.Object3D();
  axis.add(tube);
  if(opts.head) {
    var headGeo = new THREE.CylinderGeometry(0, 3*opts.thick, 6*opts.thick, 32);
    var head = new THREE.Mesh(headGeo, mat);
    head.position.y = opts.len+opts.thick;
    axis.add(head);
  }
  if(opts.label !== undefined) {
    opts.labelSize = opts.labelSize || 48;
    var sprite = makeTextLabel(opts.label, opts.labelSize, opts.col);
    sprite.position.y = opts.len;
    axis.add( sprite );
  }
  return axis;
}

//* Die Vektorpfeile a und b und der Punkt r(t)
function Vektor(vec, opts) {
  this.vec = vec;
  opts.len = vec.length();
  this.opts = opts;
  this.arrow = createTubeArrow(opts);
  scene.add(this.arrow);
  this.mat = new THREE.Matrix4();
}

Vektor.prototype.update = function(pos) {
  this.opts.len = this.vec.length();
  scene.remove(this.arrow);
  var rotAxis = new THREE.Vector3(this.vec.z, 0, -this.vec.x).normalize();
  var rotAngle = Math.acos(this.vec.y / this.vec.length());
  this.mat.makeRotationAxis(rotAxis, rotAngle);
  if(pos !== undefined) {
    this.mat.setPosition(pos);
  }
  this.arrow = createTubeArrow(this.opts);
  this.arrow.applyMatrix(this.mat);
  scene.add(this.arrow);
};

var aVek = new Vektor(new THREE.Vector3(1,2,2), {thick:1/50, col:0x3030aa});
aVek.update();
var bVek = new Vektor(new THREE.Vector3(2,-1,0.1), {thick:1/50, col:0x30aa30});
bVek.update(aVek.vec);


// Die eigentliche Gerade
function createGerade() {
  var gerade = new THREE.Mesh(new THREE.CylinderGeometry(1/75, 1/75, 100, 64),
                              new THREE.MeshPhongMaterial({color: 0x801010,
                                                           specular: 0x801010}));
  gerade.applyMatrix(bVek.mat);
  return gerade;
}
var gerade = createGerade();
scene.add(gerade);

// Ein Punkt auf der Gerade
var pkt = new THREE.Mesh(new THREE.SphereGeometry (0.05, 16, 16),
                         new THREE.MeshPhongMaterial({color:0xaa2020,
                                                      specular:0xaa2020,
                                                      shininess:5}));
pkt.t = 0.5;
pkt.position.copy(aVek.vec.clone().add(bVek.vec.clone().multiplyScalar(pkt.t)));
scene.add(pkt);



//* Add x,y,z coordinate axes to scene
function createWorldAxes(scene, len, thick) {

  if(len===undefined) len = 3;
  if(thick===undefined) thick = 1/50;
  var labelSize = 48;
  var col = new THREE.Color(0x303030);

  var worldAxes = new THREE.Object3D();
  var yAxis = createTubeArrow({len: len, thick: thick, col: col,
                               label: 'y', labelSize: labelSize});
  yAxis.position.y=-len/3;
  worldAxes.add(yAxis);

  var zAxis = createTubeArrow({len: len, thick: thick, col: col,
                               label: 'z', labelSize: labelSize});
  zAxis.rotation.x = Math.PI/2;
  zAxis.position.z = -len/3;
  worldAxes.add(zAxis);

  var xAxis = createTubeArrow({len: len, thick: thick, col: col,
                               label: 'x', labelSize: labelSize});
  xAxis.rotation.z = -Math.PI/2;
  xAxis.position.x = -len/3;
  worldAxes.add(xAxis);
  return worldAxes;
}
var worldAxes = createWorldAxes();
scene.add(worldAxes);




//* Data management and dat.gui
window.onload = function() {

  function updateB() {
    bVek.update(aVek.vec);
    scene.remove(gerade);
    gerade = createGerade();
    scene.add(gerade);

    var t = pkt.t;
    scene.remove(pkt);
    pkt = new THREE.Mesh(new THREE.SphereGeometry (0.05, 16, 16),
                         new THREE.MeshPhongMaterial({color:0xaa2020,
                                                      specular:0xaa2020,
                                                      shininess:5}));
    pkt.t = t;
    pkt.position.copy(aVek.vec.clone().add(bVek.vec.clone().multiplyScalar(pkt.t)));
    scene.add(pkt);
  }

  var gui = new dat.GUI();
  var vektorA = gui.addFolder('Vektor a');
  vektorA.add(aVek.vec, 'x', -3, 3).step(0.1).onChange(function() {
    aVek.update();
    updateB();
  });
  vektorA.add(aVek.vec, 'y', -3, 3).step(0.1).onChange(function() {
    aVek.update();
    updateB();
  });
  vektorA.add(aVek.vec, 'z', -3, 3).step(0.1).onChange(function() {
    aVek.update();
    updateB();
  });
  var vektorB = gui.addFolder('Vektor b');
  vektorB.add(bVek.vec, 'x', -3, 3).step(0.1).onChange(function() {
    updateB();
  });
  vektorB.add(bVek.vec, 'y', -3, 3).step(0.1).onChange(function() {
    updateB();
  });
  vektorB.add(bVek.vec, 'z', -3, 3).step(0.1).onChange(function() {
    updateB();
  });
  gui.add(pkt, 't', -3, 3).step(0.1).onChange(function(t) {
    scene.remove(pkt);
    pkt = new THREE.Mesh(new THREE.SphereGeometry (0.05, 16, 16),
                         new THREE.MeshPhongMaterial({color:0xaa2020,
                                                      specular:0xaa2020,
                                                      shininess:5}));
    pkt.t = t;
    pkt.position.copy(aVek.vec.clone().add(bVek.vec.clone().multiplyScalar(pkt.t)));
    scene.add(pkt);
  });
};



// Evtl. Optional: Ein grid
// var size = 2;
// var step = 1;
// var gridXZ = new THREE.GridHelper( size, step );
// scene.add( gridXZ );
// var gridXZ2 = new THREE.GridHelper( size, step );
// gridXZ2.position.y = 1;
// scene.add(gridXZ2);
// var gridXY = new THREE.GridHelper( size, step );
// gridXY.rotation.x = Math.PI / 2;
// scene.add( gridXY );
// var gridYZ = new THREE.GridHelper( size, step );
// gridYZ.rotation.z = Math.PI / 2;
// scene.add( gridYZ );


//* Rendering
var controls = new THREE.OrbitControls( camera );
function render() {
  requestAnimationFrame(render);

  light.position.copy(camera.position);

  controls.update();
  renderer.render(scene, camera);
}
render();
