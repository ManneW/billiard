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
    var pockets = table.pockets;
	var cue = table.cue;

    // Randomize a bunch of balls
    

    // Create logg array
    var logg = new Array(balls.length);
    for (var i = 0; i < logg.length; i += 1) {
        logg[i] = new Array(balls.length);
        for (var j = 0; j < logg[i].length; j += 1) {
            logg[i][j] = false;
        }
    }

    //pockets.push(new Pocket(0), new Pocket(1), new Pocket(2), new Pocket(3), new Pocket(4), new Pocket(5));

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
            src: ['ball.jpg', 'ball1.png', 'ball2.png', 'ball11.png'],
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
                //table.balls[0].strikeBall(90, cue, null);
				table.balls[0].strikeBall(new PhiloGL.Vec3(e.x, e.y, 0), null);
				console.log("ST���T");
				//scene.remove(cue.cylinder);
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
			
			scene.add(cue.cylinder);

            var currentTime = PhiloGL.Fx.animationTime();
            Globals.previousLoop.start = currentTime;
            Globals.previousLoop.end = currentTime;

            //Animate
            //draw();
            var fps = 40;
            var simulation_fps = 60;

            setTimeout(render, 1000/fps);
            setTimeout(draw, 1000/simulation_fps);

            function render() {
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                scene.render();
                setTimeout(render, 1000/fps);
            }

            //Draw the scene - this function is a big while loop
            function draw() {
                setTimeout(draw, 1000/simulation_fps);
                currentTime = PhiloGL.Fx.animationTime();
                Globals.timeSinceLastLoop = 1000/simulation_fps;
                Globals.previousLoop.start = currentTime;



                table.looseBallVelocities();
                table.step();

                var loopCounter = 0;

                while(table.collideBalls(logg) && loopCounter < 20) {
                    table.step(-1);
//                    // Handle collisions
//                    for (var is = 0; is < table.insides.length; is += 1) {
//                        var inside = table.insides[is];
//                        inside.ballA.resolveBallImpactPosition(inside.ballB);
//                    }

                    console.log(table.collisions.length);
                    for (var c = 0; c < table.collisions.length; c += 1) {

                        var collision = table.collisions[c];
                        var collisionDelta = collision; //calculateTempVelocity(collision.ballA, collision.ballB);
                        //collision.ballA.velocity.$sub(collision.delta_vA);
                        //collision.ballB.velocity.$sub(collision.delta_vB);
                        collision.ballA.angularVelocity.$sub(collisionDelta.delta_wA);
                        collision.ballB.angularVelocity.$sub(collisionDelta.delta_wB);
                        collision.ballA.update();
                        collision.ballB.update();
                        collision.ballA.resolveBallImpactPosition(collision.ballB);
                        //collision.ballA.step(50);
                        //collision.ballB.step(50);
                    }
                    table.step();
                    loopCounter += 1;
                }
				

				
				for (i = 0; i < balls.length; i += 1) {
					if (!balls[i].inGame || balls[i].velocity.norm() == 0) {
						continue;
					}
					// Collision with edges
					for (var cushionIndex = 0; cushionIndex < cushions.length; cushionIndex += 1) {
						cushions[cushionIndex].resolveCollision(balls[i]);
					}
                }

                //CUE GOJS
                if(!table.checkForMovingBalls()){
                    //console.log("---");
                    //scene.add(cue.cylinder); //FUNKAR
                    cue.followCueball(balls[0]);
                }
                else{	//console.log("N�T R�R SIG");
                    //scene.remove(cue.cylinder); //FUNKAR EJ, VARF�R??
//                    cue.cylinder.position.x =0;
//                    cue.cylinder.position.y =0;
//                    cue.cylinder.position.z =20;
                    //cue.cylinder.update();
                    cue.followCueball(balls[0]);
                }

                    cue.update();
                Globals.previousLoop.end = PhiloGL.Fx.animationTime();


                //request new frame
                //PhiloGL.Fx.requestAnimationFrame(draw);
            }
        }
    });
}
