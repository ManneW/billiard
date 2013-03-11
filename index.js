function webGLStart() {
    var pos, $id = function (d) {
        return document.getElementById(d);
    };

    // Set up textures
    var textures = ['ball.jpg', 'ball11.png'];

    for (var ballCounter = 1; ballCounter < 9; ballCounter += 1) {
        textures.push('ball' + ballCounter + '.png');
    }

	// Create TABLE
	var table = new Table();

    // Create arrays to keep track of balls, cushions, pockets and cue
    var balls = table.balls;
    var cushions = table.cushions;
    var pockets = table.pockets;
	var cue = table.cue;

    // Create logg array
    var logg = new Array(balls.length);
    for (var i = 0; i < logg.length; i += 1) {
        logg[i] = new Array(balls.length);
        for (var j = 0; j < logg[i].length; j += 1) {
            logg[i][j] = false;
        }
    }

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
	
    //Create application
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
        events:{
            onMouseWheel: function (e) {
                e.stop();
                var camera = this.camera;
                if ((camera.position.z < -100 || e.wheel < 0) && (camera.position.z > -300 || e.wheel > 0)) {
                    camera.position.z += 10 * e.wheel;
                }
                camera.update();

            },
            onClick: function (e) {
                e.stop();
                console.log(e);
                //table.balls[0].strikeBall(90, cue, null);
				//table.balls[0].strikeBall(new PhiloGL.Vec3(e.x, e.y, 0), null);
				cue.update();
				table.balls[0].strikeBallWithCue(90, cue);
				//scene.remove(cue.cylinder);
            },
			onKeyDown: function (e) {
				//e.stop();
				cue.followCueball(balls[0], e);
			}
        },
        onError:function (err) {
            alert("There was an error creating the app.");
            console.log(err);
        },
        onLoad:function (app) {
            //Unpack app properties
            var gl = app.gl,
                program = app.program,
                scene = app.scene,
                canvas = app.canvas,
                camera = app.camera;

//            canvas.width = document.width * 0.99;
//            canvas.height= document.height * 0.99;

            //Basic gl setup
            gl.clearColor(0.0, 0.0, 0.0, 0.0);
            gl.clearDepth(1.0);
            gl.enable(gl.DEPTH_TEST);
            //gl.enable(gl.BLEND);
            gl.depthFunc(gl.LEQUAL);

            gl.viewport(0, 0, +canvas.width, +canvas.height);

            //Add all the balls to the scene
            scene.add(table.plane);
            for (var i = 0; i < balls.length; i += 1) {
                scene.add(balls[i].sphere);
                scene.add(balls[i].shadow);
            }

            //Add all the cushions to the scene
            for (var i = 0; i < cushions.length; i += 1) {
                scene.add(cushions[i].cube);
            }

            //Add all the pockets to the scene
            for (var pocketIndex = 0; pocketIndex < pockets.length; pocketIndex += 1) {
                scene.add(pockets[pocketIndex].cylinder);
            }
			
			//Add cue to the scene
			scene.add(cue.cylinder);

            var currentTime = PhiloGL.Fx.animationTime();
            Globals.previousLoop.start = currentTime;
            Globals.previousLoop.end = currentTime;

            //Animate
            //draw();
            var fps = 40;
            var simulation_fps = 60;
            var slowMotionFactor = 0.5;


            setTimeout(render, 1000/fps);
            setTimeout(draw, 1000/(simulation_fps*slowMotionFactor));

            function render() {
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                scene.render();
                setTimeout(render, 1000/fps);
            }

            //Draw the scene - this function is a big while loop
            function draw() {
                setTimeout(draw, 1000/(simulation_fps*slowMotionFactor));
                currentTime = PhiloGL.Fx.animationTime();
                Globals.timeSinceLastLoop = 1000/simulation_fps;
                Globals.previousLoop.start = currentTime;

                // Decrease the velocities (energy) of the balls
                table.looseBallVelocities();

                // Simulate the whole table one step forward
                table.step();

                // Iterate and check for collissions (max 20 iterations)
                var loopCounter = 0;
                while(table.collideBalls(logg) && loopCounter < 20) {
                    // Rewind the table one step
                    table.step(-1);

                    // Resolve the collisions that was detected
                    for (var c = 0; c < table.collisions.length; c += 1) {
                        var collision = table.collisions[c];
                        var collisionDelta = collision; //calculateTempVelocity(collision.ballA, collision.ballB);
                        //collision.ballA.velocity.$sub(collision.delta_vA);
                        //collision.ballB.velocity.$sub(collision.delta_vB);
                        collision.ballA.angularVelocity.$sub(collisionDelta.delta_wA);
                        collision.ballA.updateVelocityBasedOnAngularVelocity();
                        collision.ballB.angularVelocity.$sub(collisionDelta.delta_wB);
                        collision.ballB.updateVelocityBasedOnAngularVelocity();

                        collision.ballA.update();
                        collision.ballB.update();
                        collision.ballA.resolveBallImpactPosition(collision.ballB);
                        //collision.ballA.looseVelocity(Globals.timeSinceLastLoop / 1000);
                        //collision.ballB.looseVelocity(Globals.timeSinceLastLoop / 1000);
                        //collision.ballA.step(50);
                        //collision.ballB.step(50);
                    }
                    table.step();
                    loopCounter += 1;
                }

                // Check for cushion collisions
				for (i = 0; i < balls.length; i += 1) {
					if (!balls[i].inGame || balls[i].velocity.norm() == 0) {
						continue; // Skip if the ball isn't moving
					}

					// Do edge collisions
					for (var cushionIndex = 0; cushionIndex < cushions.length; cushionIndex += 1) {
						cushions[cushionIndex].resolveCollision(balls[i]);
					}
                }

                // Stuff for handling the cue
                if(!table.checkForMovingBalls()){
                    // No balls are moving - display the cue and follow the cue ball
                    cue.followCueball(balls[0]);
                }
                else {
                    // Some balls are moving - hide the cue
					cue.hideCue();
                }
				
                Globals.previousLoop.end = PhiloGL.Fx.animationTime();
            }
        }
    });
}
