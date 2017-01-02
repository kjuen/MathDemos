// This file contains the part of the application that's needed for unit testing.


let lgsCon = {
  TOL: Math.sqrt(Number.EPSILON),
  eqs: new Array(3),
  Normalenvektoren: false,
  Achsenkreuz: false,
  planeSize: 10,
  boundingBoxSize: 7.5,
  innerScale: 0.98,       // size of inner, transparent plane
  Transparenz : 0.3,
  TranspTheshold: 0.1,    // below this limit for Transparenz, planes will be set to invisible
  getSolution : function() {
    // sporadisch getestet, scheint zu stimmen
    const m = new THREE.Matrix4();
    m.set(this.eqs[0].a11, this.eqs[0].a12, this.eqs[0].a13, 0,
          this.eqs[1].a21, this.eqs[1].a22, this.eqs[1].a23, 0,
          this.eqs[2].a31, this.eqs[2].a32, this.eqs[2].a33, 0,
          0,0,0,1);
    // printMat(m);
    const lsg = new THREE.Vector3(this.eqs[0].b1, this.eqs[1].b2, this.eqs[2].b3);
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
  Transparenz:0.3,
  getA: function() {return new THREE.Vector3(this.a11, this.a12, this.a13);},
  getB: function() {return this.b1;}
};
lgsCon.eqs[1] = {
  a21: 0,
  a22: 1,
  a23: 0,
  b2: 1,
  col:new THREE.Color(0,1,0),
  Transparenz:0.3,
  getA: function() {return new THREE.Vector3(this.a21, this.a22, this.a23);},
  getB: function() {return this.b2;}
};
lgsCon.eqs[2] = {
  a31: 0,
  a32: 0,
  a33: 1,
  b3: 1,
  col:new THREE.Color(0,0,1),
  Transparenz:0.3,
  getA: function() {return new THREE.Vector3(this.a31, this.a32, this.a33);},
  getB: function() {return this.b3;}
};

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
  const ap = p.clone().dot(a);
  return Math.abs(ap - b) < tol;
}


/**
 * Solve the two equations
 * a*x + b*y = c
 * d*x + e*y = f
 * and return the solution as two component array or undefined if no solution exists.
 */
function solveLGS2(a,b,c,d,e,f) {
  const det = a*e - b*d;
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

  const ret = [];
  let count = 0;
  let p;

  // Algo: Run over all six sides of bounding cube and find out which side
  // intersects with intersection line:

  // Check x=-L plane
  p = solveLGS2(a1.y, a1.z, b1+a1.x*L,
                a2.y, a2.z, b2+a2.x*L);
  if(count < 2 && p!==undefined &&
     Math.abs(p[0])<L && Math.abs(p[1])<L) {
    ret.push(new THREE.Vector3(-L, p[0], p[1]));
    count++;
  }
  // Check y=-L plane
  p = solveLGS2(a1.x, a1.z, b1+a1.y*L,
                a2.x, a2.z, b2+a2.y*L);
  if(count < 2 && p!==undefined &&
     Math.abs(p[0])<=L && Math.abs(p[1])<L) {
    ret.push(new THREE.Vector3(p[0], -L, p[1]));
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
  // Check x=L plane
  p = solveLGS2(a1.y, a1.z, b1-a1.x*L,
                a2.y, a2.z, b2-a2.x*L);
  if(count < 2 && p!==undefined &&
     Math.abs(p[0])< L && Math.abs(p[1])<L) {
    ret.push(new THREE.Vector3(L, p[0], p[1]));
    count++;
  }
  // Check y=L plane
  p = solveLGS2(a1.x, a1.z, b1-a1.y*L,
                a2.x, a2.z, b2-a2.y*L);
  if(count < 2 && p!==undefined &&
     Math.abs(p[0])<=L && Math.abs(p[1])<L) {
    ret.push(new THREE.Vector3(p[0], L, p[1]));
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
