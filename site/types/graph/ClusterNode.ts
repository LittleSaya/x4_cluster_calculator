import { Equation } from './Equation'
import { FactoryNode } from './FactoryNode'

/**
 * 表示一个工厂集群的节点，工厂集群节点包括工厂子节点
 */
export class ClusterNode {

  equation: Equation;

  children: FactoryNode[];

  constructor () {
    this.equation = new Equation();
    this.children = [];
  }

  calculateInputOutput () {
    this.equation.clear();
    // 集群的吞吐量直接取下属所有工厂的吞吐量之和
    for (const factoryNode of this.children) {
      factoryNode.calculateInputOutput();
      factoryNode.equation.inputMap.forEach((num, wareId) => this.equation.addInput(wareId, num));
      factoryNode.equation.outputMap.forEach((num, wareId) => this.equation.addOutput(wareId, num));
    }
  }
}
