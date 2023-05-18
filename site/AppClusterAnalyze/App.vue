<template>
  <div
    :style="{ display: isAppDisplayed ? 'block' : 'none' }"
    class="container-app-cluster-analyze"
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
.container-app-cluster-analyze {
  position: fixed;
  width: 80vw;
  height: 90vh;
  left: 10vw;
  top: 5vh;
  z-index: 1;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
}
</style>
