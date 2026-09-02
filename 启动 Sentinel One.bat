@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo 未检测到 Node.js 20+。
  echo 请先安装：https://nodejs.org/
  start "" "https://nodejs.org/"
  pause
  exit /b 1
)
if not exist node_modules (
  echo 正在首次安装依赖，请稍候...
  call npm install --omit=dev
  if errorlevel 1 (echo 依赖安装失败 & pause & exit /b 1)
)
set AGENT_OS_ONLY=true
start "Sentinel One" /min cmd /c "node server.js"
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"
echo Sentinel One 已启动，浏览器即将打开。
echo 关闭本窗口不会自动停止服务；可在任务管理器结束 node.exe。
pause
