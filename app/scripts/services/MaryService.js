'use strict';

angular.module('MaryTTSHTMLFrontEnd')
    .service('MaryService', function MaryService($rootScope,Wavparserservice,browserDetector,AnnotService,appStateService,moduleSequenceService) {
	// shared service object
	var sServObj = {};
	sServObj.audioBuffer = undefined;
	sServObj.textgrid_string = undefined;
	sServObj.configuration = {
	    "marytts.runutils.Request": {
		"input_serializer": "marytts.io.serializer.TextSerializer",
		"output_serializer": "marytts.io.serializer.TextGridSerializer",
		"module_sequence": [
		    "marytts.language.en.JTokenizer",
		    "marytts.language.en.Preprocess",
		    "marytts.language.en.OpenNLPPosTagger",
		    "marytts.language.en.USJPhonemiser",
		    "marytts.modules.dummies.DurationPrediction"
		]
	    }
	};

	sServObj.configuration_string = JSON.stringify(sServObj.configuration);

	sServObj.MARY_HOST = "localhost";
	sServObj.MARY_PORT = "59125";
	sServObj.map_modules = null;

	var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
	sServObj.staticBuffer = null;

	sServObj.listModules = function() {
    	    $("#inputOutputButtonDiv").hide(); //hide the buttons to change input/output

	    // List the modules
	    $.post(sServObj.getBaseURL() + "listAvailableModulesByCategories/",
		   {},
		   function(result) {
		       sServObj.map_modules = result;

		       // Empty select
		       $("#categoriesInput").children().remove();

		       // Add category
		       var def_cat = null;
		       for (var k in sServObj.map_modules) {
			   if (def_cat == null) {
			       def_cat = k;
			   }

			   $("#categoriesInput").append($('<option>', {
			       value: k,
			       text: k,
			       selected: def_cat == k
			   }));
		       }

		       sServObj.listModulesFromCurrentCategory();
		   });

	    // List the serializers
	    $.post(sServObj.getBaseURL() + "listAvailableSerializers/",
		   {},
		   function(result) {

		       // Add category

		       $("#categoriesInput").append($('<option>', {
			   value: "serializer",
			   text: "serializer",
			   selected: false
		       }));

		       var build_list = [];
		       for (var k in result) {
			   build_list.push(result[k]);
		       }

		       sServObj.map_modules["serializer"] = {};
		       sServObj.map_modules["serializer"]["serializer"] = build_list;
		   });


	};


	sServObj.listModulesFromCurrentCategory = function() {
	    if($("#categoriesInput").val()==="serializer"){
    		$("#moduleButtonDiv").hide();
    		$("#inputOutputButtonDiv").show(); //show input/output buttons
	    } else {
    		$("#moduleButtonDiv").show();
    		$("#inputOutputButtonDiv").hide(); //show add module buttons
	    }

	    var category = $("#categoriesInput option:selected").text();
	    $("#configurationInput").children().remove();

	    // Add modules from the first category
	    var i = 0;
	    for (var m in sServObj.map_modules[category]) {
		$("#configurationInput").append($('<option>', {
		    value: m,
		    text: m,
		    selected: i == 0
		}));
		i=1;
	    }

	    // Get description
	    sServObj.listModulesFromCurrentCategoryAndCurrentConf();
	};


	sServObj.listModulesFromCurrentCategoryAndCurrentConf = function() {
	    if($("#categoriesInput").val()==="serializer"){
    		$("#moduleButtonDiv").hide();
    		$("#inputOutputButtonDiv").show(); //show input/output buttons
	    } else {
    		$("#moduleButtonDiv").show();
    		$("#inputOutputButtonDiv").hide(); //show add module buttons
	    }

	    var category = $("#categoriesInput option:selected").text();
	    var conf = $("#configurationInput option:selected").text();
	    $("#moduleList").children().remove();

	    // Add modules from the first category
	    for (var m in sServObj.map_modules[category][conf]) {
		$("#moduleList").append($('<option>', {
		    value: sServObj.map_modules[category][conf][m],
		    text: sServObj.map_modules[category][conf][m],
		    selected: m == 0
		}));
	    }

	    // Get description
	    sServObj.getCurrentModuleDescription();
	    sServObj.getLocalConfiguration();
	};

	sServObj.getCurrentModuleDescription = function() {

	    // FIXME: no description support for serializer for now
	    if($("#categoriesInput").val()==="serializer"){
		$("#descriptionInput").val("no description");
		return;
	    }

	    var module = $("#moduleList option:selected").text();
	    $.post(sServObj.getBaseURL() + "getDescription/",
		   {"module": module},
		   function(result) {
		       $("#descriptionInput").val(result);
		   });
	};

	sServObj.getLocalConfiguration = function() {
	    var module = $("#moduleList option:selected").text();
	    var subpart = JSON.stringify(sServObj.configuration[module], null, 4);
	    $("#configurationModule").val(subpart);
	};


	sServObj.process = function() {

	    var input_text = $("#text-to-synth").val();
	    var configuration = JSON.stringify(sServObj.configuration, null, 4);

	    //validate input text
	    if (input_text.length === 0) {
		alert('text needs to be defined !');
	    } else {

		$.post(sServObj.getBaseURL() + "process/", {
	    	    "input": input_text,
	    	    "configuration": configuration
		}, function(result) {

		    sServObj.textgrid_string = undefined;
		    var result_content = result["result"];

		    //If an exception occurs
		    if("exception" in result && result["exception"]!=null){
			$("#server_results").collapse('show');
			$("#text-result").val(sServObj.exception_string(result["exception"]));
			$("#server_results").removeClass('border-primary border-success border-danger').addClass('border-danger');


		    } else {

			// FIXME:
			if (sServObj.configuration["marytts.runutils.Request"]["output_serializer"] === "marytts.io.serializer.TextGridSerializer") {
	    		    $("#text-result").val(result_content);
			    sServObj.textgrid_string = result_content;

			    // Extract duration
			    var myRegexp = /^xmax[ ]*=[ ]*([0-9]*.[0-9]*?)$/gm;
			    var match = myRegexp.exec(result_content);
			    var dur = match[1];

			    // Create fake audio buffer
			    var sr = 3000;
			    sServObj.loadStaticBuffer(dur*sr, sr);

			    // Hide unused audio part
			    $("#osci").hide();
			    $("#spectro").hide();

			    AnnotService.setAnnotFromTextGrid(result_content, sr, dur*sr);
			} else {
			    // Parse the result
			    var json_result;
			    if (typeof result_content === 'string' || result_content instanceof String) {
				$("#text-result").val(result_content);
				return;
			    } else {
				$("#text-result").val(JSON.stringify(result_content));
				json_result = result_content;
			    }

			    if ("audio" in json_result) {

				// Show just to be sure :)
				$("#osci").show();
				$("#spectro").show();

				// Dealing with the potential textgrid
				if ("textgrid" in json_result) {
				    sServObj.textgrid_string = json_result["textgrid"];
				    $("#text-result").val(json_result["textgrid"]);
				}

				// Set the audio buffer
				sServObj.convertData(json_result["audio"]);

				$("#server_results").collapse('show');
				$("#server_results").removeClass('border-primary border-success border-danger').addClass('border-success');
			    }
			}

		    }

		    if("log" in result){
			$("#log").val(result["log"]);
		    }
		});
	    }
	};

	//Function to create expection trace
	sServObj.exception_string = function(result) {
	    var str = result.message;
	    for(var num in result.stackTrace){
		str += "\n\t" + sServObj.stacktrace_string(result.stackTrace[num]);
	    }
	    if(result.cause == null) {
		return str;
	    } else {
		return str + "\n"+ sServObj.exception_string(result.cause);
	    }
	};

	sServObj.stacktrace_string = function(stacktrace){
	    return stacktrace.className+"."+stacktrace.methodName+" ("+stacktrace.fileName+":"+stacktrace.lineNumber+") ";
	};

	sServObj.getBaseURL = function () {
	    return "http://" + sServObj.MARY_HOST + ":" + sServObj.MARY_PORT + "/";
	};


	/**
	 * Converts file to an audiobuffer
	 */
	sServObj.convertData = function(b64_wav){
	    //converts BASE64 to arrayBuffer
	    var array = sServObj.BASE64ToArrayBuffer(b64_wav);
	    //converts arrayBuffer to audioBuffer, which "starts" the app
	    var promise = Wavparserservice.parseWavAudioBuf(array);
	    promise.then(
		function(audioBuffer) {
		    sServObj.setAudioBuffer(audioBuffer);
		},
		function(error) {
		    console.log(error);
		});
	};

	/**
	 * Converts ArrayBuffer to base64
	 */

	sServObj.ArrayBufferToBASE64 = function(buffer){
	    var binary = '';
	    var bytes = new Uint8Array(buffer);
	    var len = bytes.byteLength;
	    for (var i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	    }
	    var res = window.btoa(binary);
	    return res;
	};

	/**
	 * Converts base64 to ArrayBuffer
	 */
	sServObj.BASE64ToArrayBuffer = function (stringBase64) {
	    var binaryString = window.atob(stringBase64);
	    var len = binaryString.length;
	    var bytes = new Uint8Array(len);
	    for (var i = 0; i < len; i++) {
		var ascii = binaryString.charCodeAt(i);
		bytes[i] = ascii;
	    }
	    return bytes.buffer;
	};


	/**
	 * Sets the audioBuffer
	 */
	sServObj.setAudioBuffer = function(newBuffer){
	    sServObj.audioBuffer = newBuffer;
	    appStateService.setMinMax(0,sServObj.audioBuffer.length);
	    appStateService.setStartStop(0,sServObj.audioBuffer.length);

	    if (sServObj.textgrid_string != null) {
		AnnotService.setAnnotFromTextGrid(sServObj.textgrid_string,
						  sServObj.getAudioBuffer().sampleRate,
						  sServObj.getAudioBuffer().length);

	    }


	    // Enable buttons
	    $('#pause').prop('disabled', false);
	    $('#play').prop('disabled', false);
	    $('#save').prop('disabled', false);

	    // Reset pause button state
	    $('#pause').attr('data-state', 'off');
	    $('#pause-text').text('Pause');
	    $('#pause-icon').removeClass('glyphicon-play').addClass('glyphicon-pause');

	    // Show the results
	    $("#audio_results").collapse('show');

	    // //Something has changed, so we call $apply manually
	    // $rootScope.$apply();
	};


	/**
	 * Returns the audioBuffer
	 */
	sServObj.getAudioBuffer = function(){
	    return sServObj.audioBuffer;
	};

	/**
	 *	Create a new buffer (empty), used to trick when printing levels without real audiobuffer -- See testlevel in main controller
	 */
	sServObj.loadStaticBuffer= function(dur_frame, sr){
	    sServObj.staticBuffer = audioCtx.createBuffer(1, dur_frame, sr);
	    sServObj.setAudioBuffer(sServObj.staticBuffer);
	};

	sServObj.setConfigurationString = function(newConfig){
	    sServObj.configuration_string = newConfig;
	};
	sServObj.setConfiguration = function(newConfig){
	    if("marytts.runutils.Request" in newConfig){
		if("module_sequence" in newConfig["marytts.runutils.Request"]){
		    moduleSequenceService.setModuleSequence(newConfig["marytts.runutils.Request"]["module_sequence"]);
		    sServObj.configuration = newConfig;
		}
		if("input_serializer" in newConfig["marytts.runutils.Request"]){
		    moduleSequenceService.setInput(newConfig["marytts.runutils.Request"]["input_serializer"]);
		}
		if("output_serializer" in newConfig["marytts.runutils.Request"]){
		    moduleSequenceService.setOutput(newConfig["marytts.runutils.Request"]["output_serializer"]);
		}
	    }
	    sServObj.setConfigurationString(JSON.stringify(newConfig));
	};

	return sServObj;
    });
