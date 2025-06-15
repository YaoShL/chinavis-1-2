<template>
  <div class="chart-box">
    <div class="chart-header">
      <div class="chart-title">
        <i class="fas fa-chart-radar"></i> {{ landmark ? landmark.name + ' - 三维指标分析' : '选择地标查看雷达图' }}
      </div>
    </div>
    <div class="chart-content">
      <div v-if="landmark" class="chart" ref="chartEl"></div>
      <div v-else class="chart-placeholder">
        <i class="fas fa-project-diagram" style="font-size: 3rem;"></i>
        <p>请选择一个北京地标</p>
      </div>
    </div>
    <div v-if="landmark" class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ landmark.metrics.influencerank }}</div>
        <div class="stat-label">影响力排名</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ landmark.metrics.importancerank }}</div>
        <div class="stat-label">重要性排名</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ landmark.metrics.awarenessrank }}</div>
        <div class="stat-label">认知度排名</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  landmark: Object
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
  if (!chartInstance || !props.landmark || !props.landmark.metrics) return;
  const metrics = props.landmark.metrics;
  const option = {
    backgroundColor: 'transparent',
    tooltip: {},
    radar: {
      indicator: [
        { name: '影响力', max: 100 },
        { name: '重要性', max: 100 },
        { name: '认知度', max: 100 }
      ],
      radius: '65%',
      axisName: {
        color: '#fff',
        backgroundColor: '#333',
        borderRadius: 3,
        padding: [3, 5]
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    series: [{
      type: 'radar',
      data: [{
        value: [
          metrics.influence ?? 0,
          metrics.importance ?? 0,
          metrics.awareness ?? 0
        ],
        name: props.landmark.name,
        areaStyle: {
          color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
            { offset: 0, color: 'rgba(255, 126, 95, 0.5)' },
            { offset: 1, color: 'rgba(255, 126, 95, 0.1)' }
          ])
        },
        lineStyle: {
          width: 2,
          color: '#ff7e5f'
        },
        itemStyle: {
          color: '#ff7e5f'
        },
        label: {
          show: true,
          formatter: function(params) {
            return params.value;
          },
          position: 'top'
        }
      }]
    }]
  };
  chartInstance.setOption(option);
};

watch(
  () => props.landmark,
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
  if (props.landmark) {
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
.stats-grid {
  display: flex;
  gap: 20px;
  margin-top: 16px;
  justify-content: center;
}
.stat-card {
  background: #222;
  border-radius: 8px;
  padding: 12px 24px;
  color: #fff;
  text-align: center;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
}
.stat-label {
  font-size: 1rem;
  opacity: 0.7;
}
</style>