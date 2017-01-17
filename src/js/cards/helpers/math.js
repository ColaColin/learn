var ko = require("knockout");
var _ = require("lodash");

var makeMatrixDisplay = function(observe) {
	return ko.computed(function() {
		var m = observe();
		
		if (m[0] !== undefined && !_.isArray(m[0])) {
			var ar = [];
			for (var i = 0; i < m.length; i++) {
				ar.push([m[i]]);
			}
			m = ar;
		}
		
		var str = "$ \\begin{pmatrix}";
		
		for (var h = 0; h < m.length; h++) {
			var line = "";
			for (var w = 0; w < m[h].length; w++) {
				line += m[h][w];
				if (w + 1 < m[h].length) {
					line += " & ";
				}
			}
			if (h + 1 < m.length) {
				line += " \\\\ ";
			}
			str += line;
		}
		
		str += "\\end{pmatrix} $";
		return str;
	});
};

var makeVectorDisplay = function(observe) {
	return ko.computed(function() {
		var v = observe();
		if (v) {
			return "$ \\begin{pmatrix} "+v[0].toFixed(2)+" \\\\ "+ v[1].toFixed(2) +"  \\end{pmatrix} $";
		} else {
			return "";
		}
	});
};

var makeVarDisplay = function(name, observe) {
	return ko.computed(function() {
		var v = observe();
		return "$ "+name+" = " + v.toFixed(2) + " $";
	});
};

var vecsEqual = function(a, b) {
	return eq(a[0], b[0]) && eq(a[1], b[1]) && a.length === 2 && b.length === 2;
};

var parseVector = function(str) {
	if (str == null || str.length == 0) {
		str = "0";
	}
	return str.trim().replace(",", ".").split(/ +/).map(Number);
};

var implicitLine = function(pa, pb) {
	var n = [pa[1] - pb[1], pb[0] - pa[0]];
	return {
		n: n,
		p0: pa,
	};
};

// returns null for parallel lines (so also for identical lines)
var intersectLines = function(pa1, pb1, pa2, pb2) {
	var impl1 = implicitLine(pa1, pb1);
	var impl2 = implicitLine(pa2, pb2);
	
	var c = impl1.n[0] * impl1.p0[0] + impl1.n[1] * impl1.p0[1];
	var l = impl2.n[0] * impl2.p0[0] + impl2.n[1] * impl2.p0[1];
	
	c = -c;
	l = -l;
	 
	var a = impl1.n[0];
	var b = impl1.n[1];
	var j = impl2.n[0];
	var k = impl2.n[1];
	
	var denom = (b*j - a*k);
	if (denom == 0) {
		return null;
	} else {
		var x = (c*k - b*l) / denom;
		var y =  (a * l - c * j) / denom;
		return [x,y];
	}
};

var eq = function(a, b) {
	var d = Math.abs(a - b);
	return d < 0.0101;
};

module.exports = {
	makeMatrixDisplay: makeMatrixDisplay,
	makeVectorDisplay: makeVectorDisplay,
	makeVarDisplay: makeVarDisplay,
	vecsEqual: vecsEqual,
	parseVector: parseVector,
	implicitLine: implicitLine,
	intersectLines: intersectLines,
	eq: eq
};