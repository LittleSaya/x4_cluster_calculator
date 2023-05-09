/**
 * 该类型提供展示地图、操作地图、摆放工厂、配置工厂、导出工厂数据的功能
 */

import { ClusterId, ClusterDef, SectorDef, SectorId } from './util/map_data_parser'
import { MapMetadata, CLUSTER_RING_WIDTH, SECTOR1_RING_WIDTH, SECTOR2_RING_WIDTH, SECTOR3_RING_WIDTH, RAW_RESIZE_RATIO } from './util/MapMetadata'
import * as materials from './App3D/materials'
import { WebGLRenderer, Scene, PerspectiveCamera, Vector3, RingGeometry, CircleGeometry, Object3D, Mesh } from 'three'
import { MapControls } from 'three/examples/jsm/controls/MapControls'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader'

const CAMERA_FOV = 75;
const CAMERA_NEAR = 100;
const CAMERA_FAR = 100000;
const CAMERA_INIT_POS = new Vector3(0, 20000, 0);

/**
 * 场景中的对象类型，缩进代表了对象的上下级关系
 */
enum ObjectUserDataType {
  Cluster,
  /* */ ClusterHexagonEdge,
  /* */ Sector,
  /*       */ SectorHexagonEdge,
  /*       */ SectorHexagonPlane,
  /*       */ SectorName,
};

/**
 * Three.js对象中的userData属性中存储的数据
 */
type ObjectUserData = {
  type: ObjectUserDataType.Cluster,
  ownership: string,
} | {
  type: ObjectUserDataType.Sector,
  ownership: string,
  name: string,
} | {
  type: ObjectUserDataType.ClusterHexagonEdge |
  ObjectUserDataType.SectorHexagonEdge |
  ObjectUserDataType.SectorHexagonPlane |
  ObjectUserDataType.SectorName
}

/**
 * Renderer、Scene、Camera及其他辅助对象的集合
 */
class ThreeContext {

  renderer: WebGLRenderer;

  scene: Scene;

  camera: PerspectiveCamera;

  mapControls: MapControls;

  font: Font|undefined;

  /**
   * 构造一个预先配置好的集合
   */
  constructor () {
    const renderer = new WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer = renderer;

    const scene = new Scene();
    this.scene = scene;

    const camera = new PerspectiveCamera(CAMERA_FOV, window.innerWidth / window.innerHeight, CAMERA_NEAR, CAMERA_FAR);
    camera.position.set(CAMERA_INIT_POS.x, CAMERA_INIT_POS.y, CAMERA_INIT_POS.z);
    camera.up = new Vector3(0, 0, 1); // 将Z轴正方向作为相机的上方，与游戏内的地图保持一致
    camera.lookAt(0, 0, 0);
    this.camera = camera;

    const controls = new MapControls(camera, renderer.domElement);
    controls.screenSpacePanning = false;
    controls.minDistance = CAMERA_NEAR;
    controls.maxDistance = CAMERA_FAR;
    controls.maxPolarAngle = Math.PI / 2;
    this.mapControls = controls;

    this.font = undefined;
  }

  async loadFont (): Promise<void> {
    if (this.font) {
      return;
    }
    const fontLoader = new FontLoader();
    this.font = await fontLoader.loadAsync('/assets/Alibaba PuHuiTi_Regular.json');
  }
}

/**
 * 管理3D场景，提供与场景交互的功能，管理工厂的数据
 */
export class App3D {

  galaxyMap: Map<ClusterId, ClusterDef>;

  threeContext: ThreeContext;

  mapMetaData: MapMetadata;

  boundRenderLoop: (time: number) => void;

  /**
   * @param galaxyMap 游戏地图数据
   * @param threeContext Three.js对象集合，其中所有对象都应该已经初始化完成
   */
  constructor (galaxyMap: Map<ClusterId, ClusterDef>) {
    this.galaxyMap = galaxyMap;
    this.threeContext = new ThreeContext();
    this.mapMetaData = new MapMetadata(galaxyMap);
    this.boundRenderLoop = this.renderLoop.bind(this);
  }

  async loadAssets (): Promise<void> {
    await this.threeContext.loadFont();
  }

  getCanvas (): HTMLCanvasElement {
    return this.threeContext.renderer.domElement;
  }

  renderLoop (time: number): void {
    this.render(time);
    requestAnimationFrame(this.boundRenderLoop);
  }

  render (time: number): void {

  }

  /**
   * 初始化场景（只有地图、没有工厂的场景）
   */
  initializeScene (): void {
    this.threeContext.scene.clear();

    // 创建几何体，几何体是共享的
    // cluster的六边形的环
    const clusterRingGeometry = new RingGeometry(
      this.mapMetaData.clusterRadius - CLUSTER_RING_WIDTH,
      this.mapMetaData.clusterRadius,
      6,
      1
    );
    clusterRingGeometry.rotateX(Math.PI / 2);

    // 只有一个sector的cluster中的sector的六边形的环
    const sector1RingGeometry = new RingGeometry(
      this.mapMetaData.sectorRadius1 - SECTOR1_RING_WIDTH,
      this.mapMetaData.sectorRadius1,
      6,
      1
    );
    sector1RingGeometry.rotateX(Math.PI / 2);

    // 只有一个sector的cluster中的sector的六边形的面
    const sector1PlaneGeometry = new CircleGeometry(this.mapMetaData.sectorRadius1, 6);
    sector1PlaneGeometry.rotateX(Math.PI / 2);

    // 有两个sector的cluster中的sector的六边形的环
    const sector2RingGeometry = new RingGeometry(
      this.mapMetaData.sectorRadius2 - SECTOR2_RING_WIDTH,
      this.mapMetaData.sectorRadius2,
      6,
      1
    );
    sector2RingGeometry.rotateX(Math.PI / 2);

    // 有两个sector的cluster中的sector的六边形的面
    const sector2PlaneGeometry = new CircleGeometry(this.mapMetaData.sectorRadius2, 6);
    sector2PlaneGeometry.rotateX(Math.PI / 2);

    // 有三个sector的cluster中的sector的六边形的环
    const sector3RingGeometry = new RingGeometry(
      this.mapMetaData.sectorRadius3 - SECTOR3_RING_WIDTH,
      this.mapMetaData.sectorRadius3,
      6,
      1
    );
    sector3RingGeometry.rotateX(Math.PI / 2);

    // 有三个sector的cluster中的sector的六边形的面
    const sector3PlaneGeometry = new CircleGeometry(this.mapMetaData.sectorRadius3, 6);
    sector3PlaneGeometry.rotateX(Math.PI / 2);

    this.galaxyMap.forEach((clusterDef, clusterId) => {
      const cluster = new Object3D();
      const clusterCoordinate = clusterDef.coordinate.clone().multiplyScalar(RAW_RESIZE_RATIO);
      cluster.position.copy(clusterCoordinate);
      const clusterUserData: ObjectUserData = {
        type: ObjectUserDataType.Cluster,
        ownership: clusterDef.ownership,
      };
      cluster.userData = clusterUserData;
      this.threeContext.scene.add(cluster);

      const clusterHexagonEdge = new Mesh(clusterRingGeometry, materials.clusterHexagonEdge[clusterDef.ownership]);
      const clusterHexagonEdgeUserData: ObjectUserData = {
        type: ObjectUserDataType.ClusterHexagonEdge,
      };
      clusterHexagonEdge.userData = clusterHexagonEdgeUserData;
      cluster.add(clusterHexagonEdge);

      // 第一次只添加sector对象和sector名称，并且保留sector的原始坐标
      let sectorCount = 0;
      clusterDef.sectors.forEach((sectorDef, sectorId) => {
        const sector = new Object3D();
        const sectorCoordinate = sectorDef.coordinate.clone();
        sector.position.copy(sectorCoordinate);
        const sectorUserData: ObjectUserData = {
          type: ObjectUserDataType.Sector,
          ownership: sectorDef.ownership,
          name: sectorDef.name,
        };
        sector.userData = sectorUserData;
        cluster.add(sector);

        if (this.threeContext.font === undefined) {
          throw new Error(`${App3D.name}.${this.initializeScene.name} requires threeContext.font been initialized first`);
        }
        const sectorNameGeometry = new TextGeometry(sectorDef.name, {
          font: this.threeContext.font,
          size: 160,
          height: 1,
        });
        sectorNameGeometry.rotateX(Math.PI / 2);
        // 计算bounding box，移动文字几何体的位置，使得文字能够居中显示
        sectorNameGeometry.computeBoundingBox();
        const textCenter = new Vector3();
        sectorNameGeometry.boundingBox!.getCenter(textCenter);
        sectorNameGeometry.translate(-textCenter.x, 0, -textCenter.z);
        const sectorName = new Mesh(sectorNameGeometry, materials.sectorName);
        const sectorNameUserData: ObjectUserData = {
          type: ObjectUserDataType.SectorName,
        };
        sectorName.userData = sectorNameUserData;
        sector.add(sectorName);

        ++sectorCount;
      });

      // 根据sectorCount的值，再补充sector的边和面
      for (const child of cluster.children) {
        const userData = child.userData as ObjectUserData;
        if (userData.type !== ObjectUserDataType.Sector) {
          continue;
        }
        const sector = child;

        let sectorHexagonEdge: Mesh, sectorHexagonPlane: Mesh;
        if (sectorCount === 1) {
          sectorHexagonEdge = new Mesh(sector1RingGeometry, materials.sectorHexagonEdge[userData.ownership]).rotateX(Math.PI / 2);
          sectorHexagonPlane = new Mesh(sector1PlaneGeometry, materials.sectorHexagonPlane[userData.ownership]).rotateX(Math.PI / 2);
        } else if (sectorCount === 2) {
          sectorHexagonEdge = new Mesh(sector2RingGeometry, materials.sectorHexagonEdge[userData.ownership]).rotateX(Math.PI / 2);
          sectorHexagonPlane = new Mesh(sector2PlaneGeometry, materials.sectorHexagonPlane[userData.ownership]).rotateX(Math.PI / 2);
        } else if (sectorCount === 3) {
          sectorHexagonEdge = new Mesh(sector3RingGeometry, materials.sectorHexagonEdge[userData.ownership]).rotateX(Math.PI / 2);
          sectorHexagonPlane = new Mesh(sector3PlaneGeometry, materials.sectorHexagonPlane[userData.ownership]).rotateX(Math.PI / 2);
        } else {
          throw new Error(`${App3D.name}.${this.initializeScene.name} requires a cluster has 1~3 sectors, but ${clusterId} has ${sectorCount} sectors`);
        }
        sector.add(sectorHexagonEdge, sectorHexagonPlane);
      }

      // 根据sector原始坐标之间的相对位置，重新设置sector的坐标，使得每一个sector都位于地图上的正确位置

    });
  }
};
