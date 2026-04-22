import { Card, CardBody, Content, ContentVariants, Flex, FlexItem } from '@patternfly/react-core';
import * as React from 'react';

export type Severity = 'critical' | 'warning' | 'info';

export interface HealthMetricCardProps {
  severity: Severity;
  label: string;
  total: number;
  detail?: string;
}

export const HealthMetricCard: React.FC<HealthMetricCardProps> = ({ severity, label, total, detail }) => {
  return (
    <Card className={`health-metric-card ${severity}`}>
      <CardBody>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
          <FlexItem>
            <Content component={ContentVariants.small} className="metric-label">
              {label}
            </Content>
          </FlexItem>
          <FlexItem>
            <Content component={ContentVariants.h1} className="metric-value">
              {total}
            </Content>
          </FlexItem>
          {total > 0 && detail && (
            <FlexItem>
              <Content component={ContentVariants.small} className="metric-detail">
                {detail}
              </Content>
            </FlexItem>
          )}
        </Flex>
      </CardBody>
    </Card>
  );
};
