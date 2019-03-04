var PREVIEW3D = {
  Player: function (container, service) {
    var loader = new THREE.ObjectLoader();
    var camera, scene, renderer, controls, raycaster;
    var mouse = new THREE.Vector2(), INTERSECTED;
    var events = {};
    var dom = document.createElement( 'div' );
    this.dom = dom;
    this.load = function ( json ) {
      renderer = new THREE.WebGLRenderer( { antialias: true } );
      renderer.setClearColor( 0x000000 );
      renderer.setPixelRatio( window.devicePixelRatio );
      var project = json.project;
      if ( project.gammaInput ) renderer.gammaInput = true;
      if ( project.gammaOutput ) renderer.gammaOutput = true;
      if ( project.shadows ) renderer.shadowMap.enabled = true;
      if ( project.vr ) renderer.vr.enabled = true;
      dom.appendChild( renderer.domElement );
      this.setScene( loader.parse( json.scene ) );
      this.setCamera( loader.parse( json.camera ) );
      raycaster = new THREE.Raycaster();
      events = {
        init: [],
        start: [],
        stop: [],
        keydown: [],
        keyup: [],
        mousedown: [],
        mouseup: [],
        mousemove: [],
        touchstart: [],
        touchend: [],
        touchmove: [],
        update: []
      };
      var scriptWrapParams = 'player,renderer,scene,camera';
      var scriptWrapResultObj = {};
      for ( var eventKey in events ) {
        scriptWrapParams += ',' + eventKey;
        scriptWrapResultObj[ eventKey ] = eventKey;
      }
      var scriptWrapResult = JSON.stringify( scriptWrapResultObj ).replace( /\"/g, '' );
      for ( var uuid in json.scripts ) {
        var object = scene.getObjectByProperty( 'uuid', uuid, true );
        if ( object === undefined ) {
          console.warn( 'APP.Player: Script without object.', uuid );
          continue;
        }
        var scripts = json.scripts[ uuid ];
        for ( var i = 0; i < scripts.length; i ++ ) {
          var script = scripts[ i ];
          var functions = ( new Function( scriptWrapParams, script.source + '\nreturn ' + scriptWrapResult + ';' ).bind( object ) )( this, renderer, scene, camera );
          for ( var name in functions ) {
            if ( functions[ name ] === undefined ) continue;
            if ( events[ name ] === undefined ) {
              console.warn( 'APP.Player: Event type not supported (', name, ')' );
              continue;
            }
            events[ name ].push( functions[ name ].bind( object ) );
          }
        }
      }
      controls = new THREE.OrbitControls(camera, container);
      controls.enableDamping = false;
      controls.screenSpacePanning = true;
      controls.minDistance = 200;
      controls.maxDistance = 5000;
      controls.zoomSpeed = 1;
      controls.maxPolarAngle = Math.PI / 2;
      controls.rotateSpeed = 0.5;
      controls.target = new THREE.Vector3(0,20.55,0);
      //controls.addEventListener( 'change', render );
      dispatch( events.init, arguments );
    };
    this.getSelectedObject = function() {
      return INTERSECTED;
    };
    this.addKeyListener = function(f) {
      events.keydown.push(f);
    };
    this.setCamera = function ( value ) {
      camera = value;
      camera.aspect = dom.offsetWidth / dom.offsetHeight;
      camera.updateProjectionMatrix();
      if ( renderer.vr.enabled ) {
        dom.appendChild( WEBVR.createButton( renderer ) );
      }
    };
    this.getCamera = function() {
      return camera;
    };
    this.setScene = function ( value ) {
      scene = value;
    };
    this.getScene = function() {
      return scene;
    }
    this.setSize = function ( width, height ) {
      this.width = width;
      this.height = height;
      if ( camera ) {
        camera.aspect = this.width / this.height;
        camera.updateProjectionMatrix();
      }
      if ( renderer ) {
        renderer.setSize( width, height );
      }
    };
    function dispatch( array, event ) {
      for ( var i = 0, l = array.length; i < l; i ++ ) {
        array[ i ]( event );
      }
    }
    var time, prevTime;
    function animate() {
      if (service && service.joints[0] && service.joints.length === 4) {
        scene.J1.rotation.z = service.joints[0].value * Math.PI / 180;
        scene.J2.rotation.z = service.joints[1].value * Math.PI / 180;
        scene.J3.position.z = service.joints[2].value / 10;
        scene.J3.rotation.z = service.joints[3].value * Math.PI / 180;
      }
      time = performance.now();
      try {
        dispatch( events.update, { time: time, delta: time - prevTime } );
      } catch ( e ) {
        console.error( ( e.message || e ), ( e.stack || "" ) );
      }
      controls.update();
      render();
      update();
      prevTime = time;
    }
    function render() {
      // find intersections
      raycaster.setFromCamera(mouse,camera);
      var intersects = raycaster.intersectObjects( scene.children );
      if ( intersects.length > 0 ) {
        var candidate = null;
        for (var i=0; i<intersects.length && candidate === null; i++) {
          if (intersects[i].object.name !== 'Plane') {
            candidate = intersects[i].object;
          }
        }
        if (candidate === null) {
          if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
          INTERSECTED = null;
          renderer.render( scene, camera );
          return;
        }
        if ( INTERSECTED != candidate ) {
          if (INTERSECTED) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
          INTERSECTED = candidate;
          INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
          INTERSECTED.material.emissive.setHex( 0x007700 );
        }
      } else {
        if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
        INTERSECTED = null;
      }
      renderer.render( scene, camera );
    }
    function update() {
      var bbox = new THREE.Box3().setFromObject(scene.robot);
    }
    this.play = function () {
      prevTime = performance.now();
      dom.addEventListener( 'keydown', onDocumentKeyDown );
      dom.addEventListener( 'keyup', onDocumentKeyUp );
      dom.addEventListener( 'mousedown', onDocumentMouseDown );
      dom.addEventListener( 'mouseup', onDocumentMouseUp );
      dom.addEventListener( 'mousemove', onDocumentMouseMove );
      dom.addEventListener( 'touchstart', onDocumentTouchStart );
      dom.addEventListener( 'touchend', onDocumentTouchEnd );
      dom.addEventListener( 'touchmove', onDocumentTouchMove );
      dispatch( events.start, arguments );
      renderer.setAnimationLoop( animate );
    };
    this.stop = function () {
      dom.removeEventListener( 'keydown', onDocumentKeyDown );
      dom.removeEventListener( 'keyup', onDocumentKeyUp );
      dom.removeEventListener( 'mousedown', onDocumentMouseDown );
      dom.removeEventListener( 'mouseup', onDocumentMouseUp );
      dom.removeEventListener( 'mousemove', onDocumentMouseMove );
      dom.removeEventListener( 'touchstart', onDocumentTouchStart );
      dom.removeEventListener( 'touchend', onDocumentTouchEnd );
      dom.removeEventListener( 'touchmove', onDocumentTouchMove );
      dispatch( events.stop, arguments );
      renderer.setAnimationLoop( null );
    };
    this.dispose = function () {
      while ( dom.children.length ) {
        dom.removeChild( dom.firstChild );
      }
      renderer.dispose();
      camera = undefined;
      scene = undefined;
      renderer = undefined;
    };
    function onDocumentKeyDown( event ) {
      dispatch( events.keydown, event );
    }
    function onDocumentKeyUp( event ) {
      dispatch( events.keyup, event );
    }
    function onDocumentMouseDown( event ) {
      dispatch( events.mousedown, event );
    }
    function onDocumentMouseUp( event ) {
      dispatch( events.mouseup, event );
    }
    function onDocumentMouseMove( event ) {
      mouse.x = ( event.offsetX / dom.offsetWidth ) * 2 - 1;
      mouse.y = - ( event.offsetY / dom.offsetHeight ) * 2 + 1;
      dispatch( events.mousemove, event );
    }
    function onDocumentTouchStart( event ) {
      dispatch( events.touchstart, event );
    }
    function onDocumentTouchEnd( event ) {
      dispatch( events.touchend, event );
    }
    function onDocumentTouchMove( event ) {
      dispatch( events.touchmove, event );
    }
  }
};
