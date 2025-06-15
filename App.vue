<template>
  <div class="dashboard-container">
    <header>
      <h1><i class="fas fa-landmark"></i> 北京地标数据分析</h1>
      <p class="subtitle">探索北京著名地标建筑的文化影响力与认知度</p>
    </header>
    
    <div class="dashboard-content">
      <LandmarkList @select-landmark="handleLandmarkSelect" @select-process="handleProcessSelect" />
      
      <div class="charts-container">
        <template v-if="!showRelationGraph">
          <content :landmark="selectedLandmark" :process="selectedProcess"/>
          <WordCloud :landmark="selectedLandmark" :process="selectedProcess" />
          <RadarChart :landmark="selectedLandmark" />
          <button class="relation-btn" @click="showRelationGraph = true">查看圆明园关系气泡图</button>
        </template>
        <template v-else>
          <RelationGraph :landmark="{ name: '圆明园' }" />
          <button class="relation-btn" @click="showRelationGraph = false">返回</button>
        </template>
      </div>
    </div>
    
    <div class="footer">
      <p>数据来源：北京文化遗产数据库 | 更新时间：2023年10月</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import LandmarkList from './components/LandmarkList.vue';
import WordCloud from './components/WordCloud.vue';
import RadarChart from './components/RadarChart.vue';
import content from './components/content.vue';
import RelationGraph from './components/RelationGraph.vue';

const selectedLandmark = ref(null);
const selectedProcess = ref(null);
const showRelationGraph = ref(false);

const handleLandmarkSelect = (landmark) => {
  selectedLandmark.value = landmark;
  selectedProcess.value = null;
};

const handleProcessSelect = (process) => {
  selectedProcess.value = process;
};
</script>

<style scoped>
.charts-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.relation-btn {
  margin: 40px 0 0 0; /* 将上边距调大，比如40px */
  padding: 10px 24px;
  font-size: 1.1rem;
  background: #ffb74d;
  border: none;
  border-radius: 6px;
  color: #333;
  cursor: pointer;
  transition: background 0.2s;
  display: inline-block;
  width: auto;
  min-width: 180px;
}

.relation-btn:hover {
  background: #ffa726;
}
</style>