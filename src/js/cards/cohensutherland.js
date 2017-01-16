var preloaded = require("../../../Preloaded");
var ko = require("knockout");
var math = require("./helpers/math");

function CSACard() {
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
	
	self.pointA = ko.observable(rndPoint());
	self.pointB = ko.observable(rndPoint());

	self.pointADisplay = math.makeVectorDisplay(self.pointA);
	self.pointBDisplay = math.makeVectorDisplay(self.pointB);
	
	self.xmin = ko.observable(-1);
	self.xmax = ko.observable(1);
	self.ymin = ko.observable(-1);
	self.ymax = ko.observable(1);
	
	self.xminDisplay = math.makeVarDisplay("xmin", self.xmin);
	self.xmaxDisplay = math.makeVarDisplay("xmax", self.xmax);
	self.yminDisplay = math.makeVarDisplay("ymin", self.ymin);
	self.ymaxDisplay = math.makeVarDisplay("ymax", self.ymax);
	
	var verifyTask = function() {
		if (self.xmin() >= self.xmax()) {
			self.xmin(self.xmax() - (1 + Math.floor(Math.random() * 3)));
		}
		if (self.ymin() >= self.ymax()) {
			self.ymin(self.ymax() - (1 + Math.floor(Math.random() * 3)));
		}
	};
	
	self.showNew = function() {
		self.pointA(rndPoint());
		self.pointB(rndPoint());
		self.xmin(rndVal()  / 2);
		self.xmax(rndVal() / 2);
		self.ymin(rndVal() / 2);
		self.ymax(rndVal() / 2);
		verifyTask();
		self.outCodeAInput("");
		self.outCodeBInput("");
		self.lineStateInput("");
		
		self.xmin(2);
		self.xmax(4);
		self.ymin(2);
		self.ymax(4);
		
//		self.pointA([-7,-77]);
//		self.pointB([5,5]);
		
		self.correct(false);
		self.showingHints(false);
		self.solved(false);
	};
	
	var bsign = function(x) {
		if (x >= 0) {
			return "0";
		} else {
			return "1";
		}
	};
	
	var getOutCodeFor = function(vec) {
		var x = vec[0];
		var y = vec[1];
		var ymax = self.ymax();
		var ymin = self.ymin();
		var xmax = self.xmax();
		var xmin = self.xmin();
		return bsign(ymax - y) + bsign(y - ymin) + bsign(xmax - x) + bsign(x - xmin);
	};
	
	self.outCodeA = ko.computed(function() {
		return getOutCodeFor(self.pointA());
	});

	self.outCodeB = ko.computed(function() {
		return getOutCodeFor(self.pointB());
	});
	
	self.lineState = ko.computed(function() {
		if (self.outCodeA() === "0000" && self.outCodeB() === "0000") {
			return "inside";
		} else if ((parseInt(self.outCodeA(), 2) & parseInt(self.outCodeB(), 2)) != 0) {
			return "outside";
		} else {
			return "intersect";
		}
	});
	
	self.outCodeAInput = ko.observable("");
	self.outCodeBInput = ko.observable("");
	self.lineStateInput = ko.observable("");
	
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
		var correct = self.outCodeAInput().trim() === self.outCodeA() &&
						self.outCodeBInput().trim() === self.outCodeB() &&
						self.lineStateInput() === self.lineState();
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

var card = new CSACard();

module.exports = {
	taskUI: preloaded.get("cohensutherland.html"),
	taskModel: card,
	typeName: "cohensutherland",
	displayName: "Cohen-Sutherland Algorithm"
};
