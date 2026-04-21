import { Bullseye, PageSection, Spinner } from '@patternfly/react-core';
import * as React from 'react';
import { useFillViewportBelow } from '../utils/use-fill-viewport-below';
import NetflowTrafficParent from './netflow-traffic-parent';

interface NetflowTrafficDevTabProps {
  customData?: unknown;
  history?: unknown;
  location?: unknown;
  match?: {
    isExact?: boolean;
    params?: {
      ns?: string;
    };
    path?: string;
    url?: string;
  };
  obj?: unknown;
  params?: {
    ns?: string;
  };
  staticContext?: unknown;
}

export const NetflowTrafficDevTab: React.FC<NetflowTrafficDevTabProps> = props => {
  const namespace = props.params?.ns || props.match?.params?.ns;
  const tabFillRef = useFillViewportBelow(!!namespace);
  if (!namespace) {
    return (
      <PageSection hasBodyWrapper={false} id="pageSection">
        <Bullseye data-test="loading-tab">
          <Spinner size="xl" />
        </Bullseye>
      </PageSection>
    );
  }
  return (
    <div ref={tabFillRef} className="netobserv-tab-container">
      <NetflowTrafficParent
        forcedFilters={null}
        isTab={true}
        hideTitle={true}
        parentConfig={undefined}
        forcedNamespace={namespace}
      />
    </div>
  );
};

export default NetflowTrafficDevTab;
