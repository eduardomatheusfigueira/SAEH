import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import * as d3 from 'd3';

const TimelineView = forwardRef(({ events, themes, referenceDate, onEventClick }, ref) => {
  const svgRef = useRef(null);
  const xAxisRef = useRef(null);
  const xScaleRef = useRef(null);
  const mainGroupRef = useRef(null);
  const initialDomainRef = useRef(null);

  const redrawElements = (currentXScale, currentRefDateStr) => {
    if (!xAxisRef.current || !mainGroupRef.current || !currentXScale) return;

    d3.select(xAxisRef.current).call(d3.axisBottom(currentXScale));

    d3.select(mainGroupRef.current).selectAll(".event-lane-group").each(function() {
        const laneGroup = d3.select(this);
        // Update rects (periods)
        laneGroup.selectAll(".event-rect")
            .attr("x", d => currentXScale(new Date(d.start_date)))
            .attr("width", d => {
                const startDate = new Date(d.start_date);
                const endDate = (d.date_type === "period" && d.end_date) ? new Date(d.end_date) : new Date(startDate.getTime() + (24 * 60 * 60 * 1000)); // 1 day for periods if end_date missing, or for single events if they were rects
                const xStart = currentXScale(startDate);
                const xEnd = currentXScale(endDate);
                return Math.max(1, xEnd - xStart);
            });
        // Update circles (single events)
        laneGroup.selectAll(".event-circle")
            .attr("cx", d => currentXScale(new Date(d.start_date)));
    });
    
    const refDateObject = new Date(currentRefDateStr);
    d3.select(mainGroupRef.current).selectAll(".reference-line")
        .attr("x1", currentXScale(refDateObject))
        .attr("x2", currentXScale(refDateObject));
    d3.select(mainGroupRef.current).selectAll(".reference-line-label")
        .attr("x", currentXScale(refDateObject) + 4)
        .text(`Ref: ${refDateObject.toLocaleDateString()}`);
  };

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      const svgNode = svgRef.current;
      if (svgNode && svgNode.__zoom) svgNode.__zoom.scaleBy(d3.select(svgNode).transition().duration(250), 1.2);
    },
    zoomOut: () => {
      const svgNode = svgRef.current;
      if (svgNode && svgNode.__zoom) svgNode.__zoom.scaleBy(d3.select(svgNode).transition().duration(250), 0.8);
    },
    panLeft: () => {
      const svgNode = svgRef.current;
      if (svgNode && svgNode.__zoom) svgNode.__zoom.translateBy(d3.select(svgNode).transition().duration(250), 50, 0);
    },
    panRight: () => {
      const svgNode = svgRef.current;
      if (svgNode && svgNode.__zoom) svgNode.__zoom.translateBy(d3.select(svgNode).transition().duration(250), -50, 0);
    },
    resetZoom: () => {
      if (!xScaleRef.current || !svgRef.current || !initialDomainRef.current) return;
      const svgNode = svgRef.current;
      if (svgNode && svgNode.__zoom) {
        xScaleRef.current.domain(initialDomainRef.current);
        // svgNode.__zoom.transform(d3.select(svgNode).transition().duration(750), d3.zoomIdentity); // This might be better
        d3.select(svgNode).transition().duration(750).call(svgNode.__zoom.transform, d3.zoomIdentity);

        // After resetting zoom transform, ensure the scale and elements are redrawn to the initial domain
        // The zoom event itself should trigger redrawElements, but if not, call manually.
        // It might be better to let the zoom event handle the redraw after transform.
        // For now, let's ensure it by calling after setting domain.
         redrawElements(xScaleRef.current, referenceDate);
      }
    },
    jumpToPeriod: (startDate, endDate) => {
      if (!xScaleRef.current || !svgRef.current) return;
      const currentDomain = xScaleRef.current.domain();
      const viewDuration = currentDomain[1].getTime() - currentDomain[0].getTime();
      const newMiddle = new Date((startDate.getTime() + endDate.getTime()) / 2);
      const newDomainStart = new Date(newMiddle.getTime() - viewDuration / 2);
      const newDomainEnd = new Date(newMiddle.getTime() + viewDuration / 2);
      xScaleRef.current.domain([newDomainStart, newDomainEnd]);
      redrawElements(xScaleRef.current, referenceDate);
      // TODO: Update D3 zoom transform to match this new domain
    },
    centerOnDate: (dateToCenter) => {
      if (!xScaleRef.current || !svgRef.current) return;
      const currentDomain = xScaleRef.current.domain();
      const viewDuration = currentDomain[1].getTime() - currentDomain[0].getTime();
      const newMin = new Date(dateToCenter.getTime() - viewDuration / 2);
      const newMax = new Date(dateToCenter.getTime() + viewDuration / 2);
      xScaleRef.current.domain([newMin, newMax]);
      redrawElements(xScaleRef.current, referenceDate);
      // TODO: Update D3 zoom transform to match this new domain
    }
  }));

  useEffect(() => {
    if (!svgRef.current || !events || !themes) {
      d3.select(svgRef.current).selectAll("*").remove();
      return;
    }

    const margin = { top: 20, right: 30, bottom: 30, left: 150 };
    const { width, height } = svgRef.current.getBoundingClientRect();
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svgNode = svgRef.current;
    const svgSelection = d3.select(svgNode)
      .attr('width', width)
      .attr('height', height);
    
    svgSelection.selectAll("*").remove();

    const mainGroup = svgSelection.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    mainGroupRef.current = mainGroup.node();

    const xScale = d3.scaleTime().range([0, innerWidth]);
    xScaleRef.current = xScale;

    let minDataYear = 1400;
    let maxDataYear = new Date().getFullYear();

    if (events.length > 0) {
      const eventDates = events.flatMap(e => [new Date(e.start_date).getTime(), e.end_date ? new Date(e.end_date).getTime() : new Date(e.start_date).getTime()]);
      minDataYear = new Date(d3.min(eventDates)).getFullYear();
      maxDataYear = new Date(d3.max(eventDates)).getFullYear();
    }
    
    const refDateObj = new Date(referenceDate);
    const defaultTimespanYears = 50;
    
    let initialDomainStart = new Date(refDateObj.getFullYear() - defaultTimespanYears / 2, 0, 1);
    let initialDomainEnd = new Date(refDateObj.getFullYear() + defaultTimespanYears / 2, 11, 31);

    if (initialDomainStart.getFullYear() < minDataYear) {
        initialDomainStart = new Date(minDataYear, 0, 1);
        initialDomainEnd = new Date(Math.min(minDataYear + defaultTimespanYears, maxDataYear), 11, 31);
    }
    if (initialDomainEnd.getFullYear() > maxDataYear) {
        initialDomainEnd = new Date(maxDataYear, 11, 31);
        initialDomainStart = new Date(Math.max(maxDataYear - defaultTimespanYears, minDataYear), 0, 1);
    }
    if (initialDomainStart > initialDomainEnd) {
        initialDomainStart = new Date(minDataYear, 0, 1);
        initialDomainEnd = new Date(maxDataYear, 11, 31);
    }

    xScale.domain([initialDomainStart, initialDomainEnd]);
    initialDomainRef.current = [initialDomainStart, initialDomainEnd];

    const xAxisGroup = mainGroup.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`);
    xAxisRef.current = xAxisGroup.node();
    
    const drawXAxis = (scale) => {
        xAxisGroup.call(d3.axisBottom(scale));
    };
    drawXAxis(xScale);

    const themeNames = themes.map(t => t.name).sort();
    const yScale = d3.scaleBand()
      .domain(themeNames)
      .range([0, innerHeight])
      .paddingInner(0.1)
      .paddingOuter(0.05);

    const yAxisGroup = mainGroup.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale).tickSize(0))
      .select(".domain").remove();

    yAxisGroup.selectAll("text")
        .attr("x", -5)
        .style("text-anchor", "end")
        .style("font-size", "10px");

    const laneHeight = yScale.bandwidth();
    const eventPadding = 2;
    const eventBarHeight = Math.max(5, laneHeight - 2 * eventPadding);
    const circleRadius = Math.min(4, eventBarHeight / 2 - 1);


    const eventsByTheme = d3.group(events, d => d.main_theme_id);

    mainGroup.selectAll(".event-lane-group").remove();

    themes.forEach(theme => {
      const themeEvents = eventsByTheme.get(theme.id) || [];
      if (themeEvents.length === 0) return;

      const laneYPosition = yScale(theme.name);
      if (laneYPosition === undefined) return;

      const laneGroup = mainGroup.append("g")
        .attr("class", "event-lane-group")
        .attr("transform", `translate(0, ${laneYPosition})`);

      themeEvents.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
      
      laneGroup.selectAll(".timeline-event-item")
        .data(themeEvents)
        .join(
          enter => {
            const enterSelection = enter.append("g").attr("class", "timeline-event-item");

            // Periods as rects
            enterSelection.filter(d => d.date_type === "period" && d.end_date)
              .append("rect")
                .attr("class", "event-rect")
                .attr("y", eventPadding)
                .attr("height", eventBarHeight)
                .attr("x", d => xScale(new Date(d.start_date)))
                .attr("width", d => {
                  const startDate = new Date(d.start_date);
                  const endDate = new Date(d.end_date);
                  return Math.max(1, xScale(endDate) - xScale(startDate));
                });

            // Single events as circles
            enterSelection.filter(d => d.date_type === "single" || !d.end_date)
              .append("circle")
                .attr("class", "event-circle")
                .attr("cy", laneHeight / 2)
                .attr("r", circleRadius)
                .attr("cx", d => xScale(new Date(d.start_date)));
            
            // Common attributes for all
            enterSelection
              .attr("fill", theme.color || "#808080")
              .style("cursor", "pointer")
              .on("click", (event, d) => {
                if (onEventClick) onEventClick(d.globalId);
              })
              .append("title")
                .text(d => `${d.title}\n${new Date(d.start_date).toLocaleDateString()}${d.end_date ? ' - ' + new Date(d.end_date).toLocaleDateString() : ''}`);
            
            return enterSelection; // Return the group for update/exit
          },
          update => { // Handle updates if data changes and elements are reused
            update.select(".event-rect")
              .attr("x", d => xScale(new Date(d.start_date)))
              .attr("width", d => {
                  const startDate = new Date(d.start_date);
                  const endDate = new Date(d.end_date);
                  return Math.max(1, xScale(endDate) - xScale(startDate));
                });
            update.select(".event-circle")
              .attr("cx", d => xScale(new Date(d.start_date)));
            return update;
          }
        );
    });
    
    mainGroup.selectAll(".reference-line").remove();
    mainGroup.append("line")
      .attr("class", "reference-line")
      .attr("x1", xScale(refDateObj))
      .attr("x2", xScale(refDateObj))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "red")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4,4");

    mainGroup.append("text")
        .attr("class", "reference-line-label")
        .attr("x", xScale(refDateObj) + 4)
        .attr("y", -5)
        .attr("fill", "red")
        .style("font-size", "10px")
        .text(`Ref: ${refDateObj.toLocaleDateString()}`);

    const zoomed = (event) => {
      const newTransform = event.transform;
      if (initialDomainRef.current && xScaleRef.current) {
        const baseScale = d3.scaleTime().domain(initialDomainRef.current).range(xScaleRef.current.range());
        const transformedScale = newTransform.rescaleX(baseScale);
        xScaleRef.current.domain(transformedScale.domain());
        redrawElements(xScaleRef.current, referenceDate);
      }
    };

    const zoomBehavior = d3.zoom()
        .scaleExtent([0.05, 50])
        .extent([[0, 0], [innerWidth, innerHeight]])
        .on("zoom", zoomed);

    if (svgNode) {
      svgSelection.call(zoomBehavior);
      svgNode.__zoom = zoomBehavior;
    } else {
      console.error("TimelineView: svgNode (svgRef.current) is not valid for attaching zoom behavior.");
    }
    
    console.log("D3 TimelineView: Initial render complete.");

    return () => {
      if (svgNode) {
        d3.select(svgNode).on(".zoom", null);
      }
    };
  }, [events, themes, referenceDate, onEventClick]);

  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>;
});

export default TimelineView;