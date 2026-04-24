# =============================================
# Stage 1: Build
# =============================================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# 複製專案檔並還原相依套件（利用 Docker layer cache）
COPY src/BaboCare.Domain/BaboCare.Domain.csproj             src/BaboCare.Domain/
COPY src/BaboCare.Application/BaboCare.Application.csproj   src/BaboCare.Application/
COPY src/BaboCare.Infrastructure/BaboCare.Infrastructure.csproj src/BaboCare.Infrastructure/
COPY src/BaboCare.Api/BaboCare.Api.csproj                   src/BaboCare.Api/
COPY src/BaboCare.Identity/BaboCare.Identity.csproj         src/BaboCare.Identity/

RUN dotnet restore src/BaboCare.Api/BaboCare.Api.csproj
RUN dotnet restore src/BaboCare.Identity/BaboCare.Identity.csproj

# 複製全部原始碼
COPY . .

# 發佈 Api
RUN dotnet publish src/BaboCare.Api/BaboCare.Api.csproj \
    -c Release -o /app/api --no-restore

# 發佈 Identity
RUN dotnet publish src/BaboCare.Identity/BaboCare.Identity.csproj \
    -c Release -o /app/identity --no-restore

# =============================================
# Stage 2: Runtime
# =============================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# 複製發佈產物
COPY --from=build /app/api      ./api
COPY --from=build /app/identity ./identity

# 複製啟動腳本
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# 開放 port
# 80  = BaboCare.Api
# 81  = BaboCare.Identity (僅容器內部使用，由 YARP 轉發)
EXPOSE 80 81

ENTRYPOINT ["/bin/sh", "/app/start.sh"]
