var preloaded = require("../../../Preloaded");
var ko = require("knockout");
var math = require("./helpers/math");
var DrawStuff = require("./helpers/drawstuff");

function Card() {
	var self = this;
	
	var resultCb = function(){};
	
	self.setCallback = function(cb) {
		resultCb = cb;
	};

	self.drawing = new DrawStuff();
	
	self.drawing.minX(-10);
	self.drawing.maxX(10);
	self.drawing.minY(-10);
	self.drawing.maxY(10);
	
	self.bindingComplete = function() {
		self.drawing.canvas(document.getElementById('canv'));
	};
	
	self.t0 = ko.observable(0);
	self.t1 = ko.observable(1);
	self.t2 = ko.observable(2);
	
	self.x0 = ko.observable(0);
	self.x1 = ko.observable(1);
	self.x2 = ko.observable(2);
	
	self.c0 = ko.observable(0);
	self.c1 = ko.observable(1);
	self.c2 = ko.observable(2);

	self.c0Input = ko.observable("");
	self.c1Input = ko.observable("");
	self.c2Input = ko.observable("");
	
	var poly = function(t) {
		return self.c0() + self.c1() * t + self.c2() * t*t;
	};
	
	var selftest = function() {
		var t0Matches = math.eq(poly(self.t0()), self.x0());
		var t1Matches = math.eq(poly(self.t1()), self.x1());
		var t2Matches = math.eq(poly(self.t2()), self.x2());
		if (!t0Matches || !t1Matches || !t2Matches) {
			console.log("SELF TEST FAILED!");
			console.log(poly(self.t0()) +"!="+ self.x0(), poly(self.t1()) +"!="+ self.x1(), poly(self.t2()) +"!="+ self.x2(), "t0=" + self.t0(), "t1=" + self.t1(), "t2=" + self.t2(), "x0=" + self.x0(), "x1=" + self.x1(), "x2=" + self.x2(), "c0=" + self.c0(), "c1=" +  self.c1(),"c2=" + self.c2());
		}
	};

	// Yep the results of these are identical. For science and exploration we needed to verify this.
	var methods = {
		0: {
			name: "Newton",
			solve: function() {
				var a0 = self.x0();
				var a1 = (self.x1() - self.x0())/(self.t1() - self.t0());
				var a2 = (((self.x2() - self.x1())/(self.t2() - self.t1())) - ((self.x1() - self.x0())/(self.t1() - self.t0()))) / (self.t2() - self.t0());
				
				self.c2(a2);
				self.c1((-self.t1() - self.t0()) * a2 + a1);
				self.c0(self.t0() * self.t1() * a2 - self.t0() * a1 + a0);
			}
		},
		1: {
			name: "Lagrange",
			solve: function() {
				var z0 = (self.t0() - self.t1()) * (self.t0() - self.t2());
				var z1 = (self.t1() - self.t0()) * (self.t1() - self.t2());
				var z2 = (self.t2() - self.t0()) * (self.t2() - self.t1());
				
				var c2 = self.x0() / z0 + self.x1() / z1 + self.x2() / z2;
				var c1 = -((self.t2() + self.t1()) * self.x0())/(z0) -((self.t2() + self.t0()) * self.x1())/(z1) -((self.t1() + self.t0()) * self.x2())/(z2);
				var c0 = (self.t1()*self.t2()*self.x0())/z0 + (self.t0()*self.t2()*self.x1())/z1 + (self.t0() * self.t1() * self.x2())/z2;
				
				self.c0(c0);
				self.c1(c1);
				self.c2(c2);
			}
		}
	};
	
	self.methods = methods;
	
	self.method = ko.observable(0);
	
	self.correct = ko.observable(false);
	self.showingHints = ko.observable(false);
	self.solved = ko.observable(false);
	
	var pRnd = function() {
		return Math.floor(Math.random() * 3) + 1;
	};
	
	self.showNew = function() {
		self.c0Input("");
		self.c1Input("");
		self.c2Input("");

		self.method(Math.floor(Math.random() * 2));
		
		for (var i = 0; i < 10; i++) {
			self.t0(pRnd());
			self.t1(self.t0() + pRnd());
			self.t2(self.t1() + pRnd());
			
			self.x0(math.rndVal());
			self.x1(math.rndVal());
			self.x2(math.rndVal());
			
			methods[self.method()].solve();
			
			self.drawing.functions([{clr: "rgb(200, 20, 20)", width: 3, func: poly}]);
			
			selftest();
		}
		
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
		
		if (math.eq(Number(self.c0Input()), self.c0())
				&& math.eq(Number(self.c1Input()), self.c1())
				&& math.eq(Number(self.c2Input()), self.c2())) {
			correct = true;
		}
		
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
	taskUI: preloaded.get("polynominterpolation.html"),
	taskModel: card,
	typeName: "polynominterpolation",
	displayName: "Polynom interpolation"
};
