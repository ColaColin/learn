var preloaded = require("../../../Preloaded");
var ko = require("knockout");
var math = require("./helpers/math");

function MMCard() {
	var self = this;
	
	var resultCb = function(){};
	
	self.setCallback = function(cb) {
		resultCb = cb;
	};
	
	var rndMatrix = function(w, h) {
		var w = w || 2+Math.floor(Math.random() * 3); 
		var h = h || 2+Math.floor(Math.random() * 3);
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
	
	self.matrixA = ko.observable(rndMatrix());
	self.matrixB = ko.observable(rndMatrix(0, self.matrixA()[0].length));
	
	self.showNew = function() {
		self.correct(false);
		self.solved(false);
		self.matrixInput("");
		self.hint("");
		self.matrixA(rndMatrix());
		self.matrixB(rndMatrix(0, self.matrixA()[0].length));
	};
	
	self.result = ko.computed(function() {
		var a = self.matrixA();
		var b = self.matrixB();
		
		var w = b[0].length;
		var h = a.length;
		var m = b.length;
		var matrix = [];
		
		for (var j = 0; j < h; j++) {
			var row = [];
			for (var i = 0; i < w; i++) {
				var sum = 0;
				for (var k = 0; k < m; k++) {
					var av = a[j][k];
					var bv = b[k][i];
					sum += av * bv;
				}
				row.push(sum);
			}
			matrix.push(row);
		}
		return matrix;
	});
	
	self.aDisplay = math.makeMatrixDisplay(self.matrixA);
	self.bDisplay = math.makeMatrixDisplay(self.matrixB);
	self.resultDisplay = math.makeMatrixDisplay(self.result);
	
	self.hint = ko.observable("");
	
	self.matrixInput = ko.observable("");
	
	self.solved = ko.observable(false);
	self.correct = ko.observable(false);
	
	self.answerMatrix = ko.computed(function() {
		mi = self.matrixInput();
		var matrix = mi.split(/\n+/).map(function(l) {
			return l.trim().split(/ +/).map(Number);
		});
		return matrix;
	});
	
	self.solve = function() {
		var answer = self.answerMatrix();
		var result = self.result();
		var correct = true;
		if (answer.length === result.length) {
			for (var i = 0; i < answer.length; i++) {
				if (answer[i].length !== result[i].length) {
					self.hint("Wrong dimensions: "+answer[i].length + " $ \\neq $" + result[i].length);
					correct = false;
					break;
				}
				
				for (var k = 0; k < answer[i].length; k++) {
					if (answer[i][k] !== result[i][k]) {
						self.hint("Wrong matrix entry: "+answer[i][k] + "$\\neq$" + result[i][k]);
						correct = false;
						break;
					}
				}
			}
		} else {
			self.hint("Wrong dimensions: "+answer.length + " $ \\neq $" + result.length);
			correct = false;
		}
		
		self.correct(correct);
		self.solved(true);
		
		setTimeout(function() {
			MathJax.Hub.Typeset();
		}, 10);
	};
	
	self.next = function() {
		resultCb(self.correct());
	};
}

var card = new MMCard();

module.exports = {
	taskUI: preloaded.get("matrixMultiplication.html"),
	taskModel: card,
	typeName: "matrixmultiplication",
	displayName: "Matrix Multiplication"
};
