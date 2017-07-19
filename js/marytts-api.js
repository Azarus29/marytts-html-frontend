'use strict';

/* Mary global information */
var MARY_HOST = "localhost";
var MARY_PORT = "59125";

var current_voice = 0;
var current_language = 0;
var current_region = 0;

var wavesurfer;  // Wavesurfer instance
var blob_wav;    // Wav buffer
var list_phones; // Phone list for the segmentation part

/**
 * Get base Mary HTTP server url
 * @returns {String} base server URL
 */
function _baseUrl() {
    return "http://" + MARY_HOST + ":" + MARY_PORT + "/";
}


/*************************************************************************************************
 ** Marytts
 *************************************************************************************************/
/**
 * Play the audio file
 * @returns {undefined}
 */
function play() {
    wavesurfer.play();
}

/**
 * Pause the audio file
 * @returns {undefined}
 */
function pause() {
    wavesurfer.playPause();
    //change the icon
    if ($('#pause').attr('data-state') === 'off') {
        $('#pause').attr('data-state', 'on');
        $('#pause-text').text('Play');
        $('#pause-icon').removeClass('glyphicon-pause').addClass('glyphicon-play');
    } else {
        $('#pause').attr('data-state', 'off');
        $('#pause-text').text('Pause');
        $('#pause-icon').removeClass('glyphicon-play').addClass('glyphicon-pause');
    }
}

/**
 * Save the audio file
 * @returns {undefined}
 */
function save() {
    saveAs(blob_wav, "synth.wav");
}

/**
 * Synthesize the text
 * @returns {undefined}
 */
function synthesize() {

    var input_text = $("#text-to-synth").val();
    //validate input text
    if (input_text.length === 0)
    {
        alert('text needs to be defined !');
    } else {

        $.get(_baseUrl() + 'synthesize' + "?text=" + input_text,
                function (response) {
                    // Change the output level
                    setLevel();
                    // Get signal
                    var xmlhttp_signal = new XMLHttpRequest();
                    xmlhttp_signal.open("GET", _baseUrl() + "getSynthesizedSignal", true);
                    xmlhttp_signal.responseType = 'blob';
                    xmlhttp_signal.send();

                    xmlhttp_signal.onload = function () {
                        if (xmlhttp_signal.status === 200) {
                            // TODO: debug !
                            // if (! document.getElementById('none').checked)
                            // {
                            //     document.getElementsByName('debug')[0].value = xmlhttp_signal.responseText;
                            // }
                            // Save wav conent to memory and play it
                            blob_wav = xmlhttp_signal.response;
                            wavesurfer.loadBlob(blob_wav);

                            // Enable the buttons
                            $('#pause').prop('disabled', false);
                            $('#play').prop('disabled', false);
                            $('#save').prop('disabled', false);
                            //reset pause button state
                            $('#pause').attr('data-state', 'off');
                            $('#pause-text').text('Pause');
                            $('#pause-icon').removeClass('glyphicon-play').addClass('glyphicon-pause');
                            //scroll down to bottom
                            $("html, body").animate({scrollTop: $(document).height()}, 1000);
                        }
                    }
                }, 'json');
    }
}

/**
 * Start synthesize process
 * @returns {undefined}
 */
function synth() {

    var input_text = $("#text-to-synth").val();
    //validate input text
    if (input_text.length === 0) {
        alert('text needs to be defined !');
    } else {
        var input_type = "TEXT";
        var output_type = "REALISED_ACOUSTPARAMS";
        var locale = "en_US"; // FIXME: harcoded locale !
        var audio = "WAVE_FILE";

        var url = _baseUrl() + "process?input='" + input_text;
        url += "'&inputType=" + input_type;
        url += "&outputType=" + output_type + "";

        //send request
        $.get(url,
                function (response) {
                    var result = response.result;
                    list_phones = [];
                    for (var p in result.phrases)
                    {
                        for (var t in result.phrases[p].tokens)
                        {
                            for (var s in result.phrases[p].tokens[t].syllables)
                            {
                                for (var ph in result.phrases[p].tokens[t].syllables[s].phones)
                                {
                                    list_phones.push(result.phrases[p].tokens[t].syllables[s].phones[ph]);
                                }
                            }
                        }
                        if (result.phrases[p].end_pause_duration !== 0)
                        {
                            var pause = new Object();
                            pause.label = "_"; // FIXME: hack the pause label
                            pause.duration = result.phrases[p].endPauseDuration;
                            list_phones.push(pause);
                        }
                    }
                    // Change the output level
                    setLevel();
                    // Achieve the synthesis
                    synthesize();
                }, 'json');
    }
}
/********************************************************************************************
 *** Global initialisation functions
 ********************************************************************************************/
$(document).ready(function () {

    // Create an instance
    wavesurfer = Object.create(WaveSurfer);

    // Init & load audio file
    var options = {
        container: document.querySelector('#waveform'),
        // FIXME: see for the scrollbar
        // fillParent    : false,
        // minPxPerSec   : 2000,
        waveColor: '#587d9d',
        progressColor: '#97c7de',
        height: 200,
        cursorColor: 'red'
    };

    if (location.search.match('scroll')) {
        options.minPxPerSec = 100;
        options.scrollParent = true;
    }

    // Init
    wavesurfer.init(options);
    wavesurfer.initRegions();

    //add zoom in/out slider
    var slider = document.querySelector('#slider');

    slider.oninput = function () {
        var zoomLevel = Number(slider.value);
        wavesurfer.zoom(zoomLevel);
    };

    // Play at once when ready
    // Won't work on iOS until you touch the page
    wavesurfer.on('ready', function () {
        //reset the zoom slider
        $('#slider').val(100);
        wavesurfer.zoom(100);
        // Add segmentation labels
        var segmentation = Object.create(WaveSurfer.Segmentation);
        segmentation.init({
            wavesurfer: wavesurfer,
            container: "#timeline"
        });

        // Add segmentation region
        var start = 0;
        wavesurfer.clearRegions();
        for (var p in list_phones) {
            var region = new Object();
            region.start = start;
            region.drag = false;
            region.end = start + (list_phones[p].duration / 1000);
            region.color = randomColor(0.1);
            wavesurfer.addRegion(region);
            start += (list_phones[p].duration / 1000);
        }

        // // Add spectrogramm
        // var spectrogram = Object.create(WaveSurfer.Spectrogram);

        // spectrogram.init({
        //     wavesurfer: wavesurfer,
        //     container: "#spectrogram",
        //     fftSamples: 1024
        // });

        // Finally play
        wavesurfer.play();
    });

    // Report errors
    wavesurfer.on('error', function (err) {
        console.error(err);
    });

    // Do something when the clip is over
    wavesurfer.on('finish', function () {
        console.log('Finished playing');
    });


    /* Progress bar */
    document.addEventListener('DOMContentLoaded', function () {
        var progressDiv = document.querySelector('#progress-bar');
        var progressBar = progressDiv.querySelector('.progress-bar-blob');

        var showProgress = function (percent) {
            progressDiv.style.display = 'block';
            progressBar.style.width = percent + '%';
        };

        var hideProgress = function () {
            progressDiv.style.display = 'none';
        };

        wavesurfer.on('loading', showProgress);
        wavesurfer.on('ready', hideProgress);
        wavesurfer.on('destroy', hideProgress);
        wavesurfer.on('error', hideProgress);
    });
});

/**
 * Random RGBA color.
 */
function randomColor(alpha) {
    return 'rgba(' + [
        ~~(Math.random() * 255),
        ~~(Math.random() * 255),
        ~~(Math.random() * 255),
        alpha || 1
    ] + ')';
}
