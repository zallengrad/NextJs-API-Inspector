# Testing NextJS API Inspector Extension

## Cara 1: Development Mode (Recommended untuk Testing)

### Langkah-langkah:

1. **Buka Extension Project di VS Code**
   ```bash
   code f:\apitools
   ```

2. **Build Extension**
   ```bash
   npm run build
   ```

3. **Launch Extension Development Host**
   - Press `F5` atau
   - Menu: `Run > Start Debugging`
   - Atau `Ctrl + Shift + D` → klik "Run Extension"

4. **Window Baru Akan Terbuka** (Extension Development Host)
   - Ini adalah VS Code instance terpisah dengan extension Anda aktif
   - Extension hanya aktif di window ini

5. **Buka Project Next.js Anda di Window Extension Development Host**
   ```
   File > Open Folder → Pilih project Next.js
   ```

6. **Test Extension**
   - Buat atau buka file Next.js route: `app/api/*/route.ts`
   - Save file (Ctrl+S)
   - Lihat sidebar "NextJS API Inspector" untuk hasil analisis

### Keuntungan Development Mode:
- ✅ Hot reload saat edit code
- ✅ Debugging dengan breakpoints
- ✅ Console logs visible
- ✅ Tidak perlu install/uninstall

---

## Cara 2: Package & Install (Production Mode)

### Step 1: Package Extension menjadi VSIX

1. **Install VSCE (VS Code Extension CLI)**
   ```bash
   npm install -g @vscode/vsce
   ```

2. **Build Extension**
   ```bash
   npm run build
   ```

3. **Package ke .vsix**
   ```bash
   vsce package
   ```
   
   Akan menghasilkan file: `nextjs-api-inspector-0.0.1.vsix`

### Step 2: Install Extension di VS Code

**Metode A - Via VS Code UI:**
1. Buka VS Code (instance normal, bukan development host)
2. Ctrl+Shift+X (Extensions panel)
3. Klik `...` (menu titik tiga) di pojok kanan atas
4. Pilih `Install from VSIX...`
5. Pilih file `nextjs-api-inspector-0.0.1.vsix`

**Metode B - Via Command Line:**
```bash
code --install-extension nextjs-api-inspector-0.0.1.vsix
```

### Step 3: Gunakan Extension

1. Buka project Next.js Anda
2. Klik icon "NextJS API Inspector" di Activity Bar (sidebar kiri)
3. Set Gemini API key di Settings
4. Buka file `route.ts` dan save
5. Extension akan otomatis analyze!

### Uninstall Extension:
```bash
code --uninstall-extension nextjs-api-inspector
```

---

## Cara 3: Symlink (Advanced - untuk Development)

Untuk testing tanpa F5 di multiple projects:

```bash
# Link extension ke VS Code extensions folder
mklink /D "%USERPROFILE%\.vscode\extensions\nextjs-api-inspector" "f:\apitools"
```

Restart VS Code dan extension akan loaded di semua instances.

---

## Testing Workflow yang Disarankan

### Saat Development Extension:
```bash
# Terminal 1 - Watch extension
npm run watch

# Terminal 2 - Watch webview
npm run watch:webview

# Press F5 untuk launch Extension Development Host
# Edit code → Auto rebuild → Reload window (Ctrl+R di Extension Host)
```

### Saat Testing di Project Real:
1. `npm run build`
2. `vsce package`
3. Install .vsix
4. Test di project Next.js

---

## Example Test Case

Buat file test di project Next.js Anda:

```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // TODO: Add authentication check
  
  const user = await db.user.findUnique({
    where: { id }
  });
  
  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(user);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  await db.user.delete({
    where: { id }
  });
  
  return NextResponse.json({ success: true });
}
```

**Expected Results:**
- ✅ Detects 2 methods: GET, DELETE
- ✅ Extracts path parameter: `id`
- ✅ Shows security warning: "Missing authentication"
- ✅ Shows security warning: "No authorization check for DELETE"
- ✅ Displays response schemas for 200 and 404

---

## Troubleshooting

### Extension tidak muncul di sidebar
- Reload window: `Ctrl+Shift+P` → "Developer: Reload Window"
- Check Extensions panel: Extension harus enabled
- Check extension host logs

### Extension tidak detect file save
- Pastikan file berakhiran `route.ts` atau `route.js`
- Check file ada di folder `app/` (Next.js App Router)
- Lihat Output panel: `View > Output` → "NextJS API Inspector"

### Build gagal
```bash
# Clean install
rm -rf dist node_modules webview-ui/node_modules webview-ui/dist
npm install
cd webview-ui && npm install && cd ..
npm run build
```

### VSCE package error
```bash
# Pastikan LICENSE file ada
echo "MIT" > LICENSE

# Atau tambahkan ke package.json:
# "license": "MIT"
```

---

## Quick Reference

| Mode | Command | Use Case |
|------|---------|----------|
| **Dev Mode** | `F5` | Development & debugging |
| **Build** | `npm run build` | Compile for production |
| **Package** | `vsce package` | Create .vsix installer |
| **Install VSIX** | `code --install-extension file.vsix` | Install locally |
| **Watch** | `npm run watch` | Auto-rebuild on changes |

Selamat testing! 🚀
