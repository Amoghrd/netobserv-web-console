import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { LayoutName } from '../../../model/topology';
import { LayoutDropdown } from '../layout-dropdown';

describe('<LayoutDropdown />', () => {
  const props = {
    selected: LayoutName.cola,
    setLayout: jest.fn(),
    id: 'layout'
  };

  it('should render component', async () => {
    render(<LayoutDropdown {...props} />);
    expect(screen.getByRole('button')).toHaveAttribute('id', 'layout-dropdown');
  });

  it('should open and close', async () => {
    const { container } = render(<LayoutDropdown {...props} />);

    await act(async () => {
      fireEvent.click(container.querySelector('#layout-dropdown')!);
    });
    await waitFor(() => {
      expect(document.querySelectorAll('[data-test="layout"] li').length).toBeGreaterThan(0);
    });

    await act(async () => {
      fireEvent.click(container.querySelector('#layout-dropdown')!);
    });

    expect(props.setLayout).toHaveBeenCalledTimes(0);
  });

  it('should refresh on select', async () => {
    const user = userEvent.setup();
    const { container } = render(<LayoutDropdown {...props} />);

    await act(async () => {
      fireEvent.click(container.querySelector('#layout-dropdown')!);
    });
    await waitFor(() => expect(document.querySelector('#Dagre')).toBeTruthy());

    await user.click(document.querySelector('#Dagre')!);
    expect(props.setLayout).toHaveBeenCalledWith(LayoutName.dagre);

    await act(async () => {
      fireEvent.click(container.querySelector('#layout-dropdown')!);
    });
    await waitFor(() => expect(document.querySelector('#Force')).toBeTruthy());

    await user.click(document.querySelector('#Force')!);

    expect(props.setLayout).toHaveBeenCalledTimes(2);
    expect(props.setLayout).toHaveBeenCalledWith(LayoutName.force);
  });
});
