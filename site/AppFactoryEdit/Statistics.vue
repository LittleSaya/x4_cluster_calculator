<!-- 单个工厂的统计信息 -->

<template>
  <div>工厂统计信息</div>
  <div>居住模块数量：{{ habitatModules.length }}</div>
  <div>生产模块数量：{{ productionModules.length }}</div>
  <div>仓储模块数量：{{ storageModules.length }}</div>
</template>

<script setup lang="ts">
import { HabitatModule, ProductionModule, StorageModule } from '../util/module_data_parser'
import { parseWareDataReturnMap } from '../util/ware_data_parser'
import { parseModuleData } from '../util/module_data_parser'
import rawWareData from '@/data_converted/full-wares.json'
import rawModuleData from '@/data_converted/full-modules.json'
import { watch } from 'vue'

// 通过props接收工厂的模块数据
const props = defineProps<{
  habitatModules: { moduleId: string, count: number }[],
  productionModules: { moduleId: string, count: number }[],
  storageModules: { moduleId: string, count: number }[],
}>();

const moduleIdCount = {
  habitat: new Map<string, number>(),
  production: new Map<string, number>(),
  storage: new Map<string, number>(),
};

// 读取货物的基本信息
const wareDataMap = parseWareDataReturnMap(rawWareData);

// 读取模块的基本信息
const moduleData = parseModuleData(rawModuleData);

// 构造工厂节点

// 工人填充率

// 需求信息

// 产出信息

// 监听props变化
watch(() => ({
  habitatModules: props.habitatModules,
  productionModules: props.productionModules,
  storageModules: props.storageModules
}), () => {
});
</script>

<style scoped>
</style>
