import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_ACCESS_TOKEN, INITIAL_MAP_CENTER, INITIAL_MAP_ZOOM, DEFAULT_MAP_STYLE } from '../config';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

const MapView = ({ events, themes, referenceDate, timeWindowYears, onEventClick, mapStyleUrl }) => { // Added mapStyleUrl prop
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [markers, setMarkers] = useState([]); // Keep track of markers to remove them

  useEffect(() => {
    if (mapRef.current) return; 

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyleUrl || DEFAULT_MAP_STYLE, // Use prop or fallback to default from config
      center: INITIAL_MAP_CENTER,
      zoom: INITIAL_MAP_ZOOM
    });

    const onLoadHandler = () => {
      setIsMapLoaded(true);
      console.log('Mapbox map loaded with style:', mapRef.current.getStyle().url);
    };

    mapRef.current.on('load', onLoadHandler);

    return () => {
      if (mapRef.current) {
        mapRef.current.off('load', onLoadHandler); // Clean up listener
        mapRef.current.remove();
        mapRef.current = null;
        setIsMapLoaded(false);
      }
    };
  }, []); // Initial map setup runs once

  useEffect(() => { // Effect to change style
    if (mapRef.current && isMapLoaded && mapStyleUrl && mapRef.current.getStyle().url !== mapStyleUrl) {
      console.log('MapView: Setting new map style:', mapStyleUrl);
      // Setting isMapLoaded to false before changing style can help manage marker re-rendering logic
      // if it strictly depends on isMapLoaded being true only after the *new* style is fully loaded.
      // setIsMapLoaded(false); // Optional: uncomment if marker logic needs explicit reload trigger
      mapRef.current.setStyle(mapStyleUrl);
      // The 'load' event will be re-triggered by setStyle, and onLoadHandler will set isMapLoaded(true)
    }
  }, [mapStyleUrl, isMapLoaded]); // Removed mapRef.current from deps as it's stable after init

  useEffect(() => {
    // This effect handles marker updates. It depends on isMapLoaded.
    // When setStyle completes, 'load' fires, isMapLoaded becomes true, and this effect runs.
    if (!isMapLoaded || !mapRef.current || !events || !themes) {
      // Clear existing markers if map is not ready or no data, to prevent stale markers on style change
      markers.forEach(marker => marker.remove());
      setMarkers([]);
      return;
    }

    // Clear existing markers
    markers.forEach(marker => marker.remove());
    const newMarkers = [];

    const refDateObj = new Date(referenceDate);
    const lowerBoundDate = new Date(refDateObj.getFullYear() - timeWindowYears, refDateObj.getMonth(), refDateObj.getDate());
    const upperBoundDate = new Date(refDateObj.getFullYear() + timeWindowYears, refDateObj.getMonth(), refDateObj.getDate(), 23, 59, 59, 999);


    const eventsInWindow = events.filter(event => {
      if (event.longitude != null && event.latitude != null) {
        const eventDate = new Date(event.start_date);
        return eventDate >= lowerBoundDate && eventDate <= upperBoundDate;
      }
      return false;
    });

    const coordinateMap = new Map();
    eventsInWindow.forEach(event => {
      const coordKey = `${event.longitude}_${event.latitude}`;
      if (!coordinateMap.has(coordKey)) {
        coordinateMap.set(coordKey, []);
      }
      coordinateMap.get(coordKey).push(event);
    });

    coordinateMap.forEach((groupedEvents) => {
      let finalLng, finalLat;
      if (groupedEvents.length === 1) {
        const event = groupedEvents[0];
        finalLng = event.longitude;
        finalLat = event.latitude;
        
        // Create marker for single event
        const theme = themes.find(t => t.id === event.main_theme_id);
        const fillColor = theme ? theme.color : '#808080';
        let borderColor = '#FFFFFF';
        const eventDate = new Date(event.start_date);
        if (eventDate < refDateObj) borderColor = '#FF0000';
        else if (eventDate > refDateObj) borderColor = '#0000FF';
        const dateDiffDays = Math.abs((eventDate - refDateObj) / (1000 * 60 * 60 * 24));
        const opacity = dateDiffDays <= 365 ? 1 : 0.6;

        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.backgroundColor = fillColor;
        el.style.width = '12px';
        el.style.height = '12px';
        el.style.borderRadius = '50%';
        el.style.border = `2px solid ${borderColor}`;
        el.style.opacity = opacity;
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => { if (onEventClick) onEventClick(event.globalId); });

        const marker = new mapboxgl.Marker(el)
          .setLngLat([finalLng, finalLat])
          .addTo(mapRef.current);
        newMarkers.push(marker);

      } else {
        // For overlapping points, calculate offsets
        const numOverlapping = groupedEvents.length;
        const baseOffset = 0.00003; // Base geographic offset, very small
        // Increase offset slightly for more points, but cap it to avoid huge spreads
        const dynamicOffset = baseOffset * Math.min(numOverlapping, 5); 

        groupedEvents.forEach((event, index) => {
          const angle = (index / numOverlapping) * 2 * Math.PI; // Distribute in a circle
          const offsetX = Math.cos(angle) * dynamicOffset;
          const offsetY = Math.sin(angle) * dynamicOffset;
          
          finalLng = event.longitude + offsetX;
          finalLat = event.latitude + offsetY;

          const theme = themes.find(t => t.id === event.main_theme_id);
          const fillColor = theme ? theme.color : '#808080';
          let borderColor = '#FFFFFF';
          const eventDate = new Date(event.start_date);
          if (eventDate < refDateObj) borderColor = '#FF0000';
          else if (eventDate > refDateObj) borderColor = '#0000FF';
          const dateDiffDays = Math.abs((eventDate - refDateObj) / (1000 * 60 * 60 * 24));
          const opacity = dateDiffDays <= 365 ? 1 : 0.6;
          
          const el = document.createElement('div');
          el.className = 'custom-marker';
          // Add a subtle indicator for offset markers if desired, e.g., smaller size or different border
          el.style.backgroundColor = fillColor;
          el.style.width = '12px'; 
          el.style.height = '12px';
          el.style.borderRadius = '50%';
          el.style.border = `2px solid ${borderColor}`;
          el.style.opacity = opacity;
          el.style.cursor = 'pointer';
          el.addEventListener('click', () => { if (onEventClick) onEventClick(event.globalId); });

          const marker = new mapboxgl.Marker(el)
            .setLngLat([finalLng, finalLat])
            .addTo(mapRef.current);
          newMarkers.push(marker);
        });
      }
    });
    setMarkers(newMarkers); // Update the state with the new set of markers

  }, [events, themes, isMapLoaded, referenceDate, timeWindowYears, onEventClick]); // onEventClick added

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />;
};

export default MapView;