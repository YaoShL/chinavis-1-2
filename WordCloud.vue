<template>
  <div class="chart-box">
    <div class="chart-header">
      <div class="chart-title">
        <i class="fas fa-cloud"></i>
        {{ landmark ? (process ? landmark.name + '：' + process.event + ' 关键词词云' : '请选择历程') : '选择地标查看词云' }}
      </div>
    </div>
    <div class="chart-content">
      <div v-if="process" class="chart" ref="chartEl"></div>
      <div v-else class="chart-placeholder">
        <i class="fas fa-cloud" style="font-size: 3rem;"></i>
        <p>请选择一个地标历程</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import 'echarts-wordcloud';

const props = defineProps({
  landmark: Object,
  process: Object
});

const chartEl = ref(null);
let chartInstance = null;

const destroyChart = () => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
  window.removeEventListener('resize', resizeChart);
};

const resizeChart = () => {
  chartInstance?.resize();
};

const initChart = async () => {
  await nextTick();
  destroyChart();
  if (!chartEl.value) return;
  chartInstance = echarts.init(chartEl.value);
  window.addEventListener('resize', resizeChart);
};

const updateChart = () => {
  if (!chartInstance || !props.process) return;
  // 1. 关键词合并逻辑
  const mergedKeywords = {};
  props.process.keywords.forEach(item => {
    const name = item.name.toLowerCase(); // 转为小写确保不区分大小写
    if (mergedKeywords[name]) {
      // 合并相同词语的价值 (value)
      mergedKeywords[name].value += item.value;
      // 合并text内容 (用逗号分隔不同来源的文本)
      if (item.text) {
        mergedKeywords[name].text = [mergedKeywords[name].text, item.text]
          .filter(Boolean)
          .join(", ");
      }
    } else {
      // 首次出现的词语
      mergedKeywords[name] = { ...item };
      // 确保name字段统一为小写
      mergedKeywords[name].name = name;
    }
  });

  // 转换为数组
  const finalKeywords = Object.values(mergedKeywords);
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
    trigger: 'item',
    formatter: function (params) {
      // 当悬停时显示text内容
      return params.data.text;
    }
  },
    series: [{
      type: 'wordCloud',
      shape: 'circle',
      left: 'center',
      top: 'center',
      width: '90%',
      height: '90%',
      sizeRange: [15, 60],
      rotationRange: [-45, 45],
      rotationStep: 45,
      gridSize: 8,
      drawOutOfBound: false,
      textStyle: {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        color: function () {
          return 'rgb(' + [
            Math.round(Math.random() * 160 + 95),
            Math.round(Math.random() * 160 + 95),
            Math.round(Math.random() * 160 + 95)
          ].join(',') + ')';
        }
      },
      emphasis: {
        focus: 'self',
        textStyle: {
          shadowBlur: 10,
          shadowColor: '#333'
        }
      },
      data: finalKeywords
    }]
  };
  chartInstance.setOption(option);
  
  // 添加点击事件监听
  chartInstance.on('click', function (params) {
    // 点击时显示text内容
    alert(params.data.text);
  });
};

watch(
  () => props.process,
  async (val) => {
    if (val) {
      await initChart();
      updateChart();
    } else {
      destroyChart();
    }
  }
);

onMounted(async () => {
  if (props.process) {
    await initChart();
    updateChart();
  }
});

onUnmounted(() => {
  destroyChart();
});
</script>

<style scoped>
.chart {
  width: 100%;
  height: 400px;
  min-height: 300px;
}
</style>