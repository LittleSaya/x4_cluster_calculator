import * as THREE from 'three'

export const mapBorderBox = new THREE.LineBasicMaterial({ color: 0x0000ff });

export const cluster = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.BackSide });

export const sectorPlane = new THREE.MeshBasicMaterial({ color: 0xBBBBBB, side: THREE.BackSide, transparent: true, opacity: 0.5 });

export const sectorName = new THREE.MeshBasicMaterial({ color: 0xBBBBBB });
