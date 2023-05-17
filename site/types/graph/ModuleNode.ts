import { Equation } from './Equation'
import { ProductionModule } from '../../util/module_data_parser'
import { Ware } from '../../util/ware_data_parser'

/**
 * 表示一个模块的节点，模块节点不包括子节点
 * 模块节点的输入和输出数量为每小时的数量，该数量：
 * 一、没有乘以模块数量，
 * 二、并且不受劳动力影响
 * 由于工厂可以不为某类货物分配空间，因此模块的实际输入输出值需要结合工厂的状态即时计算
 */
export class ModuleNode {

  /**
   * 模块id
   */
  moduleId: string;

  /**
   * 模块数量（实际的每轮原料输入、每轮产品输出和最大工人数都要乘以这个值）
   */
  moduleCount: number;

  /**
   * 描述模块输入输出的等式
   */
  equation: Equation;

  /**
   * 用于参考的生产模块定义
   */
  moduleRef: ProductionModule;

  /**
   * 用于参考的货物信息
   */
  wareRef: Map<string, Ware>;

  /**
   * @param moduleDef 用于参考的生产模块定义
   * @param moduleCount 
   * @param wareRef 用于参考生产方式信息的货物属性
   */
  constructor (moduleRef: ProductionModule, moduleCount: number, wareRef: Map<string, Ware>) {
    this.moduleId = moduleRef.id;
    this.moduleCount = moduleCount;
    this.equation = new Equation();
    this.moduleRef = moduleRef;
    this.wareRef = wareRef;
  }

  /**
   * 计算该模块节点的输入输出
   * @param bannedWares 所属工厂不予分配仓储空间的货物列表，这部分货物不参与运算
   */
  calculateInputOutput (bannedWares: Set<string>) {
    // 去除了banned wares之后，完成一轮生产所需的总时间（一轮生产可能不止一个货物，例如废料再生模块一轮会生产船体部件+电子粘土）
    const totalRoundTime = this.moduleRef.productionQueue
      .filter(pq => !bannedWares.has(pq.ware)) // production queue代表模块的产品，此处去除被禁用的货物
      .map(pq => this.wareRef.get(pq.ware).production.get(pq.method).time)
      .reduce((accumulator, currentValue) => accumulator + currentValue);
    this.moduleRef.productionQueue
      .filter(pq => !bannedWares.has(pq.ware))
      .forEach(pq => {
        const ware = this.wareRef.get(pq.ware);
        const productionMethod = ware.production.get(pq.method);
        // 检查该production queue所需的输入货物是否被禁用
        let isInputBanned = false;
        productionMethod.input.forEach((_, inputWareId) => {
          if (bannedWares.has(inputWareId)) {
            isInputBanned = true;
          }
        });
        if (isInputBanned) {
          // 该production queue无法生产
          return;
        }
        this.equation.addOutput(pq.ware, productionMethod.amount);
        productionMethod.input.forEach((num, inputWareId) => this.equation.addInput(inputWareId, num));
      });
    // 此时equation存储的是一轮的输入输出数量，还需要进一步计算每小时的吞吐量，以及多个模块的吞吐量之和
    const roundCount = 3600 / totalRoundTime;
    const coef = roundCount * this.moduleCount;
    this.equation.inputMap.forEach((num, wareId, map) => {
      map.set(wareId, num * coef);
    });
    this.equation.outputMap.forEach((num, wareId, map) => {
      map.set(wareId, num * coef);
    });
  }
}
