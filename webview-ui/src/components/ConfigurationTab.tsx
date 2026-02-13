import { useState, useEffect } from 'react';
import { Card, Stack, Title, Text, Divider, Alert } from '@mantine/core';
import { ConfigurationState, ProviderConfig, AIProvider } from '../types/configuration';
import { getProviderMetadata, getDefaultConfig } from '../utils/providerDefaults';
import { saveConfiguration, loadConfiguration, testConnection, validateConfiguration } from '../utils/configManager';
import ProviderSelector from './config/ProviderSelector';
import APIKeyInput from './config/APIKeyInput';
import ModelSelector from './config/ModelSelector';
import BaseURLInput from './config/BaseURLInput';
import ConnectionTester from './config/ConnectionTester';
import ConfigActions from './config/ConfigActions';

function ConfigurationTab() {
  const [config, setConfig] = useState<ConfigurationState>({
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-2.0-flash-exp',
    baseUrl: '',
    isSaving: false,
    isTesting: false,
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Listen for messages from extension
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;

      switch (message.type) {
        case 'configurationLoaded':
          // Load configuration from extension
          setConfig((prev) => ({
            ...prev,
            ...message.config,
          }));
          break;

        case 'testConnectionResponse':
          // Handle test connection response
          setConfig((prev) => ({
            ...prev,
            isTesting: false,
            testResult: {
              success: message.success,
              latency: message.latency,
              error: message.error,
            },
          }));
          break;

        case 'configurationSaved':
          // Handle save success
          setConfig((prev) => ({
            ...prev,
            isSaving: false,
          }));
          break;
      }
    };

    window.addEventListener('message', handleMessage);

    // Request initial configuration on mount
    loadConfiguration();

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleProviderChange = (provider: AIProvider) => {
    const defaults = getDefaultConfig(provider);
    const metadata = getProviderMetadata(provider);

    setConfig((prev) => ({
      ...prev,
      provider,
      model: defaults.model || metadata.defaultModel,
      baseUrl: defaults.baseUrl || metadata.defaultBaseUrl || '',
      testResult: undefined, // Clear test result when provider changes
    }));
  };

  const handleTestConnection = () => {
    // Validate before testing
    const validation = validateConfiguration(config);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);
    setConfig((prev) => ({ ...prev, isTesting: true, testResult: undefined }));

    const testConfig: ProviderConfig = {
      provider: config.provider,
      apiKey: config.apiKey,
      model: config.model,
      baseUrl: config.baseUrl,
    };

    testConnection(testConfig);
  };

  const handleSave = () => {
    // Validate before saving
    const validation = validateConfiguration(config);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);
    setConfig((prev) => ({ ...prev, isSaving: true }));

    const saveConfig: ProviderConfig = {
      provider: config.provider,
      apiKey: config.apiKey,
      model: config.model,
      baseUrl: config.baseUrl,
    };

    saveConfiguration(saveConfig);
  };

  const handleReset = () => {
    const defaults = getDefaultConfig('gemini');
    setConfig({
      provider: 'gemini',
      apiKey: '',
      model: defaults.model || 'gemini-2.0-flash-exp',
      baseUrl: '',
      isSaving: false,
      isTesting: false,
      testResult: undefined,
    });
    setValidationErrors([]);
  };

  const providerMetadata = getProviderMetadata(config.provider);
  const requiresBaseUrl = config.provider === 'openai' || config.provider === 'custom';

  return (
    <Stack gap="md">
      {/* Header */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={4} mb="xs">
          ⚙️ Configuration
        </Title>
        <Text size="sm" c="dimmed">
          Konfigurasi AI provider untuk analisis API
        </Text>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert color="red" title="Validation Error">
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Configuration Form */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Title order={5}>Provider Settings</Title>

          <ProviderSelector
            value={config.provider}
            onChange={handleProviderChange}
            disabled={config.isSaving || config.isTesting}
          />

          <APIKeyInput
            value={config.apiKey}
            onChange={(val) => setConfig((prev) => ({ ...prev, apiKey: val }))}
            disabled={config.isSaving || config.isTesting}
            apiKeyUrl={providerMetadata.apiKeyUrl}
            providerName={providerMetadata.name}
          />

          <ModelSelector
            value={config.model}
            onChange={(val) => setConfig((prev) => ({ ...prev, model: val }))}
            models={providerMetadata.models}
            disabled={config.isSaving || config.isTesting}
          />

          {requiresBaseUrl && (
            <BaseURLInput
              value={config.baseUrl || ''}
              onChange={(val) => setConfig((prev) => ({ ...prev, baseUrl: val }))}
              disabled={config.isSaving || config.isTesting}
              required={requiresBaseUrl}
            />
          )}

          <Divider my="sm" />

          <ConnectionTester
            onTest={handleTestConnection}
            isTesting={config.isTesting || false}
            result={config.testResult}
            disabled={config.isSaving}
          />

          <ConfigActions
            onSave={handleSave}
            onReset={handleReset}
            isSaving={config.isSaving || false}
            disabled={config.isTesting}
          />
        </Stack>
      </Card>

      {/* Info Card */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={5} mb="sm">
          ℹ️ Informasi
        </Title>
        <Stack gap="xs">
          <Text size="sm">
            <strong>Provider:</strong> {providerMetadata.name}
          </Text>
          <Text size="sm">
            <strong>Model:</strong> {config.model}
          </Text>
          {config.baseUrl && (
            <Text size="sm">
              <strong>Base URL:</strong> {config.baseUrl}
            </Text>
          )}
          <Text size="xs" c="dimmed" mt="sm">
            Konfigurasi ini akan digunakan untuk semua fitur AI di extension,
            termasuk analisis API, dokumentasi, dan performance insights.
          </Text>
        </Stack>
      </Card>
    </Stack>
  );
}

export default ConfigurationTab;
