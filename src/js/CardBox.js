
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

function CardBox() {
	
	var self = this;
	var cardTypeMap = Object.create(null);
	
	var registerCardType = function(cardObj) {
		cardTypeMap[cardObj.typeName] = cardObj;
	};
	
	registerCardType(matmul);
	
	var cardRankings = Object.create(null);
	var sessionNumber = 0;
	
	var getSessionCards = function() {
		var cards = [];
		_.each(cardTypeMap, function(card, typeName) {
			var rankings = cardRankings[typeName];
			if (!rankings || rankings.lastsession + rankings.interval <= sessionNumber) {
				cards.push(card);
			}
		});
		return _.shuffle(cards);
	};
	
	var load = function() {
		if (localStorage.store) {
			var store = JSON.parse(localStorage.store);
			sessionNumber = store.sessionNumber;
			cardRankings = store.cardRankings;
		}
	};
	
	var save = function() {
		localStorage.store = JSON.stringify({
			sessionNumber: sessionNumber,
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
		sessionNumber++;
		save();
		self.currentSessionTodo(getSessionCards());
	};
	
	self.currentCard = ko.computed(function() {
		var card = self.currentSessionTodo()[0]; 
		if (card) {
			card.taskModel.setCallback(function(wasCorrect) {
				var todo = self.currentSessionTodo();
				var rmCard = todo.shift();
				
				var cr = cardRankings[card.typeName] || {interval: 1, points: 0, lastsession: -1};
				
				if (wasCorrect) {
					cr.points++;
					if (cr.points >= 8) {
						cr.points = 0;
						cr.interval *= 2;
					}
					cr.lastsession = sessionNumber;
				} else {
					cr.points-=2;
					if (cr.points < 0) {
						cr.points = 0;
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
				MathJax.Hub.Typeset();
			}, 5);
		}
	});
	
	load();
};

module.exports = CardBox;