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
		return "$ \\begin{pmatrix} "+v[0].toFixed(2)+" \\\\ "+ v[1].toFixed(2) +"  \\end{pmatrix} $";
	});
};

var makeVarDisplay = function(name, observe) {
	return ko.computed(function() {
		var v = observe();
		return "$ "+name+" = " + v.toFixed(2) + " $";
	});
};

module.exports = {
	makeMatrixDisplay: makeMatrixDisplay,
	makeVectorDisplay: makeVectorDisplay,
	makeVarDisplay: makeVarDisplay
};