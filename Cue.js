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
	//var pos = cueball.position();

    this.rotation = new PhiloGL.Mat4();
    this.rotation.id();

    this.angle = 0;

    this.ballPosition = new PhiloGL.Vec3();

	this.cylinder.position = new PhiloGL.Vec3(2*cueballPosition.x, cueballPosition.y, -10);
    this.cylinder.rotation = new PhiloGL.Vec3(Math.PI/30, 0, Math.PI/2);
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

    var all = new PhiloGL.Mat4();
    all.id();

    all = all.mulMat4(T);
    all = all.mulMat4(this.rotation);
    all = all.translate(Constants.cueLength/2, 0, 0);
    all = all.rotateAxis(Math.PI/2, new PhiloGL.Vec3(0,0,1));


    matrix.id();
    //matrix.$translate(pos.x, pos.y, pos.z);
    matrix.$mulMat4(all);
//    matrix.$mulMat4(Tp);
//    matrix.$mulMat4(this.rotation);
//    matrix.$mulMat4(T);



    matrix.$scale(scale.x, scale.y, scale.z);
};
 
Cue.prototype.followCueball = function(cueball){
	var pos = cueball.position();
//	this.cylinder.position.x = pos.x + Constants.cueLength/2 + 5;
//	this.cylinder.position.y = pos.y;
//	this.cylinder.position.z = -10;

    this.rotateT(cueball);
    this.ballPosition = cueball.position();
	this.update();
};

Cue.prototype.rotateT = function(cueball){
	var pos = cueball.position();
	this.angle += 1;
	angler = this.angle*Math.PI/180;

    var rotation = new PhiloGL.Mat4();
    rotation.id();
    this.rotation = rotation.rotateAxis(angler, (new PhiloGL.Vec3(0, 0, 3)).unit());
	
//FUNKAR EJ PGA AV VINKEL DUMHETER BLAND ANNAT

	// var x = Math.abs(this.position().x - pos.x);
	// console.log(x);
	
	// var y = Math.tan(angler)*x;
	
	// var tannyR = Math.atan(angler);
	
	 
	// var matrix = this.cylinder.matrix,
				// pos = this.cylinder.position,
				// rot = this.cylinder.rotation,
				// scale = this.cylinder.scale;
	 // matrix.id();
	 // change = new PhiloGL.Vec3(-30,0,0)
	 // pos.$add(change);
	 // pos2 = pos.sub(change);
	 
	 // matrix.$translate(pos.x, pos.y, pos.z);
	 // matrix.$rotateXYZ(rot.x, 30, rot.z);
     // matrix.$scale(scale.x, scale.y, scale.z);
	 
	 
	// this.cylinder.position = new PhiloGL.Vec3(this.cylinder.position.x - 150, this.cylinder.position.y , this.cylinder.position.z );
    // this.cylinder.rotation = new PhiloGL.Vec3(Math.PI/30, angler, Math.PI/2);
	// this.cylinder.position = new PhiloGL.Vec3(this.cylinder.position.x + 150, this.cylinder.position.y , this.cylinder.position.z );
	 //this.cylinder.update();
};


Cue.prototype.position = function() {
    return this.cylinder.position;
};

