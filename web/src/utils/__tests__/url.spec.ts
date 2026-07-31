import {
  flowCollectorNewPath,
  flowCollectorSetupPath,
  flowCollectorStatusPath,
  getFlowCollectorResourceName,
  isFlowCollectorCreatePath
} from '../url';

describe('isFlowCollectorCreatePath', () => {
  it('should recognize ~new and setup as create routes', () => {
    expect(isFlowCollectorCreatePath(flowCollectorNewPath)).toBe(true);
    expect(isFlowCollectorCreatePath(flowCollectorSetupPath)).toBe(true);
  });

  it('should not treat status or edit paths as create routes', () => {
    expect(isFlowCollectorCreatePath(flowCollectorStatusPath)).toBe(false);
    expect(isFlowCollectorCreatePath('/k8s/cluster/flows.netobserv.io~v1beta2~FlowCollector/edit')).toBe(false);
  });
});

describe('getFlowCollectorResourceName', () => {
  it('should return undefined on create routes', () => {
    expect(getFlowCollectorResourceName(flowCollectorNewPath)).toBeUndefined();
    expect(getFlowCollectorResourceName(flowCollectorSetupPath)).toBeUndefined();
  });

  it('should resolve edit and cluster segments to cluster', () => {
    expect(getFlowCollectorResourceName('/k8s/cluster/flows.netobserv.io~v1beta2~FlowCollector/edit')).toBe('cluster');
    expect(getFlowCollectorResourceName('/k8s/cluster/flows.netobserv.io~v1beta2~FlowCollector/cluster')).toBe(
      'cluster'
    );
  });
});
