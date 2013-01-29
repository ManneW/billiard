function webGLStart() {
  var pos, $id = function(d) { return document.getElementById(d); };

  
  
  //Create table
  var table = new PhiloGL.O3D.Plane({
	type: 'x,y',
	xlen: Constants.tableX,
	ylen: Constants.tableY,
	nx: 1,
	ny: 1,
	offset: 0,
	colors: [0.5, 1, 0.7, 1]
  });

  var cushion0 = new Cushion([1,0,0,1],0);
  var cushion1 = new Cushion([0,1,0,1],1);
  var cushion2 = new Cushion([0,0,1,1],2);
  var cushion3 = new Cushion([1,0,1,1],3);
  
  
  var newball = new Ball({x:-30 , y:-30});

  //Create application
  PhiloGL('billiard-canvas', {
    camera: {
      position: {
        x: 0, y: 0, z: -400
      }
    },
    events: {
      onMouseWheel: function(e) {
        e.stop();
        var camera = this.camera;
        camera.position.z += 10*e.wheel;
        camera.update();
      }
    },
    onError: function(err) {
      alert("There was an error creating the app.");
	  console.log(err);
    },
    onLoad: function(app) {
      //Unpack app properties
      var gl = app.gl,
          program = app.program,
          scene = app.scene,
          canvas = app.canvas,
          camera = app.camera;

        var lightConfig = scene.config.lights;
        lightConfig.enable = true;
        lightConfig.enableSpecular = false;
        lightConfig.ambient = {
            r: +0.2,
            g: +0.2,
            b: +0.2
        };
        lightConfig.directional.direction = {
            x: +-1.0,
            y: +-1.0,
            z: +-1.0
        };
        lightConfig.directional.color = {
            r: +0.8,
            g: +0.8,
            b: +0.8
        };

      //Basic gl setup
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clearDepth(1.0);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.viewport(0, 0, +canvas.width, +canvas.height);

      //Add object to the scene
    //  scene.add(ball);
	  scene.add(table);
	  scene.add(newball.sphere);
        scene.add(cushion0.cube);
		scene.add(cushion1.cube);
        scene.add(cushion2.cube);
		scene.add(cushion3.cube);




      //Animate
      draw();

      //Draw the scene
      function draw() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
          //Setup lighting
		
		var newpos;
		if (newball.sphere.position.x < 287/2 - 3 ) {
			newball.step();
		}
		else{
			newball.edgeCollision(cushion0);
			newball.step();
		}
		//newball.sphere.update();
        //render moon
        scene.render();
        //request new frame
        PhiloGL.Fx.requestAnimationFrame(draw);
      }
    }
  });
}
