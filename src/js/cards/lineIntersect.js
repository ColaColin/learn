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
	
	var rndVal = function() {
		return Math.floor(Math.random() * 10) - 5;
	};
	
	var rndPoint = function() {
		return [rndVal(), rndVal()];
	};
	
	self.drawing = new DrawStuff();
	
	self.bindingComplete = function() {
		self.drawing.canvas(document.getElementById('canv'));
	};
	
	self.pointA = ko.observable(rndPoint());
	self.pointB = ko.observable(rndPoint());
	self.pointC = ko.observable(rndPoint());
	self.pointD = ko.observable(rndPoint());
	
	self.intersection = ko.computed(function() {
		return math.intersectLines(self.pointA(), self.pointB(), self.pointC(), self.pointD());
	});
	
	
	ko.computed(function() {
		var a = self.pointA();
		var b = self.pointB();
		var c = self.pointC();
		var d = self.pointD();
		self.drawing.lines([{a: a, b: b, clr: "rgb(255, 0, 0)"}, 
		                    {a: c, b: d, clr: "rgb(0,255,0)"}]);
	});
	
	self.pointADisplay = math.makeVectorDisplay(self.pointA);
	self.pointBDisplay = math.makeVectorDisplay(self.pointB);
	self.pointCDisplay = math.makeVectorDisplay(self.pointC);
	self.pointDDisplay = math.makeVectorDisplay(self.pointD);
	
	self.intersectionDisplay = math.makeVectorDisplay(self.intersection);
	
	self.showNew = function() {
		self.pointA(rndPoint());
		self.pointB(rndPoint());
		self.pointC(rndPoint());
		self.pointD(rndPoint());
		
		self.intersectionInput("");
		
//		self.pointA([-7,-77]);
//		self.pointB([5,5]);
		
		self.correct(false);
		self.showingHints(false);
		self.solved(false);
	};
	
	self.intersectionInput = ko.observable("");
	
	self.solved = ko.observable(false);
	self.correct = ko.observable(false);
	self.showingHints = ko.observable(false);
	
	self.giveHint = function() {
		self.showingHints(true);
		setTimeout(function() {
			MathJax.Hub.Typeset();
		}, 15);
	};
	
	self.solve = function() {
		var intersection = self.intersection();
		if (intersection == null) {
			self.correct(self.intersectionInput().trim().length === 0);
		} else {
			var userIntersection = math.parseVector(self.intersectionInput());
			self.correct(math.vecsEqual(userIntersection, intersection));
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
	taskUI: preloaded.get("lineIntersection.html"),
	taskModel: card,
	typeName: "lineIntersect",
	displayName: "Line Intersection"
};
