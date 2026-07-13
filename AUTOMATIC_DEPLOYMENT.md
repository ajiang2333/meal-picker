# GitHub Actions 自动部署

## 自动部署会做什么

```text
本地开发
→ 推送 GitHub
→ 自动构建 API 和 H5
→ 仅 main 分支部署
→ 上传腾讯云
→ 备份 SQLite
→ 执行数据库迁移
→ 构建前后端
→ 重启 systemd
→ 检查 /api/health
```


本项目的自动化流程如下：

- 所有分支的 push 和 Pull Request 都会安装依赖并构建 API、H5。
- 只有 `main` 分支检查通过后，才会部署到 GitHub `production` Environment。
- 部署包不会包含生产 `.env`、SQLite 数据库或 `apps/api/uploads`。
- 服务器部署前会备份 SQLite，使用文件锁阻止并发部署，完成后检查 `/api/health`。

## 1. 创建部署专用 SSH 密钥

在本地 PowerShell 执行：

```powershell
ssh-keygen -t ed25519 -C "github-actions-waimai-picker" -f "$HOME\.ssh\waimai_picker_deploy"
```

建议不给该自动化密钥设置密码。把公钥安装到服务器：

```powershell
Get-Content "$HOME\.ssh\waimai_picker_deploy.pub" | ssh ubuntu@<SERVER_HOST> "umask 077; mkdir -p ~/.ssh; cat >> ~/.ssh/authorized_keys"
```

确认新密钥可以登录：

```powershell
ssh -i "$HOME\.ssh\waimai_picker_deploy" ubuntu@<SERVER_HOST>
```

## 2. 获取服务器主机公钥

在本地执行并核对输出是已连接过的服务器：

```powershell
ssh-keyscan -H <SERVER_HOST>
```

将完整输出用于下面的 `SERVER_KNOWN_HOSTS`。不要在 Actions 中临时执行 `ssh-keyscan`，否则无法可靠确认连接的是目标服务器。

## 3. 创建 production Environment

在 GitHub 仓库进入：

```text
Settings -> Environments -> New environment -> production
```

如需每次上线前手动确认，可在 `production` 中设置 Required reviewers。不需要确认就保持关闭。

在 `production` 的 Environment secrets 中添加：

| 名称 | 内容 |
| --- | --- |
| `SERVER_HOST` | `<SERVER_HOST>` |
| `SERVER_USER` | 服务器登录用户，例如 `ubuntu` |
| `SERVER_SSH_KEY` | `waimai_picker_deploy` 私钥的完整内容 |
| `SERVER_KNOWN_HOSTS` | `ssh-keyscan -H <SERVER_HOST>` 的完整输出 |

如果 SSH 不是默认的 22 端口，在 Environment variables 中添加 `SERVER_PORT`；默认端口无需添加。

## 4. 服务器一次性检查

自动部署沿用 `/opt/waimai-picker`、Nginx 和 `waimai-picker-api.service`。服务器用户需要：

- 能写入 `/opt/waimai-picker` 和 `/tmp`。
- 能无交互执行 `sudo systemctl restart/status waimai-picker-api` 和读取该服务日志。
- 已安装 Node.js 20、npm、curl、tar、`flock`，建议安装 `sqlite3`。
- 已存在正确的 `/opt/waimai-picker/apps/api/.env`。

可以在服务器检查：

```bash
test -w /opt/waimai-picker
node --version
curl http://127.0.0.1:8787/api/health
sudo -n systemctl status waimai-picker-api --no-pager
```

如果最后一条命令要求密码，需要使用 `sudo visudo` 为部署用户配置针对该服务的最小化免密权限。

## 5. 首次发布

提交以下文件并推送到 `main`：

```text
.github/workflows/ci-deploy.yml
apps/api/deploy/deploy-ubuntu.sh
AUTOMATIC_DEPLOYMENT.md
```

在 GitHub 仓库的 Actions 页面查看 `CI and production deploy`。成功后会显示构建和生产部署均为绿色。

日常开发可以使用 `feature/*` 或 `dev` 分支；这些分支只检查，不会部署。代码合并进 `main` 后才会上线。

也可以在 Actions 页面通过 `Run workflow` 手动重新部署 `main`。

## 6. 数据和故障排查

部署前数据库备份保存到：

```text
/opt/waimai-picker/backups/prod-before-<commit-sha>.db
```

部署包采用覆盖更新，但不会删除服务器上的旧文件，也不会覆盖 `.env`、数据库和上传目录。健康检查失败时，Actions 会失败，并输出最近 80 行 systemd 服务日志。数据库迁移不会自动回滚；涉及破坏性 schema 变更时应先人工备份和验证。

## 7. 逐步验收与常见错误

本节用于检查第 1～6 步是否完成，并集中记录自动部署配置过程中常见的问题。原有操作步骤仍以前文为准。

### 7.1 第一步：创建并安装部署 SSH 密钥

#### 成功标准

本地存在以下两个文件：

```text
$HOME\.ssh\waimai_picker_deploy
$HOME\.ssh\waimai_picker_deploy.pub
```

在本地 PowerShell 检查：

```powershell
Test-Path "$HOME\.ssh\waimai_picker_deploy"
Test-Path "$HOME\.ssh\waimai_picker_deploy.pub"
```

两个结果都应该是 `True`。

使用部署私钥连接服务器：

```powershell
& "$env:WINDIR\System32\OpenSSH\ssh.exe" `
  -i "$HOME\.ssh\waimai_picker_deploy" `
  ubuntu@<SERVER_HOST>
```

成功时不需要输入服务器密码即可登录。如果实际服务器用户不是 `ubuntu`，需要把命令和 GitHub Secret `SERVER_USER` 改为实际用户。

#### 私钥和公钥的区别

```text
waimai_picker_deploy       私钥，存入 GitHub SERVER_SSH_KEY
waimai_picker_deploy.pub   公钥，安装到腾讯云服务器
```

复制私钥到剪贴板：

```powershell
Get-Content "$HOME\.ssh\waimai_picker_deploy" -Raw | Set-Clipboard
```

私钥完整内容应包含：

```text
-----BEGIN OPENSSH PRIVATE KEY-----
中间的多行内容
-----END OPENSSH PRIVATE KEY-----
```

私钥不能提交到 Git、发送给他人或粘贴到公开日志中。

#### 常见错误：`Connection closed`

错误示例：

```text
Connection closed by <SERVER_HOST> port 22
```

先检查服务器 22 端口：

```powershell
Test-NetConnection <SERVER_HOST> -Port 22
```

重点检查：

- 腾讯云防火墙是否开放 TCP 22。
- 登录用户是否正确。
- 公钥是否安装到了该用户的 `~/.ssh/authorized_keys`。
- GitHub 的 `SERVER_USER` 是否和安装公钥的用户一致。
- 是否使用了 Windows 自带 OpenSSH。

如果命令安装公钥失败，可以通过腾讯云控制台登录服务器，手动执行：

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
```

粘贴 `waimai_picker_deploy.pub` 的完整一行，然后执行：

```bash
chmod 600 ~/.ssh/authorized_keys
```

### 7.2 第二步：获取服务器主机公钥

#### 这一步的作用

这一步用于让 GitHub Actions 验证连接的服务器确实是目标腾讯云服务器。

- `waimai_picker_deploy.pub`：服务器用它验证 GitHub Actions。
- `SERVER_KNOWN_HOSTS`：GitHub Actions 用它验证腾讯云服务器。

#### 成功标准

执行：

```powershell
ssh-keyscan -H <SERVER_HOST>
```

应得到一行或多行主机公钥，例如：

```text
<SERVER_HOST> ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA...
```

把有效公钥行完整保存到 GitHub Secret `SERVER_KNOWN_HOSTS`，不要把注释和错误信息一起保存。

#### 常见错误：`unsupported KEX method`

错误示例：

```text
choose_kex: unsupported KEX method sntrup761x25519-sha512@openssh.com
```

这通常表示本地调用的 `ssh-keyscan` 版本或 SSH 配置不兼容。先尝试 Windows 自带工具：

```powershell
& "$env:WINDIR\System32\OpenSSH\ssh-keyscan.exe" `
  -T 10 `
  -t ed25519 `
  <SERVER_HOST>
```

如果仍然失败，在腾讯云服务器终端执行：

```bash
sudo awk '{print "<SERVER_HOST> "$1" "$2}' \
  /etc/ssh/ssh_host_ed25519_key.pub
```

只复制类似下面的公钥行：

```text
<SERVER_HOST> ssh-ed25519 AAAAC3Nza...
```

不要复制 SSH 版本注释或 `choose_kex` 错误信息。

### 7.3 第三步：配置 production Environment

#### 成功标准

GitHub 仓库中存在：

```text
Settings -> Environments -> production
```

`production` 中存在以下 Environment secrets：

| 名称 | 成功标准 |
| --- | --- |
| `SERVER_HOST` | 填写服务器 IP `<SERVER_HOST>` |
| `SERVER_USER` | 与安装公钥时使用的服务器用户一致 |
| `SERVER_SSH_KEY` | 填写无 `.pub` 后缀的完整私钥 |
| `SERVER_KNOWN_HOSTS` | 填写第二步得到的服务器主机公钥 |

如果 SSH 使用默认 22 端口，不需要添加 `SERVER_PORT`。如果不是 22 端口，需要在 Environment variables 中添加 `SERVER_PORT`。

#### 常见错误：填错 SSH 密钥

错误做法是把 `waimai_picker_deploy.pub` 填入 `SERVER_SSH_KEY`。正确做法是把无 `.pub` 后缀的 `waimai_picker_deploy` 完整内容填入 `SERVER_SSH_KEY`。

#### 常见错误：Secret 添加到了错误位置

建议添加到：

```text
production -> Environment secrets
```

工作流的部署任务使用 `production` Environment，因此生产服务器 Secrets 应配置在该 Environment 中。

### 7.4 第四步：服务器一次性检查

“一次性检查”只需在首次启用自动部署前执行。命令应在腾讯云服务器终端运行，不是在本地 PowerShell 运行。

#### 目录写权限

检查：

```bash
test -w /opt/waimai-picker
```

该命令没有输出是正常的，它通过退出码表示结果。紧接着执行：

```bash
echo $?
```

- `0`：目录可写。
- `1`：目录不可写或目录不存在。

也可以使用带提示的版本：

```bash
test -w /opt/waimai-picker \
  && echo "✅ 项目目录可写" \
  || echo "❌ 项目目录不可写"
```

如果不可写，先检查：

```bash
whoami
ls -ld /opt/waimai-picker
```

确认无误后再按实际部署用户调整目录所有者。

#### Node.js 版本

```bash
node --version
```

成功标准为 `v20.x.x`，项目建议使用 Node.js 20。

#### 后端健康检查

```bash
curl http://127.0.0.1:8787/api/health
```

成功标准：

```json
{"ok":true}
```

如果失败，检查服务：

```bash
sudo systemctl status waimai-picker-api --no-pager
sudo journalctl -u waimai-picker-api -n 80 --no-pager
```

#### systemd 和 sudo 权限

```bash
sudo -n systemctl status waimai-picker-api --no-pager
```

成功标准：

- 输出包含 `Active: active (running)`。
- 不要求输入密码。
- 不出现 `sudo: a password is required`。

自动部署无法交互输入 sudo 密码，因此下面的命令必须能够无交互执行：

```bash
sudo -n systemctl restart waimai-picker-api
```

#### 生产环境变量

```bash
test -f /opt/waimai-picker/apps/api/.env \
  && echo "✅ 生产环境变量存在" \
  || echo "❌ 缺少生产环境变量"
```

成功标准为 `✅ 生产环境变量存在`。

#### 部署工具

```bash
command -v npm curl tar flock sqlite3
```

正常会输出各工具的安装路径。`sqlite3` 用于在部署前创建一致的数据库备份。

### 7.5 第五步：首次发布

#### 推送前检查

- 部署公钥已经安装到服务器。
- 部署私钥可以无密码登录服务器。
- `production` 中的四个 Secrets 已配置。
- `/opt/waimai-picker` 对部署用户可写。
- Node.js 版本正确。
- `/api/health` 返回正常。
- `sudo -n` 不要求密码。
- `/opt/waimai-picker/apps/api/.env` 存在。
- 当前准备提交的业务修改都适合一起上线。

#### 成功标准

在 GitHub 仓库进入：

```text
Actions -> CI and production deploy
```

应看到：

```text
Build API and H5    成功
Deploy production   成功
```

`dev`、`feature/*` 和 Pull Request 只执行构建检查，不部署生产服务器。

#### 常见错误：首次推送立即失败

如果 Secrets 尚未配置就把工作流推送到 `main`，部署任务可能立即失败。这种失败通常不会修改服务器，完成 Secrets 配置后可以在 Actions 页面重新运行工作流。

### 7.6 第六步：部署结果和数据安全

#### 成功标准

部署完成后检查：

```bash
curl http://127.0.0.1:8787/api/health
```

应返回：

```json
{"ok":true}
```

数据库备份应位于：

```text
/opt/waimai-picker/backups/prod-before-<commit-sha>.db
```

自动部署不会覆盖：

```text
/opt/waimai-picker/apps/api/.env
/opt/waimai-picker/apps/api/prisma/prod.db
/opt/waimai-picker/apps/api/uploads
```

#### 常见错误对照

| 错误 | 常见原因 | 优先检查 |
| --- | --- | --- |
| `Permission denied (publickey)` | 公钥未安装、用户错误或私钥填错 | `SERVER_USER`、`SERVER_SSH_KEY` |
| `Host key verification failed` | 主机公钥不正确 | `SERVER_KNOWN_HOSTS` |
| `Connection closed` | SSH 用户、服务器规则或客户端问题 | 22 端口、用户、公钥 |
| `sudo: a password is required` | 没有无交互 sudo 权限 | `sudo -n systemctl` |
| `Another deployment is already running` | 上一次部署尚未结束 | 等待上一次 Actions 完成 |
| `npm ci` 失败 | Node/npm 或锁文件问题 | Node 20、`package-lock.json` |
| Prisma migration 失败 | 数据库权限或迁移冲突 | Prisma 日志和数据库权限 |
| 健康检查失败 | 服务启动、端口或 `.env` 异常 | systemd 日志 |

查看最近服务日志：

```bash
sudo journalctl -u waimai-picker-api -n 100 --no-pager
```

检查服务状态：

```bash
sudo systemctl status waimai-picker-api --no-pager
```

数据库 migration 不会自动回滚。涉及删除字段、重建表等破坏性变更时，应先人工验证并保留额外备份。
