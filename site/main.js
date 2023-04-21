import { calculateMetadata, metadata } from './metadata'
import * as materials from './materials'
import fullMap from '../full-map.json'
import * as THREE from 'three'

calculateMetadata();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.position.set(0, 30000, 0);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

function createMapBorderBox () {
  const points = [
    new THREE.Vector3(metadata.mapMinX, 0, metadata.mapMinZ),
    new THREE.Vector3(metadata.mapMinX, 0, metadata.mapMaxZ),
    new THREE.Vector3(metadata.mapMaxX, 0, metadata.mapMaxZ),
    new THREE.Vector3(metadata.mapMaxX, 0, metadata.mapMinZ)
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const lineLoop = new THREE.LineLoop(geometry, materials.mapBorderBox);
  return lineLoop;
}

function createClusterHexagon (cluster) {
  const geometry = new THREE.RingGeometry(
    metadata.clusterRadius * 46 / 50,
    metadata.clusterRadius,
    6, 1,
    0, Math.PI * 2
  );
  const ring = new THREE.Mesh(geometry, materials.cluster);
  ring.position.x = cluster.coordinate[0] * metadata.ORIGINAL_RESIZE_RATIO;
  ring.position.y = cluster.coordinate[1] * metadata.ORIGINAL_RESIZE_RATIO;
  ring.position.z = cluster.coordinate[2] * metadata.ORIGINAL_RESIZE_RATIO;
  ring.rotateX(Math.PI / 2);
  return ring;
}

scene.add(createMapBorderBox());

for (const clusterId in fullMap) {
  const cluster = fullMap[clusterId];
  scene.add(createClusterHexagon(cluster));
}

renderer.render(scene, camera);
