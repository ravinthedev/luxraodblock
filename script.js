

function touchHandler(event)
{
    var touches = event.changedTouches,
        first = touches[0],
        type = "";
    switch(event.type)
    {
        case "touchstart": type = "mousedown"; break;
        case "touchmove":  type = "mousemove"; break;        
        case "touchend":   type = "mouseup";   break;
        default:           return;
    }

    // initMouseEvent(type, canBubble, cancelable, view, clickCount, 
    //                screenX, screenY, clientX, clientY, ctrlKey, 
    //                altKey, shiftKey, metaKey, button, relatedTarget);

    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1, 
                                  first.screenX, first.screenY, 
                                  first.clientX, first.clientY, false, 
                                  false, false, false, 0/*left*/, null);

    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}

function init() 
{
    document.addEventListener("touchstart", touchHandler, true);
    document.addEventListener("touchmove", touchHandler, true);
    document.addEventListener("touchend", touchHandler, true);
    document.addEventListener("touchcancel", touchHandler, true);    
}


var MAX_PARTICLES = 500,
    MIN_ALPHA = 0.05,
    FPS = 20,
    
    canvas, context, stageWidth, stageHeight,
    
    mouseX = 0,
    mouseY = 0,
    lastX = 0,
    lastY = 0,
    active = false,
    particles = [];

$(document).ready(init);
init();
  
function init() {
  canvas = document.getElementById('canvas'),
  context = canvas.getContext('2d'),



  resize();
  
  mouseX = stageWidth * 0.95;
  mouseY = stageHeight * 0.85;
  idleBurst();

  $(window).resize(resize);
  $(window).mousemove(function(event) {
    if(!active) {
      $('.start').fadeOut(600);
    }
    active = true;
    lastX = mouseX;
    lastY = mouseY;
		mouseX = event.pageX;
		mouseY = event.pageY;
		if(particles.length < MAX_PARTICLES) createParticle();
	});
	$(window).mousedown(function(event) {
		createBurst();
	});
	
	setInterval(onEnterFrame, 1000 / FPS);
}

function idleBurst() {
	if(!active) {
		createBurst();
		setTimeout(idleBurst, 1200);
	}
}

function resize() {
	stageWidth = $(window).width();
	stageHeight = $(window).height();
	canvas.width = stageWidth;
	canvas.height = stageHeight;
}

function createParticle(burst) {
	var particle = {
		size: 0.01 + (Math.random() * 4),
		bounce: Math.random(),
		color: "#c64072",
		alpha: 1,
		fade: 0.93 + (Math.random() * 0.05),
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		rotate: Math.random() * 360,
		rotateDir: (Math.random > 0.5) ? 7 : -7
	};
	particle.x = mouseX;
	particle.y = mouseY;
	particle.vx = (burst) ? (0.5 - Math.random()) * 20 : lastX - mouseX;
	particle.vy = (burst) ? (0.5 - Math.random()) * 20 : lastY - mouseY;
	particles.push(particle);
}

function createBurst() {
	var i = 200;
	while(--i > -1 && particles.length < MAX_PARTICLES) {
		createParticle(true);
	}
}

function onEnterFrame() {
	context.clearRect(0, 0, stageWidth, stageHeight);
	/*context.fillStyle = '#000000';
	context.globalAlpha = 0.1;
	context.fillRect(0, 0, stageWidth, stageHeight);*/
	
	var points = 5;
	var step, halfStep, start, n, dx, dy, outerRadius, innerRadius, angle;
	var particle;
	var i = particles.length;
	while(--i > -1) {
		particle = particles[i];
		particle.x += particle.vx;
		particle.y += particle.vy;
		
		if(particle.x - particle.size < 0) {
			particle.x = particle.size;
			particle.vx = -particle.vx * particle.bounce;
		}
		else if(particle.x + particle.size > stageWidth) {
			particle.x = stageWidth - particle.size;
			particle.vx = -particle.vx * particle.bounce;
		}
		
		if(particle.y - particle.size < 0) {
			particle.y = particle.size;
			particle.vy = -particle.vy * particle.bounce;
		}
		else if(particle.y + particle.size > stageHeight) {
			particle.y = stageHeight - particle.size;
			particle.vy = -particle.vy * particle.bounce;
		}
		
		context.fillStyle = particle.color;
		context.globalAlpha = particle.alpha;
		context.beginPath();
		
		outerRadius = particle.size;
		innerRadius = particle.size * 1;
		step = (Math.PI * 2) / points;
		halfStep = step / 2;
		start = (particle.rotate / 180) * Math.PI;
		context.moveTo( particle.x + (Math.cos( start ) * outerRadius), 
						particle.y - (Math.sin( start ) * outerRadius) );
		
		for(n = 1; n <= points; ++n) {
			dx = particle.x + Math.cos(start + (step * n) - halfStep) * innerRadius;
			dy = particle.y - Math.sin(start + (step * n) - halfStep) * innerRadius;
			context.lineTo( dx, dy );
			dx = particle.x + Math.cos(start + (step * n)) * outerRadius;
			dy = particle.y - Math.sin(start + (step * n)) * outerRadius;
			context.lineTo(dx, dy);
		}
		context.closePath();
		context.fill();
		
		particle.alpha *= particle.fade;
		particle.rotate += particle.rotateDir;
		
		if(particle.alpha <= MIN_ALPHA) {
			particles = particles.slice(0,i).concat(particles.slice(i+1));
		}
	}
}


