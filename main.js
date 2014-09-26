
function update(){
	updateFromDOM();
	draw();
	setTimeout(update, 0);
}

function rint(n){ return Math.floor(Math.random()*n); }
function rdbl(n){ return Math.random()*n;             }

canvas = null;
context = null;
points = null;
window.onload = function(){
	canvas = document.getElementById('myCanvas');
	context = canvas.getContext('2d');
	DOMElements = {
		xOffset:document.getElementById('xOffset'),
		xScale:document.getElementById('xScale'),
		xTicks:document.getElementById('xTicks'),
		yOffset:document.getElementById('yOffset'),
		yScale:document.getElementById('yScale'),
		yTicks:document.getElementById('yTicks'),
		start:document.getElementById('start'),
		end:document.getElementById('end'),
		sampleRange:document.getElementById('sampleRange')
	}

	getPoints();
	update();
}

var mainOptions = {
	func:f3,
	sample:randomSampleIntegral,
	start:0,
	end:5,
	sampleRange:700,
	pointFunction:getAccuracyMap
}

var getPoints = function(){
	var o = mainOptions;
	points = o.pointFunction(o.func, o.sample, o.start, o.end, o.sampleRange);
}

var line = function(x1, y1, x2, y2){
	context.beginPath();
	context.moveTo(x1, y1);
	context.lineTo(x2, y2);
	context.stroke();
}

var point = function(x, y){
	context.fillRect(x-1, y-1, 2, 2);
}
var DOMElements = null;
var updateFromDOM = function(){
	document.getElementById("xOffsetDiv").innerHTML     = "&nbsp" +( drawOptions.xOffset     = parseInt(document.getElementById("xOffset").value    ));
	document.getElementById("xScaleDiv").innerHTML      = "&nbsp" +( drawOptions.xScale      = parseInt(document.getElementById("xScale").value     ));
	document.getElementById("xTicksDiv").innerHTML      = "&nbsp" +( drawOptions.xTicks      = parseInt(document.getElementById("xTicks").value     ));
	document.getElementById("yOffsetDiv").innerHTML     = "&nbsp" +( drawOptions.yOffset     = parseInt(document.getElementById("yOffset").value    ));
	document.getElementById("yScaleDiv").innerHTML      = "&nbsp" +( drawOptions.yScale      = parseInt(document.getElementById("yScale").value     ));
	document.getElementById("yTicksDiv").innerHTML      = "&nbsp" +( drawOptions.yTicks      = parseInt(document.getElementById("yTicks").value     ));
	document.getElementById("startDiv").innerHTML       = "&nbsp" +( mainOptions.start       = parseInt(document.getElementById("start").value      ));
	document.getElementById("endDiv").innerHTML         = "&nbsp" +( mainOptions.end         = parseInt(document.getElementById("end").value        ));
	document.getElementById("sampleRangeDiv").innerHTML = "&nbsp" +( mainOptions.sampleRange = parseInt(document.getElementById("sampleRange").value));
	if(parseInt(document.getElementById("useFunction").value) == 1){
		document.getElementById("useFunctionDiv").innerHTML = "&nbsp" + "True";
		mainOptions.pointFunction = getFunctionMap;
	}
	else{
		document.getElementById("useFunctionDiv").innerHTML = "&nbsp" + "False";
		mainOptions.pointFunction = getAccuracyMap;
	}


	if(parseInt(document.getElementById("functionType").value) == 0){
		document.getElementById("functionTypeDiv").innerHTML = "&nbsp" + "Monte Carlo Sampling";
		mainOptions.sample = randomSampleIntegral;
	}
	else if(parseInt(document.getElementById("functionType").value) == 1){
		document.getElementById("functionTypeDiv").innerHTML = "&nbsp" + "Regular Interval Sampling";
		mainOptions.sample = regularSampleIntegral;	
	}
	else{
		document.getElementById("functionTypeDiv").innerHTML = "&nbsp" + "Importance Sampling";
		mainOptions.sample = importanceSampleIntegral;
	}
}

var drawOptions = {
	xOffset:50,
	xScale:1,
	xTicks:20,
	yOffset:0,
	yScale:20,
	yTicks:2
}

var importanceSampleReps = 10;

function draw(){
	context.fillStyle = '#ffffff';
	var h = canvas.height;
	var w = canvas.width;
	context.fillRect(0,0,w, h);
	context.fillStyle = '#000000';

	var xo = drawOptions.xOffset;
	var xs = drawOptions.xScale;
	var yo = drawOptions.yOffset+h/2;
	var ys = drawOptions.yScale;

	context.font = '10px Arial';
	context.textBaseline = 'middle';

	//mark the y-axis
	for(var i = yo; i > 0; i-=ys*drawOptions.yTicks){
		line(0,i,5,i);
		line(0,h-i,5,h-i);
		context.fillText(h/2-i, 10, i);
		context.fillText(-(h/2-i), 10, h-i);
	}

	//mark the x-axis
	for(var i = xo; i < w; i+=xs*drawOptions.xTicks){
		line(i,h,i,h-5);
		if(((i-xo)%50) == 0)
			context.fillText(i, i, h-10);
	}

	//plot points
	for(var i in points){
		var x = (xs*points[i].x);
		var y = (ys*points[i].y);
		point(x+xo, yo-y+y/2);
	}
}

function f1(x){ return x*x;              }
function f2(x){ return x*x+3*x+5;        }
function f3(x){ return x*Math.cos(10*x); }

function getAccuracyMap(f, s, a, b, n){
	for(var points = [], i = 2; i < n; i++)
		points.push({x:i, y:s(a, b, f, i).sum})
	return points;
}

function getFunctionMap(f, s, a, b, i){
	return s(a, b, f, i).pts;
}

//a, b >> range
//f    >> function in use
//n    >> number of samples
function randomSampleIntegral(a, b, f, n){
	for(var s=0, i = 0; i < n; i++)
		s += f(rdbl(b-a)+a);
	return s*(b-a)/n;
}

function cmpv(n,m){
	return parseFloat(n.v) - parseFloat(m.v);
}

function cmpi(n,m){
	return parseFloat(n.i) - parseFloat(m.i);
}

function printVals(v){
	var s = "";
	for(var i in v){
		s += 'v:' + v[i].v + ', f:' + v[i].f + ', i:' + v[i].i + ';  ';
	}
	console.log(s);
}

//a, b >> range
//f    >> function in use
//n    >> number of samples
function randomSampleIntegral(a, b, f, n){
	for(var p=[],s=0, i = 0; i < n; i++){
	  var x = rdbl(b-a)+a;
		var y = f(x);
		s += y;
		p.push({x:x, y:y});
	}
	return {pts:p, sum:s*(b-a)/n};
}

function importanceSampleIntegral(start, end, f, n){
	var vals = [], a = start, b = end, reps = importanceSampleReps;
	for(var r = 0; r < reps; r++){
		for(var i=a; i<b; i+=(b-a)/n){
			vals.push({v:0, f:f(i), i:i, a:0, b:0});
		}
		vals.sort(cmpi);
		for(var i in vals){
			if(vals[parseInt(i)-1]){
				vals[parseInt(i)].v += Math.abs(vals[parseInt(i)].f-vals[parseInt(i)-1].f);
				vals[parseInt(i)].a = vals[parseInt(i)-1].i;
			}
			if(vals[parseInt(i)+1]){
				vals[parseInt(i)].v += Math.abs(vals[parseInt(i)].f-vals[parseInt(i)+1].f);
				vals[parseInt(i)].b = vals[parseInt(i)+1].i;
			}
		}
		vals.sort(cmpv);
		var next = vals[vals.length-1];
		a = next.a;
		b = next.b;
	}
	var pts = [];
	var sum = 0;
	for(var i in vals){
			pts.push({x:vals[i].i, y:vals[i].f});
			sum+=vals[i].f;
	}
	return{pts:pts, sum:sum};
}

function regularSampleIntegral(a, b, f, n){
	for(var p=[],s=0, i=a; i<b; i+=(b-a)/n){
		var y = f(i);
		s += y;
		p.push({x:i, y:y});
	}
	return {pts:p, sum:s*(b-a)/n};
}