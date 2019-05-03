class Astro extends THREE.Group {

  constructor(name,radius, spinPeriod, orbitalPeriod, orbitalRadius, texturePath, hasRings = false,isMoon=false, hasLight = false,ringTexture="") {
    super();
    this.name=name;
    this.radius = radius;
    this.spinPeriod = spinPeriod;
    this.orbitalPeriod = orbitalPeriod;
    this.orbitalRadius = orbitalRadius;
    this.texturePath = texturePath;
    this.hasRings = hasRings;
    this.hasLight = hasLight;
    this.ringTexture=ringTexture;
    this.isMoon=isMoon;
    this.distance=(orbitalRadius-150)/300;
    if(isMoon)
    {
      this.orbitalPeriod=(Math.random()*(11)+6);
    }

    this._generateMaterial();
    this._generateGeometry();
    this._buildObject();
    
    this._buildAndAddRings();

    this.add(this.astro);
    this.orbitersGroup = new THREE.Group();
    this.add(this.orbitersGroup);
  }

  _generateMaterial() {
    const texture = new THREE.TextureLoader().load(this.texturePath);
    if (this.hasLight) {
      this.material = new THREE.MeshBasicMaterial({map: texture});
    }
    else {
      this.material = new THREE.MeshPhongMaterial({ color: 0xffffff, map: texture, side: THREE.DoubleSide });
    }
  }

  _generateGeometry() {
    this.geometry = new THREE.SphereGeometry(this.radius, 100, 100);
  }

  _buildObject() {
    this.astro = new THREE.Mesh(this.geometry, this.material);
    if (this.hasLight) {
      this.light = new THREE.PointLight(0xffffff, 1, 0);
      this.astro.add(this.light);
    }
  }

  /*_buildAndAddRings() {
    if (this.hasRings!=0) {
      console.log(this.hasRings)
      const ringT = new THREE.TextureLoader().load(this.ringTexture);
      ringT.wrapS = THREE.RepeatWrapping;
      const inner = this.radius + 1;
      const outer = this.radius + 5;
      const geometry = new THREE.RingGeometry(inner, outer, 32);
      const material = new THREE.MeshPhongMaterial({color: 0xffffff,map:ringT, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(geometry, material);
      ring.rotateX(º2r(70));
      
      this.astro.add(ring);
    }
  }*/

  _buildAndAddRings() {
    if (this.hasRings!=0) {
    const inner = this.radius + 10;
    const outer = this.radius + 40;
    const geometry = new THREE.RingGeometry(inner, outer, 100);

    const faces = geometry.faces;
    const vertices = geometry.vertices;
    const vertexNames = ["a", "b", "c"];

    const uvs = [];

    const fullAngle = Math.PI * 2;

    for (let i = 0; i < faces.length; i++) {

      const face = faces[i];
      const subUVs = [];
      for (let vertexName of vertexNames) {
        const currentVertex = vertices[face[vertexName]];
        let theta = Math.atan2(currentVertex.y, currentVertex.x);
        if (theta < 0) {
          theta = Math.PI - theta;
        }
        const r = (Math.sqrt(currentVertex.x ** 2 + currentVertex.y ** 2) - inner) / (outer - inner);
        subUVs.push(new THREE.Vector2(r, theta / fullAngle));
      }

      uvs.push(subUVs);
    }

    geometry.faceVertexUvs[0] = uvs;
    geometry.faceVertexUvs[1] = uvs;
    geometry.uvsNeedUpdate = true;
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(`/src/textures/ring1.jpg`);
    texture.mapping = THREE.SphericalReflectionMapping;
    const transparency = textureLoader.load(`/src/textures/ring1t.gif`);
    const material = new THREE.MeshPhongMaterial({ map: texture, alphaMap: transparency, side: THREE.DoubleSide });
    material.transparent = true;
    const rings = new THREE.Mesh(geometry, material);
    rings.castShadow = true;
    rings.receiveShadow = true;
    rings.rotateX(º2r(90));
    this.astro.add(rings);
  }
}


  _buildOrbitObject(astro) {
    const geometry = new THREE.TorusGeometry(astro.orbitalRadius, 0.1, 26, 100);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const ring = new THREE.Line(geometry, material);
    ring.rotateX(º2r(90));
    if(!astro.isMoon)
    {
      //this.add(ring);
    }
    else{
      console.log("is moon");
    }
  }

  addOrbiter(astro) {
    this._buildOrbitObject(astro);
    const group = new THREE.Group();
    group.add(astro);
    astro.position.set(astro.orbitalRadius || 0, 0, 0);
    this.orbitersGroup.add(group);
  }

  addMoon(astro) {
    console.log("inserting moon")
    this._buildOrbitObject(astro);
    const group = new THREE.Group();
    group.add(astro);
    astro.position.set(astro.orbitalRadius || (Math.random()*(5)+1)-(.5), (Math.random()*(5)+1)-(.5), 0);
    this.orbitersGroup.add(group);
  }
  getDistance()
  {
    return this.orbitalRadius;
  }


  animationLoop(_, timeDifference) {
    if (this.spinPeriod != 0) {
      this.astro.rotateY(timeDifference / 1000 / this.spinPeriod * 2 * Math.PI);
    }
    for (let orbiter of this.orbitersGroup.children) {
      if (orbiter.children[0].orbitalPeriod) {
        orbiter.rotateY(timeDifference / 1000 / orbiter.children[0].orbitalPeriod * 2 * Math.PI);
      }
      orbiter.children[0].animationLoop(...arguments);
    }
  }
}