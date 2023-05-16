import { Node } from './Node'

/**
 * 表示一个工厂的节点，工厂节点包括模块子节点
 */
export class FactoryNode extends Node {

  factoryName: string;

  /**
   * 不存储、不生产的货物（通过限制储量之类的方式）
   */
  bannedWares: Set<string>;

  constructor (factoryName: string) {
    super();
    this.factoryName = factoryName;
    this.bannedWares = new Set();
  }
}
