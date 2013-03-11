function webGLStart() {
    var pos, $id = function (d) {
        return document.getElementById(d);
    };

    // Set up textures
    var textures = ['ball.jpg', 'ball11.png'];
    // Add all ball textures
    for (var ballCounter = 1; ballCounter < 9; ballCounter += 1) {
        textures.push('ball' + ballCounter + '.png');
    }

	// Create the table
	var table = new Table();

    // Fetch arrays from table that keeps track of balls, cushions, pockets and cue
    var balls = table.balls;
    var cushions = table.cushions;
    var pockets = table.pockets;
	var cue = table.cue;

    // Configure the scene lighting
    var lightConfig = {
        enable: true,
        ambient: {
            r: 0.5,
            g: 0.5,
            b: 0.5
        },
        directional: {
            direction: {
                x:+-1.0,
                y:+-1.0,
                z:+-1.0
            },
            color: {
                r:+0.8,
                g:+0.8,
                b:+0.8
            }
        },
        points: {
            position: {
                x: 0,
                y: 0,
                z: -100
            },
            diffuse: {
                r:+0.4,
                g:+0.4,
                b:+0.4
            },
            specular: {
                r:+0.3,
                g:+0.3,
                b:+0.3
            }
        }
    };
	
    // Create WebGL/PhiloGL application
    PhiloGL('billiard-canvas', {
        program: {
            from: 'uris',
            path: 'philo/shaders/',
            vs: 'frag-lighting.vs.glsl',
            fs: 'frag-lighting.fs.glsl',
            noCache: true
        },
        scene: {
            lights: lightConfig
        },
        camera:{
            position:{
                x:0, y:-150, z:-300.0
            }
        },
        textures: {
            src: textures,
            parameters: [{
                name: 'TEXTURE_MAG_FILTER',
                value: 'LINEAR'
            }, {
                name: 'TEXTURE_MIN_FILTER',
                value: 'LINEAR'
            }]
        },
        events: {
            // Create listener for camera zoom
            onMouseWheel: function (e) {
                e.stop();
                var camera = this.camera;
                if ((camera.position.z < -100 || e.wheel < 0) && (camera.position.z > -300 || e.wheel > 0)) {
                    camera.position.z += 10 * e.wheel;
                }
                camera.update();

            },
            // Create listener for key press
			onKeyDown: function (e) {
                // Handle cue control
				cue.handleCue(balls[0], e);
			}
        },

        onError:function (err) {
            alert("There was an error creating the app.");
            console.log(err);
        },

        // Do the setup of all WebGL related things
        onLoad:function (app) {
            // Create access to app properties
            var gl = app.gl,
                program = app.program,
                scene = app.scene,
                canvas = app.canvas,
                camera = app.camera;

            // Basic gl setup
            gl.clearColor(0.0, 0.0, 0.0, 0.0);
            gl.clearDepth(1.0);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            gl.viewport(0, 0, +canvas.width, +canvas.height);

            // Add the table to the scene
            scene.add(table.plane);

            // Add all the balls to the scene
            for (var ballI = 0; ballI < balls.length; ballI += 1) {
                scene.add(balls[ballI].sphere);

                // Add the ball's shadow as well
                scene.add(balls[ballI].shadow);
            }

            // Add all the cushions to the scene
            for (var cushionI = 0; cushionI < cushions.length; cushionI += 1) {
                scene.add(cushions[cushionI].cube);
            }

            // Add all the pockets to the scene
            for (var pocketI = 0; pocketI < pockets.length; pocketI += 1) {
                scene.add(pockets[pocketI].cylinder);
            }
			
			// Add the cue to the scene
			scene.add(cue.cylinder);

            // Set up variables for the simulation
            var fps = 60; // How often to re-render the scene
            var simulation_fps = 120; // How many simulation steps per second
            var slowMotionFactor = 1; // 1 = "real time", 0.5 = "50% slow motion"

            // Make render and simulateTable being called with a delay of the times specified above
            setTimeout(render, 1000/fps);
            setTimeout(simulateTable, 1000/(simulation_fps*slowMotionFactor));

            /**
             * Renders the scene.
             */
            function render() {
                // Make the rendering being triggered again (with delay)
                setTimeout(render, 1000/fps);

                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                scene.render();
            }

            /**
             * Advance the simulation one time step.
             *
             * The time step size is derived from simulation_fps.
             */
            function simulateTable() {
                setTimeout(simulateTable, 1000/(simulation_fps*slowMotionFactor));
                Globals.timeSinceLastLoop = 1000/simulation_fps;

                // Decrease the velocities (energy) of the balls
                table.looseBallVelocities();

                // Simulate the whole table one step forward
                table.step();

                // Iterate and check for collissions (max 20 iterations)
                var loopCounter = 0;
                while(table.collideBalls() && loopCounter < 20) {
                    // Rewind the table one step
                    table.step(-1);

                    // Resolve the collisions that was detected
                    for (var c = 0; c < table.collisions.length; c += 1) {
                        var collision = table.collisions[c];
                        // Alter the angular velocities based on the velocity change from the collision
                        collision.ballA.angularVelocity.$sub(collision.delta_wA);
                        collision.ballB.angularVelocity.$sub(collision.delta_wB);

                        // Update the velocities based on the angular velocities
                        collision.ballA.updateVelocityBasedOnAngularVelocity();
                        collision.ballB.updateVelocityBasedOnAngularVelocity();

                        // Adjust the impact position of the fastest moving ball (ballA)
                        //collision.ballA.resolveBallImpactPosition(collision.ballB);

                        // Update the graphical representations
                        collision.ballA.update();
                        collision.ballB.update();
                    }

                    // Advance the table one step again
                    table.step();
                    loopCounter += 1;
                }

                // Check for cushion collisions
				for (var ballI = 0; ballI < balls.length; ballI += 1) {
					if (!balls[ballI].inGame || balls[ballI].velocity.norm() == 0) {
						continue; // Skip if the ball isn't moving
					}

					// Do edge collisions
					for (var cushionI = 0; cushionI < cushions.length; cushionI += 1) {
						cushions[cushionI].resolveCollision(balls[ballI]);
					}
                }

                // Stuff for handling the cue
                if (!table.checkForMovingBalls()){
                    // No balls are moving - display the cue and move to the cue ball
                    cue.handleCue(balls[0]);
                }
                else {
                    // Some balls are moving - hide the cue
					cue.hideCue();
                }
            }
        }
    });
}
