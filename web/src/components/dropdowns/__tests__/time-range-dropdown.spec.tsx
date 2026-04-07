import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { TimeRangeDropdown, TimeRangeDropdownProps } from '../time-range-dropdown';

describe('<TimeRangeDropdown />', () => {
  const props: TimeRangeDropdownProps = {
    range: 300,
    setRange: jest.fn(),
    openCustomModal: jest.fn(),
    id: 'time-range'
  };

  it('should render component', async () => {
    render(<TimeRangeDropdown {...props} />);
    expect(screen.getByRole('button')).toHaveAttribute('id', 'time-range-dropdown');
  });

  it('should open and close', async () => {
    const { container } = render(<TimeRangeDropdown {...props} />);

    await act(async () => {
      fireEvent.click(container.querySelector('#time-range-dropdown')!);
    });
    await waitFor(() => {
      expect(document.querySelectorAll('[data-test="time-range"] li').length).toBeGreaterThan(0);
    });

    await act(async () => {
      fireEvent.click(container.querySelector('#time-range-dropdown')!);
    });

    expect(props.setRange).toHaveBeenCalledTimes(0);
    expect(props.openCustomModal).toHaveBeenCalledTimes(0);
  });

  it('should set range on select', async () => {
    const user = userEvent.setup();
    const { container } = render(<TimeRangeDropdown {...props} />);

    await act(async () => {
      fireEvent.click(container.querySelector('#time-range-dropdown')!);
    });
    await waitFor(() => expect(document.querySelector('#CUSTOM_TIME_RANGE_KEY')).toBeTruthy());

    await user.click(document.querySelector('#CUSTOM_TIME_RANGE_KEY')!);
    expect(props.openCustomModal).toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(container.querySelector('#time-range-dropdown')!);
    });
    await waitFor(() => expect(document.querySelector('[id="5m"]')).toBeTruthy());

    await user.click(document.querySelector('[id="5m"]')!);
    expect(props.setRange).toHaveBeenCalledWith(300);

    await act(async () => {
      fireEvent.click(container.querySelector('#time-range-dropdown')!);
    });
    await waitFor(() => expect(document.querySelector('[id="15m"]')).toBeTruthy());

    await user.click(document.querySelector('[id="15m"]')!);

    expect(props.openCustomModal).toHaveBeenCalledTimes(1);
    expect(props.setRange).toHaveBeenCalledWith(900);
    expect(props.setRange).toHaveBeenCalledTimes(2);
  });
});
