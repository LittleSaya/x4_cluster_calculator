import { Object3D } from 'three'

export function isChildOf (target: Object3D, parent: Object3D): Boolean {
  let temp = target.parent;
  while (temp && temp !== parent) {
    temp = temp.parent;
  }
  return temp === parent;
}
