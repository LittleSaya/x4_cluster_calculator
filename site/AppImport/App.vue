<template>
  <div
    :style="{ display: isAppDisplayed ? 'block' : 'none' }"
    class="container"
  >
    <input type="file" @change="onFileInputChange" />
    <button @click="doImport" style="margin-left: 0.5em;">导入数据并回到地图界面</button>
    <button @click="cancelImport" style="margin-left: 0.5em;">取消导入并回到地图界面</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isAppDisplayed = ref(false);

let importedString = '';

window.addEventListener('message', ev => {
  if (ev.data.type === 'START_IMPORT') {
    isAppDisplayed.value = true;
    importedString = '';
  }
});

function doImport () {
  if (!importedString) {
    if (confirm('检测到导入的文件内容为空，确定要关闭导入界面吗？')) {
    } else {
      return;
    }
  }
  window.postMessage({
    type: 'FINISH_IMPORT',
    importedString,
  });
  isAppDisplayed.value = false;
}

function cancelImport () {
  window.postMessage({
    type: 'FINISH_IMPORT',
  });
  isAppDisplayed.value = false;
}

function onFileInputChange (event: Event) {
  const fileInput = event.target as HTMLInputElement;
  const file = fileInput.files.item(0);
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      importedString = reader.result;
    }
  };
  reader.readAsText(file);
}
</script>

<style>
@import '../vue-common.css';
</style>
