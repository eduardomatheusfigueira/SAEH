import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_ACCESS_TOKEN, INITIAL_MAP_CENTER, INITIAL_MAP_ZOOM, DEFAULT_MAP_STYLE } from '../config';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

const MapView = ({ events, themes, referenceDate, timeWindowYears, onEventClick }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null); // To store the map instance
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (mapRef.current) return; // Initialize map only once

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: DEFAULT_MAP_STYLE,
      center: INITIAL_MAP_CENTER,
      zoom: INITIAL_MAP_ZOOM
    });

    mapRef.current.on('load', () => {
      setIsMapLoaded(true);
      console.log('Mapbox map loaded.');
      // Future: Add sources and layers for events here
    });

    // Clean up on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setIsMapLoaded(false);
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  // useEffect to add/update event markers when events or themes data changes and map is loaded
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !events || !themes) {
      return;
    }

    console.log("MapView: Adding/updating event markers. Events count:", events.length);

    // Clear existing markers (if any) - a more robust approach would be to update or manage by ID
    // For now, let's assume we might be re-adding all, or implement a proper update strategy later.
    // This simple example doesn't add persistent markers yet.
    
    // Clear existing markers before adding new ones to reflect filtering
    // A more performant approach would be to update existing markers or manage them by ID.
    document.querySelectorAll('.mapboxgl-marker').forEach(marker => marker.remove());

    const refDate = new Date(referenceDate);
    const lowerBoundDate = new Date(refDate.getFullYear() - timeWindowYears, refDate.getMonth(), refDate.getDate());
    const upperBoundDate = new Date(refDate.getFullYear() + timeWindowYears, refDate.getMonth(), refDate.getDate());

    events.forEach(event => {
      if (event.longitude != null && event.latitude != null) {
        const eventDate = new Date(event.start_date);

        if (eventDate >= lowerBoundDate && eventDate <= upperBoundDate) {
          const theme = themes.find(t => t.id === event.main_theme_id);
          const fillColor = theme ? theme.color : '#808080';

          let borderColor = '#FFFFFF'; // White for close to reference date
          const dateDiffDays = Math.abs((eventDate - refDate) / (1000 * 60 * 60 * 24));
          
          if (eventDate < refDate) {
            borderColor = '#FF0000'; // Red for older
          } else if (eventDate > refDate) {
            borderColor = '#0000FF'; // Blue for newer
          }
          // Simple opacity: more opaque if closer to refDate (within 1 year for this example)
          // More sophisticated opacity based on proximity could be added.
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

          // Add click listener to the marker element
          el.addEventListener('click', () => {
            if (onEventClick) {
              onEventClick(event.globalId); // Pass the globalId of the event
            }
          });

          // Optional: Keep popup for hover or remove if click opens modal
          // const popup = new mapboxgl.Popup({ offset: 25 })
          //   .setHTML(`<h3>${event.title}</h3><p>Date: ${event.start_date}</p><p>${event.description_short || ''}</p>`);

          new mapboxgl.Marker(el)
            .setLngLat([event.longitude, event.latitude])
            // .setPopup(popup) // Decide if popup is still needed or if modal is primary
            .addTo(mapRef.current);
        }
      }
    });

  }, [events, themes, isMapLoaded, referenceDate, timeWindowYears]);


  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />;
};

export default MapView;