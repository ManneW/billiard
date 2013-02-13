/**
 * A billiard ball
 *
 * @param startPosition
 * @constructor
 */
var Ball = function(startPosition) {
	//updatetime = the last instant where the ball was updated
    this.updateTime = PhiloGL.Fx.animationTime();
	
    this.velocity = new PhiloGL.Vec3(1, 0.5, 0);
	
	//Mesh for our billiardball
	this.sphere = new PhiloGL.O3D.Sphere({
		nlat: 30,
		nlong: 30,
		radius: Constants.ballRadius,
		colors: [Math.random(), Math.random(), Math.random(), 1]
       
	});
	
	//position of billiardball
	this.sphere.position =   new PhiloGL.Vec3(startPosition.x, startPosition.y, -3);
	
	//update sphere matrix - otherwise it won't move:( 
	this.sphere.update();
};

/**
 * Calculate distance and move the ball.
 */
Ball.prototype.step = function() {
    var elapsedTime = PhiloGL.Fx.animationTime()-this.updateTime;

    //console.log('Elapsed: ' + elapsedTime);
    var dist = this.velocity.scale(0.1 * elapsedTime);
    //console.log('Dist: ' + dist);
	
    this.move(dist);
    this.updateTime = PhiloGL.Fx.animationTime();
	this.sphere.update();
};

/**
 * Move the ball a given distance
 *
 * @param distance A vector representing the distance
 */
Ball.prototype.move = function(distance) {
	PhiloGL.Vec3.$add(this.sphere.position, distance);
};

/**
 * Return the position of the ball
 *
 * @return {}
 */
Ball.prototype.position = function() {
    return this.sphere.position;
};

/**
 * Return the position of the ball
 *
 * @return {}
 */
Ball.prototype.getPosition = function() {
    return this.sphere.position;
};

/**
 * Get a distance vector scaled by the elapsed time
 *
 * @param elapsedTime The elapsed time in milli seconds
 * @return {*}
 */
Ball.prototype.distanceVectorToMoveFromMillis = function(elapsedTime) {
    return this.velocity.scale(elapsedTime * 0.001);
};

/**
 * Change the velocity if the ball has collided with a edge.
 *
 * @param cushion The cushion to collide with.
 */
Ball.prototype.edgeCollision = function(cushion){
	var dotten = this.velocity.dot(cushion.normal);
	var v2 = cushion.normal.scale(-2*dotten).add(this.velocity);
	v2 = v2.scale(1);
	this.velocity = v2;
};

//KOLLAR OM BOLLEN KOLLIDERAR
Ball.prototype.isBallColliding = function(otherBall){
	//if (this === otherBall) { console.log("self"); return false; }
	//var dist = this.position.scale(-1);
	
	var dist = otherBall.position().scale(-1).add(this.position());	
	dist = dist.norm();
	
	if(dist <= 2*Constants.ballRadius){
	//	console.log(dist);
		return true;
	}
	else
		return false;	
};


//POSITION?
Ball.prototype.resolveBallImpactPosition = function(otherBall){
	var resolutionLimit = 10;
	//var vn = this.velocity.scale(1/this.velocity.norm());
	//var k = vn.scale(Constants.ballRadius);
	var k = this.distanceVectorToMoveFromMillis(Globals.timeSinceLastLoop * 200).scale(100);
	for (var i = 0; i < resolutionLimit; i+=1){
		if(this.isBallColliding(otherBall)){
				this.getPosition().$sub(k);
		}
		else{
			this.getPosition().$add(k);
		}
		k = k.scale(0.5);		
	}	
}



//NYA HASTIGHETER EFTER KROCK
Ball.prototype.ballCollision = function(otherBall){

	//Normalen
	var n = this.position().add(otherBall.position().scale(-1));
	n = n.scale(1/n.norm());
	
	//normalkomponent
	var dotten1 = this.velocity.dot(-n);
	var vn1 = n.scale(-1).scale(dotten1);
	
	var dotten2 = otherBall.velocity.dot(n);
	var vn2 = n.scale(dotten2);
	
	//tangentkomponent
	var vt1 = this.velocity.add(vn1.scale(-1));
	var vt2 = otherBall.velocity.add(vn2.scale(-1));
	
	//Nya hastigheter
	var v1ny = vt1.add(vn2);
	var v2ny = vt2.add(vn1);
	
	this.velocity = v1ny;
	otherBall.velocity = v2ny;
};