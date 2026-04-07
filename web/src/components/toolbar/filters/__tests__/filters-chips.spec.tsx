import { render } from '@testing-library/react';
import * as React from 'react';

import { FilterDefinitionSample, FiltersSample } from '../../../__tests-data__/filters';
import { FiltersChips, FiltersChipsProps } from '../filters-chips';

describe('<FiltersChips />', () => {
  const props: FiltersChipsProps = {
    filters: { match: 'all', list: [] },
    setDirection: jest.fn(),
    setFilters: jest.fn(),
    editValue: jest.fn(),
    clearFilters: jest.fn(),
    resetFilters: jest.fn(),
    quickFilters: [],
    filterDefinitions: FilterDefinitionSample,
    isForced: false
  };

  it('should render chips', async () => {
    const { container, rerender } = render(<FiltersChips {...props} />);
    expect(container.querySelectorAll('.custom-chip-group')).toHaveLength(0);

    rerender(<FiltersChips {...props} filters={{ match: 'all', list: FiltersSample }} />);
    expect(container.querySelectorAll('.custom-chip-group')).toHaveLength(FiltersSample.length);

    rerender(<FiltersChips {...props} filters={{ match: 'all', list: [FiltersSample[0]] }} />);
    expect(container.querySelectorAll('.custom-chip-group')).toHaveLength(1);
  });
});
