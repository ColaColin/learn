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



module.exports = {
	makeMatrixDisplay: makeMatrixDisplay,
};