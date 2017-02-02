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
	self.pxboard.clickHandler(function(){});
	self.pxboard.pxWidth(3);
	self.pxboard.pxHeight(3);
	
	var procForeground = function(proccer) {
		var vs = self.pxboard.values();
		for (var y = 0; y < vs.length; y++) {
			for (var x = 0; x < vs[y].length; x++) {
				if (vs[y][x] > 0.5) {
					proccer(x+1, y+1);
				}
			}
		}
	};
	
	self.area = ko.computed(function() {
		var sum = 0;
		procForeground(function(i, j) {
			sum += 1;
		});
		return sum;
	});
	
	self.centerX = ko.computed(function() {
		var cx = 0;
		procForeground(function(i, j) {
			cx += i;
		});
		return cx / self.area();
	});
	
	self.centerY = ko.computed(function() {
		var cy = 0;
		procForeground(function(i, j) {
			cy += j;
		});
		return cy / self.area();
	});
	
	self.y20 = ko.computed(function() {
		var sum = 0;
		var cx = self.centerX();
		procForeground(function(i, j) {
			var q = (i - cx);
			sum += q * q;
		});
		return sum;
	});
	
	self.y02 = ko.computed(function() {
		var sum = 0;
		var cy = self.centerY();
		procForeground(function(i, j) {
			var q = (j - cy);
			sum += q * q;
		});
		return sum;
	});
	
	self.y11 = ko.computed(function() {
		var sum = 0;
		var cx = self.centerX();
		var cy = self.centerY();
		procForeground(function(i, j) {
			sum += (i - cx) * (j - cy);
		});
		return sum;
	});
	
	self.m00Display = math.makeVarDisplay("m_{00}", self.area);
	self.m10m00Display = math.makeVarDisplay("\\frac{m_{10}}{m_{00}}", self.centerX);
	self.m01m00Display = math.makeVarDisplay("\\frac{m_{01}}{m_{00}}", self.centerY);
	self.y20Display = math.makeVarDisplay("y_{20}", self.y20);
	self.y02Display = math.makeVarDisplay("y_{02}", self.y02);
	self.y11Display = math.makeVarDisplay("y_{11}", self.y11);
	
	self.m00In = ko.observable("");
	self.m10m00In = ko.observable("");
	self.m01m00In = ko.observable("");
	self.y20In = ko.observable("");
	self.y02In = ko.observable("");
	self.y11In = ko.observable("");
	
	self.bindingComplete = function() {
		self.pxboard.canvas(document.getElementById('canv'));
	};
	
	self.correct = ko.observable(false);
	self.showingHints = ko.observable(false);
	self.solved = ko.observable(false);
	
	self.showNew = function() {
		self.pxboard.values(self.pxboard.getRandomValues());
		
		self.m00In("");
		self.m10m00In("");
		self.m01m00In("");
		self.y20In("");
		self.y02In("");
		self.y11In("");
		
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
		var m00In = Number(self.m00In());
		var m10m00In = Number(self.m10m00In());
		var m01m00In = Number(self.m01m00In());
		var y20In = Number(self.y20In());
		var y02In = Number(self.y02In());
		var y11In = Number(self.y11In());

		var areaOk = math.eq(m00In, self.area()); 
		var cxOk = math.eq(m10m00In, self.centerX());
		var cyOk = math.eq(m01m00In, self.centerY());
		var y20Ok = math.eq(y20In, self.y20());
		var y02Ok = math.eq(y02In, self.y02());
		var y11Ok = math.eq(y11In, self.y11());
		
		var correct = areaOk && cxOk && cyOk && y20Ok && y02Ok && y11Ok;
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
	taskUI: preloaded.get("areamoments.html"),
	taskModel: card,
	typeName: "areamoments",
	displayName: "Area Moments"
};
