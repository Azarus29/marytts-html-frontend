'use strict';


/**
 * Service that contains the audioBuffer
 * May start the application (listeners to audioBuffer)
 */
angular.module('MaryTTSHTMLFrontEnd')
    .service('AnnotService', function AnnotService($rootScope,Textgridparserservice,browserDetector,appStateService) {
	// shared service object
	var sServObj = {};
	sServObj.annot = undefined;

	sServObj.textGrid = undefined;
	sServObj.sampleRate = undefined;

	sServObj.getSampleRate = function() {
	    return sServObj.sampleRate;
	}
	sServObj.getAnnotLength = function(){
	    if(sServObj.annot){
		return sServObj.annot.length;
	    }
	}

	sServObj.setAnnotLength = function(newLength){
	    sServObj.annot.length = newLength;
	}
	/**
	 * Sets the annotation
	 */
	sServObj.setAnnotFromTextGrid = function(text,sampleRate,imposeLength){
	    sServObj.textGrid = text;
	    sServObj.sampleRate  = sampleRate;
	    sServObj.convertTextGrid(sampleRate,imposeLength);
	};


	/**
	 * Sets the annotation
	 */
	sServObj.setAnnotFromJSON = function(json){
	    sServObj.annot = json;
	};

	// sServObj.setAnnot = function(json){
	// 	sServObj.annot = json;
	// };

	//Used after putting the wav file
	sServObj.convertTextGrid = function(sampleRate,imposeLength){
	    Textgridparserservice.asyncParseTextGrid(sServObj.textGrid, sampleRate, "annotTextGrid", "annotTextGrid").then(function (parseMess) {
		sServObj.annot = parseMess;
		//Something has changed, so we call $apply manually -- removed because of bugs
		if(imposeLength){
		    sServObj.annot.length = imposeLength;
		}
	    }, function (errMess) {
		console.log("error : "+errMess);
	    });
	};

	/**
	 * Returns the annotation
	 */
	sServObj.getAnnot = function(){
	    return sServObj.annot;
	};

	sServObj.getTextGrid = function(){
	    return sServObj.textGrid;
	};

	return sServObj;
    });
