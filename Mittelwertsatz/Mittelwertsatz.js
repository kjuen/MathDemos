/*global JXG */

// code from http://jsxgraph.uni-bayreuth.de/wiki/index.php/Mean_Value_Theorem

var board = JXG.JSXGraph.initBoard('jxgbox', {
  boundingbox: [-5, 10, 7, -6],
  showCopyright: true,
  showNavigation: false,
  axis:true});
board.suspendUpdate();
var p = [];
p[0] = board.create('point', [-1,-2], {size:2, name:'x_0', color:'blue'});
p[1] = board.create('point', [6,5], {size:2, name:'x', color:'blue'});
p[2] = board.create('point', [-0.5,1], {size:2, visible:false});
p[3] = board.create('point', [3,3], {size:2, visible:false});
var f = JXG.Math.Numerics.lagrangePolynomial(p);
var graph = board.create('functiongraph', [f,-10, 10]);

var g = function(x) {
  return JXG.Math.Numerics.D(f)(x)-(p[1].Y()-p[0].Y())/(p[1].X()-p[0].X());
};

var r = board.create('glider', [
  function() { return JXG.Math.Numerics.root(g,(p[0].X()+p[1].X())*0.5); },
  function() { return f(JXG.Math.Numerics.root(g,(p[0].X()+p[1].X())*0.5)); },
  graph], {name:'&eta;',size:2,fixed:true});
board.create('tangent', [r], {strokeColor:'#ff0000'});
var line = board.create('line',[p[0],p[1]],{strokeColor:'#ff0000',dash:1});

board.unsuspendUpdate();
