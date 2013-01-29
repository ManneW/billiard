/**
 * Created with JetBrains PhpStorm.
 * User: emanuel
 * Date: 2013-01-28
 * Time: 21:14
 * To change this template use File | Settings | File Templates.
 */
var Cushion = function(color, index) {
    //this.cushion = PhiloGL.O3D.
    this.cube = new PhiloGL.O3D.Cube({
        colors: color
    });
	
	var position;
	var scalefactor;
	var height = 5;
	var normal;
	switch(index){
	
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
				
	
	}
	this.cube.position = position;
    this.cube.scale = new PhiloGL.Vec3(scalefactor.x, scalefactor.y, scalefactor.z);
    this.cube.update();
	this.normal = normal;
};

//Cusion.prototype.collision = function(ball) {
//    if (ball.position())
//};
