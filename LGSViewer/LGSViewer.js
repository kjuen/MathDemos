/*global addWorldAxes, dat, THREE */

//* Initialize webGL
var canvas = document.getElementById("mycanvas");
var renderer = new THREE.WebGLRenderer({canvas:canvas});
renderer.setClearColor('rgb(255,255,255)');    // set background color

// Create a new Three.js scene and a camera
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height,
                                          0.1, 1000 );
camera.position.set(8,8,8);

//* Data management and dat.gui
var lgsCon = {
  a11: 1,
  a12: 0.1,
  a13: 0,
  b1: 1,
  a21: 0,
  a22: 1,
  a23: 0,
  b2: 1,
  a31: 0,
  a32: 0,
  a33: 1,
  b3: 1,
  getNormal: function(idx) {
    if(idx===1) {
      return new THREE.Vector3(this.a11, this.a12, this.a13);
    } else if(idx===2) {
      return new THREE.Vector3(this.a21, this.a22, this.a23);
    } else {
      return new THREE.Vector3(this.a31, this.a32, this.a33);
    }
  },
  getB: function(idx) {
    if(idx===1) return this.b1;
    else if(idx===2) return this.b2;
    else return this.b3;
  },

  Normalenvektoren: false,
  Transparenz:1
};


// FIXME: Die Schrittweite wird nicht angezeigt bei Elementen mit Startwert 0!!
window.onload = function() {
  var gui = new dat.GUI();
  var eq1 = gui.addFolder('Gleichung 1');
  var a11 = eq1.add(lgsCon, 'a11', -3,3).step(0.1);
  a11.onChange(function() { setLocation(plane1, 1, ar1); });
  var a12 = eq1.add(lgsCon, 'a12', -3,3).step(0.1);
  a12.onChange(function() { setLocation(plane1, 1, ar1); });
  var a13 = eq1.add(lgsCon, 'a13', -3,3).step(0.1);
  a13.onChange(function() { setLocation(plane1, 1, ar1); });
  var b1 = eq1.add(lgsCon, 'b1', -3,3).step(0.1);
  b1.onChange(function() { setLocation(plane1, 1, ar1); });
  var eq2 = gui.addFolder('Gleichung 2');
  var a21 = eq2.add(lgsCon, 'a21', -3,3).step(0.1);
  a21.onChange(function() { setLocation(plane2, 2, ar2); });
  var a22 = eq2.add(lgsCon, 'a22', -3,3).step(0.1);
  a22.onChange(function() { setLocation(plane2, 2, ar2); });
  var a23 = eq2.add(lgsCon, 'a23', -3,3).step(0.1);
  a23.onChange(function() { setLocation(plane2, 2, ar2); });
  var b2 = eq2.add(lgsCon, 'b2', -3,3).step(0.1);
  b2.onChange(function() { setLocation(plane2, 2, ar2); });
  var eq3 = gui.addFolder('Gleichung 3');
  var a31 = eq3.add(lgsCon, 'a31', -3,3).step(0.1);
  a31.onChange(function() { setLocation(plane3, 3, ar3); });
  var a32 = eq3.add(lgsCon, 'a32', -3,3).step(0.1);
  a32.onChange(function() { setLocation(plane3, 3, ar3); });
  var a33 = eq3.add(lgsCon, 'a33', -3,3).step(0.1);
  a33.onChange(function() { setLocation(plane3, 3, ar3); });
  var b3 = eq3.add(lgsCon, 'b3', -3,3).step(0.1);
  b3.onChange(function() { setLocation(plane3, 3, ar3); });
  var einst = gui.addFolder('Einstellungen');
  einst.add(lgsCon, 'Transparenz', 0,1).onChange(
    function(tr) {
      plane1.material.opacity = tr;
      plane2.material.opacity = tr;
      plane3.material.opacity = tr;
    });

};
//* Draw the planes
var showPlaneNormals = true;
var planeSize = 5;
var planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
var planeCol1 = 0x505000;
var planeCol2 = 0x005050;
var planeCol3 = 0x500050;
var planeMat = new THREE.MeshBasicMaterial( {color: planeCol3, side: THREE.DoubleSide} );

function createPlane(col, size) {
  size = (size === undefined ?  5 : size);

  var geometry = new THREE.PlaneGeometry(size, size);
  var material = new THREE.MeshBasicMaterial( {color: new THREE.Color(col),
                                               side: THREE.DoubleSide} );
  material.transparent = true;
  material.opacity = lgsCon.Transparenz;
  var plane = new THREE.Mesh( geometry, material );

  return plane;
}


function createPlaneNormal(col) {
  var pos = new THREE.Vector3(0,0,0);
  var dir = new THREE.Vector3(1,0,0);
  return new THREE.ArrowHelper(dir, pos, 1, col);
}

// FIXME: Stimmt der Code hier wirklich? Reihenfolge von Rotation und Translation
//        sind nicht richtig, glaube ich

/**
 * set the location (position and rotation) of the plane so that the points on
 * the plane satisfy the equation a*x=b.
 * @param{Object} plane the plane to locate
 * @param{number} idx index of equation
 * @param{Object} ar optional ArrowHelper object showing the plane normal
 */
function setLocation(plane, idx, ar) {

  var TOL = 0.01;
  var a = lgsCon.getNormal(idx);
  var b = lgsCon.getB(idx);

  var len = a.length();
  if(len<TOL) {
    plane.visible = false;
  } else {
    plane.visible = true;
    var angle = Math.acos(a.z/a.length());
    var norm = Math.sqrt(a.x*a.x+a.y*a.y);
    var axis = new THREE.Vector3(a.y/norm, -a.x/norm, 0);
    var q = new THREE.Quaternion();
    q.setFromAxisAngle ( axis, angle );
    plane.quaternion.copy(q);
    a.multiplyScalar(b/(len*len));
    plane.position.copy(a);

    if(showPlaneNormals && ar !== undefined) {
      ar.position.copy(a);
      ar.setDirection(a.normalize());
    }
  }
}




var plane1 = createPlane('rgb(200, 200, 0)');
scene.add( plane1 );
var plane2 = createPlane('rgb(200, 0, 200)');
scene.add( plane2 );
var plane3 = createPlane('rgb(0, 200, 200)');
scene.add( plane3 );
if(showPlaneNormals) {
  var ar1 = createPlaneNormal(planeCol1);
  scene.add(ar1);
  var ar2 = createPlaneNormal(planeCol2);
  scene.add(ar2);
  var ar3 = createPlaneNormal(planeCol3);
  scene.add(ar3);
}




//* Add x,y,z coordinate axes to scene
function addWorldAxes(scene, len, thick) {

  if(len===undefined) len = 1.5;
  if(thick===undefined) thick = 1/50;
  var greenMat = new THREE.MeshBasicMaterial({color: 'green'});
  var axisGeo = new THREE.CylinderGeometry(thick, thick, len, 48);
  var axis = new THREE.Mesh(axisGeo, greenMat);
  var headGeo = new THREE.CylinderGeometry(0, 2*thick, 2*thick, 48);
  var head = new THREE.Mesh(headGeo, greenMat);
  head.position.y = len/2+thick;
  var yAxis = new THREE.Object3D();
  yAxis.add(axis);
  yAxis.add(head);
  yAxis.position.y=len/6;
  scene.add(yAxis);


  var blueMat = new THREE.MeshBasicMaterial({color: 'blue'});
  axis = new THREE.Mesh(axisGeo, blueMat);
  head = new THREE.Mesh(headGeo, blueMat);
  head.position.y = len/2+thick;
  var zAxis = new THREE.Object3D();
  zAxis.add(axis);
  zAxis.add(head);
  zAxis.rotation.x = Math.PI/2;
  zAxis.position.z = len/6;
  scene.add(zAxis);

  var redMat = new THREE.MeshBasicMaterial({color: 'red'});
  axis = new THREE.Mesh(axisGeo, redMat);
  head = new THREE.Mesh(headGeo, redMat);
  head.position.y = len/2+thick;
  var xAxis = new THREE.Object3D();
  xAxis.add(axis);
  xAxis.add(head);
  xAxis.rotation.z = -Math.PI/2;
  xAxis.position.x = len/6;
  scene.add(xAxis);
}
addWorldAxes(scene);

//* Rendering

setLocation(plane1, 1, ar1);
setLocation(plane2, 2, ar2);
setLocation(plane3, 3, ar3);

var controls = new THREE.OrbitControls( camera, canvas );
function render() {
  requestAnimationFrame(render);


  controls.update();
  renderer.render(scene, camera);
}
render();
