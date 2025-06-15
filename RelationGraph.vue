<template>
  <div class="relation-graph" ref="graphEl"></div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import peopleData from '../assets/people_yuanmingyuan.json';

const props = defineProps({
  landmark: Object // landmark.name = '圆明园'
});

const graphEl = ref(null);
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
  if (!graphEl.value) return;
  chartInstance = echarts.init(graphEl.value);
  window.addEventListener('resize', resizeChart);
};

const updateChart = () => {
  if (!chartInstance || !props.landmark) return;

  // 只显示圆明园相关事件
  const events = peopleData.filter(e => e.location === '圆明园');

  // 手动布局参数
  const centerX = 0.5 * window.innerWidth;
  const centerY = 0.45 * window.innerHeight;
  const eventBubbleRadius = 120;
  const eventSymbolSize = eventBubbleRadius * 2;

  // 自动计算事件分布半径，确保大气泡之间不会重叠
  const minAngle = Math.PI * 2 / Math.max(events.length, 1);
  const minDistance = eventSymbolSize + 40; // 40为安全间距
  const eventRadius = minDistance / (2 * Math.sin(minAngle / 2));

  const personRadius = eventBubbleRadius - 25;   // 小气泡分布半径

  const nodes = [];
  const links = [];

  // 事件节点均匀分布在圆上
  events.forEach((event, idx) => {
    const angle = (2 * Math.PI / events.length) * idx;
    const eventX = centerX + eventRadius * Math.cos(angle);
    const eventY = centerY + eventRadius * Math.sin(angle);
    const eventId = `event-${idx}`;
    nodes.push({
      id: eventId,
      name: event.event,
      category: 0,
      symbolSize: eventSymbolSize,
      x: eventX,
      y: eventY,
      fixed: true,
      label: { 
        fontWeight: 'bold', 
        fontSize: 14,
        position: 'bottom',
        color: '#fff' // 字体为白色
      },
      itemStyle: { color: 'rgba(255,183,77,0.3)' }
    });

    // 人物节点不设坐标，由力导布局自动排布
    const people = event.people || [];

    // 1. 收集所有被关系线连接的人物名
    const relatedNames = new Set();
    people.forEach(person => {
      if (person.relations && person.relations.length > 0) {
        person.relations.forEach(rel => {
          const relName = typeof rel === 'string' ? rel : rel.name;
          relatedNames.add(person.name);
          relatedNames.add(relName);
        });
      }
    });

    // 2. 为每个被连接的人物分配不同颜色
    // 这里简单用两种颜色交替分配
    const highlightColors = ['#e57373', '#64dd17', '#64b5f6', '#ffd600', '#00b8d4'];
    const relatedColorMap = {};
    let colorIdx = 0;
    Array.from(relatedNames).forEach(name => {
      relatedColorMap[name] = highlightColors[colorIdx % highlightColors.length];
      colorIdx++;
    });

    people.forEach((person, pidx) => {
      const personId = `${eventId}-person-${pidx}`;
      const hasRelation = person.relations && person.relations.length > 0;
      // 如果被关系线连接，分配不同颜色，否则用默认色
      const color = relatedNames.has(person.name)
        ? relatedColorMap[person.name]
        : '#64b5f6';
      nodes.push({
        id: personId,
        name: person.name,
        category: 1,
        symbolSize: 40,
        fixed: false,
        label: { fontSize: 13, color: '#fff' }, // 字体为白色
        itemStyle: { color }
      });
      links.push({
        source: eventId,
        target: personId
      });

      // 人物之间的关系连线
      if (person.relations && person.relations.length > 0) {
        person.relations.forEach(rel => {
          const relName = typeof rel === 'string' ? rel : rel.name;
          const relType = typeof rel === 'string' ? '关系' : (rel.relationType || '关系');
          const targetIdx = people.findIndex(p => p.name === relName);
          if (targetIdx !== -1) {
            const targetId = `${eventId}-person-${targetIdx}`;
            if (!links.find(l => l.source === personId && l.target === targetId)) {
              links.push({
                source: personId,
                target: targetId,
                lineStyle: { type: 'dashed', color: '#888' },
                label: {
                  show: true,
                  formatter: relType,
                  fontSize: 12,
                  color: '#888'
                },
                relationType: relType
              });
            }
          }
        });
      }
    });
  });

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        // 连线悬停
        if (params.dataType === 'edge') {
          const sourceNode = nodes.find(n => n.id === params.data.source);
          const targetNode = nodes.find(n => n.id === params.data.target);
          return `${sourceNode?.name || ''} 与 ${targetNode?.name || ''}<br/>关系：${params.data.relationType || '关系'}`;
        }
        // 节点悬停
        return params.data.name;
      }
    },
    series: [{
      type: 'graph',
      layout: 'force', // 用力导布局
      roam: true,
      draggable: false,
      categories: [
        { name: '事件', itemStyle: { color: '#ffb74d' } },
        { name: '人物', itemStyle: { color: '#64b5f6' } }
      ],
      data: nodes,
      links: links,
      label: { show: true },
      emphasis: { focus: 'adjacency' },
      edgeLabel: {
        show: false // 只用 tooltip 展示关系，若想在线上直接显示可设为 true
      },
      force: {
        repulsion: 300,
        gravity: 0.1,
        edgeLength: 80
      }
    }]
  };
  chartInstance.setOption(option);
};

watch(
  () => props.landmark,
  async (val) => {
    if (val && val.name === '圆明园') {
      await initChart();
      updateChart();
    } else {
      destroyChart();
    }
  }
);

onMounted(async () => {
  if (props.landmark && props.landmark.name === '圆明园') {
    await initChart();
    updateChart();
  }
});

onUnmounted(() => {
  destroyChart();
});
</script>

<style scoped>
.relation-graph {
  width: 100%;
  max-width: 900px;
  height: 600px;
  min-height: 400px;
  margin: 0 auto;
  background: transparent; /* 设置为透明 */
  border-radius: 12px;
  box-sizing: border-box;
}
</style>