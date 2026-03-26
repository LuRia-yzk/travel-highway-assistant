#!/bin/bash

# 高速旅行助手 - 一键部署脚本
# 适用于 Ubuntu/Debian 系统

set -e

echo "======================================"
echo "  高速旅行助手 - 一键部署脚本"
echo "======================================"

# 检查是否以 root 运行
if [ "$EUID" -ne 0 ]; then 
  echo "请使用 sudo 运行此脚本"
  exit 1
fi

# 1. 更新系统
echo "[1/8] 更新系统..."
apt-get update
apt-get upgrade -y

# 2. 安装 Node.js
echo "[2/8] 安装 Node.js..."
curl -sL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 3. 安装依赖工具
echo "[3/8] 安装依赖工具..."
apt-get install -y nginx git curl

# 4. 安装 PM2
echo "[4/8] 安装 PM2..."
npm install -g pm2

# 5. 创建应用目录
echo "[5/8] 创建应用目录..."
mkdir -p /var/www/highway-assistant
cd /var/www/highway-assistant

# 6. 复制代码（假设代码在 /root/travel-highway-assistant）
echo "[6/8] 复制代码..."
cp -r /root/travel-highway-assistant/backend/* /var/www/highway-assistant/

# 7. 安装依赖
echo "[7/8] 安装依赖..."
npm install --production

# 8. 配置环境变量
echo "[8/8] 配置环境变量..."
cp .env.example .env
echo "请编辑 /var/www/highway-assistant/.env 文件配置生产环境参数"

# 启动服务
echo ""
echo "启动服务..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 配置 Nginx
echo ""
echo "配置 Nginx..."
cat > /etc/nginx/sites-available/highway-assistant << 'EOF'
server {
    listen 80;
    server_name your-domain.com;
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

ln -sf /etc/nginx/sites-available/highway-assistant /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

echo ""
echo "======================================"
echo "  部署完成！"
echo "======================================"
echo ""
echo "下一步操作："
echo "1. 编辑配置文件：nano /var/www/highway-assistant/.env"
echo "2. 配置域名：编辑 /etc/nginx/sites-available/highway-assistant"
echo "3. 配置 HTTPS: certbot --nginx -d your-domain.com"
echo "4. 查看服务状态：pm2 status"
echo "5. 查看日志：pm2 logs"
echo ""
echo "服务已启动，访问 http://your-domain.com/api/highway/all 测试"
echo ""