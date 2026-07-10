# Ubuntu API 部署说明

这份说明只针对后端 API。生产数据库默认放在部署目录内，不会写到系统临时目录：

```text
/opt/waimai-picker/apps/api/prisma/prod.db
```

这个位置由 `apps/api/.env` 里的 `DATABASE_URL="file:./prod.db"` 决定。Prisma 的 SQLite 相对路径会按 `apps/api/prisma/schema.prisma` 所在目录解析。

## 1. 准备服务器

推荐 Node.js 20 或 22。项目的 `package.json` 已限制为 `>=20 <23`，这样可以避开本地 Node 24 下 Prisma 迁移引擎偶发的不兼容问题。

服务器上需要：

```bash
sudo apt update
sudo apt install -y git curl
node -v
npm -v
```

## 2. 放置代码

示例路径用 `/opt/waimai-picker`，你也可以换成自己的目录，但要同步修改 systemd service 里的 `WorkingDirectory`。

```bash
sudo mkdir -p /opt/waimai-picker
sudo chown -R "$USER":"$USER" /opt/waimai-picker
cd /opt/waimai-picker
# git clone <你的仓库地址> .
```

## 3. 安装依赖和配置环境

```bash
cd /opt/waimai-picker
npm ci
cp apps/api/.env.production.example apps/api/.env
```

编辑 `apps/api/.env`：

```env
DATABASE_URL="file:./prod.db"
PORT=8787
NODE_ENV=production
```

## 4. 初始化/升级数据库

```bash
npm run api:prisma:generate
npm run api:db:deploy
```

如果你想先导入演示数据：

```bash
npm run api:seed
```

注意：`seed` 会清空并重建演示数据，只适合首次测试，不要在真实数据上线后随便跑。

## 5. 构建和启动

```bash
npm run api:build
npm run api:start
```

健康检查：

```bash
curl http://127.0.0.1:8787/api/health
```

预期返回：

```json
{"ok":true}
```

## 6. 用 systemd 常驻运行

复制服务模板：

```bash
sudo cp /opt/waimai-picker/apps/api/deploy/waimai-picker-api.service.example /etc/systemd/system/waimai-picker-api.service
sudo nano /etc/systemd/system/waimai-picker-api.service
```

至少确认这些字段：

```ini
User=ubuntu
WorkingDirectory=/opt/waimai-picker/apps/api
ExecStart=/usr/bin/node dist/src/index.js
```

如果 `which node` 不是 `/usr/bin/node`，把 `ExecStart` 改成你的 Node 绝对路径。

启动服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now waimai-picker-api
sudo systemctl status waimai-picker-api
```

看日志：

```bash
journalctl -u waimai-picker-api -f
```

## 7. 小程序接入

正式部署后，把小程序前端里的 API 地址从本地地址换成你的服务器域名或公网 IP：

```text
apps/miniapp/src/api/client.ts
```

当前是：

```ts
const API_BASE = "http://127.0.0.1:8787/api";
```

上线通常会改成：

```ts
const API_BASE = "https://你的域名/api";
```

如果直接用 IP 测试，可以先用：

```ts
const API_BASE = "http://你的服务器公网IP:8787/api";
```

小程序正式发布通常需要 HTTPS 域名，建议后面再加 Nginx 和 SSL。

## 8. 数据备份

SQLite 生产库文件：

```text
/opt/waimai-picker/apps/api/prisma/prod.db
```

最简单的备份方式：

```bash
cp /opt/waimai-picker/apps/api/prisma/prod.db /opt/waimai-picker/apps/api/prisma/prod.$(date +%F-%H%M%S).db.bak
```
## 9. 一键部署脚本

服务器后续更新代码后，可以在仓库根目录执行：

```bash
bash apps/api/deploy/deploy-ubuntu.sh
```

默认部署目录是 `/opt/waimai-picker`，systemd 服务名是 `waimai-picker-api`。如果你换了目录：

```bash
APP_DIR=/home/ubuntu/waimai-picker SERVICE_NAME=waimai-picker-api bash apps/api/deploy/deploy-ubuntu.sh
```

## 10. Nginx 反向代理模板

模板在：

```text
apps/api/deploy/nginx.conf.example
```

把里面的 `example.com` 改成你的域名后，可以放到 `/etc/nginx/sites-available/waimai-picker`。小程序正式发布建议用 HTTPS，后续可以用 certbot 给域名签证书。
## 11. 上传图片和 PUBLIC_BASE_URL

店铺封面、菜品封面会通过接口上传到：

```text
POST /api/uploads/images
```

服务端文件保存目录是：

```text
/opt/waimai-picker/apps/api/uploads
```

这个目录已经在 `.gitignore` 中忽略，不会提交到仓库。上线后建议在 `apps/api/.env` 中设置公网访问地址：

```env
PUBLIC_BASE_URL="https://你的域名"
```

如果暂时用 IP 和端口直连，可以先留空，后端会按请求的 Host 返回图片 URL。使用 Nginx/HTTPS 反代时，建议显式设置 `PUBLIC_BASE_URL`，这样小程序拿到的图片地址会稳定指向公网域名。
