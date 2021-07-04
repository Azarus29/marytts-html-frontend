'use strict';

/**
* Add an osci of the signal of the fileService
*/
angular.module('MaryTTSHTMLFrontEnd')
	.directive('osci', function (Drawhelperservice, MaryService, appStateService,mouseService) {
		return {
			templateUrl: 'views/osci.html',
			restrict: 'E',
			replace: true,
			scope: {},
			link: function postLink(scope, element) {
				var canvas = document.getElementById("osci");
				var canvas2 = document.getElementById("osci2");
				scope.bs = MaryService;
				scope.ass = appStateService;
				scope.ms = mouseService;

				scope.start = undefined;
				scope.stop = undefined;



				//watching when the audio signal is available
			    scope.$watch('bs.getAudioBuffer()', function(newValue, oldValue){
					if ((newValue!==undefined)&&(oldValue!==newValue)) {
						scope.start = 0;
						scope.stop = scope.bs.getAudioBuffer().length;
						Drawhelperservice.freshRedrawDrawOsciOnCanvas(canvas, scope.start, scope.stop, true);
					}
				});

				//watching when zooming or shifting
				scope.$watch('ass.getStart()',function(newValue, oldValue){
					if ((newValue!==undefined)&&(oldValue!==newValue)) {
						scope.start = scope.ass.getStart();
						scope.stop = scope.ass.getStop();
						Drawhelperservice.freshRedrawDrawOsciOnCanvas(canvas, scope.start, scope.stop, true);
						Drawhelperservice.drawSelectedArea(canvas2);
					}
				});

				scope.$watch('ass.getStop()',function(newValue, oldValue){
					if ((newValue!==undefined)&&(oldValue!==newValue)) {
						scope.start = scope.ass.getStart();
						scope.stop = scope.ass.getStop();
						Drawhelperservice.freshRedrawDrawOsciOnCanvas(canvas, scope.start, scope.stop, true);
						Drawhelperservice.drawSelectedArea(canvas2);

					}
				});

				//Watches for drawing the selected area
				scope.$watch('ms.getSelectedAreaS()', function (newValue, oldValue) {
					if ((newValue!==undefined)&&(oldValue!==newValue)) {
						Drawhelperservice.drawSelectedArea(canvas2);
					}
				});

				scope.$watch('ms.getSelectedAreaE()', function (newValue, oldValue) {
					if ((newValue!==undefined)&&(oldValue!==newValue)) {
						Drawhelperservice.drawSelectedArea(canvas2);
					}
				});

				//Mouse bind -- Draw selected area
				element.bind("mousedown", function(event){
					scope.ms.setSelectedAreaS( scope.ass.getStart() + scope.ass.getX(event) * scope.ass.getSamplesPerPixelVal(event));
				});

				element.bind("mouseup", function(event){
					scope.ms.setSelectedAreaE( scope.ass.getStart() + scope.ass.getX(event) * scope.ass.getSamplesPerPixelVal(event));
				})

				//mousemove for red drawing line
				element.bind("mousemove", function(event){
					//draw red line at the position of the mouse - update the mouseX and mouseY from mouseService
					if(event.buttons>0){ //if mouse button was clicked
						scope.ms.setSelectedAreaE( scope.ass.getStart() + scope.ass.getX(event) * scope.ass.getSamplesPerPixelVal(event));
					}
				});

			}
		};
	});
