var ko = require("knockout");
var _ = require("lodash");

function DrawStuff() {
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
	
	// array of elements: {a: [x,y], b: [x,y], clr: stroke-string, isSegment: true}
	self.lines = ko.observable([]/*[{a: [0, 0], b: [-3,-3], clr: "rgb(255, 0, 0)"}, {a: [1, 0], b: [0,3], clr: "rgb(0, 255, 0)"}]*/);
	// array of elements: {vecs: [[x,y],...], clr: stroke-string}
	self.polygons = ko.observable([] /*[{vecs: [[1,1], [3,6], [3,0], [-2, -2]], clr: "rgb(255,0,0)"}]*/);
	
	self.minX = ko.observable(-7);
	self.maxX = ko.observable(7);
	self.minY = ko.observable(-7);
	self.maxY = ko.observable(7);
	
	var worldToPixel = function(wvec) {
		x = wvec[0];
		y = wvec[1];
		var xWorldSize = self.maxX() - self.minX();
		var yWorldSize = self.maxY() - self.minY();
		
		var xRel = (x - self.minX()) / xWorldSize;
		var yRel = (y - self.minY()) / yWorldSize;
		
		return [xRel * self.width(), self.height() - (yRel * self.height())];
	};
	
	window.worldToPixel = worldToPixel;
	
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
	
	var drawPolygon = function(poly, strCfg, lw) {
		for (var i = 0; i < poly.length; i++) {
			var k = (i+1) % poly.length;
			var cur = poly[i];
			var nex = poly[k];
			drawLine(cur, nex, strCfg, lw);
		}
	};
	
	var drawCoordinateSystem = function() {
		var midX = (self.maxX() + self.minX())/2;
		var midY = (self.maxY() + self.minY())/2;
		drawLine([self.minX(), midY], [self.maxX(), midY], "rgb(75, 75, 75)");
		drawLine([midX, self.minY()], [midX, self.maxY()], "rgb(75, 75, 75)");
		
		for (var x = self.minX(); x <= self.maxX(); x++) {
			if (x === midX) {
				continue;
			}
			drawLine([x, self.minY()], [x, self.maxY()], "rgb(175, 175, 175)");
			var wp = worldToPixel([x, midY+0.01*(self.maxY() - self.minY())]);
			self.context().fillText(x+"", wp[0], wp[1]);
		}
		for (var y = self.minY(); y <= self.maxY(); y++) {
			if (y === midY) {
				continue;
			}
			drawLine([self.minX(), y], [self.maxX(), y], "rgb(175, 175, 175)");
			var wp = worldToPixel([midX+0.01*(self.maxX() - self.minX()), y]);
			self.context().fillText(y+"", wp[0], wp[1]);
		}
	};
	
	var getLongerLine = function(a, b) {
//		return [a, b];
		var dx = (self.maxX() - self.minX());
		var dy = (self.maxY() - self.minY());
		var necLength = Math.sqrt(dx*dx + dy*dy);
		
		var dirX = b[0] - a[0];
		var dirY = b[1] - a[1];
		var len = Math.sqrt(dirX*dirX + dirY*dirY);
		if (len === 0) {
			return [a, b];
		}
		dirX /= len;
		dirY /= len;
		
		var aLong = [a[0] - dirX * necLength, a[1] - dirY * necLength];
		var bLong = [b[0] + dirX * necLength, b[1] + dirY * necLength];
		return [aLong, bLong];
	};
	
	var drawLines = function() {
		var lines = self.lines();
		
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			if (!line.isSegment) {
				var ll = getLongerLine(line.a, line.b);
			} else {
				ll = [line.a, line.b];
			}
			drawLine(ll[0], ll[1], line.clr, line.width);
		}
	};
	
	var drawPolygons = function() {
		var polygons = self.polygons();
		
		for (var i = 0; i < polygons.length; i++) {
			var polygon = polygons[i];
			drawPolygon(polygon.vecs, polygon.clr, polygon.width);
		}
	};
	
	ko.computed(function() {
		if (!self.context()) {
			return;
		}
		clearScreen();
		drawCoordinateSystem();
		drawLines();
		drawPolygons();
	});
};

module.exports = DrawStuff;