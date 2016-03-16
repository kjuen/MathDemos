/*global test, ok, getPlaneCorners, THREE, removeDuplicates, getPlaneCorners2, sortCorners, calcIntersectionLine */

/**
 * @author K. Juenemann / https://github.com/kjuen
 */


// qunit tests for LGSViewer.

function compareVecs(v1, v2, tol) {
  return Math.abs(v1.x - v2.x) < tol
    && Math.abs(v1.y - v2.y) < tol
    && Math.abs(v1.z - v2.z) < tol;
}

function cornersContainVecs(corners, v1, v2, v3, v4, tol) {
  return corners.filter(function(c) {return compareVecs(c, v1, tol);}).length == 1
    && corners.filter(function(c) {return compareVecs(c, v2, tol);}).length == 1
    && corners.filter(function(c) {return compareVecs(c, v3, tol);}).length == 1
    && corners.filter(function(c) {return compareVecs(c, v4, tol);}).length == 1;
}


/**
 * checks if vector is contained in plane a*x = b
 */
function vecInPlane(v, a, b, tol) {
  var av = v.clone().dot(a);
  return Math.abs(av - b) < tol;
}

var TOL = 0.0000001;




test("removeDuplicates", function() {
  var a = [2,3,3,4,4,2];
  var b = removeDuplicates(a, function(x,y) {return x==y;});
  ok(b.length == 3);
  ok(b[0] = 2);
  ok(b[1] = 3);
  ok(b[2] = 4);
});


test( "getPlaneCorners: a=(0,0,0)", function() {
  var L = 5;
  var a = new THREE.Vector3(TOL/2, -TOL/2, 0);
  var b = 2.5;
  var corners = getPlaneCorners(a,b,L);
  var corners2 = getPlaneCorners2(a,b,L);
  ok(corners.length == 0, 'length');
  ok(corners2.length == 0, 'length');
});

test( "getPlaneCorners: a=(0,0,1)", function() {
  var L = 5;
  var a = new THREE.Vector3(0,0,1);
  var b = 2.5;
  var corners = getPlaneCorners(a,b,L);

  var corners2 = getPlaneCorners2(a,b,L);
  ok(corners.length == 4, 'length');
  ok(corners2.length == 4, 'length2');
  ok(corners.every(function(v) {return vecInPlane(v,a,b,TOL);}));

  ok(cornersContainVecs(corners,
                        new THREE.Vector3(L,L,b),
                        new THREE.Vector3(-L,-L,b),
                        new THREE.Vector3(L,-L,b),
                        new THREE.Vector3(-L,L,b), TOL), 'vecs');
  ok(cornersContainVecs(corners2,
                        new THREE.Vector3(L,L,b),
                        new THREE.Vector3(-L,-L,b),
                        new THREE.Vector3(L,-L,b),
                        new THREE.Vector3(-L,L,b), TOL), 'vecs2');
});

test( "getPlaneCorners: a=(0,0,1), b gross", function() {
  var L = 5;
  var a = new THREE.Vector3(0,0,1);
  var b = 2*L;
  var corners = getPlaneCorners(a,b,L);
  var corners2 = getPlaneCorners2(a,b,L);
  ok(corners.length === 0);
  ok(corners2.length === 0);
});

test( "getPlaneCorners: a=(0,0,1), b Grenz", function() {
  var L = 5;
  var a = new THREE.Vector3(0,0,1);
  var b = L;
  var corners = getPlaneCorners(a,b,L);
  var corners2 = getPlaneCorners2(a,b,L);
  ok(corners.length === 4);
  ok(corners2.length === 4);
  ok(cornersContainVecs(corners,
                        new THREE.Vector3(L,L,L),
                        new THREE.Vector3(L,-L,L),
                        new THREE.Vector3(-L,L,L),
                        new THREE.Vector3(-L,-L,L), TOL), 'vecs');
  ok(cornersContainVecs(corners2,
                        new THREE.Vector3(L,L,L),
                        new THREE.Vector3(L,-L,L),
                        new THREE.Vector3(-L,L,L),
                        new THREE.Vector3(-L,-L,L), TOL), 'vecs2');
});


test( "getPlaneCorners: a=(+-1,0,0), b Grenz", function() {
  var L = 5;
  var a = new THREE.Vector3(1,0,0);
  var b = L;
  var corners = getPlaneCorners(a,b,L);
  var corners2 = getPlaneCorners2(a,b,L);
  ok(corners.length === 4);
  ok(corners2.length === 4);
  ok(cornersContainVecs(corners,
                        new THREE.Vector3(L,L,L),
                        new THREE.Vector3(L,-L,L),
                        new THREE.Vector3(L,L,-L),
                        new THREE.Vector3(L,-L,-L), TOL), 'vecs1');
  ok(cornersContainVecs(corners2,
                        new THREE.Vector3(L,L,L),
                        new THREE.Vector3(L,-L,L),
                        new THREE.Vector3(L,L,-L),
                        new THREE.Vector3(L,-L,-L), TOL), 'vecs2');
  b = -L;
  corners = getPlaneCorners(a,b,L);
  corners2 = getPlaneCorners2(a,b,L);
  ok(corners.length === 4);
  ok(corners2.length === 4);
  ok(cornersContainVecs(corners,
                        new THREE.Vector3(-L,L,L),
                        new THREE.Vector3(-L,-L,L),
                        new THREE.Vector3(-L,L,-L),
                        new THREE.Vector3(-L,-L,-L), TOL), 'vecs3');
  ok(cornersContainVecs(corners2,
                        new THREE.Vector3(-L,L,L),
                        new THREE.Vector3(-L,-L,L),
                        new THREE.Vector3(-L,L,-L),
                        new THREE.Vector3(-L,-L,-L), TOL), 'vecs4');
});

test( "getPlaneCorners: a=(0,-1,0), b Grenz", function() {
  var L = 5;
  var a = new THREE.Vector3(0,-1,0);
  var b = L;
  var corners = getPlaneCorners(a,b,L);
  var corners2 = getPlaneCorners2(a,b,L);
  ok(corners.length === 4);
  ok(corners2.length === 4);
  ok(cornersContainVecs(corners,
                        new THREE.Vector3(L,-L,L),
                        new THREE.Vector3(L,-L,-L),
                        new THREE.Vector3(-L,-L,L),
                        new THREE.Vector3(-L,-L,-L), TOL), 'vecs');
  ok(cornersContainVecs(corners2,
                        new THREE.Vector3(L,-L,L),
                        new THREE.Vector3(L,-L,-L),
                        new THREE.Vector3(-L,-L,L),
                        new THREE.Vector3(-L,-L,-L), TOL), 'vecs2');
});



test( "getPlaneCorners: a=(-1,0,0)", function() {
  var L = 5;
  var a = new THREE.Vector3(-1,0,0);
  var b = 2.5;
  var corners = getPlaneCorners(a,b,L);
  var corners2 = getPlaneCorners2(a,b,L);
  ok(corners.length == 4, 'length');
  ok(corners2.length == 4, 'length');
  ok(cornersContainVecs(corners,
                        new THREE.Vector3(-b,L,L),
                        new THREE.Vector3(-b,L,-L),
                        new THREE.Vector3(-b,-L,L),
                        new THREE.Vector3(-b,-L,-L), TOL), 'vecs');
  ok(cornersContainVecs(corners2,
                        new THREE.Vector3(-b,L,L),
                        new THREE.Vector3(-b,L,-L),
                        new THREE.Vector3(-b,-L,L),
                        new THREE.Vector3(-b,-L,-L), TOL), 'vecs2');
});


test( "getPlaneCorners: a=(0,2,0)", function() {
  var L = 4;
  var a = new THREE.Vector3(0,2,0);
  var b = 3.5;
  var corners = getPlaneCorners(a,b,L);
  var corners2 = getPlaneCorners2(a,b,L);
  ok(corners.length == 4, 'length');
  ok(corners2.length == 4, 'length');
  ok(cornersContainVecs(corners,
                        new THREE.Vector3(L,b/a.y,L),
                        new THREE.Vector3(L,b/a.y,-L),
                        new THREE.Vector3(-L,b/a.y,L),
                        new THREE.Vector3(-L,b/a.y,-L), TOL), 'vecs');
  ok(cornersContainVecs(corners2,
                        new THREE.Vector3(L,b/a.y,L),
                        new THREE.Vector3(L,b/a.y,-L),
                        new THREE.Vector3(-L,b/a.y,L),
                        new THREE.Vector3(-L,b/a.y,-L), TOL), 'vecs2');
});

test( "getPlaneCorners: a=(1,1,0)", function() {
  var L = 4;
  var a = new THREE.Vector3(1,1,0);
  var b = 0;
  var corners = getPlaneCorners(a,b,L);
  var corners2 = getPlaneCorners2(a,b,L);
  ok(corners.length == 4, 'length');
  ok(corners2.length == 4, 'length');
  ok(cornersContainVecs(corners,
                        new THREE.Vector3(L,-L,L),
                        new THREE.Vector3(L,-L,-L),
                        new THREE.Vector3(-L,L,L),
                        new THREE.Vector3(-L,L,L), TOL), 'vecs');
  ok(cornersContainVecs(corners2,
                        new THREE.Vector3(L,-L,L),
                        new THREE.Vector3(L,-L,-L),
                        new THREE.Vector3(-L,L,L),
                        new THREE.Vector3(-L,L,L), TOL), 'vecs2');
});


test( "getPlaneCorners: a=(1,1,1), b grenz", function() {
  var L = 1;
  var a = new THREE.Vector3(1,1,1).normalize();
  var b = Math.sqrt(3);
  var corners = getPlaneCorners(a,b,L);
  var corners2 = getPlaneCorners2(a,b,L);
  ok(corners.length == 1, 'length');
  ok(corners2.length == 1, 'length');
  ok(compareVecs(corners[0], new THREE.Vector3(L,L,L), TOL));
  ok(compareVecs(corners2[0], new THREE.Vector3(L,L,L), TOL));

  corners = getPlaneCorners(a,-b,L);
  corners2 = getPlaneCorners2(a,-b,L);
  ok(corners.length == 1, 'length');
  ok(corners2.length == 1, 'length');
  ok(compareVecs(corners[0], new THREE.Vector3(-L,-L,-L), TOL));
  ok(compareVecs(corners2[0], new THREE.Vector3(-L,-L,-L), TOL));
});


test( "getPlaneCorners: a=(1,1,1), b < grenz", function() {
  var L = 1;
  var a = new THREE.Vector3(1,1,1).normalize();
  var b = 0.95 * Math.sqrt(3);
  var corners = getPlaneCorners(a,b,L);
  ok(corners.length == 3, 'length');
});

test( "getPlaneCorners: a=(1,1,1), b < klein", function() {
  var L = 1;
  var a = new THREE.Vector3(1,1,1).normalize();
  var b = 0.1 * Math.sqrt(3);
  var corners = getPlaneCorners(a,b,L);
  ok(corners.length == 6, 'length');
});



test("calcIntersectionLine1", function() {

  var L = 2;
  var a1 = new THREE.Vector3(1,0,0);
  var b1 = 0.5;
  var a2 = new THREE.Vector3(0,1,0);
  var b2 = -1.5;
  var ips = calcIntersectionLine(a1, b1, a2, b2, L);
  ok(ips.length === 2);
  ok(compareVecs(ips[0], new THREE.Vector3(b1, b2, -L), TOL));
  ok(compareVecs(ips[1], new THREE.Vector3(b1, b2, L), TOL));
});



test("calcIntersectionLine2", function() {

  var L = 2;
  var a1 = new THREE.Vector3(0,0,1);
  var b1 = 0;
  var a2 = new THREE.Vector3(1,-1,1);
  var b2 = 0;
  var ips = calcIntersectionLine(a1, b1, a2, b2, L);
  ok(ips.length === 2);
  ok(compareVecs(ips[0], new THREE.Vector3(-L, -L, 0), TOL));
  ok(compareVecs(ips[1], new THREE.Vector3(L, L, 0), TOL));
});
