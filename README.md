# csvpost

一個用於讀取CSV檔案並POST到pharmacy-pos API的命令列工具。

## 功能

- 讀取CSV檔案
- 驗證CSV格式
- 將CSV資料透過HTTP POST請求發送到指定API端點
- 支援設定API伺服器位址
- 支援設定預設供應商ID
- 顯示API回應結果
- 提供錯誤處理與日誌記錄

## 安裝

```bash
# 安裝依賴
npm install
```

## 使用方法

```bash
node index.js --csv <csv檔案路徑> --api <API伺服器位址> [--supplier <供應商ID>] [--verbose]
```

### 參數說明

- `--csv`: 必填，指定CSV檔案路徑
- `--api`: 必填，指定API伺服器位址（例如：http://localhost:5000/api/csv-import/shipping-orders）
- `--supplier`: 選填，指定預設供應商ID
- `--verbose`: 選填，顯示詳細日誌

### CSV格式要求

CSV檔案必須包含以下欄位：
- 第一欄: 日期（支援民國年YYYMMDD或西元年YYYY-MM-DD格式）
- 第二欄: 健保碼
- 第三欄: 數量（必須為正整數）
- 第四欄: 健保價（必須為正數）

範例：
```
日期,健保碼,數量,健保價
1140502,BC215311G0,14,2
```

## 範例

```bash
# 基本用法
node index.js --csv ./test.csv --api http://localhost:5000/api/csv-import/shipping-orders

# 指定供應商ID
node index.js --csv ./test.csv --api http://localhost:5000/api/csv-import/shipping-orders --supplier 60f1e5b5e6b3f32d40f6a73c

# 顯示詳細日誌
node index.js --csv ./test.csv --api http://localhost:5000/api/csv-import/shipping-orders --verbose
```

## 開發

本工具使用以下技術：
- Node.js
- axios - HTTP請求客戶端
- form-data - 建立multipart/form-data請求
- csv-parser - CSV解析
- commander - 命令列參數解析
- chalk - 終端機彩色輸出

## 專案結構

```
csvpost/
├── index.js          # 主程式入口
├── lib/
│   ├── csv-reader.js # CSV讀取模組
│   ├── api-client.js # API請求模組
│   └── logger.js     # 日誌模組
├── package.json      # 專案配置
└── README.md         # 使用說明
```
