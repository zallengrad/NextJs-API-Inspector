import { Card, Text, Badge, Table, Stack, Title, Code, Group, Divider } from '@mantine/core';
import { ApiData } from '../types/api';

interface DocumentationTabProps {
  apiData: ApiData;
}

function DocumentationTab({ apiData }: DocumentationTabProps) {
  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'blue',
      POST: 'green',
      PUT: 'yellow',
      DELETE: 'red',
      PATCH: 'orange',
    };
    return colors[method.toUpperCase()] || 'gray';
  };

  return (
    <Stack gap="md">
      {/* File Endpoint Header */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={4} mb="xs">
          File: {apiData.endpoint}
        </Title>
        <Text size="sm" c="dimmed">
          {apiData.endpoints.length} HTTP method terdeteksi
        </Text>
        {apiData.timestamp && (
          <Text size="xs" c="dimmed" mt="xs">
            Terakhir dianalisis: {new Date(apiData.timestamp).toLocaleString('id-ID')}
          </Text>
        )}
      </Card>

      {/* Loop melalui semua endpoints (methods) */}
      {apiData.endpoints.map((endpoint, index) => (
        <div key={index}>
          {/* Endpoint Header */}
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group gap="md" mb="sm">
              <Badge color={getMethodColor(endpoint.method)} size="lg">
                {endpoint.method}
              </Badge>
              <Code style={{ fontSize: '1.1rem', flex: 1 }}>{apiData.endpoint}</Code>
            </Group>

            <Title order={5} mb="xs">
              {endpoint.summary}
            </Title>

            {endpoint.description && (
              <Text size="sm" c="dimmed">
                {endpoint.description}
              </Text>
            )}
          </Card>

          {/* Parameters */}
          {endpoint.params && endpoint.params.length > 0 && (
            <Card shadow="sm" padding="lg" radius="md" withBorder mt="sm">
              <Title order={6} mb="md">
                Parameter untuk {endpoint.method}
              </Title>

              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Nama</Table.Th>
                    <Table.Th>Tipe</Table.Th>
                    <Table.Th>Lokasi</Table.Th>
                    <Table.Th>Wajib</Table.Th>
                    <Table.Th>Deskripsi</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {endpoint.params.map((param, paramIndex) => (
                    <Table.Tr key={paramIndex}>
                      <Table.Td>
                        <Code>{param.name}</Code>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" size="sm">
                          {param.type}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="outline" size="sm">
                          {param.location}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={param.required ? 'red' : 'gray'} size="sm">
                          {param.required ? 'Wajib' : 'Opsional'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{param.description}</Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>
          )}

          {/* Response Schema */}
          {endpoint.responseSchema && endpoint.responseSchema.length > 0 && (
            <Card shadow="sm" padding="lg" radius="md" withBorder mt="sm">
              <Title order={6} mb="md">
                Skema Response untuk {endpoint.method}
              </Title>

              <Stack gap="md">
                {endpoint.responseSchema.map((response, respIndex) => (
                  <div key={respIndex}>
                    <Group gap="sm" mb="xs">
                      <Badge color={response.status >= 200 && response.status < 300 ? 'green' : 'red'}>
                        {response.status}
                      </Badge>
                      <Text size="sm" c="dimmed">
                        {response.contentType}
                      </Text>
                    </Group>

                    <Text size="sm" fw={500} mb="xs">
                      Skema:
                    </Text>
                    <Code block>{response.schema}</Code>

                    {response.example && (
                      <>
                        <Text size="sm" fw={500} mt="md" mb="xs">
                          Contoh:
                        </Text>
                        <Code block>{response.example}</Code>
                      </>
                    )}
                  </div>
                ))}
              </Stack>
            </Card>
          )}

          {index < apiData.endpoints.length - 1 && <Divider my="xl" />}
        </div>
      ))}
    </Stack>
  );
}

export default DocumentationTab;
