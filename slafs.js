  var Ball = function() {
	this.sphere = new PhiloGL.O3D.Sphere({
		nlat: 30,
		nlong: 30,
		radius: 3,
		colors: [1, 1, 1, 1],
        position: {
        x: 0, y: 0, z: -3
      }
	});
}

Ball.prototype.move = function(distance) {
	this.sphere.position.x += distance;
	
	return this.sphere.position;
}


//Define a Star Class
/*
var Star = function(startingDistance, rotationSpeed) {

PhiloGL.O3D.Model.call(this, {

vertices: [

-1.0, -1.0, 0.0,

1.0, -1.0, 0.0,

-1.0, 1.0, 0.0,

1.0, 1.0, 0.0

],

 

texCoords: [

0.0, 0.0,

1.0, 0.0,

0.0, 1.0,

1.0, 1.0

],

 

textures: 'star.gif',

 

indices: [0, 1, 3, 3, 2, 0],

 

onBeforeRender: function(program, camera) {

var min = Math.min,

isTwinkle = twinkle.checked,

r = isTwinkle? min(1, this.r + this.twinklerR) : this.r,

g = isTwinkle? min(1, this.g + this.twinklerG) : this.g,

b = isTwinkle? min(1, this.b + this.twinklerB) : this.b;

program.setUniform('uColor', [r, g, b]);

}

 

});

 

this.angle = 0;

this.dist = startingDistance;

this.rotationSpeed = rotationSpeed;

this.spin = 0;

 

this.randomiseColors();

};

 

Star.prototype = Object.create(PhiloGL.O3D.Model.prototype, {

randomiseColors: {

value: function() {

var rd = Math.random;

this.r = rd();

this.g = rd();

this.b = rd();

 

this.twinklerR = rd();

this.twinklerG = rd();

this.twinklerB = rd();

}

},

 

animate: {

value: function(elapsedTime, twinkle) {

this.angle += this.rotationSpeed / 10;

 

this.dist -= 0.001;

if (this.dist < 0) {

this.dist += 5;

this.randomiseColors();

}

//update position

this.position.set(Math.cos(this.angle) * this.dist, Math.sin(this.angle) * this.dist, 0);

this.rotation.set(0, 0, this.spin);

this.spin += 0.1;

this.update();

}

}

 

});*/