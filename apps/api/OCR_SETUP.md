# 腾讯云 OCR 零付费配置

订单截图使用腾讯云 `GeneralAccurateOCR` 高精度通用文字识别。应用在每个上海时区自然月最多发起 950 次请求，达到上限后返回 HTTP 429，不会继续调用腾讯云。

## 必须先关闭后付费

在腾讯云控制台的“文字识别 OCR > 设置”中关闭后付费，并确认没有购买会自动抵扣的付费资源包。应用内的 950 次限制只是第一层保护；控制台关闭后付费才是资源包耗尽后绝不扣费的最终保障。

腾讯云密钥请使用只允许 OCR 调用的子账号密钥，不要把主账号密钥、`.env` 文件或任何真实密钥提交到 Git。

## 服务器环境变量

将以下内容写入服务器 `apps/api/.env`：

```dotenv
TENCENT_SECRET_ID="替换为子账号 SecretId"
TENCENT_SECRET_KEY="替换为子账号 SecretKey"
TENCENT_OCR_REGION="ap-guangzhou"
OCR_MONTHLY_CALL_LIMIT=950
```

`OCR_MONTHLY_CALL_LIMIT` 只能设置为 1–950 的整数，超过 950 时后端会拒绝启动。联调限额时可临时设为 `2`，测试完成后改回 `950`。

部署新版本时先执行数据库迁移，再启动服务：

```bash
npm run db:deploy
npm run start
```

未配置密钥时接口返回 `ocr_credentials_missing`，不会占用次数，也不会调用腾讯云。

## 多图订单解析

前端每个订单最多选择 6 张截图，并按上传顺序逐张调用 OCR。每张新截图占用 1 次月度额度；同一批截图重复点击解析时复用已识别文字，不会重复调用。识别文字会按坐标重组为行，再提取店铺、时间、实付金额、菜品和价格。
