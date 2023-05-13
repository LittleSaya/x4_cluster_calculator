/**
 * 该类型提供展示地图、操作地图、摆放工厂、配置工厂、导出工厂数据的功能
 */

import { ClusterId, ClusterDef, SectorDef, SectorId } from './util/map_data_parser'
import { MapMetadata, CLUSTER_RING_WIDTH, SECTOR1_RING_WIDTH, SECTOR2_RING_WIDTH, SECTOR3_RING_WIDTH, RAW_RESIZE_RATIO } from './util/MapMetadata'
import { COS_30 } from './util/math_constants'
import { isChildOf } from './App3D/scene_operation'
import * as materials from './App3D/materials'
import { FactoryData } from './types/FactoryData'
import {
  WebGLRenderer, Scene, PerspectiveCamera,
  RingGeometry, CircleGeometry, Object3D, Mesh, AxesHelper, BoxGeometry,
  Raycaster, Intersection,
  Vector3, Vector2,
} from 'three'
import { MapControls } from 'three/examples/jsm/controls/MapControls'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import GUI from 'lil-gui'

const CAMERA_FOV = 75;
const CAMERA_NEAR = 100;
const CAMERA_FAR = 100000;
const CAMERA_INIT_POS = new Vector3(0, -20000, -100);

const SECTOR_EDGE_Y_OFFSET = -20;
const SECTOR_PLANE_Y_OFFSET = -10;
const SECTOR_NAME_Y_OFFSET = -30;

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
  /*       */ Factory,
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

  /**
   * 星区的名称
   */
  name: string,

  /**
   * 缩放后的半径
  */
  radius: number,

  /**
   * 该星区内工厂方块的大小
   */
  factoryCubeSize: number,
} | {
  type: ObjectUserDataType.ClusterHexagonEdge |
  ObjectUserDataType.SectorHexagonEdge |
  ObjectUserDataType.SectorHexagonPlane |
  ObjectUserDataType.SectorName
} | {
  type: ObjectUserDataType.Factory,
  factory: FactoryData,
};

enum InputStatusType {
  None,
  MouseDown,
  Dragging,
};

type InputStatus = {
  type: InputStatusType.None | InputStatusType.MouseDown | InputStatusType.Dragging,
};

enum OperationMode {
  General,
  PutFactory,
  MoveFactory,
};

/**
 * Renderer、Scene、Camera及其他辅助对象的集合
 */
class ThreeContext {

  renderer: WebGLRenderer;

  scene: Scene;

  camera: PerspectiveCamera;

  mapControls: MapControls;

  raycaster: Raycaster;

  pointer: Vector2;

  /**
   * 原始的鼠标相对于窗口左上角的坐标
   */
  pointerRaw: Vector2;

  font: Font | undefined;

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
    camera.up = new Vector3(0, -1, 0);
    camera.lookAt(0, 0, 0);
    this.camera = camera;

    const controls = new MapControls(camera, renderer.domElement);
    controls.screenSpacePanning = false;
    controls.minDistance = CAMERA_NEAR;
    controls.maxDistance = CAMERA_FAR;
    controls.maxPolarAngle = Math.PI / 2;
    this.mapControls = controls;

    this.raycaster = new Raycaster();
    this.pointer = new Vector2();
    this.pointerRaw = new Vector2();

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
   * 在当前帧，鼠标与哪个sector相交
   */
  currentIntersectSector: Object3D | undefined;

  /**
   * 在当前帧，如果鼠标与某个sector相交的话，交点的坐标（相对于sector的坐标）
   */
  currentIntersectSectorPosition: Vector3 | undefined;

  /**
   * 在上一帧，鼠标与哪个sector相交
   */
  lastIntersectSector: Object3D | undefined;
  
  /**
   * DOM Events
   */
  eventQueue: Array<Event>;

  inputStatus: InputStatus;

  operationMode: OperationMode;

  guiObj: Object;

  gui: GUI;

  statusEl: HTMLElement;

  /**
   * 在当前帧，鼠标与哪个factory相交
   */
  currentIntersectFactory: Object3D | undefined;

  /**
   * 用于展示工厂名称的元素
   */
  factoryNameEl: HTMLElement;

  transformControls: TransformControls;

  isMouseOnTransformControls: Boolean;

  /**
   * @param galaxyMap 游戏地图数据
   * @param threeContext Three.js对象集合，其中所有对象都应该已经初始化完成
   */
  constructor (galaxyMap: Map<ClusterId, ClusterDef>) {
    this.galaxyMap = galaxyMap;
    this.threeContext = new ThreeContext();
    this.mapMetaData = new MapMetadata(galaxyMap);
    this.boundRenderLoop = this.renderLoop.bind(this);
    this.currentIntersectSector = undefined;
    this.lastIntersectSector = undefined;

    this.eventQueue = new Array<Event>();
    window.addEventListener('mousemove', ev => this.eventQueue.push(ev));
    window.addEventListener('mousedown', ev => this.eventQueue.push(ev));
    window.addEventListener('mouseup', ev => this.eventQueue.push(ev));
    this.inputStatus = { type: InputStatusType.None };

    this.operationMode = OperationMode.General;

    this.guiObj = {
      enterViewMode: () => {
        this.operationMode = OperationMode.General;
        this.setStatusText('当前模式：通用模式');
      },
      enterPutFactoryMode: () => {
        this.operationMode = OperationMode.PutFactory;
        this.setStatusText('当前模式：布局模式');
      },
    };
    this.gui = new GUI();
    this.gui.add(this.guiObj, 'enterViewMode');
    this.gui.add(this.guiObj, 'enterPutFactoryMode');

    const statusDiv = document.createElement('div');
    statusDiv.id = 'status';
    statusDiv.style.padding = '0 4px 0 4px';
    statusDiv.style.margin = '4px 0 4px 0';
    this.gui.$title.after(statusDiv);
    this.statusEl = statusDiv;
    this.setStatusText('当前模式：通用模式');

    this.currentIntersectFactory = undefined;

    const factoryNameDiv = document.createElement('div');
    factoryNameDiv.id = 'factoryName';
    factoryNameDiv.style.display = 'none';
    factoryNameDiv.style.position = 'fixed';
    factoryNameDiv.style.zIndex = '1';
    factoryNameDiv.style.padding = '0.25em 0.5em';
    factoryNameDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    factoryNameDiv.style.color = 'white';
    factoryNameDiv.innerText = '（工厂）';
    document.body.append(factoryNameDiv);
    this.factoryNameEl = factoryNameDiv;

    this.transformControls = new TransformControls(this.threeContext.camera, this.threeContext.renderer.domElement);
    this.transformControls.space = 'local';

    this.isMouseOnTransformControls = false;
  }

  async loadAssets (): Promise<void> {
    await this.threeContext.loadFont();
  }

  getCanvas (): HTMLCanvasElement {
    return this.threeContext.renderer.domElement;
  }

  setStatusText (text: string) {
    this.statusEl.innerText = text;
  }

  renderLoop (time: number): void {
    this.render(time);
    requestAnimationFrame(this.boundRenderLoop);
  }

  render (time: number): void {
    // 处理射线捡取
    this.threeContext.raycaster.setFromCamera(this.threeContext.pointer, this.threeContext.camera);
    const intersects = this.threeContext.raycaster.intersectObjects(this.threeContext.scene.children);

    this.updateIntersects(intersects);
    this.updateSectorName();
    this.updateFactoryName();

    this.processInput();

    this.threeContext.renderer.render(this.threeContext.scene, this.threeContext.camera);

    this.lastIntersectSector = this.currentIntersectSector;
  }

  updateIntersects (intersects: Intersection<Object3D>[]) {
    let currentIntersectSector: Object3D | undefined;
    let intersectPosition: Vector3 | undefined;
    let currentIntersectFactory: Object3D | undefined;
    let isMouseOnTransformControls = false;
    for (let i = 0; i < intersects.length; i++) {
      const object = intersects[i].object;
      const userData = object.userData as ObjectUserData;
      if (userData.type === ObjectUserDataType.SectorHexagonPlane) {
        // 处理与sector平面的相交
        if (!object.parent) {
          throw new Error('Sector plane should have parent');
        }
        currentIntersectSector = object.parent;
        // 将交点从世界坐标转换为相对于sector的坐标
        intersectPosition = object.parent.worldToLocal(intersects[i].point);
      } else if (userData.type === ObjectUserDataType.Factory) {
        // 处理与factory的相交
        currentIntersectFactory = object;
      }

      if (this.transformControls.visible &&
        !isMouseOnTransformControls &&
        (object instanceof Mesh) &&
        isChildOf(object, this.transformControls) &&
        (object.name === 'X' || object.name === 'Y' || object.name === 'Z' || object.name === 'XY' || object.name === 'YZ' || object.name === 'XZ' || object.name === 'XYZ')
      ) {
        // 在Transform Controls可见、并且尚未确认鼠标是否位于Transform Controls上时，如果现在鼠标所指的对象是一个Mesh并且是Transform Controls的子对象，并且对象有特定的名称，则认为鼠标位于Transform Controls之上
        isMouseOnTransformControls = true;
      }
    }
    this.currentIntersectSector = currentIntersectSector;
    this.currentIntersectSectorPosition = intersectPosition;
    this.currentIntersectFactory = currentIntersectFactory;
    this.isMouseOnTransformControls = isMouseOnTransformControls;
  }

  updateSectorName () {
    if (this.currentIntersectSector) {
      // 鼠标与某个sector相交
      if (this.currentIntersectSector === this.lastIntersectSector) {
        // 还是同一个sector，什么都不需要做
      } else {
        // 不是同一个sector，显示当前sector的名称
        const currentIntersectSectorNameObject = this.currentIntersectSector.children.find(childObject => (childObject.userData as ObjectUserData).type === ObjectUserDataType.SectorName);
        if (!currentIntersectSectorNameObject) {
          throw new Error('Sector should have sector name (current intersect sector)');
        }
        currentIntersectSectorNameObject.visible = true;
        if (this.lastIntersectSector) {
          // 鼠标移动到新的sector，隐藏上一个sector的名称
          const lastIntersectSectorNameObject = this.lastIntersectSector.children.find(childObject => (childObject.userData as ObjectUserData).type === ObjectUserDataType.SectorName);
          if (!lastIntersectSectorNameObject) {
            throw new Error('Sector should have sector name (last intersect sector)');
          }
          lastIntersectSectorNameObject.visible = false;
        } else {
          // 从无到有，没有上一个sector名称可以隐藏
        }
      }
    } else {
      // 鼠标不与某个sector相交
      if (this.lastIntersectSector) {
        // 隐藏上一个sector的名称
        const lastIntersectSectorNameObject = this.lastIntersectSector.children.find(childObject => (childObject.userData as ObjectUserData).type === ObjectUserDataType.SectorName);
        if (!lastIntersectSectorNameObject) {
          throw new Error('Sector should have sector name (last intersect sector)');
        }
        lastIntersectSectorNameObject.visible = false;
      }
    }
  
    // 更新当前鼠标所指星区的名称大小，使得星区名称不管距离相机多远，其视觉上的大小始终保持不变
    // 同时，使星区名称尽可能正对相机
    if (this.currentIntersectSector) {
      const userData = this.currentIntersectSector.userData as ObjectUserData;
      if (userData.type !== ObjectUserDataType.Sector) {
        throw new Error(`Unexpected userData.type: ${userData.type} (calculate possible locations)`);
      }
      // 星区名称有6个可能的位置，每个位置对应六边形的一条边
      let possibleLocations = [{
        vector: new Vector3(0, 0, userData.radius), // 位置1
        rotation: 0,
      }, {
        vector: new Vector3(0, 0, userData.radius).applyAxisAngle(new Vector3(0, 1, 0), Math.PI / 3), // 位置2
        rotation: Math.PI / 3,
      }, {
        vector: new Vector3(0, 0, userData.radius).applyAxisAngle(new Vector3(0, 1, 0), Math.PI / 3 * 2), // 位置3
        rotation: Math.PI / 3 * 2,
      }, {
        vector: new Vector3(0, 0, userData.radius).applyAxisAngle(new Vector3(0, 1, 0), Math.PI), // 位置4
        rotation: Math.PI,
      }, {
        vector: new Vector3(0, 0, userData.radius).applyAxisAngle(new Vector3(0, 1, 0), -Math.PI / 3), // 位置5（此处旋转角度超过 PI 应该从另一个方向旋转）
        rotation: -Math.PI / 3,
      }, {
        vector: new Vector3(0, 0, userData.radius).applyAxisAngle(new Vector3(0, 1, 0), -Math.PI / 3 * 2), // 位置6（此处旋转角度超过 PI 应该从另一个方向旋转）
        rotation: -Math.PI / 3 * 2,
      }];
      // 遍历每一个可能的位置，找到最正对摄像机的那一个
      const cameraDirection = new Vector3(0, 0, -1);
      cameraDirection.applyQuaternion(this.threeContext.camera.quaternion);
      const vector0 = new Vector2(cameraDirection.x, cameraDirection.z).normalize(); // 相机的方向向量
      let maxCosIndex = 0, maxCos = Number.NEGATIVE_INFINITY;
      for (let i = 0; i < possibleLocations.length; ++i) {
        const possibleLocation = possibleLocations[i];
        const vector1 = new Vector2(possibleLocation.vector.x, possibleLocation.vector.z).normalize(); // 从星区中心到可能位置的向量
        const cos = vector0.x * vector1.x + vector0.y * vector1.y; // 计算两个向量夹角的cos值，这个值越大，就意味着这个位置越正对摄像机
        if (cos > maxCos) {
          maxCosIndex = i;
          maxCos = cos;
        }
      }
      const bestLocation = possibleLocations[maxCosIndex].vector;
      // 找到星区名称对象，设置新的位置
      const sectorNameObject = this.currentIntersectSector.children.find(obj => (obj.userData as ObjectUserData).type === ObjectUserDataType.SectorName);
      if (!sectorNameObject) {
        throw new Error('Sector should have sector name (last intersect sector)');
      }
      sectorNameObject.position.set(bestLocation.x, bestLocation.y, bestLocation.z);
      sectorNameObject.setRotationFromAxisAngle(new Vector3(0, 1, 0), possibleLocations[maxCosIndex].rotation);
      // 根据新的位置计算scale
      // TODO: 这个计算方式有问题，靠近屏幕中心的文字明显比靠近屏幕边缘的文字要小
      const sectorNameObjectWorldPosition = new Vector3();
      sectorNameObject.getWorldPosition(sectorNameObjectWorldPosition);
      const cameraWorldPosition = new Vector3();
      this.threeContext.camera.getWorldPosition(cameraWorldPosition);
      const textScale = sectorNameObjectWorldPosition.distanceTo(cameraWorldPosition) / 8000;
      sectorNameObject.scale.set(textScale, textScale, textScale);
      // sector的名称比六边形的边、六边形的面都要高
      sectorNameObject.position.y = SECTOR_NAME_Y_OFFSET;
    }
  }

  updateFactoryName () {
    if (this.currentIntersectFactory) {
      this.factoryNameEl.style.display = 'inline-block';
      this.factoryNameEl.style.left = this.threeContext.pointerRaw.x + 'px';
      this.factoryNameEl.style.top = this.threeContext.pointerRaw.y + 'px';
      const userData = this.currentIntersectFactory.userData as ObjectUserData;
      if (userData.type !== ObjectUserDataType.Factory) {
        throw new Error(`${App3D.name}.${this.updateFactoryName.name} requires member 'currentIntersectFactory' is a factory`);
      }
      this.factoryNameEl.innerText = userData.factory.name;
    } else {
      this.factoryNameEl.style.display = 'none';
    }
  }

  processInput () {
    while (this.eventQueue.length) {
      const ev = this.eventQueue[0];
      this.eventQueue.splice(0, 1);
      if (ev.type === 'mousemove') {
        // 射线捡取
        this.threeContext.pointer.x = ((ev as MouseEvent).clientX / window.innerWidth) * 2 - 1;
        this.threeContext.pointer.y = -((ev as MouseEvent).clientY / window.innerHeight) * 2 + 1;
        this.threeContext.pointerRaw.x = (ev as MouseEvent).clientX;
        this.threeContext.pointerRaw.y = (ev as MouseEvent).clientY;
        if (this.inputStatus.type === InputStatusType.MouseDown) {
          this.inputStatus.type = InputStatusType.Dragging;
        }
      } else if (ev.type === 'mousedown') {
        // 按下鼠标
        if (this.inputStatus.type === InputStatusType.None) {
          this.inputStatus.type = InputStatusType.MouseDown;
        }
        if (this.operationMode === OperationMode.MoveFactory) {
          // 在移动工厂模式下
          if (this.isMouseOnTransformControls) {
            // 鼠标位于Transform Controls上，则禁用Map Controls
            this.threeContext.mapControls.enabled = false;
          }
        }
      } else if (ev.type === 'mouseup') {
        if (this.inputStatus.type === InputStatusType.Dragging) {
          this.inputStatus.type = InputStatusType.None;
        } else if (this.inputStatus.type === InputStatusType.MouseDown) {
          // 鼠标点击事件
          this.inputStatus.type = InputStatusType.None;
          if (this.operationMode === OperationMode.PutFactory) {
            // 摆放工厂模式
            if (this.currentIntersectSector && this.currentIntersectSectorPosition && !this.currentIntersectFactory) {
              // 当用户点击某个sector的未被其他工厂占用的区域时，为这个sector添加一个工厂
              this.putFactory(this.currentIntersectSector, this.currentIntersectSectorPosition);
            }
          } else if (this.operationMode === OperationMode.General) {
            // 通用模式
            if (this.currentIntersectFactory) {
              // 当用户点击某个工厂时，将transformController附加到这个工厂上，并进入移动工厂模式
              this.transformControls.attach(this.currentIntersectFactory);
              this.operationMode = OperationMode.MoveFactory;
            }
          } else if (this.operationMode === OperationMode.MoveFactory) {
            // 在移动工厂模式下
            if (!this.currentIntersectFactory && !this.isMouseOnTransformControls) {
              // 鼠标没有点击工厂，并且没有点击Transform Controls，则隐藏Transform Controls，并回到通用模式
              this.transformControls.detach();
              this.operationMode = OperationMode.General;
            }
          }
        }

        // 操作模式为移动工厂时，不管在何种状态下松开鼠标，都启用一次Map Controls
        if (this.operationMode === OperationMode.MoveFactory) {
          this.threeContext.mapControls.enabled = true;
        }
      }
    }
  }

  /**
   * @param sector 
   * @param position 相对于sector的坐标
   */
  putFactory (sector: Object3D, position: Vector3) {
    const userData = sector.userData as ObjectUserData;
    if (userData.type !== ObjectUserDataType.Sector) {
      throw new Error(`${App3D.name}.${this.putFactory.name} only accepts a Sector as its first parameter`);
    }
    const cubeSize = userData.factoryCubeSize;
    const geometry = new BoxGeometry(cubeSize, cubeSize, cubeSize);
    const factory = new Mesh(geometry, materials.factory);

    // 计算当前sector下工厂的数量，自动生成新的工厂名称
    const currentFactoryCount = sector.children.filter(obj => (obj.userData as ObjectUserData).type === ObjectUserDataType.Factory).length;
    const sectorName = userData.name;
    const newFactoryName = sectorName + ' 工厂 ' + (currentFactoryCount + 1);

    const factoryUserData: ObjectUserData = {
      type: ObjectUserDataType.Factory,
      factory: new FactoryData(newFactoryName),
    };
    factory.userData = factoryUserData;
    factory.position.copy(position);
    sector.add(factory);
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

    // 下面这个大循环用于创建地图中的基本要素：cluster的边、sector的边和面、sector的名称以及各种容器对象
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
          radius: -1,
          factoryCubeSize: -1,
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
        sectorName.position.y = SECTOR_NAME_Y_OFFSET;
        sectorName.visible = false; // 星区名称只在鼠标悬浮在星区上时才显示
        sector.add(sectorName);

        ++sectorCount;
      });

      // 根据sectorCount的值，再补充sector的边、面，以及缩放后的半径等等
      for (const child of cluster.children) {
        const userData = child.userData as ObjectUserData;
        if (userData.type !== ObjectUserDataType.Sector) {
          continue;
        }
        const sector = child;

        let sectorHexagonEdge: Mesh, sectorHexagonPlane: Mesh;
        if (sectorCount === 1) {
          sectorHexagonEdge = new Mesh(sector1RingGeometry, materials.sectorHexagonEdge[userData.ownership]);
          sectorHexagonPlane = new Mesh(sector1PlaneGeometry, materials.sectorHexagonPlane[userData.ownership]);
          userData.radius = this.mapMetaData.sectorRadius1;
          userData.factoryCubeSize = userData.radius / 20;
        } else if (sectorCount === 2) {
          sectorHexagonEdge = new Mesh(sector2RingGeometry, materials.sectorHexagonEdge[userData.ownership]);
          sectorHexagonPlane = new Mesh(sector2PlaneGeometry, materials.sectorHexagonPlane[userData.ownership]);
          userData.radius = this.mapMetaData.sectorRadius2;
          userData.factoryCubeSize = userData.radius / 20;
        } else if (sectorCount === 3) {
          sectorHexagonEdge = new Mesh(sector3RingGeometry, materials.sectorHexagonEdge[userData.ownership]);
          sectorHexagonPlane = new Mesh(sector3PlaneGeometry, materials.sectorHexagonPlane[userData.ownership]);
          userData.radius = this.mapMetaData.sectorRadius3;
          userData.factoryCubeSize = userData.radius / 20;
        } else {
          throw new Error(`${App3D.name}.${this.initializeScene.name} requires a cluster has 1~3 sectors, but ${clusterId} has ${sectorCount} sectors`);
        }
        sectorHexagonEdge.position.y = SECTOR_EDGE_Y_OFFSET;
        const sectorHexagonEdgeUserData: ObjectUserData = {
          type: ObjectUserDataType.SectorHexagonEdge,
        };
        sectorHexagonEdge.userData = sectorHexagonEdgeUserData;
        sector.add(sectorHexagonEdge);
        sectorHexagonPlane.position.y = SECTOR_PLANE_Y_OFFSET;
        const sectorHexagonPlaneUserData: ObjectUserData = {
          type: ObjectUserDataType.SectorHexagonPlane,
        };
        sectorHexagonPlane.userData = sectorHexagonPlaneUserData;
        sector.add(sectorHexagonPlane);
      }

      // 根据sector原始坐标之间的相对位置，重新设置sector的坐标，使得每一个sector都位于地图上的正确位置
      const sectorArray: Array<{ sectorRef: Object3D, newCoordinate?: Vector3 }> = [];
      for (const child of cluster.children) {
        const userData = child.userData as ObjectUserData;
        if (userData.type !== ObjectUserDataType.Sector) {
          continue;
        }
        sectorArray.push({ sectorRef: child });
      }

      if (sectorArray.length === 1) {
        sectorArray[0].newCoordinate = new Vector3(0, 0, 0);
      } else if (sectorArray.length === 2) {
        const z0 = sectorArray[0].sectorRef.position.z;
        const z1 = sectorArray[1].sectorRef.position.z;
        const x0 = sectorArray[0].sectorRef.position.x;
        const x1 = sectorArray[1].sectorRef.position.x;
        const slope = (z1 - z0) / (x1 - x0);
        const xLeft = -this.mapMetaData.clusterRadius / 4;
        const xRight = -xLeft;
        const zTop = COS_30 * this.mapMetaData.clusterRadius / 2;
        const zBottom = -zTop;
        if (slope >= 0) {
          // 如果斜率大于0（或等于0），那么X小的在左下角，X大的在右上角
          if (x0 <= x1) {
            // 点0在左下角，点1在右上角
            sectorArray[0].newCoordinate = new Vector3(xLeft, 0, zBottom);
            sectorArray[1].newCoordinate = new Vector3(xRight, 0, zTop);
          } else {
            // 点0在右上角，点1在左下角
            sectorArray[0].newCoordinate = new Vector3(xRight, 0, zTop);
            sectorArray[1].newCoordinate = new Vector3(xLeft, 0, zBottom);
          }
        } else {
          // 如果斜率小于0，那么X小的在左上角，X大的在右下角
          if (x0 <= x1) {
            // 点0在左上角，点1在右下角
            sectorArray[0].newCoordinate = new Vector3(xLeft, 0, zTop);
            sectorArray[1].newCoordinate = new Vector3(xRight, 0, zBottom);
          } else {
            // 点0在右下角，点1在左上角
            sectorArray[0].newCoordinate = new Vector3(xRight, 0, zBottom);
            sectorArray[1].newCoordinate = new Vector3(xLeft, 0, zTop);
          }
        }
      } else if (sectorArray.length === 3) {
        // 先按Z的大小从小到大排序
        sectorArray.sort((a, b) => a.sectorRef.position.z - b.sectorRef.position.z);
        // 重新计算三个点的x坐标（相对于cluster中心，即大六边形的中心）
        const z0 = -COS_30 * this.mapMetaData.clusterRadius / 2;
        const z1 = 0;
        const z2 = -z0;
        let x0: number, x1: number, x2: number;
        // 根据三个点x坐标的相对大小重新计算三个点的x坐标
        // 判断中间这个点在左侧还是在右侧
        const middleX = (sectorArray[0].sectorRef.position.x + sectorArray[2].sectorRef.position.x) / 2;
        if (sectorArray[1].sectorRef.position.x > middleX) {
          // 中间这个点在右侧
          x0 = -this.mapMetaData.clusterRadius / 4;
          x1 = this.mapMetaData.clusterRadius / 2;
          x2 = x0;
        } else {
          // 中间这个点在左侧
          x0 = this.mapMetaData.clusterRadius / 4;
          x1 = -this.mapMetaData.clusterRadius / 2;
          x2 = x0;
        }
        sectorArray[0].newCoordinate = new Vector3(x0, 0, z0);
        sectorArray[1].newCoordinate = new Vector3(x1, 0, z1);
        sectorArray[2].newCoordinate = new Vector3(x2, 0, z2);
      } else {
        throw new Error(`Variable 'sectorArray' has a length of ${sectorArray.length}, which is unexpected`);
      }

      for (const i of sectorArray) {
        if (!i.newCoordinate) {
          throw new Error('Expression \'i.newCoordinate\' is equivalent to false, which is unexpected');
        }
        i.sectorRef.position.copy(i.newCoordinate);
      }
    });

    // 坐标轴辅助
    const axesHelper = new AxesHelper(5000);
    axesHelper.position.y -= 5000;
    this.threeContext.scene.add(axesHelper);

    // Transform Controls
    this.threeContext.scene.add(this.transformControls);
  }
};
