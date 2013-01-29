/**
 * Created with JetBrains PhpStorm.
 * User: emanuel
 * Date: 2013-01-28
 * Time: 21:14
 * To change this template use File | Settings | File Templates.
 */
var Cushion = function(color, index) {

    // Cube representing the cushion (visual representation)
    this.cube = new PhiloGL.O3D.Cube({
        colors: color
    });

    // Get cushion attributes
    var cushionAttributes = CreateCushion(index);

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


function CreateCushion(index) {
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
