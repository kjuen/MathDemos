/*global addWorldAxes, dat, THREE, getPlaneCorners, lgsCon, calcIntersectionLine */

// TODO: Mit Plane2 rumspielen, ob das besser aussieht

//* Initialize webGL
var renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
// var canvas = document.getElementById("mycanvas");
// var renderer = new THREE.WebGLRenderer({canvas:canvas});
renderer.setClearColor('white');    // set background color

// Create a new Three.js scene and a camera
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight,
                                          0.1, 1000 );
camera.position.set(12,12,12);
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
  // var metrics = context.measureText( message );
  //var textWidth = metrics.width;
  context.fillStyle = col.getStyle(); // "rgb(0,0,0)";
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

  var mat = new THREE.MeshPhongMaterial({color: opts.col,
                                         specular: opts.col,
                                         side:THREE.DoubleSide});
  var tubeGeo = new THREE.CylinderGeometry(opts.thick, opts.thick, opts.len, 32);
  var tube = new THREE.Mesh(tubeGeo, mat);
  tube.position.y = opts.len/2;
  var headGeo = new THREE.CylinderGeometry(0, 3*opts.thick, 6*opts.thick, 32);
  var head = new THREE.Mesh(headGeo, mat);
  head.position.y = opts.len+opts.thick;
  var axis = new THREE.Object3D();
  axis.add(tube);
  axis.add(head);
  if(opts.label !== undefined) {
    opts.labelSize = opts.labelSize || 48;
    var sprite = makeTextLabel(opts.label, opts.labelSize, opts.col);
    sprite.position.y = opts.len;
    axis.add( sprite );
  }
  return axis;
}



//* Data management and dat.gui

// FIXME: Die Schrittweite wird nicht angezeigt bei Elementen mit Startwert 0!!
window.onload = function() {
  var gui = new dat.GUI();
  var cb = function() {
    // planes[this].setKoeffs(lgsCon.eqs[this].getA(), lgsCon.eqs[this].getB());
    planes[this].update();
    var solpos = lgsCon.getSolution();
    if(solpos === undefined) {
      sol.visible = false;
    } else {
      sol.visible = true;
      sol.position.copy(lgsCon.getSolution());
    }
    lines.forEach(function(l) { l.update(); });
  };
  for(var ii=1;ii<=3;ii++) {
    var cbii = cb.bind(ii-1);
    var eq = gui.addFolder('Ebene ' + ii);
    for(var j=1;j<=3;j++) {
      eq.add(lgsCon.eqs[ii-1], 'a'+ii+j, -3,3).step(0.1).onChange(cbii);
    }
    eq.add(lgsCon.eqs[ii-1], 'b'+ii, -3,3).step(0.1).onChange(cbii);
  }

  var einst = gui.addFolder('Einstellungen');
  einst.add(lgsCon, 'Transparenz', 0, 1).onChange(
    function(tr) {
      planes.forEach( function(pl) {
        if(tr < lgsCon.TranspTheshold) {
          pl.mesh.visible = false;
        } else {
          pl.mesh.visible = true;
          pl.mesh.traverse(function(obj) {
            if(obj.material !== undefined)
              obj.material.opacity = tr;
          });
        }
      });
    });

  einst.add(lgsCon, 'Normalenvektoren').onChange(
    function(flag) {
      planes.forEach( function(pl) {
        pl.normal.visible = flag;
      });
    });
  einst.add(lgsCon, 'Achsenkreuz').onChange(
    function(flag) {
      worldAxes.visible = flag;
    });
};



//* Planes

/**
 * returns the plane geometry or undefined if there are less than 3 vertices
 */
function createPlaneGeo(a,b,L) {

  var geo = new THREE.Geometry();
  geo.vertices = getPlaneCorners(a,b,L);
  if(geo.vertices === undefined || geo.vertices.length < 3) {
    return undefined;
  }
  for(var i = 1; i<=geo.vertices.length-2; ++i)
    geo.faces.push(new THREE.Face3(0,i,i+1));  // 0
  // geo.faces.push(new THREE.Face3(1,2,3));  // 1

  geo.computeFaceNormals();
  //geo.computeVertexNormals();  // no good
  geo.faces.forEach(function(f) {
    f.vertexNormals.push(f.normal.clone());
    f.vertexNormals.push(f.normal.clone());
    f.vertexNormals.push(f.normal.clone());
  });

  geo.dynamic = true;
  geo.verticesNeedUpdate = true;
  geo.normalsNeedUpdate = true;
  return geo;
}


/**
 * Position normal vector to plane a*x=b
 */
function positionNormal(normal, a, b) {
  normal.position.copy(a.clone().multiplyScalar(b/a.lengthSq()));
  var m = new THREE.Matrix4();
  var theta = Math.acos(a.y/a.length());
  m.makeRotationAxis(new THREE.Vector3(a.z, 0, -a.x).normalize(), theta);
  normal.rotation.setFromRotationMatrix(m);
}


function Plane(idx) {
  this.idx = idx;
  var a = lgsCon.eqs[idx].getA();
  var b = lgsCon.eqs[idx].getB();

  // var geometry = new THREE.PlaneBufferGeometry(size, size);
  var geometry = createPlaneGeo(a, b, lgsCon.planeSize);
  var material = new THREE.MeshPhongMaterial( {color: lgsCon.eqs[idx].col,
                                               specular: lgsCon.eqs[idx].col,
                                               side: THREE.DoubleSide} );
  this.mesh = new THREE.Mesh( geometry, material );
  this.mesh.matrixAutoUpdate = false;
  scene.add(this.mesh);

  this.normal = createTubeArrow({len:1, col:lgsCon.eqs[idx].col});
  positionNormal(this.normal, a, b);
  this.normal.visible = lgsCon.Normalenvektoren;
  this.mesh.add(this.normal);
  this.mesh.traverse(function(obj) {
    if(obj.material !== undefined) {
      obj.material.transparent = true;
      obj.material.opacity = lgsCon.Transparenz;
    }
  });
}





Plane.prototype.update = function() {
  var a = lgsCon.eqs[this.idx].getA();
  var b = lgsCon.eqs[this.idx].getB();
  var geo = createPlaneGeo(a, b, lgsCon.planeSize);
  if(geo !== undefined) {
    this.mesh.geometry = geo;
    positionNormal(this.normal, a, b);
  }
};

Plane.prototype.setVisible = function(flag) {
  if(flag && lgsCon.Transparenz>=lgsCon.TranspTheshold) {
    this.mesh.visible = true;
  } else {
    this.mesh.visible = false;
  }
};


function Plane2(idx) {
  this.idx = idx;
  var a = lgsCon.eqs[idx].getA();
  var b = lgsCon.eqs[idx].getB();

  // this create plane in x-y-plane
  var geometry = new THREE.PlaneBufferGeometry(lgsCon.planeSize, lgsCon.planeSize);
  var material = new THREE.MeshPhongMaterial( {color: lgsCon.eqs[idx].col,
                                               specular: lgsCon.eqs[idx].col,
                                               side: THREE.DoubleSide} );
  this.mesh = new THREE.Mesh( geometry, material );
  scene.add(this.mesh);

  this.mesh.position.copy(a.clone().multiplyScalar(b/a.lengthSq()));
  var m = new THREE.Matrix4();
  var theta = Math.acos(a.z/a.length());
  m.makeRotationAxis(new THREE.Vector3(a.y, -a.x, 0).normalize(), theta);
  this.mesh.rotation.setFromRotationMatrix(m);

  this.normal = createTubeArrow({len:1, col:lgsCon.eqs[idx].col});
  positionNormal(this.normal, a, b);
  this.normal.visible = lgsCon.Normalenvektoren;
  this.mesh.add(this.normal);
  this.mesh.traverse(function(obj) {
    if(obj.material !== undefined) {
      obj.material.transparent = true;
      obj.material.opacity = lgsCon.Transparenz;
    }
  });
}



//** Draw the planes
var planes = new Array(3);
planes[0] = new Plane(0);
planes[1] = new Plane(1);
planes[2] = new Plane(2);

var p0 = new Plane2(0);
var p1 = new Plane2(1);
var p2 = new Plane2(2);

//** Draw solution as black sphere
var sol = new THREE.Mesh(new THREE.SphereGeometry (0.1, 16, 16),
                         new THREE.MeshPhongMaterial({color:0x202020,
                                                      specular:0x303030,
                                                      shininess:5}));
sol.position.copy(lgsCon.getSolution());
scene.add(sol);


//* Create line for testing

function IntersectionLine(idx1, idx2) {
  this.idx1 = idx1;
  this.idx2 = idx2;
  var endPoints = calcIntersectionLine(lgsCon.eqs[idx1].getA(), lgsCon.eqs[idx1].getB(),
                                       lgsCon.eqs[idx2].getA(), lgsCon.eqs[idx2].getB(),
                                       lgsCon.planeSize);
  if(endPoints.length == 2) {
    var tg = new THREE.TubeGeometry(new THREE.LineCurve3(endPoints[0], endPoints[1]),
                                    2, 0.05, 16, false);
    var col = lgsCon.eqs[idx1].col.clone().add(lgsCon.eqs[idx2].col);

    this.mesh = new THREE.Mesh(tg, new THREE.MeshPhongMaterial({color:col,
                                                                side:THREE.DoubleSide,
                                                                specular:0xffff00,
                                                                wireframe:false}));
    scene.add(this.mesh);
  }
}

IntersectionLine.prototype.update = function() {
  var endPoints = calcIntersectionLine(lgsCon.eqs[this.idx1].getA(), lgsCon.eqs[this.idx1].getB(),
                                       lgsCon.eqs[this.idx2].getA(), lgsCon.eqs[this.idx2].getB(),
                                       lgsCon.planeSize);
  if(endPoints.length != 2) return;
  var tg = new THREE.TubeGeometry(new THREE.LineCurve3(endPoints[0], endPoints[1]),
                                  2, 0.05, 16, false);
  this.mesh.geometry = tg;
};

var lines = new Array(3);
lines[0] = new IntersectionLine(0,1);
lines[1] = new IntersectionLine(0,2);
lines[2] = new IntersectionLine(1,2);


//** Draw the lines


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
worldAxes.visible = lgsCon.Achsenkreuz;
scene.add(worldAxes);



//* Rendering

// var outerBox = new THREE.Mesh(new THREE.BoxGeometry(2*lgsCon.planeSize, 2*lgsCon.planeSize, 2*lgsCon.planeSize),
//                               new THREE.MeshPhongMaterial({color:'black',
//                                                            transparent:true,
//                                                            opacity:0.3}));
// var boxEdges = new THREE.EdgesHelper( outerBox, 0x000000 );
// scene.add( boxEdges );


var controls = new THREE.OrbitControls( camera );
function render() {
  requestAnimationFrame(render);

  light.position.copy(camera.position);

  controls.update();
  renderer.render(scene, camera);
}
render();
