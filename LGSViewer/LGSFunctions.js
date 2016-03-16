/*global THREE */


function assert(cond, msg) {
  if(!cond) {
    throw new Error('Assertion failed: ' + msg);
  }
}

/**
 * check if point p is in plane a*x=b.
 * @param{THREE.Vector3} p point to check
 * @param{THREE.Vector3} a plane definition
 * @param{Number} b plane definition
 * @param{Number} tol tolerance
 * @returns{boolean} flag whether or not point is in plane
 */
function pointInPlane(p, a, b, tol) {
  var ap = p.clone().dot(a);
  return Math.abs(ap - b) < tol;
}




var lgsCon = {
  TOL: Math.sqrt(Number.EPSILON),
  eqs: new Array(3),
  Normalenvektoren: false,
  Achsenkreuz: false,
  planeSize: 5,
  Transparenz : 0.8,
  TranspTheshold: 0.1,    // below this limit for Transparenz, planes will be set to invisible
  getSolution : function() {
    // sporadisch getestet, scheint zu stimmen
    var m = new THREE.Matrix4();
    m.set(this.eqs[0].a11, this.eqs[0].a12, this.eqs[0].a13, 0,
          this.eqs[1].a21, this.eqs[1].a22, this.eqs[1].a23, 0,
          this.eqs[2].a31, this.eqs[2].a32, this.eqs[2].a33, 0,
          0,0,0,1);
    // printMat(m);
    var lsg = new THREE.Vector3(this.eqs[0].b1, this.eqs[1].b2, this.eqs[2].b3);
    if(Math.abs(m.determinant()) < this.TOL) {
      return undefined;
    } else {
      return lsg.applyMatrix4(m.getInverse(m));
    }
  }
};
lgsCon.eqs[0] = {
  a11: 1,
  a12: 0.1,
  a13: 0,
  b1: 1,
  col:new THREE.Color(1,0,0),
  getA: function() {return new THREE.Vector3(this.a11, this.a12, this.a13);},
  getB: function() {return this.b1;}
};
lgsCon.eqs[1] = {
  a21: 0,
  a22: 1,
  a23: 0,
  b2: 1,
  col:new THREE.Color(0,1,0),
  getA: function() {return new THREE.Vector3(this.a21, this.a22, this.a23);},
  getB: function() {return this.b2;}
};
lgsCon.eqs[2] = {
  a31: 0,
  a32: 0,
  a33: 1,
  b3: 1,
  col:new THREE.Color(0,0,1),
  getA: function() {return new THREE.Vector3(this.a31, this.a32, this.a33);},
  getB: function() {return this.b3;}
};


/**
 * Remove duplicates from an array using comparison function comp
 */
function removeDuplicates(array, comp) {
  var len = array.length;
  if(len <= 1) {
    return array;
  }
  var uniqueElems = [array[0]];
  for(var i = 1; i<len; ++i) {
    // check, if current element is already present in uniqueElems
    var isDuplicate = uniqueElems.some(function(elem) {
      return comp(elem, array[i]);
    });
    if(!isDuplicate) uniqueElems.push(array[i]);
  }
  return uniqueElems;
}



function getPlaneCorners2(a,b,L) {
  var tol = lgsCon.TOL;
  L = L || 5;
  var corners = [];
  var x, y,z;

  if(Math.abs(a.x) < tol && Math.abs(a.y) < tol && Math.abs(a.z) < tol)
    return corners;

  // First try: corners in x=+L planes
  if(Math.abs(a.z) > tol) {
    // x=+L, y=+L
    z = (-a.y*L  + b - a.x*L)/a.z;
    if(Math.abs(z) <=L) // we found a corner :-)
      corners.push(new THREE.Vector3(L, L, z));
    // x=+L, y=-L
    z = (a.y*L  + b - a.x*L)/a.z;
    if(Math.abs(z) <=L) // we found a corner :-)
      corners.push(new THREE.Vector3(L, -L, z));
  }
  if(Math.abs(a.y) > tol) {
    // x=+L, z=+L
    y = (-a.z*L  + b - a.x*L)/a.y;
    if(Math.abs(y) <=L) // we found a corner :-)
      corners.push(new THREE.Vector3(L, y, L));
    // x=+L, z=-L
    y = (a.z*L  + b - a.x*L)/a.y;
    if(Math.abs(y) <=L) // we found a corner :-)
      corners.push(new THREE.Vector3(L, y, -L));
  }
  // Second try: corners in x=-L planes
  if(Math.abs(a.z) > tol) {
    // x=-L, y=+L
    z = (-a.y*L  + b + a.x*L)/a.z;
    if(Math.abs(z) <=L) // we found a corner :-)
      corners.push(new THREE.Vector3(-L, L, z));
    // x=-L, y=-L
    z = (a.y*L  + b + a.x*L)/a.z;
    if(Math.abs(z) <=L) // we found a corner :-)
      corners.push(new THREE.Vector3(-L, -L, z));
  }
  if(Math.abs(a.y) > tol) {
    // x=+L, z=+L
    y = (-a.z*L  + b + a.x*L)/a.y;
    if(Math.abs(y) <=L) // we found a corner :-)
      corners.push(new THREE.Vector3(-L, y, L));
    // x=+L, z=-L
    y = (a.z*L  + b + a.x*L)/a.y;
    if(Math.abs(y) <=L) // we found a corner :-)
      corners.push(new THREE.Vector3(-L, y, -L));
  }
  // Edge case: // a.y = a.z = 0
  if(Math.abs(a.y) < tol && Math.abs(a.z) < tol) {
    if(Math.abs(a.x*L - b) < tol) {
      x = L;
      corners.push(new THREE.Vector3(x,L,L));
      corners.push(new THREE.Vector3(x,L,-L));
      corners.push(new THREE.Vector3(x,-L,L));
      corners.push(new THREE.Vector3(x,-L,-L));
    }
    if(Math.abs(a.x*L + b) < tol) {
      x = -L;
      corners.push(new THREE.Vector3(x,L,L));
      corners.push(new THREE.Vector3(x,L,-L));
      corners.push(new THREE.Vector3(x,-L,L));
      corners.push(new THREE.Vector3(x,-L,-L));
    }
  }

  if(corners.length != 4) {
    // Third try: corners in y=+L planes
    if(Math.abs(a.x) > tol) {
      // y=+L, z=+L
      x = (-a.z*L  + b - a.y*L)/a.x;
      if(Math.abs(x) <L) // we found a corner :-)
        corners.push(new THREE.Vector3(x, L, L));
      // y=+L, z=-L
      x = (a.z*L  + b - a.y*L)/a.x;
      if(Math.abs(x) <L) // we found a corner :-)
        corners.push(new THREE.Vector3(x, L, -L));
    }
    if(Math.abs(a.z) > tol) {
      // y=L, x=+L
      z = (-a.x*L  + b - a.y*L)/a.z;
      if(Math.abs(z) <=L) // we found a corner :-)
        corners.push(new THREE.Vector3(L, L, z));
      // y=L, x=-L
      z = (a.x*L  + b - a.y*L)/a.z;
      if(Math.abs(z) <=L) // we found a corner :-)
        corners.push(new THREE.Vector3(-L, L, z));
    }
    // Fourth try: corners in y=-L planes
    if(Math.abs(a.x) > tol) {
      // y=-L, z=+L
      x = (-a.z*L  + b + a.y*L)/a.x;
      if(Math.abs(x) <L) // we found a corner :-)
        corners.push(new THREE.Vector3(x, -L, L));
      // y=-L, y=-L
      x = (a.z*L  + b + a.y*L)/a.x;
      if(Math.abs(x) <L) // we found a corner :-)
        corners.push(new THREE.Vector3(x, -L, -L));
    }
    if(Math.abs(a.z) > tol) {
      // y=-L, x=+L
      z = (-a.x*L  + b + a.y*L)/a.z;
      if(Math.abs(z) <=L) // we found a corner :-)
        corners.push(new THREE.Vector3(L, -L, z));
      // y=-L, x=-L
      z = (a.x*L  + b + a.y*L)/a.z;
      if(Math.abs(z) <=L) // we found a corner :-)
        corners.push(new THREE.Vector3(-L, -L, z));
    }
  }
  if(corners.length != 4) {
    // Fifth try: corners in z=+L planes
    if(Math.abs(a.x) > tol) {
      // y=+L, z=+L
      x = (-a.z*L  + b - a.y*L)/a.x;
      if(Math.abs(x) <L) // we found a corner :-)
        corners.push(new THREE.Vector3(x, L, L));
      // y=-L, z=L
      x = (-a.z*L  + b + a.y*L)/a.x;
      if(Math.abs(x) <L) // we found a corner :-)
        corners.push(new THREE.Vector3(x, L, -L));
    }
    if(Math.abs(a.y) > tol) {
      // x=L, z=+L
      y = (-a.z*L  + b - a.x*L)/a.y;
      if(Math.abs(y) <L) // we found a corner :-)
        corners.push(new THREE.Vector3(L, L, z));
      // x=-L, z=-L
      y = (-a.z*L  + b + a.x*L)/a.y;
      if(Math.abs(y) <L) // we found a corner :-)
        corners.push(new THREE.Vector3(-L, L, z));
    }
    // Sixth try: corners in z=-L planes
    if(Math.abs(a.x) > tol) {
      // y=L, z=-L
      x = (a.z*L  + b - a.y*L)/a.x;
      if(Math.abs(x) <L) // we found a corner :-)
        corners.push(new THREE.Vector3(x, -L, L));
      // y=-L, z=-L
      x = (a.z*L  + b + a.y*L)/a.x;
      if(Math.abs(x) <L) // we found a corner :-)
        corners.push(new THREE.Vector3(x, -L, -L));
    }
    if(Math.abs(a.y) > tol) {
      // x=L, z=-L
      y = (-a.x*L  + b + a.z*L)/a.y;
      if(Math.abs(y) <L) // we found a corner :-)
        corners.push(new THREE.Vector3(L, -L, z));
      // x=-L, x=-L
      y = (a.x*L  + b + a.z*L)/a.y;
      if(Math.abs(y) <L) // we found a corner :-)
        corners.push(new THREE.Vector3(-L, -L, z));
    }
  }
  if(corners.length > 0) {
    corners.sort(function(v1, v2) {
      return corners[0].distanceToSquared(v1) > corners[0].distanceToSquared(v2);
    });
  }
  // Man muesste evtl. noch Doppelte entfernen (das hier klappt nicht!)
  corners = removeDuplicates(corners,
                             function(v1, v2) {
                               return v1.distanceToSquared(v2) < tol;
                             });

  // var uniqueArray = corners.filter(function(item, pos, self) {
  //   return self.indexOf(item).distanceToSquared(pos) < tol;
  // });

  return corners;
}



function sortCorners(corners, a) {

  if(corners.length > 3) {
    var m = new THREE.Matrix4();
    var theta = Math.acos(a.z/a.length());
    m.makeRotationAxis(new THREE.Vector3(a.y, -a.x, 0).normalize(), theta);
    for(var k = 0; k<corners.length; ++k) {
      var c = corners[k].clone().applyMatrix4(m);
      // console.log('c=', c);
      corners[k].phi = Math.atan2(c.y, c.x);
    }
    corners.sort(function(v1, v2) {return v1.phi < v2.phi;});
    // for(k = 0; k<corners.length; ++k) {
    //   console.log('corners[k].phi=', corners[k].phi);

    // }
  }
}

/**
 * Calculate corners intersection points of plane with a cube with corners at \pm L.
 * @param{Vector3} a a-coeffs of plane = normal vector
 * @param{Number} b b-coeff of plane, plane eq.: a*x - b = 0
 * @param{Number} L size parameter of box
 * @returns{Array} array of Vector3 objects containing the intersection points
 */
function getPlaneCorners(a,b,L) {
  var tol = lgsCon.TOL;
  L = L || 5;
  var corners = [];
  var c = new THREE.Vector3();
  var d = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  var lambda;

  if(Math.abs(a.x) < tol && Math.abs(a.y) < tol && Math.abs(a.z) < tol)
    return corners;

  // A cube has 12 edges. We calculate the intersection of each edge with the plane
  // and check if the intersection is on the cube edge or outside
  // The edge hat equation lambda * c + d

  // Case 1: edges parallel to x axis, i.e. c*a = a_x
  c.set(1,0,0);
  if(Math.abs(a.x) > tol) {
    // We have unique intersection points in this case:
    d[0].set(-L, L, L);
    d[1].set(-L, -L, L);
    d[2].set(-L, L, -L);
    d[3].set(-L, -L, -L);
    for(var kk = 0; kk<d.length; ++kk) {
      lambda = (b - d[kk].dot(a))/a.x;
      if(lambda>=0 && lambda <= 2*L) {
        corners.push(d[kk].clone().add(c.clone().multiplyScalar(lambda)));
      }
    }
  }

  // Case 2: edges parallel to y axis, i.e. c*a = a_y
  c.set(0,1,0);
  if(Math.abs(a.y) > tol) {
    // We have unique intersection points in this case:
    d[0].set(L, -L, L);
    d[1].set(-L, -L, L);
    d[2].set(L, -L, -L);
    d[3].set(-L, -L, -L);
    for(kk = 0; kk<d.length; ++kk) {
      lambda = (b - d[kk].dot(a))/a.y;
      if(lambda>=0 && lambda <= 2*L) {
        corners.push(d[kk].clone().add(c.clone().multiplyScalar(lambda)));
      }
    }
  }

  // Case 3: edges parallel to z axis, i.e. c*a = a_z
  c.set(0,0,1);
  if(Math.abs(a.z) > tol) {
    // We have unique intersection points in this case:
    d[0].set(L, L, -L);
    d[1].set(-L, L, -L);
    d[2].set(L, -L, -L);
    d[3].set(-L, -L, -L);
    for(kk = 0; kk<d.length; ++kk) {
      lambda = (b - d[kk].dot(a))/a.z;
      if(lambda>=0 && lambda <= 2*L) {
        corners.push(d[kk].clone().add(c.clone().multiplyScalar(lambda)));
      }
    }
  }
    // Man muss noch Doppelte entfernen
  corners = removeDuplicates(corners,
                             function(v1, v2) {
                               return v1.distanceToSquared(v2) < tol;
                             });
  sortCorners(corners, a);

  // Post condition: All corners must be in plane!
  assert(corners.every(function(v) {
    return pointInPlane(v, a, b, tol);
  }), 'corner not in plane');

  return corners;
}



//* Computation of intersection lines

/**
 * Solve the two equations
 * a*x + b*y = c
 * d*x + e*y = f
 * and return the solution as two component array or undefined if no solution exists.
 */
function solveLGS2(a,b,c,d,e,f) {
  var det = a*e - b*d;
  if(Math.abs(det) < Number.EPSILON) {
    return undefined;
  } else {
    return [(e*c - b*f)/det, (a*f - d*c)/det];
  }
}



/**
 * calculates the intersection bewteen two planes.
 * TODO: Besser austesten
 *
 * @param{THREE.Vector3} a1 normal vector of first plane
 * @param{Number} b1 offset of first plane
 * @param{THREE.Vector3} a2 normal vector of second plane
 * @param{Number} b2 offset of second plane
 * @param{Number} L size of bounding box
 * @returns{Array} array of two THREE.Vector3 objects containing start and end points
 *                 of intersection line.
 */
function calcIntersectionLine(a1, b1, a2, b2, L) {
  "use strict";

  var ret = [];
  var count = 0;
  var p;

  // Algo: Run over all six sides of bounding cube and find out which side
  // intersects with intersection line:

  // Check x=-L plane
  p = solveLGS2(a1.y, a1.z, b1+a1.x*L,
                a2.y, a2.z, b2+a2.x*L);
  if(count < 2 && p!==undefined &&
     Math.abs(p[0])<=L && Math.abs(p[1])<=L) {
    ret.push(new THREE.Vector3(-L, p[0], p[1]));
    count++;
  }
  // Check x=L plane
  p = solveLGS2(a1.y, a1.z, b1-a1.x*L,
                a2.y, a2.z, b2-a2.x*L);
  if(count < 2 && p!==undefined &&
     Math.abs(p[0])<=L && Math.abs(p[1])<=L) {
    ret.push(new THREE.Vector3(L, p[0], p[1]));
    count++;
  }
  // Check y=-L plane
  p = solveLGS2(a1.x, a1.z, b1+a1.y*L,
                a2.x, a2.z, b2+a2.y*L);
  if(count < 2 && p!==undefined &&
     Math.abs(p[0])<=L && Math.abs(p[1])<=L) {
    ret.push(new THREE.Vector3(p[0], -L, p[1]));
    count++;
  }
  // Check y=L plane
  p = solveLGS2(a1.x, a1.z, b1-a1.y*L,
                a2.x, a2.z, b2-a2.y*L);
  if(count < 2 && p!==undefined &&
     Math.abs(p[0])<=L && Math.abs(p[1])<=L) {
    ret.push(new THREE.Vector3(p[0], L, p[1]));
    count++;
  }
  // Check z=-L plane
  p = solveLGS2(a1.x, a1.y, b1+a1.z*L,
                a2.x, a2.y, b2+a2.z*L);
  if(count < 2 && p!==undefined &&
     Math.abs(p[0])<=L && Math.abs(p[1])<=L) {
    ret.push(new THREE.Vector3(p[0], p[1], -L));
    count++;
  }
  // Check z=L plane
  p = solveLGS2(a1.x, a1.y, b1-a1.z*L,
                a2.x, a2.y, b2-a2.z*L);
  if(count < 2 && p!==undefined &&
     Math.abs(p[0])<=L && Math.abs(p[1])<=L) {
    ret.push(new THREE.Vector3(p[0], p[1], L));
    count++;
  }

  // Post condition: all points must be in both planes
  assert(ret.every(function(v) {
    return pointInPlane(v, a1, b1, lgsCon.TOL) && pointInPlane(v, a2, b2, lgsCon.TOL);
  }), 'intersection not in plane');

  assert(ret.length <= 2, 'Two many intersection points');
  return ret;
}
