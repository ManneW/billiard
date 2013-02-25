function webGLStart() {
    var pos, $id = function (d) {
        return document.getElementById(d);
    };

	
	//Create TABLE
	
	var table = new Table();
	//table.constructTable();


    // Create pockets
    var pocket0 = new Pocket(0);


    //Create arrays to keep track of balls and cushions
    var balls = table.balls;
    var cushions = table.cushions;
    var pockets = [];

    // Randomize a bunch of balls
    

    // Create logg array
    var logg = new Array(balls.length);
    for (var i = 0; i < logg.length; i += 1) {
        logg[i] = new Array(balls.length);
        for (var j = 0; j < logg[i].length; j += 1) {
            logg[i][j] = false;
        }
    }


    pockets.push(new Pocket(0), new Pocket(1), new Pocket(2), new Pocket(3), new Pocket(4), new Pocket(5));

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
        }
    };

    //Create application
    PhiloGL('billiard-canvas', {
        scene: {
            lights: lightConfig
        },
        camera:{
            position:{
                x:0, y:0, z:-300.0
            }
        },
        textures: {
            src: ['ball.jpg'],
            parameters: [{
                name: 'TEXTURE_MAG_FILTER',
                value: 'LINEAR'
            }, {
                name: 'TEXTURE_MIN_FILTER',
                value: 'LINEAR_MIPMAP_NEAREST',
                generateMipmap: true
            }]
        },
        events:{
            onMouseWheel:function (e) {
                e.stop();
                var camera = this.camera;
                camera.position.z += 10 * e.wheel;
                camera.update();

            },
            onClick: function (e) {
                e.stop();
                console.log(e);
                table.balls[0].strikeBall(new PhiloGL.Vec3(e.x, e.y, 0), null);
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



            //Basic gl setup
            gl.clearColor(1.0, 1.0, 1.0, 0.0);
            gl.clearDepth(1.0);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            gl.viewport(0, 0, +canvas.width, +canvas.height);


            // Add all the balls to the scene
            scene.add(table.plane);
            for (var i = 0; i < balls.length; i += 1) {
                scene.add(balls[i].sphere);
            }

            // Add all the cushions to the scene
            for (var i = 0; i < cushions.length; i += 1) {
                scene.add(cushions[i].cube);
            }

            // Add all the pockets to the scene
            for (var pocketIndex = 0; pocketIndex < pockets.length; pocketIndex += 1) {
                scene.add(pockets[pocketIndex].cylinder);
            }

            var currentTime = PhiloGL.Fx.animationTime();
            Globals.previousLoop.start = currentTime;
            Globals.previousLoop.end = currentTime;

            //Animate
            draw();


            //Draw the scene - this function is a big while loop
            function draw() {
                currentTime = PhiloGL.Fx.animationTime();
                Globals.timeSinceLastLoop = currentTime - Globals.previousLoop.end;
                if (Globals.timeSinceLastLoop < (1000/60)) {
                    PhiloGL.Fx.requestAnimationFrame(draw);
                    //console.log("Too fast");
                    return;
                }

                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                // Iterate all balls
                for (var i = 0; i < balls.length; i += 1) {
					if (!balls[i].inGame) {
						continue;
					}
					
                    // Collision with edges
                    for (var pocketIndex = 0; pocketIndex < pockets.length; pocketIndex += 1) {
                        if(pockets[pocketIndex].isBallInPocket(balls[i])){
							//console.log("Ball is out of game: " + i);
							//table.pocketBall(balls[i]);
						}
                    }
					
                    for (j = i + 1; j < balls.length; j += 1) {
						if (!balls[j].inGame) {
							continue;
						}
					
					
                        if (balls[i].isBallColliding(balls[j])) {
								
                            if (!logg[i][j] && !logg[j][i]) {
								
                                // Calculate collision
                                balls[i].ballCollision(balls[j]);
								
								// Move the balls to correct positions
								//balls[i].resolveBallImpactPosition(balls[j]);
								
								
								
								
                                

                                // Log that a collision has occurred
                                logg[i][j] = true;
                                logg[j][i] = true;

//                                for (var tempI = 0; tempI < logg[i].length; tempI+=1) {
//                                    logg[i][tempI] = true;
//                                }
//
//                                for (var tempJ = 0; tempJ < logg[j].length; tempJ+=1) {
//                                    logg[j][tempJ] = true;
//                                }
                            }
							else{
								//balls[i].resolveBallImpactPositionAlt(balls[j]);
							}
                        } else {
                            // Reset log entry for collision pair
                            logg[i][j] = false;
                            logg[j][i] = false;
                        }
                    }

                    // Collision with edges
                    for (var cushionIndex = 0; cushionIndex < cushions.length; cushionIndex += 1) {
                        cushions[cushionIndex].resolveCollision(balls[i]);
                    }
                }

                // Update position and velocities for all balls
                for (i = 0; i < balls.length; i += 1) {
                    balls[i].step();
                }

                scene.render();

                Globals.previousLoop.end = PhiloGL.Fx.animationTime();

                //request new frame
                PhiloGL.Fx.requestAnimationFrame(draw);
            }
        }
    });
}
