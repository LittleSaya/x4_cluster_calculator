<template>
  <div
    :style="{ display: isAppDisplayed ? 'block' : 'none' }"
    class="container-app"
  >
    <button @click="isAppDisplayed = false">关闭界面</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isAppDisplayed = ref(false);

// 监听编辑工厂的消息，消息传来时显示界面
window.addEventListener('message', ev => {
  if (ev.data.type === 'START_EDIT_FACTORY') {
    isAppDisplayed.value = true;
  }
});
</script>

<style scoped>
.container-app {
  position: fixed;
  width: 80vw;
  height: 90vh;
  left: 10vw;
  top: 5vh;
  z-index: 1;
  background-color: white;
}
</style>
