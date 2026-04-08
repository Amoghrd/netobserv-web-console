import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { ScopeDefSample } from '../../../components/__tests-data__/scopes';
import { MetricScopeOptions } from '../../../model/metrics';
import { GroupDropdown } from '../group-dropdown';

describe('<GroupDropdown />', () => {
  const props = {
    scope: MetricScopeOptions.RESOURCE,
    selected: 'hosts',
    setGroupType: jest.fn(),
    id: 'group',
    scopes: ScopeDefSample
  };

  it('should render component', async () => {
    render(<GroupDropdown {...props} />);
    expect(screen.getByRole('button')).toHaveAttribute('id', 'group-dropdown');
  });

  it('should open and close', async () => {
    const { container } = render(<GroupDropdown {...props} />);

    await act(async () => {
      fireEvent.click(container.querySelector('#group-dropdown')!);
    });
    await waitFor(() => {
      expect(document.querySelectorAll('[data-test="group"] li').length).toBeGreaterThan(0);
    });

    await act(async () => {
      fireEvent.click(container.querySelector('#group-dropdown')!);
    });

    expect(props.setGroupType).toHaveBeenCalledTimes(0);
  });

  it('should refresh on select', async () => {
    const user = userEvent.setup();
    const { container } = render(<GroupDropdown {...props} />);

    await act(async () => {
      fireEvent.click(container.querySelector('#group-dropdown')!);
    });
    await waitFor(() => expect(document.querySelector('#none')).toBeTruthy());

    await user.click(document.querySelector('#none')!);
    expect(props.setGroupType).toHaveBeenCalledWith('none');

    await act(async () => {
      fireEvent.click(container.querySelector('#group-dropdown')!);
    });
    await waitFor(() => expect(document.querySelector('#owners')).toBeTruthy());

    await user.click(document.querySelector('#owners')!);

    expect(props.setGroupType).toHaveBeenCalledTimes(2);
    expect(props.setGroupType).toHaveBeenCalledWith('owners');
  });
});
