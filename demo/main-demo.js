/* 
* @Author: login
* @Date:   2014-10-09 09:03:02
* @Last Modified by:   login
* @Last Modified time: 2014-10-09 14:13:20
*/
function startVideoBackground(){
    var options = {
        elementID: "video_bck01",
        align: "center",
        display: "fixed",
        stretch: true,
        width: 1280,
        height: 720,
        autostart: true,
        controls: false,
        loop: false,
        muted: false,
        videoLocation: "local", // Local Or Remote
        path: "video/",
        filename: "example01",
        types: ["mp4","ogg","webm"],
        poster: "video/example01.jpg",
        videoID: "video_background01",
        // // only functional if "loop" is false
        ended: function(){
            console.log("ended");
        },
        onError: function(error){

        }
    };
    var bodyVideoBackground = new videoBackground(options);
};

(function () {
    if (document.readyState === "complete" || document.readyState === "interactive") {
        startVideoBackground();
    } else {
        if (document.addEventListener) {
            document.addEventListener('DOMContentLoaded', function factorial() {
            document.removeEventListener('DOMContentLoaded', arguments.callee, false);
            startVideoBackground();
        }, false);
        } else if (document.attachEvent) {
            document.attachEvent('onreadystatechange', function() {
                if (document.readyState === 'complete') {
                    document.detachEvent('onreadystatechange', arguments.callee);
                    startVideoBackground();
                }
            });
        }
    }
})();