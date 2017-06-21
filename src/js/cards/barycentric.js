var preloaded = require("../../../Preloaded");
var ko = require("knockout");
var math = require("./helpers/math");

function Card() {
	var self = this;
	
	var resultCb = function(){};
	
	self.setCallback = function(cb) {
		resultCb = cb;
	};
	
	self.p = ko.observable([0,0]);
	self.p0 = ko.observable([0,0]);
	self.p1 = ko.observable([0,0]);
	self.p2 = ko.observable([0,0]);
	
	self.target = ko.observable(0);
	
	var setPRndInTriangle = function() {
		var rem = 1;
		
		var l0 = Math.random();
		rem -= l0;
		
		var x = Math.random();
		var l1 = rem * x;
		var l2 = rem * (1 - x);
		
		var x0 = self.p0()[0];
		var y0 = self.p0()[1];
		
		var x1 = self.p1()[0];
		var y1 = self.p1()[1];
		
		var x2 = self.p2()[0];
		var y2 = self.p2()[1];
		
		var xp = l0 * x0 + l1 * x1 + l2 * x2;
		var yp = l0 * y0 + l1 * y1 + l2 * y2;
		
		self.p([xp, yp]);
	};
	
	self.p0.subscribe(setPRndInTriangle);
	self.p1.subscribe(setPRndInTriangle);
	self.p2.subscribe(setPRndInTriangle);
	
	self.p0Display = math.makeVectorDisplay(self.p0);
	self.p1Display = math.makeVectorDisplay(self.p1);
	self.p2Display = math.makeVectorDisplay(self.p2);
	
	self.pDisplay = math.makeVectorDisplay(self.p);
	
	var area = function(p0, p1, p2) {
		var a = [p1[0] - p0[0], p1[1] - p0[1]];
		var b = [p2[0] - p0[0], p2[1] - p0[1]];
		return 0.5 * Math.abs(a[0]*b[1] - a[1]*b[0]);
	};
	
	self.lambda0 = ko.computed(function() {
		return area(self.p(), self.p1(), self.p2()) / area(self.p0(), self.p1(), self.p2());
	});
	
	self.lambda1 = ko.computed(function() {
		return area(self.p0(), self.p(), self.p2()) / area(self.p0(), self.p1(), self.p2());
	});
	
	self.lambda2 = ko.computed(function() {
		return area(self.p0(), self.p1(), self.p()) / area(self.p0(), self.p1(), self.p2());
	});
	
	self.l0In = ko.observable("");
	self.l1In = ko.observable("");
	self.l2In = ko.observable("");
	
	self.correct = ko.observable(false);
	self.showingHints = ko.observable(false);
	self.solved = ko.observable(false);
	
	self.showNew = function() {
		self.p0(math.rndPoint());
		self.p1(math.rndPoint());
		self.p2(math.rndPoint());
		
		while(area(self.p0(), self.p1(), self.p2()) < 0.1) {
			self.p0(math.rndPoint());
			self.p1(math.rndPoint());
			self.p2(math.rndPoint());
		}
		
		self.target(Math.floor(Math.random() * 3));
		
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
		var correct = false;
		
		var l0I = parseFloat(self.l0In());
		var l1I = parseFloat(self.l1In());
		var l2I = parseFloat(self.l2In());
		
		if (self.target() === 0) {
			self.correct(math.eq(self.lambda0(), l0I));
		} else if (self.target() === 1) {
			self.correct(math.eq(self.lambda1(), l1I));
		} else {
			self.correct(math.eq(self.lambda2(), l2I));
		}
		
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
	taskUI: preloaded.get("barycentric.html"),
	taskModel: card,
	typeName: "barycentric",
	displayName: "Barycentric coordinates & Triangle area"
};
