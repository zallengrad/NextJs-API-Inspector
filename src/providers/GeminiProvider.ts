/**
 * Gemini AI Provider Implementation
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { AbstractBaseProvider } from './BaseProvider';

export class GeminiProvider extends AbstractBaseProvider {
  private genAI: GoogleGenerativeAI;
  private cachedModel: GenerativeModel | null = null;

  constructor(apiKey: string, model: string = 'gemini-2.5-flash') {
    super(apiKey, model);
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  private getModel(): GenerativeModel {
    if (!this.cachedModel) {
      this.cachedModel = this.genAI.getGenerativeModel({ model: this.model });
    }
    return this.cachedModel;
  }

  async testConnection(): Promise<{
    success: boolean;
    latency?: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      const model = this.getModel();
      const result = await model.generateContent('Test connection. Reply with OK.');
      const response = result.response;
      const text = response.text();

      const latency = Date.now() - startTime;

      if (text) {
        return {
          success: true,
          latency,
        };
      } else {
        return {
          success: false,
          error: 'Empty response from Gemini',
        };
      }
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        success: false,
        latency,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      const model = this.getModel();
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      throw new Error(
        `Gemini generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getAvailableModels(): Promise<string[]> {
    // Gemini doesn't have a public API to list models
    // Return predefined list (current model first)
    return [
      'gemini-2.5-flash',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
      'gemini-2.0-flash-exp',
    ];
  }
}
