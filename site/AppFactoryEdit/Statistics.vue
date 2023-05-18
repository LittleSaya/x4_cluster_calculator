<!-- 单个工厂的统计信息 -->

<template>
  <div>工厂统计信息</div>
  <div>
    当前劳动力：<input type="number" v-model="currentWorkforce" :max="maxWorkforce" /><br/>
    最大可容纳劳动力：{{ maxWorkforce }}<br/>
    达到最高效率所需劳动力：{{ maxEfficiencyWorkforce }}
  </div>
  <pre>{{ statisticsInfo }}</pre>
</template>

<script setup lang="ts">
import { getParsedWareMap } from '../util/ware_data_parser'
import { getParsedModuleMap } from '../util/module_data_parser'
import { FactoryNode } from '../types/graph/FactoryNode'
import { ModuleNode } from '../types/graph/ModuleNode'
import { watch, ref } from 'vue'

// 用于参考的货物信息
const wareRef = getParsedWareMap();

// 用于参考的模块信息
const moduleRef = getParsedModuleMap();

// 通过props接收工厂的模块数据
const props = defineProps<{
  habitatModules: { moduleId: string, count: number }[],
  productionModules: { moduleId: string, count: number }[],
  storageModules: { moduleId: string, count: number }[],
}>();

/**
 * 工厂的最大劳动力数量
 */
const maxWorkforce = ref(0);

/**
 * 工厂的当前劳动力数量
 */
const currentWorkforce = ref(0);

/**
 * 达到最高效率所需的劳动力数量
 */
const maxEfficiencyWorkforce = ref(0);

/**
 * 工厂的统计信息
 */
const statisticsInfo = ref('');

// 构造工厂节点
let factoryNode: FactoryNode | undefined = undefined;

// 监听props变化
watch(props, () => {
  // 重新构造工厂节点和模块节点
  // TODO：这里显示工厂的真实名称
  factoryNode = new FactoryNode('工厂名称（占位符）');
  for (const pm of props.productionModules) {
    factoryNode.children.push(new ModuleNode(
      moduleRef.production.get(pm.moduleId),
      pm.count,
      wareRef,
    ));
  }

  // 每一次变动，都重新计算最大劳动力数量并将当前劳动力数量设置为0
  maxWorkforce.value = props.habitatModules
    .map(({ moduleId, count }) => moduleRef.habitat.get(moduleId).capacity * count)
    .reduce((acc, cur) => acc + cur, 0);
  currentWorkforce.value = 0;

  // 设置工厂的劳动力状态
  factoryNode.maxWorkforce = maxWorkforce.value;
  factoryNode.currentWorkforce = currentWorkforce.value;

  // 进行一次计算
  generateStatisticsInfo();

  maxEfficiencyWorkforce.value = factoryNode.maxEfficiencyWorkforce;
});

// 监听当前劳动力数量变化
watch(currentWorkforce, () => {
  factoryNode.currentWorkforce = currentWorkforce.value;
  generateStatisticsInfo();
  maxEfficiencyWorkforce.value = factoryNode.maxEfficiencyWorkforce;
});

// 计算并产出工厂的统计数据
function generateStatisticsInfo () {
  factoryNode.calculateInputOutput();
  statisticsInfo.value = factoryNode.equation.toStatisticsInfoString();
}

defineExpose({
  setCurrentWorkforce (num: number) {
    currentWorkforce.value = num;
  },
  
  getCurrentWorkforce () {
    return currentWorkforce.value;
  }
});
</script>

<style scoped>
</style>
