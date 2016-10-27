/*global JXG */

// namespace fuer Applikation
var zd = {
    dynamic: false,
    boxHeight: 1.6,
    taxisLen: 3*Math.PI,
    freq:0.2,
    phaseColor:'purple'
};



// --- Board 4 mit Slidern
zd.brd4 = JXG.JSXGraph.initBoard('jxgbox4',
                                 {boundingbox:[-1, 1, 1, -1],
                                  keepaspectratio:true,
                                  axis:false,
                                  showCopyright: true,
                                  showNavigation: false});

zd.tSlider = zd.brd4.create('slider', [[-0.5, 0.5], [0.5, 0.5], [0, 0, 1/zd.freq]],
                            {name:'Zeit', strokeColor:'red', fillColor:'red'});
zd.phaseSlider = zd.brd4.create('slider', [[-0.5, 0], [0.5, 0], [0, 0, 2*Math.PI]],
                                {name:'Phase', strokeColor:zd.phaseColor, fillColor:zd.phaseColor});

zd.xfunc = function(t) {return Math.cos(2 * Math.PI * zd.freq * t + zd.phaseSlider.Value());};
zd.yfunc = function(t) {return Math.sin(2 * Math.PI * zd.freq * t + zd.phaseSlider.Value());};
zd.xfuncCur = function() {return zd.xfunc(zd.tSlider.Value());};
zd.yfuncCur = function() {return zd.yfunc(zd.tSlider.Value());};
zd.tfunc = function() {return zd.tSlider.Value();};


// --- Board brd1: Der eigentliche, rotierende Zeiger ---
zd.brd1 = JXG.JSXGraph.initBoard('jxgbox1',
                                 {boundingbox:[-zd.boxHeight,  zd.boxHeight,
                                               zd.boxHeight, -zd.boxHeight],
                                  keepaspectratio:true,
                                  axis:true,
                                  showCopyright: false,
                                  showNavigation: false});
zd.brd1.defaultAxes.x.removeAllTicks();
zd.brd1.defaultAxes.y.removeAllTicks();
zd.brd4.addChild(zd.brd1);
zd.brd1.create('text', [zd.boxHeight-0.2, 0.15, 'x']);
zd.brd1.create('text', [0.1,zd.boxHeight-0.15, 'y']);

zd.brd1.create('circle', [[0,0], 1],
               {strokeColor:'gray',
                strokeWidth:1,
                strokeOpacity:0.75});


zd.pointB = zd.brd1.create('point',
                           [function() {return zd.xfunc(0);}, function() {return zd.yfunc(0);}],
                           {face:'o',
                            withLabel:false,
                            frozen:true,
                            size:1.5, strokeColor:zd.phaseColor,
                            fillColor:zd.phaseColor});
zd.brd1.create('segment',[[0,0],zd.pointB],{strokeWidth:1.5, strokeColor:zd.phaseColor});

zd.point1 = zd.brd1.create('point',
                           [zd.xfuncCur, zd.yfuncCur],
                           {face:'o',
                            withLabel:true,
                            name:'z(t)',
                            size:2, strokeColor:'red',
                            fillOpacity:1, strokeOpacity: 1});
zd.brd1.create('arrow',[[0,0],zd.point1],{strokeWidth:2, strokeOpacity:1, strokeColor:'black'});

zd.helperPoint1X = zd.brd1.create('point',
                                  [function() {return 0;}, zd.yfuncCur],
                                  {visible:false});
zd.line1X = zd.brd1.create('line',
                           [zd.helperPoint1X, zd.point1],
                           {strokeColor:'green', strokeWidth:2, dash:1,
                            straightFirst: false,straightLast: false});
zd.helperPoint1Y = zd.brd1.create('point',
                                  [zd.xfuncCur, function() {return 0;}],
                                  {visible:false});
zd.line1Y = zd.brd1.create('line',
                           [zd.helperPoint1Y, zd.point1],
                           {strokeColor:'blue', strokeWidth:2, dash:1,
                            straightFirst: false,straightLast: false});


// arcs: sind die wirklich gut?
zd.arcp0 = zd.brd1.create('point', [0.4,0], {visible:false});
zd.arcp1 = zd.brd1.create('point', [0,0], {visible:false});
zd.arcp2 = zd.brd1.create('point',
                          [function() {return 0.4*zd.xfunc(0);}, function() {return 0.4*zd.yfunc(0);}],
                          {visible:false});
zd.arcp3 = zd.brd1.create('point',
                          [function() {return 0.4*zd.xfuncCur();}, function() {return 0.4*zd.yfuncCur();}],
                          {visible:false});

zd.brd1.create('sector', [zd.arcp1, zd.arcp2, zd.arcp3], {fillColor:'red', strokeColor:'red', fillOpacity:0.25});
zd.brd1.create('sector', [zd.arcp1, zd.arcp0, zd.arcp2], {fillColor:zd.phaseColor, strokeColor:zd.phaseColor, fillOpacity:0.2});


// --- Board brd2: Das rechte Achsenkreuz mit dem Imaginärteil
zd.brd2 = JXG.JSXGraph.initBoard('jxgbox2',
                                 {boundingbox:[-0.75,  zd.boxHeight,
                                               zd.taxisLen, -zd.boxHeight],
                                  keepaspectratio:false,
                                  axis:true,
                                  grid:false,
                                  showCopyright: false,
                                  showNavigation: false});
zd.brd2.defaultAxes.x.removeAllTicks();
zd.brd2.defaultAxes.y.removeAllTicks();

zd.brd4.addChild(zd.brd2);   // damit das Board auf slider updates reagiert

zd.brd2.create('text', [zd.taxisLen-0.5, 0.15, 't']);
zd.brd2.create('text', [0.2,zd.boxHeight-0.15, 'y(t)']);
zd.brd2.create('functiongraph',

               [zd.yfunc, 0, zd.taxisLen-1],
               {strokeColor:'blue', strokeWidth:2});
zd.point2 = zd.brd2.create('point',
                           [zd.tfunc, zd.yfuncCur],
                           {face:'o',
                            withLabel:false,
                            size:2, strokeColor:'red',
                            fillOpacity:1, strokeOpacity: 1});

zd.helperPoint2 = zd.brd2.create('point',
                                 [zd.tfunc, function() {return 0;}],
                                 {visible:false});
zd.line2 = zd.brd2.create('line',
                          [zd.helperPoint2, zd.point2],
                          {strokeColor:'blue', strokeWidth:2, dash:1,
                           straightFirst: false,straightLast: false});

// --- Board brd3: Das untere Achsenkreuz mit dem Realteil
zd.brd3 = JXG.JSXGraph.initBoard('jxgbox3',
                                 {boundingbox:[-zd.boxHeight, 0.75,
                                               zd.boxHeight, -zd.taxisLen],
                                  keepaspectratio:false,
                                  axis:false,
                                  grid:false,
                                  showCopyright: false,
                                  showNavigation: false});
zd.brd4.addChild(zd.brd3);
zd.ax3x = zd.brd3.create('axis', [[0, 0.75],
                                  [0, -zd.taxisLen]]);
zd.ax3x.removeAllTicks();
zd.ax3y = zd.brd3.create('axis', [[-zd.boxHeight, 0],
                                  [zd.boxHeight, 0]]);
zd.ax3y.removeAllTicks();
zd.brd3.create('text', [0.1, -zd.taxisLen+0.5, 't']);
zd.brd3.create('text', [zd.boxHeight-0.25, 0.4, 'x(t)']);

zd.brd3.create('curve',
               [zd.xfunc, function(t) {return -t;}, 0, zd.taxisLen-1],
               {strokeColor:'green', strokeWidth:2});
zd.point3 = zd.brd3.create('point',
                           [zd.xfuncCur, function() {return -zd.tSlider.Value();}],
                           {face:'o',
                            withLabel:false,
                            size:2, strokeColor:'red',
                            fillOpacity:1, strokeOpacity: 1});

zd.helperPoint3 = zd.brd3.create('point',
                                 [function() {return 0;}, function() {return -zd.tSlider.Value();}],
                                 {visible:false});
zd.line3 = zd.brd3.create('line',
                          [zd.helperPoint3, zd.point3],
                          {strokeColor:'green', strokeWidth:2, dash:1,
                           straightFirst: false,straightLast: false});


function go(t) {
    requestAnimationFrame(go);
    if(t===undefined) {
        t = 0;
    }
    tprev = t;
    t = t/1000;   // Zeit t in Sekunden
    var x = Math.cos(2 * Math.PI * zd.freq * t);
    var y = Math.sin(2 * Math.PI * zd.freq * t);

    zd.point1.moveTo([x,y]);
}
if(zd.dynamic) {
    var tprev = 0;

    go();

} else {
    var t = 0;
    var x = Math.cos(2 * Math.PI * zd.freq * t);
    var y = Math.sin(2 * Math.PI * zd.freq * t);
    zd.point1.moveTo([x,y]);
}
