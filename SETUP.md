# Setup Guide - NextJS API Inspector

## 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install webview dependencies
cd webview-ui
npm install
cd ..
```

## 2. Build the Extension

```bash
# Build everything
npm run build

# Or build separately
npm run build:extension
npm run build:webview
```

## 3. Configure Google Gemini API Key

### Method 1: VS Code Settings UI
1. Open VS Code Settings: `Ctrl + ,` (or `Cmd + ,` on Mac)
2. Search for: `NextJS API Inspector`
3. Enter your API key in the field: `Gemini Api Key`

### Method 2: Settings JSON
1. Open Command Palette: `Ctrl + Shift + P`
2. Type: `Preferences: Open Settings (JSON)`
3. Add this configuration:
```json
{
  "nextjsApiInspector.geminiApiKey": "YOUR_API_KEY_HERE"
}
```

### Get Your API Key
Visit: https://makersuite.google.com/app/apikey

## 4. Run the Extension

### Development Mode
1. Open this project in VS Code
2. Press `F5` (or Run > Start Debugging)
3. A new VS Code window will open (Extension Development Host)
4. In the new window, open the sidebar to see the extension

### Watch Mode (for development)
```bash
# Terminal 1: Watch extension
npm run watch

# Terminal 2: Watch webview
npm run watch:webview
```

## 5. Test the Extension

1. In the Extension Development Host, create a test Next.js route:
```typescript
// app/api/test/route.ts
export async function GET(request: Request) {
  return Response.json({ message: "Hello" });
}
```

2. Save the file (`Ctrl + S`)
3. Check the NextJS API Inspector sidebar - it should show the analysis!

## Troubleshooting

### Extension not appearing in sidebar
- Check the Activity Bar on the left
- Look for the NextJS API Inspector icon
- Try reloading the window: `Ctrl + Shift + P` → `Reload Window`

### AI analysis not working
- Verify your Gemini API key is correctly set
- Check the VS Code Output panel: `View > Output` → Select "NextJS API Inspector"
- Ensure you have internet connectivity

### Build errors
```bash
# Clean and rebuild
rm -rf dist node_modules webview-ui/node_modules
npm install
cd webview-ui && npm install && cd ..
npm run build
```

## Project Structure

```
f:\apitools\
├── src/                    # Extension source code
│   ├── extension.ts        # Main entry point
│   ├── SidebarProvider.ts  # Webview provider
│   ├── services/
│   │   └── aiService.ts    # Gemini AI integration
│   └── types/
│       └── api.ts          # TypeScript interfaces
├── webview-ui/             # React UI
│   ├── src/
│   │   ├── App.tsx
│   │   └── components/
│   └── package.json
├── dist/                   # Built files (generated)
├── package.json
└── README.md
```

## Next Steps

- Customize the AI prompts in `src/services/aiService.ts`
- Add new UI components in `webview-ui/src/components/`
- Modify the extension behavior in `src/extension.ts`
- Add more features to the sidebar tabs

Happy coding! 🚀
