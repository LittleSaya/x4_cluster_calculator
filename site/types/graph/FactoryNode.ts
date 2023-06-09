import { Equation } from './Equation'
import { ModuleNode } from './ModuleNode'
import { FactoryData } from '../FactoryData'
import { getParsedModuleMap, ParsedModuleMap } from '../../util/module_data_parser'
import { getParsedWareMap, Ware } from '../../util/ware_data_parser'

/**
 * 表示一个工厂的节点，工厂节点包括模块子节点
 */
export class FactoryNode {

  factoryName: string;

  /**
   * 不存储、不生产的货物（通过限制储量之类的方式）
   */
  bannedWares: Set<string>;

  /**
   * 描述工厂供需关系的等式，工厂的供需关系由其所有子节点的供需关系共同构成
   */
  equation: Equation;

  /**
   * 工厂能容纳的最大工人数量，该数量通过在外部计算居住模块的容量之和得到
   */
  maxWorkforce: number;

  /**
   * 工厂当前已有的工人数量
   */
  currentWorkforce: number;

  /**
   * 达到最高效率所需的劳动力数量
   */
  maxEfficiencyWorkforce: number;

  /**
   * 属于该工厂节点的子模块节点
   */
  children: ModuleNode[];

  /**
   * 用于参考的模块数据
   */
  moduleRef: ParsedModuleMap;

  /**
   * 用于参考的货物数据
   */
  wareRef: Map<string, Ware>;

  constructor (factoryName: string) {
    this.factoryName = factoryName;
    this.bannedWares = new Set();
    this.equation = new Equation();
    this.maxWorkforce = this.currentWorkforce = 0;
    this.children = [];
    this.moduleRef = getParsedModuleMap();
    this.wareRef = getParsedWareMap();
  }

  /**
   * 结合劳动力和禁用的货物计算该工厂的输入输出
   */
  calculateInputOutput () {
    this.equation.clear();
    // 计算所有下属模块达到最高效率所需的总劳动力
    this.maxEfficiencyWorkforce = this.children
      .map(m => this.moduleRef.production.get(m.moduleId).maxWorkforce * m.moduleCount)
      .reduce((acc, cur) => acc + cur, 0);
    // 以工厂当前的劳动力数量，可以达到最高效率的百分之几（最多100%）
    let efficiencyRatio = this.currentWorkforce / this.maxEfficiencyWorkforce;
    if (efficiencyRatio > 1) {
      efficiencyRatio = 1;
    }
    // 计算每一个模块的输入和输出，并将其合并至工厂的总吞吐量
    this.children.forEach(mod => {
      mod.calculateInputOutput(this.bannedWares, efficiencyRatio);
      mod.equation.inputMap.forEach((num, wareId) => this.equation.addInput(wareId, num));
      mod.equation.outputMap.forEach((num, wareId) => this.equation.addOutput(wareId, num));
    });
  }

  static createFromFactoryData (factoryData: FactoryData): FactoryNode {
    const wareRef = getParsedWareMap();
    const moduleRef = getParsedModuleMap();

    const factoryNode = new FactoryNode(factoryData.name);

    // 计算生产模块每类多少个
    const productionModules: Map<string, number> = new Map();
    for (const moduleId of factoryData.productionModules) {
      if (productionModules.has(moduleId)) {
        productionModules.set(moduleId, productionModules.get(moduleId) + 1);
      } else {
        productionModules.set(moduleId, 1);
      }
    }

    // 计算居住模块每类多少个
    const habitatModules: Map<string, number> = new Map();
    for (const moduleId of factoryData.habitatModules) {
      if (habitatModules.has(moduleId)) {
        habitatModules.set(moduleId, habitatModules.get(moduleId) + 1);
      } else {
        habitatModules.set(moduleId, 1);
      }
    }

    // 填充模块子节点
    productionModules.forEach((num, moduleId) => {
      factoryNode.children.push(new ModuleNode(
        moduleRef.production.get(moduleId),
        num,
        wareRef,
      ));
    });
  
    // 计算最大工人数
    let maxWorkforce = 0;
    habitatModules.forEach((moduleCount, moduleId) => maxWorkforce += moduleRef.habitat.get(moduleId).capacity * moduleCount);
    factoryNode.maxWorkforce = maxWorkforce;

    // 工厂当前工人数
    factoryNode.currentWorkforce = factoryData.currentWorkforce;

    // 读取禁用的货物列表
    const bannedWaresSet: Set<string> = new Set();
    factoryData.bannedWaresIdArray.forEach(wareId => bannedWaresSet.add(wareId));
    factoryNode.bannedWares = bannedWaresSet;
    
    return factoryNode;
  }
}
