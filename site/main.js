import { calculateMetadata, metadata, COS_30 } from './metadata'
import * as materials from './materials'
import fullMap from '../full-map.json'
import * as THREE from 'three'
import { MapControls } from 'three/examples/jsm/controls/MapControls'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'

calculateMetadata();

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(0, 0);
window.addEventListener('mousemove', function (e) {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

const fontLoader = new FontLoader();
const font = await fontLoader.loadAsync('./Alibaba PuHuiTi_Regular.json');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.position.set(0, 20000, 0);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new MapControls(camera, renderer.domElement);
controls.screenSpacePanning = false;
controls.minDistance = 800;
controls.maxDistance = 20000;
controls.maxPolarAngle = Math.PI / 2;

const scene = new THREE.Scene();
const axesHelper = new THREE.AxesHelper(5000);
axesHelper.position.set(metadata.mapMinX - 2 * metadata.clusterRadius, 0, -(metadata.mapMaxZ + 2 * metadata.clusterRadius));
scene.add(axesHelper);

function convertToThreeJsPosition (mesh) {
  mesh.position.z = -mesh.position.z;
}

function createMapBorderBox () {
  const points = [
    new THREE.Vector3(metadata.mapMinX - 2 * metadata.clusterRadius, 0, -(metadata.mapMinZ - 2 * metadata.clusterRadius)),
    new THREE.Vector3(metadata.mapMinX - 2 * metadata.clusterRadius, 0, -(metadata.mapMaxZ + 2 * metadata.clusterRadius)),
    new THREE.Vector3(metadata.mapMaxX + 2 * metadata.clusterRadius, 0, -(metadata.mapMaxZ + 2 * metadata.clusterRadius)),
    new THREE.Vector3(metadata.mapMaxX + 2 * metadata.clusterRadius, 0, -(metadata.mapMinZ - 2 * metadata.clusterRadius))
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const lineLoop = new THREE.LineLoop(geometry, materials.mapBorderBox);
  return lineLoop;
}

function createClusterHexagon (cluster) {
  const geometry = new THREE.RingGeometry(
    metadata.clusterRadius * 46 / 50,
    metadata.clusterRadius,
    6, 1
  );
  geometry.rotateX(Math.PI / 2); // THREE的RingGeometry是在XY平面上的，X4的游戏地图在XZ平面上
  const clusterRing = new THREE.Mesh(geometry, materials.cluster);
  clusterRing.position.x = cluster.coordinate[0] * metadata.ORIGINAL_RESIZE_RATIO;
  clusterRing.position.y = cluster.coordinate[1] * metadata.ORIGINAL_RESIZE_RATIO;
  clusterRing.position.z = cluster.coordinate[2] * metadata.ORIGINAL_RESIZE_RATIO;

  const sectorRings = createSectorHexagon(cluster);
  for (const sectorRing of sectorRings) {
    clusterRing.add(sectorRing);
  }

  return clusterRing;
}

function createSectorHexagon(cluster) {
  const sectorIds = [];
  for (const sectorId in cluster.sectors) {
    sectorIds.push(sectorId);
  }

  // sectorIds中的每一个sector的本地坐标
  const sectorCenters = [];
  // 处理3种含有不同sector个数的cluster
  if (sectorIds.length == 1) {
    // 独占cluster的sector
    sectorCenters.push([0, 0, 0]);
  } else if (sectorIds.length == 2) {
    const z0 = cluster.sectors[sectorIds[0]].coordinate[2], z1 = cluster.sectors[sectorIds[1]].coordinate[2];
    const x0 = cluster.sectors[sectorIds[0]].coordinate[0], x1 = cluster.sectors[sectorIds[1]].coordinate[0];
    const slope = (z1 - z0) / (x1 - x0);
    const xLeft = -metadata.clusterRadius / 4;
    const xRight = -xLeft;
    const zTop = COS_30 * metadata.clusterRadius / 2;
    const zBottom = -zTop;
    if (slope >= 0) {
      // 如果斜率大于0（或等于0），那么X小的在左下角，X大的在右上角
      if (x0 <= x1) {
        // 点0在左下角，点1在右上角
        sectorCenters.push(
          [xLeft, 0, zBottom],
          [xRight, 0, zTop],
        );
      } else {
        // 点0在右上角，点1在左下角
        sectorCenters.push(
          [xRight, 0, zTop],
          [xLeft, 0, zBottom],
        );
      }
    } else {
      // 如果斜率小于0，那么X小的在左上角，X大的在右下角
      if (x0 <= x1) {
        // 点0在左上角，点1在右下角
        sectorCenters.push(
          [xLeft, 0, zTop],
          [xRight, 0, zBottom],
        );
      } else {
        // 点0在右下角，点1在左上角
        sectorCenters.push(
          [xRight, 0, zBottom],
          [xLeft, 0, zTop],
        );
      }
    }
  } else if (sectorIds.length == 3) {
    // 先按Z的大小从小到大排序
    sectorIds.sort((a, b) => cluster.sectors[a].coordinate[2] - cluster.sectors[b].coordinate[2]);
    // 计算三个点的Z坐标（相对于cluster中心，即大六边形的中心）
    const z0 = -COS_30 * metadata.clusterRadius / 2;
    const z1 = 0;
    const z2 = -z0;
    let x0, x1, x2;
    // 判断中间这个点在左侧还是在右侧
    const middleX = (cluster.sectors[sectorIds[0]].coordinate[0] + cluster.sectors[sectorIds[2]].coordinate[0]) / 2;
    if (cluster.sectors[sectorIds[1]].coordinate[0] > middleX) {
      // 中间这个点在右侧
      x0 = -metadata.clusterRadius / 4;
      x1 = metadata.clusterRadius / 2;
      x2 = x0;
    } else {
      // 中间这个点在左侧
      x0 = metadata.clusterRadius / 4;
      x1 = -metadata.clusterRadius / 2;
      x2 = x0;
    }
    sectorCenters.push(
      [x0, 0, z0],
      [x1, 0, z1],
      [x2, 0, z2],
    );
  } else {
    throw new Error('Unsuppoeted sector amount: ' + sectorIds.length);
  }

  const objects = [];
  for (let i = 0; i < sectorCenters.length; ++i) {
    const coordinate = sectorCenters[i];
    let geometry;
    if (sectorCenters.length === 1) {
      // 独占一个cluster的sector的半径和cluster一样大
      geometry = new THREE.RingGeometry(
        metadata.exclusiveSectorRadius * 46 / 50,
        metadata.exclusiveSectorRadius,
        6, 1
      );
    } else {
      geometry = new THREE.RingGeometry(
        metadata.sectorRadius * 46 / 50,
        metadata.sectorRadius,
        6, 1
      );
    }
    geometry.rotateX(Math.PI / 2); // THREE的RingGeometry是在XY平面上的，X4的游戏地图在XZ平面上
    const ring = new THREE.Mesh(geometry, materials.cluster);
    ring.position.set(coordinate[0], coordinate[1], coordinate[2]);

    // sector的名称
    const textGeometry = new TextGeometry(cluster.sectors[sectorIds[i]].name, {
      font: font,
      size: 160,
      height: 1,
    });
    textGeometry.rotateX(-Math.PI / 2); // TextGeometry默认是在XY平面上的，X4的游戏地图在XZ平面上
    const textObject = new THREE.Mesh(textGeometry, materials.sectorName);
    ring.add(textObject);

    convertToThreeJsPosition(ring);
    objects.push(ring);
  }
  return objects;
}

for (const clusterId in fullMap) {
  const cluster = fullMap[clusterId];
  const clusterRing = createClusterHexagon(cluster);
  convertToThreeJsPosition(clusterRing);
  scene.add(clusterRing);
}

function animate () {
  requestAnimationFrame(animate);
  render();
}

function render () {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  for (let i = 0; i < intersects.length; i++) {
		intersects[i].object.material.color.set(0xff0000);
	}
  renderer.render(scene, camera);
}

animate();
