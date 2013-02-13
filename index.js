function webGLStart() {
    var pos, $id = function (d) {
        return document.getElementById(d);
    };

    //Create pooltable
    var table = new PhiloGL.O3D.Plane({
        type:'x,y',
        xlen:Constants.tableX,
        ylen:Constants.tableY,
        nx:1,
        ny:1,
        offset:0,
        colors:[0.5, 1, 0.7, 1]
    });

    //Create edges
    var cushion0 = new Cushion([1, 0, 0, 1], 0);
    var cushion1 = new Cushion([1, 0, 0, 1], 1);
    var cushion2 = new Cushion([1, 0, 0, 1], 2);
    var cushion3 = new Cushion([1, 0, 0, 1], 3);


    //Create arrays to keep track of balls and cushions
    var balls = [];
    var cushions = [];

    // Randomize a bunch of balls
    for (var ballCount = 0; ballCount < 20; ballCount += 1) {
        var randomBall = new Ball(
            {
                x: ((Math.random()*2) - 1) * 0.2 * Constants.tableX,
                y: ((Math.random()*2) - 1) * 0.2 * Constants.tableY
            }
        );
        if (Math.random() > 0.5) {
            randomBall.velocity = (new PhiloGL.Vec3(Math.random(), Math.random(), 0)).scale(1);
        } else {
            randomBall.velocity = (new PhiloGL.Vec3(0, 0, 0)).scale(1);
        }

        if (randomBall.offTable()) {
            console.log("Start off table?");
        } else {
            balls.push(randomBall);
        }
    }

    // Create logg array
    var logg = new Array(balls.length);
    for (var i = 0; i < logg.length; i += 1) {
        logg[i] = new Array(balls.length);
        for (var j = 0; j < logg[i].length; j += 1) {
            logg[i][j] = false;
        }
    }
	

    cushions.push(cushion0, cushion1, cushion2, cushion3);

    var lightConfig = {
        enable: true,
        ambient: {
            r: 0.2,
            g: 0.2,
            b: 0.2
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
        events:{
            onMouseWheel:function (e) {
                e.stop();
                var camera = this.camera;
                camera.position.z += 10 * e.wheel;
                camera.update();
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
            scene.add(table);
            for (var i = 0; i < balls.length; i += 1) {
                scene.add(balls[i].sphere);
            }

            // Add all the cushions to the scene
            for (var i = 0; i < cushions.length; i += 1) {
                scene.add(cushions[i].cube);
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


                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

				
				//Nollst�lla loggvektorn var tidssteg
				//logg.length = 0;
				
				//BOLLKOLLISION
				for(var i = 0 ; i < balls.length; i += 1) {

					for (j = i + 1; j < balls.length; j += 1) {
					
						
						////Pr�vade att ha en loggvektor �ver alla kombinationer som krockat och endast genomf�ra 
						////kollisionen om bollparet ej fanns med i loggen. (dvs ej krockat tidigare i samma tidssteg). 
						////Samma resultat som att s�tta j = i. Dvs inte s� bra. 
						// var check = false;			
						// if (logg.length != 0){
							// for (var k = 0; k < logg.length; k +=1){					
									// if(logg[k].x == i & logg[k].y  == j ){
										// console.log(logg[k]);
										// check = true;
									// }
									// if(logg[k].x == j & logg[k].y  == i ){
										// console.log(logg[k]);
										// check = true;
									// }								
							// }
						// }
						//if(i != j && check == false){
						
						
						 if(i != j){
                             //if (balls[i].velocity.norm() > balls[j].velocity.norm()) {

                                 if(balls[i].isBallColliding(balls[j])){

//                                     if (balls[i].velocity.norm() == 0 || balls[j].velocity.norm() == 0) {
//                                         console.log("One not moving");
//                                     }

                                     //L�gga till i loggvektorn om kollision intr�ffar
                                     //var test = new PhiloGL.Vec3(i,j,0);
                                     //logg.push(test);


                                     if (!logg[i][j] && !logg[j][i]) {
                                        //KROCK
                                        balls[i].ballCollision(balls[j]);


                                        //FLYTTA R�TT
                                        balls[i].resolveBallImpactPosition(balls[j]);


                                        logg[i][j] = true;
                                        logg[j][i] = true;
                                     }



    //                                while (balls[i].isBallColliding(balls[j])) {
    //                                    balls[i].step();
    //                                    balls[j].step();
    //                                }
                                 } else {
                                     logg[i][j] = false;
                                     logg[j][i] = false;
                                 }
                             //}
                         }
						 
					}

                    for (var cushionIndex = 0; cushionIndex < cushions.length; cushionIndex += 1) {
                        cushions[cushionIndex].resolveCollision(balls[i]);
                    }

                    //balls[i].step();

                    if (balls[i].offTable()) {
                        console.log("OFF TABLE!");
                    }
				}

                //KANTKOLLISION
//                for (var i = 0; i < cushions.length; i += 1) {
//                    for (var j = 0; 	j < balls.length; j += 1) {
//                        cushions[i].resolveCollision(balls[j]);
//                    }
//                }
				
				//F�RFLYTTNING
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
