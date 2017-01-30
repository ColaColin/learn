var ko = require("knockout");
var _ = require("lodash");
var glm = require("gl-matrix");

var print2dArray = function(ar) {
	console.log(ar.map(function(a) {
		return a.map(function(n) {return n.toFixed(2)}).join(" ");
	}).join("\n"));
};

// the convolution is expected to be normalized already
// assumes that +128 is needed if the kernel has a sum of 0 (high pass filters)
// convolution is expected to be m x l
// 2d array, 2d array, "inner" | "zero_extended" | "border_extended"
var convolve2d = function(img2d, convolve2d, borderMode) {
	if (!img2d || !convolve2d) {
		return undefined;
	}
	
	var sum = 0;
	for (var i = 0; i < convolve2d.length; i++) {
		for (var j = 0; j < convolve2d[i].length; j++) {
			sum += convolve2d[i][j];
		}
	}
	
	normAdd = Math.abs(sum - 0) < 0.001 ? 128 : 0;
	var getImgValue = function(x, y) {
		if (x >= 0 && x < img2d[0].length &&
				y >= 0 && y < img2d.length) {
			return img2d[y][x];
		} else if (borderMode === "border_extended") {
			xb = Math.max(0, Math.min(img2d[0].length-1, x));
			yb = Math.max(0, Math.min(img2d.length-1, y));
			return img2d[yb][xb];
		} else if (borderMode === "zero_extended"){
			return 0;
		} else {
			return null;
		}
	};
	
	var result = JSON.parse(JSON.stringify(img2d));
	
	var l = (convolve2d[0].length-1) / 2;
	var m = (convolve2d.length-1) / 2;
	
	for (var y = 0; y < img2d.length; y++) {
		for (var x = 0; x < img2d[0].length; x++) {
			
			var badPix = false;
			var newValue = 0;
			for (var mi = -m; mi <= m && !badPix; mi++) {
				for (var li = -l; li <= l && !badPix; li++) {
					var px = getImgValue(x + li, y + mi);
					if (px !== null) {
						newValue += convolve2d[mi + m][li + l] * px;
					} else { // sort of lazy
						badPix = true;
					}
				}
			}
			if (badPix) {
				result[y][x] = 0;
			} else {
				result[y][x] = Math.floor(newValue) + normAdd;
			}
			
		}
	}
	
	return result;
};

var eq = function(a, b) {
	var d = Math.abs(a - b);
	return d < 0.0501;
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
	return a != null && b != null && a.length === 2 && b.length === 2 && eq(a[0], b[0]) && eq(a[1], b[1]);
};

var parseVector = function(str) {
	if (str == null || str.length == 0) {
		str = "0 0";
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


var rndR = function(start, end) {
	if (start > end) {
		var tmp = start;
		start = end;
		end = tmp;
	}
	var d = end - start;
	console.log(d);
	var r = Math.random() * d;
	return start + r;
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
	eqMat3: eqMat3,
	convolve2d: convolve2d,
	rndFrom: rndR,
};