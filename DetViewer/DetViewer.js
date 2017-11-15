/*global dat, THREE */

const canvas = document.getElementById('graphics');

//* Initialize webGL
const renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor('black');    // set background color

// Create a new Three.js scene and a camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight,
                                          0.1, 1000 );
camera.position.set(5,5,5);
window.addEventListener('resize', function() {
  renderer.setSize( window.innerWidth, window.innerHeight );
  camera.aspect= window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}, false);



// In render loop, position is set to camera position
const light = new THREE.PointLight( 0xffffff );
scene.add( light );
scene.add(new THREE.AmbientLight(0xaaaaaa));



//* General helper functions
const globCoord = new THREE.Object3D();
scene.add(globCoord);
globCoord.rotation.x = -Math.PI/2;
const vecThick = 1/40;
const a1Vek = new Vektor(new THREE.Vector3(1, 0.2, 0.2),
                         {thick:vecThick, col:0xaa3030});
const a2Vek = new Vektor(new THREE.Vector3(0.2, 1, 0.2),
                         {thick:vecThick, col:0x30aa30});
const a3Vek = new Vektor(new THREE.Vector3(0.2, 0.2, 1),
                         {thick:vecThick, col:0x3030aa});
let vd = new VolDisplay();



const makeTextLabel = function( message, fontsize, col )
{
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = "Bold " + fontsize + "px Arial";

  // get size data (height depends only on font size)
  context.fillStyle = col.getStyle();
  context.fillText( message, fontsize, fontsize);

  // canvas contents will be used for a texture
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture});
  const sprite = new THREE.Sprite( spriteMaterial );
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

  const mat = new THREE.MeshPhongMaterial({color: opts.col,
                                         specular: opts.col,
                                         side:THREE.DoubleSide});
  const tubeGeo = new THREE.CylinderGeometry(opts.thick, opts.thick, opts.len, 32);
  const tube = new THREE.Mesh(tubeGeo, mat);
  tube.position.y = opts.len/2;
  const axis = new THREE.Object3D();
  axis.add(tube);
  if(opts.head) {
    const headGeo = new THREE.CylinderGeometry(0, 3*opts.thick, 6*opts.thick, 32);
    const head = new THREE.Mesh(headGeo, mat);
    head.position.y = opts.len+opts.thick;
    axis.add(head);
  }
  if(opts.label !== undefined) {
    opts.labelCol = opts.labelCol || new THREE.Color('lightslategray');
    opts.labelSize = opts.labelSize || 48;
    const sprite = makeTextLabel(opts.label, opts.labelSize, opts.labelCol);
    sprite.position.y = opts.len;
    axis.add( sprite );
  }
  return axis;
}


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
  const rotAxis = new THREE.Vector3(this.vec.z, 0, -this.vec.x).normalize();
  const rotAngle = Math.acos(this.vec.y / this.vec.length());
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






//* Volumen

function VolDisplay() {

  const transMat = new THREE.Matrix4();
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
  this.holder.add(this.vol);
  // this.edges = new THREE.EdgesHelper( this.vol, 0xffffff );
  const edgesGeo = new THREE.EdgesGeometry(this.vol.geometry);
  this.edges = new THREE.LineSegments( edgesGeo,
                                       new THREE.LineBasicMaterial( { color: 0xffffff } ) );
  this.vol.add(this.edges );
}
VolDisplay.prototype.clear = function() {
  this.vol.remove(this.edges);
  globCoord.remove(this.holder);
};

a1Vek.update();
a2Vek.update();
a3Vek.update();


//* Add x,y,z coordinate axes to globCoord
function createWorldAxes(len, thick) {

  if(len===undefined) len = 3;
  if(thick===undefined) thick = 1/50;
  const labelSize = 48;
  const col = new THREE.Color(0x303030);

  const worldAxes = new THREE.Object3D();
  const yAxis = createTubeArrow({len: len, thick: thick, col: col,
                                 label: 'y', labelSize: labelSize});
  yAxis.position.y=-len/3;
  worldAxes.add(yAxis);

  const zAxis = createTubeArrow({len: len, thick: thick, col: col,
                                 label: 'z', labelSize: labelSize});
  zAxis.rotation.x = Math.PI/2;
  zAxis.position.z = -len/3;
  worldAxes.add(zAxis);

  const xAxis = createTubeArrow({len: len, thick: thick, col: col,
                                 label: 'x', labelSize: labelSize});
  xAxis.rotation.z = -Math.PI/2;
  xAxis.position.x = -len/3;
  worldAxes.add(xAxis);
  return worldAxes;
}
const worldAxes = createWorldAxes();
globCoord.add(worldAxes);





//* Data management and dat.gui
window.onload = function() {


  function calcDet() {
    const mat = new THREE.Matrix4();
    mat.makeBasis(a1Vek.vec, a2Vek.vec, a3Vek.vec);
    return (Math.round(1000*mat.determinant())/1000).toString();
  }

  const DetHolder = {
    Determinante: calcDet()
  };

  function createCB(a) {
    return function() {
      a.update();
      DetHolder.Determinante = calcDet();
    };
  }

  const gui = new dat.GUI({ autoPlace: true });
  gui.add(DetHolder, 'Determinante').listen();
  const vektorA1 = gui.addFolder('Vektor a1');
  vektorA1.add(a1Vek.vec, 'x', -3, 3).step(0.1).onChange(createCB(a1Vek));
  vektorA1.add(a1Vek.vec, 'y', -3, 3).step(0.1).onChange(createCB(a1Vek));
  vektorA1.add(a1Vek.vec, 'z', -3, 3).step(0.1).onChange(createCB(a1Vek));
  const vektorA2 = gui.addFolder('Vektor a2');
  vektorA2.add(a2Vek.vec, 'x', -3, 3).step(0.1).onChange(createCB(a2Vek));
  vektorA2.add(a2Vek.vec, 'y', -3, 3).step(0.1).onChange(createCB(a2Vek));
  vektorA2.add(a2Vek.vec, 'z', -3, 3).step(0.1).onChange(createCB(a2Vek));
  const vektorA3 = gui.addFolder('Vektor a3');
  vektorA3.add(a3Vek.vec, 'x', -3, 3).step(0.1).onChange(createCB(a3Vek));
  vektorA3.add(a3Vek.vec, 'y', -3, 3).step(0.1).onChange(createCB(a3Vek));
  vektorA3.add(a3Vek.vec, 'z', -3, 3).step(0.1).onChange(createCB(a3Vek));
};


//* Rendering
const controls = new THREE.OrbitControls( camera, canvas );
function render() {
  requestAnimationFrame(render);

  light.position.copy(camera.position);

  controls.update();
  renderer.render(scene, camera);
}
render();
