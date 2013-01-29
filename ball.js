var Ball = function(startPosition) {
	//updatetime = senast man räknade bollen
    this.updateTime = PhiloGL.Fx.animationTime();

    this.velocity = new PhiloGL.Vec3(1, 0.5, 0);
	
	this.sphere = new PhiloGL.O3D.Sphere({
		nlat: 30,
		nlong: 30,
		radius: Constants.ballRadius,
		colors: [1, 1, 1, 1]
       
	});
	
	this.sphere.position =   new PhiloGL.Vec3(startPosition.x, startPosition.y, -3);
	this.sphere.update();
};

Ball.prototype.step = function() {
    var elapsedTime = PhiloGL.Fx.animationTime()-this.updateTime;
    //console.log('Elapsed: ' + elapsedTime);
    var dist = this.velocity.scale(0.1 * elapsedTime);
    //console.log('Dist: ' + dist);

    this.move(dist);
    this.updateTime = PhiloGL.Fx.animationTime();
	this.sphere.update();
};

Ball.prototype.move = function(distance) {
	PhiloGL.Vec3.$add(this.sphere.position, distance);
	//this.sphere.position.x += distance.x;
};

Ball.prototype.position = function() {
    return this.sphere.position;
};

Ball.prototype.edgeCollision = function(cushion){
	var dotten = this.velocity.dot(cushion.normal);
	var v2 = cushion.normal.scale(-2*dotten).add(this.velocity);
	v2 = v2.scale(0.8);
	this.velocity = v2;
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
