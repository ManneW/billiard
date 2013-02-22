//TREVLIGA VARIABLER
const privateConstants = {
    g: 9.82,
    ball: {
        radius: 3,
        mass: 0.5,
        friction: {
            rolling: 0.05,
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
        tableNormal: new PhiloGL.Vec3(0, 0, privateConstants.ball.radius*0.01),
        mass: privateConstants.ball.mass,
        inertia: (2.0/5.0)*privateConstants.ball.mass*privateConstants.ball.radius*privateConstants.ball.radius*0.001,
        friction: {
            rolling: privateConstants.ball.friction.rolling,
            sliding: privateConstants.ball.friction.sliding
        },
        rollingFrictionalForceMagnitude: privateConstants.ball.friction.rolling * privateConstants.g * privateConstants.ball.mass * privateConstants.ball.radius/100

    }
};

var Globals = {
    previousLoop: { start: -1, end: -1 },
    timeSinceLastLoop: -1
};
