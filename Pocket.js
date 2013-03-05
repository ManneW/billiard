/**
 * Represents a pocket on the table.
 *
 * @param pocketIndex
 * @constructor
 */
var Pocket = function (pocketIndex) {
    this.cylinder = new PhiloGL.O3D.Cylinder({
        radius: 4,
        height: 1,
        colors: [0,0,0,1],
        topCap: true
    });

    var pocketAttributes = createPocket(pocketIndex);

    this.cylinder.radius = pocketAttributes.radius;
    this.cylinder.position = new PhiloGL.Vec3(pocketAttributes.position.x, pocketAttributes.position.y, pocketAttributes.position.z);

    this.cylinder.rotation = new PhiloGL.Vec3(Math.PI/2, 0, 0);

    this.cylinder.update();
};



function createPocket(pocketIndex) {
    // Set up the pocket according to its index
    // (clockwise)
    // 0 = upper left, 1 = upper middle, 2 = upper right
    // 3 = lower right, 4 = lower middle, 5 = lower left
    var position;
    var height = 1;
    var radius = Constants.pocketRadius;

    switch(pocketIndex) {
        case 0:
            position = {
                x: Constants.tableX/2 - radius/2.0,
                y: Constants.tableY/2 - radius/2.0,
                z: 0
            };
            break;
        case 1:
            position = {
                x: 0,
                y: Constants.tableY/2 - radius/2.0,
                z: 0
            };
            break;
        case 2:
            position = {
                x: -Constants.tableX/2 + radius/2.0,
                y: Constants.tableY/2 - radius/2.0,
                z: 0
            };
            break;
        case 3:
            position = {
                x: -Constants.tableX/2 + radius/2.0,
                y: -Constants.tableY/2 + radius/2.0,
                z: 0
            };
            break;
        case 4:
            position = {
                x: 0,
                y: -Constants.tableY/2 + radius/2.0,
                z: 0
            };
            break;
        case 5:
            position = {
                x: Constants.tableX/2 - radius/2.0,
                y: -Constants.tableY/2 + radius/2.0,
                z: 0
            };
            break;
        default:
            return false;
            break;

    }

    return {
        position: position,
        height: height,
        radius: radius
    };
}

Pocket.prototype.position = function() {
    return this.cylinder.position;
};

/**
 * Checks wether a ball is in the pocket
 *
 * @param ball
 */
Pocket.prototype.isBallInPocket = function (ball){
	
	var dist = (ball.position().sub(this.position())).norm();
    return (dist < Constants.pocketRadius)
}
