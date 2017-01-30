var preloaded = require("../../../Preloaded");
var ko = require("knockout");
var math = require("./helpers/math");
var Pixelboard = require("./helpers/Pixelboard");

function Card() {
	var self = this;
	
	var resultCb = function(){};
	
	self.setCallback = function(cb) {
		resultCb = cb;
	};
	
	self.pxboard = new Pixelboard();
	self.rsboard = new Pixelboard();
	
	self.bindingComplete = function() {
		self.pxboard.canvas(document.getElementById('canv'));
		self.rsboard.canvas(document.getElementById('rscanv'));
	};
	
	self.initialBoard = ko.observable(self.pxboard.values());
	self.initialBoard.subscribe(self.pxboard.values);
	
	var rank = function(ib, dilateElseErode) {
		var copy = JSON.parse(JSON.stringify(ib));
		
		for (var y = 0; y < ib.length; y++) {
			for (var x = 0; x < ib[y].length; x++) {
				
				var cnt = 0;
				for (var xd = -1; xd < 2; xd++) {
					for (var yd = -1; yd < 2; yd++) {
						var xdd = x + xd;
						var ydd = y + yd;
						if (xdd >= 0 && xdd < ib[y].length &&
								ydd >= 0 && ydd < ib.length) {
							if (ib[ydd][xdd] > 0.5) {
								cnt++;
							}
						}
					}
				}
				
				if (dilateElseErode) {
					copy[y][x] = cnt > 0 ? 1 : 0;
				} else {
					copy[y][x] = cnt === 9 ? 1 : 0;
				}
			}
		}
		return copy;
	};
	
	self.doOpening = ko.observable(true);
	
	self.openingBoard = ko.computed(function() {
		var opened = rank(rank(self.initialBoard(), false), true);
		if (self.doOpening()) {
			self.rsboard.values(opened);
		}
		return opened;
	});
	
	self.closingBoard = ko.computed(function() {
		var closed = rank(rank(self.initialBoard(), true), false);
		if (!self.doOpening()) {
			self.rsboard.values(closed);
		}
		return closed;
	});
	
	self.correct = ko.observable(false);
	self.showingHints = ko.observable(false);
	self.solved = ko.observable(false);
	
	self.showNew = function() {
		self.doOpening(Math.random() > 0.5);
		self.initialBoard(self.pxboard.getRandomValues());
		
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
	
	var compareBoards = function(usr, alg) {
		for (var y = 0; y < usr.length; y++) {
			for (var x = 0; x < usr[y].length; x++) {
				var usrSet = usr[y][x] > 0.5;
				var algSet = alg[y][x] > 0.5;
				if (usrSet !== algSet) {
					return false;
				}
			}
		}
		return true;
	};
	
	self.solve = function() {
		var user = self.pxboard.values();
		var algo = self.rsboard.values();
		var correct = compareBoards(user, algo);
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
	taskUI: preloaded.get("openclose.html"),
	taskModel: card,
	typeName: "openclose",
	displayName: "Opening and Closing"
};
