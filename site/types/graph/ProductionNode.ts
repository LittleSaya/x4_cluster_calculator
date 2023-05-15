/**
 * 生产节点是图中的最小单位
 */
export class ProductionNode {

  /**
   * 每轮输入原料的类型和数量
   */
  inputWares: Map<string, number>;

  /**
   * 每轮输出产品的类型和数量（未受劳动力影响）
   */
  outputWares: Map<string, number>;

  /**
   * 每轮消耗的时间（秒）
   */
  roundTime: number;

  /**
   * 劳动力对每种产品的影响力（满人口时）
   */
  workforceEffect: Map<string, number>;

  /**
   * 最大工人数
   */
  maxWorkers: number;

  /**
   * 模块id
   */
  moduleId: string;

  /**
   * 模块数量（实际的每轮原料输入、每轮产品输出和最大工人数都要乘以这个值）
   */
  moduleCount: number;
}
