var preloaded = require("../../../Preloaded");
var ko = require("knockout");
var math = require("./helpers/math");

function Card() {
	var self = this;
	
	var resultCb = function(){};
	
	self.setCallback = function(cb) {
		resultCb = cb;
	};

	self.correct = ko.observable(false);
	self.showingHints = ko.observable(false);
	self.solved = ko.observable(false);
	
	self.showNew = function() {
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
		self.correct(correct);
		self.solved(true);
		
		setTimeout(function() {
			MathJax.Hub.Typeset();
		}, 15);
	};
	
	self.next = function() {
		self.correct(true);
		self.showingHints(false);
		resultCb(self.correct() && !self.showingHints());
	};
	
	self.failed = function() {
		self.correct(false);
		resultCb(self.correct() && !self.showingHints());
	};
}

var card = new Card();

module.exports = {
	taskUI: preloaded.get("lightinteractioon.html"),
	taskModel: card,
	typeName: "lightinteraction",
	displayName: "Light/Surface Interaction"
};
