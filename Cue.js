/**
 * Represents the cue.
 *
 * @param cueballPosition
 * @constructor
 */
var Cue = function(cueballPosition){
	this.cylinder = new PhiloGL.O3D.Cylinder({
		radius : 0.8,
		height : Constants.cue.length,
		colors : [0.8, 0.5, 0, 1],
		topCap: true,
		bottomCap : true	
	});

    this.rotation = new PhiloGL.Mat4();
    this.angle = 0;
	this.cylinder.position = new PhiloGL.Vec3(2*cueballPosition.x, cueballPosition.y, -10);
    this.cylinder.rotation = new PhiloGL.Vec3(Math.PI/30, 0, Math.PI/2);
	this.ballPosition = cueballPosition;
    this.update();
 };

/**
 * Update the graphical representation.
 */
Cue.prototype.update = function() {
    var matrix = this.cylinder.matrix,
        pivot = this.ballPosition,
        scale = this.cylinder.scale;

    // Creates a matrix that describes the translation to the pivot point
    var T = new PhiloGL.Mat4();
    T.$translate(pivot.x, pivot.y, pivot.z);

    // Rotate around the pivot point
    var all = new PhiloGL.Mat4();
    all = all.mulMat4(T);
    all = all.mulMat4(this.rotation);
    all = all.translate((Constants.cue.length/2 + Constants.ball.radius*0.8), 0, 0);
    all = all.rotateAxis(Math.PI/2, new PhiloGL.Vec3(0,0,1));
    all = all.translate(0,0,-((5/7*3)));

    // Reset the internal matrix before multiplying with the newly created
    matrix.id();
    matrix.$mulMat4(all);
    matrix.$scale(scale.x, scale.y, scale.z);
};

/**
 * Handle cue interaction.
 *
 * @param cueball
 * @param e
 */
Cue.prototype.handleCue = function(cueball, e) {
	if (typeof e != "undefined") {
		if (e.key == "right" || e.key == "left") {
            e.stop();
			this.rotate(e.key);
		}
        else if (e.key == "space") {
            e.stop();
            cueball.strikeBallWithCue(Globals.strikeForce, this);
        }
	}
	
	this.ballPosition = cueball.position();
	this.update();
};

/**
 * Rotate the cue based on the key pressed.
 *
 * @param key
 */
Cue.prototype.rotate = function(key) {
    if (key == "left") {
        this.angle -= 2;
    } else {
        this.angle += 2;
    }

    var angleInRadians = this.angle*Math.PI/180;
    var rotation = new PhiloGL.Mat4();
    this.rotation = rotation.rotateAxis(angleInRadians, (new PhiloGL.Vec3(0, 0, 3)).unit());
};

/**
 * Hide the cue by moving it to a non-visible position.
 */
Cue.prototype.hideCue = function() {
	this.ballPosition = new PhiloGL.Vec3(0, 0, 400);
	this.update();
};

/**
 * Access method for the position.
 *
 * @return {PhiloGL.Vec3}
 */
Cue.prototype.position = function() {
    return this.cylinder.position;
};

