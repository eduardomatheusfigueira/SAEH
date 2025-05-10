import React, { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import * as d3 from 'd3';

const TimelineView = forwardRef(({ events, themes, referenceDate, onEventClick, isTimelineLocked, isTimelineExpanded }, ref) => {
  const svgRef = useRef(null);
  const xAxisRef = useRef(null);
  const xScaleRef = useRef(null);
  const mainGroupRef = useRef(null);
  const initialDomainRef = useRef(null);
  const yAxisRef = useRef(null);

  const redrawElements = useCallback((currentXScale, currentRefDateStr) => {
    if (!xAxisRef.current || !mainGroupRef.current || !currentXScale || !yAxisRef.current) return;

    const mainGroupSelection = d3.select(mainGroupRef.current);
    
    d3.select(xAxisRef.current).call(d3.axisBottom(currentXScale));

    mainGroupSelection.selectAll(".event-lane-group").each(function() {
        const laneGroup = d3.select(this);
        laneGroup.selectAll(".event-rect.timeline-event-item")
            .attr("x", d => currentXScale(new Date(d.start_date)))
            .attr("width", d => {
                const startDate = new Date(d.start_date);
                const endDate = new Date(d.end_date);
                const xStart = currentXScale(startDate);
                const xEnd = currentXScale(endDate);
                return Math.max(1, xEnd - xStart);
            });
        laneGroup.selectAll(".event-circle.timeline-event-item")
            .attr("cx", d => currentXScale(new Date(d.start_date)));
    });
    
    const refDateObject = new Date(currentRefDateStr);
    mainGroupSelection.selectAll(".reference-line")
        .attr("x1", currentXScale(refDateObject))
        .attr("x2", currentXScale(refDateObject));
    mainGroupSelection.selectAll(".reference-line-label")
        .attr("x", currentXScale(refDateObject) + 4)
        .text(`Ref.: ${refDateObject.toLocaleDateString()}`);

    // Update event text labels if they exist
    mainGroupSelection.selectAll(".event-text-label.timeline-event-item")
      .attr("x", function(d) {
        const textElement = d3.select(this);
        if (!d || !d.start_date) { // 'd' should be bound via .datum(d) during creation
          // console.warn("Missing data for text label update:", textElement.node());
          return textElement.attr("x"); // Keep current position if data is missing
        }
        const eventStartDate = new Date(d.start_date);
        const initialOffset = parseFloat(textElement.attr("data-initial-offset")) || 5; // Fallback to 5 if attr not found
        return currentXScale(eventStartDate) + initialOffset;
      });

  }, [referenceDate]); // referenceDate is a dependency for redrawElements

  const updateD3ZoomTransform = (newDomain) => {
    const svgNode = svgRef.current;
    if (svgNode && svgNode.__zoom && xScaleRef.current && initialDomainRef.current && newDomain && newDomain.length === 2) {
        const newMinDate = newDomain[0];
        const newMaxDate = newDomain[1];
        const innerWidth = xScaleRef.current.range()[1] - xScaleRef.current.range()[0];

        // Calculate the effective scale 'k' relative to the initial domain
        const k = (initialDomainRef.current[1].getTime() - initialDomainRef.current[0].getTime()) / (newMaxDate.getTime() - newMinDate.getTime());

        // Base scale for transform calculation should be the initial scale
        const baseScaleForTransform = d3.scaleTime().domain(initialDomainRef.current).range(xScaleRef.current.range());
        const translateX = -baseScaleForTransform(newMinDate) * k;
        
        const newTransform = d3.zoomIdentity.translate(translateX, 0).scale(k);
        
        // Prevent re-triggering the 'zoomed' event if possible, or ensure 'zoomed' can handle it
        d3.select(svgNode).call(svgNode.__zoom.transform, newTransform);
    }
  };

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      const svgNode = svgRef.current;
      if (svgNode && svgNode.__zoom) d3.select(svgNode).transition().duration(250).call(svgNode.__zoom.scaleBy, 1.2);
    },
    zoomOut: () => {
      const svgNode = svgRef.current;
      if (svgNode && svgNode.__zoom) d3.select(svgNode).transition().duration(250).call(svgNode.__zoom.scaleBy, 0.8);
    },
    panLeft: () => {
      const svgNode = svgRef.current;
      if (svgNode && svgNode.__zoom) d3.select(svgNode).transition().duration(250).call(svgNode.__zoom.translateBy, 50, 0);
    },
    panRight: () => {
      const svgNode = svgRef.current;
      // Corrected line:
      if (svgNode && svgNode.__zoom) d3.select(svgNode).transition().duration(250).call(svgNode.__zoom.translateBy, -50, 0);
    },
    resetZoom: () => {
      if (!xScaleRef.current || !svgRef.current || !initialDomainRef.current) return;
      const svgNode = svgRef.current;
      if (svgNode && svgNode.__zoom) {
        xScaleRef.current.domain(initialDomainRef.current);
        d3.select(svgNode).transition().duration(750).call(svgNode.__zoom.transform, d3.zoomIdentity);
        // The zoom event should trigger redrawElements.
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
      // TODO: Update D3 zoom transform
    },
    centerOnDate: (dateToCenter) => {
      if (!xScaleRef.current || !svgRef.current) return;
      const currentDomain = xScaleRef.current.domain();
      const viewDuration = currentDomain[1].getTime() - currentDomain[0].getTime();
      const newMin = new Date(dateToCenter.getTime() - viewDuration / 2);
      const newMax = new Date(dateToCenter.getTime() + viewDuration / 2);
      xScaleRef.current.domain([newMin, newMax]);
      redrawElements(xScaleRef.current, referenceDate);
      updateD3ZoomTransform([newMin, newMax]);
    },
    jumpToYear: (year) => {
      if (!xScaleRef.current || !svgRef.current || !year) return;
      const targetYear = parseInt(year, 10);
      if (isNaN(targetYear)) return;

      const currentDomain = xScaleRef.current.domain();
      const viewDuration = currentDomain[1].getTime() - currentDomain[0].getTime();
      const targetDate = new Date(targetYear, 0, 1); // Jan 1st of target year

      const newDomainStart = new Date(targetDate.getTime() - viewDuration / 2);
      const newDomainEnd = new Date(targetDate.getTime() + viewDuration / 2);
      
      xScaleRef.current.domain([newDomainStart, newDomainEnd]);
      redrawElements(xScaleRef.current, referenceDate);
      updateD3ZoomTransform([newDomainStart, newDomainEnd]);
    },
    setZoomLevel: (level) => {
      if (!xScaleRef.current || !svgRef.current) return;
      
      const currentDomain = xScaleRef.current.domain();
      const currentCenterMs = (currentDomain[0].getTime() + currentDomain[1].getTime()) / 2;
      let newDurationMs;

      if (level === 'decade') {
        newDurationMs = 10 * 365.25 * 24 * 60 * 60 * 1000; // Approx 10 years
      } else if (level === 'century') {
        newDurationMs = 100 * 365.25 * 24 * 60 * 60 * 1000; // Approx 100 years
      } else {
        return; // Unknown level
      }

      const newDomainStart = new Date(currentCenterMs - newDurationMs / 2);
      const newDomainEnd = new Date(currentCenterMs + newDurationMs / 2);

      xScaleRef.current.domain([newDomainStart, newDomainEnd]);
      redrawElements(xScaleRef.current, referenceDate);
      updateD3ZoomTransform([newDomainStart, newDomainEnd]);
    }
  })); // End of useImperativeHandle

  useEffect(() => {
    if (!svgRef.current || !events || !themes) {
      d3.select(svgRef.current).selectAll("*").remove();
      return;
    }

    const margin = { top: 20, right: 30, bottom: 30, left: 30 };
    const { width, height } = svgRef.current.getBoundingClientRect();
    
    if (width === 0 || height === 0) return;

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
      if (eventDates.length > 0) {
        minDataYear = new Date(d3.min(eventDates)).getFullYear();
        maxDataYear = new Date(d3.max(eventDates)).getFullYear();
      }
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
    if (initialDomainStart >= initialDomainEnd) {
        initialDomainStart = new Date(minDataYear, 0, 1);
        initialDomainEnd = new Date(initialDomainStart.getFullYear() + defaultTimespanYears, 11, 31);
        if (initialDomainEnd.getFullYear() > maxDataYear && minDataYear < maxDataYear) {
             initialDomainEnd = new Date(maxDataYear, 11, 31);
        } else if (initialDomainEnd.getFullYear() > maxDataYear) {
            initialDomainEnd = new Date(minDataYear + defaultTimespanYears, 11, 31); // fallback if maxDataYear is also minDataYear
        }

    }
    
    xScale.domain([initialDomainStart, initialDomainEnd]);
    initialDomainRef.current = [initialDomainStart, initialDomainEnd];

    const xAxisGroup = mainGroup.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`);
    xAxisRef.current = xAxisGroup.node();
    
    d3.select(xAxisRef.current).call(d3.axisBottom(xScale));

    const themeNames = themes.map(t => t.name).sort();
    const yScale = d3.scaleBand()
      .domain(themeNames)
      .range([0, innerHeight])
      .paddingInner(0.2)
      .paddingOuter(0.1);
    yAxisRef.current = mainGroup.append("g").attr("class", "y-axis").node(); 

    const laneHeight = yScale.bandwidth();
    const eventPadding = 2;
    const eventBarHeight = Math.max(5, laneHeight - 2 * eventPadding);
    const circleRadius = Math.min(5, eventBarHeight / 2); 
    const circleStrokeWidth = 2;

    const eventsByTheme = d3.group(events, d => d.main_theme_id);

    mainGroup.selectAll(".event-lane-group").remove();

    themes.forEach(theme => {
      const allThemeEvents = eventsByTheme.get(theme.id) || [];
      if (allThemeEvents.length === 0) return;

      const laneYPosition = yScale(theme.name);
      if (laneYPosition === undefined) return;

      const laneGroup = mainGroup.append("g")
        .attr("class", "event-lane-group")
        .attr("transform", `translate(0, ${laneYPosition})`);

      allThemeEvents.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
      
      const periodEvents = allThemeEvents.filter(d => d.date_type === "period" && d.end_date);
      const singleEvents = allThemeEvents.filter(d => d.date_type === "single" || !d.end_date);

      laneGroup.selectAll(".event-rect.timeline-event-item")
        .data(periodEvents)
        .join("rect")
          .attr("class", "event-rect timeline-event-item")
          .attr("y", eventPadding)
          .attr("height", eventBarHeight)
          .attr("x", d => xScale(new Date(d.start_date)))
          .attr("width", d => {
            const startDate = new Date(d.start_date);
            const endDate = new Date(d.end_date);
            return Math.max(1, xScale(endDate) - xScale(startDate));
          })
          .attr("fill", theme.color || "#808080")
          .style("opacity", 0.6)
          .style("cursor", "pointer")
          .on("click", (event, d) => { if (onEventClick) onEventClick(d.globalId); })
          .each(function(d) { // Use 'each' to append title and conditionally text
            const element = d3.select(this);
            element.select("title").remove(); // Remove old title if any
            element.append("title")
                   .text(`${d.title}\n${new Date(d.start_date).toLocaleDateString()} - ${new Date(d.end_date).toLocaleDateString()}`);
            
            if (isTimelineExpanded) {
              // Ensure not to duplicate text if re-rendering
              laneGroup.selectAll(`.event-text-label[data-id="${d.globalId}"]`).remove();
              const periodTextX = xScale(new Date(d.start_date)) + 5;
              laneGroup.append("text")
                .datum(d) // Ensure data is bound
                .attr("class", "timeline-event-item event-text-label")
                .attr("data-id", d.globalId)
                .attr("data-initial-offset", 5) // Store initial offset
                .attr("x", periodTextX)
                .attr("y", eventPadding + eventBarHeight / 2)
                .attr("dy", ".35em")
                .style("font-size", "9px")
                .style("pointer-events", "none") // So text doesn't block click on rect
                .text(d.title.length > 20 ? d.title.substring(0, 17) + "..." : d.title);
            } else {
              laneGroup.selectAll(`.event-text-label[data-id="${d.globalId}"]`).remove();
            }
          });

      laneGroup.selectAll(".event-circle.timeline-event-item")
        .data(singleEvents)
        .join("circle")
          .attr("class", "event-circle timeline-event-item")
          .attr("cy", laneHeight / 2)
          .attr("r", circleRadius)
          .attr("cx", d => xScale(new Date(d.start_date)))
          .attr("fill", "white")
          .attr("stroke", theme.color || "#808080")
          .attr("stroke-width", circleStrokeWidth)
          .style("cursor", "pointer")
          .on("click", (event, d) => { if (onEventClick) onEventClick(d.globalId); })
          .each(function(d) { // Use 'each' to append title and conditionally text
            const element = d3.select(this);
            element.select("title").remove(); // Remove old title if any
            element.append("title")
                   .text(`${d.title}\n${new Date(d.start_date).toLocaleDateString()}`);

            if (isTimelineExpanded) {
              laneGroup.selectAll(`.event-text-label[data-id="${d.globalId}"]`).remove();
              const singleEventTextOffset = circleRadius + 3;
              const singleTextX = xScale(new Date(d.start_date)) + singleEventTextOffset;
              laneGroup.append("text")
                .datum(d) // Ensure data is bound
                .attr("class", "timeline-event-item event-text-label")
                .attr("data-id", d.globalId)
                .attr("data-initial-offset", singleEventTextOffset) // Store initial offset
                .attr("x", singleTextX)
                .attr("y", laneHeight / 2)
                .attr("dy", ".35em")
                .style("font-size", "9px")
                .style("pointer-events", "none")
                .text(d.title.length > 20 ? d.title.substring(0, 17) + "..." : d.title);
            } else {
              laneGroup.selectAll(`.event-text-label[data-id="${d.globalId}"]`).remove();
            }
          });
    });
    
    // Redraw reference line and label (as they might be removed if part of mainGroup)
    mainGroup.selectAll(".reference-line").remove();
    mainGroup.selectAll(".reference-line-label").remove();
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
      // This function is called by D3 zoom/pan gestures.
      // If locked, these gestures should not change the timeline's domain directly.
      if (isTimelineLocked) {
        // If we wanted gestures to change the referenceDate when locked (Option B from planning):
        // This would involve calculating the new center date based on event.transform
        // and then calling a prop like onTimelineGesture(newCenterDate).
        // For Option A (disable gestures), we simply return.
        return;
      }

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
        .on("zoom", zoomed)
        // Add a filter to prevent zoom/pan gestures if the timeline is locked.
        .filter(event => {
          if (isTimelineLocked) {
            return false; // Disallow user gestures (wheel, drag) if locked
          }
          return true; // Allow gestures if not locked
        });


    if (svgNode) {
      svgSelection.call(zoomBehavior);
      svgNode.__zoom = zoomBehavior; // Store for imperative calls

      // Initialize D3's internal zoom transform to match the initial domain
      if (initialDomainRef.current) {
        updateD3ZoomTransform(initialDomainRef.current);
      }

      // If locked, ensure the view is centered on the referenceDate on initial/locked render
      if (isTimelineLocked) {
        const currentDomain = xScaleRef.current.domain();
        const viewDuration = currentDomain[1].getTime() - currentDomain[0].getTime();
        const newMin = new Date(refDateObj.getTime() - viewDuration / 2);
        const newMax = new Date(refDateObj.getTime() + viewDuration / 2);
        xScaleRef.current.domain([newMin, newMax]);
        // We need to update the D3 zoom transform to match this new domain
        // so that subsequent gestures (if re-enabled) start from the correct state.
        const t = d3.zoomIdentity
            .translate(-xScaleRef.current(newMin), 0) // This needs to be calculated based on the new domain
            .scale(innerWidth / (xScaleRef.current(newMax) - xScaleRef.current(newMin))); // This is complex
        // For now, just redraw. The imperative resetZoom handles identity better.
        redrawElements(xScaleRef.current, referenceDate);
      }

    } else {
      console.error("TimelineView: svgNode (svgRef.current) is not valid for attaching zoom behavior.");
    }
    
    console.log("D3 TimelineView: Initial render complete. Locked:", isTimelineLocked);

    return () => {
      if (svgNode) {
        d3.select(svgNode).on(".zoom", null);
      }
    };
  }, [events, themes, referenceDate, onEventClick, redrawElements, isTimelineExpanded, isTimelineLocked]);

  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>;
}); // Corrected: ensure this is the final closing for forwardRef

export default TimelineView;