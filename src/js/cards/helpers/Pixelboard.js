// uses a canvas element to:
// draw a pixel grid
// pixels have values, can get and set them.
// can register a listener for clicks on pixels
// can set a callback that draws the values of the pixels. Standard is 0 = black, not 0 = white

var ko = require("knockout");

function Pixelboard() {
	var self = this;
	
	self.width = ko.observable(400);
	self.height = ko.observable(400);
	self.canvas = ko.observable();
	self.context = ko.computed(function() {
		self.width();
		self.height();
		var canvas = self.canvas();
		return canvas == undefined ? undefined : canvas.getContext("2d");
	});
	
	var clearScreen = function() {
		if (self.context()) {
			self.context().clearRect(0,0,self.width(), self.height());
		}
	};
	
	var getWorldPxFromPixel = function(x, y) {
		var xRel = x/self.width();
		var yRel = y/self.height();
		return [Math.floor(xRel * self.pxWidth()), Math.floor(yRel * self.pxHeight())];
	};
	
	self.click = function(m, e) {
		var px = getWorldPxFromPixel(e.offsetX, e.offsetY);
		self.clickHandler()(px[0], px[1]);
	};
	
	self.pxWidth = ko.observable(10);
	self.pxHeight = ko.observable(10);

	self.values = ko.observable();

	self.getRandomValues = function() {
		var r = [];
		for (var y = 0; y < self.pxHeight(); y++) {
			var l = [];
			for (var x = 0; x < self.pxWidth(); x++) {
				var fx = Math.abs(self.pxWidth()/2-x);
				var fy = Math.abs(self.pxHeight()/2-y);
				var md = fx + fy;
				var perc = md / (self.pxWidth()/2 + self.pxHeight()/2);
				perc *= 1.1;
				l.push(Math.random() > perc ? 1 : 0);
			}
			r.push(l);
		}
		return r;
	};
	
	var resetValues = function() {
		self.values(self.getRandomValues());
	};
	resetValues();
	
	self.pxWidth.subscribe(resetValues);
	self.pxHeight.subscribe(resetValues);
	
	self.clickHandler = ko.observable(function(pxX, pxY) {
		var old = self.values()[pxY][pxX];
		var nv = 0;
		if (old > 0.5) {
			nv = 0.25;
		} else {
			nv = 0.75;
		}
		self.values()[pxY][pxX] = nv;
		self.values.notifySubscribers();
	});
	self.drawHandler = ko.observable(function(ctx, top, left, width, height, value) {
		ctx.beginPath();
		var c = Math.floor(255 * value);
		ctx.fillStyle = "rgb("+c+","+c+","+c+")";
		ctx.rect(top, left, width, height);
		ctx.fill();
	});
	
	var worldToPixel = function(wvec) {
		x = wvec[0];
		y = wvec[1];
		var xWorldSize = self.pxWidth();
		var yWorldSize = self.pxHeight();
		
		var xRel = x / xWorldSize;
		var yRel = y / yWorldSize;
		
		return [xRel * self.width(), yRel * self.height()];
	};
	
	var drawLine = function(a, b, strCfg, lw) {
		if (!strCfg) {
			strCfg = "rgb(0, 0, 0)";
		}
		var pixA = worldToPixel(a);
		var pixB = worldToPixel(b);
		
		var ctx = self.context();
		ctx.strokeStyle = strCfg;
		
		ctx.lineWidth = lw ? lw : 1;
		
		ctx.beginPath();
		ctx.moveTo(pixA[0], pixA[1]);
		ctx.lineTo(pixB[0], pixB[1]);
		ctx.stroke();
	};
	
	var drawGrid = function() {
		for (var x = 0; x <= self.pxWidth(); x++) {
			drawLine([x, 0], [x, self.height()], "rgb(50, 50, 50)", 3);
		}
		for (var y = 0; y <= self.pxHeight(); y++) {
			drawLine([0,y],[self.width(),y], "rgb(50,50,50)", 3);
		}
	};
	
	var drawValues = function() {
		for (var x = 0; x < self.pxWidth(); x++) {
			var left = worldToPixel([x, 0])[0];
			var right = worldToPixel([x+1, 0])[0];
			for (var y = 0; y < self.pxHeight(); y++) {
				var top = worldToPixel([0, y])[1];
				var bottom = worldToPixel([0, y+1])[1];
				
				var dh = self.drawHandler();
				dh(self.context(), left, top, right-left, bottom-top, self.values()[y][x]);
			}
		}
	};
	
	ko.computed(function() {
		if (!self.context()) {
			return;
		}
		
		clearScreen();
		drawValues();
		drawGrid();
	});
}

module.exports = Pixelboard;