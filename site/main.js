import { calculateMetadata, metadata, COS_30 } from './metadata'
import * as materials from './materials'
import fullMap from '../full-map.json'
import * as THREE from 'three'
import { MapControls } from 'three/examples/jsm/controls/MapControls'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'

// ========== 常量、元数据 ==========

calculateMetadata();

/**
 * 对象类型：cluster六边形
 */
const OBJECT_TYPE_CLUSTER_HEXAGON = 0

/**
 * 对象类型：sector六边形
 */
const OBJECT_TYPE_SECTOR_HEXAGON = 1;

/**
 * 对象类型：sector六边形的面
 */
const OBJECT_TYPE_SECTOR_HEXAGON_PLANE = 3;

/**
 * 对象类型：sector名称
 */
const OBJECT_TYPE_SECTOR_NAME = 4;

// ========== 射线捡取 ==========

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(0, 0);
window.addEventListener('mousemove', function (e) {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

/**
 * @type {THREE.Object3D|undefined} 上一次鼠标选中的sector
 */
let lastIntersectSector;

// ========== 字体加载 ==========

const fontLoader = new FontLoader();
const font = await fontLoader.loadAsync('./Alibaba PuHuiTi_Regular.json');

// ========== 相机 ==========

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.position.set(0, 20000, 0);
camera.lookAt(0, 0, 0);

// ========== 渲染器 ==========

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ========== 地图控制 ==========

const controls = new MapControls(camera, renderer.domElement);
controls.screenSpacePanning = false;
controls.minDistance = 800;
controls.maxDistance = 20000;
controls.maxPolarAngle = Math.PI / 2;

// ========== 原始的场景搭建 ==========

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
  clusterRing.userData.type = OBJECT_TYPE_CLUSTER_HEXAGON;
  clusterRing.position.x = cluster.coordinate[0] * metadata.ORIGINAL_RESIZE_RATIO;
  clusterRing.position.y = cluster.coordinate[1] * metadata.ORIGINAL_RESIZE_RATIO;
  clusterRing.position.z = cluster.coordinate[2] * metadata.ORIGINAL_RESIZE_RATIO;

  const sectors = createSectorHexagon(cluster);
  for (const sector of sectors) {
    clusterRing.add(sector);
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

    const sector = new THREE.Object3D();
    sector.position.set(coordinate[0], coordinate[1], coordinate[2]);
    
    // 六边形的边
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
    ring.userData.type = OBJECT_TYPE_SECTOR_HEXAGON;
    convertToThreeJsPosition(ring);
    sector.add(ring);

    // 六边形的面
    let hexagonPlaneGeometry;
    if (sectorCenters.length === 1) {
      // 独占一个cluster的sector的半径和cluster一样大
      hexagonPlaneGeometry = new THREE.CircleGeometry(metadata.exclusiveSectorRadius, 6);
    } else {
      hexagonPlaneGeometry = new THREE.CircleGeometry(metadata.sectorRadius, 6);
    }
    hexagonPlaneGeometry.rotateX(Math.PI / 2);
    const circle = new THREE.Mesh(hexagonPlaneGeometry, materials.sectorPlane);
    circle.userData.type = OBJECT_TYPE_SECTOR_HEXAGON_PLANE;
    convertToThreeJsPosition(circle);
    sector.add(circle);

    // sector的名称
    const textGeometry = new TextGeometry(cluster.sectors[sectorIds[i]].name, {
      font: font,
      size: 160,
      height: 1,
    });
    textGeometry.rotateX(-Math.PI / 2); // TextGeometry默认是在XY平面上的，X4的游戏地图在XZ平面上
    const textObject = new THREE.Mesh(textGeometry, materials.sectorName);
    textObject.userData.type = OBJECT_TYPE_SECTOR_NAME;
    textObject.visible = false;
    sector.add(textObject);

    objects.push(sector);
  }
  return objects;
}

for (const clusterId in fullMap) {
  const cluster = fullMap[clusterId];
  const clusterRing = createClusterHexagon(cluster);
  convertToThreeJsPosition(clusterRing);
  scene.add(clusterRing);
}

// ========== 渲染循环 ==========

function animate () {
  requestAnimationFrame(animate);
  render();
}

/**
 * @param {THREE.Object3D} object 
 * @param {Number} type 
 * @param {THREE.Object3D|undefined}
 */
function findFirstChildWithType (object, type) {
  for (const child of object.children) {
    if (child.userData.type === type) {
      return child;
    }
  }
  return undefined;
}

function render () {
  // 处理射线捡取
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  let currentIntersectSector;
  for (let i = 0; i < intersects.length; i++) {
    const object = intersects[i].object;
    if (object.userData.type === OBJECT_TYPE_SECTOR_HEXAGON_PLANE) {
      currentIntersectSector = object.parent;
    }
  }
  
  if (currentIntersectSector) {
    // 鼠标与某个sector相交
    if (currentIntersectSector === lastIntersectSector) {
      // 还是同一个sector，什么都不需要做
    } else {
      // 不是同一个sector
      const currentIntersectSectorNameObject = currentIntersectSector.children.find(childObject => childObject.userData.type === OBJECT_TYPE_SECTOR_NAME);
      currentIntersectSectorNameObject.visible = true;
      if (lastIntersectSector) {
        // 鼠标移动到新的sector，隐藏上一个sector的名称
        const lastIntersectSectorNameObject = lastIntersectSector.children.find(childObject => childObject.userData.type === OBJECT_TYPE_SECTOR_NAME);
        lastIntersectSectorNameObject.visible = false;
      } else {
        // 从无到有，没有上一个sector名称可以隐藏
      }
      lastIntersectSector = currentIntersectSector;
    }
  } else {
    // 鼠标不与某个sector相交
    if (lastIntersectSector) {
      // 隐藏上一个sector的名称
      const lastIntersectSectorNameObject = lastIntersectSector.children.find(childObject => childObject.userData.type === OBJECT_TYPE_SECTOR_NAME);
      lastIntersectSectorNameObject.visible = false;
      lastIntersectSector = undefined;
    }
  }

  // 更新当前鼠标所指星区的名称大小，使得星区名称不管距离相机多远，其视觉上的大小始终保持不变
  // 同时，使星区名称尽可能正对相机
  if (lastIntersectSector) {
    // 星区名称有6个可能的位置，每个位置对应六边形的一条边
    let possibleLocations = [
      {
        vector: new THREE.Vector3(0, 0, -metadata.clusterRadius), // 位置1：正上方
        rotation: 0,
      },
      {
        vector: new THREE.Vector3(0, 0, -metadata.clusterRadius).applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 3), // 位置2：右上
        rotation: Math.PI / 3,
      },
      {
        vector: new THREE.Vector3(0, 0, -metadata.clusterRadius).applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 3 * 2), // 位置3：右下
        rotation: Math.PI / 3 * 2,
      },
      {
        vector: new THREE.Vector3(0, 0, -metadata.clusterRadius).applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI), // 位置4：正下方
        rotation: Math.PI,
      },
      {
        vector: new THREE.Vector3(0, 0, -metadata.clusterRadius).applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 3 * 4), // 位置5：左下
        rotation: Math.PI / 3 * 4,
      },
      {
        vector: new THREE.Vector3(0, 0, -metadata.clusterRadius).applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 3 * 5), // 位置6：左上
        rotation: Math.PI / 3 * 5,
      }
    ];
    // 遍历每一个可能的位置，找到最正对摄像机的那一个
    const sectorPosition = new THREE.Vector2(lastIntersectSector.position.x, lastIntersectSector.position.z);
    const cameraPosition = new THREE.Vector2(camera.position.x, camera.position.z);
    const vector0 = new THREE.Vector2().subVectors(sectorPosition, cameraPosition).normalize(); // 从相机到星区中心的向量
    let maxCosIndex = 0, maxCos = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < possibleLocations.length; ++i) {
      const possibleLocation = possibleLocations[i];
      const vector1 = new THREE.Vector2(possibleLocation.vector.x, possibleLocation.vector.z).normalize(); // 从星区中心到可能位置的向量
      const cos = vector0.x * vector1.x + vector0.y * vector1.y; // 计算两个向量夹角的cos值，这个值越大，就意味着这个位置越正对摄像机
      if (cos > maxCos) {
        maxCosIndex = i;
        maxCos = cos;
      }
    }
    const bestLocation = possibleLocations[maxCosIndex].vector;
    // 找到星区名称对象，设置新的位置
    const sectorNameObject = findFirstChildWithType(lastIntersectSector, OBJECT_TYPE_SECTOR_NAME);
    sectorNameObject.position.set(bestLocation.x, bestLocation.y, bestLocation.z);
    sectorNameObject.rotateY(possibleLocations[maxCosIndex].rotation);
    // 根据新的位置计算scale
    const sectorNameObjectWorldPosition = new THREE.Vector3();
    sectorNameObject.getWorldPosition(sectorNameObjectWorldPosition);
    const cameraWorldPosition = new THREE.Vector3();
    camera.getWorldPosition(cameraWorldPosition);
    const textScale = sectorNameObjectWorldPosition.distanceTo(cameraWorldPosition) / 10000;
    sectorNameObject.scale.set(textScale, textScale, textScale);
  }

  renderer.render(scene, camera);
}

animate();
