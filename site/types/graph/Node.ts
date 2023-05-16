/**
 * 节点有输入和输出，并且可以嵌套，父节点的输入和输出由所有子节点决定，叶子节点的输入和输出由自身决定
 */
export class Node {

  /**
   * 输入的类型以及每种类型的数量
   */
  inputMap: Map<string, number>;

  /**
   * 输出的类型以及每种类型的数量
   */
  outputMap: Map<string, number>;

  /**
   * 子节点
   */
  children: Node[];

  constructor () {
    this.inputMap = new Map();
    this.outputMap = new Map();
    this.children = [];
  }

  /**
   * 计算本节点的输入和输出
   */
  calculateInputOutput () {
    if (!this.children.length) {
      return;
    }
    this.inputMap.clear();
    this.outputMap.clear();
    for (const child of this.children) {
      child.calculateInputOutput();
      child.inputMap.forEach((num, type) => {
        if (this.inputMap.has(type)) {
          this.inputMap.set(type, this.inputMap.get(type) + num);
        } else {
          this.inputMap.set(type, num);
        }
      });
      child.outputMap.forEach((num, type) => {
        if (this.outputMap.has(type)) {
          this.outputMap.set(type, this.outputMap.get(type) + num);
        } else {
          this.outputMap.set(type, num);
        }
      });
    }
    // 查找并去除本节点输入输出重合的部分
    const overlapTypes: Set<string> = new Set();
    this.inputMap.forEach((_, type) => overlapTypes.add(type));
    this.outputMap.forEach((_, type) => {
      if (over)
    })
  }
}
