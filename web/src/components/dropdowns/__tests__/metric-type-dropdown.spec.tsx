import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { MetricType } from '../../../model/flow-query';
import { MetricTypeDropdown } from '../metric-type-dropdown';

describe('<MetricDropdown />', () => {
  const props = {
    allowedTypes: ['Bytes', 'Packets'] as MetricType[],
    selected: 'Bytes',
    setMetricType: jest.fn(),
    id: 'metric'
  };

  it('should render component', async () => {
    render(<MetricTypeDropdown {...props} />);
    expect(screen.getByRole('button')).toHaveAttribute('id', 'metric-dropdown');
  });

  it('should open and close', async () => {
    const { container } = render(<MetricTypeDropdown {...props} />);

    await act(async () => {
      fireEvent.click(container.querySelector('#metric-dropdown')!);
    });
    await waitFor(() => {
      expect(document.querySelectorAll('[data-test="metric"] li').length).toBeGreaterThan(0);
    });

    await act(async () => {
      fireEvent.click(container.querySelector('#metric-dropdown')!);
    });

    expect(props.setMetricType).toHaveBeenCalledTimes(0);
  });

  it('should refresh on select', async () => {
    const user = userEvent.setup();
    const { container } = render(<MetricTypeDropdown {...props} />);

    await act(async () => {
      fireEvent.click(container.querySelector('#metric-dropdown')!);
    });
    await waitFor(() => expect(document.querySelector('#Packets')).toBeTruthy());

    await user.click(document.querySelector('#Packets')!);
    expect(props.setMetricType).toHaveBeenCalledWith('Packets');

    await act(async () => {
      fireEvent.click(container.querySelector('#metric-dropdown')!);
    });
    await waitFor(() => expect(document.querySelector('#Bytes')).toBeTruthy());

    await user.click(document.querySelector('#Bytes')!);

    expect(props.setMetricType).toHaveBeenCalledTimes(2);
    expect(props.setMetricType).toHaveBeenCalledWith('Bytes');
  });
});
