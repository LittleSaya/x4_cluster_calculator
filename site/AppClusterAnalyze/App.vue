<template>
  <div
    :style="{ display: isAppDisplayed ? 'block' : 'none' }"
    class="container"
  >
    <pre>{{ statisticsInfo }}</pre>
    <button @click="close">关闭工厂集群分析界面</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FactoryData } from '../types/FactoryData';
import { FactoryNode } from '../types/graph/FactoryNode';
import { ClusterNode } from '../types/graph/ClusterNode';

const isAppDisplayed = ref(false);
const statisticsInfo = ref('');

window.addEventListener('message', ev => {
  if (ev.data.type === 'START_CLUSTER_ANALYZE') {
    isAppDisplayed.value = true;
    statisticsInfo.value = '';

    const factoryDataArray = ev.data.factoryDataArray as FactoryData[];
    const clusterNode = new ClusterNode();
    for (const factoryData of factoryDataArray) {
      const factoryNode = FactoryNode.createFromFactoryData(factoryData);
      clusterNode.children.push(factoryNode);
    }
    clusterNode.calculateInputOutput();
    statisticsInfo.value = clusterNode.equation.toStatisticsInfoString();
  }
});

function close () {
  window.postMessage({ type: 'FINISH_CLUSTER_ANALYZE' });
  isAppDisplayed.value = false;
}
</script>

<style>
@import '../vue-common.css';
</style>
