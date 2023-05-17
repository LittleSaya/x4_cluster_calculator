/**
 * 货物数据统一通过该文件提供的解析函数读取
 */

export class ProductionMethod {

  time: number;

  amount: number;

  effect: {

    work: number,
  };

  input: Map<string, number>;

  constructor (time: number, amount: number, effect: { work: number }, input: Map<string, number>) {
    this.time = time;
    this.amount = amount;
    this.effect = effect;
    this.input = input;
  }
};

export class Ware {

  id: string;

  name: string;

  transport: string;

  volume: number;

  group: string;

  price: {

    min: number,

    average: number,

    max: number,
  };

  production: Map<string, ProductionMethod>;

  constructor(
    id: string,
    name: string,
    transport: string,
    volume: number,
    group: string,
    price: { min: number, average: number, max: number },
    production: Map<string, ProductionMethod>
  ) {
    this.id = id;
    this.name = name;
    this.transport = transport;
    this.volume = volume;
    this.group = group;
    this.price = price;
    this.production = production;
  }
};

export function parseWareDataReturnMap (json: any): Map<string, Ware> {
  const wares: Map<string, Ware> = new Map();
  for (const wareId in json) {
    const wareObj = json[wareId];
    const wareName = wareObj.name;
    const wareTransport = wareObj.transport;
    const wareVolume = wareObj.volume;
    const wareGroup = wareObj.group;
    const warePrice = {
      min: Number(wareObj.price.min),
      average: Number(wareObj.price.average),
      max: Number(wareObj.price.max),
    };
    const wareProductionObj = wareObj.production;
    const wareProduction: Map<string, ProductionMethod> = new Map();
    for (const methodName in wareProductionObj) {
      const methodObj = wareProductionObj[methodName];
      const methodTime = methodObj.time;
      const methodAmount = methodObj.amount;
      const methodEffect = {
        work: 0,
      };
      if (methodObj.effect && methodObj.effect.work) {
        methodEffect.work = methodObj.effect.work;
      }
      const methodInputObj = methodObj.input;
      const methodInput: Map<string, number> = new Map();
      for (const inputWareId in methodInputObj) {
        methodInput.set(inputWareId, methodInputObj[inputWareId]);
      }
      wareProduction.set(methodName, new ProductionMethod(
        methodTime,
        methodAmount,
        methodEffect,
        methodInput,
      ));
    }
    wares.set(wareId, new Ware(
      wareId,
      wareName,
      wareTransport,
      wareVolume,
      wareGroup,
      warePrice,
      wareProduction
    ));
  }
  return wares;
}
