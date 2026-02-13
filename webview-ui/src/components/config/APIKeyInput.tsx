import { useState } from 'react';
import { PasswordInput, Text, Anchor, Stack } from '@mantine/core';

interface APIKeyInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  apiKeyUrl?: string;
  providerName?: string;
}

function APIKeyInput({
  value,
  onChange,
  disabled,
  apiKeyUrl,
  providerName = 'provider',
}: APIKeyInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Stack gap="xs">
      <PasswordInput
        label="API Key"
        description={`API key untuk ${providerName}`}
        placeholder="Masukkan API key Anda"
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        disabled={disabled}
        visible={visible}
        onVisibilityChange={setVisible}
        required
        size="md"
      />
      {apiKeyUrl && (
        <Text size="xs" c="dimmed">
          Belum punya API key?{' '}
          <Anchor href={apiKeyUrl} target="_blank" size="xs">
            Dapatkan di sini
          </Anchor>
        </Text>
      )}
    </Stack>
  );
}

export default APIKeyInput;
