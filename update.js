function updateBody(spinSpeed, delta) {
  this.rotation.y -= (2 * Math.PI * spinSpeed * delta) / (360 * 100);
}

function updateBodyGroup(orbitalSpeed, delta) {
  this.rotation.y += (2 * Math.PI * orbitalSpeed * delta) / (360 * 100);
}

function updateTraveler(destination, delta, scene, camera, status, mixer) {
  let direction = new THREE.Vector3();
  destination.children[0].getWorldPosition(direction);
  direction.sub(this.position);

  let distanceToDestination = direction.length();

  direction.divideScalar(distanceToDestination);

  let diff = new THREE.Vector3();
  diff.subVectors(
    direction.normalize(),
    new THREE.Vector3().copy(this.direction).normalize()
  );
  let angle = this.direction.angleTo(direction);
  console.log(angle);

  if (!this.inclined) {
    if (diff.y > 0.01) {
      this.goUp(mixer);
      this.inclined = true;
      this.inclinedUp = true;
    } else if (diff.y < -0.01) {
      this.goDown(mixer);
      this.inclined = true;
      this.inclinedDown = true;
    } else if (angle > 0.01) {
      this.goLeft(mixer);
      this.inclined = true;
      this.inclinedLeft = true;
    } else if (angle < -0.01) {
      this.goRight(mixer);
      this.inclined = true;
      this.inclinedRight = true;
    } else {
      this.lookAt(new THREE.Vector3().copy(this.position).add(direction));
    }
  } else {
    if (Math.abs(diff.y) < 0.01 && this.inclinedUp) {
      this.goDown(mixer);
      this.inclinedUp = false;
      this.inclined = false;
    } else if (Math.abs(diff.y) < 0.01 && this.inclinedDown) {
      this.goUp(mixer);
      this.inclinedDown = false;
      this.inclined = false;
    } else if (Math.abs(angle) < 0.01 && this.inclinedLeft) {
      this.goRight(mixer);
      this.inclinedLeft = false;
      this.inclined = false;
    } else if (Math.abs(angle) < 0.01 && this.inclinedRight) {
      this.goLeft(mixer);
      this.inclinedRight = false;
      this.inclined = false;
    } else {
      this.lookAt(new THREE.Vector3().copy(this.position).add(direction));
    }
  }

  if (
    distanceToDestination > 1 &&
    distanceToDestination > this.distanceToDestination
  ) {
    this.speed += 0.01;
  }
  if (
    distanceToDestination <
    destination.children[0].geometry.boundingSphere.radius + 0.1
  ) {
    THREE.SceneUtils.detach(camera, camera.parent, scene);
    camera.position.set(0, 50, 0);
    camera.lookAt(0, 0, 0);
    status.finished = true;
    this.parent.remove(this);
  }
  this.distanceToDestination = distanceToDestination;

  let avoidingVector = new THREE.Vector3();
  this.raycaster.set(this.position, direction);
  let intersects = this.raycaster.intersectObjects(scene.children, true);
  let body = intersects.find(intersect => {
    return !(intersect.object instanceof THREE.Line);
  });
  if (body && body.object.parent.name !== destination.name) {
    let bodyPosition = new THREE.Vector3();
    body.object.getWorldPosition(bodyPosition);
    let vectorToBodyCenter = new THREE.Vector3();
    vectorToBodyCenter.subVectors(bodyPosition, this.position);
    avoidingVector.copy(vectorToBodyCenter);

    avoidingVector.projectOnVector(direction);
    avoidingVector.sub(vectorToBodyCenter);
    if (avoidingVector.length() < 0.001) {
      let rand1 = Math.random();
      let rand2 = Math.random();
      let component =
        (rand1 * direction.x + rand2 * direction.y) / -direction.z;
      if (!isFinite(component)) {
        component = (rand1 * direction.x + rand2 * direction.z) / -direction.y;
        if (!isFinite(component)) {
          component =
            (rand1 * direction.y + rand2 * direction.z) / -direction.x;
          avoidingVector = new THREE.Vector3(rand1, rand2, component);
        } else {
          avoidingVector = new THREE.Vector3(rand1, component, rand2);
        }
      } else {
        avoidingVector = new THREE.Vector3(component, rand1, rand2);
      }
    }
    avoidingVector.normalize();
    avoidingVector.multiplyScalar(0.1);
  }

  direction.multiplyScalar(this.speed);
  direction.add(avoidingVector);
  this.position.add(direction);

  this.direction = direction;
}
