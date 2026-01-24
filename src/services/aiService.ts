/**
 * AI Service - Hybrid Validation Pattern (CoPrompter)
 * 
 * Menggunakan pendekatan Measurable vs Descriptive Criteria Split:
 * 1. Generate dengan LLM
 * 2. Validasi struktural dengan kode (Fast Path)
 * 3. Validasi kualitatif dengan LLM ringan (Background, Optional)
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { ApiData } from '../types/api';
import { 
  cleanLLMResponse, 
  parseJsonSafely, 
  validateApiDataStructure, 
  ensureCompleteStructure,
  ValidationResult 
} from './validators';

let genAI: GoogleGenerativeAI | null = null;
let cachedModel: GenerativeModel | null = null;

// ============================================================================
// INITIALIZATION
// ============================================================================

export function initializeAI(apiKey: string): void {
  genAI = new GoogleGenerativeAI(apiKey);
  cachedModel = null; // Reset cached model when API key changes
}

function getModel(): GenerativeModel {
  if (!genAI) {
    throw new Error('Layanan AI belum diinisialisasi. Silakan atur API key Gemini Anda di pengaturan.');
  }
  if (!cachedModel) {
    cachedModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }
  return cachedModel;
}

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

const SYSTEM_PROMPT = `Anda adalah Expert Keamanan & Dokumentasi API yang menganalisis Next.js API route handlers.

INSTRUKSI KRITIS - BAHASA OUTPUT: BAHASA INDONESIA

SEMUA teks yang Anda hasilkan HARUS dalam BAHASA INDONESIA yang baik dan benar, termasuk:
- summary (ringkasan)
- description (deskripsi)
- parameter descriptions (deskripsi parameter)
- issue titles (judul masalah)
- issue descriptions (deskripsi masalah)
- recommendations (rekomendasi)

JANGAN gunakan kata-kata Inggris kecuali istilah teknis (contoh: GET, POST, JSON, API).
JANGAN terjemahkan istilah teknis seperti "GET", "POST", "query", "body", "header", "path".

Contoh BENAR:
- "Mengambil daftar workspace berdasarkan kepemilikan pengguna"
- "Judul workspace baru. Tidak boleh kosong."
- "Tidak ada validasi autentikasi"
- "Parameter query untuk filter data"

Contoh SALAH (JANGAN SEPERTI INI):
- "Retrieves a list of workspaces..."
- "The title of the new workspace..."
- "Missing authentication validation"
- "Query parameter for filtering data"

Analisis kode route Next.js yang diberikan dan ekstrak SEMUA HTTP methods dalam file.

PENTING: Satu file route.ts bisa mengekspor multiple functions seperti GET, POST, PUT, DELETE, PATCH, dll.
Anda HARUS menganalisis dan mengembalikan informasi untuk SETIAP method yang ditemukan dalam file.

Untuk setiap method, ekstrak:
1. Nama HTTP method (GET, POST, PUT, DELETE, PATCH, dll.)
2. Ringkasan dan deskripsi tentang apa yang dilakukan method tersebut (DALAM BAHASA INDONESIA)
3. Request parameters spesifik untuk method tersebut (query, body, headers, path params)
4. Struktur response dan schemas untuk method tersebut

Juga analisis seluruh file untuk:
5. Endpoint path (kesimpulan dari struktur file Next.js yang umum)
6. Masalah keamanan (autentikasi, otorisasi, validasi input, risiko SQL injection, XSS, dll) - JELASKAN DALAM BAHASA INDONESIA
7. Masalah skalabilitas (query N+1, paginasi yang hilang, algoritma tidak efisien, dll) - JELASKAN DALAM BAHASA INDONESIA

KRITIS: Kembalikan HANYA JSON yang valid dengan TANPA markdown, TANPA blok kode, TANPA backticks.
JSON harus sesuai dengan struktur EKSAK ini:
{
  "endpoint": "/api/users",
  "endpoints": [
    {
      "method": "GET",
      "summary": "Mengambil daftar semua pengguna",
      "description": "Endpoint ini mengambil semua data pengguna dari database. Hasil dapat difilter menggunakan parameter query.",
      "params": [
        {
          "name": "scope",
          "type": "string",
          "required": false,
          "description": "Menentukan cakupan visibilitas workspace yang akan diambil. Defaultnya adalah own. Nilai yang mungkin: own (workspace pengguna), public (semua workspace publik), all (workspace pengguna dan publik), manage (semua workspace, memerlukan peran Dosen atau Admin).",
          "location": "query"
        }
      ],
      "responseSchema": [
        {
          "status": 200,
          "contentType": "application/json",
          "schema": "{ \\"users\\": \\"array\\" }",
          "example": "{ \\"users\\": [{ \\"id\\": 1, \\"name\\": \\"John\\" }] }"
        }
      ]
    }
  ],
  "issues": [
    {
      "severity": "warning",
      "title": "Tidak ada rate limiting",
      "description": "Endpoint ini tidak mengimplementasikan rate limiting, yang dapat menyebabkan penyalahgunaan dan beban server yang berlebihan.",
      "recommendation": "Tambahkan middleware rate limiting untuk membatasi jumlah permintaan per pengguna per menit. Pertimbangkan untuk menggunakan library seperti express-rate-limit."
    }
  ]
}

INGAT: Semua "summary", "description", "params[].description", "issues[].title", "issues[].description", dan "issues[].recommendation" HARUS dalam BAHASA INDONESIA!

Kembalikan HANYA objek JSON, tidak ada yang lain.`;

// ============================================================================
// MAIN ANALYSIS FUNCTION (Hybrid Validation Flow)
// ============================================================================

/**
 * Menganalisis kode route Next.js dengan pola Hybrid Validation.
 * 
 * Flow:
 * 1. Generate dengan LLM (~2-5 detik)
 * 2. Clean response (~0ms, Deterministik)
 * 3. Parse JSON (~0ms, Deterministik) 
 * 4. Validate structure (~0ms, Deterministik)
 * 5. Return ke user (Fast Path ends)
 * 6. Background quality check (Optional, Non-blocking)
 */
export async function analyzeCode(codeSnippet: string): Promise<ApiData | null> {
  const model = getModel();
  const startTime = Date.now();
  
  try {
    // ========================================
    // STEP 1: LLM Generation
    // ========================================
    const prompt = `${SYSTEM_PROMPT}\n\nKode untuk dianalisis:\n\`\`\`typescript\n${codeSnippet}\n\`\`\``;
    
    console.log('[AI Service] Sending request to Gemini...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const rawText = response.text();
    
    const llmTime = Date.now() - startTime;
    console.log(`[AI Service] LLM response received in ${llmTime}ms`);

    // ========================================
    // STEP 2: Clean Response (Deterministik, ~0ms)
    // ========================================
    const cleanedText = cleanLLMResponse(rawText);

    // ========================================
    // STEP 3: Parse JSON (Deterministik, ~0ms)
    // ========================================
    const parseResult = parseJsonSafely<Record<string, unknown>>(cleanedText);
    
    if (!parseResult.success) {
      console.error('[AI Service] JSON parse failed:', parseResult.error);
      throw new Error(parseResult.error);
    }

    // ========================================
    // STEP 4: Validate Structure (Deterministik, ~0ms)
    // ========================================
    const validation = validateApiDataStructure(parseResult.data);
    
    if (validation.errors.length > 0) {
      console.error('[AI Service] Structural validation errors:', validation.errors);
      // Coba auto-fix dengan ensureCompleteStructure
      console.log('[AI Service] Attempting auto-fix...');
    }
    
    if (validation.warnings.length > 0) {
      console.warn('[AI Service] Structural validation warnings:', validation.warnings);
    }

    // ========================================
    // STEP 5: Ensure Complete Structure & Return (Fast Path)
    // ========================================
    const apiData = ensureCompleteStructure(parseResult.data!);
    
    const totalTime = Date.now() - startTime;
    console.log(`[AI Service] Analysis complete in ${totalTime}ms (LLM: ${llmTime}ms, Validation: ${totalTime - llmTime}ms)`);

    // ========================================
    // STEP 6: Background Quality Check (Non-blocking)
    // ========================================
    validateOutputQualitatively(apiData, validation).catch((err) => {
      console.warn('[AI Service] Background quality check failed:', err);
    });

    return apiData;

  } catch (error) {
    console.error('[AI Service] Error menganalisis kode dengan AI:', error);
    if (error instanceof Error) {
      throw new Error(`Analisis AI gagal: ${error.message}`);
    }
    throw error;
  }
}

// ============================================================================
// QUALITATIVE VALIDATION (Descriptive, Background, Non-blocking)
// ============================================================================

/**
 * Validasi kualitatif ringan menggunakan LLM.
 * Berjalan di background dan tidak memblokir response ke user.
 * 
 * Hanya log warning jika ada masalah kualitas signifikan.
 */
async function validateOutputQualitatively(
  data: ApiData, 
  structuralValidation: ValidationResult
): Promise<void> {
  // Skip jika tidak ada endpoint yang terdeteksi
  if (data.endpoints.length === 0) {
    console.warn('[Quality Check] Skipped: No endpoints detected');
    return;
  }

  // Skip jika ada banyak structural warnings (sudah jelas bermasalah)
  if (structuralValidation.warnings.length > 3) {
    console.warn('[Quality Check] Skipped: Too many structural warnings');
    return;
  }

  try {
    const model = getModel();
    
    // Prompt super ringan untuk quality check
    const qualityPrompt = `Evaluate this API analysis quality. Answer only YES or NO.

Is this analysis logically sound and complete for a Next.js API route?
- Endpoint: ${data.endpoint}
- Methods: ${data.endpoints.map(e => e.method).join(', ')}
- Issues found: ${data.issues.length}

Answer YES if the analysis seems reasonable, NO if it seems incomplete or wrong.`;

    const result = await model.generateContent(qualityPrompt);
    const answer = result.response.text().trim().toUpperCase();
    
    if (answer.includes('NO')) {
      console.warn('[Quality Check] LLM flagged potential quality issue for:', data.endpoint);
      // Di sini bisa ditambahkan logic untuk:
      // - Mengirim notifikasi ke telemetry
      // - Menandai hasil sebagai "needs review"
      // - Trigger re-analysis di background
    } else {
      console.log('[Quality Check] Passed for:', data.endpoint);
    }

  } catch (error) {
    // Quality check failure tidak boleh mengganggu main flow
    console.warn('[Quality Check] Error (non-critical):', error);
  }
}