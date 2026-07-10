# 前端页面公网访问部署文档

本文记录如何通过腾讯云轻量应用服务器的公网 IP 访问前端页面，以及本次配置过程中遇到的问题和处理办法。

目标访问方式：

```text
http://服务器公网IP/          -> 前端页面
http://服务器公网IP:8787/api/ -> 当前前端直连后端接口
http://服务器公网IP/api/      -> 可选 Nginx 后端接口代理
```

后端部署文档见：

```text
apps/api/BACKEND_DEPLOYMENT.md
```

## 1. 前提条件

服务器上需要已经完成：

```text
1. 后端服务已启动
2. http://服务器公网IP:8787/api/health 能返回 {"ok":true}
3. 腾讯云防火墙已开放 TCP 80
4. Nginx 已安装
```

后端服务通常监听：

```text
0.0.0.0:8787 或 127.0.0.1:8787
```

本机 `apps/miniapp/.env.local` 中的接口地址示例：

```text
http://服务器公网IP:8787/api
```

Nginx 对外监听：

```text
0.0.0.0:80
```

## 2. 选择前端来源

本项目有两类前端页面：

```text
根目录浏览器预览版：
/opt/waimai-picker/index.html
/opt/waimai-picker/app.js
/opt/waimai-picker/styles.css

uni-app H5 构建版：
/opt/waimai-picker/apps/miniapp/dist/build/h5/index.html
```

如果只是想最快通过公网 IP 打开页面，可以先使用根目录浏览器预览版：

```nginx
root /opt/waimai-picker;
```

如果想访问 `apps/miniapp` 的 H5 页面，使用 H5 构建目录：

```nginx
root /opt/waimai-picker/apps/miniapp/dist/build/h5;
```

本次最终使用的是 H5 构建目录。

## 3. 构建 H5 前端

在服务器上执行：

```bash
cd /opt/waimai-picker
npm install
npm --workspace apps/miniapp run build:h5
```

构建完成后检查文件是否存在：

```bash
ls -lh /opt/waimai-picker/apps/miniapp/dist/build/h5/index.html
```

如果文件存在，说明 H5 静态页面已经构建成功。

注意：服务器上不要用开发命令作为公网部署方式：

```bash
npm run miniapp:dev:h5
```

这个命令是开发模式，不适合作为公网静态页面部署。公网访问建议使用 `build:h5` 构建出来的静态文件，再由 Nginx 提供访问。

## 4. 配置 Nginx

编辑 Nginx 配置：

```bash
sudo nano /etc/nginx/sites-available/waimai-picker
```

写入或修改为：

```nginx
server {
    listen 80;
    server_name _;

    root /opt/waimai-picker/apps/miniapp/dist/build/h5;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8787/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

保存退出 nano：

```text
Ctrl + O
Enter
Ctrl + X
```

其中：

```nginx
root /opt/waimai-picker/apps/miniapp/dist/build/h5;
```

是 Nginx 配置项，不是 Linux 命令，不能直接在终端执行。

## 5. 启用 Nginx 配置

执行：

```bash
sudo ln -sf /etc/nginx/sites-available/waimai-picker /etc/nginx/sites-enabled/waimai-picker
```

这行命令的意思是：把 `sites-available` 里的可用配置链接到 `sites-enabled`，让 Nginx 实际加载它。

检查配置：

```bash
sudo nginx -t
```

如果看到：

```text
syntax is ok
test is successful
```

说明配置语法正确。

重载 Nginx：

```bash
sudo systemctl reload nginx
```

## 6. 浏览器访问路径

Nginx 的 `root` 已经把 H5 目录映射到网站根路径，所以浏览器访问：

```text
http://服务器公网IP/
```

不要访问：

```text
http://服务器公网IP/apps/miniapp/dist/build/h5
```

因为这个文件路径是服务器内部路径，不是浏览器 URL 路径。

后端代理测试路径：

```text
http://服务器公网IP/api/health
```

预期返回：

```json
{"ok":true}
```

## 7. 本次遇到的问题汇总

### 7.1 `uni: not found`

报错：

```text
sh: 1: uni: not found
```

原因：

```text
服务器上没有安装前端依赖，或者没有从项目根目录安装 workspace 依赖。
```

处理：

```bash
cd /opt/waimai-picker
npm install
npm --workspace apps/miniapp run build:h5
```

同时注意：公网部署应使用 `build:h5`，不是 `dev:h5`。

### 7.2 `Command 'root' not found`

报错：

```text
Command 'root' not found
```

原因：

```text
把 Nginx 配置项 root /path; 当成 Linux 命令执行了。
```

处理：

```text
root /opt/waimai-picker/apps/miniapp/dist/build/h5;
```

应该写入：

```text
/etc/nginx/sites-available/waimai-picker
```

不是直接在终端执行。

### 7.3 `conflicting server name "_" on 0.0.0.0:80, ignored`

提示：

```text
nginx: [warn] conflicting server name "_" on 0.0.0.0:80, ignored
```

这不是失败，只是警告。只要最后出现：

```text
syntax is ok
test is successful
```

说明 Nginx 配置语法没问题。

原因通常是有多个配置都写了：

```nginx
listen 80;
server_name _;
```

建议禁用默认站点：

```bash
ls -l /etc/nginx/sites-enabled/
sudo unlink /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 7.4 访问公网 IP 仍显示 `Welcome to nginx!`

原因：

```text
浏览器访问到的还是 Nginx 默认站点，不是 waimai-picker 配置。
```

处理步骤：

```bash
ls -l /etc/nginx/sites-enabled/
sudo unlink /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/waimai-picker /etc/nginx/sites-enabled/waimai-picker
sudo nginx -t
sudo systemctl reload nginx
```

然后重新访问：

```text
http://服务器公网IP/
```

### 7.5 浏览器应该访问哪个路径

如果 Nginx 配置为：

```nginx
root /opt/waimai-picker/apps/miniapp/dist/build/h5;
```

浏览器访问：

```text
http://服务器公网IP/
```

不要把服务器目录拼到 URL 后面。

## 8. 常用排查命令

查看启用的 Nginx 站点：

```bash
ls -l /etc/nginx/sites-enabled/
```

检查 Nginx 配置：

```bash
sudo nginx -t
```

重载 Nginx：

```bash
sudo systemctl reload nginx
```

查看 Nginx 状态：

```bash
sudo systemctl status nginx --no-pager
```

确认 H5 首页文件存在：

```bash
ls -lh /opt/waimai-picker/apps/miniapp/dist/build/h5/index.html
```

确认后端代理可用：

```bash
curl http://127.0.0.1:8787/api/health
curl http://服务器公网IP:8787/api/health
curl http://服务器公网IP/api/health
```

查看当前 Nginx 实际加载配置：

```bash
sudo nginx -T
```

如果页面还是异常，重点检查：

```text
1. /etc/nginx/sites-enabled/default 是否还存在
2. /etc/nginx/sites-enabled/waimai-picker 是否存在
3. root 指向的目录里是否有 index.html
4. sudo nginx -t 是否通过
5. sudo systemctl reload nginx 是否执行
```





## 小程序本地私有配置

前端源码不提交真实公网 API 地址和真实小程序 AppID。需要连接公网后端或使用自己的小程序 AppID 时，在本机创建：

```text
apps/miniapp/.env.local
```

内容示例：

```text
VITE_API_BASE=http://服务器公网IP:8787/api
VITE_MP_WEIXIN_APPID=wx开头的微信小程序AppID
VITE_MP_ALIPAY_APPID=
```

`.env.local` 已被 git 忽略，只在本机使用。构建脚本会临时注入 AppID，构建完成后还原 `src/manifest.json`。

