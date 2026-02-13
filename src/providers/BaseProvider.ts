/**
 * Base provider interface for AI services
 * All providers must implement this interface
 */

export interface BaseProvider {
  /**
   * Test connection to the AI service
   * @returns Promise with success status, latency, and optional error
   */
  testConnection(): Promise<{
    success: boolean;
    latency?: number;
    error?: string;
  }>;

  /**
   * Generate AI response for a given prompt
   * @param prompt The prompt to send to the AI
   * @returns Promise with the generated text response
   */
  generateResponse(prompt: string): Promise<string>;

  /**
   * Get available models for this provider (optional)
   * @returns Promise with array of model names
   */
  getAvailableModels?(): Promise<string[]>;
}

export abstract class AbstractBaseProvider implements BaseProvider {
  protected apiKey: string;
  protected model: string;
  protected baseUrl?: string;

  constructor(apiKey: string, model: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = baseUrl;
  }

  abstract testConnection(): Promise<{
    success: boolean;
    latency?: number;
    error?: string;
  }>;

  abstract generateResponse(prompt: string): Promise<string>;

  getAvailableModels?(): Promise<string[]>;
}
