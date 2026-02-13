import { Button, Text, Group, Badge } from '@mantine/core';
import { TestConnectionResult } from '../../types/configuration';

interface ConnectionTesterProps {
  onTest: () => void;
  isTesting: boolean;
  result?: TestConnectionResult;
  disabled?: boolean;
}

function ConnectionTester({
  onTest,
  isTesting,
  result,
  disabled,
}: ConnectionTesterProps) {
  const getStatusBadge = () => {
    if (!result) return null;

    if (result.success) {
      return (
        <Badge color="green" variant="light">
          ✅ Connected ({result.latency}ms)
        </Badge>
      );
    } else {
      return (
        <Badge color="red" variant="light">
          ❌ Failed
        </Badge>
      );
    }
  };

  return (
    <div>
      <Group gap="md" align="center">
        <Button
          onClick={onTest}
          loading={isTesting}
          disabled={disabled || isTesting}
          variant="light"
          size="md"
        >
          🔌 Test Connection
        </Button>
        {getStatusBadge()}
      </Group>

      {result && !result.success && result.error && (
        <Text size="sm" c="red" mt="xs">
          Error: {result.error}
        </Text>
      )}
    </div>
  );
}

export default ConnectionTester;
