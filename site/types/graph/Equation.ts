import { getParsedWareMap } from "@/site/util/ware_data_parser";

/**
 * 等式有输入和输出，是一种抽象的表达，表示一种类似于“3*A+2*B=>5*C+4*D”的关系，
 * 其中左侧是输入，右侧是输出，字母是输入/输出的类型，数字是输入/输出的量
 */
export class Equation {

  /**
   * 输入的类型以及每种类型的数量
   */
  inputMap: Map<string, number>;

  /**
   * 输出的类型以及每种类型的数量
   */
  outputMap: Map<string, number>;

  /**
   * 构造一个空的等式
   */
  constructor () {
    this.inputMap = new Map();
    this.outputMap = new Map();
  }

  addOutput (type: string, num: number) {
    if (num <= 0) {
      throw new Error(`${Node.name}.${this.addOutput} requires parameter 'num' > 0. type = ${type}, num = ${num}`);
    }
    if (this.inputMap.has(type)) {
      // 节点已经对该类型有输入需求（同时意味着节点不产生该类型的输出）
      const inputNum = this.inputMap.get(type);
      if (inputNum === num) {
        // 新增的输出刚好能够抵消所需的输入
        this.inputMap.delete(type);
      } else if (inputNum > num) {
        // 新增的输出不足以抵消所需的输入，但能够减少所需的输入
        this.inputMap.set(type, inputNum - num);
      } else {
        // 新增的输出能够抵消所需的输入，并且有盈余
        this.inputMap.delete(type);
        this.outputMap.set(type, num - inputNum);
      }
    } else {
      // 节点没有对该类型的输入需求
      if (this.outputMap.has(type)) {
        this.outputMap.set(type, this.outputMap.get(type) + num);
      } else {
        this.outputMap.set(type, num);
      }
    }
  }

  removeOutput (type: string, num: number) {
    if (num <= 0) {
      throw new Error(`${Node.name}.${this.removeOutput.name} requires parameter 'num' > 0. type = ${type}, num = ${num}`);
    }
    if (this.outputMap.has(type)) {
      const outputNum = this.outputMap.get(type);
      if (num > outputNum) {
        throw new Error(`${Node.name}.${this.removeOutput.name} says that no more output can be removed. current output = ${outputNum}, to remove = ${num}`);
      } else if (num === outputNum) {
        this.outputMap.delete(type);
      } else {
        this.outputMap.set(type, outputNum - num);
      }
    }
  }

  addInput (type: string, num: number) {
    if (num <= 0) {
      throw new Error(`${Node.name}.${this.addInput} requires parameter 'num' > 0. type = ${type}, num = ${num}`);
    }
    if (this.outputMap.has(type)) {
      // 节点已经产生该类型的输出（同时意味着节点对该类型没有输入需求）
      const outputNum = this.outputMap.get(type);
      if (outputNum === num) {
        // 新增的输入需求刚好能够抵消已有的输出
        this.outputMap.delete(type);
      } else if (outputNum > num) {
        // 新增的输入需求不足以抵消所有输出，但是能够减少输出
        this.outputMap.set(type, outputNum - num);
      } else {
        // 新增的输入需求能够抵消所有输出，并且能够在总体上产生输入需求
        this.outputMap.delete(type);
        this.inputMap.set(type, num - outputNum);
      }
    } else {
      // 节点不产生该类型的输出
      if (this.inputMap.has(type)) {
        this.inputMap.set(type, this.inputMap.get(type) + num);
      } else {
        this.inputMap.set(type, num);
      }
    }
  }

  removeInput (type: string, num: number) {
    if (num <= 0) {
      throw new Error(`${Node.name}.${this.removeInput.name} requires parameter 'num' > 0. type = ${type}, num = ${num}`);
    }
    if (this.inputMap.has(type)) {
      const inputNum = this.inputMap.get(type);
      if (num > inputNum) {
        throw new Error(`${Node.name}.${this.removeInput.name} says that no more input can be removed. current input = ${inputNum}, to remove = ${num}`);
      } else if (num === inputNum) {
        this.inputMap.delete(type);
      } else {
        this.inputMap.set(type, inputNum - num);
      }
    }
  }

  clear () {
    this.inputMap.clear();
    this.outputMap.clear();
  }

  toStatisticsInfoString (): string {
    const wareRef = getParsedWareMap();
    
    const info: string[] = [];
    info.push('输出');
    this.outputMap.forEach((num, wareId) => {
      num = Math.trunc(num * 100) / 100; // 保留两位小数
      info.push(`    ${wareRef.get(wareId).name} x ${num} / 小时`);
    });
    info.push('输入');
    this.inputMap.forEach((num, wareId) => {
      num = Math.trunc(num * 100) / 100; // 保留两位小数
      info.push(`    ${wareRef.get(wareId).name} x ${num} / 小时`);
    });
    return info.join('\r\n');
  }
}
