var canvas = document.getElementById('canvas1');
var ctx = canvas.getContext('2d');

ctx.fillStyle = 'lime';

var code = ["0", "0", "1", "0", "1", "1", "0", "0", "1", "1", "0", "0", "1", "1", "1", "0", "0", "1", "1", "1", "0", "1", "0", "0", "1"];

// make 90 things to fall with a random code element and random starting location
var things = [];
var THINGCOUNT = 90;
for (var i = 0; i < THINGCOUNT; i++) {
    var a = {};
    //randomly pick 0 or 1
    a.code = Math.floor((Math.random() * 2));
    a.x = Math.random()*500; //random X
    a.y = Math.random()*500 -500; // random Y that is above the screen
    a.speed = Math.random()*10;
    things.push(a);
}

setInterval(function() {
    ctx.clearRect(0,0,500,500);
    for (var i = 1; i < THINGCOUNT; i++) {
        var a = things[i];
        ctx.fillText(a.code, a.x, a.y);
        a.y += a.speed; // fall downwards by the speed amount
        if (a.y > 600) a.y = -50; // if off the screen at bottom put back to top
    }
}, 90);
