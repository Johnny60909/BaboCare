# =============================================
# Stage 1: Build
# =============================================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# 複製專案檔並還原相依套件（利用 Docker layer cache）
COPY src/BaboCare.Domain/BaboCare.Domain.csproj             src/BaboCare.Domain/
COPY src/BaboCare.Application/BaboCare.Application.csproj   src/BaboCare.Application/
COPY src/BaboCare.Infrastructure/BaboCare.Infrastructure.csproj src/BaboCare.Infrastructure/
COPY src/BaboCare.Identity/BaboCare.Identity.csproj         src/BaboCare.Identity/
COPY src/BaboCare.Api/BaboCare.Api.csproj                   src/BaboCare.Api/

RUN dotnet restore src/BaboCare.Api/BaboCare.Api.csproj

# 複製全部原始碼
COPY . .

# 發佈 Api（Identity 已作為類別庫包含在內）
RUN dotnet publish src/BaboCare.Api/BaboCare.Api.csproj \
    -c Release -o /app/api --no-restore

# =============================================
# Stage 2: Runtime
# =============================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# 複製發佈產物
COPY --from=build /app/api ./

EXPOSE 80

ENTRYPOINT ["dotnet", "BaboCare.Api.dll"]
