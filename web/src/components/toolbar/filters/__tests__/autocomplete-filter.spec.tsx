import { ValidatedOptions } from '@patternfly/react-core';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import * as React from 'react';

import { FilterDefinitionSample } from '../../../../components/__tests-data__/filters';
import { findFilter } from '../../../../utils/filter-definitions';
import AutocompleteFilter, { AutocompleteFilterProps } from '../autocomplete-filter';

describe('<AutocompleteFilter />', () => {
  const props: AutocompleteFilterProps = {
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

  it('should filter valid port by name', async () => {
    const { container, rerender } = render(
      <AutocompleteFilter {...props} filterDefinition={findFilter(FilterDefinitionSample, 'src_port')!} />
    );
    const input = container.querySelector('#autocomplete-search') as HTMLInputElement;
    expect(input).toBeTruthy();

    expect(props.addFilter).toHaveBeenCalledTimes(0);
    expect(props.setIndicator).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.change(input, { target: { value: 'ftp' } });
    });
    expect(props.setCurrentValue).toHaveBeenNthCalledWith(1, 'ftp');

    rerender(
      <AutocompleteFilter
        {...props}
        filterDefinition={findFilter(FilterDefinitionSample, 'src_port')!}
        currentValue="ftp"
      />
    );
    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });

    await waitFor(() => {
      expect(props.addFilter).toHaveBeenNthCalledWith(1, { v: '21', display: 'ftp' });
    });
  });

  it('should reject invalid port by name', async () => {
    const { container, rerender } = render(
      <AutocompleteFilter {...props} filterDefinition={findFilter(FilterDefinitionSample, 'dst_port')!} />
    );
    const input = container.querySelector('#autocomplete-search') as HTMLInputElement;
    expect(input).toBeTruthy();

    expect(props.addFilter).toHaveBeenCalledTimes(0);
    expect(props.setIndicator).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.change(input, { target: { value: 'no match' } });
    });
    expect(props.setCurrentValue).toHaveBeenNthCalledWith(1, 'no match');

    rerender(
      <AutocompleteFilter
        {...props}
        filterDefinition={findFilter(FilterDefinitionSample, 'dst_port')!}
        currentValue="no match"
      />
    );
    expect(props.setIndicator).toHaveBeenNthCalledWith(2, ValidatedOptions.warning);

    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });

    await waitFor(() => {
      expect(props.setIndicator).toHaveBeenNthCalledWith(3, ValidatedOptions.error);
      expect(props.addFilter).toHaveBeenCalledTimes(0);
    });
  });
});
