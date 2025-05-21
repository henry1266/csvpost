/**
 * API客戶端模組
 * 提供與API伺服器通訊功能
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class ApiClient {
  /**
   * 建構子
   * @param {object} logger - 日誌模組實例
   */
  constructor(logger) {
    this.logger = logger;
  }

  /**
   * 發送CSV檔案到API伺服器
   * @param {string} apiUrl - API伺服器位址
   * @param {string} csvFilePath - CSV檔案路徑
   * @param {string} supplierId - 供應商ID (選填)
   * @returns {Promise<object>} API回應
   */
  async postCsvFile(apiUrl, csvFilePath, supplierId = null) {
    try {
      // 檢查檔案是否存在
      if (!fs.existsSync(csvFilePath)) {
        throw new Error(`找不到CSV檔案: ${csvFilePath}`);
      }

      this.logger.debug(`準備發送CSV檔案到 ${apiUrl}`);
      
      // 建立FormData
      const formData = new FormData();
      formData.append('file', fs.createReadStream(csvFilePath));
      
      // 如果有提供供應商ID，則加入請求
      if (supplierId) {
        formData.append('defaultSupplierId', supplierId);
        this.logger.debug(`使用供應商ID: ${supplierId}`);
      }

      // 設定請求標頭
      const headers = {
        ...formData.getHeaders(),
        'Content-Type': 'multipart/form-data'
      };

      // 發送請求
      this.logger.debug('發送POST請求...');
      const response = await axios.post(apiUrl, formData, { headers });
      
      this.logger.debug(`收到回應，狀態碼: ${response.status}`);
      return response.data;
    } catch (error) {
      // 處理API錯誤
      if (error.response) {
        // 伺服器回應錯誤
        this.logger.error(`API回應錯誤 (${error.response.status}): ${JSON.stringify(error.response.data)}`);
        return error.response.data;
      } else if (error.request) {
        // 請求發送但未收到回應
        this.logger.error(`未收到API回應: ${error.message}`);
        throw new Error(`未收到API回應: ${error.message}`);
      } else {
        // 請求設定錯誤
        this.logger.error(`請求設定錯誤: ${error.message}`);
        throw error;
      }
    }
  }
}

module.exports = ApiClient;
