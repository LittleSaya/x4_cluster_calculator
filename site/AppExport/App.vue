<template>
  <div
    :style="{ display: isAppDisplayed ? 'block' : 'none' }"
    class="container"
  >
    <a :href="exportedString" :download="filename">点击导出工厂配置</a>
    <button @click="close">关闭导出界面</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isAppDisplayed = ref(false);
const exportedString = ref('');
const filename = ref('');

window.addEventListener('message', ev => {
  if (ev.data.type === 'START_EXPORT') {
    isAppDisplayed.value = true;
    const blob = new Blob([ev.data.exportedString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    exportedString.value = url;
    const now = new Date();
    filename.value = '工厂数据'
      + now.getFullYear() + '年'
      + (now.getMonth() + 1) + '月'
      + now.getDate() + '日'
      + now.getHours() + '时'
      + now.getMinutes() + '分'
      + now.getSeconds() + '秒.json';
  }
});

function close () {
  window.postMessage({ type: 'FINISH_EXPORT' });
  isAppDisplayed.value = false;
}
</script>

<style>
@import '../vue-common.css';
</style>
