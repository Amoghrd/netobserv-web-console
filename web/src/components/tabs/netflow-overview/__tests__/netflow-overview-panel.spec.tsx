import { render } from '@testing-library/react';
import * as React from 'react';

import { MetricType } from '../../../../model/flow-query';
import { metrics } from '../../../__tests-data__/metrics';
import { SamplePanel } from '../../../__tests-data__/panels';
import { MetricsGraph, MetricsGraphProps } from '../../../metrics/metrics-graph';
import { NetflowOverviewPanel } from '../netflow-overview-panel';

describe('<NetflowOverviewPanel />', () => {
  const panelProps = {
    doubleWidth: false,
    bodyClassName: 'overview-panel-body',
    title: 'title',
    kebabItems: []
  };
  const contentProps: MetricsGraphProps = {
    id: SamplePanel.id,
    metricType: 'Bytes' as MetricType,
    metricFunction: 'avg',
    metrics: metrics.map(m => ({ ...m, shortName: 'whatever', fullName: 'whatever', isInternal: false })),
    limit: 5,
    tooltipsTruncate: true
  };

  it('should render component', async () => {
    const { container } = render(<NetflowOverviewPanel {...panelProps} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('should render content', async () => {
    const { container } = render(
      <NetflowOverviewPanel {...panelProps}>
        <MetricsGraph {...contentProps} />
      </NetflowOverviewPanel>
    );
    expect(container.querySelector('.pf-v6-c-card')).toBeTruthy();
  });
});
