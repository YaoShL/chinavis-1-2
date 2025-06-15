import XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// 配置参数
const config = {
  excelFilePath: path.join(process.cwd(), 'data', '人物.xlsx'), // Excel文件路径
  outputJsonPath: path.join(process.cwd(), 'src/assets', 'character.json'), // 输出JSON文件路径
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
    return data.map((item, index) => ({
        character: item['人物'] || '',
        dynasty: item['朝代'] || '',
        name: item['建筑名称'] || '',
        text: item['文本'] || ''
    }));
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
