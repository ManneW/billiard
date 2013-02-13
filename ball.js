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

/**
 * Check if this ball is colliding with otherBall.
 *
 * @param otherBall The other ball
 * @return {Boolean} Returns true if they collide, false otherwise.
 */
Ball.prototype.isBallColliding = function(otherBall){
	var dist = (otherBall.position().sub(this.position())).norm();

    return (dist < 2*Constants.ballRadius);
};


/**
 * Change the position of this ball to match the moment of collision with otherBall.
 *
 * @param otherBall The other ball to collide with
 */
Ball.prototype.resolveBallImpactPosition = function(otherBall) {
    var dist = (otherBall.position().sub(this.position())).norm();

    this.position().$add((this.velocity.scale(1.0/this.velocity.norm())).scale(2*Constants.ballRadius - dist));
};


/**
 * Update velocities for collision with otherBall.
 *
 * @param otherBall The other ball to collide with.
 */
Ball.prototype.ballCollision = function(otherBall){

	//Normalen
	var n = this.position().add(otherBall.position().scale(-1));
	n = n.scale(1.0/n.norm());
	
	//normalkomponent
	var dotten1 = this.velocity.dot(n.scale(-1));
	var vn1 = n.scale(-1).scale(dotten1);
	
	var dotten2 = otherBall.velocity.dot(n);
	var vn2 = n.scale(dotten2);
	
	//tangentkomponent
	var vt1 = this.velocity.sub(vn1);
	var vt2 = otherBall.velocity.sub(vn2);
	
	//Nya hastigheter
	var v1ny = vt1.add(vn2);
	var v2ny = vt2.add(vn1);
	
	this.velocity = v1ny;
	otherBall.velocity = v2ny;
};

/**
 * Debug method to check whether the ball has left the table
 *
 * @return {Boolean} The ball has left the table
 */
Ball.prototype.offTable = function() {
    return ((this.position().x < -Constants.tableX / 2.0 || this.position().x > Constants.tableX / 2.0) ||
            (this.position().y < -Constants.tableY / 2.0 || this.position().y > Constants.tableY / 2.0));
};
