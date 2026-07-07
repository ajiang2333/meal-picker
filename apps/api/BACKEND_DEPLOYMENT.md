# 外卖抽选小程序后端部署文档

本文记录腾讯云轻量应用服务器 Ubuntu 环境下，部署 `apps/api` 后端服务的完整流程，以及本次部署过程中遇到的问题和处理办法。

后端技术栈：

```text
Node.js + Express + Prisma + SQLite
```

生产数据库默认是服务器上的 SQLite 文件，不需要额外购买云数据库：

```text
/opt/waimai-picker/apps/api/prisma/prod.db
```

## 1. 服务器基础环境

在服务器终端执行：

```bash
sudo apt update
sudo apt install -y curl git nginx sqlite3 tar
```

安装 Node.js 20：

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

检查版本：

```bash
node -v
npm -v
```

建议 Node.js 使用 `v20.x`。不要使用 Node 24，Prisma 相关依赖可能出现兼容问题。

如果安装时卡在 `Which services should be restarted?` 页面，可以先按 `Enter` 确认默认选项。若无法操作，按 `Ctrl + C` 退出后执行：

```bash
sudo dpkg --configure -a
sudo apt -f install -y
```

后续 apt 命令可改用非交互模式：

```bash
sudo bash -c 'export DEBIAN_FRONTEND=noninteractive NEEDRESTART_MODE=a; curl -fsSL https://deb.nodesource.com/setup_20.x | bash -'
sudo env DEBIAN_FRONTEND=noninteractive NEEDRESTART_MODE=a apt install -y nodejs
```

## 2. 腾讯云防火墙

在腾讯云轻量应用服务器控制台，进入实例的防火墙页面，开放：

```text
TCP 22
TCP 80
TCP 443
TCP 8787
```

体验阶段可以临时开放 `8787`，用于直接访问后端接口。后续配置 Nginx + HTTPS 后，可以关闭公网 `8787`，只保留 `80` 和 `443`。

本地 PowerShell 可以检查端口是否可达：

```powershell
Test-NetConnection 服务器公网IP -Port 8787
```

服务器上可以检查进程是否监听端口：

```bash
sudo ss -lntp | grep 8787
```

## 3. 本地打包代码

下面命令适合这个场景：**本地 Windows 电脑打包项目代码，然后上传到 Ubuntu 服务器部署**。

```powershell
# 本地项目目录：改成你自己电脑上项目所在位置。
# 示例：可以填你本机实际项目目录，例如 <你的项目目录>
$ProjectDir = "<你的项目目录>"

# 本地临时压缩包路径：
# $env:TEMP 会自动使用当前 Windows 用户的临时目录，可能在 C 盘，也可能在 D 盘。
# 这样不用在文档里写死作者电脑的盘符，也不用要求每个人都创建固定临时目录。
$PackagePath = "$env:TEMP\waimai-picker.tar.gz"

# 进入项目目录再打包，保证 tar 打包的是当前项目代码。
cd $ProjectDir

# 删除上一次生成的压缩包，避免误上传旧文件。
Remove-Item $PackagePath -Force -ErrorAction SilentlyContinue

# 打包项目代码。
# 压缩包放在项目外的临时目录，避免 tar 一边生成压缩包，一边把压缩包自己打进去。
# 排除 node_modules、构建产物、Git 历史和日志文件；这些内容不需要上传到服务器。
tar.exe `
  --exclude=node_modules `
  --exclude=.git `
  --exclude=apps/api/node_modules `
  --exclude=apps/api/dist `
  --exclude=apps/miniapp/node_modules `
  --exclude=apps/miniapp/dist `
  --exclude=*.log `
  -czf $PackagePath .
```

这里用 `$env:TEMP` 只是为了放临时压缩包，适合“打包后立刻上传服务器”的场景；它不是长期备份目录。

注意压缩包不要生成在项目目录内，否则 `tar` 可能会一边生成压缩包，一边尝试把压缩包自己打进去，导致：

```text
tar.exe: Couldn't open ./waimai-picker.tar.gz: Permission denied
```

如果遇到日志文件被占用，例如：

```text
tar.exe: Couldn't open ./apps/miniapp/preview.out.log: Permission denied
```

可以保留 `--exclude=*.log`，或者关闭本地预览服务后重新打包。

## 4. 上传代码到服务器

把压缩包上传到服务器：

```powershell
scp -o StrictHostKeyChecking=accept-new $PackagePath ubuntu@服务器公网IP:/tmp/
```

如果服务器登录用户是 `root`：

```powershell
scp -o StrictHostKeyChecking=accept-new $PackagePath root@服务器公网IP:/tmp/
```

首次连接如果提示：

```text
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

需要输入完整的 `yes` 后回车。若提示 `password:`，输入密码时不会显示字符，直接输入并回车即可。

如果你只在腾讯云控制台使用一键免密登录，本地 PowerShell 可能没有对应 SSH 私钥。这种情况下可以给服务器设置密码后再用 `scp`，或改用 Git 仓库在服务器上拉取代码。

## 5. 服务器解压项目

在服务器终端执行：

```bash
sudo mkdir -p /opt/waimai-picker
sudo chown -R "$(whoami)":"$(whoami)" /opt/waimai-picker

tar -xzf /tmp/waimai-picker.tar.gz -C /opt/waimai-picker
cd /opt/waimai-picker
```

## 6. 安装依赖并初始化数据库

进入后端目录：

```bash
cd /opt/waimai-picker/apps/api
```

安装依赖：

```bash
npm install
```

创建生产环境变量文件：

```bash
cp .env.production.example .env
```

`.env` 内容应类似：

```env
DATABASE_URL="file:./prod.db"
PORT=8787
NODE_ENV=production
```

初始化 Prisma 和数据库：

```bash
npx prisma generate
npx prisma migrate deploy
npm run build
```

如果首次体验需要演示数据，可以执行一次：

```bash
npm run seed
```

注意：有真实数据后不要随便执行 `npm run seed`，避免覆盖或重置演示数据。

## 7. 手动测试后端

在服务器终端执行：

```bash
node dist/src/index.js
```

另开一个服务器终端测试：

```bash
curl http://127.0.0.1:8787/api/health
```

预期返回：

```json
{"ok":true}
```

如果想从本地浏览器测试：

```text
http://服务器公网IP:8787/api/health
```

测试成功后，在运行 `node dist/src/index.js` 的终端按 `Ctrl + C` 停止手动进程。

## 8. 配置 systemd 常驻运行

复制服务模板：

```bash
sudo cp /opt/waimai-picker/apps/api/deploy/waimai-picker-api.service.example /etc/systemd/system/waimai-picker-api.service
```

把服务用户改成当前登录用户：

```bash
sudo sed -i "s/^User=.*/User=$(whoami)/" /etc/systemd/system/waimai-picker-api.service
```

启动并设置开机自启：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now waimai-picker-api
sudo systemctl status waimai-picker-api --no-pager
```

再次验证：

```bash
curl http://127.0.0.1:8787/api/health
```

查看日志：

```bash
journalctl -u waimai-picker-api -f
```

重启服务：

```bash
sudo systemctl restart waimai-picker-api
```

## 9. 小程序接入后端

本地小程序 API 地址在：

```text
apps/miniapp/src/api/client.ts
```

当前开发默认是：

```ts
const API_BASE = "http://127.0.0.1:8787/api";
```

部署后，体验阶段可以先改为：

```ts
const API_BASE = "http://服务器公网IP:8787/api";
```

微信开发者工具中需要勾选：

```text
不校验合法域名、web-view、TLS 版本以及 HTTPS 证书
```

正式或更稳定的体验版建议使用 HTTPS 域名：

```ts
const API_BASE = "https://api.你的域名.com/api";
```

## 10. 可选：Nginx 反向代理

如果后续绑定域名，可以使用 Nginx 把公网 `80/443` 代理到本地 `8787`。

配置模板在：

```text
apps/api/deploy/nginx.conf.example
```

示例：

```nginx
server {
    listen 80;
    server_name api.你的域名.com;

    location /api/ {
        proxy_pass http://127.0.0.1:8787/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置：

```bash
sudo nano /etc/nginx/sites-available/waimai-picker
sudo ln -s /etc/nginx/sites-available/waimai-picker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

配置 HTTPS 可使用 certbot：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.你的域名.com
```

## 11. 数据库备份

SQLite 数据库文件位置：

```text
/opt/waimai-picker/apps/api/prisma/prod.db
```

手动备份：

```bash
cp /opt/waimai-picker/apps/api/prisma/prod.db /opt/waimai-picker/apps/api/prisma/prod.$(date +%F-%H%M%S).db.bak
```

下载到本地：

```powershell
# 数据库备份下载场景：
# 从服务器取回生产 SQLite 数据库，方便本地备份或排查问题。
# 仍然放到当前用户临时目录，避免在文档里写死个人电脑盘符。
$DbBackupPath = "$env:TEMP\prod.db"

scp ubuntu@服务器公网IP:/opt/waimai-picker/apps/api/prisma/prod.db $DbBackupPath
```

## 12. 后续更新代码

本地重新打包：

```powershell
# 后续更新场景：
# 代码已经改好，只需要重新打包并覆盖上传到服务器 /tmp。
# 这段和首次打包逻辑一致，只是用于后续迭代更新。
$ProjectDir = "<你的项目目录>"
$PackagePath = "$env:TEMP\waimai-picker.tar.gz"

cd $ProjectDir
Remove-Item $PackagePath -Force -ErrorAction SilentlyContinue

tar.exe `
  --exclude=node_modules `
  --exclude=.git `
  --exclude=apps/api/node_modules `
  --exclude=apps/api/dist `
  --exclude=apps/miniapp/node_modules `
  --exclude=apps/miniapp/dist `
  --exclude=*.log `
  -czf $PackagePath .

scp -o StrictHostKeyChecking=accept-new $PackagePath ubuntu@服务器公网IP:/tmp/
```

服务器重新部署：

```bash
cd /opt/waimai-picker
tar -xzf /tmp/waimai-picker.tar.gz -C /opt/waimai-picker

cd /opt/waimai-picker/apps/api
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
sudo systemctl restart waimai-picker-api
curl http://127.0.0.1:8787/api/health
```

也可以在项目根目录执行已有部署脚本：

```bash
cd /opt/waimai-picker
bash apps/api/deploy/deploy-ubuntu.sh
```

## 本次部署遇到的问题汇总

1. Ubuntu 安装依赖时出现 `Which services should be restarted?`
   - 这是系统询问是否重启使用旧库的服务。
   - 默认按 `Enter` 确认即可。
   - 如果页面卡住，用 `Ctrl + C` 退出后执行 `sudo dpkg --configure -a` 和 `sudo apt -f install -y`。

2. 执行 NodeSource 安装脚本时页面卡住
   - 原因通常还是 `needrestart` 弹出交互界面。
   - 可改用 `DEBIAN_FRONTEND=noninteractive NEEDRESTART_MODE=a` 的非交互命令。

3. 本地打包报 `waimai-picker.tar.gz: Permission denied`
   - 原因是压缩包生成在项目目录里，被 `tar` 自己扫描到。
   - 解决：把压缩包生成到项目外目录，例如 `$env:TEMP\waimai-picker.tar.gz`。

4. 本地打包报 `preview.out.log: Permission denied`
   - 原因是本地预览服务正在写日志文件。
   - 解决：打包时加 `--exclude=*.log`，或关闭本地预览服务。

5. PowerShell 是否需要管理员权限
   - 一般不需要。
   - 这些报错主要是文件占用，不是 PowerShell 权限不足。

6. `scp` 首次连接无法输入 `yes`
   - 需要输入完整 `yes`，不是 `y`。
   - 可以使用 `-o StrictHostKeyChecking=accept-new` 跳过首次确认。

7. 使用腾讯云一键免密登录后，本地 `scp` 可能不能免密
   - 控制台免密不等于本地 PowerShell 有 SSH 私钥。
   - 可设置服务器密码、配置本地 SSH 私钥，或使用 Git 拉代码。

8. 如何开第二个服务器终端测试
   - 腾讯云控制台再点一次一键登录即可打开新终端。
   - 或本地 PowerShell 执行 `ssh ubuntu@服务器公网IP`。
