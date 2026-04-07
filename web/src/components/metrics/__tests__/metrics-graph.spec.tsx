import { render, waitFor } from '@testing-library/react';
import * as React from 'react';

import { metrics } from '../../__tests-data__/metrics';
import { MetricsGraph, MetricsGraphProps } from '../metrics-graph';

describe('<MetricsContent />', () => {
  const props: MetricsGraphProps = {
    id: 'chart-test',
    metricType: 'Bytes',
    metricFunction: 'avg',
    metrics: metrics.map(m => ({ ...m, fullName: 'whatever', shortName: 'whatever', isInternal: false })),
    smallerTexts: false,
    limit: 5,
    tooltipsTruncate: true
  };

  it('should render component', async () => {
    const { container } = render(<MetricsGraph {...props} />);
    expect(container.querySelector('#chart-chart-test')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render bar', async () => {
    const { container } = render(<MetricsGraph {...props} showBar={true} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    await waitFor(() => {
      const svg = container.querySelector('svg')!;
      expect(svg.querySelectorAll('[role="presentation"]').length).toBeGreaterThan(0);
    });
  });

  it('should render area', async () => {
    const { container } = render(<MetricsGraph {...props} showArea={true} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    await waitFor(() => {
      expect(container.querySelectorAll('path').length).toBeGreaterThan(0);
    });
  });

  it('should render area with scatter', async () => {
    const { container } = render(<MetricsGraph {...props} showArea={true} showScatter={true} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    await waitFor(() => {
      const pathCount = container.querySelectorAll('path').length;
      expect(pathCount).toBeGreaterThan(0);
    });
  });
});
