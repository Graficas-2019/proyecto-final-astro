/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SceneUtils = {
  createMultiMaterialObject: function(geometry, materials) {
    let group = new THREE.Group();

    for (let i = 0, l = materials.length; i < l; i++) {
      group.add(new THREE.Mesh(geometry, materials[i]));
    }

    return group;
  },

  detach: function(child, parent, scene) {
    child.applyMatrix(parent.matrixWorld);
    parent.remove(child);
    scene.add(child);
  },

  attach: function(child, scene, parent) {
    child.applyMatrix(new THREE.Matrix4().getInverse(parent.matrixWorld));

    scene.remove(child);
    parent.add(child);
  }
};
