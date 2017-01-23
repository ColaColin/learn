var preloaded = require("../../../Preloaded");
var ko = require("knockout");
var math = require("./helpers/math");

// Task: Apply 3x3 <filter> as a convolution onto the marked pixel using <borderhandling>.
// if necessary recenter the values within [0, 255]
// filter can be: mean, approx gauss, binomial, centered gradient x, centered gradient y, sobel x, sobel y, laplace
// borderhandling can be: inner, zero extended, border extended
// also ask: Is that filter a low or high pass filter?

function Card() {
	var self = this;
	
	var resultCb = function(){};
	
	var filters = {
		"mean": {kernel: [[1/9, 1/9, 1/9], 
		         [1/9, 1/9, 1/9], 
		         [1/9, 1/9, 1/9]], "type": "low"},
		"gauss": {kernel:[[1/24, 3/24, 1/24],
		          [3/24, 8/24, 3/24],
		          [1/24, 3/24, 1/24]], "type": "low"},
		"binomial": {kernel:[[1/16, 2/16, 1/16], 
		             [2/16, 4/16, 2/16],
		             [1/16, 2/16, 1/16]], "type": "low"},
		"grad_x": {kernel: [[0, 0, 0], 
		                   [-0.5, 0, 0.5], 
		                   [0, 0, 0]], "type": "high"},
		"grad_y": {kernel: [[0, -0.5, 0], 
		                   [0, 0, 0], 
		                   [0, 0.5, 0]], "type": "high"},
		"sobel_x": {kernel: [[-1/8, 0, 1/8],
		                    [-2/8, 0, 2/8], 
		                    [-1/8, 0, 1/8]], "type": "high"},
		"sobel_y": {kernel: [[-1/8, -2/8, -1/8],
		                    [0, 0, 0],
		                    [1/8, 2/8, 1/8]], "type": "high"},
		"laplace": {kernel: [[0, -1/8, 0],
		                     [-1/8, 4/8, -1/8],
		                     [0, -1/8, 0]], "type": "high"}
	};
	
	var borderHandling = ["zero_extended", "border_extended", "inner", "zero_extended", "border_extended"];
	
	var makeRandomImage = function() {
		var img = [];
		
		for (var i = 0; i < 5; i++) {
			var l = [];
			for (var k = 0; k < 5; k++) {
				l.push(Math.floor(256 * Math.random()));
			}
			img.push(l);
		}
		
		return img;
	};
	
	var pickFilter = function() {
		var names = Object.keys(filters);
		return names[Math.floor(Math.random() * names.length)];
	};
	
	var pickBorderHandling = function() {
		return borderHandling[Math.floor(Math.random() * borderHandling.length)];
	};
	
	var pickPixel = function() {
		return [Math.floor(Math.random() * 5), Math.floor(Math.random() * 5)];
	};
	
	self.baseImage = ko.observable(makeRandomImage());
	self.applyFilterName = ko.observable(pickFilter());
	self.applyFilter = ko.computed(function() {
		return filters[self.applyFilterName()].kernel;
	});
	self.applyFilterType = ko.computed(function() {
		return filters[self.applyFilterName()].type;
	});
	self.borderMode = ko.observable(pickBorderHandling());
	
	self.pixel = ko.observable(pickPixel());
	
	self.resultImage = ko.computed(function() {
		var img = self.baseImage();
		var filter = self.applyFilter();
		var borderMode = self.borderMode();
		return math.convolve2d(img, filter, borderMode);
	});
	
	self.pixelInput = ko.observable("");
	self.filterTypeInput = ko.observable("");
	
	self.setCallback = function(cb) {
		resultCb = cb;
	};
	
	self.correct = ko.observable(false);
	self.showingHints = ko.observable(false);
	self.solved = ko.observable(false);
	
	self.showNew = function() {
		self.baseImage(makeRandomImage());
		self.applyFilterName(pickFilter());
		self.borderMode(pickBorderHandling());
		self.pixel(pickPixel());
		
		console.log(self.pixel());
		
		self.pixelInput("");
		self.filterTypeInput("");
		
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
		var pInp = Number(self.pixelInput().trim().replace(",","."));
		var pCorr = self.resultImage()[self.pixel()[1]][self.pixel()[0]];
		self.correct(math.eq(pInp, pCorr) && self.filterTypeInput() === self.applyFilterType());
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
	taskUI: preloaded.get("convolutions.html"),
	taskModel: card,
	typeName: "convolutions",
	displayName: "Convolutions and Filters"
};
