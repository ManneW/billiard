/**
 * The cue of the billiardtable
 *
 * @param index
 * @constructor
 */

var Cue = function(cueballPosition){
	this.cylinder = new PhiloGL.O3D.Cylinder({
		radius : 1.2,
		height : Constants.cueLength,
		colors : [0.8, 0.5, 0, 1],
		topCap: true,
		bottomCap : true	
	});

    this.rotation = new PhiloGL.Mat4();
    this.rotation.id();
    this.angle = 0;
	this.cylinder.position = new PhiloGL.Vec3(2*cueballPosition.x, cueballPosition.y, -10);
    this.cylinder.rotation = new PhiloGL.Vec3(Math.PI/30, 0, Math.PI/2);
	this.ballPosition = cueballPosition;
    this.update();
 };

Cue.prototype.update = function() {
    var matrix = this.cylinder.matrix,
        pos = this.cylinder.position,
        pivot = this.ballPosition,
        rot = this.cylinder.rotation,
        scale = this.cylinder.scale;

    var T = new PhiloGL.Mat4();
    T.id();
    T.$translate(pivot.x, pivot.y, 0);

    //var Tp = new PhiloGL.Mat4();
    //Tp.id();
    //Tp.$translate(-pivot.x, -pivot.y, 0);

    //var Tball = new PhiloGL.Mat4();
    //Tball.id();

    var all = new PhiloGL.Mat4();
    all.id();
    all = all.mulMat4(T);
    all = all.mulMat4(this.rotation);
    all = all.translate(Constants.cueLength/2, 0, 0);
    all = all.rotateAxis(Math.PI/2, new PhiloGL.Vec3(0,0,1));
    all = all.translate(0,0,-3);

    matrix.id();
    //matrix.$translate(pos.x, pos.y, pos.z);
    matrix.$mulMat4(all);
    //matrix.$mulMat4(Tp);
    //matrix.$mulMat4(this.rotation);
    //matrix.$mulMat4(T);
    matrix.$scale(scale.x, scale.y, scale.z);
};

Cue.prototype.followCueball = function(cueball, e){
	if (typeof e != "undefined") {
		if (e.key == "right") {
			this.rotateRight(cueball);
		}
		else if (e.key == "left") {
			this.rotateLeft(cueball);
		}
	}
	
	this.ballPosition = cueball.position();
	this.update();
};

Cue.prototype.rotateLeft = function(cueball){
	this.angle -= 2;
	angler = this.angle*Math.PI/180;

    var rotation = new PhiloGL.Mat4();
    rotation.id();
    this.rotation = rotation.rotateAxis(angler, (new PhiloGL.Vec3(0, 0, 3)).unit());
};

Cue.prototype.rotateRight = function(cueball){
	this.angle += 2;
	angler = this.angle*Math.PI/180;

    var rotation = new PhiloGL.Mat4();
    rotation.id();
    this.rotation = rotation.rotateAxis(angler, (new PhiloGL.Vec3(0, 0, 3)).unit());
};

Cue.prototype.hideCue = function() {
	this.ballPosition = new PhiloGL.Vec3(-300,-330,0);
	this.update();
};

Cue.prototype.position = function() {
    return this.cylinder.position;
};

