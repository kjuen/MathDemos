/*global JXG */

var brd = JXG.JSXGraph.initBoard('box', {boundingbox: [-10, 10, 10, -6],
                                         showNavigation:false,
                                         showCopyright: false,
                                         axis:true});
brd.create('text', [10-0.5, 0.25, 't']);
brd.create('text', [0.2,6-0.5, 'y(t)']);

var A = brd.create('slider',[[-8,9],[-3,9],[0,2,5]], {name:'A'});
var omega = brd.create('slider',[[-8,7.5],[-3,7.5],[0,1,5]], {name:'&omega;'});
var phi = brd.create('slider',[[-8,6],[-3,6],[-Math.PI,0,Math.PI]], {name: '&phi;'});


var f = brd.create('functiongraph',[function(x){
  return A.Value()*Math.cos(omega.Value()*x + phi.Value());}],
                   {strokeColor:'blue',
                    strokeWidth:2
                   });

A.on('drag',function(){ brd.update();});
omega.on('drag',function(){ brd.update();});
phi.on('drag',function(){ brd.update();});
