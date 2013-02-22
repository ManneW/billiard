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
	this.sphere.update();
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


        //this.rotateUsingAngularVelocity(this.angularVelocity, elapsedTimeInSeconds);
        //var newAngle = this.eulerRotationalAngleFromAngularVelocity(this.angularVelocity, elapsedTimeInSeconds);
        //var originalAngle = this.angularVelocity.scale(elapsedTimeInSeconds);


        //var testQuat = quatFromAngularVelocity(new PhiloGL.Vec3(Math.PI/2, 0, 0), 1);

        //this.rotateUsingAngularVelocity(this.angularVelocity, elapsedTimeInSeconds);

        var dist = this.velocity.scale(0.1 * elapsedTime);
        //this.move(dist);

        var matrix = this.sphere.matrix,
            pos = this.sphere.position,
            rot = this.sphere.rotation,
            scale = this.sphere.scale;

        matrix.id();
        //matrix.id();
        PhiloGL.Vec3.$add(this.sphere.position, dist);
        matrix.$translate(pos.x, pos.y, pos.z);

        this.rotateW(this.angularVelocity, elapsedTimeInSeconds);
        //matrix.$rotateXYZ(rot.x, rot.y, rot.z);
        matrix.$scale(scale.x, scale.y, scale.z);
        //this.sphere.update();

    }

    this.updateTime = PhiloGL.Fx.animationTime();
};


Ball.prototype.rotateW = function(w, dt) {
//    var quat = quatFromAngularVelocity(w, dt);
//
//    var qw = quat[3], qx = quat[0], qy = quat[1], qz = quat[2];
//    var n = 1.0/Math.sqrt(qx*qx+qy*qy+qz*qz+qw*qw);
//    qx *= n;
//    qy *= n;
//    qz *= n;
//    qw *= n;
//
//    var w2 = w.scale(dt);
//    var rotation = new PhiloGL.Mat4(
//        1.0 - 2.0*qy*qy - 2.0*qz*qz, 2.0*qx*qy - 2.0*qz*qw, 2.0*qx*qz + 2.0*qy*qw, 0.0,
//        2.0*qx*qy + 2.0*qz*qw, 1.0 - 2.0*qx*qx - 2.0*qz*qz, 2.0*qy*qz - 2.0*qx*qw, 0.0,
//        2.0*qx*qz - 2.0*qy*qw, 2.0*qy*qz + 2.0*qx*qw, 1.0 - 2.0*qx*qx - 2.0*qy*qy, 0.0,
//        0.0, 0.0, 0.0, 1.0
//    );

    var rotation = new PhiloGL.Mat4();

    rotation.id();
    this.totalRotation.$mulMat4(rotation.rotateAxis(dt*w.norm()*(180/Math.PI), w.unit()));
    //this.totalRotation.$mulMat4(rotation);
    this.sphere.matrix.$mulMat4(this.totalRotation);
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

Ball.prototype.rotateUsingAngularVelocity = function(angularVelocity, elapsedTimeInSeconds) {
    var eulerAngle = this.eulerRotationalAngleFromAngularVelocity(angularVelocity, elapsedTimeInSeconds);
    this.rotate(eulerAngle);
};

Ball.prototype.eulerRotationalAngleFromAngularVelocity = function(angularVelocity, elapsedTimeInSeconds) {
    var quat = quatFromAngularVelocity(angularVelocity, elapsedTimeInSeconds);

    var quatNorm = quat[0]^2 + quat[1]^2 + quat[2]^2 + quat[3]^2;
    var s = 1;
    if (quatNorm > 0.0) {
        s = 2/quatNorm;
    } else {
        s = 0.0;
    }

//    quat[0] = quat[0]*s;
//    quat[1] = quat[1]*s;
//    quat[2] = quat[2]*s;
//    quat[3] = quat[3]*s;

//    var angle_x = Math.atan2((quat[0] * quat[2]  + quat[1] * quat[3]), -(quat[1] * quat[2] - quat[0] * quat[3]));
//    var angle_y = Math.acos(-(quat[0] * quat[0]) - (quat[1] * quat[1]) + (quat[2] * quat[2]) + (quat[3] * quat[3]));
//    var angle_z = Math.atan2((quat[0] * quat[2]  - quat[1] * quat[3]), (quat[1] * quat[2] + quat[0] * quat[3]));

    var q0 = quat[0], q1 = quat[1], q2 = quat[2], q3 = quat[3];

    var angle_x = Math.atan2( 2*(q0*q1 + q2*q3), 1-2*(q1*q1+q2*q2));
    var angle_y = Math.asin(2*(q0*q2 - q3*q1));
    var angle_z = Math.atan2( 2*(q0*q3 + q1*q2), 1-2*(q2*q2+q3*q3));


    var angle = new PhiloGL.Vec3(
        angle_x,
        angle_y,
        angle_z
    );

    return angle;
};

Ball.prototype.rotate = function(angle) {
    this.rotation.$add(angle);
    //this.sphere.rotation.set(Math.PI/2, 0, 0);
    this.sphere.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
    this.sphere.update();
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

    this.totalRotation.id();

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

    this.totalRotation.id();
    otherBall.totalRotation.id();

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
