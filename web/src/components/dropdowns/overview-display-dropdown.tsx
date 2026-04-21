import { Button, Popper } from '@patternfly/react-core';
import { CogIcon } from '@patternfly/react-icons';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { FlowScope } from '../../model/flow-query';
import { ScopeConfigDef } from '../../model/scope';
import { useOutsideClickEvent } from '../../utils/outside-hook';
import './overview-display-dropdown.css';
import { OverviewDisplayOptions } from './overview-display-options';
import { TruncateLength } from './truncate-dropdown';

export type Size = 's' | 'm' | 'l';

export interface OverviewDisplayDropdownProps {
  metricScope: FlowScope;
  setMetricScope: (s: FlowScope) => void;
  truncateLength: TruncateLength;
  setTruncateLength: (v: TruncateLength) => void;
  focus: boolean;
  setFocus: (v: boolean) => void;
  scopes: ScopeConfigDef[];
}

export const OverviewDisplayDropdown: React.FC<OverviewDisplayDropdownProps> = ({
  metricScope,
  setMetricScope,
  truncateLength,
  setTruncateLength,
  focus,
  setFocus,
  scopes
}) => {
  const { t } = useTranslation('plugin__netobserv-plugin');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const popperRef = React.useRef<HTMLDivElement>(null);
  const [isOpen, setOpen] = React.useState<boolean>(false);

  const ref = useOutsideClickEvent(() => setOpen(false));

  const trigger = React.useCallback(() => {
    return (
      <Button
        ref={triggerRef}
        variant="link"
        icon={<CogIcon />}
        onClick={() => setOpen(!isOpen)}
        data-test="display-dropdown-button"
      >
        {t('Display options')}
      </Button>
    );
  }, [isOpen, t]);

  const popper = React.useCallback(() => {
    return (
      <div id="overview-display-popper" ref={popperRef} className="pf-v6-c-menu" role="dialog">
        <OverviewDisplayOptions
          metricScope={metricScope}
          setMetricScope={setMetricScope}
          truncateLength={truncateLength}
          setTruncateLength={setTruncateLength}
          focus={focus}
          setFocus={setFocus}
          scopes={scopes}
        />
      </div>
    );
  }, [metricScope, setMetricScope, truncateLength, setTruncateLength, focus, setFocus, scopes]);

  return (
    <div id="display-dropdown-container" data-test="display-dropdown-container" ref={ref}>
      <div ref={containerRef}>
        <Popper
          trigger={trigger()}
          triggerRef={triggerRef}
          popper={popper()}
          popperRef={popperRef}
          isVisible={isOpen}
          enableFlip={true}
          appendTo={containerRef.current || undefined}
        />
      </div>
    </div>
  );
};

export default OverviewDisplayDropdown;
