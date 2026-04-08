import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { MetricFunctionDropdown } from '../metric-function-dropdown';

describe('<MetricDropdown />', () => {
  const props = {
    selected: 'avg',
    setMetricFunction: jest.fn(),
    id: 'metric'
  };

  it('should render component', async () => {
    render(<MetricFunctionDropdown {...props} />);
    expect(screen.getByRole('button')).toHaveAttribute('id', 'metric-dropdown');
  });

  it('should open and close', async () => {
    const { container } = render(<MetricFunctionDropdown {...props} />);

    await act(async () => {
      fireEvent.click(container.querySelector('#metric-dropdown')!);
    });
    await waitFor(() => {
      expect(document.querySelectorAll('[data-test="metric"] li').length).toBeGreaterThan(0);
    });

    await act(async () => {
      fireEvent.click(container.querySelector('#metric-dropdown')!);
    });

    expect(props.setMetricFunction).toHaveBeenCalledTimes(0);
  });

  it('should refresh on select', async () => {
    const user = userEvent.setup();
    const { container } = render(<MetricFunctionDropdown {...props} />);

    await act(async () => {
      fireEvent.click(container.querySelector('#metric-dropdown')!);
    });
    await waitFor(() => expect(document.querySelector('#max')).toBeTruthy());

    await user.click(document.querySelector('#max')!);

    expect(props.setMetricFunction).toHaveBeenCalledTimes(1);
    expect(props.setMetricFunction).toHaveBeenCalledWith('max');
  });
});
