/**
 * A cushion on the billiard table.
 *
 * @param color
 * @param index
 * @constructor
 */
var Cushion = function(color, index) {

    // Cube representing the cushion (visual representation)
    this.cube = new PhiloGL.O3D.Cube({
        colors: color
    });

    // Get cushion attributes
    var cushionAttributes = createCushion(index);
    if (!cushionAttributes) {
        // Invalid range!
        console.log("Tried to create cushion with faulty index (" + index + ").");
    }

    this.cushionIndex = index;

    // Use the cushionAttributes to set position and scale
	this.cube.position = cushionAttributes.position;
    this.cube.scale = new PhiloGL.Vec3(
        cushionAttributes.scaleFactor.x,
        cushionAttributes.scaleFactor.y,
        cushionAttributes.scaleFactor.z
    );

    // Update the cube matrix to get WebGL working on the updated object
    this.cube.update();

    // Save the normal direction of this cushion
	this.normal = cushionAttributes.normal;
};

/**
 * Get the position of this cushion.
 * @return {Vec3}
 */
Cushion.prototype.getPosition = function () {
    return this.cube.position;
};

/**
 * Calculate and trigger the collision between a ball and this cushion.
 *
 * @param ball
 */
Cushion.prototype.resolveCollision = function(ball) {
    var cushionPosition = this.getPosition();
    cushionPosition = new PhiloGL.Vec3(cushionPosition.x, cushionPosition.y, cushionPosition.z);
    var ballPosition = ball.position();

    var collisionDetected = this.isBallColliding(ball);

    if (!collisionDetected) {
        return;
    }

    this.resolveBallImpactPosition(ball);
    ball.edgeCollision(this);

};

/**
 * Resolves the ball impact position by moving the ball.
 *
 * Moves the ball back and forth ten times to get an accurate position
 * of the impact.
 *
 * @param ball The ball that collides with this cushion.
 */
Cushion.prototype.resolveBallImpactPosition = function(ball) {
    var resolutionLimit = 10; //antal iterationer
    var isColliding = this.isBallColliding(ball);
    if (isColliding) {
        var k = ball.distanceVectorToMoveFromMillis(Globals.timeSinceLastLoop * 200).scale(100);
        for (var i = 0; i < resolutionLimit; i += 1) {
            if (isColliding) {
                ball.getPosition().$sub(k);
            } else {
                ball.getPosition().$add(k);
            }
            isColliding = this.isBallColliding(ball);
            k = k.scale(0.5);
        }
    }
};

Cushion.prototype.isBallColliding = function(ball) {
    // Get the position of the cushion
    var cushionPosition = this.getPosition();
    // Convert it to a Vec3 to make calculations easier
    cushionPosition = new PhiloGL.Vec3(cushionPosition.x, cushionPosition.y, cushionPosition.z);

    // Get the position of the ball
    var ballPosition = ball.position();

    // Flag to mark whether a collision has occurred
    var collisionDetected = false;
    var index = this.cushionIndex;
    switch (index) {
        case 0:
            collisionDetected = (ballPosition.x > cushionPosition.x - 3);
            break;
        case 1:
            collisionDetected = (ballPosition.y > cushionPosition.y - 3);
            break;
        case 2:
            collisionDetected = (ballPosition.x < cushionPosition.x + 3);
            break;
        case 3:
            collisionDetected = (ballPosition.y < cushionPosition.y + 3);
            break;
    }

    return collisionDetected;
};


/**
 * Create the cushion meta data according to this index.
 *
 * Calculate the cushion position and normal by using the index.
 *
 * @param index The index of the cushion (0-3)
 * @return {*}
 */
function createCushion(index) {
    // Set up the edge according to its index
    // 0 = left side, 1 = top, 2 = right, 3 = bottom
    var position;
    var scalefactor;
    var height = 5;
    var normal;
    switch(index) {
        case 0:
            position = {
                x: Constants.tableX/2 - 1,
                y: 0,
                z: -height
            };

            scalefactor = {
                x:1,
                y: Constants.tableY/2,
                z: height
            };

            normal = new PhiloGL.Vec3(-1,0,0);
            break;
        case 1:
            position = {
                x: 0,
                y: Constants.tableY/2 - 1,
                z: -height
            };

            scalefactor = {
                x: Constants.tableX/2,
                y: 1,
                z: height
            };

            normal = new PhiloGL.Vec3(0,-1,0);
            break;
        case 2:
            position = {
                x: - Constants.tableX/2 + 1,
                y: 0,
                z: -height
            };

            scalefactor = {
                x:1,
                y: Constants.tableY/2,
                z: height
            };

            normal = new PhiloGL.Vec3(1,0,0);
            break;
        case 3:
            position = {
                x: 0,
                y: - Constants.tableY/2 + 1,
                z: -height
            };

            scalefactor = {
                x: Constants.tableX/2,
                y: 1,
                z: height
            };

            normal = new PhiloGL.Vec3(0,1,0);
            break;
        default:
            return false;
        break;

    }

    return {
        position: position,
        scaleFactor: scalefactor,
        height: height,
        normal: normal
    };
}

//Cusion.prototype.collision = function(ball) {
//    if (ball.position())
//};
