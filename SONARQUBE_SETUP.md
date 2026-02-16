# SonarQube Setup Guide

## 📋 Prerequisites

1. **Docker Desktop** - Install and make sure it's running
   - Download: https://www.docker.com/products/docker-desktop
   - Windows: Install Docker Desktop and start it

2. **Node.js & npm** - Already installed ✅

## 🚀 Quick Start

### 1. Start SonarQube Server

```bash
# Start Docker Desktop first (open from Start Menu)

# Start SonarQube container
npm run sonar:start

# Wait 1-2 minutes for SonarQube to initialize
# Check logs to see when it's ready
npm run sonar:logs
```

**Wait for this message in logs:**
```
SonarQube is operational
```

Press `Ctrl+C` to exit logs view.

### 2. Access SonarQube Dashboard

1. Open browser: http://localhost:9000
2. Login with default credentials:
   - **Username:** `admin`
   - **Password:** `admin`
3. You'll be prompted to change password - set a new one

### 3. Generate Authentication Token

1. Click on your profile icon (top right) → **My Account**
2. Go to **Security** tab
3. Click **Generate Token**
   - **Name:** `local-scanner`
   - **Type:** `Global Analysis Token`
   - **Expires in:** `No expiration` (or choose duration)
4. Click **Generate**
5. **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)

### 4. Configure Token

1. Open `sonar-project.properties`
2. Find the last line:
   ```properties
   # sonar.login=your-token-here
   ```
3. Uncomment and paste your token:
   ```properties
   sonar.login=squ_abc123xyz456...
   ```
4. Save the file

### 5. Run Your First Scan

```bash
# Run SonarQube analysis
npm run sonar
```

### 6. View Results

Open http://localhost:9000 and click on **nextjs-api-inspector** project

## 📊 What Gets Analyzed?

SonarQube will scan:

### Backend (src/)
- ✅ `extension.ts` - Extension entry point
- ✅ `SidebarProvider.ts` - Webview provider
- ✅ `providers/` - AI provider abstraction
- ✅ `services/` - AI services
- ✅ `types/` - Type definitions

### Frontend (webview-ui/src/)
- ✅ `App.tsx` - Main React app
- ✅ `components/` - All React components
- ✅ `utils/` - Utility functions
- ✅ `types/` - Frontend types

### What's Excluded?
- ❌ `node_modules/`
- ❌ `dist/`
- ❌ `*.config.js/ts`
- ❌ Test files (when you add them)

## 🔄 Daily Usage

```bash
# Start SonarQube (if not running)
npm run sonar:start

# Make code changes...

# Run analysis
npm run sonar

# View results at http://localhost:9000

# Stop SonarQube when done
npm run sonar:stop
```

## 📝 Available Commands

| Command | Description |
|---------|-------------|
| `npm run sonar:start` | Start SonarQube server |
| `npm run sonar:stop` | Stop SonarQube server |
| `npm run sonar:down` | Stop and remove containers |
| `npm run sonar:logs` | View SonarQube logs |
| `npm run sonar` | Run code analysis |

## 🎯 Quality Metrics

SonarQube will track:

1. **Bugs** 🐛
   - Null pointer exceptions
   - Type errors
   - Logic errors

2. **Vulnerabilities** 🔒
   - Security issues
   - API key exposure
   - Unsafe operations

3. **Code Smells** 👃
   - Duplicate code
   - Complex functions
   - Unused variables
   - Poor naming

4. **Coverage** 📊
   - Test coverage (when you add tests)

5. **Duplications** 📋
   - Duplicate code blocks

## ⚠️ Troubleshooting

### Docker not running
```bash
# Make sure Docker Desktop is running
# Check from Start Menu or System Tray
```

### Port 9000 already in use
```bash
# Find what's using port 9000
netstat -ano | findstr :9000

# Kill the process or change port in docker-compose.yml
```

### Authentication error
```bash
# Make sure token is correctly set in sonar-project.properties
# Check for extra spaces or quotes
```

### Scan fails
```bash
# Check if SonarQube is running
npm run sonar:logs

# Make sure you're in project root directory
cd f:\apitools
npm run sonar
```

## 💡 Best Practices

1. **Scan before commit:**
   ```bash
   npm run sonar
   # Review issues
   git add .
   git commit -m "fix: resolved code smells"
   ```

2. **Set Quality Gates:**
   - In SonarQube dashboard → Quality Gates
   - Set minimum standards (e.g., 0 bugs, 0 vulnerabilities)

3. **Regular scans:**
   - Run `npm run sonar` after significant changes
   - Keep SonarQube running in background

4. **Fix issues incrementally:**
   - Don't try to fix everything at once
   - Focus on Critical and High severity first

## 🔧 Configuration Files

- **`docker-compose.yml`** - Docker container configuration
- **`sonar-project.properties`** - SonarQube project settings
- **`.gitignore`** - Excludes SonarQube working directories

## 📚 Resources

- SonarQube Docs: https://docs.sonarqube.org/
- TypeScript Rules: https://rules.sonarsource.com/typescript
- React Rules: https://rules.sonarsource.com/typescript/tag/react

## 🎉 Next Steps

1. ✅ Start SonarQube
2. ✅ Generate token
3. ✅ Run first scan
4. 📊 Review results
5. 🔧 Fix issues
6. 🔄 Scan again

---

**Happy coding with better quality! 🚀**
