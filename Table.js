/**
 * A table. Manages EVERYTHING (soon).
 *
 * @param color
 * @param index
 * @constructor
 */
 
var Table = function() {
	
	this.pocketedBallsCount = 0;
	
    //Create pooltable
    this.plane = 0;
	this.cushions = [];
	this.constructTable();
	
	//Create balls
	this.balls = [];
	this.setupBalls();
	
	//Create pockets
    this.pockets = [];
    this.pockets.push(new Pocket(0), new Pocket(1), new Pocket(2), new Pocket(3), new Pocket(4), new Pocket(5));
	
	//Create Cue
	this.cue = new Cue(this.balls[0].position());
	
    this.collisions = [];
    this.insides = [];
	
	//Create players
	player1 = new Player(1);
	player2 = new Player(2);
};

Table.prototype.constructTable = function(){
	// Create the plane - the graphical representation of the table
	this.plane = new PhiloGL.O3D.Plane({
        type:'x,y',
        xlen:Constants.tableX,
        ylen:Constants.tableY,
        nx: 1,
        ny: 1,
        offset:0,
        colors:[1/255, 134/255, 77/255, 1]
    });
    this.plane.uniforms.shininess = 1;
	
    //Create edges
    var cushion0 = new Cushion([1, 0, 0, 1], 0);
    var cushion1 = new Cushion([1, 0, 0, 1], 1);
    var cushion2 = new Cushion([1, 0, 0, 1], 2);
    var cushion3 = new Cushion([1, 0, 0, 1], 3);	
    this.cushions.push(cushion0, cushion1, cushion2, cushion3);

};

Table.prototype.setupBalls = function(){	
	var cueball = new Ball({x: Constants.tableX/4, y: 10}, [1,1,1,1], 0 );
	cueball.setColorRGBA(1,1,1,1);
	//cueball.setVelocityXYZ(-2,0,0);
    //cueball.strikeBall(new PhiloGL.Vec3(-50, 0, 0), null);

	this.balls.push(cueball);
	var startposition = [-40,6*0.5*Constants.ballRadius];
	var ballnr = 1;
	var color;
	
	for(var rowCount = 0 ; rowCount < 5; rowCount += 1){
		
		var startpositionY = startposition[1] -(rowCount+1)*Constants.ballRadius + 0.5*Constants.ballRadius;
		
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
				x: startposition[0] - rowCount*Math.sqrt(3.3)*Constants.ballRadius,
				y: startpositionY + ballCount*2*Constants.ballRadius
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
    if (ball.id != 0) {
        ball.inGame = false;
        ball.setAngularVelocityXYZ(0,0,0);

        ball.setPositionXYZ(100 - 2.5*this.pocketedBallsCount*Constants.ball.radius, - Constants.tableY/2 - 20, 0);
        this.pocketedBallsCount += 1;
    } else {
        ball.setAngularVelocityXYZ(0,0,0);

        // Place the ball on the table again
        ball.setPositionXYZ(0,0, -Constants.ball.radius);
    }

};

Table.prototype.checkForMovingBalls = function(){
	for (var i = 0; i < this.balls.length; i += 1){
			if(this.balls[i].velocity.norm() != 0){
				return true;
			}
	}
	return false;
};

Table.prototype.collideBalls = function () {




    this.collisions = [];

    this.insides = [];

    // Iterate all balls
    var balls = this.balls;
    var pockets = this.pockets;

    for (var i = 0; i < balls.length; i += 1) {
        if (!balls[i].inGame) {
            continue;
        }

        // Collision with pockets
        for (var pocketIndex = 0; pocketIndex < pockets.length; pocketIndex += 1) {
            if(pockets[pocketIndex].isBallInPocket(balls[i])){
                this.pocketBall(balls[i]);
            }
        }

        for (var j = i; j < balls.length; j += 1) {
            if (!balls[j].inGame ) {
                continue;
            }

            if (i != j) {
                //Collision with other balls
                if (balls[i].isBallColliding(balls[j])) {
                        var collision = calculateTempVelocity(balls[i],balls[j]);
                        this.collisions.push(collision);
                } else {

                }
            }
        }
    }

    return (this.collisions.length != 0);
};

Table.prototype.looseBallVelocities = function() {
    for (var i = 0; i < this.balls.length; i+=1) {
        this.balls[i].looseVelocity(Globals.timeSinceLastLoop/1000.0);
    }
};

Table.prototype.step = function(timeStep) {
    // Step the whole simulation backwards or forward
    for (var i = 0; i < this.balls.length; i+=1) {
        this.balls[i].step(timeStep);
    }
};
