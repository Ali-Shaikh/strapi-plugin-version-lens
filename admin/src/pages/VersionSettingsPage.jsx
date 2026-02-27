import React, { useCallback, useEffect, useState } from 'react';
import { Layouts, Page, useFetchClient, useNotification } from '@strapi/strapi/admin';
import { Box, Button, Divider, Flex, Loader, Typography } from '@strapi/design-system';

const Field = ({ label, value, onCopy }) => {
  return (
    <Box>
      <Typography variant="sigma" textColor="neutral600">
        {label}
      </Typography>
      <Flex justifyContent="space-between" alignItems="center" paddingTop={1} gap={2}>
        <Typography variant="omega">{value && value.length > 0 ? value : '-'}</Typography>
        {onCopy && value ? (
          <Button type="button" size="S" onClick={onCopy}>
            Copy
          </Button>
        ) : null}
      </Flex>
    </Box>
  );
};

const VersionSettingsPage = () => {
  const [versionInfo, setVersionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { get } = useFetchClient();
  const { toggleNotification } = useNotification();

  const loadVersionInfo = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const { data } = await get('/version-lens/info');
        setVersionInfo(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load version information');
        toggleNotification({
          type: 'danger',
          message: 'Failed to load version information',
        });
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [get, toggleNotification]
  );

  useEffect(() => {
    void loadVersionInfo();
  }, [loadVersionInfo]);

  const copyToClipboard = useCallback(
    async (label, value) => {
      if (!value || !navigator?.clipboard) return;

      try {
        await navigator.clipboard.writeText(value);
        toggleNotification({
          type: 'success',
          message: `${label} copied`,
        });
      } catch (err) {
        console.error(err);
        toggleNotification({
          type: 'danger',
          message: `Failed to copy ${label.toLowerCase()}`,
        });
      }
    },
    [toggleNotification]
  );

  return (
    <Page.Main>
      <Layouts.Header
        title="Version Lens"
        subtitle="App version, runtime, and deployment metadata"
        primaryAction={
          <Button type="button" size="S" loading={refreshing} onClick={() => void loadVersionInfo(true)}>
            Refresh
          </Button>
        }
      />

      <Layouts.Content>
        {loading ? (
          <Flex justifyContent="center" padding={8}>
            <Loader>Loading...</Loader>
          </Flex>
        ) : error ? (
          <Box padding={8}>
            <Typography textColor="danger600">{error}</Typography>
            <Box paddingTop={4}>
              <Button type="button" onClick={() => void loadVersionInfo()}>
                Retry
              </Button>
            </Box>
          </Box>
        ) : versionInfo ? (
          <Box
            background="neutral0"
            hasRadius
            shadow="tableShadow"
            paddingTop={6}
            paddingBottom={6}
            paddingLeft={7}
            paddingRight={7}
          >
            <Flex direction="column" alignItems="stretch" gap={4}>
              <Field
                label="Version"
                value={versionInfo.version}
                onCopy={() => void copyToClipboard('Version', versionInfo.version)}
              />

              <Divider />
              <Field
                label="Application Name"
                value={versionInfo.name}
                onCopy={() => void copyToClipboard('Application name', versionInfo.name)}
              />

              <Divider />
              <Field label="Description" value={versionInfo.description} />

              <Divider />
              <Field label="Strapi Version" value={versionInfo.strapiVersion} />

              <Divider />
              <Field label="Node Version" value={versionInfo.nodeVersion} />

              <Divider />
              <Field label="Environment" value={versionInfo.environment} />

              <Divider />
              <Field
                label="Commit SHA"
                value={versionInfo.commitSha}
                onCopy={() => void copyToClipboard('Commit SHA', versionInfo.commitSha)}
              />

              <Divider />
              <Field label="Build Date" value={versionInfo.buildDate} />

              <Divider />
              <Field label="Loaded At" value={new Date(versionInfo.generatedAt).toLocaleString()} />
            </Flex>
          </Box>
        ) : (
          <Box padding={8}>
            <Typography>Version information unavailable.</Typography>
          </Box>
        )}
      </Layouts.Content>
    </Page.Main>
  );
};

export default VersionSettingsPage;
