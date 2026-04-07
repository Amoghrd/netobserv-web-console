import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';

import { compareNumbers } from '../../../../utils/base-compare';
import { ColumnsId } from '../../../../utils/columns';
import { DefaultColumnSample } from '../../../__tests-data__/columns';
import { FlowsSample } from '../../../__tests-data__/flows';
import { Size } from '../../../dropdowns/table-display-dropdown';
import RecordField, { RecordFieldFilter } from '../record-field';

describe('<RecordField />', () => {
  const filterMock: RecordFieldFilter = {
    type: 'filter',
    onClick: jest.fn(),
    isDelete: false
  };
  const mocks = {
    allowPktDrops: true,
    size: 'm' as Size,
    useLinks: true
  };

  it('should render single field', async () => {
    const { container } = render(<RecordField flow={FlowsSample[0]} column={DefaultColumnSample[0]} {...mocks} />);
    expect(container.querySelector('.record-field-content.m')).toBeTruthy();
  });

  it('should filter', async () => {
    const { container } = render(
      <RecordField flow={FlowsSample[0]} column={DefaultColumnSample[0]} filter={filterMock} {...mocks} />
    );
    expect(container.querySelector('.record-field-flex-container')).toBeTruthy();
    expect(container.querySelector('.record-field-flex')).toBeTruthy();
    const button = container.querySelector('button')!;
    expect(button).toBeTruthy();
    fireEvent.click(button);
    expect(filterMock.onClick).toHaveBeenCalledTimes(1);
  });

  it('should display <1ms DNS latency', async () => {
    const { container } = render(
      <RecordField
        flow={FlowsSample[2]}
        column={{
          id: ColumnsId.dnslatency,
          group: 'DNS',
          name: 'DNS Latency',
          isSelected: true,
          value: f => (f.fields.DnsLatencyMs === undefined ? Number.NaN : f.fields.DnsLatencyMs),
          sort: (a, b, col) => compareNumbers(col.value!(a) as number, col.value!(b) as number),
          width: 5
        }}
        {...mocks}
      />
    );
    const valueEl = container.querySelector('.record-field-value');
    expect(valueEl).toBeTruthy();
    expect(valueEl?.textContent).toBe('< 1ms');
  });
});
