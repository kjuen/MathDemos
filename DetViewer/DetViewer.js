/*global dat, THREE */

var canvas = document.getElementById('graphics');

//* Initialize webGL
var renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true});
renderer.setSize( window.innerWidth, window.innerHeight );
// graphicsdiv.appendChild( renderer.domElement );

document.body.appendChild(renderer.domElement);
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
    opts.labelCol = opts.labelCol || new THREE.Color('lightslategray');
    opts.labelSize = opts.labelSize || 48;
    var sprite = makeTextLabel(opts.label, opts.labelSize, opts.labelCol);
    sprite.position.y = opts.len;
    axis.add( sprite );
  }
  return axis;
}

var globCoord = new THREE.Object3D();
scene.add(globCoord);
globCoord.rotation.x = -Math.PI/2;
// globCoord.rotation.z = -Math.PI/2;
//* Die Vektorpfeile a1, a2, a3
function Vektor(vec, opts) {
  this.vec = vec;
  opts.len = vec.length();
  this.opts = opts;
  this.arrow = createTubeArrow(opts);
  globCoord.add(this.arrow);
  this.mat = new THREE.Matrix4();
}

Vektor.prototype.update = function(pos) {
  this.opts.len = this.vec.length();
  globCoord.remove(this.arrow);
  var rotAxis = new THREE.Vector3(this.vec.z, 0, -this.vec.x).normalize();
  var rotAngle = Math.acos(this.vec.y / this.vec.length());
  this.mat.makeRotationAxis(rotAxis, rotAngle);
  if(pos !== undefined) {
    this.mat.setPosition(pos);
  }
  this.arrow = createTubeArrow(this.opts);
  this.arrow.applyMatrix(this.mat);
  globCoord.add(this.arrow);

  if(vd !== undefined) {
    vd.clear();
    vd = new VolDisplay();
  }

};




//* Spaltenvektoren
// function rd() {return 1.5*(2*Math.random()-1);};
var vecThick = 1/40;
var a1Vek = new Vektor(new THREE.Vector3(1, 0.2, 0.2),
                       {thick:vecThick, col:0xaa3030});
a1Vek.update();
var a2Vek = new Vektor(new THREE.Vector3(0.2, 1, 0.2),
                       {thick:vecThick, col:0x30aa30});
a2Vek.update();
var a3Vek = new Vektor(new THREE.Vector3(0.2, 0.2, 1),
                       {thick:vecThick, col:0x3030aa});
a3Vek.update();



//* Volumen
function VolDisplay() {

  var transMat = new THREE.Matrix4();
  transMat.makeBasis(a1Vek.vec, a2Vek.vec, a3Vek.vec);

  this.holder = new THREE.Object3D();
  this.holder.matrixAutoUpdate = false;
  this.holder.matrix.copy(transMat);
  globCoord.add(this.holder);

  this.vol = new THREE.Mesh(new THREE.BoxGeometry(1,1,1),
                            new THREE.MeshBasicMaterial({
                              color:new THREE.Color('orange'),
                              transparent:true,
                              opacity:0.25
                            }));
  this.vol.position.copy(new THREE.Vector3(1/2, 1/2, 1/2));
  // volHolder.applyMatrix(transMat);globCoord
  this.holder.add(this.vol);
  this.edges = new THREE.EdgesHelper( this.vol, 0xffffff );
  scene.add(this.edges );
}
VolDisplay.prototype.clear = function() {
  scene.remove(this.edges);
  globCoord.remove(this.holder);
};


var vd = new VolDisplay();

//* Add x,y,z coordinate axes to globCoord
function createWorldAxes(len, thick) {

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
globCoord.add(worldAxes);





//* Data management and dat.gui
window.onload = function() {


  function calcDet() {
    var mat = new THREE.Matrix4();
    mat.makeBasis(a1Vek.vec, a2Vek.vec, a3Vek.vec);
    return (Math.round(1000*mat.determinant())/1000).toString();
  };

  var DetHolder = {
    Determinante: calcDet()
  };

  function createCB(a) {
    return function() {
      a.update();
      DetHolder.Determinante = calcDet();
    };
  }

  var gui = new dat.GUI({ autoPlace: true });
  gui.add(DetHolder, 'Determinante').listen();
  var vektorA1 = gui.addFolder('Vektor a1');
  vektorA1.add(a1Vek.vec, 'x', -3, 3).step(0.1).onChange(createCB(a1Vek));
  vektorA1.add(a1Vek.vec, 'y', -3, 3).step(0.1).onChange(createCB(a1Vek));
  vektorA1.add(a1Vek.vec, 'z', -3, 3).step(0.1).onChange(createCB(a1Vek));
  var vektorA2 = gui.addFolder('Vektor a2');
  vektorA2.add(a2Vek.vec, 'x', -3, 3).step(0.1).onChange(createCB(a2Vek));
  vektorA2.add(a2Vek.vec, 'y', -3, 3).step(0.1).onChange(createCB(a2Vek));
  vektorA2.add(a2Vek.vec, 'z', -3, 3).step(0.1).onChange(createCB(a2Vek));
  var vektorA3 = gui.addFolder('Vektor a3');
  vektorA3.add(a3Vek.vec, 'x', -3, 3).step(0.1).onChange(createCB(a3Vek));
  vektorA3.add(a3Vek.vec, 'y', -3, 3).step(0.1).onChange(createCB(a3Vek));
  vektorA3.add(a3Vek.vec, 'z', -3, 3).step(0.1).onChange(createCB(a3Vek));
};


//* Rendering
var controls = new THREE.OrbitControls( camera, canvas );
function render() {
  requestAnimationFrame(render);

  light.position.copy(camera.position);

  controls.update();
  renderer.render(scene, camera);
}
render();
