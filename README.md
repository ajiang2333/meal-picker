# 肥宅随机投喂器

多人共建外卖店铺库、订单评价、统计洞察和随机抽选小程序。

## 当前实时预览

浏览器预览版已经在运行：

```text
http://127.0.0.1:5174
```

这个预览版用于快速看 UI 和流程，数据保存在浏览器 localStorage。

## 技术栈

- 跨端小程序前端：`uni-app + Vue 3 + TypeScript`
- UI 组件库：`uview-plus`，MIT 协议，适配 uni-app 多端小程序
- 图标库：小程序使用 `@dcloudio/uni-ui / uni-icons`（Apache-2.0），浏览器预览使用 `Lucide`（ISC），均为免费开源可商用方案
- 支持目标：微信小程序、支付宝小程序、H5
- 后端：`Node.js + Express + Prisma`
- 开发数据库：SQLite，后续可切 MySQL/PostgreSQL

## 目录

```text
apps/miniapp  跨端小程序前端
apps/api      后端 API 和 Prisma 数据模型
app.js        当前浏览器实时预览版
server.mjs    本地预览服务器
```

## 启动浏览器预览

```powershell
npm run preview
```

如需指定端口：

```powershell
node server.mjs 5174
```

## 启动后端

首次进入后端目录后安装依赖，并初始化数据库：

```powershell
cd apps/api
npm install
copy .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

默认 API 地址：

```text
http://127.0.0.1:8787/api
```

## 启动跨端小程序

```powershell
cd apps/miniapp
npm install
npm run dev:h5
npm run dev:mp-weixin
npm run dev:mp-alipay
```

微信/支付宝发布前，需要在 `apps/miniapp/src/manifest.json` 填入对应平台 `appid`，并把 `apps/miniapp/src/api/client.ts` 里的 API 地址换成线上后端域名。

## 已实现的产品能力

- 多用户登录/切换，订单和评价会显示评价人
- 多用户共同维护店铺库
- 上传订单时，店铺不存在会自动加入店铺库
- 用户可更新店铺资料、标签、用餐时间和备注
- 订单、菜品评分与“不喜欢”标注
- 我的页面查看、编辑、删除我的订单和评价
- 随机抽店支持类型、用餐时间、不喜欢过滤
- 我的页包含折线图、饼图、环形图、条形图统计
- 随机页最近抽选展示店铺、评分、种类、抽选用户和抽选时间
- 我的页抽选记录详情支持滚动加载

## 主要后端接口

```text
POST   /api/auth/login          登录或创建用户
GET    /api/users               用户列表
GET    /api/stores              店铺库列表，支持 keyword/category
GET    /api/stores/:id          店铺详情、菜品、用户评价
PUT    /api/stores/:id          更新共建店铺信息
GET    /api/dishes/:id          菜品详情和评价
GET    /api/orders              我的订单列表
POST   /api/orders              新增订单并同步店铺库
PUT    /api/orders/:id          更新我的订单
DELETE /api/orders/:id          删除我的订单
GET    /api/reviews             我的评价列表
DELETE /api/reviews/:id         删除我的评价
GET    /api/random              抽选店铺，peek=true 时只返回候选数量
GET    /api/random-picks        抽选记录分页列表，支持 take/skip
GET    /api/stats               外卖统计图表数据
POST   /api/ocr/extract         OCR 提取预留接口
```

## OCR 说明

当前 OCR 是原型级：浏览器预览支持上传图片并生成可编辑提取结果，跨端版预留了 `/api/ocr/extract`。真实上线可接微信云托管、阿里云 OCR、百度 OCR 或自建 PaddleOCR。
