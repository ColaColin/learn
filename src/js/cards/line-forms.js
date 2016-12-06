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
	
	self.showNew = function() {
		
	};
	
	self.correct = ko.observable(false);
	self.solved = ko.observable(false);

	var rndPoint = function() {
		return [Math.floor(Math.random() * 10) - 5, Math.floor(Math.random() * 10) - 5];
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
	
	self.pointA([2,3]);
	self.pointB([5,1]);
	
	self.parametric = ko.computed(function() {
		var a = self.pointA();
		var b = self.pointB();
		var delta = [b[0] - a[0], b[1] - a[1]];
		return {
			start: a,
			delta: delta
		};
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
		var n = n0 /= Math.sqrt(n0[0]*n0[0] + n0[1] * n0[1]);
		var d = n[0] * pa[0] + n[1] * pa[1];
		return {
			n: n,
			d: d
		}
	});
	
	// nT(p-p0) = 0
	self.implict = ko.computed(function() {
		var pa = self.pointA();
		var pb = self.pointB();
		var n = [pa[1] - pb[1], pb[0] - pa[0]];
		return {
			n: n,
			p0: pa,
		};
	});
};

var card = new LFCard();

module.exports = {
	taskUI: preloaded.get("linerep.html"),
	taskModel: card,
	typeName: "linerepresentations",
	displayName: "Line Representations"
};