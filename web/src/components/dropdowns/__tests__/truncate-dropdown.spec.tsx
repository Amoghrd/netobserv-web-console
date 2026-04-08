import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { TruncateDropdown, TruncateLength } from '../truncate-dropdown';

describe('<TruncateDropdown />', () => {
  const props = {
    selected: TruncateLength.M,
    setTruncateLength: jest.fn(),
    id: 'truncate'
  };

  it('should render component', async () => {
    render(<TruncateDropdown {...props} />);
    expect(screen.getByRole('button')).toHaveAttribute('id', 'truncate-dropdown');
  });

  it('should open and close', async () => {
    const { container } = render(<TruncateDropdown {...props} />);

    await act(async () => {
      fireEvent.click(container.querySelector('#truncate-dropdown')!);
    });
    await waitFor(() => {
      expect(document.querySelectorAll('[data-test="truncate"] li').length).toBeGreaterThan(0);
    });

    await act(async () => {
      fireEvent.click(container.querySelector('#truncate-dropdown')!);
    });

    expect(props.setTruncateLength).toHaveBeenCalledTimes(0);
  });

  it('should refresh on select', async () => {
    const user = userEvent.setup();
    const { container } = render(<TruncateDropdown {...props} />);

    await act(async () => {
      fireEvent.click(container.querySelector('#truncate-dropdown')!);
    });
    await waitFor(() => expect(document.querySelector('[id="0"]')).toBeTruthy());

    await user.click(document.querySelector('[id="0"]')!);
    expect(props.setTruncateLength).toHaveBeenCalledWith(TruncateLength.OFF);

    await act(async () => {
      fireEvent.click(container.querySelector('#truncate-dropdown')!);
    });
    await waitFor(() => expect(document.querySelector('[id="40"]')).toBeTruthy());

    await user.click(document.querySelector('[id="40"]')!);

    expect(props.setTruncateLength).toHaveBeenCalledTimes(2);
    expect(props.setTruncateLength).toHaveBeenCalledWith(TruncateLength.XL);
  });
});
