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
	self.bindingComplete = function() {
		self.drawing.canvas(document.getElementById('canv'));
	};
	self.drawing.minX(-10);
	self.drawing.maxX(10);
	self.drawing.minY(-10);
	self.drawing.maxY(10);
	
	self.b0 = ko.observable([0,0]);
	self.b1 = ko.observable([0,0]);
	self.b2 = ko.observable([0,0]);
	self.b3 = ko.observable([0,0]);
	
	self.b0Display = math.makeVectorDisplay(self.b0);
	self.b1Display = math.makeVectorDisplay(self.b1);
	self.b2Display = math.makeVectorDisplay(self.b2);
	self.b3Display = math.makeVectorDisplay(self.b3);
	
	self.tangent1 = ko.computed(function() {
		return [3 * (self.b3()[0] - self.b2()[0]), 3 * (self.b3()[1] - self.b2()[1])];
	});
	
	self.tangent1Display = math.makeVectorDisplay(self.tangent1);
	
	self.b3Input = ko.observable("");
	
	self.correct = ko.observable(false);
	self.showingHints = ko.observable(false);
	self.solved = ko.observable(false);
	
	self.showNew = function() {
		do {
			self.b0(math.rndPoint());
			self.b1(math.rndPoint());
			self.b2(math.rndPoint());
			self.b3(math.rndPoint());
		} while(math.vecsEqual(self.b0(), self.b1()) || 
				math.vecsEqual(self.b0(), self.b2()) || 
				math.vecsEqual(self.b0(), self.b3()) || 
				math.vecsEqual(self.b1(), self.b2()) || 
				math.vecsEqual(self.b1(), self.b3()) || 
				math.vecsEqual(self.b2(), self.b3()));
		
		self.b3Input("");
		self.drawing.beziers([{a: self.b0(), b: self.b1(), c: self.b2(), d: self.b3(), clr: "rgb(200, 255, 200)", width: 3}]);
		
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
		
		var vector = math.parseVector(self.b3Input());
		
		correct = math.vecsEqual(vector, self.b3());
		
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
	taskUI: preloaded.get("bezier.html"),
	taskModel: card,
	typeName: "bezier",
	displayName: "Bezier curves"
};
