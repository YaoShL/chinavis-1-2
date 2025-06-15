<template>
  <div class="chart-box">
    <div class="chart-header">
      <div class="chart-title">
        <i class="fas fa-chart-radar"></i> {{ landmark ? (process? landmark.name + '：' +process.event + ' 历程介绍' : '请选择历程' ) : '请选择地标'}}
      </div>
    </div>
    
    <div class="chart-content">
      <div v-if="process" class="content">
        {{ process.content }}
      </div>
      <div v-else class="chart-placeholder">
        <i class="fas fa-cloud" style="font-size: 3rem;"></i>
        <p>请选择一个地标历程</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue';
const props = defineProps({
  landmark: Object,
  process: Object
});
watch(() => props.process, () => {
  if (props.process) {
    console.log(props.process.time)
    console.log(props.process.content)
  }
});
</script>