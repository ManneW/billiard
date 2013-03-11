/**
 * Represents a pocket on the table.
 *
 * @param pocketIndex
 * @constructor
 */
var Pocket = function (pocketIndex) {
    // Use the helper function to get the pocket attributes
    var pocketAttributes = createPocket(pocketIndex);

    // Create the graphical representation
    this.cylinder = new PhiloGL.O3D.Cylinder({
        radius: pocketAttributes.radius,
        height: 1,
        colors: [0,0,0,1],
        topCap: true
    });

    // Set up the graphical representation
    this.cylinder.position = new PhiloGL.Vec3(pocketAttributes.position.x, pocketAttributes.position.y, pocketAttributes.position.z);
    this.cylinder.rotation = new PhiloGL.Vec3(Math.PI/2, 0, 0);
    this.cylinder.update();
};

/**
 * Access method for the position of the graphical representation of the pocket.
 *
 * @return {PhiloGL.Vec3}
 */
Pocket.prototype.position = function() {
    return this.cylinder.position;
};

/**
 * Checks wether a ball is in the pocket.
 *
 * @param ball
 * @return {Boolean} Returns true if the ball is in the pocket, false otherwise.
 */
Pocket.prototype.isBallInPocket = function (ball) {
	var dist = (ball.position().sub(this.position())).norm();
    return (dist < Constants.pocket.radius)
};

/**
 * Helper method for creating the pocket based on its index.
 * Set up the pocket according to its index (clockwise)
 * 0 = upper left, 1 = upper middle, 2 = upper right
 * 3 = lower right, 4 = lower middle, 5 = lower left
 *
 * @param pocketIndex The pocket index (clockwise)
 * @return {*}
 */
function createPocket(pocketIndex) {

    var position;
    var height = 1;
    var radius = Constants.pocket.radius;

    switch(pocketIndex) {
        case 0:
            position = {
                x: Constants.table.sizeX/2 - radius/2.0,
                y: Constants.table.sizeY/2 - radius/2.0,
                z: 0
            };
            break;
        case 1:
            position = {
                x: 0,
                y: Constants.table.sizeY/2 - radius/2.0,
                z: 0
            };
            break;
        case 2:
            position = {
                x: -Constants.table.sizeX/2 + radius/2.0,
                y: Constants.table.sizeY/2 - radius/2.0,
                z: 0
            };
            break;
        case 3:
            position = {
                x: -Constants.table.sizeX/2 + radius/2.0,
                y: -Constants.table.sizeY/2 + radius/2.0,
                z: 0
            };
            break;
        case 4:
            position = {
                x: 0,
                y: -Constants.table.sizeY/2 + radius/2.0,
                z: 0
            };
            break;
        case 5:
            position = {
                x: Constants.table.sizeX/2 - radius/2.0,
                y: -Constants.table.sizeY/2 + radius/2.0,
                z: 0
            };
            break;
        default:
            return false;
    }

    return {
        position: position,
        height: height,
        radius: radius
    };
}
