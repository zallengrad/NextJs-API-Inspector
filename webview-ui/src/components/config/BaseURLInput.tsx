import { TextInput } from '@mantine/core';

interface BaseURLInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

function BaseURLInput({
  value,
  onChange,
  disabled,
  required = false,
}: BaseURLInputProps) {
  return (
    <TextInput
      label="Base URL"
      description="URL endpoint untuk API (contoh: https://api.openai.com/v1)"
      placeholder="https://api.openai.com/v1"
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      disabled={disabled}
      required={required}
      size="md"
    />
  );
}

export default BaseURLInput;
