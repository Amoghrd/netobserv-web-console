import { ValidatedOptions } from '@patternfly/react-core';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import * as React from 'react';

import { FilterDefinitionSample } from '../../../../components/__tests-data__/filters';
import { findFilter } from '../../../../utils/filter-definitions';
import TextFilter, { TextFilterProps } from '../text-filter';

describe('<TextFilter />', () => {
  const props: TextFilterProps = {
    filterDefinition: findFilter(FilterDefinitionSample, 'src_name')!,
    indicator: ValidatedOptions.default,
    currentValue: '',
    setCurrentValue: jest.fn(),
    addFilter: jest.fn(),
    setMessage: jest.fn(),
    setIndicator: jest.fn()
  };

  beforeEach(() => {
    props.setCurrentValue = jest.fn();
    props.addFilter = jest.fn();
    props.setIndicator = jest.fn();
  });

  it('should filter name', async () => {
    const { container, rerender } = render(
      <TextFilter {...props} filterDefinition={findFilter(FilterDefinitionSample, 'src_name')!} />
    );
    const input = container.querySelector('#search') as HTMLInputElement;
    expect(input).toBeTruthy();

    expect(props.addFilter).toHaveBeenCalledTimes(0);
    expect(props.setIndicator).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.change(input, { target: { value: 'abcd' } });
    });
    expect(props.setCurrentValue).toHaveBeenNthCalledWith(1, 'abcd');

    rerender(
      <TextFilter {...props} filterDefinition={findFilter(FilterDefinitionSample, 'src_name')!} currentValue="abcd" />
    );

    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    expect(props.addFilter).toHaveBeenNthCalledWith(1, { v: 'abcd' });
  });

  it('should filter valid IP', async () => {
    const { container, rerender } = render(
      <TextFilter {...props} filterDefinition={findFilter(FilterDefinitionSample, 'src_address')!} />
    );
    const input = container.querySelector('#search') as HTMLInputElement;
    expect(input).toBeTruthy();

    expect(props.addFilter).toHaveBeenCalledTimes(0);
    expect(props.setIndicator).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.change(input, { target: { value: '10.0.0.1' } });
    });
    expect(props.setCurrentValue).toHaveBeenNthCalledWith(1, '10.0.0.1');

    rerender(
      <TextFilter
        {...props}
        filterDefinition={findFilter(FilterDefinitionSample, 'src_address')!}
        currentValue="10.0.0.1"
      />
    );

    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    await waitFor(() => {
      expect(props.addFilter).toHaveBeenNthCalledWith(1, { v: '10.0.0.1' });
    });
  });

  it('should not filter invalid IP', async () => {
    const { container, rerender } = render(
      <TextFilter {...props} filterDefinition={findFilter(FilterDefinitionSample, 'dst_host_address')!} />
    );
    const input = container.querySelector('#search') as HTMLInputElement;
    expect(input).toBeTruthy();

    expect(props.addFilter).toHaveBeenCalledTimes(0);
    expect(props.setIndicator).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.change(input, { target: { value: '10.0.' } });
    });
    expect(props.setCurrentValue).toHaveBeenNthCalledWith(1, '10.0.');

    rerender(
      <TextFilter
        {...props}
        filterDefinition={findFilter(FilterDefinitionSample, 'dst_host_address')!}
        currentValue="10.0."
      />
    );

    expect(props.setIndicator).toHaveBeenNthCalledWith(2, ValidatedOptions.warning);
    expect(props.addFilter).toHaveBeenCalledTimes(0);

    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    await waitFor(() => {
      expect(props.setIndicator).toHaveBeenNthCalledWith(2, ValidatedOptions.warning);
      expect(props.addFilter).toHaveBeenCalledTimes(0);
    });
  });
});
