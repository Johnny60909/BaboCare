#!/bin/bash

set -e

# 啟動 Identity (port 81)
ASPNETCORE_URLS="http://+:81" \
ASPNETCORE_ENVIRONMENT="Production" \
dotnet /app/identity/BaboCare.Identity.dll &

IDENTITY_PID=$!

echo "Waiting for Identity service to start..."
sleep 3

# 啟動 Api (port 80)
ASPNETCORE_URLS="http://+:80" \
ASPNETCORE_ENVIRONMENT="Production" \
dotnet /app/api/BaboCare.Api.dll &

API_PID=$!

# 監聽所有背景進程
wait