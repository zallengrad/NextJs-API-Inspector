import { Select } from '@mantine/core';

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  models: string[];
  disabled?: boolean;
}

function ModelSelector({ value, onChange, models, disabled }: ModelSelectorProps) {
  const data = models.map((model) => ({
    value: model,
    label: model,
  }));

  return (
    <Select
      label="Model"
      description="Pilih model AI yang akan digunakan"
      placeholder="Pilih model"
      value={value}
      onChange={(val) => onChange(val || '')}
      data={data}
      disabled={disabled}
      required
      size="md"
      searchable
    />
  );
}

export default ModelSelector;
