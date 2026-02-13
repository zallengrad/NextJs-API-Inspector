import { Group, Button } from '@mantine/core';

interface ConfigActionsProps {
  onSave: () => void;
  onReset: () => void;
  isSaving: boolean;
  disabled?: boolean;
}

function ConfigActions({
  onSave,
  onReset,
  isSaving,
  disabled,
}: ConfigActionsProps) {
  return (
    <Group gap="md" mt="xl">
      <Button
        onClick={onSave}
        loading={isSaving}
        disabled={disabled || isSaving}
        variant="filled"
        size="md"
      >
        💾 Save Configuration
      </Button>
      <Button
        onClick={onReset}
        disabled={disabled || isSaving}
        variant="light"
        color="gray"
        size="md"
      >
        🔄 Reset to Default
      </Button>
    </Group>
  );
}

export default ConfigActions;
