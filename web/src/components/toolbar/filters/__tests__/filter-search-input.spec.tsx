import { act, fireEvent, render, waitFor } from '@testing-library/react';
import * as React from 'react';

import { defaultConfig } from '../../../../model/config';
import { createFilterValue, FilterCompare } from '../../../../model/filters';
import { FilterDefinitionSample } from '../../../__tests-data__/filters';
import FilterSearchInput, { FilterSearchInputProps } from '../filter-search-input';

jest.mock('../../../../model/filters', () => ({
  ...jest.requireActual('../../../../model/filters'),
  createFilterValue: jest.fn((def, value) => {
    const actualModule = jest.requireActual('../../../../model/filters');
    return actualModule.createFilterValue(def, value);
  })
}));

describe('<FilterSearchInput />', () => {
  const props: FilterSearchInputProps = {
    config: defaultConfig,
    filters: { match: 'all', list: [] },
    filterDefinitions: FilterDefinitionSample,
    searchInputValue: '',
    indicator: undefined,
    direction: undefined,
    filter: FilterDefinitionSample[0],
    compare: FilterCompare.match,
    value: '',
    setValue: jest.fn(),
    setCompare: jest.fn(),
    setFilter: jest.fn(),
    setDirection: jest.fn(),
    setIndicator: jest.fn(),
    setSearchInputValue: jest.fn(),
    setFilters: jest.fn(),
    setMessage: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should parse search input', async () => {
    const { container, rerender } = render(<FilterSearchInput {...props} />);
    const input = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(input).toBeTruthy();

    await act(async () => {
      fireEvent.change(input, { target: { value: 'src_name=loki' } });
    });
    expect(props.setSearchInputValue).toHaveBeenCalledWith('src_name=loki');

    const srcNameFilter = FilterDefinitionSample.find(f => f.id === 'src_name')!;
    rerender(
      <FilterSearchInput
        {...props}
        searchInputValue="src_name=loki"
        direction="source"
        filter={srcNameFilter}
        compare={'=' as FilterCompare}
        value="loki"
      />
    );

    await act(async () => {
      fireEvent.click(container.querySelector('[aria-label="Open advanced search"]')!);
    });
    await waitFor(() => {
      expect(document.querySelector('#filter-popper')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.click(document.querySelector('#add-form-filter')!);
    });
    expect(props.setFilters).toHaveBeenCalledWith({
      list: [{ compare: '=', def: srcNameFilter, values: [{ v: 'loki' }] }],
      match: 'all'
    });
  });

  it('should use createFilterValue when adding filter', async () => {
    const protocolFilter = FilterDefinitionSample.find(f => f.id === 'protocol')!;
    const { container } = render(
      <FilterSearchInput {...props} filter={protocolFilter} value="6" compare={FilterCompare.equal} />
    );

    await act(async () => {
      fireEvent.click(container.querySelector('[aria-label="Open advanced search"]')!);
    });
    await waitFor(() => expect(document.querySelector('#add-form-filter')).toBeTruthy());

    await act(async () => {
      fireEvent.click(document.querySelector('#add-form-filter')!);
    });

    expect(createFilterValue).toHaveBeenCalledWith(protocolFilter, '6');
  });

  it('should add filter with display text for protocol', async () => {
    const protocolFilter = FilterDefinitionSample.find(f => f.id === 'protocol')!;
    const { container } = render(
      <FilterSearchInput {...props} filter={protocolFilter} value="6" compare={FilterCompare.equal} />
    );

    await act(async () => {
      fireEvent.click(container.querySelector('[aria-label="Open advanced search"]')!);
    });
    await waitFor(() => expect(document.querySelector('#add-form-filter')).toBeTruthy());

    await act(async () => {
      fireEvent.click(document.querySelector('#add-form-filter')!);
    });

    expect(props.setFilters).toHaveBeenCalledWith({
      list: [{ compare: '=', def: protocolFilter, values: [{ v: '6', display: 'TCP' }] }],
      match: 'all'
    });
  });

  it('should add filter without display text for text fields', async () => {
    const nameFilter = FilterDefinitionSample.find(f => f.id === 'src_name')!;
    const { container } = render(
      <FilterSearchInput {...props} filter={nameFilter} value="my-pod" compare={FilterCompare.equal} />
    );

    await act(async () => {
      fireEvent.click(container.querySelector('[aria-label="Open advanced search"]')!);
    });
    await waitFor(() => expect(document.querySelector('#add-form-filter')).toBeTruthy());

    await act(async () => {
      fireEvent.click(document.querySelector('#add-form-filter')!);
    });

    expect(props.setFilters).toHaveBeenCalledWith({
      list: [{ compare: '=', def: nameFilter, values: [{ v: 'my-pod' }] }],
      match: 'all'
    });
  });

  it('should handle empty value with n/a display', async () => {
    const nameFilter = FilterDefinitionSample.find(f => f.id === 'src_name')!;
    const { container } = render(
      <FilterSearchInput {...props} filter={nameFilter} value="" compare={FilterCompare.equal} />
    );

    await act(async () => {
      fireEvent.click(container.querySelector('[aria-label="Open advanced search"]')!);
    });
    await waitFor(() => expect(document.querySelector('#add-form-filter')).toBeTruthy());

    await act(async () => {
      fireEvent.click(document.querySelector('#add-form-filter')!);
    });

    expect(props.setFilters).toHaveBeenCalledWith({
      list: [{ compare: '=', def: nameFilter, values: [{ v: '""', display: 'n/a' }] }],
      match: 'all'
    });
  });
});
