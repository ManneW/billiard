function webGLStart() {
  var pos, $id = function(d) { return document.getElementById(d); };


  
  //Create table
  var table = new PhiloGL.O3D.Plane({
	type: 'x,y',
	xlen: 287,
	ylen: 160,
	nx: 1,
	ny: 1,
	offset: 0,
	colors: [0.5, 1, 0.7, 1]
  });
  
  //Create ball
  var ball = new PhiloGL.O3D.Sphere({
    nlat: 30,
    nlong: 30,
    radius: 3,
	colors: [1, 1, 1, 1],
    position: {
        x: 0, y: 0, z: -3
      }
  });
  
  var newball = new Ball();

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
        camera.position.z += e.wheel;
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
          camera = app.camera,
          //get light config from forms
          lighting = $id('lighting'),
          ambient = {
            r: 0.2,
            g: 0.2,
            b: 0.2
          },
          direction = {
            x: -1.0,
            y: -1.0,
            z: -1.0,
          
            r: 0.8,
            g: 0.8,
            b: 0.8
          };
      
      //Basic gl setup
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clearDepth(1.0);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.viewport(0, 0, +canvas.width, +canvas.height);
      //Add object to the scene
    //  scene.add(ball);
	  scene.add(table);
	  scene.add(newball.sphere);
      //Animate
      draw();

      //Draw the scene
      function draw() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        //Setup lighting
        var lights = scene.config.lights;
        lights.enable = lighting.checked;
        lights.ambient = {
          r: +ambient.r,
          g: +ambient.g,
          b: +ambient.b
        };
        lights.directional = {
          color: {
            r: +direction.r,
            g: +direction.g,
            b: +direction.b
          },
          direction: {
            x: +direction.x,
            y: +direction.y,
            z: +direction.z
          }
        };
		
		var newpos;
		if( newball.sphere.position.x < 287/2 - 3 ) {
			newpos = newball.move(1);
		}
		newball.sphere.update();
        //render moon
        scene.render();
        //request new frame
        PhiloGL.Fx.requestAnimationFrame(draw);
      }
    }
  });
}
