import { mount, shallow } from 'enzyme';
import * as React from 'react';

import { DatePicker, TimePicker } from '@patternfly/react-core';
import { act } from 'react-dom/test-utils';
import { actOn } from '../../../components/__tests__/common.spec';
import { TimeRange } from '../../../utils/datetime';
import TimeRangeModal, { TimeRangeModalProps } from '../time-range-modal';

describe('<ColumnsModal />', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fakeEvent: any = {};
  const props: TimeRangeModalProps = {
    isModalOpen: true,
    setModalOpen: jest.fn(),
    range: undefined,
    setRange: jest.fn(),
    id: 'time-range-modal'
  };

  it('should render component', async () => {
    const wrapper = shallow(<TimeRangeModal {...props} />);
    expect(wrapper.find(TimeRangeModal)).toBeTruthy();
  });

  it('should save once', async () => {
    const wrapper = mount(<TimeRangeModal {...props} />);
    const confirmButton = wrapper.find('.pf-v5-c-button.pf-m-primary');
    expect(confirmButton.length).toEqual(1);

    await actOn(() => confirmButton.last().simulate('click'), wrapper);
    expect(props.setRange).toHaveBeenCalledTimes(1);
  });

  it('should update range on save', async () => {
    const nowRange: TimeRange = {
      from: new Date().setHours(0, 0, 0, 0) / 1000,
      to: new Date().setHours(23, 59, 0, 0) / 1000
    };

    const wrapper = mount(<TimeRangeModal {...props} />);
    expect(props.setRange).toHaveBeenNthCalledWith(1, nowRange);

    const datePickers = wrapper.find(DatePicker);
    const timePickers = wrapper.find(TimePicker);
    //set start date & time and press button
    // Create date in local timezone: year, month (0-indexed), day
    const startDate = new Date(2021, 11, 1); // December 1, 2021
    act(() => {
      datePickers.at(0).props().onChange!(fakeEvent, '2021-12-01', startDate);
      // set hours minutes and seconds
      timePickers.at(0).props().onChange!(fakeEvent, '10:15:30');
    });
    nowRange.from = new Date(2021, 11, 1, 10, 15, 30, 0).getTime() / 1000;

    await actOn(() => wrapper.find('.pf-v5-c-button.pf-m-primary').at(0).simulate('click'), wrapper);
    expect(props.setRange).toHaveBeenNthCalledWith(2, nowRange);

    //set end date & time and press button
    // Create date in local timezone: year, month (0-indexed), day
    const endDate = new Date(2021, 11, 15); // December 15, 2021
    act(() => {
      datePickers.at(1).props().onChange!(fakeEvent, '2021-12-15', endDate);
      // set only hours and minutes, seconds should be automatically set to 0
      timePickers.at(1).props().onChange!(fakeEvent, '23:00');
    });
    nowRange.to = new Date(2021, 11, 15, 23, 0, 0, 0).getTime() / 1000;

    await actOn(() => wrapper.find('.pf-v5-c-button.pf-m-primary').at(0).simulate('click'), wrapper);
    expect(props.setRange).toHaveBeenNthCalledWith(3, nowRange);
  });

  it('should allow same day with different times (NETOBSERV-2665)', async () => {
    const wrapper = mount(<TimeRangeModal {...props} />);
    const datePickers = wrapper.find(DatePicker);
    const timePickers = wrapper.find(TimePicker);

    // Set both dates to the same day but different times
    // From: 2026-03-12 10:00:00
    // To: 2026-03-12 10:30:00
    const testDate = new Date(2026, 2, 12); // March 12, 2026 in local timezone
    act(() => {
      datePickers.at(0).props().onChange!(fakeEvent, '2026-03-12', testDate);
      timePickers.at(0).props().onChange!(fakeEvent, '10:00:00');
      datePickers.at(1).props().onChange!(fakeEvent, '2026-03-12', testDate);
      timePickers.at(1).props().onChange!(fakeEvent, '10:30:00');
    });

    wrapper.update();

    // The save button should be enabled (no error)
    const saveButton = wrapper.find('[data-test="time-range-save"]').first();
    expect(saveButton.prop('isDisabled')).toBe(false);

    // Verify no validation error is shown
    const tooltip = wrapper.find('.time-range-tooltip-empty');
    expect(tooltip.length).toBeGreaterThan(0);
  });
});
