<!-- 单个工厂的统计信息 -->

<template>
  <div>工厂统计信息</div>
  <div class="workforce">
    当前劳动力：<input type="number" v-model="currentWorkforce" :min="0" :max="maxWorkforce" style="width: 6em;" /><br/>
    最大可容纳劳动力：{{ maxWorkforce }}<br/>
    达到最高效率所需劳动力：{{ maxEfficiencyWorkforce }}
  </div>
  <div class="banned-wares">
    禁用货物：
    <select v-model="selectedBannedWareId">
      <option v-for="ware of availableBannedWares" :key="ware.id" :value="ware.id">{{ ware.name }}</option>
    </select>
    <button style="margin-left: 0.5em;" @click="addBannedWare">+</button><br/>
    <pre><span v-for="(ware, index) of bannedWaresArray" :key="ware.id" @click="removeBannedWare(index)">{{ ware.name }}</span></pre>
  </div>
  <pre class="statistics">{{ statisticsInfo }}</pre>
</template>

<script setup lang="ts">
import { getParsedWareMap, getParsedWareArray, Ware } from '../util/ware_data_parser'
import { getParsedModuleMap } from '../util/module_data_parser'
import { FactoryNode } from '../types/graph/FactoryNode'
import { ModuleNode } from '../types/graph/ModuleNode'
import { watch, ref, Ref } from 'vue'

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
 * 工厂禁用的货物
 */
const bannedWaresArray: Ref<Ware[]> = ref([]);

/**
 * 所有可选的禁用货物列表
 */
const availableBannedWares: Ref<Ware[]> = ref(getParsedWareArray());

/**
 * 用户当前在下拉框内选择的禁用货物的ID
 */
const selectedBannedWareId = ref('');

/**
 * 添加禁用的货物
 */
function addBannedWare () {
  if (!selectedBannedWareId.value) {
    return;
  }
  if (bannedWaresArray.value.find(ware => ware.id === selectedBannedWareId.value)) {
    return;
  }
  bannedWaresArray.value.push(wareRef.get(selectedBannedWareId.value));
}

/**
 * 移除禁用的货物
 */
function removeBannedWare (index: number) {
  bannedWaresArray.value.splice(index, 1);
}

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

// 监听禁用货物列表的变化
watch(bannedWaresArray, () => {
  const bannedWareIdSet: Set<string> = new Set();
  for (const ware of bannedWaresArray.value) {
    bannedWareIdSet.add(ware.id);
  }
  factoryNode.bannedWares = bannedWareIdSet;
  generateStatisticsInfo();
}, { deep: true });

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
  },

  setBannedWaresArray (arr: Ware[]) {
    bannedWaresArray.value = arr;
  },

  getBannedWaresArray () {
    return bannedWaresArray.value;
  },
});
</script>

<style scoped>
.workforce, .banned-wares, .statistics {
  margin: 1em 0 1em 0;
  padding: 12px;
  border: 1px solid black;
}
</style>
