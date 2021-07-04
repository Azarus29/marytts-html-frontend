'use strict';

angular.module('MaryTTSHTMLFrontEnd')
    .directive('configuration', function (MaryService) {
	return {
	    templateUrl: 'views/configuration.html',
	    restrict: 'E',
	    replace: true,
	    scope: {configuration : '='},
	    link: function postLink(scope, element) {
		// var canvas = document.getElementById("configuration");

		scope.$watch("configuration",function(newVal,oldVal){
		    if(oldVal!==newVal){
			if(newVal===""){
			    var emptyConf = {
			    	"marytts.runutils.Request": {
			    	    "input_serializer": "",
			    	    "output_serializer": "",
			    	    "module_sequence": []
			    	}
			    };
			    MaryService.setConfiguration(emptyConf);
			} else {
			    MaryService.setConfigurationString(newVal);
			    try{
			    	var config = JSON.parse(newVal);
			    	MaryService.setConfiguration(config);
			    }catch (error){
			    	console.log(error);
			    }
			}
		    }
		});
	    }
	};
    });
