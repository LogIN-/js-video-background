## Introduction
`js-video-background` from now on: `JVB` is a pure javascript plug-in to display video backgrounds on page elements.
The script automatically picks the most optimal video format based on the browser where it is being run in. It has a built in image 
fall-back for mobile devices where it is not possible to have video playing as a background. When the HTML5 video tag is not supported, 
a Flash fall-back will make sure the video will be visible.

## Get started
You can easily clone this repo or just download files.
You have few examples of multi-video and full-screen video background in `demo` folder.

You have following options:
```javascript
// Lets define our options object holder
var optionsTop = {
    // String - css #id of element that needs video background 
    // if you wont to put it on <body> then you need also to assign #id like: <body id="video-background">
    elementID: "video-horizontal-top",
    // String - Center video on desired position
    align: "left",
    // String - Video css display property. Sometimes you want fixed of static?
    display: "absolute",
    // Bollean - true || false - should video be stretched with parent element?
    stretch: true,
    // Integer - original video dimensions. So we can calculate aspect ratio and some other stuff
    width: 1280,
    height: 720,
    // Boolean - autostart video on loaded event?
    autostart: false,
    // Boolean - Display html5 video controls?
    controls: false,
    // Boolean - loop video on the end all over again
    loop: true,
    // Boolean - do we need sound?
    muted: true,
    // String - local || remote - where is video hosted?
    videoLocation: "local",
    // String - path to video file without filename
    path: "video/",
    // String - filename of video without extension
    filename: "small",
    // Array - extensions of video files we have in parent folder?
    // MPEG4 for Safari
    // Ogg Theora for Firefox 3.1b2
    types: ["mp4", "ogg", "webm"],
    poster: false,
    // String - unique CSS id that we will assign to created video element
    videoID: "video_background_top",
    // Integer - video z-index value
    zIndex: "0",
    // CALLBACKS
    // Its called when video is clicked
    onclick: function(){
        // pauseVideo
        // playVideo
        // isPaused
        // isEnded

        if(this.isPaused() === true){
           this.playVideo(); 
        }else{
            this.pauseVideo();
        }
        
    },
    // Its called when video ended
    ended: function() {
        console.log("ended")
    },
    // Its called when video has error
    onError: function(e) {

    }
}
// Create our video and add options to it
new videoBackground(optionsTop);
```

## Support and Bugs
If you are having trouble, have found a bug, or want to contribute don't be shy.
[Open a ticket](https://github.com/LogIN-/js-video-background/issues) on GitHub.

## License
`JVB` source-code uses the GNU GENERAL PUBLIC LICENSE Version 2, see our `LICENSE` file.