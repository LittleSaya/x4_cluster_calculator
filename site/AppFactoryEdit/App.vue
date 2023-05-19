<template>
  <div
    :style="{ display: isAppDisplayed ? 'flex' : 'none' }"
    class="container"
  >
    <div class="factory-modules">
      <div class="habitat-modules">
        <div>居住模块</div>
        <select v-model="selectedHabitatModule">
          <option v-for="mod of availableHabitatModules" :key="mod.moduleId" :value="mod.moduleId">{{ mod.moduleName }}</option>
        </select>
        <button @click="addHabitatModule" style="margin-left: 0.5em;">+</button>
        <ol>
          <li v-for="(mod, index) of habitatModules" :key="mod.moduleId" @click="removeHabitatModule(index)">
            {{ moduleIdToName(mod.moduleId) }} x {{ mod.count }}
          </li>
        </ol>
      </div>
      <div class="storage-modules">
        <div>仓储模块</div>
        <select v-model="selectedStorageModule">
          <option v-for="mod of availableStorageModules" :key="mod.moduleId" :value="mod.moduleId">{{ mod.moduleName }}</option>
        </select>
        <button @click="addStorageModule" style="margin-left: 0.5em;">+</button>
        <ol>
          <li v-for="(mod, index) of storageModules" :key="mod.moduleId" @click="removeStorageModule(index)">
            {{ moduleIdToName(mod.moduleId) }} x {{ mod.count }}
          </li>
        </ol>
      </div>
      <div class="production-modules">
        <div>生产模块</div>
        <select v-model="selectedProductionModule">
          <option v-for="mod of availableProductionModules" :key="mod.moduleId" :value="mod.moduleId">{{ mod.moduleName }}</option>
        </select>
        <button @click="addProductionModule" style="margin-left: 0.5em;">+</button>
        <ol>
          <li v-for="(mod, index) of productionModules" :key="mod.moduleId" @click="removeProductionModule(index)">
            {{ moduleIdToName(mod.moduleId) }} x {{ mod.count }}
          </li>
        </ol>
      </div>
      <div class="statistics">
        <Statistics
          :habitatModules="habitatModules"
          :productionModules="productionModules"
          :storageModules="storageModules"
          ref="statistics"
        />
      </div>
    </div>
    <div class="actions">
      工厂名称：<input v-model="factoryName" style="width: 24em;" />
      <button @click="finishEditFactory" style="margin-left: 0.5em;">完成编辑</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, nextTick, ref } from 'vue'
import { FactoryData } from '../types/FactoryData'
import { getParsedModuleArray } from '@/site/util/module_data_parser'
import Statistics from './Statistics.vue'

let statistics = ref<InstanceType<typeof Statistics> | null>(null);

// ==================== 进入和离开页面 ====================

/**
 * 是否显示界面
 */
const isAppDisplayed = ref(false);

const factoryName: Ref<string> = ref('');
const habitatModules: Ref<{ moduleId: string, count: number }[]> = ref([]);
const storageModules: Ref<{ moduleId: string, count: number }[]> = ref([]);
const productionModules: Ref<{ moduleId: string, count: number }[]> = ref([]);
let currentWorkforce = 0; // 当前劳动力，由外部将初始值传入Statistics组件，完成编辑时再从Statistics组件内取出

// 监听编辑工厂的消息，消息传来时显示界面
window.addEventListener('message', ev => {
  if (ev.data.type === 'START_EDIT_FACTORY') {
    // 清空数据
    factoryName.value = '';
    habitatModules.value = [];
    storageModules.value = [];
    productionModules.value = [];
    currentWorkforce = 0;

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

    currentWorkforce = factory.currentWorkforce;
    nextTick(() => {
      statistics.value.setCurrentWorkforce(currentWorkforce);
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
    currentWorkforce: statistics.value.getCurrentWorkforce(),
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
const moduleData = getParsedModuleArray();
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

// ==================== 移除模块 ====================
function removeHabitatModule (index: number) {
  if (habitatModules.value[index].count === 1) {
    habitatModules.value.splice(index, 1);
  } else {
    habitatModules.value[index].count -= 1;
  }
}

function removeStorageModule (index: number) {
  if (storageModules.value[index].count === 1) {
    storageModules.value.splice(index, 1);
  } else {
    storageModules.value[index].count -= 1;
  }
}

function removeProductionModule (index: number) {
  if (productionModules.value[index].count === 1) {
    productionModules.value.splice(index, 1);
  } else {
    productionModules.value[index].count -= 1;
  }
}
</script>

<style scoped>
@import '../vue-common.css';

.factory-modules {
  display: flex;
  justify-content: space-between;
}

.factory-modules > div {
  width: 25%;
}
</style>
