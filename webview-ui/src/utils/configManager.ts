/**
 * Configuration manager for webview
 * Handles communication with extension for config save/load
 */

import { ProviderConfig } from '../types/configuration';
import { getVsCodeApi } from './vscodeApi';

export async function saveConfiguration(config: ProviderConfig): Promise<void> {
  const vscode = getVsCodeApi();
  vscode?.postMessage({
    type: 'saveConfiguration',
    config,
  });
}

export async function loadConfiguration(): Promise<void> {
  const vscode = getVsCodeApi();
  vscode?.postMessage({
    type: 'loadConfiguration',
  });
}

export async function testConnection(config: ProviderConfig): Promise<void> {
  const vscode = getVsCodeApi();
  vscode?.postMessage({
    type: 'testConnection',
    config,
  });
}

export function validateConfiguration(config: Partial<ProviderConfig>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.provider) {
    errors.push('Provider harus dipilih');
  }

  if (!config.apiKey || config.apiKey.trim() === '') {
    errors.push('API Key tidak boleh kosong');
  }

  if (!config.model || config.model.trim() === '') {
    errors.push('Model harus dipilih');
  }

  if (config.provider === 'openai' || config.provider === 'custom') {
    if (!config.baseUrl || config.baseUrl.trim() === '') {
      errors.push('Base URL diperlukan untuk provider ini');
    } else {
      // Basic URL validation
      try {
        new URL(config.baseUrl);
      } catch {
        errors.push('Base URL tidak valid');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
