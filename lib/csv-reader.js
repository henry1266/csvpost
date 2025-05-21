/**
 * CSV讀取模組
 * 提供CSV檔案讀取與解析功能
 */

const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');

class CsvReader {
  /**
   * 建構子
   * @param {object} logger - 日誌模組實例
   */
  constructor(logger) {
    this.logger = logger;
  }

  /**
   * 檢查CSV檔案是否存在
   * @param {string} filePath - CSV檔案路徑
   * @returns {boolean} 檔案是否存在
   */
  fileExists(filePath) {
    try {
      return fs.existsSync(filePath);
    } catch (error) {
      this.logger.error(`檢查檔案時發生錯誤: ${error.message}`);
      return false;
    }
  }

  /**
   * 讀取CSV檔案
   * @param {string} filePath - CSV檔案路徑
   * @returns {Promise<Array>} 解析後的CSV資料陣列
   */
  async readCsv(filePath) {
    return new Promise((resolve, reject) => {
      if (!this.fileExists(filePath)) {
        return reject(new Error(`找不到CSV檔案: ${filePath}`));
      }

      const results = [];
      const errors = [];
      let rowCount = 0;

      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => {
          rowCount++;
          const keys = Object.keys(data);
          
          // 確保CSV有至少4個欄位
          if (keys.length >= 4) {
            const rawDate = data[keys[0]] || '';
            const nhCode = data[keys[1]] || '';
            const quantity = parseInt(data[keys[2]], 10) || 0;
            const nhPrice = parseFloat(data[keys[3]]) || 0;

            // 驗證資料有效性
            if (nhCode && quantity > 0 && nhPrice > 0) {
              results.push({
                rawDate,
                nhCode,
                quantity,
                nhPrice
              });
            } else {
              errors.push(`行 ${rowCount}: 資料不完整或格式錯誤 (健保碼: ${nhCode}, 數量: ${quantity}, 健保價: ${nhPrice})`);
            }
          } else {
            errors.push(`行 ${rowCount}: CSV格式不正確，應為"日期,健保碼,數量,健保價"`);
          }
        })
        .on('end', () => {
          this.logger.debug(`CSV讀取完成，共 ${results.length} 筆有效資料，${errors.length} 筆錯誤`);
          
          if (results.length === 0) {
            return reject(new Error('CSV檔案中沒有有效的藥品明細資料'));
          }
          
          resolve({
            data: results,
            errors: errors,
            totalRows: rowCount
          });
        })
        .on('error', (error) => {
          this.logger.error(`讀取CSV檔案時發生錯誤: ${error.message}`);
          reject(error);
        });
    });
  }
}

module.exports = CsvReader;
