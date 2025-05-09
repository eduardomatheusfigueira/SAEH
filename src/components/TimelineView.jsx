import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import Chart from 'chart.js/auto'; // Import Chart.js
import 'chartjs-adapter-date-fns'; // Import the date adapter
import zoomPlugin from 'chartjs-plugin-zoom'; // Import the zoom plugin

Chart.register(zoomPlugin); // Register the zoom plugin

const TimelineView = forwardRef(({ events, themes, referenceDate, onEventClick }, ref) => {
  const chartRef = useRef(null); // For the canvas element
  const chartInstanceRef = useRef(null); // To store the chart instance

  // Expose control methods via ref
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      chartInstanceRef.current?.zoom(1.1); // Zoom in by 10%
    },
    zoomOut: () => {
      chartInstanceRef.current?.zoom(0.9); // Zoom out by 10%
    },
    panLeft: () => {
      chartInstanceRef.current?.pan({ x: 100 }, undefined, 'default'); // Pan 100px left
    },
    panRight: () => {
      chartInstanceRef.current?.pan({ x: -100 }, undefined, 'default'); // Pan 100px right
    },
    resetZoom: () => {
      chartInstanceRef.current?.resetZoom('none');
      // After resetting zoom, we might want to set the scale to fit all current data
      if (chartInstanceRef.current && events.length > 0) {
        const minDate = new Date(Math.min(...events.map(e => new Date(e.start_date).getTime())));
        const maxDate = new Date(Math.max(...events.map(e => new Date(e.end_date || e.start_date).getTime())));
        chartInstanceRef.current.options.scales.x.min = minDate.getFullYear() -1;
        chartInstanceRef.current.options.scales.x.max = maxDate.getFullYear() +1;
        chartInstanceRef.current.update('none');
      }
    },
    jumpToPeriod: (startDate, endDate) => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.options.scales.x.min = startDate.getTime();
        chartInstanceRef.current.options.scales.x.max = endDate.getTime();
        chartInstanceRef.current.update('none');
      }
    }
  }));

  useEffect(() => {
    if (!chartRef.current || !events || !themes) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
      return;
    }

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    // Create a sorted list of unique theme names for the Y-axis categories (lanes)
    const sortedThemeNames = [...new Set(themes.map(t => t.name))].sort();
    
    // Prepare datasets, one for each theme to act as a lane
    const datasets = themes.map(theme => {
      const themeEvents = events.filter(event => event.main_theme_id === theme.id);
      return {
        label: theme.name,
        data: themeEvents.map(event => {
          const startDate = new Date(event.start_date).getTime();
          let endDate;
          if (event.date_type === "period" && event.end_date) {
            endDate = new Date(event.end_date).getTime();
          } else {
            // For single events, create a very short duration bar (e.g., 1 day, or a visual minimum)
            // For simplicity, let's make it a small fixed duration on the timeline for visibility
            // This might need adjustment based on zoom level for better visuals.
            // A common approach is to make it a fixed pixel width, but Chart.js bars are data-driven.
            // Let's represent it as a bar from start_date to start_date + small_interval.
            // For a time scale, a small interval like an hour or a day.
            const approxOneDay = 24 * 60 * 60 * 1000; // Milliseconds in a day
            endDate = startDate + approxOneDay / 24; // Approx 1 hour bar for single events
          }
          return {
            x: [startDate, endDate], // Data for horizontal bar: [start, end]
            y: theme.name,          // Y-value is the theme name (lane)
            rawEvent: event,
            title: event.title,
          };
        }),
        backgroundColor: theme.color || '#808080',
        borderColor: theme.color || '#808080',
        borderWidth: 1,
        barPercentage: 0.5, // Adjust for thickness of bars within a category
        categoryPercentage: 0.8, // Adjust for spacing between categories (lanes)
      };
    }).filter(dataset => dataset.data.length > 0); // Only include datasets with events

    const config = {
      type: 'bar',
      data: {
        // labels: sortedThemeNames, // Y-axis labels (lanes)
        datasets: datasets,
      },
      options: {
        indexAxis: 'y', // Makes the bar chart horizontal
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'year',
              tooltipFormat: 'DD MMM YYYY',
            },
            title: {
              display: true,
              text: 'Date',
            },
            min: events.length > 0 ? new Date(Math.min(...events.map(e => new Date(e.start_date).getTime()))).getFullYear() -1 : new Date().getFullYear() -10,
            max: events.length > 0 ? new Date(Math.max(...events.map(e => new Date(e.end_date || e.start_date).getTime()))).getFullYear() +1 : new Date().getFullYear() +10,
          },
          y: {
            type: 'category',
            labels: sortedThemeNames, // Use sorted theme names for Y-axis labels
            title: {
              display: true,
              text: 'Themes',
            },
            offset: true, // Adds padding to the start/end of the axis
          },
        },
        plugins: {
          zoom: { // Configuration for chartjs-plugin-zoom
            pan: {
              enabled: true,
              mode: 'x', // Allow panning only on the x-axis (time)
              threshold: 5, // Pixels to drag before panning starts
            },
            zoom: {
              wheel: {
                enabled: true, // Enable zooming with mouse wheel
              },
              pinch: {
                enabled: true, // Enable zooming with pinch gesture
              },
              mode: 'x', // Allow zooming only on the x-axis
            }
          },
          tooltip: {
            callbacks: {
              title: function(tooltipItems) {
                // Display event title in tooltip title
                const firstItem = tooltipItems[0];
                if (firstItem && firstItem.raw && firstItem.raw.rawEvent) {
                  return firstItem.raw.rawEvent.title;
                }
                return '';
              },
              label: function(context) {
                // Display date range or single date
                const raw = context.raw;
                if (raw && raw.x) {
                  const startDate = new Date(raw.x[0]).toLocaleDateString();
                  if (raw.rawEvent.date_type === "period" && raw.rawEvent.end_date) {
                    const endDate = new Date(raw.x[1]).toLocaleDateString();
                    return `Period: ${startDate} - ${endDate}`;
                  }
                  return `Date: ${startDate}`;
                }
                return context.dataset.label || '';
              },
              afterLabel: function(context) {
                if (context.raw && context.raw.rawEvent && context.raw.rawEvent.description_short) {
                  return context.raw.rawEvent.description_short;
                }
                return '';
              }
            }
          },
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const firstElement = elements[0];
              const rawEventData = datasets[firstElement.datasetIndex].data[firstElement.index]?.rawEvent;
              if (rawEventData && onEventClick) {
                onEventClick(rawEventData.globalId);
              }
            }
          },
          annotation: {
            annotations: {
              referenceLine: {
                type: 'line',
                scaleID: 'x', // Apply to x-axis
                value: new Date(referenceDate).getTime(),
                borderColor: 'rgba(255, 99, 132, 0.8)',
                borderWidth: 2,
                borderDash: [6, 6],
                label: {
                  content: 'Ref: ' + new Date(referenceDate).toLocaleDateString(),
                  display: true,
                  position: 'start',
                  backgroundColor: 'rgba(255, 99, 132, 0.8)',
                  color: 'white',
                  font: {
                    weight: 'bold',
                  },
                },
              },
            },
          },
        },
      },
    };

    chartInstanceRef.current = new Chart(ctx, config);
    console.log("TimelineView: Horizontal Bar Chart initialized/updated. Datasets:", datasets.length);

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [events, themes, referenceDate, onEventClick]); // Added onEventClick to dependency array for completeness

  return <canvas ref={chartRef} style={{ width: '100%', height: '100%' }}></canvas>;
}); // Add the closing parenthesis for forwardRef

export default TimelineView;