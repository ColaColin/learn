var preloaded = require("../../../Preloaded");
var ko = require("knockout");
var math = require("./helpers/math");

function Card() {
	var self = this;
	
	var resultCb = function(){};
	
	self.setCallback = function(cb) {
		resultCb = cb;
	};

	self.x0 = ko.observable(0);
	self.x1 = ko.observable(1);
	self.x2 = ko.observable(2);

	self.y0 = ko.observable(0);
	self.y1 = ko.observable(1);
	self.y2 = ko.observable(2);
	
	self.w0 = ko.observable(0); // this is the bias
	self.w1 = ko.observable(1);
	
	self.w0Input = ko.observable("");
	self.w1Input = ko.observable("");

	self.correct = ko.observable(false);
	self.showingHints = ko.observable(false);
	self.solved = ko.observable(false);
	
	var pRnd = function() {
		return Math.floor(Math.random() * 3) + 1;
	};
	
	var solve = function() {
		var xtx0 = 3;
		var xtx1 = self.x0() + self.x1() + self.x2();
		var xtx2 = xtx1;
		var xtx3 = self.x0() * self.x0() + self.x1() * self.x1() + self.x2() * self.x2();
		
		var det = (1/(xtx0 * xtx3 - xtx1 * xtx2));
		var xtx01 = xtx3;
		var xtx11 = -xtx1;
		var xtx21 = -xtx2;
		var xtx31 = xtx0;
		
		var xty0 = self.y0() + self.y1() + self.y2();
		var xty1 = self.x0() * self.y0() + self.x1() * self.y1() + self.x2() * self.y2();
		
		var w0 = det * (xtx01 * xty0 + xtx11 * xty1);
		var w1 = det * (xtx21 * xty0 + xtx31 * xty1);
		
		self.w0(w0);
		self.w1(w1);
	};
	
	self.showNew = function() {
		self.w0Input("");
		self.w1Input("");
		
		self.y0(pRnd());
		self.y1(self.y0() + pRnd());
		self.y2(self.y1() + pRnd());
		
		self.x0(math.rndVal());
		self.x1(math.rndVal());
		self.x2(math.rndVal());
		
//		self.y0(-1.9);
//		self.y1(0.2);
//		self.y2(1.1);
//		
//		self.x0(-2);
//		self.x1(2);
//		self.x2(4);
		
		solve();
		
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
		
		console.log(Number(self.w0Input()));
		console.log(Number(self.w1Input()));
		
		if (math.eq(Number(self.w0Input()), self.w0()) && math.eq(Number(self.w1Input()), self.w1())) {
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
	taskUI: preloaded.get("linreg.html"),
	taskModel: card,
	typeName: "linreg",
	displayName: "Linear Regression"
};
