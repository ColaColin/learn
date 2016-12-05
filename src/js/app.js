var CardBox = require("./CardBox");
var ko = require("knockout");

var preloaded = require("../../Preloaded");

var cardBox = new CardBox();

document.addEventListener("DOMContentLoaded", function() {
	ko.applyBindings(cardBox);
	console.log("CardBox started");
});