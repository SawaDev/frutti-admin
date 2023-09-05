import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import * as echarts from 'echarts';

const EChartsDynamic = ({ title, xAxisData, yAxisData, legendData, seriesData }) => {
  useEffect(() => {
    const chart = echarts.init(document.getElementById('echarts-container'));

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      title: {
        text: title,
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
      },
      yAxis: {
        type: 'value',
      },
      legend: {
        data: legendData,
      },
      toolbox: {
        show: true,
        orient: 'vertical',
        left: 'right',
        top: 'center',
        feature: {
          mark: { show: true },
          dataZoom: { yAxisIndex: "none" },
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ['line', 'bar', 'stack'] },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      series: seriesData.map((series, index) => ({
        name: legendData[index],
        type: 'bar',
        // label: {
        //   show: true,
        //   position: 'insideBottom',
        //   distance: 10,
        //   align: 'left',
        //   verticalAlign: 'middle',
        //   rotate: 90,
        //   formatter: '{c}  {name|{a}}',
        //   fontSize: 16,
        //   rich: {
        //     name: {}
        //   }
        // },
        emphasis: {
          focus: 'series'
        },
        data: series,
      })),
    };

    chart.setOption(option);

    return () => {
      chart.dispose();
    };
  }, [title, xAxisData, yAxisData, legendData, seriesData]);

  return <div id="echarts-container" style={{ width: '100%', height: '400px' }}></div>;
};

EChartsDynamic.propTypes = {
  title: PropTypes.string.isRequired,
  xAxisData: PropTypes.array.isRequired,
  yAxisData: PropTypes.array.isRequired,
  legendData: PropTypes.array.isRequired,
  seriesData: PropTypes.arrayOf(PropTypes.array).isRequired,
};

export default EChartsDynamic;