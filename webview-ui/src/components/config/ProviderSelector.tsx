import { Select } from '@mantine/core';
import { AIProvider, ProviderMetadata } from '../../types/configuration';
import { PROVIDER_METADATA } from '../../utils/providerDefaults';

interface ProviderSelectorProps {
  value: AIProvider;
  onChange: (value: AIProvider) => void;
  disabled?: boolean;
}

function ProviderSelector({ value, onChange, disabled }: ProviderSelectorProps) {
  const providers = Object.values(PROVIDER_METADATA);

  const data = providers.map((provider: ProviderMetadata) => ({
    value: provider.id,
    label: provider.name,
    description: provider.description,
  }));

  return (
    <Select
      label="AI Provider"
      description="Pilih provider AI yang akan digunakan"
      placeholder="Pilih provider"
      value={value}
      onChange={(val) => onChange(val as AIProvider)}
      data={data}
      disabled={disabled}
      required
      size="md"
    />
  );
}

export default ProviderSelector;
