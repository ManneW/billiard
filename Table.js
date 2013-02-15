/**
 * A table. Manages EVERYTHING (soon).
 *
 * @param color
 * @param index
 * @constructor
 */
 
var Table = function() {
	
	this.pocketedBallsCount = 0;
	
}

Table.prototype.pocketBall = function(ball){
	ball.inGame = false;
	ball.setVelocityXYZ(0,0,0);
	
	ball.setPositionXYZ(100 - 2.5*this.pocketedBallsCount*Constants.ballRadius, - Constants.tableY/2 - 20, 0);
	this.pocketedBallsCount += 1;	

}