import React from 'react';
import { Filter } from '../../model/filters';
import { RecordType } from '../../model/flow-query';
import { useNetflowContext } from '../../model/netflow-context';
import { Column, ColumnSizeMap } from '../../utils/columns';
import { TimeRange } from '../../utils/datetime';
import { OverviewPanel } from '../../utils/overview-panels';
import ColumnsModal from './columns-modal';
import ExportModal from './export-modal';
import OverviewPanelsModal from './overview-panels-modal';
import TimeRangeModal from './time-range-modal';

export interface ModalsProps {
  isTRModalOpen: boolean;
  setTRModalOpen: (v: boolean) => void;
  range: number | TimeRange;
  setRange: (v: number | TimeRange) => void;
  isOverviewModalOpen: boolean;
  setOverviewModalOpen: (v: boolean) => void;
  recordType: RecordType;
  setPanels: (v: OverviewPanel[]) => void;
  isColModalOpen: boolean;
  setColModalOpen: (v: boolean) => void;
  setColumns: (v: Column[]) => void;
  setColumnSizes: (v: ColumnSizeMap) => void;
  isExportModalOpen: boolean;
  setExportModalOpen: (v: boolean) => void;
  filters: Filter[];
}

export const Modals: React.FC<ModalsProps> = props => {
  const { caps, config } = useNetflowContext();

  return (
    <>
      <TimeRangeModal
        id="time-range-modal"
        isModalOpen={props.isTRModalOpen}
        setModalOpen={props.setTRModalOpen}
        range={typeof props.range === 'object' ? props.range : undefined}
        setRange={props.setRange}
        maxChunkAge={config.maxChunkAgeMs}
      />
      <OverviewPanelsModal
        id="overview-panels-modal"
        isModalOpen={props.isOverviewModalOpen}
        setModalOpen={props.setOverviewModalOpen}
        recordType={props.recordType}
        panels={caps.availablePanels}
        setPanels={props.setPanels}
        customIds={config.panels}
        features={config.features}
      />
      <ColumnsModal
        id="columns-modal"
        isModalOpen={props.isColModalOpen}
        setModalOpen={props.setColModalOpen}
        config={config}
        columns={caps.availableColumns}
        setColumns={props.setColumns}
        setColumnSizes={props.setColumnSizes}
      />
      <ExportModal
        id="export-modal"
        isModalOpen={props.isExportModalOpen}
        setModalOpen={props.setExportModalOpen}
        flowQuery={caps.flowQuery}
        columns={caps.availableColumns.filter(c => c.field && !c.field.name.startsWith('Time'))}
        range={props.range}
        filters={props.filters}
      />
    </>
  );
};

export default Modals;
