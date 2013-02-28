//TREVLIGA VARIABLER
const privateConstants = {
    g: 9.82,
    ball: {
        radius: 3,
        mass: 0.5,
        friction: {
            rolling: 0.1,
            sliding: 0.2
        }
    }
};


const Constants = {
    tableX: 287,
    tableY: 160,
    ballRadius: 3,
    pocketRadius: 6,
    g: privateConstants.g,
    ball: {
        radius: privateConstants.ball.radius,
        tableNormal: new PhiloGL.Vec3(0, 0, -privateConstants.ball.radius*0.01),
        mass: privateConstants.ball.mass,
        inertia: (2.0/5.0)*privateConstants.ball.mass*privateConstants.ball.radius*privateConstants.ball.radius*0.001,
        friction: {
            rolling: privateConstants.ball.friction.rolling,
            sliding: privateConstants.ball.friction.sliding
        },
        rollingFrictionalForceMagnitude: privateConstants.ball.friction.rolling * privateConstants.g * privateConstants.ball.mass * privateConstants.ball.radius/100

    },
	
	cueLength: 150
};

var Globals = {
    previousLoop: { start: -1, end: -1 },
    timeSinceLastLoop: -1
};


function quatFromAngularVelocity(angularVelocity, timeBetweenFrames) {
    var w = angularVelocity.scale(timeBetweenFrames);
    var w_unit = w.unit();
    var angle = w.norm();
    var quat = [0, 0, 0, 0];

    if (angle > 0.0) {
        quat[0] = w_unit.x * Math.sin(angle/2.0);
        quat[1] = w_unit.y * Math.sin(angle/2.0);
        quat[2] = w_unit.z * Math.sin(angle/2.0);
        quat[3] = Math.cos(angle/2.0);
    } else {
        // To prevent illegal stuff from happening
    }

    return quat;
}
