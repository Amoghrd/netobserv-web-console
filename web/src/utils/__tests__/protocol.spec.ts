import { TFunction } from 'i18next';
import { FilterDefinitionSample } from '../../components/__tests-data__/filters';
import { compareProtocols, formatProtocol } from '../protocol';

describe('formatProtocol', () => {
  it('should format protocol', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockT = (v: string) => v as any;
    expect(formatProtocol(6, mockT as TFunction)).toEqual('TCP');
    expect(formatProtocol(17, mockT as TFunction)).toEqual('UDP');
    expect(formatProtocol(0, mockT as TFunction)).toEqual('HOPOPT');
  });
});

describe('compareProtocol', () => {
  // 6=TCP, 17=UDP, 121=SMP
  it('should sort protocols by name in natural order', () => {
    const sorted = [6, 17, undefined, 121].sort(compareProtocols);
    expect(sorted).toEqual([121, 6, 17, undefined]);
  });
});

describe('validateProtocol', () => {
  it('should accept empty double quotes for empty/undefined protocols', () => {
    const protocolFilter = FilterDefinitionSample.find(f => f.id == 'protocol')!;
    expect(protocolFilter.validate(`""`)).toEqual({ val: '""' });
  });
});
