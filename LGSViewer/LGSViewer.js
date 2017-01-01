/*global dat, THREE, calcIntersectionLine, lgsCon */

// FIXME: Ebenen moeglichst wenig drehen

//* Initialize webGL
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
renderer.setClearColor('white');    // set background color

// Create a new Three.js scene and a camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight,
                                            0.1, 1000 );
camera.position.set(12,12,12);
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

function makeTextLabel( message, fontsize, col )
{
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = "Bold " + fontsize + "px Arial";

  context.fillStyle = col.getStyle(); // "rgb(0,0,0)";
  context.fillText( message, fontsize, fontsize);

  // canvas contents will be used for a texture
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture});
  const sprite = new THREE.Sprite( spriteMaterial );
  return sprite;
}


/**
 * create an arrow pointing into y direction
 */
function createTubeArrow(opts) {
  // set defaults
  opts = opts || {};
  opts.len = opts.len || 1;
  opts.thick = opts.thick || 1/50;
  opts.col = opts.col || new THREE.Color('darkslategray');

  const mat = new THREE.MeshPhongMaterial({color: opts.col,
                                           specular: opts.col,
                                           side:THREE.DoubleSide});
  const tubeGeo = new THREE.CylinderGeometry(opts.thick, opts.thick, opts.len, 32);
  const tube = new THREE.Mesh(tubeGeo, mat);
  tube.position.y = opts.len/2;
  const headGeo = new THREE.CylinderGeometry(0, 3*opts.thick, 6*opts.thick, 32);
  const head = new THREE.Mesh(headGeo, mat);
  head.position.y = opts.len+opts.thick;
  const axis = new THREE.Object3D();
  axis.add(tube);
  axis.add(head);
  if(opts.label !== undefined) {
    opts.labelSize = opts.labelSize || 48;
    const sprite = makeTextLabel(opts.label, opts.labelSize, opts.col);
    sprite.position.y = opts.len;
    axis.add( sprite );
  }
  return axis;
}



//* Data management and dat.gui

// FIXME: Die Schrittweite wird nicht angezeigt bei Elementen mit Startwert 0!!
window.onload = function() {
  const gui = new dat.GUI();
  const cb = function() {

    planes[this].update();
    const solpos = lgsCon.getSolution();
    if(solpos !== undefined
       && lines[0].mesh.visible
       && lines[1].mesh.visible
       && lines[2].mesh.visible) {
      sol.visible = true;
      sol.position.copy(solpos);
    } else {
      sol.visible = false;
    }
    lines.forEach(function(l) { l.update(); });
  };
  for(let ii=1;ii<=3;ii++) {
    const cbii = cb.bind(ii-1);  // setzt this = Index der Ebene
    const eq = gui.addFolder('Ebene ' + ii);
    for(let j=1;j<=3;j++) {
      eq.add(lgsCon.eqs[ii-1], 'a'+ii+j, -3,3).step(0.1).onChange(cbii);
    }
    eq.add(lgsCon.eqs[ii-1], 'b'+ii, -3,3).step(0.1).onChange(cbii);
    eq.add(lgsCon.eqs[ii-1], 'Transparenz', 0, 1).onChange(cbii);
  }

  gui.add(lgsCon, 'Normalenvektoren').onChange(
    function(flag) {
      planes.forEach( function(pl) {
        pl.normal.visible = flag;
      });
    });
  gui.add(lgsCon, 'Achsenkreuz').onChange(
    function(flag) {
      worldAxes.visible = flag;
    });
};

//* Planes


/**
 * creates the geometry of a frame with inner and outer dimensions centered
 * around the origin located in the x-y-plane.
 * y-direction = height
 * x-direction = width
 *
 */
function createFrameGeo(innerWidth, innerHeight, outerWidth, outerHeight) {
  const geo = new THREE.Geometry();

  // Vertices:
  // inner rectangle: 0-3
  geo.vertices.push(new THREE.Vector3(-innerWidth/2, innerHeight/2, 0));
  geo.vertices.push(new THREE.Vector3(innerWidth/2, innerHeight/2, 0));
  geo.vertices.push(new THREE.Vector3(innerWidth/2, -innerHeight/2, 0));
  geo.vertices.push(new THREE.Vector3(-innerWidth/2, -innerHeight/2, 0));
  // outer rectangle: 4-7
  geo.vertices.push(new THREE.Vector3(-outerWidth/2, outerHeight/2, 0));
  geo.vertices.push(new THREE.Vector3(outerWidth/2, outerHeight/2, 0));
  geo.vertices.push(new THREE.Vector3(outerWidth/2, -outerHeight/2, 0));
  geo.vertices.push(new THREE.Vector3(-outerWidth/2, -outerHeight/2, 0));
  // inner height, outer width: 8-11
  geo.vertices.push(new THREE.Vector3(-outerWidth/2, innerHeight/2, 0));
  geo.vertices.push(new THREE.Vector3(outerWidth/2, innerHeight/2, 0));
  geo.vertices.push(new THREE.Vector3(outerWidth/2, -innerHeight/2, 0));
  geo.vertices.push(new THREE.Vector3(-outerWidth/2, -innerHeight/2, 0));

  // Faces:
  // upper boundary:
  geo.faces.push(new THREE.Face3(4,8,9));
  geo.faces.push(new THREE.Face3(9,5,4));
  // right boundary:
  geo.faces.push(new THREE.Face3(1,2,9));
  geo.faces.push(new THREE.Face3(9,2,10));
  // lower boundary:
  geo.faces.push(new THREE.Face3(11,6,10));
  geo.faces.push(new THREE.Face3(11,7,6));
  // left boundary:
  geo.faces.push(new THREE.Face3(3,0,8));
  geo.faces.push(new THREE.Face3(8,11,3));

  geo.computeFaceNormals();
  return geo;
}




/**
 * create a bounded plane. Originally, it is located in the x-y-plane.
 */
function BoundedPlane(idx) {
  // width, height, col, alpha=0.3, deltaPercent=2.5) {
  this.idx = idx;
  this.obj3D = new THREE.Object3D();
  scene.add(this.obj3D);

  let innerSize = lgsCon.planeSize * lgsCon.innerScale;
  let innerPlaneGeo = new THREE.PlaneGeometry(innerSize, innerSize);
  let innerMat = new THREE.MeshPhongMaterial( {color: lgsCon.eqs[idx].col,
                                               specular: lgsCon.eqs[idx].col,
                                               side: THREE.DoubleSide} );
  innerMat.transparent = true;
  innerMat.opacity = lgsCon.Transparenz;
  this.innerPlane = new THREE.Mesh(innerPlaneGeo, innerMat);
  this.obj3D.add(this.innerPlane);


  let frameGeo = createFrameGeo(innerSize, innerSize, lgsCon.planeSize, lgsCon.planeSize);
  let frameMat = new THREE.MeshPhongMaterial( {color: lgsCon.eqs[idx].col,
                                               specular: lgsCon.eqs[idx].col,
                                               wireframe:false,
                                               side: THREE.DoubleSide} );
  let frame = new THREE.Mesh(frameGeo, frameMat);
  this.obj3D.add(frame);

  this.normal = createTubeArrow({len:1, col:lgsCon.eqs[idx].col});
  this.normal.rotation.x = Math.PI/2;
  this.normal.visible = lgsCon.Normalenvektoren;
  this.obj3D.add(this.normal);

}


BoundedPlane.prototype.update = function() {

  const a = lgsCon.eqs[this.idx].getA();
  const b = lgsCon.eqs[this.idx].getB();

  const theta = Math.acos(a.z/a.length());
  const m = new THREE.Matrix4();
  m.makeRotationAxis(new THREE.Vector3(-a.y, a.x, 0).normalize(), theta);
  this.obj3D.rotation.setFromRotationMatrix(m);
  this.obj3D.position.copy(a.clone().multiplyScalar(b/a.lengthSq()));
  this.innerPlane.material.opacity = lgsCon.eqs[this.idx].Transparenz;
  if(lgsCon.eqs[this.idx].Transparenz < lgsCon.TranspTheshold) {
    this.obj3D.visible = false;
  } else {
    this.obj3D.visible = true;
  }
};



//** Draw the planes

const planes = new Array(3);
planes[0] = new BoundedPlane(0);
planes[1] = new BoundedPlane(1);
planes[2] = new BoundedPlane(2);
planes.forEach(p => p.update());



//* Intersection lines and solution
function IntersectionLine(idx1, idx2) {
  this.idx1 = idx1;
  this.idx2 = idx2;
  let endPoints = calcIntersectionLine(lgsCon.eqs[idx1].getA(), lgsCon.eqs[idx1].getB(),
                                       lgsCon.eqs[idx2].getA(), lgsCon.eqs[idx2].getB(),
                                       0.75* lgsCon.planeSize);
  if(endPoints.length == 2) {
    const tg = new THREE.TubeGeometry(new THREE.LineCurve3(endPoints[0], endPoints[1]),
                                      2, 0.05, 16, false);
    const col = lgsCon.eqs[idx1].col.clone().add(lgsCon.eqs[idx2].col);

    this.mesh = new THREE.Mesh(tg, new THREE.MeshPhongMaterial({color:col,
                                                                side:THREE.DoubleSide,
                                                                specular:0x404040,
                                                                wireframe:false}));
    scene.add(this.mesh);
  }
}

IntersectionLine.prototype.update = function() {
  let endPoints = calcIntersectionLine(lgsCon.eqs[this.idx1].getA(), lgsCon.eqs[this.idx1].getB(),
                                       lgsCon.eqs[this.idx2].getA(), lgsCon.eqs[this.idx2].getB(),
                                       0.75 * lgsCon.planeSize);
  if(endPoints.length != 2) {
    return;
  }
  let tg = new THREE.TubeGeometry(new THREE.LineCurve3(endPoints[0], endPoints[1]),
                                  2, 0.05, 16, false);
  this.mesh.geometry = tg;
  let tr1 = lgsCon.eqs[this.idx1].Transparenz;
  let tr2 = lgsCon.eqs[this.idx2].Transparenz;
  if( (tr1 < lgsCon.TranspTheshold) || (tr2 < lgsCon.TranspTheshold)) {
    this.mesh.visible = false;
  } else {
    this.mesh.visible = true;
  }

};


//** Draw the lines
const lines = new Array(3);
lines[0] = new IntersectionLine(0,1);
lines[1] = new IntersectionLine(0,2);
lines[2] = new IntersectionLine(1,2);

//** Draw solution as black sphere
const sol = new THREE.Mesh(new THREE.SphereGeometry (0.1, 16, 16),
                           new THREE.MeshPhongMaterial({color:0x202020,
                                                        specular:0x303030,
                                                        shininess:5}));
sol.position.copy(lgsCon.getSolution());
scene.add(sol);


//* Add x,y,z coordinate axes to scene

function createWorldAxes(scene, len, thick) {

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
worldAxes.visible = lgsCon.Achsenkreuz;
scene.add(worldAxes);

// for debugging
// const outerBox = new THREE.Mesh(new THREE.BoxGeometry(2*lgsCon.planeSize,
//                                                       2*lgsCon.planeSize,
//                                                       2*lgsCon.planeSize),
//                                 new THREE.MeshPhongMaterial({color:'black',
//                                                              transparent:true,
//                                                              opacity:0.3}));
// const boxEdges = new THREE.EdgesHelper( outerBox, 0x000000 );
// scene.add( boxEdges );



//* Rendering

const controls = new THREE.OrbitControls( camera );
function render() {
  requestAnimationFrame(render);

  light.position.copy(camera.position);

  controls.update();
  renderer.render(scene, camera);
}
render();
