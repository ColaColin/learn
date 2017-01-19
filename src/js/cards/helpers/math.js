var ko = require("knockout");
var _ = require("lodash");
var glm = require("gl-matrix");

var eq = function(a, b) {
	var d = Math.abs(a - b);
	return d < 0.0101;
};

var eqMat3 = function(a, b) {
	for (var i = 0; i < a.length; i++) {
		if (!eq(a[i], b[i])) {
			return false;
		}
	}
	return true;
};

var convertMat3ToMatrix = function(m) {
	var result = [];
	for (var i = 0; i < 3; i++) {
		var row = [];
		for (var k = 0; k < 3; k++) {
			row.push(m[i + k*3]);
		}
		result.push(row);
	}
	return result;
};

var convertMatrixToMat3 = function(m) {
	if (m.length === 3 && m[0].length === 3 && m[1].length === 3 && m[2].length === 3) {
		return glm.mat3.fromValues(m[0][0], m[1][0], m[2][0], 
				m[0][1], m[1][1], m[2][1], 
				m[0][2], m[1][2], m[2][2]);
	} else {
		return glm.mat3.create();
	}
};

var makeMat3Input = function(txtObserve) {
	return ko.computed(function() {
		mi = txtObserve();
		var matrix = mi.split(/\n+/).map(function(l) {
			return l.trim().replace(",", ".").split(/ +/).map(Number);
		});
		return convertMatrixToMat3(matrix);
	});
};

var makeMat3Display = function(observe) {
	var converted = ko.computed(function() {
		return convertMat3ToMatrix(observe());
	});
	return makeMatrixDisplay(converted);
};

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
				var val = m[h][w];
				if (val % 1 !== 0) {
					val = val.toFixed(2);
				}
				line += val;
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

var rndVal = function() {
	return Math.floor(Math.random() * 12) - 6;
};

var rndPoint = function(fac) {
	if (fac === undefined) {
		fac = 1;
	}
	return [rndVal() * fac, rndVal() * fac];
};

module.exports = {
	makeMatrixDisplay: makeMatrixDisplay,
	makeVectorDisplay: makeVectorDisplay,
	makeVarDisplay: makeVarDisplay,
	vecsEqual: vecsEqual,
	parseVector: parseVector,
	implicitLine: implicitLine,
	intersectLines: intersectLines,
	eq: eq,
	rndVal: rndVal,
	rndPoint: rndPoint,
	makeMat3Display: makeMat3Display,
	makeMat3Input: makeMat3Input,
	eqMat3: eqMat3
};