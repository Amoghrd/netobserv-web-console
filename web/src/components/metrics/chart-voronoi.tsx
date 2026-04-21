import { ChartLegendTooltip, createContainer } from '@patternfly/react-charts/victory';
import React from 'react';
import { ChartDataPoint, LegendDataItem } from '../../utils/metrics-helper';

const CursorVoronoiContainer = createContainer('voronoi', 'cursor');

const CHAR_AVG_WIDTH = 7.5;
const FLYOUT_PADDING = 40;
const TITLE_ESTIMATED_LEN = 28;
const VALUE_ESTIMATED_LEN = 12;

export const chartVoronoi = (legendData: LegendDataItem[], f: (v: number) => string) => {
  const tooltipData = legendData.map(item => ({ ...item, name: item.tooltipName || item.name }));
  const maxNameLen = Math.max(0, ...tooltipData.map(d => (d.name || '').length));
  const legendWidth = (maxNameLen + VALUE_ESTIMATED_LEN + 2) * CHAR_AVG_WIDTH;
  const titleWidth = TITLE_ESTIMATED_LEN * CHAR_AVG_WIDTH;
  const flyoutWidth = Math.max(titleWidth, legendWidth) + FLYOUT_PADDING;

  return (
    <CursorVoronoiContainer
      cursorDimension="x"
      labels={(dp: { datum: ChartDataPoint }) => {
        return dp.datum.y || dp.datum.y === 0 ? f(dp.datum.y) : 'n/a';
      }}
      labelComponent={
        <ChartLegendTooltip
          legendData={tooltipData}
          title={((datum: { date?: string }) => datum.date ?? '') as unknown as string}
          flyoutWidth={flyoutWidth}
        />
      }
      mouseFollowTooltips
      voronoiDimension="x"
      voronoiPadding={50}
    />
  );
};
