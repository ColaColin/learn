
// card interface:

/*

{
	taskUI: string, // define task UI html including fields to enter solution
	taskModel: object, // a model that is bound to the taskUI to fill it with values, etc
	// this should be a func on taskModel: setCallback: function(cb), // cb is called with info "task was done correctly: true, else false"
	typeKey: "matrixmultiplication",
	displayName: "Matrix Multiplication"
}

 */

var ko = require("knockout");

var _ = require("lodash");

var matmul = require("./cards/matrixMultiplication");
var linerep = require("./cards/line-forms.js");
var csa = require("./cards/cohensutherland.js");
var lineIntersect = require("./cards/lineIntersect.js");
var transformations = require("./cards/transformations.js");
var convolutions = require("./cards/convolutions.js");
var cyrusbeck = require("./cards/cyrusbeck.js");
var openclose = require("./cards/openclose.js");
var areamoments = require("./cards/areamoments.js");
var affinespaces = require("./cards/affine.js");
var barycenter = require("./cards/barycentric.js");
var quaternion = require("./cards/quaternion.js");
var bezier = require("./cards/bezier.js");

function CardBox() {
	
	var self = this;
	var cardTypeMap = Object.create(null);
	
	var registerCardType = function(cardObj) {
		cardTypeMap[cardObj.typeName] = cardObj;
	};
	
	registerCardType(matmul);
	registerCardType(linerep);
	registerCardType(csa);
	registerCardType(lineIntersect);
	registerCardType(transformations);
	registerCardType(convolutions);
	registerCardType(cyrusbeck);
	registerCardType(openclose);
	registerCardType(areamoments);
	registerCardType(affinespaces);
	registerCardType(barycenter);
	registerCardType(quaternion);
	
	registerCardType(bezier);
	
	var cardRankings = Object.create(null);
	self.sessionNumber = ko.observable(0);
	
	self.cards = Object.values(cardTypeMap);
	
	var getSessionCards = function() {
		var cards = [];
		_.each(cardTypeMap, function(card, typeName) {
			var rankings = cardRankings[typeName];
			if (!rankings || (rankings.enabled && rankings.lastsession + rankings.interval <= self.sessionNumber())) {
				cards.push(card);
			}
		});
		return _.shuffle(cards);
	};
	
	var load = function() {
		if (localStorage.store) {
			var store = JSON.parse(localStorage.store);
			self.sessionNumber(store.sessionNumber);
			cardRankings = store.cardRankings;
			_.forEach(cardRankings, function(v) {
				if (v.enabled === undefined) {
					v.enabled = true;
				}
			});
		}
	};
	
	var save = function() {
		localStorage.store = JSON.stringify({
			sessionNumber: self.sessionNumber(),
			cardRankings: cardRankings
		});
	};

	self.currentSessionTodo = ko.observable([]);
	
	self.remainingInSession = ko.computed(function() {
		return self.currentSessionTodo().length;
	});
	
	self.isInSession = ko.computed(function() {
		return self.remainingInSession() > 0;
	});
	
	self.nextSession = function() {
		self.sessionNumber(self.sessionNumber() + 1);
		save();
		self.currentSessionTodo(getSessionCards());
	};
	
	var getCardRankings = function(typeName) {
		if (!cardRankings[typeName]) {
			cardRankings[typeName] = {interval: 1, points: 1, lastsession: -1, enabled: true}; 
		}
		return cardRankings[typeName];
	};

	self.bindEnabledFor = function(typeName) {
		var obs = ko.observable(getCardRankings(typeName).enabled);
		obs.subscribe(function(val) {
			getCardRankings(typeName).enabled = val;
			save();
		});
		return obs;
	};
	
	self.getCardRankings = getCardRankings;
	
	self.currentCard = ko.computed(function() {
		var card = self.currentSessionTodo()[0];
		
		if (card) {
			card.taskModel.showNew();
			setTimeout(function() {
				MathJax.Hub.Typeset();
			}, 50);
			card.taskModel.setCallback(function(wasCorrect) {
				var todo = self.currentSessionTodo();
				var rmCard = todo.shift();
				
				var cr = getCardRankings(card.typeName);
				
				if (wasCorrect) {
					cr.points++;
					if (cr.points >= 3.5) {
						cr.points = 1;
						cr.interval *= 2;
					}
					cr.lastsession = self.sessionNumber();
				} else {
					cr.points-=0.5;
					if (cr.points < -0.0001) {
						cr.points = 1;
						cr.interval = 1;
					}
					todo.push(rmCard);
				}
				cardRankings[card.typeName] = cr;
				
				save();
				
				self.currentSessionTodo(todo);
			});
		}
		return card;
	});
	
	self.currentCardPoints = ko.computed(function() {
		var c = self.currentCard();
		if (c) {
			var r = getCardRankings(c.typeName);
			return r.points;
		} else {
			return "";
		}
	});

	self.currentCardInterval = ko.computed(function() {
		var c = self.currentCard();
		if (c) {
			var r = getCardRankings(c.typeName);
			return r.interval;
		} else {
			return "";
		}
	});
	
	self.currentCardTitle = ko.computed(function() {
		var c = self.currentCard();
		if (c) {
			return c.displayName;
		} else {
			return "";
		}
	});
	
	self.currentCardModel = ko.computed(function() {
		var c = self.currentCard();
		if (c) {
			return c.taskModel;
		} else {
			return {};
		}
	});
	
	self.currentCardHtml = ko.computed(function() {
		var c = self.currentCard();
		if (c) {
			return c.taskUI;
		} else {
			return "";
		}
	});
	
	self.currentCardHtml.subscribe(function(html) {
		if (html) {
			setTimeout(function() {
				var div = document.getElementById('card-content');
				div.innerHTML = "<div>" + html + "</div>";
				ko.applyBindings(self.currentCardModel(), div.children[0]);
				if (self.currentCardModel().bindingComplete) {
					self.currentCardModel().bindingComplete();
				}
			}, 5);
		}
	});
	
	load();
	
	self.sortedCards = _.sortBy(self.cards, function(c) {
		return self.getCardRankings(c.typeName).interval;
	}, function(c) {
		return self.getCardRankings(c.typeName).points;
	});
};

module.exports = CardBox;