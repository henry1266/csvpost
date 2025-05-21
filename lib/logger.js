/**
 * 日誌模組
 * 提供彩色終端機輸出與日誌記錄功能
 */

const chalk = require('chalk');

class Logger {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
  }

  /**
   * 輸出資訊訊息
   * @param {string} message - 訊息內容
   */
  info(message) {
    console.log(chalk.blue('INFO: ') + message);
  }

  /**
   * 輸出成功訊息
   * @param {string} message - 訊息內容
   */
  success(message) {
    console.log(chalk.green('SUCCESS: ') + message);
  }

  /**
   * 輸出警告訊息
   * @param {string} message - 訊息內容
   */
  warn(message) {
    console.log(chalk.yellow('WARNING: ') + message);
  }

  /**
   * 輸出錯誤訊息
   * @param {string} message - 訊息內容
   */
  error(message) {
    console.log(chalk.red('ERROR: ') + message);
  }

  /**
   * 輸出詳細訊息（僅在verbose模式下顯示）
   * @param {string} message - 訊息內容
   */
  debug(message) {
    if (this.verbose) {
      console.log(chalk.gray('DEBUG: ') + message);
    }
  }

  /**
   * 輸出分隔線
   */
  divider() {
    console.log(chalk.gray('----------------------------------------'));
  }

  /**
   * 輸出JSON資料
   * @param {string} label - 資料標籤
   * @param {object} data - JSON資料
   */
  json(label, data) {
    console.log(chalk.cyan(`${label}:`));
    console.log(JSON.stringify(data, null, 2));
  }
}

module.exports = Logger;
