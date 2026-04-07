import { Drawer, DrawerContent } from '@patternfly/react-core';
import { fireEvent, render, waitFor } from '@testing-library/react';
import * as React from 'react';

import { DefaultColumnSample } from '../../../__tests-data__/columns';
import { FilterDefinitionSample, FiltersSample } from '../../../__tests-data__/filters';
import { FlowsSample, UnknownFlow } from '../../../__tests-data__/flows';
import RecordPanel, { RecordDrawerProps } from '../record-panel';

describe('<RecordPanel />', () => {
  const mocks: RecordDrawerProps = {
    record: FlowsSample[0],
    columns: DefaultColumnSample,
    filters: FiltersSample,
    filterDefinitions: FilterDefinitionSample,
    range: 300,
    type: 'flowLog',
    canSwitchTypes: false,
    allowPktDrops: false,
    setFilters: jest.fn(),
    setRange: jest.fn(),
    setType: jest.fn(),
    onClose: jest.fn(),
    id: 'record-panel-test'
  };

  const renderInDrawer = (props: RecordDrawerProps) =>
    render(
      <Drawer isExpanded>
        <DrawerContent panelContent={<RecordPanel {...props} />}>
          <div />
        </DrawerContent>
      </Drawer>
    );

  it('should render component', async () => {
    const { rerender } = renderInDrawer(mocks);
    await waitFor(() => {
      expect(document.querySelector('#record-panel-test')).toBeTruthy();
    });
    const fieldContainers = document.querySelectorAll('.record-field-container');
    expect(fieldContainers.length).toBe(20);
    expect(document.querySelector('[data-test-id="drawer-field-IcmpType"]')).toBeNull();
    expect(document.querySelector('[data-test-id="drawer-field-IcmpCode"]')).toBeNull();

    rerender(
      <Drawer isExpanded>
        <DrawerContent panelContent={<RecordPanel {...mocks} record={UnknownFlow} />}>
          <div />
        </DrawerContent>
      </Drawer>
    );
    await waitFor(() => {
      expect(document.querySelectorAll('.record-field-container').length).toBe(4);
    });
  });

  it('should close on click', async () => {
    renderInDrawer(mocks);
    await waitFor(() => {
      expect(document.querySelector('[data-test-id="drawer-close-button"]')).toBeTruthy();
    });
    fireEvent.click(document.querySelector('[data-test-id="drawer-close-button"]')!);
    expect(mocks.onClose).toHaveBeenCalled();
  });

  it('should render ICMP', async () => {
    const flowWithICMP = {
      ...mocks.record,
      fields: {
        ...mocks.record.fields,
        IcmpType: 8,
        IcmpCode: 0
      }
    };
    renderInDrawer({ ...mocks, record: flowWithICMP });
    await waitFor(() => {
      expect(document.querySelector('[data-test-id="drawer-field-IcmpType"]')).toBeTruthy();
    });
    expect(document.querySelector('[data-test-id="drawer-field-IcmpCode"]')).toBeTruthy();
  });
});
