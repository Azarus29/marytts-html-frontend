'use strict';

// FIXME: see for duration placement

angular.module('MaryTTSHTMLFrontEnd')
    .directive('level', function ($timeout, $animate, MaryService, fontScaleService, AnnotService,appStateService,Drawhelperservice,mouseService) {
	return {
            templateUrl: 'views/level.html',
            restrict: 'E',
            scope: {
		levels: '='//,
		//idx: '='
            },
            link: function postLink(scope, element) {

		//Now we can draw on the canvas -- levels contains each level

		//select the needed DOM items from the template
		scope.open = true; // attr.open; // not using attr.open any more because minification changes open="true" to open
		scope.bs = MaryService;
		scope.anots = AnnotService;
		scope.ass = appStateService;
		scope.ms = mouseService;

		var canvas = element.find('.canvas1');
		var canvas2 = element.find('.canvas2');
		var levelCanvasContainer = element.find('div');
		scope.backgroundCanvas = {
		    'background': "#E7E7E7"
		};

		scope.drawHierarchy = false; //

		///////////////
		// watches

		//watch for levels datas
		scope.$watch('levels', function (newValue, oldValue) {
		    if (newValue !== oldValue) {
			scope.redraw();
		    }
		});


		//watches for zoom
		scope.$watch('ass.getStart()', function (newValue, oldValue) {
		    if (newValue !== oldValue) {
			scope.redraw();
			canvas2 = element.find('.canvas2');
			for(var i = 0; i<canvas2.length; i++){
			    Drawhelperservice.drawSelectedArea(canvas2[i]);
			}		    }
		});


		scope.$watch('ass.getStop()', function (newValue, oldValue) {
		    if (newValue !== oldValue) {
			scope.redraw();
			canvas2 = element.find('.canvas2');
			for(var i = 0; i<canvas2.length; i++){
			    Drawhelperservice.drawSelectedArea(canvas2[i]);
			}
		    }
		});

		//Watches for drawing the selected area
		scope.$watch('ms.getSelectedAreaS()', function (newValue, oldValue) {
		    if (newValue !== oldValue) {
			canvas2 = element.find('.canvas2');
			for(var i = 0; i<canvas2.length; i++){
			    Drawhelperservice.drawSelectedArea(canvas2[i]);
			}
		    }
		});

		scope.$watch('ms.getSelectedAreaE()', function (newValue, oldValue) {
		    if (newValue !== oldValue) {
			canvas2 = element.find('.canvas2');
			for(var i = 0; i<canvas2.length; i++){
			    Drawhelperservice.drawSelectedArea(canvas2[i]);
			}
		    }
		});

		//ADD a structure which contains all the levels and check which one is clicked
		//Check the position with viewState.getX(x) * viewState.getSamplesPerPixelVal(x)
		//Check which event is the closest levels.items.foreach.samplestart + sampledur

		element.bind("click", function(event){
		    var eltID = event.target.parentElement.id;
		    //level type - choose between only drawing line or a selected area
		    var clickSample = scope.ass.getStart() + scope.ass.getX(event) * scope.ass.getSamplesPerPixelVal(event);
		    scope.levels.forEach(function(level){
			if(level.name === eltID){
			    level.items.forEach(function(item){
				if(level.type==="SEGMENT"){
				    if(clickSample >= item.sampleStart && clickSample < item.sampleStart + item.sampleDur){
					scope.ms.setSelectedAreaS(item.sampleStart);
					scope.ms.setSelectedAreaE(item.sampleStart+item.sampleDur);
				    }
				} else if (level.type==="EVENT"){
				    var spaceLower = 0;
				    var spaceHigher = 0;
				    level.items.forEach(function (evt, index) {
					if (index < level.items.length - 1) {
					    spaceHigher = evt.samplePoint + (level.items[index + 1].samplePoint - level.items[index].samplePoint) / 2;
					} else {
					    spaceHigher = scope.bs.getAudioBuffer().length;
					}
					if (index > 0) {
					    spaceLower = evt.samplePoint - (level.items[index].samplePoint - level.items[index - 1].samplePoint) / 2;
					} else {
					    spaceLower = 0;
					}
					if (clickSample <= spaceHigher && clickSample >= spaceLower) {
					    scope.ms.setSelectedAreaS(evt.samplePoint);
					    scope.ms.setSelectedAreaE(evt.samplePoint);
					}
				    });
				}

			    });
			}
		    });
		});

		element.bind("dblclick",function(event){
		    var eltID = event.target.parentElement.id;
		    //level type - choose between only drawing line or a selected area
		    var clickSample = scope.ass.getStart() + scope.ass.getX(event) * scope.ass.getSamplesPerPixelVal(event);
		    scope.levels.forEach(function(level){
			if(level.name === eltID){
			    level.items.forEach(function(item){
				if(level.type==="SEGMENT"){
				    if(clickSample >= item.sampleStart && clickSample < item.sampleStart + item.sampleDur){
					scope.ass.setStartStop(item.sampleStart,(item.sampleStart+item.sampleDur));
					scope.ms.setSelectedAreaS(item.sampleStart);
					scope.ms.setSelectedAreaE(item.sampleStart+item.sampleDur);
				    }
				}

			    });
			}
		    });
		});

		//mousemove for red drawing line
		element.bind("mousemove", function(event){
		    //draw red line at the position of the mouse - update the mouseX and mouseY from mouseService - only draw vertical red line
		});


		//TODO Add marqueur to preselect levels + red lines

		// //
		// scope.$watch('vs.curViewPort', function (newValue, oldValue) {
		//     if (oldValue.sS !== newValue.sS || oldValue.eS !== newValue.eS || oldValue.windowWidth !== newValue.windowWidth) {
		//         scope.drawLevelDetails();
		//         scope.drawLevelMarkup();
		//     } else {
		//         scope.drawLevelMarkup();
		//     }
		// }, true);

		// //
		// scope.$watch('vs.curMouseX', function () {
		//     scope.drawLevelMarkup();
		// }, true);

		// //
		// scope.$watch('vs.curClickLevelName', function (newValue) {
		//     if (newValue !== undefined) {
		//         scope.drawLevelMarkup();
		//     }
		// }, true);

		// //
		// scope.$watch('vs.movingBoundarySample', function () {
		//     if (scope.level.name === scope.vs.curMouseLevelName) {
		//         scope.drawLevelDetails();
		//     }
		//     scope.drawLevelMarkup();
		// }, true);

		// //
		// scope.$watch('vs.movingBoundary', function () {
		//     scope.drawLevelMarkup();
		// }, true);

		// //
		// scope.$watch('hists.movesAwayFromLastSave', function () {
		//     scope.drawLevelDetails();
		//     scope.drawLevelMarkup();

		// }, true);

		// //
		// scope.$watch('vs.curPerspectiveIdx', function () {
		//     scope.drawLevelDetails();
		//     scope.drawLevelMarkup();
		// }, true);

		// //
		// scope.$watch('lmds.getCurBndl()', function (newValue, oldValue) {
		//     if (newValue.name !== oldValue.name || newValue.session !== oldValue.session) {
		//         scope.drawLevelDetails();
		//         scope.drawLevelMarkup();
		//     }
		// }, true);

		//
		/////////////////

		scope.redraw = function () {
		    scope.drawLevelDetails();
		    //scope.drawLevelMarkup();
		};

		/**
		 *
		 */
		/*scope.changeCurAttrDef = function (attrDefName, index) {
		  var curAttrDef = scope.vs.getCurAttrDef(scope.level.name);
		  if (curAttrDef !== attrDefName) {
		  // curAttrDef = attrDefName;
		  scope.vs.setCurAttrDef(scope.level.name, attrDefName, index);

		  if (!element.hasClass('emuwebapp-level-animation')) {
		  scope.vs.setEditing(false);
		  LevelService.deleteEditArea();
		  $animate.addClass(levelCanvasContainer, 'emuwebapp-level-animation').then(function () {
		  $animate.removeClass(levelCanvasContainer, 'emuwebapp-level-animation');
		  // redraw
		  scope.drawLevelDetails();
		  scope.drawLevelMarkup();
		  });
		  }
		  }
		  };*/

		/**
		 *
		 */
		/*scope.getAttrDefBtnColor = function (attrDefName) {
		  var curColor;
		  var curAttrDef = scope.vs.getCurAttrDef(scope.level.name);
		  if (attrDefName === curAttrDef) {
		  curColor = {
		  'background': '-webkit-radial-gradient(50% 50%, closest-corner, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0) 60%)'
		  };
		  } else {
		  curColor = {
		  'background-color': 'white'
		  };
		  }
		  return curColor;
		  };*/

		// scope.updateView = function () {
		//     if ($.isEmptyObject(scope.cps)) {
		//         return;
		//     }
		//     scope.drawLevelDetails();
		// };


		///////////////
		// bindings

		// on mouse leave reset viewState.
		// element.bind('mouseleave', function () {
		//     scope.vs.setcurMouseItem(undefined, undefined, undefined);
		//     scope.drawLevelMarkup();
		// });

		/**
		 * draw level details
		 */
		scope.drawLevelDetails = function () {
		    canvas = element.find('.canvas1');
                    var labelFontFamily; // font family used for labels only
                    var fontFamily = "HelveticaNeue"; // found in EMU config

                    var labelFontSize = 20; // font family used for labels only
		    var fontSize = 18; // 12 px, found in EMU config


		    var isOpen = element.parent().css('height') !== '25px';// ? false : true;

		    // draw hierarchy if canvas is displayed
		    /*if(scope.drawHierarchy){
		      scope.drawHierarchyDetails();
		      }*/
		    var i = 0;
		    //Drawing loop in the canvas
		    scope.levels.forEach(function(level){
			var curAttrDef = level.name;
			var ctx = canvas[i++].getContext('2d'); //There a total of level * 2 canvas, 2 for each canvas (one for details, one for markups)
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			ctx.fillStyle = "#FFFFFF"; // "#E7E7E7";
			ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			//predef vars
			var sDist, posS, posE;

			sDist = scope.ass.getSampleDist(ctx.canvas.width);

			// draw name of level and type
			var scaleY = ctx.canvas.height / ctx.canvas.offsetHeight;
			//DRAWS Phonetic (SEGMENT) - Tone (EVENT)
			if (level.name === curAttrDef) {
			    if (isOpen) {
				fontScaleService.drawUndistortedTextTwoLines(ctx, level.name, '(' + level.type + ')', fontSize, fontFamily, 4, ctx.canvas.height / 2 - fontSize * scaleY, "#000", true);
			    }
			    else {
				fontSize -= 2;
				fontScaleService.drawUndistortedText(ctx, level.name, fontSize, fontFamily, 4, ctx.canvas.height / 2 - (fontSize * scaleY / 2), "#000", true);
			    }
			} else {
			    fontScaleService.drawUndistortedTextTwoLines(ctx, level.name + ':' + curAttrDef, '(' + level.type + ')', fontSize, fontFamily, 4, ctx.canvas.height / 2 - fontSize * scaleY, "#000", true);
			}

			var curID = -1;

			// calculate generic max with of single char (m char used)
			//var mTxtImg = fontScaleService.drawUndistortedText(ctx, 'm', fontSize - 2, labelFontFamily, "#000");
			var mTxtImgWidth = ctx.measureText('m').width * fontScaleService.scaleX;

			// calculate generic max with of single digit (0 digit used)
			//var zeroTxtImg = fontScaleService.drawUndistortedText(ctx, '0', fontSize - 4, labelFontFamily, "#000");
			var zeroTxtImgWidth = ctx.measureText('0').width * fontScaleService.scaleX;
			if (level.type === 'SEGMENT') {
			    ctx.fillStyle = "#000";
			    // draw segments

			    level.items.forEach(function (item) {
				++curID;

				if (item.sampleStart >= scope.ass.getStart() &&
				    item.sampleStart <= scope.ass.getStop() || //within segment
				    item.sampleStart + item.sampleDur > scope.ass.getStart() &&
				    item.sampleStart + item.sampleDur < scope.ass.getStop() || //end in segment
				    item.sampleStart < scope.ass.getStart() &&
				    item.sampleStart + item.sampleDur > scope.ass.getStop() // within sample
				   ) {
				    // get label
				    var curLabVal;
				    item.labels.forEach(function (lab) {
					if (lab.name === curAttrDef) {
					    curLabVal = lab.value;
					}
				    });
				    // draw segment start
				    posS = scope.ass.getPos(ctx.canvas.width, item.sampleStart);
				    posE = scope.ass.getPos(ctx.canvas.width, item.sampleStart + item.sampleDur + 1);

				    ctx.fillStyle = "#000";
				    ctx.fillRect(posS, 0, 2, ctx.canvas.height / 2);

				    //draw segment end
				    ctx.fillStyle = "#888";
				    ctx.fillRect(posE, ctx.canvas.height / 2, 2, ctx.canvas.height);

				    ctx.font = (fontSize - 2 + 'px' + ' ' + labelFontFamily);

				    //check for enough space to stroke text
				    if ((curLabVal !== undefined) && posE - posS > (mTxtImgWidth * curLabVal.length)) {
					if (isOpen) {
					    fontScaleService.drawUndistortedText(ctx, curLabVal, labelFontSize - 2, labelFontFamily, posS + (posE - posS) / 2, (ctx.canvas.height / 2) - (fontSize - 2) + 2, "#000", false);
					} else {
					    fontScaleService.drawUndistortedText(ctx, curLabVal, labelFontSize - 2, labelFontFamily, posS + (posE - posS) / 2, (ctx.canvas.height / 2) - fontSize + 2, "#000", false);
					}
				    }


				    //draw helper lines
				    if (scope.open && curLabVal !== undefined && curLabVal.length !== 0) { // only draw if label is not empty
					var labelCenter = posS + (posE - posS) / 2;

					var hlY = ctx.canvas.height / 4;
					// start helper line
					ctx.strokeStyle = "#000";
					ctx.beginPath();
					ctx.moveTo(posS, hlY);
					ctx.lineTo(labelCenter, hlY);
					ctx.lineTo(labelCenter, hlY + 5);
					ctx.stroke();

					hlY = ctx.canvas.height / 4 * 3;
					// end helper line
					ctx.strokeStyle = "#888";
					ctx.beginPath();
					ctx.moveTo(posE, hlY);
					ctx.lineTo(labelCenter, hlY);
					ctx.lineTo(labelCenter, hlY - 5);
					ctx.stroke();
				    }

				    if (scope.open){
					// draw sampleStart numbers
					//check for enough space to stroke text
					if (posE - posS > zeroTxtImgWidth * item.sampleStart.toString().length && isOpen) {
					    var sr = scope.anots.getSampleRate();
					    var starttext =  Math.round(item.sampleStart/sr*1000)/1000;
					    fontScaleService.drawUndistortedText(ctx, starttext, fontSize - 2, fontFamily, posS + 3, 0, "#000", true);
					}

					// draw sampleDur numbers.
					var sr = scope.anots.getSampleRate();
					var durtext = 'dur: ' + Math.round(item.sampleDur/sr*1000)/1000 + ' ';
					//check for enough space to stroke text
					if (posE - posS > zeroTxtImgWidth * durtext.length && isOpen) {
					    fontScaleService.drawUndistortedText(ctx, durtext, fontSize - 2, fontFamily, posE - (ctx.measureText(durtext).width * fontScaleService.scaleX), ctx.canvas.height / 4 * 3, "#000", true);
					}
				    }
				}
			    });
			} else if (level.type === 'EVENT') {
			    ctx.fillStyle = "#000";
			    // predef. vars
			    var perc;

			    level.items.forEach(function (item) {
				if (item.samplePoint > scope.ass.getStart() && item.samplePoint < scope.ass.getStop()) {
				    perc = Math.round(scope.ass.getPos(ctx.canvas.width, item.samplePoint) + (sDist / 2));
				    // get label
				    var curLabVal;
				    item.labels.forEach(function (lab) {
					if (lab.name === curAttrDef) {
					    curLabVal = lab.value;
					}
				    });

				    ctx.fillStyle = "#000";
				    ctx.fillRect(perc, 0, 1, ctx.canvas.height / 2 - ctx.canvas.height / 5);
				    ctx.fillRect(perc, ctx.canvas.height / 2 + ctx.canvas.height / 5, 1, ctx.canvas.height / 2 - ctx.canvas.height / 5);

				    fontScaleService.drawUndistortedText(ctx, curLabVal, labelFontSize - 2, labelFontFamily, perc, (ctx.canvas.height / 2) - (fontSize - 2) + 2, "#000", false);
				    if (isOpen) {
					fontScaleService.drawUndistortedText(ctx, item.samplePoint, fontSize - 2, labelFontFamily, perc + 5, 0, "#000", true);
				    }
				}
			    });
			}
		    });

		    // draw cursor/selected area
		};

		/**
		 *
		 */
		/*scope.drawLevelMarkup = function () {
		  var ctx = canvas[1].getContext('2d');
		  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		  // if (scope.level.name === scope.vs.getcurClickLevelName()) {
		  //     ctx.fillStyle = ConfigProviderService.design.color.transparent.grey;
		  //     ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		  // }

		  // draw moving boundary line if moving
		  Drawhelperservice.drawMovingBoundaryLine(ctx);

		  // draw current viewport selected
		  Drawhelperservice.drawCurViewPortSelected(ctx);


		  var posS, posE, sDist, xOffset, item;
		  posS = scope.ass.getPos(ctx.canvas.width, scope.ass.getStart());
		  posE = scope.ass.getPos(ctx.canvas.width, scope.ass.getStop());
		  sDist = scope.ass.getSampleDist(ctx.canvas.width);


		  var segMId = scope.vs.getcurMouseItem();
		  var isFirst = scope.vs.getcurMouseisFirst();
		  var isLast = scope.vs.getcurMouseisLast();
		  var clickedSegs = scope.vs.getcurClickItems();
		  var levelId = scope.vs.getcurClickLevelName(); // TODO Fix those variables - ie create a mouse manager
		  if (clickedSegs !== undefined) {
		  // draw clicked on selected areas
		  if (scope.level.name === levelId && clickedSegs.length > 0) {
		  clickedSegs.forEach(function (cs) {
		  if (cs !== undefined) {
		  // check if segment or event level
		  if (cs.sampleStart !== undefined) {
		  posS = Math.round(scope.ass.getPos(ctx.canvas.width, cs.sampleStart));
		  posE = Math.round(scope.ass.getPos(ctx.canvas.width, cs.sampleStart + cs.sampleDur + 1));
		  } else {
		  posS = Math.round(scope.ass.getPos(ctx.canvas.width, cs.samplePoint) + sDist / 2);
		  posS = posS - 5;
		  posE = posS + 10;
		  }
		  ctx.fillStyle = "rgba(255, 255, 22, 0.35)";
		  ctx.fillRect(posS, 0, posE - posS, ctx.canvas.height);
		  ctx.fillStyle = "#000";
		  }
		  });
		  }
		  }


		  // draw preselected boundary
		  item = scope.vs.getcurMouseItem();
		  if (scope.level.items.length > 0 && item !== undefined && segMId !== undefined && scope.level.name === scope.vs.getcurMouseLevelName()) {
		  ctx.fillStyle = ConfigProviderService.design.color.blue;
		  if (isFirst === true) { // before first segment
		  if (scope.vs.getcurMouseLevelType() === 'SEGMENT') {
		  item = scope.level.items[0];
		  posS = Math.round(scope.vs.getPos(ctx.canvas.width, item.sampleStart));
		  ctx.fillRect(posS, 0, 3, ctx.canvas.height);
		  }
		  } else if (isLast === true) { // after last segment
		  if (scope.vs.getcurMouseLevelType() === 'SEGMENT') {
		  item = scope.level.items[scope.level.items.length - 1];
		  posS = Math.round(scope.vs.getPos(ctx.canvas.width, (item.sampleStart + item.sampleDur + 1))); // +1 because boundaries are drawn on sampleStart
		  ctx.fillRect(posS, 0, 3, ctx.canvas.height);
		  }
		  } else { // in the middle
		  if (scope.vs.getcurMouseLevelType() === 'SEGMENT') {
		  posS = Math.round(scope.vs.getPos(ctx.canvas.width, item.sampleStart));
		  ctx.fillRect(posS, 0, 3, ctx.canvas.height);
		  } else {
		  posS = Math.round(scope.vs.getPos(ctx.canvas.width, item.samplePoint));
		  xOffset = (sDist / 2);
		  ctx.fillRect(posS + xOffset, 0, 3, ctx.canvas.height);

		  }
		  }
		  ctx.fillStyle = "#000";

		  }

		  // draw cursor
		  Drawhelperservice.drawCrossHairX(ctx, viewState.curMouseX);
		  };*/

            }
	};
    });
