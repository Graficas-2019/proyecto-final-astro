async function generateSun() {
  let group = new THREE.Group();

  let maps = {};
  await new Promise(resolve => {
    new THREE.TextureLoader().load(
      'assets/sun_texture.jpg',
      textureMap => {
        maps.map = textureMap;
        resolve();
      },
      null,
      resolve
    );
  });

  let object = new THREE.Mesh(
    new THREE.SphereGeometry(5, 64, 64),
    new THREE.MeshBasicMaterial(maps)
  );
  object.update = () => {};

  group.add(object);

  let light = new THREE.PointLight(0xffffff, 1, 0, 2);
  group.add(light);

  return group;
}

async function generateBody(
  {
    name,
    size,
    spinSpeed,
    orbitalSpeed,
    distanceFromOrbitCenter,
    nSatellites,
    hasRings,
    texture
  },
  bodies
) {
  let group = new THREE.Group();
  group.name = name;

  let objectMaps = {};
  await new Promise(resolve => {
    new THREE.TextureLoader().load(
      `assets/${texture}_texture.jpg`,
      textureMap => {
        objectMaps.map = textureMap;
        resolve();
      },
      null,
      resolve
    );
  });
  await new Promise(resolve => {
    new THREE.TextureLoader().load(
      `assets/${texture}_normal.jpg`,
      normalMap => {
        objectMaps.normalMap = normalMap;
        resolve();
      },
      null,
      resolve
    );
  });
  await new Promise(resolve => {
    new THREE.TextureLoader().load(
      `assets/${texture}_bump.jpg`,
      bumpMap => {
        objectMaps.bumpMap = bumpMap;
        objectMaps.bumpScale = 0.06;
        resolve();
      },
      null,
      resolve
    );
  });
  await new Promise(resolve => {
    new THREE.TextureLoader().load(
      `assets/${texture}_specular.jpg`,
      specularMap => {
        objectMaps.specularMap = specularMap;
        resolve();
      },
      null,
      resolve
    );
  });

  let object = new THREE.Mesh(
    new THREE.SphereGeometry(size, 64, 64),
    new THREE.MeshPhongMaterial(objectMaps)
  );
  object.position.set(distanceFromOrbitCenter, 0, 0);
  object.update = updateBody.bind(object, spinSpeed);

  group.add(object);

  let orbitGeometry = new THREE.Geometry();

  for (let i = 0; i < 2000; i++) {
    orbitGeometry.vertices.push(
      new THREE.Vector3(
        distanceFromOrbitCenter * Math.cos((2 * i * Math.PI) / 2000),
        0,
        distanceFromOrbitCenter * Math.sin((2 * i * Math.PI) / 2000)
      )
    );
  }

  let orbitLine = new THREE.Line(
    orbitGeometry,
    new THREE.LineBasicMaterial({
      color: 0x0000ff
    })
  );

  group.add(orbitLine);

  if (hasRings) {
    let ringMaps = {
      side: THREE.DoubleSide
    };

    await new Promise(resolve => {
      new THREE.TextureLoader().load(
        'assets/uranus_ring_texture.jpg',
        textureMap => {
          ringMaps.map = textureMap;
          resolve();
        },
        null,
        resolve
      );
    });

    let ringsObject = new THREE.Mesh(
      new THREE.RingGeometry(3, 5, 64),
      new THREE.MeshPhongMaterial(ringMaps)
    );
    ringsObject.rotation.x += Math.PI / 4;
    ringsObject.rotation.y += Math.PI / 4;
    ringsObject.rotation.z += Math.PI / 5;
    ringsObject.position.set(distanceFromOrbitCenter, 0, 0);

    group.add(ringsObject);
  }

  for (let i = 0; i < nSatellites; i++) {
    let moonGroup = await generateBody(
      {
        name: `${name}'s satellite #${i + 1}`,
        size: 0.5,
        spinSpeed: 0.2,
        orbitalSpeed: 2,
        distanceFromOrbitCenter: 5,
        nSatellites: 0,
        hasRings: false,
        texture: 'moon'
      },
      bodies
    );
    moonGroup.position.set(distanceFromOrbitCenter, 0, 0);
    group.add(moonGroup);
  }

  group.update = updateBodyGroup.bind(group, orbitalSpeed);

  bodies.push(group);

  return group;
}

function generateTraveler(origin, destination, shipModel, scene, camera) {
  let traveler = new THREE.Group();
  let ship = cloneFbx(shipModel);
  traveler.add(ship);
  traveler.scale.set(0.001, 0.001, 0.001);

  origin.children[0].getWorldPosition(traveler.position);
  let destinationPosition = destination.children[0].getWorldPosition(
    new THREE.Vector3()
  );
  traveler.goUp = function(mixer) {
    let kf1 = new THREE.Quaternion();
    let kf2 = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      Math.PI / 4
    );
    let animation = new THREE.AnimationClip('up', 0.5, [
      new THREE.QuaternionKeyframeTrack(
        '.quaternion',
        [0, 1],
        [kf1.x, kf1.y, kf1.z, kf1.w, kf2.x, kf2.y, kf2.z, kf2.w]
      )
    ]);
    let action = mixer.clipAction(animation, this);
    action.loop = THREE.LoopOnce;
    action.clampWhenFinished = true;
    action.play();
  }.bind(ship);
  traveler.goDown = function(mixer) {
    let kf1 = new THREE.Quaternion();
    let kf2 = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      -Math.PI / 4
    );
    let animation = new THREE.AnimationClip('up', 0.5, [
      new THREE.QuaternionKeyframeTrack(
        '.quaternion',
        [0, 1],
        [kf1.x, kf1.y, kf1.z, kf1.w, kf2.x, kf2.y, kf2.z, kf2.w]
      )
    ]);
    let action = mixer.clipAction(animation, this);
    action.loop = THREE.LoopOnce;
    action.clampWhenFinished = true;
    action.play();
  }.bind(ship);
  traveler.goLeft = function(mixer) {
    let kf1 = new THREE.Quaternion();
    let kf2 = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      -Math.PI / 4
    );
    let animation = new THREE.AnimationClip('up', 0.5, [
      new THREE.QuaternionKeyframeTrack(
        '.quaternion',
        [0, 1],
        [kf1.x, kf1.y, kf1.z, kf1.w, kf2.x, kf2.y, kf2.z, kf2.w]
      )
    ]);
    let action = mixer.clipAction(animation, this);
    action.loop = THREE.LoopOnce;
    action.clampWhenFinished = true;
    action.play();
  }.bind(ship);
  traveler.goRight = function(mixer) {
    let kf1 = new THREE.Quaternion();
    let kf2 = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      Math.PI / 4
    );
    let animation = new THREE.AnimationClip('up', 0.5, [
      new THREE.QuaternionKeyframeTrack(
        '.quaternion',
        [0, 1],
        [kf1.x, kf1.y, kf1.z, kf1.w, kf2.x, kf2.y, kf2.z, kf2.w]
      )
    ]);
    let action = mixer.clipAction(animation, this);
    action.loop = THREE.LoopOnce;
    action.clampWhenFinished = true;
    action.play();
  }.bind(ship);
  traveler.inclinedUp = false;
  traveler.inclinedDown = false;
  traveler.inclinedLeft = false;
  traveler.inclinedRight = false;
  traveler.inclined = false;
  traveler.direction = new THREE.Vector3();
  traveler.speed = 0.1;
  traveler.distanceToDestination = destinationPosition
    .sub(traveler.position)
    .length();
  traveler.raycaster = new THREE.Raycaster();
  traveler.raycaster.far = 5;
  traveler.update = updateTraveler.bind(traveler, destination);

  THREE.SceneUtils.attach(camera, scene, traveler);
  camera.position.set(0, 200, -600);
  camera.lookAt(0, 0, 0);

  return traveler;
}
