import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { RefreshDropdown, RefreshDropdownProps } from '../refresh-dropdown';

describe('<RefreshDropdown />', () => {
  const props: RefreshDropdownProps = {
    interval: undefined,
    setInterval: jest.fn(),
    id: 'refresh'
  };

  it('should render component', async () => {
    render(<RefreshDropdown {...props} />);
    expect(screen.getByRole('button')).toHaveAttribute('id', 'refresh-dropdown');
  });

  it('should open and close', async () => {
    const { container } = render(<RefreshDropdown {...props} />);

    await act(async () => {
      fireEvent.click(container.querySelector('#refresh-dropdown')!);
    });
    await waitFor(() => {
      expect(document.querySelectorAll('[data-test="refresh"] li').length).toBeGreaterThan(0);
    });

    await act(async () => {
      fireEvent.click(container.querySelector('#refresh-dropdown')!);
    });

    expect(props.setInterval).toHaveBeenCalledTimes(0);
  });

  it('should refresh on select', async () => {
    const user = userEvent.setup();
    const { container } = render(<RefreshDropdown {...props} />);

    await act(async () => {
      fireEvent.click(container.querySelector('#refresh-dropdown')!);
    });
    await waitFor(() => expect(document.querySelector('#OFF_KEY')).toBeTruthy());

    await user.click(document.querySelector('#OFF_KEY')!);
    expect(props.setInterval).toHaveBeenCalledWith(undefined);

    await act(async () => {
      fireEvent.click(container.querySelector('#refresh-dropdown')!);
    });
    await waitFor(() => expect(document.querySelector('[id="15s"]')).toBeTruthy());

    await user.click(document.querySelector('[id="15s"]')!);

    expect(props.setInterval).toHaveBeenCalledTimes(2);
    expect(props.setInterval).toHaveBeenCalledWith(15000);
  });
});
