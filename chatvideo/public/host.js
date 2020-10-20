
(function (d, w, n, io){
    'use strict';


    var $usernameInput = $('.usernameInput');
    var isHost = true;
    

    var io = io(),
        startCamera = false,
        video = d.querySelector('#video'),
        canvas = d.querySelector('#canvas'),
        context = canvas.getContext('2d')

    n.streaming = (
        n.getUserMedia ||
        n.webkitGetUserMedia ||
        n.mozGetUserMedia ||
        n.msGetUserMedia
    );

    n.streaming({
        video : true,
        audio : false
    }, function (stream){
        startCamera = true;
        video.srcObject = stream;
          video.onloadedmetadata = function(e){
          video.play();};
    }, function (err){
        alert('error al acceder a la camara web: ' + err);
    })

    w.playVideo = (function (cb){
        return w.requestAnimationFrame ||
            w.webkitRequestAnimationFrame ||
            w.mozRequestAnimationFrame ||
            w.msRequestAnimationFrame ||
            function (cb) {
                w.setTimeout(cb, 1000/100);
            };
    })();

    function streamVideo(context, canvas, video)
    {
        var outputStream = canvas.toDataURL('image/jpeg', 0.4);
        context.drawImage(video, 0, 0);

        if(startCamera)
            io.emit('streaming', outputStream);

        playVideo(function (){
            streamVideo(context, canvas, video);
        })
    }

    w.addEventListener('load', function (){
        video.autoplay = true;
        video.style.display = 'none';
        streamVideo(context, canvas, video);
    })

})(document, window, navigator, io);