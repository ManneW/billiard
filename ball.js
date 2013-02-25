/**
 * A billiard ball
 *
 * @param startPosition
 * @constructor
 */
var Ball = function(startPosition) {
	//updatetime = the last instant where the ball was updated
    this.updateTime = PhiloGL.Fx.animationTime();
	
    this.velocity = new PhiloGL.Vec3(0, 0, 0);
    this.angularVelocity = new PhiloGL.Vec3(0, 0, 0);
    this.oldvelocity = new PhiloGL.Vec3(0, 0, 0);
	this.inGame = true;
    this.rotation = new PhiloGL.Vec3(0,0,0);
    this.totalRotation = new PhiloGL.Mat4();
    this.totalRotation.id();
	
	//Mesh for our billiardball
	this.sphere = new PhiloGL.O3D.Sphere({
		nlat: 30,
		nlong: 30,
		radius: Constants.ballRadius,
        textures: "ball.jpg",
		colors: [Math.random(), Math.random(), Math.random(), 1]
       
	});
	
	//position of 
	this.prevPosition =   new PhiloGL.Vec3(startPosition.x, startPosition.y, -3);
	this.sphere.position =   new PhiloGL.Vec3(startPosition.x, startPosition.y, -3);
	
	//update sphere matrix - otherwise it won't move:( 
	this.update();
};

Ball.prototype.strikeBall = function(force, hitpoint) {
    if (!this.inGame) {
        return;
    }

    var a = force.scale(1.0 / Constants.ball.mass);
    var v = a.scale(0.01);
    var w = Constants.ball.tableNormal.cross(v);
    w = w.scale(1.0 / Constants.ball.tableNormal.norm());

    this.velocity = v;
    this.angularVelocity = w;
};

/**
 * Calculate distance and move the ball.
 */
Ball.prototype.step = function() {

    // Resting ball condition
    // TODO: Check if tweak is possible?
    if (this.angularVelocity.norm() < 0.01) {
        this.angularVelocity = new PhiloGL.Vec3(0,0,0);
        this.velocity = new PhiloGL.Vec3(0,0,0);
    } else {
        var elapsedTime = PhiloGL.Fx.animationTime()-this.updateTime;
        var elapsedTimeInSeconds = elapsedTime / 1000.0;

        var rollingFrictionalForce = this.velocity.scale(-1.0 * Constants.ball.rollingFrictionalForceMagnitude / this.velocity.norm());

        var deltaW = PhiloGL.Vec3.cross(Constants.ball.tableNormal, rollingFrictionalForce).scale(elapsedTimeInSeconds/Constants.ball.inertia);
        this.angularVelocity.$add(deltaW);
        this.velocity = PhiloGL.Vec3.cross(this.angularVelocity, Constants.ball.tableNormal).scale(1.0/Constants.ball.tableNormal.norm());

        var dist = this.velocity.scale(0.1 * elapsedTime);
        PhiloGL.Vec3.$add(this.sphere.position, dist);

        this.rotateW(this.angularVelocity, elapsedTimeInSeconds);
    }

    this.update();
    this.updateTime = PhiloGL.Fx.animationTime();
};

/**
 * Our own update
 */
Ball.prototype.update = function () {
    var matrix = this.sphere.matrix,
        pos = this.sphere.position,
        rot = this.sphere.rotation,
        scale = this.sphere.scale;

    matrix.id();
    matrix.$translate(pos.x, pos.y, pos.z);
    matrix.$mulMat4(this.totalRotation);
    matrix.$scale(scale.x, scale.y, scale.z);
};


Ball.prototype.rotateW = function(w, dt) {
    var rotation = new PhiloGL.Mat4();
    rotation.id();
    this.totalRotation = rotation.rotateAxis(dt*w.norm()*(180/Math.PI), w.unit()).mulMat4(this.totalRotation);
};

/**
 * Move the ball a given distance
 *
 * @param distance A vector representing the distance
 */
Ball.prototype.move = function(distance) {
	this.prevPosition = new PhiloGL.Vec3(this.sphere.position.x, this.sphere.position.y, this.sphere.position.z);
	PhiloGL.Vec3.$add(this.sphere.position, distance);
};

Ball.prototype.setColorRGBA = function(r,g,b,a){
	this.sphere.colors = [r,g,b,a];
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

Ball.prototype.setPositionXYZ = function(x,y,z) {
    this.sphere.position = new PhiloGL.Vec3(x,y,z);
};

Ball.prototype.setVelocityXYZ = function(x,y,z) {
    this.velocity = new PhiloGL.Vec3(x,y,z);
};

Ball.prototype.setAngularVelocityXYZ = function(x,y,z) {
    this.angularVelocity = new PhiloGL.Vec3(x,y,z);
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

    var w2 = Constants.ball.tableNormal.cross(v2);
    w2 = w2.scale(1.0 / Constants.ball.tableNormal.norm());

    //this.totalRotation.id();

    this.angularVelocity = w2;
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
 // */
Ball.prototype.resolveBallImpactPosition = function(otherBall) {
    if (otherBall.velocity.normSq() > this.velocity.normSq()) {
		otherBall.resolveBallImpactPosition(this);
	} else {	
			//Old normal
			var old = this.prevPosition.sub(otherBall.position());				
			//Normalen
			var n = this.prevPosition.sub(this.position());
			
			//Checka f�r normalflips problem. Flytta olika antal avst�nd enligt gamla hastigheten beroende p� om this mittpunkt har hamnat f�rbi otherballs mittpunkt.
			if(n.norm() > old.norm()){
				var dist = (otherBall.position().sub(this.position())).norm();	
				this.position().$sub((this.oldvelocity.scale(1.0/this.oldvelocity.norm())).scale(4*Constants.ballRadius - dist));
			}
			else{
				var dist = (otherBall.position().sub(this.position())).norm();
				this.position().$sub((this.oldvelocity.scale(1.0/this.oldvelocity.norm())).scale(2*Constants.ballRadius - dist));
			}
	}
};


/**
 * Resolve impact position for a ball that already has collided with a another ball and gotten new velocities etc.
 *
 * @param otherBall The other ball to collide with
 // */

//GAMLA VERSION (S�KERHETSKOPIA)
Ball.prototype.resolveBallImpactPositionAlt = function(otherBall) {
	if (otherBall.velocity.normSq() > this.velocity.normSq()) {
		otherBall.resolveBallImpactPositionAlt(this);
	} else {
		var dist = (otherBall.position().sub(this.position())).norm();
		
		this.position().$add((this.velocity.scale(1.0/this.velocity.norm())).scale(2*Constants.ballRadius - dist));
	}
};

/**
 * Update velocities for collision with otherBall.
 *
 * @param otherBall The other ball to collide with.
 */
Ball.prototype.ballCollision = function(otherBall){

if (otherBall.velocity.normSq() > this.velocity.normSq()) {
		otherBall.ballCollision(this);
	} else {
	//Old normal
	var old = this.prevPosition.sub(otherBall.position());
		
	//Normalen
	var n = this.position().sub(otherBall.position());
	
	//Checka f�r normalflips problem
	if(n.norm() > old.norm()){
		console.log("HANDE NAGOT SPECIELLT HAR? ");
		n.$scale(-1);
	}
	else{
		//console.log(n.norm() + " --- " + old.norm() );
	}
			
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
	
	//Spara gamla hastigheter	
	this.oldvelocity = new PhiloGL.Vec3(this.velocity.x, this.velocity.y, this.velocity.z);	
	otherBall.oldvelocity = new PhiloGL.Vec3(otherBall.velocity.x, otherBall.velocity.y, otherBall.velocity.z);
	
	//SPara nya hastigheter

    var w1ny = Constants.ball.tableNormal.cross(v1ny);
    w1ny = w1ny.scale(1.0 / Constants.ball.tableNormal.norm());

    var w2ny = Constants.ball.tableNormal.cross(v2ny);
    w2ny = w2ny.scale(1.0 / Constants.ball.tableNormal.norm());

    //this.totalRotation.id();
    //otherBall.totalRotation.id();

	this.velocity = v1ny;
    this.angularVelocity = w1ny;
	otherBall.velocity = v2ny;
    otherBall.angularVelocity = w2ny;
		
	}
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

/**
 * Recalculate velocity changes
 *
 * @param currentBall
 * @param otherBall
 * @return {*}
 */
function calculateTempVelocity(currentBall,otherBall) {
    if (otherBall.velocity.normSq() > currentBall.velocity.normSq()) {
        return calculateTempVelocity(otherBall,currentBall);
    } else {
        //Old normal
        var old = currentBall.prevPosition.sub(otherBall.position());

        //New
        var new_n = currentBall.prevPosition.sub(currentBall.position());

        //Normalen
        var n = currentBall.position().sub(otherBall.position());

        //Checka för normalflips problem
        if(new_n.norm() > old.norm()){
            console.log("HÄNDE NÅGOT SPECIELLT HÄR? ");
            n.$scale(-1);
        }
        else{
            //console.log(n.norm() + " --- " + old.norm() );
        }

        //normaliserar
        n = n.scale(1.0/n.norm());

        //normalkomponent
        var dotten1 = currentBall.velocity.dot(n.scale(-1));
        var vn1 = n.scale(-1).scale(dotten1);

        var dotten2 = otherBall.velocity.dot(n);
        var vn2 = n.scale(dotten2);

        //tangentkomponent
        var vt1 = currentBall.velocity.sub(vn1);
        var vt2 = otherBall.velocity.sub(vn2);

        //Nya hastigheter
        var v1ny = vt1.add(vn2);
        var v2ny = vt2.add(vn1);

        //Nya hastigheter
        var delta_velocity_A = currentBall.velocity.sub(v1ny);
        var delta_velocity_B = otherBall.velocity.sub(v2ny);

        // Nya vinkelhastigheter
        var w1ny = Constants.ball.tableNormal.cross(v1ny);
        w1ny = w1ny.scale(1.0 / Constants.ball.tableNormal.norm());

        var w2ny = Constants.ball.tableNormal.cross(v2ny);
        w2ny = w2ny.scale(1.0 / Constants.ball.tableNormal.norm());

        var delta_w_A = currentBall.angularVelocity.sub(w1ny);
        var delta_w_B = otherBall.angularVelocity.sub(w2ny);


        return {
            ballA: currentBall,
            ballB: otherBall,
            delta_vA: delta_velocity_A,
            delta_vB: delta_velocity_B,
            delta_wA: delta_w_A,
            delta_wB: delta_w_B
        };
    }
}
