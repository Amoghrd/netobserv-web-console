import { act, fireEvent, render } from '@testing-library/react';
import * as React from 'react';

import { QueryOptionsDropdown, QueryOptionsProps } from '../query-options-dropdown';
import { QueryOptionsPanel } from '../query-options-panel';

describe('<QueryOptionsDropdown />', () => {
  const props: QueryOptionsProps = {
    recordType: 'allConnections',
    dataSource: 'auto',
    allowProm: true,
    allowLoki: true,
    allowFlow: true,
    allowConnection: true,
    allowPktDrops: true,
    useTopK: false,
    limit: 100,
    packetLoss: 'all',
    setLimit: jest.fn(),
    setPacketLoss: jest.fn(),
    setRecordType: jest.fn(),
    setDataSource: jest.fn()
  };

  it('should render component', async () => {
    render(<QueryOptionsDropdown {...props} />);
    expect(document.querySelector('[data-test="query-options-dropdown-container"]')).toBeTruthy();
  });
});

describe('<QueryOptionsPanel />', () => {
  const props: QueryOptionsProps = {
    recordType: 'allConnections',
    dataSource: 'auto',
    allowProm: true,
    allowLoki: true,
    allowFlow: true,
    allowConnection: true,
    allowPktDrops: true,
    useTopK: false,
    limit: 100,
    packetLoss: 'all',
    setLimit: jest.fn(),
    setPacketLoss: jest.fn(),
    setRecordType: jest.fn(),
    setDataSource: jest.fn()
  };

  beforeEach(() => {
    props.setLimit = jest.fn();
  });

  it('should render component', async () => {
    const { container } = render(<QueryOptionsPanel {...props} />);
    expect(container.querySelectorAll('.pf-v6-c-menu__group').length).toBe(4);
    expect(container.querySelectorAll('.pf-v6-c-menu__group-title').length).toBe(4);
    expect(container.querySelectorAll('input[type="radio"]')).toHaveLength(13);

    expect(props.setLimit).toHaveBeenCalledTimes(0);
  });

  it('should set options', async () => {
    const { container, rerender } = render(<QueryOptionsPanel {...props} />);
    expect(props.setLimit).toHaveBeenCalledTimes(0);

    await act(async () => {
      fireEvent.click(container.querySelector('#limit-1000')!);
    });
    expect(props.setLimit).toHaveBeenNthCalledWith(1, 1000);
    rerender(<QueryOptionsPanel {...props} limit={1000} />);
  });
});
