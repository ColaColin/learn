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
	
	self.w0 = ko.observable(0);
	self.w1 = ko.observable(-1);
	self.w2 = ko.observable(1);
	
	self.w0Input = ko.observable("");
	self.w1Input = ko.observable("");
	self.w2Input = ko.observable("");
	
	self.line = [[0,0], [1,1]];
	
	self.positivePoints = [];
	self.negativePoints = [];
	
	self.xFor = ko.observable(0);
	self.yFor = ko.observable(0);
	self.forX = ko.observable(0);
	self.forY = ko.observable(0);
	
	var classify = function(x, y) {
		var activation = x * self.w1() + y * self.w2() + self.w0();
		if (activation >= 0) {
			return 1;
		} else {
			return 0;
		}
	};
	
	var samplePoints = function() {
		self.positivePoints = [];
		self.negativePoints = [];
		
		for (var i = 0; i < 20; i++) {
			var p = math.rndPoint();
			p[0] += Math.random() - 0.5;
			p[1] += Math.random() - 0.5;
			if (classify(p[0], p[1]) > 0) {
				self.positivePoints.push(p);
			} else {
				self.negativePoints.push(p);
			}
		}
	};
	
	var getLinePointForX = function(w0, w1, w2, x) {
		return (-x * w1 - w0) / w2;
	};
	
	var getLinePointForY = function(w0, w1, w2, y) {
		return (-y * w2 - w0) / w1;
	};
	
	var getLinePoints = function(w0, w1, w2) {
		if (w2 != 0) {
			var x1 = -2;
			var x2 = 2;
			var y1 = (-x1 * w1 - w0) / w2;
			var y2 = (-x2 * w1 - w0) / w2;
			return [[x1, y1], [x2, y2]];
		} else {
			var y1 = -2;
			var y2 = 2;
			var x1 = -w0 / w1;
			var x2 = -w0 / w1;
			return [[x1, y1], [x2, y2]];
		}
	};
	
	var updateLine = function() {
		self.line = getLinePoints(self.w0(), self.w1(), self.w2());
	};
	
	self.correct = ko.observable(false);
	self.showingHints = ko.observable(false);
	self.solved = ko.observable(false);
	
	self.showNew = function() {
		
		self.w0Input("");
		self.w1Input("");
		self.w2Input("");
		
		self.w0(Math.floor(math.rndVal() * 0.5));
		self.w1(math.rndVal());
		self.w2(math.rndVal());
		
		updateLine();
		samplePoints();
		
		do {
			self.xFor(math.rndVal());
			self.yFor(math.rndVal());
			self.forX(getLinePointForX(self.w0(), self.w1(), self.w2(), self.xFor()));
			self.forY(getLinePointForY(self.w0(), self.w1(), self.w2(), self.yFor()));
		} while (self.forX() === self.forY());
		
		self.forX(self.forX().toFixed(2));
		self.forY(self.forY().toFixed(2));
		
		self.drawing.lines([{a: self.line[0], b: self.line[1], clr: "rgb(20, 20, 255)", isSegment: false}]);
		self.drawing.points(self.positivePoints.map(function(pt) {
			return {
				clr: "rgb(0,255,0)",
				radius: 5,
				position: pt
			};
		}).concat(self.negativePoints.map(function(pt) {
			return {
				clr: "rgb(255,0,0)",
				radius: 5,
				position: pt
			};
		})));
		
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

		var inLine = getLinePoints(Number(self.w0Input()), Number(self.w1Input()), Number(self.w2Input()));
		
		if (math.vecsEqual(inLine[0], self.line[0]) && math.vecsEqual(inLine[1], self.line[1])) {
			correct = true;
		} else {
			console.log(inLine, " vs ", self.line);
			console.log(self.w0(), self.w1(), self.w2());
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
	taskUI: preloaded.get("gperceptron.html"),
	taskModel: card,
	typeName: "gperceptron",
	displayName: "Perceptron Learning: Graphical"
};
