'use strict';

/**
 * @ngdoc function
 * @name MaryTTSHTMLFrontEnd.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the testApp
 */
angular.module('MaryTTSHTMLFrontEnd')
    .controller('MainCtrl', function ($scope,$rootScope,$location, MaryService, moduleSequenceService,AnnotService) {

  	$scope.fs = MaryService;

  	$scope.mss = moduleSequenceService;

  	$scope.as = AnnotService;

	$scope.$watch('fs.getAudioBuffer()', function(newVal,oldVal){
	    if(newVal!==oldVal){
	        $scope.levels = [];
	    }
	});

	$scope.$watch('fs.configuration_string', function(newVal,oldVal){
	    if(newVal!==oldVal){
	    }
	});

	$scope.$watch('mss.moduleSequence', function(newVal,oldVal){
	    if(newVal!==oldVal){
	        var tampon = JSON.parse($scope.configuration);
	        tampon["marytts.runutils.Request"]["module_sequence"] = $scope.mss.moduleSequence;
	        tampon["marytts.runutils.Request"]["input_serializer"] = $scope.mss.input;
	        tampon["marytts.runutils.Request"]["output_serializer"] = $scope.mss.output;
	        $scope.configuration = JSON.stringify(tampon,null,4);
	    }
	},true);

	$scope.$watch('mss.input', function(newVal,oldVal){
	    if(newVal!==oldVal){
	        var tampon = JSON.parse($scope.configuration);
	        tampon["marytts.runutils.Request"]["module_sequence"] = $scope.mss.moduleSequence;
	        tampon["marytts.runutils.Request"]["input_serializer"] = $scope.mss.input;
	        tampon["marytts.runutils.Request"]["output_serializer"] = $scope.mss.output;
	        $scope.configuration = JSON.stringify(tampon,null,4);
	    }
	});

	$scope.$watch('mss.output', function(newVal,oldVal){
	    if(newVal!==oldVal){
	        var tampon = JSON.parse($scope.configuration);
	        tampon["marytts.runutils.Request"]["module_sequence"] = $scope.mss.moduleSequence;
	        tampon["marytts.runutils.Request"]["input_serializer"] = $scope.mss.input;
	        tampon["marytts.runutils.Request"]["output_serializer"] = $scope.mss.output;
	        $scope.configuration = JSON.stringify(tampon,null,4);
	    }
	});


	$scope.$watch('as.getAnnot()', function(newVal,oldVal){
	    if(newVal!==oldVal){
	  	$scope.levels = [];
	  	//Ici ajouter les directives pour les levels - Extraire SEGMENTS et EVENT et les rajouter dans levels
	  	newVal.levels.forEach(function(level){
	  	    if(level.type==="SEGMENT" || level.type==="EVENT"){
	  		$scope.levels.push(level);
	  	    }
	  	});
	    }
	});
	$scope.mss.setModuleSequence($scope.fs.configuration["marytts.runutils.Request"]["module_sequence"]);
	$scope.mss.setInput($scope.fs.configuration["marytts.runutils.Request"]["input_serializer"]);
	$scope.mss.setOutput($scope.fs.configuration["marytts.runutils.Request"]["output_serializer"]);

	$scope.configuration = JSON.stringify($scope.fs.configuration,null,4);


    });
