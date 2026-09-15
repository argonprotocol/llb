import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import { Interaction, TooltipModel } from 'chart.js';
import { getRelativePosition } from 'chart.js/helpers';

dayjs.extend(utc);

// Clip each calendar year to the displayed data, including partial endpoint years.
export function getYearIntervals(min: number, max: number) {
  const years: { label: string; start: number; end: number }[] = [];
  let year = dayjs.utc(min).startOf('year');
  while (year.valueOf() <= max) {
    const next = year.add(1, 'year');
    years.push({ label: year.format('YYYY'), start: Math.max(min, year.valueOf()), end: Math.min(max, next.valueOf()) });
    year = next;
  }
  return years;
}

(Interaction.modes as any).myCustomMode = function(chart: any, e: any) {
  const position = getRelativePosition(e, chart);

  const items: any[] = [];
  let nearest = Infinity;
  Interaction.evaluateInteractionItems(chart, 'x', position, (element, datasetIndex, index) => {
    const xDistanceFromPoint = Math.abs(position.x - element.x);
    const yDistanceFromPoint = Math.abs(position.y - element.y);
    if (yDistanceFromPoint < 44 && xDistanceFromPoint < 30 && xDistanceFromPoint < nearest) {
      nearest = xDistanceFromPoint;
      items.length = 0;
      items.push({element, datasetIndex, index});
    }
  });
  return items;
};

export function createChartOptions(chartPoints: any[], pointRadius: number[], onTooltipFn: any, dateRange: { first: string; last: string }) {
  return {
    type: 'line',
    data: {
      datasets: [
        {
          data: chartPoints,
          borderColor: '#EFAB37',
          borderWidth: 3,
          pointBorderColor: 'white',
          pointBorderWidth: 1,
          pointBackgroundColor: '#EFAB37',
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#EFAB37',
          pointRadius: pointRadius,
          lineTension: 1
        },
      ]
    },
    options: {
      plugins: {
        tooltip: {
          backgroundColor: 'white',
          borderColor: '#979797',
          bodyColor: '#4C4C4C',
          titleColor: 'black',
          displayColors: false,
          borderWidth: 1,
          caretSize: 10,
          enabled: false,
          external: (context: any) => onTooltipFn(context.tooltip as TooltipModel<any>),
        }
      },
      interaction: {
        mode: 'myCustomMode',
        intersect: false,
      },
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 25,
          right: 25,
          top: 0,
          bottom: 0,
        }
      },
      scales: {
        x: {
          display: false,
          type: 'time',
          time: {
            unit: 'day'
          },
          min: dayjs.utc(dateRange.first).valueOf(),
          max: dayjs.utc(dateRange.last).valueOf(),
        },
        y: {
          display: false,
          min: 0,
          max: 130_000,
        }
      },
      clip: false,
    },
  };
}
