#!/usr/bin/env node

/**
 * csvpost 主程式
 * 讀取CSV檔案並POST到pharmacy-pos API
 */

const { program } = require('commander');
const path = require('path');
const fs = require('fs');
const Logger = require('./lib/logger');
const CsvReader = require('./lib/csv-reader');
const ApiClient = require('./lib/api-client');

// 設定命令列參數
program
  .name('csvpost')
  .description('讀取CSV檔案並POST到pharmacy-pos API')
  .version('1.0.0')
  .requiredOption('--csv <file>', 'CSV檔案路徑')
  .requiredOption('--api <url>', 'API伺服器位址')
  .option('--supplier <id>', '預設供應商ID')
  .option('--verbose', '顯示詳細日誌', false)
  .parse(process.argv);

// 取得命令列選項
const options = program.opts();

// 初始化日誌模組
const logger = new Logger({ verbose: options.verbose });

// 主程式
async function main() {
  try {
    logger.info('CSV匯入工具啟動');
    logger.debug(`選項: ${JSON.stringify(options)}`);

    // 檢查CSV檔案路徑
    const csvFilePath = path.resolve(options.csv);
    if (!fs.existsSync(csvFilePath)) {
      logger.error(`找不到CSV檔案: ${csvFilePath}`);
      process.exit(1);
    }
    logger.info(`使用CSV檔案: ${csvFilePath}`);

    // 檢查API位址
    if (!options.api.startsWith('http')) {
      logger.error(`無效的API位址: ${options.api}`);
      process.exit(1);
    }
    logger.info(`使用API位址: ${options.api}`);

    // 初始化CSV讀取模組
    const csvReader = new CsvReader(logger);
    
    // 讀取CSV檔案
    logger.info('開始讀取CSV檔案...');
    const csvResult = await csvReader.readCsv(csvFilePath);
    logger.success(`CSV讀取完成，共 ${csvResult.data.length} 筆有效資料`);
    
    // 顯示CSV內容摘要
    if (csvResult.data.length > 0) {
      logger.debug('CSV資料摘要:');
      logger.debug(`- 總行數: ${csvResult.totalRows}`);
      logger.debug(`- 有效資料: ${csvResult.data.length} 筆`);
      logger.debug(`- 錯誤資料: ${csvResult.errors.length} 筆`);
      
      if (csvResult.errors.length > 0) {
        logger.warn('CSV檔案中存在錯誤資料:');
        csvResult.errors.forEach(error => logger.warn(`  ${error}`));
      }
    }

    // 初始化API客戶端
    const apiClient = new ApiClient(logger);
    
    // 發送CSV檔案到API
    logger.info('開始發送CSV檔案到API...');
    const response = await apiClient.postCsvFile(options.api, csvFilePath, options.supplier);
    
    // 處理API回應
    if (response.success) {
      logger.success('CSV檔案上傳成功');
      logger.divider();
      logger.info('API回應摘要:');
      logger.info(`- 訊息: ${response.msg}`);
      logger.info(`- 訂單號: ${response.shippingOrder.soid}`);
      logger.info(`- 供應商: ${response.shippingOrder.supplier}`);
      logger.info(`- 項目數: ${response.shippingOrder.itemCount}`);
      logger.info(`- 總金額: ${response.shippingOrder.totalAmount || '未提供'}`);
      logger.info(`- 建立時間: ${response.shippingOrder.createdAt}`);
      logger.divider();
      logger.info('匯入摘要:');
      logger.info(`- 總項目: ${response.summary.totalItems}`);
      logger.info(`- 成功項目: ${response.summary.successCount}`);
      logger.info(`- 失敗項目: ${response.summary.failCount}`);
      
      if (response.summary.errors) {
        logger.warn('匯入過程中發生錯誤:');
        response.summary.errors.forEach(error => logger.warn(`  ${error}`));
      }
    } else {
      logger.error(`CSV檔案上傳失敗: ${response.msg}`);
      if (response.error) {
        logger.error(`錯誤詳情: ${response.error}`);
      }
      if (response.errors) {
        logger.error('錯誤列表:');
        response.errors.forEach(error => logger.error(`  ${error}`));
      }
      process.exit(1);
    }
    
    logger.success('處理完成');
  } catch (error) {
    logger.error(`執行過程中發生錯誤: ${error.message}`);
    if (error.stack && options.verbose) {
      logger.debug(`錯誤堆疊: ${error.stack}`);
    }
    process.exit(1);
  }
}

// 執行主程式
main();
