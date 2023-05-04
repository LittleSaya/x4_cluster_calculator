/**
 * 该类型提供展示地图、操作地图、摆放工厂、配置工厂、导出工厂数据的功能
 */

import { ClusterId, ClusterDef } from './map_data_parser'
import { WebGLRenderer, Scene, PerspectiveCamera, Vector3 } from 'three'
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
  type: ObjectUserDataType.Cluster | ObjectUserDataType.Sector,
  ownership: String,
} | {
  type: ObjectUserDataType.ClusterHexagonEdge | ObjectUserDataType.SectorHexagonEdge | ObjectUserDataType.SectorHexagonPlane | ObjectUserDataType.SectorName
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

  async loadFont () {
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

  /**
   * @param galaxyMap 游戏地图数据
   * @param threeContext Three.js对象集合，其中所有对象都应该已经初始化完成
   */
  constructor (galaxyMap: Map<ClusterId, ClusterDef>, threeContext: ThreeContext) {
    this.galaxyMap = galaxyMap;
    this.threeContext = threeContext;
  }

  /**
   * 初始化场景（只有地图、没有工厂的场景）
   */
  initializeScene () {
    this.threeContext.scene.clear();

    this.galaxyMap.forEach((clusterDef, clusterId) => {
    });
  }
};
