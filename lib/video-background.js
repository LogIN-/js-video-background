/* 
 * @Author: login
 * @Date:   2014-10-09 09:03:23
 * @Last Modified by:   login
 * @Last Modified time: 2014-10-12 15:24:31
 */

// Video converter http://www.mirovideoconverter.com/
// Encoding video for android: http://www.broken-links.com/2010/07/30/encoding-video-for-android/

// CSS Scale support https://github.com/zoltan-dulac/cssSandpaper/blob/master/shared/js/cssSandpaper.js
(function() {
    // Baseline setup
    // --------------

    // Establish the root object, `window` in the browser, or `exports` on the server.
    var root = this;

    // Create a safe reference to the videoBackground object for use below.
    var videoBackground = function(obj) {
        if (obj instanceof videoBackground) return obj;
        if (!(this instanceof videoBackground)) return new videoBackground(obj);
    };

    // Export the videoBackground object for **Node.js**, with
    // backwards-compatibility for the old `require()` API. If we're in
    // the browser, add `videoBackground` as a global object.
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = videoBackground;
        }
        exports.videoBackground = videoBackground;
    } else {
        root.videoBackground = videoBackground;
    }
    videoBackground = function(options) {
        var self = this;
        self.resizeTimer = null;

        self.options = self.extend({}, options);

        self.parentElement = document.getElementById(self.options.elementID);
        if (!self.parentElement) {
            self.error("Invalid elementID selector!");
            return;
        }
        self.videoElement = null;

        // Container of parent element dimensions
        self.options.parentWidth = null;
        self.options.parentHeight = null;
        // Container of current video element dimensions
        self.options.videoWidth = null;
        self.options.videoHeight = null;

        self.options.proportion = null;
        // Check if user can play video
        if (self.canplayVideo() == false) {
            console.log("Video not supported!");
            self.options.autostart = false;
        }

        self.options.displayCSS = 'block';
        // Construct video element and append it to Parent
        self.buildVideoBackground();
    };

    videoBackground.prototype.buildVideoBackground = function() {
        var self = this;
        // 1. Create Video element
        var videoElement = document.createElement('video');
        // Add custom attributes to video element
        videoElement.setAttribute('id', self.options.videoID);
        videoElement.setAttribute('preload', "auto");
        if (self.options.autostart === true) {
            videoElement.setAttribute('autoplay', "autoplay");
        }
        if (self.options.controls === true) {
            videoElement.setAttribute('controls', "controls");
        }
        if (self.options.loop === true) {
            videoElement.setAttribute('loop', "loop");
        }
        if (self.options.muted === true) {
            videoElement.setAttribute('muted', "muted");
        }
        if (self.options.poster) {
            videoElement.setAttribute('poster', self.options.poster);
        }
        if (self.options.autobuffer) {
            videoElement.setAttribute('autobuffer', "autobuffer");
        }
        // Add custom CSS Styles to element
        videoElement.style.display = self.options.displayCSS;
        videoElement.style.position = self.options.display;
        videoElement.style.top = '0';
        videoElement.style.left = '0';
        videoElement.style.bottom = '0';
        videoElement.style.right = '0';
        videoElement.style.zIndex = self.options.zIndex || "-100";
        videoElement.style.width = '100%';
        videoElement.style.height = '100%';

        // Add video sources to video element
        for (var i = 0; i < self.options.types.length; i++) {
            // console.log("Adding src to video: " + self.options.types[i]);
            var sourceElement = document.createElement('source');
            sourceElement.setAttribute('src', self.options.path + self.options.filename + '.' + self.options.types[i]);
            sourceElement.setAttribute('type', 'video/' + self.options.types[i]);
            videoElement.appendChild(sourceElement);
        }
        // Add Object (flash) fall-back to video element
        var objectElement = document.createElement('object');
        objectElement.setAttribute('type', "application/x-shockwave-flash");
        objectElement.setAttribute('data', "http://flashfox.googlecode.com/svn/trunk/flashfox.swf");

        var objectParm01 = document.createElement('param');
        objectParm01.setAttribute('name', "movie");
        objectParm01.setAttribute('value', "http://flashfox.googlecode.com/svn/trunk/flashfox.swf");
        objectElement.appendChild(objectParm01);

        var objectParm02 = document.createElement('param');
        objectParm02.setAttribute('name', "allowFullScreen");
        objectParm02.setAttribute('value', "true");
        objectElement.appendChild(objectParm02);

        var objectParm03 = document.createElement('param');
        objectParm03.setAttribute('name', "wmode");
        objectParm03.setAttribute('value', "transparent");
        objectElement.appendChild(objectParm03);

        var objectParm04 = document.createElement('param');
        objectParm04.setAttribute('name', "flashVars");
        var flashVars = "controls=true&amp;poster=http%3A%2F%2Fsandbox.thewikies.com%2Fvfe-generator%2Fimages%2Fbig-buck-bunny_poster.jpg&amp;src=http%3A%2F%2Fclips.vorwaerts-gmbh.de%2Fbig_buck_bunny.mp4";
        objectParm04.setAttribute('value', flashVars);
        objectElement.appendChild(objectParm04);

        // Create image element and append it to Object element
        // This will act like video poster on non supported devices
        if (self.options.poster !== false) {
            objectElement.appendChild(self.createImg(self.options.poster, "Video Background", "Video Background"));
        }

        // Add object element to our video element
        videoElement.appendChild(objectElement);

        // Append video element to parent container
        self.parentElement.appendChild(videoElement);
        // Get DOM Element of Our newly created video object
        self.videoElement = document.getElementById(self.options.videoID);
        // listen window resize updates
        self.setupEventListeners();

        // Set video dimensions
        self.setVideoDimensions();

    };

    videoBackground.prototype.setVideoDimensions = function() {
        // console.log("Setting video proportion..");
        // Updates Parent video element dimensions
        // this.options.parentWidth $$ this.options.parentHeight
        this.updateParentElementDimmensions();
        // Get video aspect ratio
        this.options.proportion = this.getVideoProportion();

        this.videoElement.style.width = this.options.parentWidth;
        this.videoElement.style.height = this.options.parentHeight;

        // set image variables to new dimensions
        this.options.videoWidth = this.options.parentWidth;
        this.options.videoHeight = this.options.parentHeight;


        // If user wants to stretch video lets check dimensions and adjust
        if (this.options.stretch == false) {
            // Check if calculated video dimension is larger then parent??
            if (this.options.videoWidth > this.options.parentWidth) {
                this.options.videoWidth = this.options.parentWidth;
            }
            if (this.options.videoHeight > this.options.parentHeight) {
                this.options.videoHeight = this.options.parentHeight;
            }
        }
        // console.log("Width: %s Height: %s", this.options.width, this.options.height);
        // console.log("VIDEO: Width: %s Height: %s", this.options.width, this.options.height);
        // console.log("PARENT: Width: %s Height: %s", this.options.parentWidth, this.options.parentHeight);

        // Set Video Element calculated width and height.. This doesn't stretch video it preserves aspect ration
        this.videoElement.style.width = this.options.videoWidth + "px";
        this.videoElement.style.height = this.options.videoHeight + "px";
        // Should we stretch video to parent?
        if (this.options.stretch == true) {
            this.scaleVideoToRatio();
        }

        if (typeof this.options.align !== 'undefined') {
            this.centerVideoOnElement();
        }
    };

    // Calculate and scale video to correct container
    videoBackground.prototype.scaleVideoToRatio = function() {
        var scale = null;
        /* VIDEO ORIGINAL DIMENSIONS */
        var xv1 = this.options.width;
        var yv1 = this.options.height;
        /* CONTENT DIMENSIONS (PARENT) */
        var xc = this.options.parentWidth;
        var yc = this.options.parentHeight;
        /***********************************/
        // INITIATE SCALE VARIABLES
        var scaleX = null;
        var scaleY = null;

        var videoRatio = Math.round((xv1 / yv1) * 100) / 100;
        var contentRatio = Math.round((xc / yc) * 100) / 100;

        console.log("************************");
        console.log(videoRatio, contentRatio);

        if (videoRatio < contentRatio) {
            scaleX = Math.round((contentRatio / videoRatio) * 100) / 100;
            console.log("X: " + scaleX);
            scale = "scaleX(" + scaleX + ")";
            this.setCalculatedScale(scale);
            return;
        } else {
            scaleY = Math.round((videoRatio / contentRatio) * 100) / 100;
            console.log("Y: " + scaleY);
            scale = "scaleY(" + scaleY + ")";
            this.setCalculatedScale(scale);
            return;
        }

    };
    // Set CSS transform property of video element to desired value
    videoBackground.prototype.setCalculatedScale = function(scale) {
        if (scale) {
            this.videoElement.style.transform = scale;
            this.videoElement.style.msTransform = scale; /* IE9 */
            this.videoElement.style.MozTransform = scale; /* FF3.5+ */
            this.videoElement.style.WebkitTransform = scale; /* Saf3.1+, Chrome */
            this.videoElement.style.OTransform = scale; /* Opera 10.5+ */

            /*
            // http://stackoverflow.com/questions/3160295/ms-filter-with-javascript
            // IE8+ - must be on one line, unfortunately 
            this.videoElement.filters.item("DXImageTransform.Microsoft.Matrix").M11 = 0.5;
            this.videoElement.filters.item("DXImageTransform.Microsoft.Matrix").M12 = 0;
            this.videoElement.filters.item("DXImageTransform.Microsoft.Matrix").M21 = 0;
            this.videoElement.filters.item("DXImageTransform.Microsoft.Matrix").M22 = 0.5;
            this.videoElement.filters.item("DXImageTransform.Microsoft.Matrix").SizingMethod = 'auto expand';
            -ms-filter: "progid:DXImageTransform.Microsoft.Matrix(M11=0.5, M12=0, M21=0, M22=0.5, SizingMethod='auto expand')";
            // IE6 and 7
            filter: progid:DXImageTransform.Microsoft.Matrix(
                    M11=0.5,
                    M12=0,
                    M21=0,
                    M22=0.5,
                SizingMethod='auto expand');
           */
        } else {
            console.log("Can't set scale factor: Scale isn't defined!");
        }
    }

    // Get video proportion
    videoBackground.prototype.getVideoProportion = function() {
        var parentElementProportion = this.options.parentWidth / this.options.parentHeight;
        var videoElementProportion = this.options.width / this.options.height;
        var proportion = this.options.parentHeight / this.options.height;
        // console.log("Proportion: Parent: %s Video: %s Final: %s", parentElementProportion, videoElementProportion, proportion);

        if (parentElementProportion >= videoElementProportion) {
            proportion = this.options.parentWidth / this.options.width;
        }

        return proportion;
    };
    // Center video on desired position
    videoBackground.prototype.centerVideoOnElement = function() {

        // Get video element dimensions
        var dimmensionsVideo = this.getDivDimmensions(this.videoElement);
        // Get coordinates of parent element
        var parentOffset = this.getOffset(this.parentElement);
        var parent = {};
        parent.left = parentOffset.left;
        parent.top = parentOffset.top;
        parent.bottom = (parentOffset.top - this.options.parentHeight);
        parent.right = (parentOffset.left + this.options.parentWidth);

        if (this.options.align === 'left') {
            this.videoElement.style.left = parent.left + "px";
        } else if (this.options.align === 'left-top') {
            this.videoElement.style.left = parent.left + "px";
            this.videoElement.style.top = parent.top + "px";
        } else if (this.options.align === 'left-bottom') {
            this.videoElement.style.left = parent.left + "px";
            this.videoElement.style.bottom = parent.bottom + "px";
        } else if (this.options.align === 'right') {
            this.videoElement.style.right = parent.right + "px";
        } else if (this.options.align === 'right-top') {
            this.videoElement.style.right = parent.right + "px";
            this.videoElement.style.top = parent.top + "px";
        } else if (this.options.align === 'right-bottom') {
            this.videoElement.style.right = parent.right + "px";
            this.videoElement.style.bottom = parent.bottom + "px";
        } else {
            // console.log("1");
        }
    };

    /* Extends our object with user custom config */
    videoBackground.prototype.extend = function(a, b) {
        for (var key in b) {
            if (b.hasOwnProperty(key)) {
                a[key] = b[key];
            }
        }
        return a;
    };
    // Update parent video element dimension in global options
    videoBackground.prototype.updateParentElementDimmensions = function() {
        var dimmensions = this.getDivDimmensions(this.parentElement);
        this.options.parentWidth = dimmensions.width;
        this.options.parentHeight = dimmensions.height;
        // console.log("Parent element height: %s width: %s", this.options.parentWidth, this.options.parentHeight)
    };
    // Get element (div, video...) dimension
    videoBackground.prototype.getDivDimmensions = function(element) {
        var output = {};

        if (element.tagName && element.tagName.toLowerCase() == "body") {
            console.log("BODY AS PARENT");
            var body = document.body,
                html = document.documentElement;

            output.height = Math.max(body.scrollHeight, body.offsetHeight,
                html.clientHeight, html.scrollHeight, html.offsetHeight);

            output.width = Math.max(body.scrollWidth, body.offsetWidth,
                html.clientWidth, html.scrollWidth, html.offsetWidth);

        } else {
            output.width = element.offsetWidth || parseInt(element.style.width.replace("px", ""));
            output.height = element.offsetHeight || parseInt(element.style.height.replace("px", ""));
        }


        return output;

    };
    // Get element (div, video...) absolute position on screen
    videoBackground.prototype.getOffset = function(element) {
        var _x = 0;
        var _y = 0;
        while (element && !isNaN(element.offsetLeft) && !isNaN(element.offsetTop)) {
            _x += element.offsetLeft - element.scrollLeft;
            _y += element.offsetTop - element.scrollTop;
            element = element.offsetParent;
        }
        return {
            top: _y,
            left: _x
        };
    };

    /* JS API */
    // Pause Video play
    videoBackground.prototype.pauseVideo = function() {
        this.videoElement.pause();
    };
    // Start Video play
    videoBackground.prototype.playVideo = function() {
        this.videoElement.play();
    };
    // Is Video paused?
    videoBackground.prototype.isPaused = function() {
        return this.videoElement.paused;
    };
    // Is Video ended?
    videoBackground.prototype.isEnded = function() {
        return this.videoElement.ended;
    };
    // Detect if client support video playback
    videoBackground.prototype.canplayVideo = function() {
        // console.log("Detecting can play!!");
        /* jshint -W053 */
        var elem = document.createElement('video');
        var bool = false;
        // IE9 Running on Windows Server SKU can cause an exception to be thrown, bug #224
        try {
            if (bool = !!elem.canPlayType) {
                bool = new Boolean(bool);
                bool.ogg = elem.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, '');
                // Without QuickTime, this value will be `undefined`. github.com/Modernizr/Modernizr/issues/546
                bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, '');
                bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, '');
                bool.vp9 = elem.canPlayType('video/webm; codecs="vp9"').replace(/^no$/, '');
                bool.hls = elem.canPlayType('application/x-mpegURL; codecs="avc1.42E01E"').replace(/^no$/, '');
            }
        } catch (e) {
            console.log(e);
        }
        return bool;
    };
    // Window Resize Callback with timer to avoid overload
    videoBackground.prototype.onWindowResize = function() {
        var self = this;
        if (self.resizeTimer !== null) {
            clearTimeout(self.resizeTimer);
        }
        self.resizeTimer = setTimeout(function() {
            self.setVideoDimensions();
        }, 100);
    };

    videoBackground.prototype.isIE = function() {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
    };

    /* Note that old versions of IE don't create a proper image 
     * with document.createElement(), and old versions of KHTML
     * don't create a proper DOM Node with new Image()
     */
    videoBackground.prototype.createImg = function(src, alt, title) {
        var img = this.isIE() ? new Image() : document.createElement('img');
        img.src = src;
        if (alt != null) img.alt = alt;
        if (title != null) img.title = title;
        return img;
    };

    // Detects if client is mobile phone
    // If it is we need to call video.play() manually and type
    // attribute must be specified
    videoBackground.prototype.isMobile = {
        Android: function() {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function() {
            return (this.isMobile.Android() || this.isMobile.BlackBerry() || this.isMobile.iOS() || this.isMobile.Opera() || this.isMobile.Windows());
        }

    };

    // Sets up all needed event listeners
    /* Events are added via self.addEvent for browser
     * compatibility
     */ 
    videoBackground.prototype.setupEventListeners = function() {
        var self = this;

        // listen to window resize and calculate new resize size (scale) for videos
        self.addEvent(window, 'resize', function() {
            self.onWindowResize();
        });
        // If original video dimensions aren't given try to calculate original ones
        if (self.options.width == null || self.options.height == null) {
            self.addEvent(window, 'loadedmetadata', function() {
                    self.options.width = this.videoWidth || 0;
                    self.options.height = this.videoHeight || 0;
            });
        }
        // CALLBACK - for video ended function
        if (self.options.ended && typeof(self.options.ended) === "function") {
            // console.log("Setting ended callback!");
            self.addEvent(self.videoElement, 'ended', function() {
                self.options.ended();
            });
        }
        // CALLBACK - for video click event
        if (self.options.onclick && typeof(self.options.onclick) === "function") {         
            self.addEvent(self.videoElement, 'click', function() {
                self.options.onclick.call(self);
            });
        }

    };
    // Error handler
    videoBackground.prototype.error = function(code) {
        // CALLBACK
        if (self.options.onError && typeof(self.options.onError) === "function") {
            self.options.onError(code);
        }
    };
    // Internal debug handler
    videoBackground.prototype.debug = function(data, action) {
        var debugNode;
        if (typeof data === 'object') {
            data = JSON.stringify(data);
        }
        if (action === 'append') {
            debugNode = document.createElement('div');
            debugNode.setAttribute('class', 'video-info');
            debugNode.innerHTML = data;
            // Append div to Element
            this.parentElement.appendChild(debugNode)
        } else {
            debugNode = this.parentElement.getElementsByClassName("video-info")[0];
            if (debugNode) {
                debugNode.innerHTML = debugNode.innerHTML + data;
            } else {
                this.debug(data, 'append');
                console.log("Debug node not found");
            }
        }

    };
    /**
     * Cross-browser function to add an event listener.
     * @param {!HTMLElement} elem  The DOM element to attach event to.
     * @param {string} eventName  The name of the event.
     * @param {!Function} fnHandler  The function to server as one of the specified
     *     event handlers.
     * @return {Function}  Returns the function that was added as an event handler.
     */
    videoBackground.prototype.addEvent = function(elem, eventName, fnHandler) {
        var fnToBind = function(e) {
            return fnHandler.call(elem, e || window.event);
        };

        // Add the event the W3C way.
        if (elem.addEventListener) {
            elem.addEventListener(eventName, fnToBind, false);
            return fnToBind;
        }

        eventName = 'on' + eventName;

        // Add the event the Microsoft way.
        if (elem.attachEvent) {
            return elem.attachEvent(eventName, fnToBind) ? fnToBind : null;
        }

        // Assign the handler directly to the object's event handler property.
        if (typeof elem[eventName] == 'function') {
            // Add the event by creating a function which will run both the current
            // handler and this new one.
            var f1 = elem[eventName],
                f2 = fnToBind;
            fnToBind = function() {
                var ret1, ret2;

                try {
                    ret1 = f1.apply(this, arguments);
                } catch (e1) {
                    setTimeout(function() {
                        throw e1;
                    }, 0);
                }

                try {
                    ret2 = f2.apply(this, arguments);
                } catch (e2) {
                    setTimeout(function() {
                        throw e2;
                    }, 0);
                }

                // If the previous handler returned a non-undefined value, return it,
                // otherwise return the value returned from the new handler.
                return ret1 === undefined ? ret2 : ret1;
            };
        }
        elem[eventName] = fnToBind;
        return fnToBind;
    };
    // AMD registration happens at the end for compatibility with AMD loaders
    // that may not enforce next-turn semantics on modules. Even though general
    // practice for AMD registration is to be anonymous, underscore registers
    // as a named module because, like jQuery, it is a base library that is
    // popular enough to be bundled in a third party lib, but not be part of
    // an AMD load request. Those cases could generate an error when an
    // anonymous define() is called outside of a loader request.
    if (typeof define === 'function' && define.amd) {
        define('videoBackground', [], function() {
            return videoBackground;
        });
    }
}.call(this));
