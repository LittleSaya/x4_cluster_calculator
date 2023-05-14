<template>
  <div
    :style="{ display: isAppDisplayed ? 'block' : 'none' }"
    class="container-app"
  >
    <div class="factory-modules">
      <div class="habitat-modules">
        <div>居住模块</div>
        <ol>
          <li v-for="mod of habitatModules" :key="mod.moduleId">
            {{ moduleIdToName(mod.moduleId) }} x {{ mod.count }}
          </li>
        </ol>
        <select v-model="selectedHabitatModule">
          <option v-for="mod of availableHabitatModules" :key="mod.moduleId" :value="mod.moduleId">{{ mod.moduleName }}</option>
        </select>
        <button @click="addHabitatModule">+</button>
      </div>
      <div class="storage-modules">
        <div>仓储模块</div>
        <ol>
          <li v-for="mod of storageModules">
            {{ moduleIdToName(mod.moduleId) }} x {{ mod.count }}
          </li>
        </ol>
        <select v-model="selectedStorageModule">
          <option v-for="mod of availableStorageModules" :key="mod.moduleId" :value="mod.moduleId">{{ mod.moduleName }}</option>
        </select>
        <button @click="addStorageModule">+</button>
      </div>
      <div class="production-modules">
        <div>生产模块</div>
        <ol>
          <li v-for="mod of productionModules">
            {{ moduleIdToName(mod.moduleId) }} x {{ mod.count }}
          </li>
        </ol>
        <select v-model="selectedProductionModule">
          <option v-for="mod of availableProductionModules" :key="mod.moduleId" :value="mod.moduleId">{{ mod.moduleName }}</option>
        </select>
        <button @click="addProductionModule">+</button>
      </div>
      <div class="statistics"></div>
    </div>
    <div class="actions">
      工厂名称：<input v-model="factoryName" />
      <button @click="finishEditFactory">完成编辑</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue'
import { FactoryData } from '../types/FactoryData'
import rawModuleData from '@/data_converted/full-modules.json'
import { parseModuleData } from '@/site/util/module_data_parser'

// ==================== 进入和离开页面 ====================

/**
 * 是否显示界面
 */
const isAppDisplayed = ref(false);

const factoryName: Ref<string> = ref('');
const habitatModules: Ref<{ moduleId: string, count: number }[]> = ref([]);
const storageModules: Ref<{ moduleId: string, count: number }[]> = ref([]);
const productionModules: Ref<{ moduleId: string, count: number }[]> = ref([]);

// 监听编辑工厂的消息，消息传来时显示界面
window.addEventListener('message', ev => {
  if (ev.data.type === 'START_EDIT_FACTORY') {
    // 清空数据
    factoryName.value = '';
    habitatModules.value = [];
    storageModules.value = [];
    productionModules.value = [];

    isAppDisplayed.value = true;
    const factory = ev.data.factory as FactoryData;
    factoryName.value = factory.name;

    const habitatModulesCount: Map<string, number> = new Map();
    for (const moduleId of factory.habitatModules) {
      if (habitatModulesCount.has(moduleId)) {
        habitatModulesCount.set(moduleId, habitatModulesCount.get(moduleId)! + 1);
      } else {
        habitatModulesCount.set(moduleId, 1);
      }
    }
    habitatModulesCount.forEach((count, moduleId) => {
      habitatModules.value.push({ moduleId, count });
    });

    const storageModulesCount: Map<string, number> = new Map();
    for (const moduleId of factory.storageModules) {
      if (storageModulesCount.has(moduleId)) {
        storageModulesCount.set(moduleId, storageModulesCount.get(moduleId)! + 1);
      } else {
        storageModulesCount.set(moduleId, 1);
      }
    }
    storageModulesCount.forEach((count, moduleId) => {
      storageModules.value.push({ moduleId, count });
    });

    const productionModulesCount: Map<string, number> = new Map();
    for (const moduleId of factory.productionModules) {
      if (productionModulesCount.has(moduleId)) {
        productionModulesCount.set(moduleId, productionModulesCount.get(moduleId)! + 1);
      } else {
        productionModulesCount.set(moduleId, 1);
      }
    }
    productionModulesCount.forEach((count, moduleId) => {
      productionModules.value.push({ moduleId, count });
    });
  }
});

/**
 * 工厂编辑完成，隐藏界面
 */
function finishEditFactory () {
  isAppDisplayed.value = false;
  const outputHabitatModules: string[] = [];
  for (const mod of habitatModules.value) {
    for (let i = 0; i < mod.count; ++i) {
      outputHabitatModules.push(mod.moduleId);
    }
  }
  const outputStorageModules: string[] = [];
  for (const mod of storageModules.value) {
    for (let i = 0; i < mod.count; ++i) {
      outputStorageModules.push(mod.moduleId);
    }
  }
  const outputProductionModules: string[] = [];
  for (const mod of productionModules.value) {
    for (let i = 0; i < mod.count; ++i) {
      outputProductionModules.push(mod.moduleId);
    }
  }
  const outputFactory: FactoryData = {
    name: factoryName.value,
    habitatModules: outputHabitatModules,
    storageModules: outputStorageModules,
    productionModules: outputProductionModules,
  };
  window.postMessage({
    type: 'FINISH_EDIT_FACTORY',
    factory: outputFactory,
  });
}

// ==================== 可选模块列表 ====================

const availableHabitatModules: Ref<{ moduleId: string, moduleName: string }[]> = ref([]);
const availableStorageModules: Ref<{ moduleId: string, moduleName: string }[]> = ref([]);
const availableProductionModules: Ref<{ moduleId: string, moduleName: string }[]> = ref([]);
const moduleData = parseModuleData(rawModuleData);
const moduleIdNameMap: Map<string, string> = new Map();

for (const module of moduleData.habitat) {
  availableHabitatModules.value.push({ moduleId: module.id, moduleName: module.name });
  moduleIdNameMap.set(module.id, module.name);
}
for (const module of moduleData.storage) {
  availableStorageModules.value.push({ moduleId: module.id, moduleName: module.name });
  moduleIdNameMap.set(module.id, module.name);
}
for (const module of moduleData.production) {
  availableProductionModules.value.push({ moduleId: module.id, moduleName: module.name });
  moduleIdNameMap.set(module.id, module.name);
}

function moduleIdToName (moduleId: string): string {
  const moduleName = moduleIdNameMap.get(moduleId);
  return moduleName ? moduleName : moduleId;
}

// ==================== 添加模块 ====================
const selectedHabitatModule = ref('');
const selectedStorageModule = ref('');
const selectedProductionModule = ref('');

function addHabitatModule (ev: MouseEvent) {
  if (!selectedHabitatModule.value) {
    return;
  }
  const moduleId = selectedHabitatModule.value;
  const existingModule = habitatModules.value.find(v => v.moduleId === moduleId);
  if (existingModule) {
    existingModule.count += 1;
    return;
  }
  habitatModules.value.push({ moduleId, count: 1 });
}

function addStorageModule (ev: MouseEvent) {
  if (!selectedStorageModule.value) {
    return;
  }
  const moduleId = selectedStorageModule.value;
  const existingModule = storageModules.value.find(v => v.moduleId === moduleId);
  if (existingModule) {
    existingModule.count += 1;
    return;
  }
  storageModules.value.push({ moduleId, count: 1 });
}

function addProductionModule (ev: MouseEvent) {
  if (!selectedProductionModule.value) {
    return;
  }
  const moduleId = selectedProductionModule.value;
  const existingModule = productionModules.value.find(v => v.moduleId === moduleId);
  if (existingModule) {
    existingModule.count += 1;
    return;
  }
  productionModules.value.push({ moduleId, count: 1 });
}
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
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
}

.factory-modules {
  display: flex;
  justify-content: space-between;
}
</style>
