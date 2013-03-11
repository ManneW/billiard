/**
 * Represents the whole table, including balls, cushions, pockets and the cue.
 *
 * Contains arrays for the above mentioned sub-objects and is also responsible for
 * collision detection between balls.
 *
 * @constructor
 */
var Table = function() {
	
	this.pocketedBallsCount = 0;
	
    // Create pool table including cushions and pockets
    this.plane = 0;
	this.cushions = [];
    this.pockets = [];
	this.constructTable();
	
	// Create balls
	this.balls = [];
	this.setupBalls();

	// Create cue
	this.cue = new Cue(this.balls[0].position());

    // Array that will hold the detected collisions
    this.collisions = [];
};

/**
 * Constructs the table.
 *
 * Includes construction of the table's graphical representation,
 * cushions and pockets (along with their graphical representations).
 */
Table.prototype.constructTable = function() {
	// Create the plane - the graphical representation of the table
	this.plane = new PhiloGL.O3D.Plane({
        type:'x,y',
        xlen:Constants.table.sizeX,
        ylen:Constants.table.sizeY,
        nx: 1,
        ny: 1,
        offset:0,
        colors:[1/255, 134/255, 77/255, 1]
    });
    this.plane.uniforms.shininess = 1;
	
    // Create cushions
    var cushion0 = new Cushion([1, 0, 0, 1], 0);
    var cushion1 = new Cushion([1, 0, 0, 1], 1);
    var cushion2 = new Cushion([1, 0, 0, 1], 2);
    var cushion3 = new Cushion([1, 0, 0, 1], 3);	
    this.cushions.push(cushion0, cushion1, cushion2, cushion3);

    // Create pockets
    this.pockets.push(new Pocket(0), new Pocket(1), new Pocket(2), new Pocket(3), new Pocket(4), new Pocket(5));
};

/**
 * Create and set up the balls for the initial strike.
 */
Table.prototype.setupBalls = function() {
    // Create the cue ball and place it at its starting position.
	var cueball = new Ball({x: Constants.table.sizeX/4, y: 0}, [1,1,1,1], 0);
	cueball.setColorRGBA(1,1,1,1);
	this.balls.push(cueball);

    // The position of the ball in the front of the triangle
	var startposition = [-40,1*0.5*Constants.ball.radius];
	var ballnr = 1;
	var color;

    // Iterate over each row of balls in the triangle
	for(var rowCount = 0 ; rowCount < 5; rowCount += 1){
		// Calculate the start position of that row
		var startpositionY = startposition[1] -(rowCount+1)*Constants.ball.radius + 0.5*Constants.ball.radius;

		// Create all the balls in that row
		for(var ballCount = 0; ballCount < rowCount + 1; ballCount += 1){
			if	(ballnr == 8){
				color = [0,0,0,1]
			}
			else if (ballnr%2 == 0){
				color = [1,0,0,1];
			}
			else{
				color = [0,0,1,1];
			}
			var ball = new Ball({
                    x: startposition[0] - rowCount*Math.sqrt(3.3)*Constants.ball.radius,
				    y: startpositionY + ballCount*2*Constants.ball.radius
                },
				color,
				ballnr
			);
			this.balls.push(ball);
			ballnr += 1;
		}
	}
};

/**
 * Handles a ball that has fallen into a pocket. Takes it out of game and
 * put it outside the table.
 *
 * @param ball which has been pocketed
 */
Table.prototype.pocketBall = function(ball){
    // Check if the ball is the cue ball or not
    if (ball.id != 0) {
        // Not the cue ball - pocket it
        ball.inGame = false;
        ball.setAngularVelocityXYZ(0,0,0);
        ball.setPositionXYZ(100 - 2.5*this.pocketedBallsCount*Constants.ball.radius, - Constants.table.sizeY/2 - 20, 0);
        this.pocketedBallsCount += 1;
    } else {
        // The cue ball - place it on the table again
        ball.setAngularVelocityXYZ(0,0,0);
        ball.setPositionXYZ(0,0, -Constants.ball.radius);
    }
};

/**
 * Checks if any balls are moving.
 *
 * @return {Boolean} Returns true if any ball is moving, false otherwise.
 */
Table.prototype.checkForMovingBalls = function() {
    // Iterate the balls and return true (breaks the loop) if a moving ball is found
	for (var i = 0; i < this.balls.length; i += 1){
			if(this.balls[i].velocity.norm() != 0){
				return true;
			}
	}
	return false;
};

/**
 * Detect and calculate collisions between balls.
 *
 * The collisions are saved into this.collisions.
 *
 * @return {Boolean} Returns true if any collision has been detected.
 */
Table.prototype.collideBalls = function () {
    // Empty previous collisions (should have been handled already)
    this.collisions = [];

    var balls = this.balls;
    var pockets = this.pockets;

    // Iterate all balls
    for (var ballI = 0; ballI < balls.length; ballI += 1) {
        // Skip the ball if it is pocketed
        if (!balls[ballI].inGame) {
            continue;
        }

        // Collision with pockets - pocket balls
        for (var pocketIndex = 0; pocketIndex < pockets.length; pocketIndex += 1) {
            if(pockets[pocketIndex].isBallInPocket(balls[ballI])){
                this.pocketBall(balls[ballI]);
            }
        }

        // Iterate the remaining balls
        for (var ballJ = ballI; ballJ < balls.length; ballJ += 1) {
            if (!balls[ballJ].inGame ) {
                continue;
            }

            if (ballI != ballJ) {
                // Check for collision with other ball
                if (balls[ballI].isBallColliding(balls[ballJ])) {
                    var collision = calculateTempVelocity(balls[ballI],balls[ballJ]);
                    this.collisions.push(collision);
                }
            }
        }
    }

    return (this.collisions.length != 0);
};

/**
 * Decrease the velocities of all ball based on the friction and inertia.
 */
Table.prototype.looseBallVelocities = function() {
    for (var ballI = 0; ballI < this.balls.length; ballI += 1) {
        this.balls[ballI].looseVelocity(Globals.timeSinceLastLoop/1000.0);
    }
};

/**
 * Step the whole simulation backwards or forward
 * @param timeStep
 */
Table.prototype.step = function(timeStep) {
    for (var ballI = 0; ballI < this.balls.length; ballI += 1) {
        this.balls[ballI].step(timeStep);
    }
};
