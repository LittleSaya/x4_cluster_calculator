import { Node } from './Node'

/**
 * 表示一个模块的节点，模块节点不包括子节点
 */
export class ModuleNode extends Node {

  /**
   * 模块id
   */
  moduleId: string;

  /**
   * 模块数量（实际的每轮原料输入、每轮产品输出和最大工人数都要乘以这个值）
   */
  moduleCount: number;

  constructor (moduleId: string, moduleCount: number = 1) {
    super();
    this.moduleId = moduleId;
    this.moduleCount = moduleCount;
  }
}
