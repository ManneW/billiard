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
	
	//create balls
	this.balls = [];
	this.setupBalls();
	
};

Table.prototype.constructTable = function(){
	//Create.plane	
	this.plane = new PhiloGL.O3D.Plane({
        type:'x,y',
        xlen:Constants.tableX,
        ylen:Constants.tableY,
        nx:1,
        ny:1,
        offset:0,
        colors:[0.5, 1, 0.7, 1]
    });
	
    //Create edges
    var cushion0 = new Cushion([1, 0, 0, 1], 0);
    var cushion1 = new Cushion([1, 0, 0, 1], 1);
    var cushion2 = new Cushion([1, 0, 0, 1], 2);
    var cushion3 = new Cushion([1, 0, 0, 1], 3);	
    this.cushions.push(cushion0, cushion1, cushion2, cushion3);

};

Table.prototype.setupBalls = function(){	
	var cueball = new Ball({x: Constants.tableX/4, y:0} );
	cueball.setColorRGBA(1,1,1,1);
	//cueball.setVelocityXYZ(-2,0,0);
    cueball.strikeBall(new PhiloGL.Vec3(-20, -30, 0), null);

	this.balls.push(cueball);
	var startposition = [-40,0];
	for(var rowCount = 0 ; rowCount < 5; rowCount += 1){
		
		var startpositionY = startposition[1] -(rowCount+1)*Constants.ballRadius + 0.5*Constants.ballRadius;
		
		for(var ballCount = 0; ballCount < rowCount + 1; ballCount += 1){
			var ball = new Ball({
				x: startposition[0] - rowCount*Math.sqrt(3.3)*Constants.ballRadius,
				y: startpositionY + ballCount*2*Constants.ballRadius
				}
			);
			//this.balls.push(ball);
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
	ball.inGame = false;
	ball.setVelocityXYZ(0,0,0);
	
	ball.setPositionXYZ(100 - 2.5*this.pocketedBallsCount*Constants.ballRadius, - Constants.tableY/2 - 20, 0);
	this.pocketedBallsCount += 1;	

};
