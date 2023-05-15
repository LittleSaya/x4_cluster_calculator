import { Object3D, Scene } from 'three'

function traverseObject (
  obj: Object3D,
  callback: (obj: Object3D) => void
) {
  callback(obj);
  for (const child of obj.children) {
    traverseObject(child, callback);
  }
}

export function isChildOf (target: Object3D, parent: Object3D): Boolean {
  let temp = target.parent;
  while (temp && temp !== parent) {
    temp = temp.parent;
  }
  return temp === parent;
}

export function traverseScene (
  scene: Scene,
  callback: (obj: Object3D) => void
) {
  for (const rootObject of scene.children) {
    traverseObject(rootObject, callback);
  }
}

export function findAllObjectsSatisfy (
  scene: Scene,
  prediction: (obj: Object3D) => boolean
): Object3D[] {
  const satisfiedObjects: Object3D[] = [];
  traverseScene(scene, obj => {
    if (prediction(obj)) {
      satisfiedObjects.push(obj);
    }
  });
  return satisfiedObjects;
}
