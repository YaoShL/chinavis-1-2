import XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import three from '../assets/three.json' assert { type: 'json' };

// 配置参数
const config = {
  excelFilePath: path.join(process.cwd(), 'data', '重点建筑.xlsx'), // Excel文件路径
  outputJsonPath: path.join(process.cwd(), 'src/assets', 'buildings.json'), // 输出JSON文件路径
  mergeSameNameBuildings: true, // 是否合并相同名称的建筑
  logProgress: true // 是否打印进度信息
};

// 主函数
function convertExcelToJson() {
  try {
    log('开始处理Excel文件...');
    
    // 确保输出目录存在
    const outputDir = path.dirname(config.outputJsonPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      log(`创建输出目录: ${outputDir}`);
    }
    
    // 读取Excel文件
    const workbook = XLSX.readFile(config.excelFilePath);
    log(`成功读取Excel文件: ${config.excelFilePath}`);
    
    // 获取第一个工作表
    const worksheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[worksheetName];
    log(`处理工作表: ${worksheetName}`);
    
    // 将工作表数据转换为JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    log(`从Excel提取了 ${jsonData.length} 条记录`);
    
    // 转换数据格式
    const convertedData = convertData(jsonData);
    log(`数据转换完成，生成了 ${convertedData.length} 条记录`);
    
    // 写入JSON文件
    fs.writeFileSync(
      config.outputJsonPath,
      JSON.stringify(convertedData, null, 2)
    );
    log(`JSON文件已保存至: ${config.outputJsonPath}`);
    
    return {
      success: true,
      message: 'Excel数据已成功转换为JSON',
      inputFile: config.excelFilePath,
      outputFile: config.outputJsonPath,
      recordCount: convertedData.length
    };
  } catch (error) {
    console.error('转换过程中发生错误:', error);
    return {
      success: false,
      message: '转换过程中发生错误',
      error: error.message
    };
  }
}

// 转换数据格式并合并相同建筑名称的数据
function convertData(data) {
  if (!config.mergeSameNameBuildings) {
    // 不合并相同名称的建筑，直接转换
    return data.map((item, index) => ({
      id: index + 1,
      name: item['建筑名称'] || '',
      lastname: item['建筑历代名称'] || '',
      process: [
        {
          id: 1,
          event: item['历程'] || '',
          time: parseInt(item['时间']) || '',
          content: item['介绍'] || '',
          keywords: []
        }
      ],
      metrics: three.find(three => three.name === item['建筑名称']).metrics
    }));
  }
  
  // 使用Map来按建筑名称分组数据
  const buildingMap = new Map();
  
  data.forEach((item, index) => {
    const buildingName = item['建筑名称'] || '';
    const buildingLastName = item['建筑历代名称'] || '';
    console.log(three.find(three => three.name === item['建筑名称']));
    const buildingmetrics = three.find(three => three.name === item['建筑名称']).metrics;
    
    
    // 创建一个历程对象
    const processItem = {
      id: index + 1,
      event: item['历程'] || '',
      time: parseInt(item['时间']) || '',
      content: item['介绍'] || '',
      keywords: []
    };
    
    // 如果Map中已经有这个建筑名称，将历程添加到现有对象中
    if (buildingMap.has(buildingName)) {
      const buildingData = buildingMap.get(buildingName);
      buildingData.process.push(processItem);
    } else {
      // 否则创建新的建筑对象
      buildingMap.set(buildingName, {
        id: buildingMap.size + 1,
        name: buildingName,
        lastname: buildingLastName,
        process: [processItem],
        metrics: buildingmetrics
      });
    }
  });
  
  // 将Map转换为数组返回
  return Array.from(buildingMap.values());
}

// 辅助函数：根据配置记录日志
function log(message) {
  if (config.logProgress) {
    console.log(`[Excel to JSON] ${message}`);
  }
}

// 执行转换
const result = convertExcelToJson();

// 输出转换结果
console.log('\n转换结果:');
console.log(`  状态: ${result.success ? '成功' : '失败'}`);
console.log(`  消息: ${result.message}`);
if (result.success) {
  console.log(`  输入文件: ${result.inputFile}`);
  console.log(`  输出文件: ${result.outputFile}`);
  console.log(`  记录数量: ${result.recordCount}`);
} else {
  console.log(`  错误: ${result.error}`);
}
