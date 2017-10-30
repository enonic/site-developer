
require('../plugins/modal.js');


$(function () {

    $('.software-show__version-select').change(function () {
        var selectedVersion = $(this).val();
        $('*[data-version-placeholder]').each(function() {
            var placeholder = $(this).data('version-placeholder');
            var attrToReplace = $(this).data('placeholder-replace');
            var replacement = placeholder.replace(/VERSIONPLACEHOLDER/g, selectedVersion);

            if (attrToReplace === 'text') {
                $(this).text(replacement);
            }
            else {
                $(this).attr(attrToReplace, replacement);
            }
        });
    });


});



$('.software-show__download-instructions').modal({
    trigger: $('.software-show__download-button')
});

var Clipboard = require('../vendor/clipboard.js');
var toolboxClipboard = new Clipboard('.software-show__toolbox-code-clipboard-btn');


/*
// Add submitted class on download-xp modal cols
// This is used for hiding the col info when form is submitted (only show send receipt)
$(function() {
    $('.software-show__cloud-trial-form').on('success', function() {
        $(this).siblings().hide();
    });
});*/

function isInt(value) {
    return !isNaN(value) &&
        parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
}


function createYoutubeIframe(videoId, width, height) {
    var $iframe = $('<iframe/>').attr('id', 'ytp' + videoId);
    $iframe.attr('src',
        '//www.youtube.com/embed/' + videoId + '?autoplay=1&autohide=1&border=0&wmode=opaque&enablejsapi=1');

    $iframe.attr('allowfullscreen', 'true');

    if (isInt(width)) {
        $iframe.width(width);
    }
    if (isInt(height)) {
        $iframe.height(height);
    }

    return $iframe;
}

$('.software-show__play-video').on('click', function() {
    var playBtn = $(this);
    var videoId = $(this).data('youtube-id');
    var $iframe = createYoutubeIframe(videoId);
    var $modal = $('<div class="software-show__video-modal"/>');
    $iframe.appendTo($modal);
    $modal.appendTo('.software-show');
    $modal.modal({
        triggered: true,
        trigger: playBtn,
        removeOnClose: true
    });
});

$('.software-show__screenshot-link').on('click', function(e) {
    e.preventDefault();
    var $link = $(this);
    var screenshotUrl = $link.attr('href');
    var $modal = $('<div class="software-show__screenshot-modal"/>');
    var $screenshot = $('<img/>').attr('src', screenshotUrl);
    $screenshot.appendTo($modal);
    console.log($modal);
    $modal.appendTo('.software-show');
    $modal.modal({
        triggered: true,
        trigger: $link,
        removeOnClose: true
    });
});