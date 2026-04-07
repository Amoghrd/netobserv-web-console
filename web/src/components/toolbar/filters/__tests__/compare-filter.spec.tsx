import { act, fireEvent, render, waitFor } from '@testing-library/react';
import * as React from 'react';

import { FilterCompare } from '../../../../model/filters';
import CompareFilter, { CompareFilterProps } from '../compare-filter';

describe('<CompareFilter />', () => {
  const props: CompareFilterProps = {
    value: FilterCompare.equal,
    setValue: jest.fn(),
    component: 'text'
  };

  it('should render component', async () => {
    const { container } = render(<CompareFilter {...props} />);
    expect(container.querySelector('#filter-compare-toggle-button')).toBeTruthy();
  });

  it('should update value', async () => {
    const { container } = render(<CompareFilter {...props} />);

    expect(props.setValue).toHaveBeenCalledTimes(0);

    await act(async () => {
      fireEvent.click(container.querySelector('#filter-compare-toggle-button')!);
    });
    await waitFor(() => expect(document.querySelector('[id="not-equal"]')).toBeTruthy());
    await act(async () => {
      fireEvent.click(document.querySelector('[id="not-equal"]')!);
    });
    expect(props.setValue).toHaveBeenCalledWith(FilterCompare.notEqual);

    await act(async () => {
      fireEvent.click(container.querySelector('#filter-compare-toggle-button')!);
    });
    await waitFor(() => expect(document.querySelector('[id="equal"]')).toBeTruthy());
    await act(async () => {
      fireEvent.click(document.querySelector('[id="equal"]')!);
    });
    expect(props.setValue).toHaveBeenCalledWith(FilterCompare.equal);

    await act(async () => {
      fireEvent.click(container.querySelector('#filter-compare-toggle-button')!);
    });
    await waitFor(() => expect(document.querySelector('[id="equal"]')).toBeTruthy());
    expect(document.querySelector('[id="more-than"]')).toBeNull();

    expect(props.setValue).toHaveBeenCalledTimes(2);
  });

  it('number should have more than', async () => {
    const { container } = render(<CompareFilter {...props} component={'number'} />);

    await act(async () => {
      fireEvent.click(container.querySelector('#filter-compare-toggle-button')!);
    });
    await waitFor(() => expect(document.querySelector('[id="more-than"]')).toBeTruthy());
    await act(async () => {
      fireEvent.click(document.querySelector('[id="more-than"]')!);
    });

    expect(props.setValue).toHaveBeenCalledWith(FilterCompare.moreThanOrEqual);
  });
});
