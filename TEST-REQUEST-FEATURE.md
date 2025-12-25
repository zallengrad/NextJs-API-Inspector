# ✅ Test Request Feature Implemented!

## Fitur Baru: Kirim Permintaan Test Aktif 🚀

Extension sekarang bisa **mengirim HTTP request langsung ke API** dan menampilkan response-nya!

---

## Yang Diimplementasikan ✅

### 1. **Active Send Button**
- Button "Kirim Permintaan Test" sekarang **aktif** (tidak disabled lagi)
- Loading state saat request sedang berjalan
- Text berubah: "Mengirim Permintaan..." saat loading

### 2. **Request Configuration**
- **URL Display:** `http://localhost:3000/api/endpoint`
- **Method Selection:** Dropdown untuk pilih GET, POST, PUT, DELETE, PATCH
- **Request Body:** Textarea untuk input JSON (untuk POST/PUT/PATCH)

### 3. **Response Display**
Setelah request selesai, ditampilkan:
- **Status Code** dengan badge warna:
  - 🟢 Hijau untuk 200-299 (Success)
  - 🔴 Merah untuk 400+ (Client/Server Error)
  - 🟡 Kuning untuk status lainnya
- **Headers** (collapsible accordion)
- **Response Body** (formatted JSON atau text)
- **Error Message** jika ada error (network error, timeout, dll)

### 4. **Proxy Through Extension**
- Request dikirim melalui extension backend (bukan langsung dari webview)
- ✅ **No CORS issues!**
- Extension menggunakan `node-fetch` untuk HTTP requests

---

## Technical Implementation 🔧

### File Changes

#### 1. **TestingTab.tsx**
```tsx
// State untuk response
const [isLoading, setIsLoading] = useState(false);
const [response, setResponse] = useState<TestResponse | null>(null);

// Function kirim request
const sendTestRequest = () => {
  setIsLoading(true);
  window.parent.postMessage({
    type: 'send-test-request',
    method: selectedMethod,
    endpoint: apiData.endpoint,
    body: requestBody,
  }, '*');
};

// Listen untuk response
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'test-request-response') {
      setResponse(event.data.response);
      setIsLoading(false);
    }
  };
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

#### 2. **SidebarProvider.ts**
```typescript
// Handler untuk test request message
case 'send-test-request':
  await this._handleTestRequest(data, webviewView.webview);
  break;

// Method untuk handle request
private async _handleTestRequest(data: any, webview: vscode.Webview) {
  const fetch = (await import('node-fetch')).default;
  const url = `http://localhost:3000${endpoint}`;
  
  const response = await fetch(url, options);
  const body = await response.json();
  
  // Kirim response kembali ke webview
  webview.postMessage({
    type: 'test-request-response',
    response: { status, statusText, headers, body }
  });
}
```

#### 3. **Dependencies**
```json
{
  "dependencies": {
    "node-fetch": "^2.7.0"
  },
  "devDependencies": {
    "@types/node-fetch": "^2.6.11"
  }
}
```

---

## UI Components

### Request Section
```
┌──────────────────────────────────────┐
│ URL yang akan di-test:               │
│ GET http://localhost:3000/api/users  │
├──────────────────────────────────────┤
│ Request Body (JSON):                 │
│ {                                    │
│   "name": "John Doe"                 │
│ }                                    │
├──────────────────────────────────────┤
│ [Kirim Permintaan Test] ← Active!    │
└──────────────────────────────────────┘
```

### Response Section
```
┌──────────────────────────────────────┐
│ Response                             │
│ ┌──────────────┐                     │
│ │ 200 OK     │ ← Status Badge       │
│ └──────────────┘                     │
│                                      │
│ ▼ Headers (5)  ← Collapsible        │
│                                      │
│ Response Body:                       │
│ {                                    │
│   "users": [                         │
│     { "id": 1, "name": "John" }      │
│   ]                                  │
│ }                                    │
└──────────────────────────────────────┘
```

---

## How It Works 🔄

### Flow Diagram
```
User Click Button
       ↓
Webview sends message
  (type: 'send-test-request')
       ↓
Extension receives message
       ↓
Extension makes HTTP request
  (using node-fetch to localhost:3000)
       ↓
Extension receives response
       ↓
Extension sends response back
  (type: 'test-request-response')
       ↓
Webview displays response
```

### Why Proxy?
❌ **Direct Fetch from Webview:**
- CORS might block requests
- Security restrictions

✅ **Proxy Through Extension:**
- No CORS issues
- Extension runs in Node.js environment
- Can access localhost directly

---

## Testing Steps 🧪

### 1. Reload Extension
```
Ctrl + Shift + P → "Developer: Reload Window"
```

### 2. Test GET Request
1. Buka folder Next.js project
2. Jalankan dev server: `npm run dev` (port 3000)
3. Analyze API route file
4. Di tab "Pengujian", pilih method "GET"
5. Click "Kirim Permintaan Test"
6. Response harus muncul dengan status 200

### 3. Test POST Request
1. Pilih method "POST"
2. Input request body JSON:
```json
{
  "title": "Test Workspace",
  "description": "Testing POST request"
}
```
3. Click "Kirim Permintaan Test"
4. Response harus muncul dengan data yang dibuat

### 4. Test Error Handling
**Test 404:**
- Request ke endpoint yang tidak ada
- Harus menampilkan status 404

**Test Server Offline:**
- Matikan Next.js dev server
- Request harus menampilkan error message

---

## Build Status ✅

```
Extension:
✓ dist\extension.js      25.0kb (termasuk node-fetch handler)

Webview:
✓ ../dist/webview/assets/index.css  201.49 kB
✓ ../dist/webview/assets/index.js   324.77 kB
✓ built in 4.26s
```

---

## Port Configuration 🔌

**Hardcoded:** `http://localhost:3000`

Ini adalah port default Next.js development server. Jika user jalannya di port lain, perlu edit code di `SidebarProvider.ts` line 139:

```typescript
const url = `http://localhost:3000${endpoint}`;
// Ganti 3000 ke port lain jika perlu
```

**Future Enhancement:** Bisa ditambahkan VS Code setting untuk configure port.

---

## Known Limitations ⚠️

1. **Port fixed di 3000** - tidak bisa diganti via UI
2. **localhost only** - tidak bisa test remote server
3. **No authentication** - belum support Bearer token/API key
4. **Timeout default** - menggunakan default node-fetch timeout

---

## Next Steps 💡

Possible future enhancements:
- [ ] Configurable base URL via VS Code settings
- [ ] Support untuk authentication headers (Bearer token)
- [ ] Request history
- [ ] Save/load request templates
- [ ] Response time display
- [ ] Copy response to clipboard button

---

**Status:** ✅ **IMPLEMENTED & READY TO TEST**

Reload Extension Host dan test dengan Next.js dev server yang running! 🎉
