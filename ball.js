//BILLIARD BALL CLASS

var Ball = function(startPosition) {
	//updatetime = the last instant where the ball was updated
    this.updateTime = PhiloGL.Fx.animationTime();
	
    this.velocity = new PhiloGL.Vec3(1, 0.5, 0);
	
	//Mesh for our billiardball
	this.sphere = new PhiloGL.O3D.Sphere({
		nlat: 30,
		nlong: 30,
		radius: Constants.ballRadius,
		colors: [1, 1, 1, 1]
       
	});
	
	//position of billiardball
	this.sphere.position =   new PhiloGL.Vec3(startPosition.x, startPosition.y, -3);
	
	//update sphere matrix - otherwise it won't move:( 
	this.sphere.update();
};

//Calculate distance and move the ball
Ball.prototype.step = function() {
    var elapsedTime = PhiloGL.Fx.animationTime()-this.updateTime;
    //console.log('Elapsed: ' + elapsedTime);
    var dist = this.velocity.scale(0.1 * elapsedTime);
    //console.log('Dist: ' + dist);
	
    this.move(dist);
    this.updateTime = PhiloGL.Fx.animationTime();
	this.sphere.update();
};

//Move the ball
Ball.prototype.move = function(distance) {
	PhiloGL.Vec3.$add(this.sphere.position, distance);
	//this.sphere.position.x += distance.x;
};

//return the position of ball
Ball.prototype.position = function() {
    return this.sphere.position;
};

//Change the velocity if the ball has collided with a edge.
Ball.prototype.edgeCollision = function(cushion){
	var dotten = this.velocity.dot(cushion.normal);
	var v2 = cushion.normal.scale(-2*dotten).add(this.velocity);
	v2 = v2.scale(0.8);
	this.velocity = v2;
};
