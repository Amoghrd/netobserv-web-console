import { act, fireEvent, render } from '@testing-library/react';
import * as React from 'react';

import { Size, TableDisplayDropdown } from '../table-display-dropdown';
import { TableDisplayOptions } from '../table-display-options';

describe('<DisplayDropdown />', () => {
  const props = {
    size: 's' as Size,
    setSize: jest.fn(),
    showDuplicates: true,
    setShowDuplicates: jest.fn()
  };

  it('should render component', async () => {
    const { container } = render(<TableDisplayDropdown {...props} />);
    expect(container.querySelector('[data-test="display-dropdown-button"]')).toBeTruthy();
  });

  it('should setSize on select', async () => {
    const { container } = render(<TableDisplayOptions {...props} size="m" />);

    await act(async () => {
      fireEvent.click(container.querySelector('#size-s')!);
    });
    expect(props.setSize).toHaveBeenCalledWith('s');

    await act(async () => {
      fireEvent.click(container.querySelector('#size-l')!);
    });
    expect(props.setSize).toHaveBeenCalledWith('l');
    expect(props.setSize).toHaveBeenCalledTimes(2);
  });
});
