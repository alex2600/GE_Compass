var DBG = false;
function log(line) {
	if(DBG)	{
		var logElem = $("#log");
		console.debug(logElem.length === 0);
		if(logElem.length === 0) {
			logElem = $("<div id='log'></div>");
			$("#compass").after(logElem);
		}
		console.debug(logElem);
		logElem.prepend("<div>"+line+"</div>");
	}
}

var COMPASS = {
	isRunning : false,
	watchId : null,
	oImg : null,
	oValue : null,
	
	rotCur : 0, // current rotation
	rotVec : 0,
	rotDamp : .85, // friction
	rotMax : 8,
	// good values:
	// damp .7   max 10  // direct
	// damp .9   max 20  // jumpy
	// damp .9   max 2 // heavy
	// damp .95  max .5 // super heavy
	// damp .85  max 8 // normal

	getRotDiff : function(next, cur) { // get rotation diff // determine smallest turn-dir 
		var x = next - cur;
		var s = x < 0 ? 1 : -1;
		var d = s * 360 + x;
		var min = Math.abs(x) <= Math.abs(d) ? x : d;
		return min;
	},
	
	update : function(heading) {
		var 
		   rotNext = heading.trueHeading  // rot from android
		 , rotCur = COMPASS.rotCur
		 , rotLast = rotCur
		 , rotVec = COMPASS.rotVec
		 , rotDiff = 0
		 , rotDamp = COMPASS.rotDamp
		 , rotPrint = 0
		 , rotCSS = 0
		 , rotDir = 1
		 , img = COMPASS.oImg
		 , val = COMPASS.oValue
		;
		
		// err handling
		if(rotNext < 0 || rotNext >= 360) {
			log("compass error: rotation is " + rotNext);
			return;
		}
		
		rotDiff = COMPASS.getRotDiff(rotNext, rotCur);
		rotVec = rotVec * rotDamp + (rotDiff / 360) * COMPASS.rotMax;
		rotDir = rotVec < 0 ? -1 : 1;
		rotCur = rotCur + rotVec;

		// make sure rotCur is always between 0 and 359
		rotCur = rotCur % 360;
		rotCur = rotCur < 0 ? rotCur + 360 : rotCur;
		
		COMPASS.rotVec = rotVec;
		COMPASS.rotCur = rotCur;
		
		rotPrint = rotNext;
		rotCSS = rotCur;
		
		val.text(rotPrint);
		img.css("-webkit-transform", "rotate(-" + rotCSS + "deg)");
	},
	
	updateErr : function(err) {
		log("compass err code: "+err.code);
//		COMPASS.stop();
	},
	
	start : function() {
//		log("compass starting...");
		
		COMPASS.oImg = $("#compass-img img");
		COMPASS.oValue = $("#compass-heading-value");
		
		COMPASS.watchId = navigator.compass.watchHeading(
			COMPASS.update,
			COMPASS.updateErr,
			{
				frequency : 1000 / 20 // fps 20
			}
		);
	},
	
	stop : function() {
		log("compass stopping...");
		navigator.compass.clearWatch(COMPASS.watchId);
	},
	
	round : function(num, digits) {
		var mul = Math.pow(10, digits)
		  , val = Math.round(num*mul);
		return val / mul;
	}
};


var initNeedle = function() {
	var img = $("#compass-img")
	  , w = img.width()
	  , h = img.height()
	  , needle = $("#compass-marker-needle") 
	;
//	console.log(needle);
//	console.log(w);
//	console.log(h);
	needle.height(h);
};


//var toggleMenu = function() {
//	log("toggle menu");
//	$("#menu").toggleClass("showing");
//};


var init = function() {
	COMPASS.start();
	initNeedle();
//	document.addEventListener("menubutton", toggleMenu, false);	
};

$(document).ready(function() {
	document.addEventListener("deviceready", init, false);
});



