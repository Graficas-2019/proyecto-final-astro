let ship;

async function setup(canvas) {
  // setup renderer
  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.width, canvas.height);

  // set up camera
  let camera = new THREE.PerspectiveCamera(
    45,
    canvas.width / canvas.height,
    1,
    9e99
  );
  camera.position.set(0, 50, 0);

  // set up orbit controls
  let controls = new THREE.OrbitControls(camera, renderer.domElement);

  // set up scene
  let scene = new THREE.Scene();
  scene.add(camera);

  // set up light and sky
  let ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

  let skyGeometry = new THREE.CubeGeometry(15000, 15000, 15000);
  let skyMaterial = (new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(
      './assets/ame_nebula/purplenebula_ft.png'
    ),
    side: THREE.DoubleSide
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(
      './assets/ame_nebula/purplenebula_bk.png'
    ),
    side: THREE.DoubleSide
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(
      './assets/ame_nebula/purplenebula_up.png'
    ),
    side: THREE.DoubleSide
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(
      './assets/ame_nebula/purplenebula_dn.png'
    ),
    side: THREE.DoubleSide
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(
      './assets/ame_nebula/purplenebula_rt.png'
    ),
    side: THREE.DoubleSide
  }),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(
      './assets/ame_nebula/purplenebula_lf.png'
    ),
    side: THREE.DoubleSide
  }));
  let skymat = new THREE.MeshFaceMaterial(skyMaterial);
  let skyBox = new THREE.Mesh(skyGeometry, skymat);
  scene.add(skyBox);

  // mixer
  let mixer = new THREE.AnimationMixer(scene);

  // set up object groups
  let sunGroup = await generateSun();
  scene.add(sunGroup);

  // store ship model
  let shipMaterials = await new Promise(resolve => {
    new THREE.MTLLoader().load('./assets/ship/ship.mtl', materials => {
      resolve(materials);
    });
  });

  shipMaterials.preload();

  ship = await new Promise(resolve => {
    new THREE.OBJLoader()
      .setMaterials(shipMaterials)
      .load('./assets/ship/ship.obj', object => {
        resolve(object);
      });
  });

  return { renderer, scene, camera, controls, mixer };
}

function run(elements, time) {
  let now = Date.now();
  let delta = now - time;
  time = now;

  requestAnimationFrame(function() {
    run(elements, time);
  });

  elements.scene.traverse(object => {
    if (typeof object.update === 'function') {
      object.update(
        delta,
        elements.scene,
        elements.camera,
        elements.status,
        elements.mixer
      );
    }
  });

  elements.renderer.render(elements.scene, elements.camera);
  elements.mixer.update(delta * 0.001);
  elements.controls.update();
}

$(document).ready(async () => {
  let canvas = document.getElementById('solar');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let elements = await setup(canvas);
  elements.status = {
    finished: true
  };
  let bodies = [];

  run(elements, Date.now());

  new Vue({
    el: '#ui',
    data() {
      return {
        bodies,
        body: {},
        trip: {},
        json: '',
        status: elements.status,
        bodyModalMode: 'add',
        initial: true,
        traveler: null
      };
    },
    methods: {
      showBodyModal() {
        $('#bodyModal').modal('show');
      },
      hideBodyModal() {
        $('#bodyModal').modal('hide');
      },
      showTripModal() {
        $('#tripModal').modal('show');
      },
      hideTripModal() {
        $('#tripModal').modal('hide');
      },
      async addBody() {
        if (this.json !== '') {
          let json = JSON.parse(this.json);
          for (let object of json) {
            let body = await generateBody(object, bodies);
            elements.scene.add(body);
          }
        } else {
          this.body.size = parseFloat(this.body.size);
          this.body.spinSpeed = parseFloat(this.body.spinSpeed);
          this.body.orbitalSpeed = parseFloat(this.body.orbitalSpeed);
          this.body.distanceFromOrbitCenter = parseFloat(
            this.body.distanceFromOrbitCenter
          );
          this.body.nSatellites = parseFloat(this.body.nSatellites);
          let body = await generateBody(this.body, bodies);
          elements.scene.add(body);
        }
        $('#bodyModal').modal('hide');
      },
      editBody() {
        $('#bodyModal').modal('hide');
      },
      deleteBody() {
        $('#bodyModal').modal('hide');
      },
      addTrip() {
        this.traveler = generateTraveler(
          this.bodies[this.trip.origin],
          this.bodies[this.trip.destination],
          ship,
          elements.scene,
          elements.camera
        );
        elements.scene.add(this.traveler);
        this.status.finished = false;
        this.initial = false;
        $('#tripModal').modal('hide');
      },
      globalView() {
        THREE.SceneUtils.detach(
          elements.camera,
          elements.camera.parent,
          elements.scene
        );
        elements.camera.position.set(0, 50, 0);
        elements.camera.lookAt(0, 0, 0);
      },
      shipViewRear() {
        if (elements.camera.parent instanceof THREE.Scene) {
          THREE.SceneUtils.attach(
            elements.camera,
            elements.scene,
            this.traveler
          );
        }
        elements.camera.position.set(0, 200, -600);
        elements.camera.lookAt(0, 0, 0);
      },
      shipViewTop() {
        if (elements.camera.parent instanceof THREE.Scene) {
          THREE.SceneUtils.attach(
            elements.camera,
            elements.scene,
            this.traveler
          );
        }
        elements.camera.position.set(0, 1000, 0);
        elements.camera.lookAt(0, 0, 0);
      }
    }
  });
});
