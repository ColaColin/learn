var preloaded = require("../../../Preloaded");
var ko = require("knockout");
var math = require("./helpers/math");
var DrawStuff = require("./helpers/drawstuff");
var m = require("gl-matrix");

function Card() {
	var self = this;
	
	var resultCb = function(){};
	
	self.setCallback = function(cb) {
		resultCb = cb;
	};
	
	self.drawing = new DrawStuff();
	
	self.bindingComplete = function() {
		self.drawing.canvas(document.getElementById('canv'));
	};
	
	self.correct = ko.observable(false);
	self.showingHints = ko.observable(false);
	self.solved = ko.observable(false);
	
	self.qs = ko.observable([math.rndPoint(0.5), math.rndPoint(0.5), math.rndPoint(0.5), math.rndPoint(0.5)]);
	
	self.scale = ko.observable(1);
	self.firstTranslate = ko.observable([0,0]);
	self.translate = ko.observable([0,0]);
	self.rotate = ko.observable(0);
	
	var fillRandomModifications = function() {
		// translation [+2, -2], rotation (0°, 45°), scale (0.5x, 2.5x)),
		
		var transX = Math.floor(Math.random() * 4) - 2;
		var transY = Math.floor(Math.random() * 4) - 2;
		var rot = Math.random() > 0.5 ? 45 : 0;
		var scl = (Math.floor(Math.random() * 4) + 1)/2 + 0.5;
		self.scale(scl);
		self.translate([transX, transY]);
		self.rotate(rot);
	};
	
	self.transformed = ko.computed(function() {
		var scl = m.mat3.fromScaling(m.mat3.create(), [self.scale(), self.scale()]);
		var rot = m.mat3.fromRotation(m.mat3.create(), [(self.rotate() / 180) * Math.PI]);
		var trsA = m.mat3.fromTranslation(m.mat3.create(), self.firstTranslate());
		var trsB = m.mat3.fromTranslation(m.mat3.create(), self.translate());
		var fi = m.mat3.mul(m.mat3.create(), scl, trsA);
		fi = m.mat3.mul(m.mat3.create(), rot, fi);
		fi = m.mat3.mul(m.mat3.create(), trsB, fi);
		var result = [];
		for (var i = 0; i < self.qs().length; i++) {
			var q = self.qs()[i];
			var vq = m.vec2.fromValues(q[0], q[1]);
			result.push(m.vec2.transformMat3(vq, vq, fi));
		}
		
		return result;
	});
	
	window.model = this;
	
	var updateDrawing = function() {
		var a = self.qs();
		var b = self.transformed();
		self.drawing.polygons([{vecs: a, clr: "rgb(0, 255, 0)", width: 3}, {vecs: b, clr: "rgb(255, 0, 0)", width: 3}]);
	};

	updateDrawing();
	
	self.transformed.subscribe(updateDrawing);
	self.qs.subscribe(updateDrawing);
	
	var nextExample = function() {
		var s = Math.floor(Math.random() * 2) + 1;
		var ox = Math.random() > 0.5 ? 1 : -1;
		var oy = Math.random() > 0.5 ? 1 : -1;
		if (Math.random() > 0.5) {
			ox *= 2;
		}
		if (Math.random() > 0.5) {
			oy *= 2;
		}
		self.firstTranslate([-ox, -oy]);
		self.qs([[-s+ox, s+oy], [s+ox, s+oy], [s+ox, -s+oy], [-s+ox, -s+oy]]);
		fillRandomModifications();
	};
	nextExample();
	
	window.n = nextExample;
	
	self.showNew = function() {
		nextExample()
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
		var correct = false; // TODO
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
	taskUI: preloaded.get("transformations.html"),
	taskModel: card,
	typeName: "transformations",
	displayName: "Affine Transformations"
};
