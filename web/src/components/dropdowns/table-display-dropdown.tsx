import { Button, Popper } from '@patternfly/react-core';
import { CogIcon } from '@patternfly/react-icons';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useOutsideClickEvent } from '../../utils/outside-hook';
import './table-display-dropdown.css';
import { TableDisplayOptions } from './table-display-options';

export type Size = 's' | 'm' | 'l';

export interface TableDisplayDropdownProps {
  size: Size;
  setSize: (v: Size) => void;
  showDuplicates: boolean;
  setShowDuplicates: (showDuplicates: boolean) => void;
}

export const TableDisplayDropdown: React.FC<TableDisplayDropdownProps> = ({
  size,
  setSize,
  showDuplicates,
  setShowDuplicates
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
      <div id="table-display-popper" ref={popperRef} className="pf-v6-c-menu" role="dialog">
        <TableDisplayOptions
          size={size}
          setSize={setSize}
          showDuplicates={showDuplicates}
          setShowDuplicates={setShowDuplicates}
        />
      </div>
    );
  }, [size, setSize, showDuplicates, setShowDuplicates]);

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

export default TableDisplayDropdown;
