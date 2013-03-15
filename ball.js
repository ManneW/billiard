/**
 * Represents a billiard ball.
 *
 * @param startPosition
 * @param color
 * @param id
 * @constructor
 */
var Ball = function(startPosition, color, id) {
    this.id = id;

    this.velocity = new PhiloGL.Vec3(0, 0, 0);
    this.angularVelocity = new PhiloGL.Vec3(0, 0, 0);
    this.oldvelocity = new PhiloGL.Vec3(0, 0, 0);
    this.inGame = true;
    this.rotation = new PhiloGL.Vec3(0,0,0);
    this.totalRotation = new PhiloGL.Mat4();
    this.totalRotation.id();


    var texfile = "ball" + id + ".png";

    // Graphical representation of the billiard ball
    this.sphere = new PhiloGL.O3D.Sphere({
        nlat: 30,
        nlong: 30,
        radius: Constants.ball.radius,
        textures: texfile,
        colors: color

    });

    // Make the ball shiny
    this.sphere.uniforms.shininess = 20;

    // Shadow underneath the ball
    this.shadow = new PhiloGL.O3D.Cylinder({
        height: 0.1,
        radius: Constants.ball.radius*0.8,
        topCap: true,
        bottomCap: true,
        colors: [0, 0, 0, 1]
    });
    this.shadow.rotation.x = Math.PI/2;

    // Update positions of the ball
    this.prevPosition = new PhiloGL.Vec3(startPosition.x, startPosition.y, -3);
    this.sphere.position = new PhiloGL.Vec3(startPosition.x, startPosition.y, -3);

    // Update sphere matrix
    this.update();
};

/**
 * Simulate the ball being struck by a cue.
 *
 * @param factor
 * @param cue
 */
Ball.prototype.strikeBallWithCue = function(factor, cue) {
    if (!this.inGame) {
        return;
    }
	
	var alpha = cue.angle;
	var XdirPos = true;
	var YdirPos = true;
	
	if(alpha <= 0){
		alpha = 360 +  alpha;
	}
	
	if (alpha > 360){
		alpha = alpha % 360;
	}
	
	if (alpha % 90 == 0) {
		switch(alpha) {
			case 90: x = 0;
					y = Constants.cue.length/2;
					break;
			case 180: x = - Constants.cue.length/2;
					y = 0;
					break;
			case 270: x = 0;
					y = - Constants.cue.length/2;
					break;
			case 360: x = Constants.cue.length/2;
					y = 0;
					break;
		}	
	}
	else {
		if(alpha < 90){
			XdirPos = true;
			YdirPos = true;
		}
		else if (alpha < 180){
			alpha = 180 - alpha;
			XdirPos = false;
			YdirPos = true;
		}
		else if(alpha < 270){
			alpha = alpha - 180;	
			XdirPos = false;
			YdirPos = false;
		}
		else if(alpha < 360){
			alpha = 360 - alpha;
			XdirPos = true;
			YdirPos = false;
		}

        // Convert alpha to radians
		alpha = alpha * Math.PI / 180;

		var x = (Constants.cue.length/2) * Math.cos(alpha);
		var y = (Constants.cue.length/2) * Math.sin(alpha);
		
		if (!XdirPos){
			x = -x;
		}
		if (!YdirPos){
			y = - y;
		}	
	}

	var cuePosition = new PhiloGL.Vec3(this.position().x + x,this.position().y + y,this.position().z);

    var direction = this.position().sub(cuePosition);
    direction.$scale(1/direction.norm());
    var force = direction.scale(factor);

    var a = force.scale(1.0 / Constants.ball.mass);
    var v = a.scale(0.01);
    var w = Constants.ball.tableNormal.cross(v);
    w = w.scale(1.0 / Constants.ball.tableNormal.normSq());

    this.velocity = v;
    this.angularVelocity = w;
};

/**
 * Simulate the ball movement for one time step.
 */
Ball.prototype.step = function(timeStep) {
    // Check if we are moving forward or backwards in time
    var factor = 1;
    if (typeof timeStep != "undefined" && timeStep < 0) {
        factor = -1;
    }

    var elapsedTimeInSeconds = factor * Globals.timeSinceLastLoop / 1000.0;
    var elapsedTime = elapsedTimeInSeconds * 1000;

    // Resting ball condition - check if angular velocity is less than change due to friction
    if (this.angularVelocity.norm() < ((Constants.ball.rollingFrictionalForceMagnitude * elapsedTimeInSeconds)/Constants.ball.inertia)) {
        this.angularVelocity = new PhiloGL.Vec3(0,0,0);
        this.velocity = new PhiloGL.Vec3(0,0,0);
    } else {
        this.updateVelocityBasedOnAngularVelocity();

        var dist = this.velocity.scale(0.1 * elapsedTime);
        PhiloGL.Vec3.$add(this.sphere.position, dist);

        this.rotateW(this.angularVelocity, elapsedTimeInSeconds);
    }

    this.update();
};

/**
 * Decrease the ball velocity based on the frictional force and intertia.
 *
 * @param elapsedTimeInSeconds
 */
Ball.prototype.looseVelocity = function(elapsedTimeInSeconds) {
    var deltaW = this.angularVelocity.unit().scale(-1.0);
        deltaW = deltaW.scale((Constants.ball.rollingFrictionalForceMagnitude * elapsedTimeInSeconds)/Constants.ball.inertia);

    this.angularVelocity.$add(deltaW);
    this.updateVelocityBasedOnAngularVelocity();
};

/**
 * Recalculates and updates the velocity based on the angular velocity.
 *
 * Assumes that the ball is rolling perfectly.
 */
Ball.prototype.updateVelocityBasedOnAngularVelocity = function() {
    this.velocity = PhiloGL.Vec3.cross(this.angularVelocity, Constants.ball.tableNormal);
};

/**
 * Update the ball internal matrix representation.
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

    this.shadow.position = new PhiloGL.Vec3(this.sphere.position.x, this.sphere.position.y, 0);
    this.shadow.update();
};

/**
 * Recalculate the accumulated rotation by rotating using the angular velocity, w
 * @param w The angular velocity
 * @param dt
 */
Ball.prototype.rotateW = function(w, dt) {
    var rotation = new PhiloGL.Mat4();
    this.totalRotation = rotation.rotateAxis(dt*w.norm(), w.unit()).mulMat4(this.totalRotation);
};

/**
 * Set the color of the ball.
 *
 * @param r
 * @param g
 * @param b
 * @param a
 */
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

/**
 * Set the position by providing X, Y and Z coordinates.
 *
 * @param x
 * @param y
 * @param z
 */
Ball.prototype.setPositionXYZ = function(x,y,z) {
    this.sphere.position = new PhiloGL.Vec3(x,y,z);
};

/**
 * Set the angular velocity by providing the X, Y and Z
 * dimensions for the resulting vector.
 *
 * @param x
 * @param y
 * @param z
 */
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
	v2 = v2.scale(Constants.cushion.dampening);

    var w2 = Constants.ball.tableNormal.cross(v2);
    w2 = w2.scale(1.0 / Constants.ball.tableNormal.normSq());

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

    return (dist < 1.99*Constants.ball.radius);
};


/**
 * Change the position of this ball to match the moment of collision with otherBall.
 *
 * @param otherBall The other ball to collide with
 */
Ball.prototype.resolveBallImpactPosition = function(otherBall) {
    if (otherBall.velocity.normSq() > this.velocity.normSq()) {
		otherBall.resolveBallImpactPosition(this);
	} else {
        if (this.isBallColliding(otherBall)) {
			//Old normal
			var old = this.prevPosition.sub(otherBall.position());
			//Normalen
			var n = this.prevPosition.sub(this.position());

			//Checka f�r normalflips problem. Flytta olika antal avst�nd enligt gamla hastigheten beroende p� om this mittpunkt har hamnat f�rbi otherballs mittpunkt.
            var dist = null;
			if(n.norm() > old.norm()){
				dist = (otherBall.position().sub(this.position())).norm();
				this.position().$sub((this.oldvelocity.scale(1.0/this.oldvelocity.norm())).scale(4*Constants.ball.radius - dist));
			}
			else{
				dist = (otherBall.position().sub(this.position())).norm();
				this.position().$sub((this.oldvelocity.scale(1.0/this.oldvelocity.norm())).scale(2*Constants.ball.radius - dist));
			}
        } else {
            ////console.log("Not currently colliding");
            var dist_forward = (otherBall.position().sub(this.position())).norm() - 2*Constants.ball.radius;
            this.position().$add(((this.oldvelocity.scale(1.0/this.oldvelocity.norm())).scale(dist_forward)));
        }

	}
};

/**
 * Recalculate velocity changes caused by collision between currentBall and otherBall.
 *
 * @param currentBall
 * @param otherBall
 * @return {*}
 */
function calculateTempVelocity(currentBall,otherBall) {
    if (otherBall.velocity.normSq() > currentBall.velocity.normSq()) {
        // Always use the fastest moving ball as currentBall
        return calculateTempVelocity(otherBall, currentBall);
    } else {
        // Old normals, for position comparison
        var old_n1 = currentBall.prevPosition.sub(otherBall.position());
        var old_n2 = currentBall.prevPosition.sub(currentBall.position());

        // The normal vector between the balls
        var n = currentBall.position().sub(otherBall.position());

        // Detect if the balls have passed through each other.
        if(old_n2.norm() > old_n1.norm()) {
            // If so, flip the normal between them
            n.$scale(-1);
        }

        // Normalize the vector to be a unit vector
        n = n.unit();

        // Extract the normal components
        var dotprod1 = currentBall.velocity.dot(n.scale(-1));
        var vn1 = n.scale(-1).scale(dotprod1);

        var dotprod2 = otherBall.velocity.dot(n);
        var vn2 = n.scale(dotprod2);

        // Calculate the tangent components
        var vt1 = currentBall.velocity.sub(vn1);
        var vt2 = otherBall.velocity.sub(vn2);

        // Create new velocities
        var v1new = vt1.add(vn2);
        var v2new = vt2.add(vn1);

        currentBall.oldvelocity = new PhiloGL.Vec3(currentBall.velocity.x, currentBall.velocity.y, currentBall.velocity.z);
        otherBall.oldvelocity = new PhiloGL.Vec3(otherBall.velocity.x, otherBall.velocity.y, otherBall.velocity.z);

        // Calculate the new angular velocities, based on the new velocities
        var w1new = Constants.ball.tableNormal.cross(v1new);
        w1new = w1new.scale(1.0 / (Constants.ball.tableNormal.normSq()));
        var w2new = Constants.ball.tableNormal.cross(v2new);
        w2new = w2new.scale(1.0 / (Constants.ball.tableNormal.normSq()));

        // Calculate the change in angular velocity
        var delta_w_A = currentBall.angularVelocity.sub(w1new);
        var delta_w_B = otherBall.angularVelocity.sub(w2new);


        return {
            ballA: currentBall,
            ballB: otherBall,
            delta_wA: delta_w_A,
            delta_wB: delta_w_B
        };
    }
}
