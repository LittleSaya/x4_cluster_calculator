<template>
  <div
    :style="{ display: isAppDisplayed ? 'block' : 'none' }"
    class="container"
  >
    <input type="file" @change="onFileInputChange" />
    <button @click="close" style="margin-left: 0.5em;">关闭导入界面</button>
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

function close () {
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
