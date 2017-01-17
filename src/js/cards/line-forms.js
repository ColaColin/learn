var preloaded = require("../../../Preloaded");
var ko = require("knockout");
var math = require("./helpers/math");

// given a random 2d line calculate between two points:
// parametric form
// the slope intersect form
// the hesse normal form
// implict form

function LFCard() {
	var self = this;
	
	var resultCb = function(){};
	
	self.setCallback = function(cb) {
		resultCb = cb;
	};
	
	self.correct = ko.observable(false);
	self.solved = ko.observable(false);
	self.showHints = ko.observable(false);
	
	var rndPoint = function() {
		return [Math.floor(Math.random() * 10) - 5, Math.floor(Math.random() * 10) - 5];
	};
	
	self.showNew = function() {
		self.correct(false);
		self.solved(false);
		self.showHints(false);
		self.pointA(rndPoint());
		self.pointB(rndPoint());
		self.parametricStartInput("");
		self.parametricDeltaInput("");
		self.slopeIntersectMInput("");
		self.slopeIntersectBInput("");
		self.hesseNInput("");
		self.hesseDInput("");
		self.implicitNInput("");
		self.implicitPInput("");
		
		self.pointA([0, 1]);
		self.pointB([-3, 3]);
	};
	
	self.giveHint = function() {
		self.showHints(true);
		
		setTimeout(function() {
			MathJax.Hub.Typeset();
		}, 150);
	};
	
	self.pointA = ko.observable(rndPoint());
	self.pointB = ko.observable();
	
	self.pointB.subscribe(function(pb) {
		var pa = self.pointA();
		if (pa[0] === pb[0] && pa[1] === pb[1]) {
			self.pointB(rndPoint());
		}
	});
	self.pointB(rndPoint());
	
	self.pointADisplay = math.makeMatrixDisplay(self.pointA);
	self.pointBDisplay = math.makeMatrixDisplay(self.pointB);
	
	eq = math.eq;
	
	vecsEqual = math.vecsEqual;
	
	self.solve = function() {
		var paramCorrect = self.parametricCorrect();
		var slopeCorrect = self.slopeIntersectCorrect();
		var implCorrect = self.implicitCorrect();
		var hesseCorrect = self.hesseCorrect();
		if (!paramCorrect) {
			console.log("parametric incorrect!");
		}
		if (!slopeCorrect) {
			console.log("slope intersect incorrect!");
		}
		if (!implCorrect) {
			console.log("implicit incorrect!");
		}
		if (!hesseCorrect) {
			console.log("hesse incorrect");
		}
		if (paramCorrect && slopeCorrect && hesseCorrect && implCorrect) {
			self.correct(true);
		}
		self.solved(true);
		
		setTimeout(function() {
			MathJax.Hub.Typeset();
		}, 150);
	};
	
	self.next = function() {
		resultCb(self.correct() && !self.showHints());
	};
	
	self.parametric = ko.computed(function() {
		var a = self.pointA();
		var b = self.pointB();
		var delta = [b[0] - a[0], b[1] - a[1]];
		return {
			start: a,
			delta: delta
		};
	});
	
	self.parametricStartInput = ko.observable("");
	self.parametricDeltaInput = ko.observable("");
	
	self.parametricInput = ko.computed(function() {
		var s = math.parseVector(self.parametricStartInput());;
		var d = math.parseVector(self.parametricDeltaInput());
		return {
			start: [Number(s[0]), Number(s[1])],
			delta: [Number(d[0]), Number(d[1])]
		};
	});
	
	self.parametricCorrect = ko.computed(function() {
		var user = self.parametricInput();
		var exp = self.parametric();
		return vecsEqual(user.start, exp.start) && vecsEqual(user.delta, exp.delta);
	});
	
	self.parametricDisplay = ko.computed(function() {
		var param = self.parametric();
		return "$ \\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} " + param.start[0] + " \\\\ " +
			param.start[1] + " \\end{pmatrix} + t \\begin{pmatrix} " + param.delta[0] + " \\\\ " + param.delta[1]  + " \\end{pmatrix} $";
	});
	
	// normaly use y = mx + b
	self.slopeIntersect = ko.computed(function() {
		var pa = self.pointA();
		var pb = self.pointB();
		var divX = pb[0] - pa[0];
		var m, b;
		if (divX !== 0) {
			var divY = (pb[1] - pa[1]);
			if (divY) {
				// y = mx + b
				m = divY / divX;
				b = pa[1] - m * pa[0];
			} else {
				// y = b
				m = 0;
				b = pa[1];
			}
		} else {
			// x = b
			m = 0;
			b = pa[0];
		}
		return {
			m: m,
			b: b
		};
	});
	
	self.slopeIntersectMInput = ko.observable("");
	self.slopeIntersectBInput = ko.observable("");
	
	self.slopeIntersectCorrect = ko.computed(function() {
		var mIn = Number(self.slopeIntersectMInput().trim().replace(",", "."));
		var bIn = Number(self.slopeIntersectBInput().trim().replace(",", "."));
		var si = self.slopeIntersect();
		return eq(si.m, mIn) && eq(si.b, bIn);
	});
	
	self.slopeIntersectDisplay = ko.computed(function() {
		var si = self.slopeIntersect();
		if (si.m === 0) {
			var pa = self.pointA();
			var pb = self.pointB();
			if (pa[0] === pb[0]) {
				return "$ x = " + si.b.toFixed(2) + " $";
			} else {
				return "$ y = " + si.b.toFixed(2) + " $";
			}
		} else {
			return "$ y = " + si.m.toFixed(2) + " * x + " + si.b.toFixed(2) + "$";
		}
	});
	
	self.hesseNormal = ko.computed(function() {
		var pa = self.pointA();
		var pb = self.pointB();
		var n0 = [pa[1] - pb[1], pb[0] - pa[0]];
		var div = Math.sqrt(n0[0]*n0[0] + n0[1] * n0[1]);
		var n = [n0[0] / div, n0[1] / div];
		var d = n[0] * pa[0] + n[1] * pa[1];
		if (d < 0) {
			d *= -1;
			n[0] *= -1;
			n[1] *= -1;
		}
		return {
			n: n,
			d: d
		}
	});
	
	self.hesseNInput = ko.observable("");
	self.hesseDInput = ko.observable("");
	
	self.hesseCorrect = ko.computed(function() {
		var nIn = math.parseVector(self.hesseNInput());
		var dIn = Number(self.hesseDInput());
		var h = self.hesseNormal();
		return vecsEqual(nIn, h.n) && eq(dIn, h.d);
	});
	
	self.hesseDisplay = ko.computed(function() {
		var hn = self.hesseNormal();
		return "$ \\begin{pmatrix} " + hn.n[0].toFixed(2) + " & " + 
			hn.n[1].toFixed(2) + " \\end{pmatrix} \\begin{pmatrix} x \\\\ y \\end{pmatrix} = " + hn.d.toFixed(2) + " $";
	});
	
	// nT(p-p0) = 0
	self.implicit = ko.computed(function() {
		var pa = self.pointA();
		var pb = self.pointB();
		return math.implicitLine(pa, pb);
	});
	
	self.implicitNInput = ko.observable("");
	self.implicitPInput = ko.observable("");
	
	self.implicitCorrect = ko.computed(function() {
		var nIn = math.parseVector(self.implicitNInput());
		var aIn = math.parseVector(self.implicitPInput());
		var im = self.implicit();
		return vecsEqual(nIn, im.n) && vecsEqual(im.p0, aIn);
	});
	
	self.implicitDisplay = ko.computed(function() {
		var im = self.implicit();
		return "$ \\begin{pmatrix} " + im.n[0].toFixed(2) + " & " + im.n[1].toFixed(2) + " \\end{pmatrix}" +
			"(\\begin{pmatrix} x \\\\ y \\end{pmatrix} - \\begin{pmatrix} "+ im.p0[0] + " \\\\ " + im.p0[1] +" \\end{pmatrix} ) " + 
			"= 0 $";
	});
};

var card = new LFCard();

module.exports = {
	taskUI: preloaded.get("linerep.html"),
	taskModel: card,
	typeName: "linerepresentations",
	displayName: "Line Representations"
};