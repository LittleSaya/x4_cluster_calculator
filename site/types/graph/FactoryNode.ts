import { Equation } from './Equation'
import { ModuleNode } from './ModuleNode'

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
   * 属于该工厂节点的子模块节点
   */
  children: ModuleNode[];

  constructor (factoryName: string) {
    this.factoryName = factoryName;
    this.bannedWares = new Set();
    this.equation = new Equation();
    this.maxWorkforce = this.currentWorkforce = 0;
    this.children = [];
  }

  /**
   * 结合劳动力和禁用的货物计算该工厂的输入输出
   */
  calculateInputOutput () {

  }
}
