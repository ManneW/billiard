/**
 * Various constants to make implementation of calculations cleaner.
 *
 * These constants are not used directly, but are here to provide the possibility
 * to have calculations in the constants below.
 *
 * @type {Object}
 */
const privateConstants = {
    g: 9.82,
    ball: {
        radius: 3,
        mass: 0.5,
        friction: {
            rolling: 0.01,
            sliding: 0.2
        }
    }
};

/**
 * The actual constants used.
 *
 * @type {Object}
 */
const Constants = {
    table: {
        sizeX: 287,
        sizeY: 160
    },

    g: privateConstants.g,

    ball: {
        radiusInMeters: privateConstants.ball.radius / 100,
        radius: privateConstants.ball.radius,
        tableNormal: new PhiloGL.Vec3(0, 0, -privateConstants.ball.radius*0.01),
        mass: privateConstants.ball.mass,
        inertia: (2.0/5.0)*privateConstants.ball.mass*privateConstants.ball.radius*privateConstants.ball.radius*0.0001,

        friction: {
            rolling: privateConstants.ball.friction.rolling,
            sliding: privateConstants.ball.friction.sliding
        },
        rollingFrictionalForceMagnitude: privateConstants.ball.friction.rolling * privateConstants.g * privateConstants.ball.mass * privateConstants.ball.radius/100

    },

    cushion: {
        dampening: 0.5
    },

    pocket: {
        radius: 5
    },
	
	cue: {
        length: 150
    }
};

var Globals = {
    previousLoop: { start: -1, end: -1 },
    timeSinceLastLoop: -1,
    strikeForce: 90
};
