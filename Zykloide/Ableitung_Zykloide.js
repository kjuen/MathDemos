// Zykloide inklusive Ableitung

function setSliderVis(slid, vis) {
    slid.setAttribute({visible:vis, withLabel:vis});
    slid.baseline.setAttribute({visible:vis});
    slid.highline.setAttribute({visible:vis});
    slid.update();
}

// --- Definition der Parameter ---
var radius = 1;    // Radius des Kreises
var omega = 1;     // Winkelgeschwindigkeit des Rades

// --- Berechnung der Bahnkurve ---
function cycloideX(t) {
    return radius * omega * t - sliderAbstand.Value() * Math.sin(omega * t);
}
function cycloideY(t) {
    return radius - sliderAbstand.Value() * Math.cos(omega * t);
}


// --- Initialisierung des Achsenkreuzes inkl. t- und a-Slider ---
var brd = JXG.JSXGraph.initBoard('jxgbox',
                                 {boundingbox:[-1.5,  4.5,
                                               3*Math.PI, -0.5],
                                  keepaspectratio:true,
                                  axis:true,
                                  showCopyright: true,
                                  showNavigation: false});
var ursprung = brd.create('point', [0, 0], {visible:false});
brd.initInfobox();

// Die Labels dieser beiden Slider werden nicht angezeigt !?!?!?
var sliderT = brd.create('slider', [[1,4], [3.5,4], [0,2,3*Math.PI]],
                         {name:'t', withLabel:true});
setSliderVis(sliderT, true);

var sliderAbstand = brd.create('slider', [[5,4], [7.5,4], [0.5,1,1.5]],
                               {name:"a", withLabel:true});
setSliderVis(sliderAbstand, true);

// --- Darstellung der Bahnkurve und des Punktes auf der Kurve ---
brd.create('curve', [cycloideX, cycloideY, 0, 3*Math.PI],
           {withTicks:true,
            strokeWidth:2,   // Linewidth
            name:"Zykloide",
            infoboxtext:"Zykloide",
            showInfobox:true,
            handDrawing:false});

var g1 = brd.create('point',
                    [function() {return cycloideX(sliderT.Value());},
                     function() {return cycloideY(sliderT.Value());}],
                    {fixed:true,
                     name:"P",
                     withLabel:false});


// Ortsvektor r(t)
var vecrt = brd.create('arrow', [ursprung, g1],
                       {name:"r(t)",
                        infoboxtext:"r(t)",
                        strokeColor:'black',
                        strokeWidth:1,
                        visible:false});
// Text an Vektor r(t) anbringen (oder lieber per Legende?)
// (wird momentan nicht gebraucht)
var txtrt = brd.create('text',
                       [function() {
                           var ac = vecrt.getTextAnchor();
                           ac.normalizeUsrCoords();
                           // alert(ac.usrCoords[0]);
                           return ac.usrCoords[1];
                       },
                        function() {
                            var ac = vecrt.getTextAnchor();
                            ac.normalizeUsrCoords();
                            return ac.usrCoords[2]-0.1;},
                        function() {
                            return '$$\\vec{r}(t)$$';
                        }],
                       {visible:false});

// --- Darstellung des Rades
var radVisibility = true;
var radOpacity = 1;
var circleCenter = brd.create('point',
                              [function() {return radius * sliderT.Value();},
                               radius],
                              {fixed:true,
                               name:"M",
                               withLabel:false,
                               strokeColor:'black',
                               fillcolor:'black',
                               size:1,
                               strokeOpacity:radOpacity,
                               fillOpacity: radOpacity,
                               visible:radVisibility});

// Ortsvektor zum Kreismittelpunkt
var centerVec = brd.create('arrow', [ursprung, circleCenter],
                           { straightFirst : false,
                             straightLast : false,
                             strokeColor: 'green',
                             visible:false});


var circ = brd.create('circle', [circleCenter, radius],
                      {strokeColor:'black',
                       strokeWidth:0.75,
                       strokeOpacity:radOpacity,
                       visible:radVisibility});

var circRadius = brd.create('line', [circleCenter, g1],
                            { straightFirst : false,
                              straightLast : false,
                              strokeColor: 'black',
                              strokeOpacity:radOpacity,
                              visible:radVisibility});



// --- Konstruktion der Ableitung ---
var ablVisibility = false;
var ablOpacity = 1;

// calculate endpoint of secant starting at the point with parameter t and
// goint through the point with parameter t+Dt
function endpointSecant(t, Dt) {
    if(Dt >= 0.001) {
        var x = 1/Dt * cycloideX(t+Dt) + (1-1/Dt)*cycloideX(t);
        var y = 1/Dt * cycloideY(t+Dt) + (1-1/Dt)*cycloideY(t);
        var ep = brd.create('point', [x,y],
                            {fixed:true,
                             visible:false});
        return ep;
    } else {
        return endpointSecant(t, 0.0015);
    }
}


var sliderDeltaT = brd.create('slider', [[1,3.5], [4,3.5], [0,0.5,1]],
                              {name:"&Delta; t",
                               visible:false,
                               withLabel:false});
setSliderVis(sliderDeltaT, false);


// Der Punkt r(t+Dt):
var g2 = brd.create('point',
                    [function() {return cycloideX(sliderT.Value() +
                                                  sliderDeltaT.Value());},
                     function() {return cycloideY(sliderT.Value() +
                                                  sliderDeltaT.Value());}],
                    {fixed:true,
                     name:"Q",
                     size:2,
                     visible:ablVisibility,
                     withLabel:true,
                     strokeOpacity:ablOpacity,
                     fillOpacity:ablOpacity,
                     strokeColor:'green',
                     fillcolor:'green'});
// Ortsvektor r(t+Dt)
var vecrtDt = brd.create('arrow', [ursprung, g2],
                         {name:"r(t+Dt)",
                          infoboxtext:"r(t+Dt)",
                          strokeColor:'aqua',
                          strokeWidth:1,
                          visible:ablVisibility,
                          strokeOpacity:ablOpacity,
                          fillOpacity:ablOpacity});



var pq = brd.create('arrow',
                    [g1, function()
                     {return endpointSecant(sliderT.Value(),
                                            sliderDeltaT.Value());}],
                    {strokeColor:'green',
                     visible:ablVisibility,
                     strokeOpacity:ablOpacity,
                     fillOpacity:ablOpacity});


// --- Callbacks der HTML-Checkboxen ---

function radCheckbox() {
    var checked = document.getElementById("rad").checked;
    var radElems = [circleCenter, circ, circRadius];
    for(var k =0; k<radElems.length; ++k) {
        radElems[k].setAttribute({visible:!checked});
        radElems[k].update();
    }
}

function herlCheckbox() {
    var checked = document.getElementById("Herleitung").checked;
    var p = document.getElementById("herl_text");
    if(checked) {
        p.style.display="block";
        vecrt.setAttribute({visible:true});
        circRadius.setAttribute({strokeColor: 'red',
                                 strokeOpacity:1,
                                 lastArrow:true,
                                 visible:true});
        circleCenter.setAttribute({visible:true, withLabel:true});
        centerVec.setAttribute({visible:true});
        g1.setAttribute({withLabel:true});
    } else {
        p.style.display="none";
        vecrt.setAttribute({visible:false});
        circRadius.setAttribute({strokeColor: 'black',
                                 strokeOpacity:radOpacity,
                                 visible:false,
                                 lastArrow:false});
        circleCenter.setAttribute({visible:false, withLabel:false});
        centerVec.setAttribute({visible:false});
        g1.setAttribute({withLabel:false});
    }
    vecrt.update();
    circRadius.update();
    circleCenter.update();
    centerVec.update();
    g1.update();
}

function abl1Checkbox() {
    var checked = document.getElementById("Abl1").checked;
    var p = document.getElementById("abl1_text");
    if(checked) {
        p.style.display="block";
        vecrtDt.setAttribute({visible:true});
        vecrt.setAttribute({visible:true, strokeColor:"red"});
        pq.setAttribute({visible:true});
        g1.setAttribute({withLabel:true});
        g2.setAttribute({visible:true, withLabel:true});
        setSliderVis(sliderDeltaT, true);
    } else {
        p.style.display="none";
        vecrtDt.setAttribute({visible:false});
        vecrt.setAttribute({visible:false, strokeColor:"black"});
        pq.setAttribute({visible:false});
        g1.setAttribute({withLabel:false});
        g2.setAttribute({visible:false, withLabel:false});
        setSliderVis(sliderDeltaT, false);
    }
    vecrt.update();
    vecrtDt.update();
    pq.update();
    g1.update();
    g2.update();
    sliderDeltaT.update();
}
