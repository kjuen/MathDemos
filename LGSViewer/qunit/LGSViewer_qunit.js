/*global test, ok, calcIntersectionLine, QUnit, lgsCon */

/**
 * @author K. Juenemann / https://github.com/kjuen
 */


// qunit tests for LGSViewer

const TOL = 0.0000001;


function compareVecs(v1, v2, tol=TOL) {
  return Math.abs(v1.x - v2.x) < tol
    && Math.abs(v1.y - v2.y) < tol
    && Math.abs(v1.z - v2.z) < tol;
}


/**
 * checks if vector is contained in plane a*x = b
 */
function vecInPlane(v, a, b, tol) {
  const av = v.clone().dot(a);
  return Math.abs(av - b) < tol;
}



QUnit.test("calcIntersectionLine1", function(assert) {

  const L = 2;
  const a1 = new THREE.Vector3(1,0,0);
  const b1 = 0.5;
  const a2 = new THREE.Vector3(0,1,0);
  const b2 = -1.5;
  const ips = calcIntersectionLine(a1, b1, a2, b2, L);
  assert.ok(ips.length, 2);
  assert.ok(compareVecs(ips[0], new THREE.Vector3(b1, b2, -L), TOL));
  assert.ok(compareVecs(ips[1], new THREE.Vector3(b1, b2, L), TOL));
});



QUnit.test("calcIntersectionLine2", function(assert) {

  const L = 2;
  const a1 = new THREE.Vector3(0,0,1);
  const b1 = 0;
  const a2 = new THREE.Vector3(1,-1,1);
  const b2 = 0;
  const ips = calcIntersectionLine(a1, b1, a2, b2, L);
  assert.equal(ips.length,2);
  assert.ok(compareVecs(ips[0], new THREE.Vector3(-L, -L, 0), TOL));
  assert.ok(compareVecs(ips[1], new THREE.Vector3(L, L, 0), TOL));
});




QUnit.test("calcIntersectionLine3", function(assert) {

  const L = lgsCon.planeSize;
  const a1 = new THREE.Vector3(0.2, 0.1, 0);
  const b1 = 1;
  const a2 = new THREE.Vector3(0,0,1);
  const b2 = 1;
  const ips = calcIntersectionLine(a1, b1, a2, b2, L);
  assert.equal(ips.length, 2);
  assert.ok(!compareVecs(ips[0], ips[1]), TOL);

});
