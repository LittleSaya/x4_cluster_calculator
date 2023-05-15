<template>
  <div
    :style="{ display: isAppDisplayed ? 'block' : 'none' }"
    class="container-app-import"
  ></div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isAppDisplayed = ref(false);
</script>

<style>
.container-app-import {
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
