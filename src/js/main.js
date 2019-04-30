let renderer = undefined;
let scene = undefined;
let camera = undefined;
let absoluteAccumulatedTime = 0;
let astros=[];
let astroCount=0;
controls = undefined;

$(function () {
  const { width, height } = getWidthAndHeight();
  const ratio = width / height;

  camera = new THREE.PerspectiveCamera(17, ratio, 0.1, 20000);
  camera.position.set(1500, 3000, 2000);
  camera.lookAt(0, 0, 0);

  controls = new THREE.OrbitControls( camera );
  controls.update();

  renderer = new THREE.WebGLRenderer();
  updateViewport();
  $("#canvas-container").append(renderer.domElement);

  scene = new THREE.Scene();

  sun = new Astro("sol",300, 10,0, 0, "src/textures/sunmap.jpg", false, false,true);
  /*
  mercury = new Astro(1.5, 10,10, 15, "src/textures/mercury.jpg");

  venus = new Astro(3, 13, 150, 20, "src/textures/venus.jpg");
  
  earth = new Astro(3, 16, 300, 30, "src/textures/earth.jpg");
    moon = new Astro(0.2, 0, 6, 5, "src/textures/moon.jpg",false,true);
    earth.addMoon(moon);

  mars = new Astro(2,10, 80, 40, "src/textures/mars.jpg");
    phobos = new Astro(0.2, 0, 6, 3, "src/textures/moon.jpg",false,true);
    demios = new Astro(0.2, 0, 6, 4, "src/textures/moon.jpg",false,true);
    mars.addMoon(phobos);
    mars.addMoon(demios);

  jupiter = new Astro(6, 21, 70, 60, "src/textures/jupiter.jpg");
    io = new Astro(0.2, 0, 6, 7, "src/textures/moon.jpg",false,true);
    europe = new Astro(0.2, 0, 6, 8, "src/textures/moon.jpg",false,true);
    ganymedes = new Astro(0.2, 0, 6, 9, "src/textures/moon.jpg",false,true);
    calistos = new Astro(0.2, 0, 6, 10, "src/textures/moon.jpg",false,true);
    jupiter.addMoon(io);
    jupiter.addMoon(europe);
    jupiter.addMoon(ganymedes);
    jupiter.addMoon(calistos);

  saturn = new Astro(5, 16, 125,100, "src/textures/saturn.jpg",true,false,false,"src/textures/saturnringcolor.jpg");
    mimas = new Astro(0.3, 0, 6, 6, "src/textures/moonmap1k.jpg",false,true);
    enceladus = new Astro(0.3, 0, 6, 7, "src/textures/moonmap1k.jpg",false,true);
    tethys = new Astro(0.3, 0, 6, 8, "src/textures/moonmap1k.jpg",false,true);
    dione = new Astro(0.3, 0, 6, 9, "src/textures/moonmap1k.jpg",false,true);
    rhea = new Astro(0.3, 0, 6, 10, "src/textures/moonmap1k.jpg",false,true);
    titan = new Astro(0.3, 0, 6, 11, "src/textures/moonmap1k.jpg",false,true);
    hyperion = new Astro(0.3, 0, 6, 12, "src/textures/moonmap1k.jpg",false,true);
    iapetus = new Astro(0.3, 0, 6, 13, "src/textures/moonmap1k.jpg",false,true);
    saturn.addMoon(mimas);
    saturn.addMoon(enceladus);
    saturn.addMoon(tethys);
    saturn.addMoon(dione);
    saturn.addMoon(rhea);
    saturn.addMoon(titan);
    saturn.addMoon(hyperion);
    saturn.addMoon(iapetus);

  uranus = new Astro(4, 21, 50, 140, "src/textures/uranus.jpg",true,false,false,"src/textures/uranusringcolor.jpg");
    miranda = new Astro(0.3, 0, 6, 5, "src/textures/moonmap1k.jpg",false,true);
    ariel = new Astro(0.3, 0, 6, 6, "src/textures/moonmap1k.jpg",false,true);
    umbriel = new Astro(0.3, 0, 6, 7, "src/textures/moonmap1k.jpg",false,true);
    titania = new Astro(0.3, 0, 6, 8, "src/textures/moonmap1k.jpg",false,true);
    oberon = new Astro(0.3, 0, 6, 9, "src/textures/moonmap1k.jpg",false,true);
    uranus.addMoon(miranda);
    uranus.addMoon(ariel);
    uranus.addMoon(umbriel);
    uranus.addMoon(titania);
    uranus.addMoon(oberon);

  neptune = new Astro(4, 10, 75, 180, "src/textures/neptune.jpg");
    triton = new Astro(0.3, 0, 6, 5, "src/textures/moonmap1k.jpg",false,true);
    neptune.addMoon(triton);

  pluto = new Astro(3, 15, 500, 210, "src/textures/pluto.jpg",false);

  sun.addOrbiter(mercury);
  sun.addOrbiter(venus);
  sun.addOrbiter(earth);
  sun.addOrbiter(mars);
  sun.addOrbiter(jupiter);
  sun.addOrbiter(saturn);
  sun.addOrbiter(uranus);
  sun.addOrbiter(neptune);
  sun.addOrbiter(pluto);*/

  scene.add(sun);

  renderer.setAnimationLoop(animationLoop)
});

function animationLoop(accumulatedTime) {
  const timeDifference = accumulatedTime - absoluteAccumulatedTime;
  // sun.position.set(sun.position.x + 0.1, 0, 0);
  sun.animationLoop(absoluteAccumulatedTime, timeDifference);
  absoluteAccumulatedTime = accumulatedTime;
  renderer.render(scene, camera);
}

function getWidthAndHeight() {
  const width = $(window).width();
  const height = $(window).height();
  return { width, height };
}

function updateViewport() {
  const { width, height } = getWidthAndHeight();
  const fov = Math.atan2(height, width) * 100;
  camera.aspect = width / height;
  camera.fov = fov;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

$(window).on(
  "resize",
  updateViewport
);

/*function loadFBX()
{
    var loader = new THREE.FBXLoader();
    loader.load( '../ship/ship/air.fbx', function ( object ) 
    {
        robot_mixer[1] = {};
        robot_mixer[1]["idle"] = new THREE.AnimationMixer( scene );
        robot_mixer["idle"] = new THREE.AnimationMixer( scene );
        object.scale.set(0.02, 0.02, 0.02);
        var cam = new THREE.Vector3(0, 0, 0);
        var angle=Math.random()*90;
        var xa = Math.cos(angle)*200;
        var y = Math.sin(angle)*200;
        object.position.x = 5;
        object.position.y = 5;
        object.position.z = 1;
        object.lookAt(cam);

        object.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        } );
        robot_idle = object;
        robotGroup.add(robot_idle)
        scene.add( object );
        robot_mixer[robotCount]["idle"].clipAction( object.animations[ 0 ], array[robotCount] ).play();
/*
        loader.load( '../models/Robot/robot_atk.fbx', function ( object ) 
        {
            robot_mixer[robotCount]["attack"] = new THREE.AnimationMixer( scene );
            robot_mixer[robotCount]["attack"].clipAction( object.animations[ 0 ], robot_idle ).play();
        } );

        loader.load( '../models/Robot/robot_walk.fbx', function ( object ) 
        {
            robot_mixer[robotCount]["walk"] = new THREE.AnimationMixer( scene );
            robot_mixer[robotCount]["walk"].clipAction( object.animations[ 0 ], robot_idle ).play();
        } );
    } );
}*/