var preloaded = require("../../../Preloaded");
var ko = require("knockout");
var math = require("./helpers/math");
var DrawStuff = require("./helpers/drawstuff");

function Card() {
	var self = this;
	
	var resultCb = function(){};
	
	var makeTriangle = function() {
		var up = [math.rndFrom(-1, 1), math.rndFrom(2, 5)];
		var left = [math.rndFrom(-1, -4), math.rndFrom(-2, -4)];
		var right = [math.rndFrom(1, 4), math.rndFrom(-2, -4)];
		
		
		
		return [up, right, left];
		
//		return [[2,1], [2, 3], [4, 1]];
	};
	
	var makeLine = function() {
		var a = [math.rndFrom(-4, -5), math.rndFrom(-1, 1)];
		var b = [math.rndFrom(4, 5), math.rndFrom(-1, 1)];
		return [a, b];
		
//		return [[1, 0], [4, 2]];
	};
	
	self.drawing = new DrawStuff();
	self.bindingComplete = function() {
		self.drawing.canvas(document.getElementById('canv'));
	};
	
	self.setCallback = function(cb) {
		resultCb = cb;
	};

	self.triangle = ko.observable(makeTriangle());
	self.line = ko.observable(makeLine());
	self.clipped = ko.computed(function() {
		var al = self.line()[0];
		var bl = self.line()[1];
		var dl = [bl[0] - al[0], bl[1] - al[1]];
		
		var tri = self.triangle();
		
		var n1 = [tri[0][1] - tri[1][1], tri[1][0] - tri[0][0]];
		var n2 = [tri[1][1] - tri[2][1], tri[2][0] - tri[1][0]];
		var n3 = [tri[2][1] - tri[0][1], tri[0][0] - tri[2][0]];
		
		var p1 = tri[0];
		var p2 = tri[1];
		var p3 = tri[2];
		
		var t1 = (n1[0] * (p1[0] - al[0]) + n1[1] * (p1[1] - al[1])) / (n1[0] * dl[0] + n1[1] * dl[1]);
		var t2 = (n2[0] * (p2[0] - al[0]) + n2[1] * (p2[1] - al[1])) / (n2[0] * dl[0] + n2[1] * dl[1]);
		var t3 = (n3[0] * (p3[0] - al[0]) + n3[1] * (p3[1] - al[1])) / (n3[0] * dl[0] + n3[1] * dl[1]);
		
		var l1 = [al[0] + t1 * dl[0], al[1] + t1 * dl[1]];
		var l2 = [al[0] + t2 * dl[0], al[1] + t2 * dl[1]];
		var l3 = [al[0] + t3 * dl[0], al[1] + t3 * dl[1]];
		
		var leaving = null;
		var leavingBest = 9999999999;
		var entering = null;
		var enteringBest = -9999999999;
		
		[[l1, n1, t1], [l2, n2, t2], [l3, n3, t3]].forEach(function(d) {
			var p = d[0];
			var n = d[1];
			var t = d[2];
			
			var cmp = n[0] * dl[0] + n[1] * dl[1]; 
			if (cmp > 0) {
				if (leavingBest > t) {
					leaving = p;
					leavingBest = t;
				}
			} else {
				if (enteringBest < t) {
					entering = p;
					enteringBest = t;
				}
			}
		});
		
		return [entering, leaving];
	});
	
	self.tri0 = ko.computed(function() {
		return self.triangle()[0];
	});
	self.tri1 = ko.computed(function() {
		return self.triangle()[1];
	});
	self.tri2 = ko.computed(function() {
		return self.triangle()[2];
	});
	self.line0 = ko.computed(function() {
		return self.line()[0];
	});
	self.line1 = ko.computed(function() {
		return self.line()[1];
	});
	
	self.clipped0 = ko.computed(function() {
		return self.clipped()[0];
	});

	self.clipped1 = ko.computed(function() {
		return self.clipped()[1];
	});
	
	self.tri0Display = math.makeVectorDisplay(self.tri0);
	self.tri1Display = math.makeVectorDisplay(self.tri1);
	self.tri2Display = math.makeVectorDisplay(self.tri2);
	
	self.line0Display = math.makeVectorDisplay(self.line0);
	self.line1Display = math.makeVectorDisplay(self.line1);
	
	self.clipped0Display = math.makeVectorDisplay(self.clipped0);
	self.clipped1Display = math.makeVectorDisplay(self.clipped1);
	
	var updateDrawing = function() {
		var l = self.line();
		var t = self.triangle();
		var c = self.clipped();
		self.drawing.lines([{a: l[0], b: l[1], clr: "rgb(0,255,0)", isSegment: true}, {a: c[0], b: c[1], clr: "rgb(255, 0, 0)", isSegment: true}]);
		self.drawing.polygons([{vecs: t, clr: "rgb(100, 100, 100)", width: 2}]);
	};
	
	updateDrawing();
	self.clippedInputA = ko.observable("");
	self.clippedInputB = ko.observable("");
	
	self.correct = ko.observable(false);
	self.showingHints = ko.observable(false);
	self.solved = ko.observable(false);
	
	self.showNew = function() {
		self.triangle(makeTriangle());
		self.line(makeLine());
		self.clippedInputA("");
		self.clippedInputB("");
		updateDrawing();
		
		self.correct(false);
		self.showingHints(false);
		self.solved(false);
	};
	
	self.giveHint = function() {
		self.showingHints(true);
		setTimeout(function() {
			MathJax.Hub.Typeset();
		}, 15);
	};
	
	self.solve = function() {
		var c = self.clipped();
		var correct = math.vecsEqual(math.parseVector(self.clippedInputA()), c[0]) &&
					math.vecsEqual(math.parseVector(self.clippedInputB()), c[1]);
		
		self.correct(correct);
		self.solved(true);
		
		setTimeout(function() {
			MathJax.Hub.Typeset();
		}, 15);
	};
	
	self.next = function() {
		resultCb(self.correct() && !self.showingHints());
	};
}

var card = new Card();

module.exports = {
	taskUI: preloaded.get("cyrusbeck.html"),
	taskModel: card,
	typeName: "cyrusbeck",
	displayName: "Cyrus Beck Line Clipping"
};
