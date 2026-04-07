import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { MetricType, RecordType } from '../../../model/flow-query';
import { FlowsSample, getTestFlows } from '../../__tests-data__/flows';
import { FlowsQuerySummary } from '../flows-query-summary';

describe('<FlowsQuerySummary />', () => {
  const now = new Date();

  const mocks = {
    isShowQuerySummary: false,
    toggleQuerySummary: jest.fn(),
    flows: FlowsSample,
    type: 'flowLog' as RecordType,
    metricType: 'Bytes' as MetricType,
    stats: {
      limitReached: false,
      numQueries: 1,
      dataSources: ['loki']
    },
    range: 300,
    lastRefresh: now
  };

  it('should render component', async () => {
    const { container } = render(<FlowsQuerySummary {...mocks} />);
    await waitFor(() => {
      expect(container.querySelector('#query-summary-content')).toBeTruthy();
    });
  });

  it('should show summary', async () => {
    const { container } = render(<FlowsQuerySummary {...mocks} />);
    await waitFor(() => {
      expect(container.querySelector('#flowsCount')).toBeTruthy();
    });

    expect(container.querySelector('#flowsCount')?.textContent).toBe('3 Flows');
    expect(container.querySelector('#bytesCount')?.textContent).toBe('161 kB');
    expect(container.querySelector('#packetsCount')?.textContent).toBe('1k Packets');
    expect(container.querySelector('#bytesPerSecondsCount')?.textContent).toBe('538 Bps');
    expect(container.querySelector('#lastRefresh')?.textContent).toBe(now.toLocaleTimeString());
  });

  it('should format summary', async () => {
    const { container } = render(
      <FlowsQuerySummary
        {...mocks}
        flows={getTestFlows(1005)}
        stats={{ limitReached: true, numQueries: 1, dataSources: ['loki'] }}
      />
    );
    await waitFor(() => {
      expect(container.querySelector('#flowsCount')).toBeTruthy();
    });

    expect(container.querySelector('#flowsCount')?.textContent).toBe('1k+ Flows');
    expect(container.querySelector('#bytesCount')?.textContent).toBe('757+ MB');
    expect(container.querySelector('#packetsCount')?.textContent).toBe('1k+ Packets');
    expect(container.querySelector('#bytesPerSecondsCount')?.textContent).toBe('2.52+ MBps');
    expect(container.querySelector('#lastRefresh')?.textContent).toBe(now.toLocaleTimeString());
  });

  it('should toggle panel', async () => {
    const user = userEvent.setup();
    const { container } = render(<FlowsQuerySummary {...mocks} />);
    await waitFor(() => {
      expect(container.querySelector('#query-summary-toggle')).toBeTruthy();
    });

    await user.click(container.querySelector('#query-summary-toggle')!);
    expect(mocks.toggleQuerySummary).toHaveBeenCalledTimes(1);
  });
});
