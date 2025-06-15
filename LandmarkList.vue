<template>
  <div class="landmarks-panel">
    <div class="search-box">
      <i class="fas fa-search"></i>
      <input 
        type="text" 
        placeholder="搜索地标..." 
        v-model="searchQuery"
      >
    </div>
    
    <div class="landmarks-list">
      <div 
        class="landmark-item"
        v-for="landmark in filteredLandmarks" 
        :key="landmark.id"
        :class="{ active: selectedLandmarkId == landmark.id }"
        @click.stop="selectLandmark(landmark)"
      >
        <div class="landmark-name">
          <i class="fas fa-monument"></i> {{ landmark.name }}
        </div>
        <div class="landmark-info">
          <span>曾用名: {{ landmark.lastname }}</span>
        </div>

        <!-- 历程下拉列表 -->
        <div class="process-list" v-if="openedProcessId == landmark.id">
          <div 
            class="process-item" 
            v-for="process in landmark.process" 
            :key="process.id"
            :class="{ selected: selectedProcessId == process.id}"
            @click.stop="selectProcess(process)"
          >
            <span>{{ process.event }}</span>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits} from 'vue';
import landmarks from '../assets/data.json';

const emit = defineEmits(['select-landmark','select-process']);

// 搜索查询
const searchQuery = ref('');
const selectedLandmarkId = ref(null);
const openedProcessId = ref(null);
const selectedProcessId = ref(null);

// 过滤后的地标列表
const filteredLandmarks = computed(() => {
  if (!searchQuery.value) return landmarks;
  const query = searchQuery.value.toLowerCase();
  return landmarks.filter(
    landmark => landmark.name.toLowerCase().includes(query)
  );
});

// 选择地标
const selectLandmark = (landmark) => {
  if (selectedLandmarkId.value == landmark.id){
    selectedProcessId.value = null;
    selectedLandmarkId.value = null;
    openedProcessId.value = null;
    emit('select-landmark', null)
  }
  else{
    selectedProcessId.value = null;
    selectedLandmarkId.value = landmark.id;
    openedProcessId.value = landmark.id;
    emit('select-landmark', landmark);
  }
};

// 选择历程
const selectProcess = (process) => {
  if (selectedProcessId.value == process.id){
    selectedProcessId.value = null;
    emit('select-process', null);
  }
  else{
    selectedProcessId.value = process.id;
    emit('select-process', process);
  }
};
</script>

<style scoped>
.landmarks-panel {
  flex: 0 0 300px;
  background: rgba(25, 30, 50, 0.8);
  border-radius: 15px;
  padding: 25px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 搜索框样式 */
.search-box {
  position: relative;
  margin-bottom: 25px;
}

.search-box input {
  width: 100%;
  padding: 12px 15px 12px 45px;
  border-radius: 50px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  backdrop-filter: blur(5px);
}

.search-box i {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #aaa;
}

/* 地标列表样式 */
.landmarks-list {
  overflow-y: auto;
  flex-grow: 1;
}

.landmark-item {
  padding: 15px 20px;
  margin-bottom: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.landmark-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.landmark-item.active {
  background: rgba(255, 126, 95, 0.15);
  border-left: 3px solid #ff7e5f;
  box-shadow: 0 5px 15px rgba(255, 126, 95, 0.2);
}

.landmark-name {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.landmark-name i {
  color: #ff7e5f;
}

.landmark-info {
  font-size: 0.85rem;
  opacity: 0.7;
  display: flex;
  justify-content: space-between;
}

/* 地标历程列表样式 */
.process-list {
  overflow-y: auto;
  flex-grow: 1;
}

.process-item {
  padding: 15px 20px;
  margin: 10px;
  background: rgba(160, 157, 157, 0.271);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.process-item:last-child {
  border-bottom: none;
}

.process-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.process-item.selected {
  background: rgba(255, 0, 0, 0.15);
  border-left: 3px solid #ff7e5f;
  box-shadow: 0 5px 15px rgba(255, 126, 95, 0.2);
}
</style>