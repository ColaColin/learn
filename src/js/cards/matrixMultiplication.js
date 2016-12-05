var preloaded = require("../../../Preloaded");

function MMCard() {
	var self = this;
	
	var resultCb = function(){};
	
	self.setCallback = function(cb) {
		resultCb = cb;
	};
	
	self.matrixA = ko.observable();
	self.matrixB = ko.observable();
	
	var rndMatrix = function() {
		var w = 1+Math.floor(Math.random() * 4); 
		var h = 1+Math.floor(Math.random() * 4);
		var matrix = [];
		for (var i = 0; i < h; i++) {
			var line = [];
			for (var k = 0; k < w; k++) {
				line.push(Math.floor(Math.random() * 10));
			}
			matrix.push(line);
		}
		return matrix;
	};
	
	var init = function() {
		self.matrixA(rndMatrix());
		self.matrixB(rndMatrix());
		
	};
	
	init();
}

var card = new MMCard();

module.exports = {
	taskUI: preloaded.get("matrixMultiplication.html"),
	taskModel: card,
	typeName: "matrixmultiplication",
	displayName: "Matrix Multiplication"
};