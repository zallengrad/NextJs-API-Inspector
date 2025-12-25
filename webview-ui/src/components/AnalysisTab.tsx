import { Alert, Stack, Title, Text, Badge } from '@mantine/core';
import { ApiData } from '../types/api';

interface AnalysisTabProps {
  apiData: ApiData;
}

function AnalysisTab({ apiData }: AnalysisTabProps) {
  const getAlertColor = (severity: string) => {
    const colors: Record<string, string> = {
      error: 'red',
      warning: 'yellow',
      info: 'blue',
    };
    return colors[severity] || 'gray';
  };

  const getAlertTitle = (severity: string) => {
    const titles: Record<string, string> = {
      error: '🚨 Masalah Keamanan',
      warning: '⚠️ Peringatan',
      info: 'ℹ️ Informasi',
    };
    return titles[severity] || 'Pemberitahuan';
  };

  if (!apiData.issues || apiData.issues.length === 0) {
    return (
      <Alert title="✅ Semua Aman!" color="green">
        Tidak ada masalah keamanan atau skalabilitas yang terdeteksi pada API route ini.
      </Alert>
    );
  }

  // Kelompokkan issues berdasarkan severity
  const errorIssues = apiData.issues.filter((i) => i.severity === 'error');
  const warningIssues = apiData.issues.filter((i) => i.severity === 'warning');
  const infoIssues = apiData.issues.filter((i) => i.severity === 'info');

  return (
    <Stack gap="md">
      {/* Ringkasan */}
      <div>
        <Title order={5} mb="md">
          Ringkasan Analisis
        </Title>
        <Stack gap="xs">
          <Text size="sm">
            <Badge color="red" mr="xs">
              {errorIssues.length}
            </Badge>
            Masalah Kritis
          </Text>
          <Text size="sm">
            <Badge color="yellow" mr="xs">
              {warningIssues.length}
            </Badge>
            Peringatan
          </Text>
          <Text size="sm">
            <Badge color="blue" mr="xs">
              {infoIssues.length}
            </Badge>
            Informasi
          </Text>
        </Stack>
      </div>

      {/* Issues */}
      <div>
        <Title order={5} mb="md">
          Masalah yang Terdeteksi
        </Title>
        <Stack gap="md">
          {apiData.issues.map((issue, index) => (
            <Alert
              key={index}
              title={getAlertTitle(issue.severity) + ': ' + issue.title}
              color={getAlertColor(issue.severity)}
            >
              <Text size="sm" mb={issue.recommendation ? 'xs' : 0}>
                {issue.description}
              </Text>
              {issue.recommendation && (
                <>
                  <Text size="sm" fw={500} mt="sm" mb="xs">
                    Rekomendasi:
                  </Text>
                  <Text size="sm" c="dimmed">
                    {issue.recommendation}
                  </Text>
                </>
              )}
            </Alert>
          ))}
        </Stack>
      </div>
    </Stack>
  );
}

export default AnalysisTab;
