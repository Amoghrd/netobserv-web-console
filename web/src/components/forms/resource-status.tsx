/* eslint-disable @typescript-eslint/no-explicit-any */
import { K8sResourceCondition, K8sResourceKind } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Content, ContentVariants, Label, Title } from '@patternfly/react-core';
import {
  BanIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  HourglassHalfIcon,
  UnknownIcon
} from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '../../utils/url';
import { ComponentStatus, ExporterStatus } from './pipeline';

export type ResourceStatusProps = {
  group: string;
  version: string;
  kind: string;
  existing: K8sResourceKind | null;
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
};

type LabelColor = 'green' | 'orange' | 'red' | 'blue' | 'grey';

const stateColor = (state: string | undefined): LabelColor => {
  switch (state) {
    case 'Ready':
      return 'green';
    case 'Degraded':
      return 'orange';
    case 'Failure':
      return 'red';
    case 'InProgress':
      return 'blue';
    case 'Unused':
      return 'grey';
    default:
      return 'grey';
  }
};

const StateIcon: FC<{ state: string | undefined }> = ({ state }) => {
  switch (state) {
    case 'Ready':
      return <CheckCircleIcon color="var(--pf-v5-global--success-color--100)" />;
    case 'Degraded':
      return <ExclamationTriangleIcon color="var(--pf-v5-global--warning-color--100)" />;
    case 'Failure':
      return <ExclamationCircleIcon color="var(--pf-v5-global--danger-color--100)" />;
    case 'InProgress':
      return <HourglassHalfIcon color="var(--pf-v5-global--info-color--100)" />;
    case 'Unused':
      return <BanIcon color="var(--pf-v5-global--disabled-color--100)" />;
    default:
      return <UnknownIcon color="var(--pf-v5-global--disabled-color--100)" />;
  }
};

interface ComponentRowData {
  id: string;
  name: string;
  status: ComponentStatus;
}

const ComponentStatusTable: FC<{
  components: ComponentRowData[];
  exporters: ExporterStatus[];
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
}> = ({ components, exporters, selectedTypes, setSelectedTypes }) => {
  const { t } = useTranslation('plugin__netobserv-plugin');
  const activeComponents = components.filter(c => c.status.state !== 'Unused');
  const unusedComponents = components.filter(c => c.status.state === 'Unused');

  if (!activeComponents.length && !exporters.length) {
    return null;
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <Title headingLevel="h3" size="md" style={{ marginBottom: '0.5rem' }}>
        {t('Component statuses')}
      </Title>
      <Table variant="compact">
        <Thead>
          <Tr>
            <Th>{t('Component')}</Th>
            <Th>{t('State')}</Th>
            <Th>{t('Replicas')}</Th>
            <Th>{t('Details')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {activeComponents.map(c => (
            <Tr
              key={c.id}
              isRowSelected={selectedTypes.includes(c.id)}
              isClickable
              onRowClick={() => setSelectedTypes([c.id])}
            >
              <Td>
                <StateIcon state={c.status.state} /> {c.name}
              </Td>
              <Td>
                <Label color={stateColor(c.status.state)}>{c.status.state}</Label>
              </Td>
              <Td>
                {c.status.desiredReplicas != null ? `${c.status.readyReplicas ?? 0}/${c.status.desiredReplicas}` : '-'}
              </Td>
              <Td>
                {c.status.podIssues ? c.status.podIssues : c.status.message ? c.status.message : c.status.reason || '-'}
              </Td>
            </Tr>
          ))}
          {exporters.map((exp, i) => (
            <Tr
              key={`exporter-${i}`}
              isRowSelected={selectedTypes.includes(`exporter-${i}`)}
              isClickable
              onRowClick={() => setSelectedTypes([`exporter-${i}`])}
            >
              <Td>
                <StateIcon state={exp.state} /> {exp.name || exp.type}
              </Td>
              <Td>
                <Label color={stateColor(exp.state)}>{exp.state}</Label>
              </Td>
              <Td>-</Td>
              <Td>{exp.message || exp.reason || '-'}</Td>
            </Tr>
          ))}
          {unusedComponents.length > 0 && (
            <Tr>
              <Td colSpan={4} style={{ color: 'var(--pf-v5-global--disabled-color--100)', fontStyle: 'italic' }}>
                {t('Unused: {{list}}', { list: unusedComponents.map(c => c.name).join(', ') })}
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </div>
  );
};

export const ResourceStatus: FC<ResourceStatusProps> = ({
  group,
  version,
  kind,
  existing,
  selectedTypes,
  setSelectedTypes
}) => {
  const { t } = useTranslation('plugin__netobserv-plugin');
  const navigate = useNavigate();

  if (!existing) {
    return (
      <>
        <Content component={ContentVariants.p}>{t("{{kind}} resource doesn't exists yet.", { kind })}</Content>
        <Button
          onClick={() => {
            navigate(`/k8s/cluster/${group}~${version}~${kind}/~new/form`);
          }}
        >
          {t('Create {{kind}}', { kind })}
        </Button>
      </>
    );
  }

  const components: ComponentRowData[] = [];
  if (existing.status?.components?.agent) {
    components.push({ id: 'agent', name: t('eBPF Agent'), status: existing.status.components.agent });
  }
  if (existing.status?.components?.processor) {
    components.push({ id: 'processor', name: t('Flowlogs Pipeline'), status: existing.status.components.processor });
  }
  if (existing.status?.components?.plugin) {
    components.push({ id: 'plugin', name: t('Console Plugin'), status: existing.status.components.plugin });
  }
  if (existing.status?.integrations?.loki) {
    components.push({ id: 'loki', name: 'Loki', status: existing.status.integrations.loki });
  }
  if (existing.status?.integrations?.monitoring) {
    components.push({ id: 'monitoring', name: t('Monitoring'), status: existing.status.integrations.monitoring });
  }
  const exporters: ExporterStatus[] = existing.status?.integrations?.exporters || [];

  const sortConditions = [
    (c: K8sResourceCondition) => c.type === 'Ready',
    (c: K8sResourceCondition) => c.type === 'ConfigurationIssue',
    (c: K8sResourceCondition) => c.type === 'KafkaReady'
  ];
  const conditions = ((existing?.status?.conditions || []) as K8sResourceCondition[]).sort((a, b) => {
    for (const pred of sortConditions) {
      if (pred(a) && pred(b)) {
        return 0;
      } else if (pred(a)) {
        return -1;
      } else if (pred(b)) {
        return 1;
      }
    }
    return 0;
  });

  return (
    <>
      <ComponentStatusTable
        components={components}
        exporters={exporters}
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
      />

      <Title headingLevel="h3" size="md" style={{ marginBottom: '0.5rem' }}>
        {t('Conditions')}
      </Title>
      <Table id="resource-status-table" data-test={conditions.find(c => c.type === 'Ready')?.message} variant="compact">
        <Thead>
          <Tr>
            <Th>{t('Type')}</Th>
            <Th>{t('Status')}</Th>
            <Th>{t('Reason')}</Th>
            <Th>{t('Message')}</Th>
            <Th>{t('Changed')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {conditions.map((condition, i) => {
            const isWarning =
              condition.type === 'ConfigurationIssue' && condition.status === 'True' && condition.reason === 'Warnings';
            const isError =
              (condition.type === 'ConfigurationIssue' &&
                condition.status === 'True' &&
                condition.reason === 'Error') ||
              (condition.type !== 'ConfigurationIssue' &&
                condition.status === 'False' &&
                condition.reason !== 'Pending' &&
                condition.reason !== 'Valid');
            return (
              <Tr
                id={`${condition.type}-row`}
                data-test-status={`${condition.status}`}
                data-test-reason={`${condition.reason}`}
                key={i}
              >
                <Td>
                  {isError ? (
                    <ExclamationCircleIcon color="var(--pf-v5-global--danger-color--100)" />
                  ) : isWarning ? (
                    <ExclamationTriangleIcon color="var(--pf-v5-global--warning-color--100)" />
                  ) : condition.status === 'True' && condition.type !== 'ConfigurationIssue' ? (
                    <CheckCircleIcon color="var(--pf-v5-global--success-color--100)" />
                  ) : condition.status === 'False' && condition.reason === 'Pending' ? (
                    <HourglassHalfIcon color="var(--pf-v5-global--info-color--100)" />
                  ) : (
                    <UnknownIcon color="var(--pf-v5-global--disabled-color--100)" />
                  )}{' '}
                  {condition.type}
                </Td>
                <Td>{condition.status}</Td>
                <Td>{condition.reason}</Td>
                <Td
                  style={
                    isWarning
                      ? { color: 'var(--pf-v5-global--warning-color--200)' }
                      : isError
                      ? { color: 'var(--pf-v5-global--danger-color--100)' }
                      : undefined
                  }
                >
                  {condition.message}
                </Td>
                <Td>{condition.lastTransitionTime}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </>
  );
};

export default ResourceStatus;
