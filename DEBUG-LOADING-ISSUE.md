# 🔧 Debug Guide: Loading Issue Fixed + Postman-Style UI

## Problem yang Diperbaiki

**Issue:** Tab Pengujian stuck di loading tanpa menampilkan response

**Root Cause Possibilities:**
1. Message tidak sampai dari extension ke webview
2. Error tidak ter-handle dengan baik
3. Timeout tidak ada
4. Console log tidak cukup untuk debugging

---

## ✅ Perubahan yang Dilakukan

### 1. **Comprehensive Logging**

**Extension Side (SidebarProvider.ts):**
```typescript
console.log('[Test Request] Received request:', { method, endpoint });
console.log('[Test Request] Sending to:', url);
console.log('[Test Request] Got response:', response.status);
console.log('[Test Request] Sending response back to webview');
console.log('[Test Request] Response sent successfully');
```

**Webview Side (TestingTab.tsx):**
```typescript
console.log('[TestingTab] Sending test request...');
console.log('[TestingTab] Request data:', requestData);
console.log('[TestingTab] Message sent to extension');
console.log('[TestingTab] Received message:', message);
console.log('[TestingTab] Got test response:', message.response);
```

### 2. **Timeout Added**
```typescript
const options: any = {
  method: method,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10 second timeout
};
```

### 3. **Better Error Handling**
```typescript
try {
  if (contentType?.includes('application/json')) {
    responseBody = await response.json();
  } else {
    responseBody = await response.text();
  }
} catch (parseError) {
  console.error('[Test Request] Error parsing response body:', parseError);
  responseBody = await response.text();
}
```

### 4. **Postman-Style UI** 🎨

**Features:**
- ✅ **Tabs untuk Request:** Body / Headers
- ✅ **Tabs untuk Response:** Body / Headers  
- ✅ **Copy Buttons** untuk semua code blocks
- ✅ **Response Time Display** (ms)
- ✅ **Status Code dengan Warna:**
  - 🟢 200-299 (Success)
  - 🟡 300-399 (Redirect)
  - 🟠 400-499 (Client Error)
  - 🔴 500+ (Server Error)
- ✅ **Better Layout** dengan Groups & Cards
- ✅ **Icons** untuk visual feedback

**UI Components:**
```
┌─────────────────────────────────────────────┐
│ [GET ▼] http://localhost:3000/api/users    │
├─────────────────────────────────────────────┤
│ [Body] [Headers]                            │
│ { ... request body ... }                    │
├─────────────────────────────────────────────┤
│ [Kirim Request]                             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Response          [🕐 245ms] [200 OK]       │
├─────────────────────────────────────────────┤
│ [Body] [Headers (12)]                       │
│ { ... response ... }              [Copy 📋] │
└─────────────────────────────────────────────┘
```

---

## 🐛 Cara Debug Loading Issue

### Step 1: Buka Developer Tools

**Di Extension Development Host:**
1. Tekan `F1` atau `Ctrl+Shift+P`
2. Ketik: `Developer: Toggle Developer Tools`
3. Buka tab "Console"

### Step 2: Test Request

1. Di tab Pengujian, click "Kirim Request"
2. Perhatikan console log:

**Expected Output (Success):**
```
[TestingTab] Sending test request...
[TestingTab] Request data: { type: "send-test-request", method: "GET", ... }
[TestingTab] Message sent to extension
[Test Request] Received request: { method: "GET", endpoint: "/api/users" }
[Test Request] Sending to: http://localhost:3000/api/users
[Test Request] Got response: 200 OK
[Test Request] Sending response back to webview
[Test Request] Response sent successfully
[TestingTab] Received message: { type: "test-request-response", ... }
[TestingTab] Got test response: { status: 200, ... }
```

**If Stuck at "Mengirim Permintaan...":**

Check console untuk:

**Scenario 1: No response from extension**
```
[TestingTab] Message sent to extension
// No logs after this
```
**Fix:** Extension tidak handle message. Check SidebarProvider message handler.

**Scenario 2: Network error**
```
[Test Request] Error occurred: FetchError: request to http://localhost:3000... failed
```
**Fix:** Next.js dev server tidak running atau wrong port.

**Scenario 3: Parsing error**
```
[Test Request] Error parsing response body: SyntaxError: Unexpected token
```
**Fix:** Response bukan JSON. Sudah di-handle sekarang.

### Step 3: Check Network

**Verify Next.js server running:**
```bash
# Di terminal terpisah
cd /path/to/nextjs-project
npm run dev

# Should see:
# ready - started server on 0.0.0.0:3000
```

**Test endpoint manually:**
```bash
curl http://localhost:3000/api/users
# Should return JSON response
```

---

## 📦 Build Output

```
Extension:
✓ dist\extension.js      25.5kb (with logging)

Webview:
✓ assets/index.css  201.49 kB
✓ assets/index.js   348.23 kB (Postman-style UI + icons)
✓ built in 32.27s
```

---

## 🧪 Testing Checklist

### Before Testing:
- [ ] Extension built: `npm run build`
- [ ] Extension Host launched: `F5`
- [ ] Next.js dev server running: `npm run dev` (port 3000)
- [ ] Developer Tools open: `Developer: Toggle Developer Tools`

### Test Cases:

**1. GET Request:**
- [ ] Select method "GET"
- [ ] Click "Kirim Request"
- [ ] Response displays with 200 status
- [ ] Response time shows
- [ ] Body tab shows JSON data
- [ ] Headers tab shows headers
- [ ] Copy button works

**2. POST Request:**
- [ ] Select method "POST"  
- [ ] Enter valid JSON in Body tab
- [ ] Click "Kirim Request"
- [ ] Response displays successfully
- [ ] Request body sent correctly

**3. Error Handling:**
- [ ] Stop Next.js server
- [ ] Click "Kirim Request"
- [ ] Error alert shows: "Request Failed"
- [ ] Error message clear: "connect ECONNREFUSED"

**4. Wrong Endpoint:**
- [ ] Request to `/api/notfound`
- [ ] Displays 404 with red badge
- [ ] Response body shows error message

---

## 🎨 UI Improvements (Postman-style)

### Added Components:

**1. Tabler Icons:**
```tsx
import { IconCheck, IconCopy, IconClock } from '@tabler/icons-react';
```

**2. Copy Buttons:**
```tsx
<CopyButton value={responseBody}>
  {({ copied, copy }) => (
    <ActionIcon onClick={copy}>
      {copied ? <IconCheck /> : <IconCopy />}
    </ActionIcon>
  )}
</CopyButton>
```

**3. Response Time:**
```tsx
<Badge leftSection={<IconClock size={14} />}>
  {response.duration}ms
</Badge>
```

**4. Tabs for Organization:**
- Request: Body / Headers
- Response: Body / Headers  
- Code Examples: cURL / JavaScript

---

## 🔍 Troubleshooting

### Issue: "Mengirim Permintaan..." tidak berhenti

**Check Console untuk:**

1. **Message tidak terkirim:**
   - Pastikan `window.addEventListener('message')` terdaftar
   - Check `console.log('[TestingTab] Component mounted')`

2. **Extension tidak respond:**
   - Check extension console (Debug Console)
   - Pastikan `case 'send-test-request'` ada di SidebarProvider

3. **Response tidak di-parse:**
   - Check `console.log('[Test Request] Sending response back')`
   - Pastikan webview.postMessage dipanggil

### Issue: Timeout setelah 10 detik

**Possible Causes:**
- Next.js server lambat
- Endpoint process lama (database query, external API)

**Solutions:**
- Increase timeout di SidebarProvider.ts line 147
- Optimize API endpoint

---

## 📝 Next Steps

**Sekarang test:**
1. `F5` untuk launch Extension Host
2. Buka Next.js project
3. Jalankan `npm run dev` di terminal
4. Open Developer Tools
5. Analyze API route file
6. Tab Pengujian → Kirim Request
7. **Watch console logs** untuk debug

**If still loading:**
- Share console logs
- I'll help debug specific issue

---

**Status:** ✅ **FIXED dengan comprehensive debugging**

Silakan test dan lihat console logs! 🚀
