import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as DataManager from '../dataManager';

describe('DataManager', () => {
  beforeEach(() => {
    DataManager.clearAllData();
    // Reset console mocks if any
    vi.restoreAllMocks();
  });

  describe('clearAllData', () => {
    it('should clear all data', () => {
      // Setup initial data
      const sourceInfo = { id: 's1', name: 'Test Source' };
      DataManager.addSource(sourceInfo);
      expect(DataManager.getSourcesInfo()).toHaveLength(1);

      DataManager.clearAllData();

      expect(DataManager.getSourcesInfo()).toHaveLength(0);
      expect(DataManager.getAllEvents()).toHaveLength(0);
      expect(DataManager.getAllCharacters()).toHaveLength(0);
      expect(DataManager.getAllPlaces()).toHaveLength(0);
      expect(DataManager.getAllThemes()).toHaveLength(0);
    });
  });

  describe('Source Management', () => {
    it('should add a new source', () => {
      const sourceInfo = { id: 's1', name: 'Test Source' };
      const result = DataManager.addSource(sourceInfo);

      expect(result).toBe('s1');
      expect(DataManager.getSourcesInfo()).toHaveLength(1);
      expect(DataManager.getSourceInfoById('s1')).toEqual(expect.objectContaining(sourceInfo));
    });

    it('should generate an ID if not provided', () => {
      const sourceInfo = { name: 'Test Source' };
      const result = DataManager.addSource(sourceInfo);

      expect(result).toBeDefined();
      expect(result).toMatch(/^inmemory_/);
      expect(DataManager.getSourcesInfo()).toHaveLength(1);
    });

    it('should not add duplicate source ID', () => {
      const sourceInfo = { id: 's1', name: 'Test Source' };
      DataManager.addSource(sourceInfo);

      // Suppress console.warn
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = DataManager.addSource(sourceInfo);

      expect(result).toBeNull();
      expect(DataManager.getSourcesInfo()).toHaveLength(1);
      consoleSpy.mockRestore();
    });

    it('should update source info', () => {
      DataManager.addSource({ id: 's1', name: 'Old Name' });
      const success = DataManager.updateSourceInfo('s1', { name: 'New Name' });

      expect(success).toBe(true);
      expect(DataManager.getSourceInfoById('s1').name).toBe('New Name');
    });

    it('should return false when updating non-existent source', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const success = DataManager.updateSourceInfo('non-existent', { name: 'New Name' });

      expect(success).toBe(false);
      consoleSpy.mockRestore();
    });

    it('should remove source and associated entities', () => {
      const sourceId = 's1';
      DataManager.addSource({ id: sourceId, name: 'Test Source' });
      DataManager.addEventToSource(sourceId, { id: 'e1' });
      DataManager.addCharacterToSource(sourceId, { id: 'c1' });
      DataManager.addPlaceToSource(sourceId, { id: 'p1' });

      expect(DataManager.getSourcesInfo()).toHaveLength(1);
      expect(DataManager.getAllEvents()).toHaveLength(1);
      expect(DataManager.getAllCharacters()).toHaveLength(1);
      expect(DataManager.getAllPlaces()).toHaveLength(1);

      const success = DataManager.removeSource(sourceId);

      expect(success).toBe(true);
      expect(DataManager.getSourcesInfo()).toHaveLength(0);
      expect(DataManager.getAllEvents()).toHaveLength(0);
      expect(DataManager.getAllCharacters()).toHaveLength(0);
      expect(DataManager.getAllPlaces()).toHaveLength(0);
    });
  });

  describe('Event Management', () => {
    const sourceId = 's1';
    beforeEach(() => {
      DataManager.addSource({ id: sourceId, name: 'Source 1' });
    });

    it('should add event to source', () => {
      const eventData = { id: 'e1', title: 'Event 1' };
      const globalId = DataManager.addEventToSource(sourceId, eventData);

      expect(globalId).toBe(`${sourceId}_${eventData.id}`);
      expect(DataManager.getAllEvents()).toHaveLength(1);
      expect(DataManager.getEventById(globalId)).toEqual(expect.objectContaining({
        id: 'e1',
        sourceId: sourceId,
        title: 'Event 1'
      }));
    });

    it('should fail to add event if source does not exist', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = DataManager.addEventToSource('non-existent', { id: 'e1' });

      expect(result).toBeNull();
      expect(DataManager.getAllEvents()).toHaveLength(0);
      consoleSpy.mockRestore();
    });

    it('should update event', () => {
      const globalId = DataManager.addEventToSource(sourceId, { id: 'e1', title: 'Old Title' });
      const success = DataManager.updateEventInSource(globalId, { title: 'New Title' });

      expect(success).toBe(true);
      expect(DataManager.getEventById(globalId).title).toBe('New Title');
    });

    it('should delete event', () => {
      const globalId = DataManager.addEventToSource(sourceId, { id: 'e1' });
      const success = DataManager.deleteEventFromSource(globalId);

      expect(success).toBe(true);
      expect(DataManager.getAllEvents()).toHaveLength(0);
    });
  });

  describe('Character Management', () => {
    const sourceId = 's1';
    beforeEach(() => {
      DataManager.addSource({ id: sourceId, name: 'Source 1' });
    });

    it('should add character to source', () => {
      const charData = { id: 'c1', name: 'Char 1' };
      const globalId = DataManager.addCharacterToSource(sourceId, charData);

      expect(globalId).toBe(`${sourceId}_${charData.id}`);
      expect(DataManager.getAllCharacters()).toHaveLength(1);
    });

    it('should delete character and update event references', () => {
      const charId = 'c1';
      const globalCharId = DataManager.addCharacterToSource(sourceId, { id: charId });
      const globalEventId = DataManager.addEventToSource(sourceId, { id: 'e1', characters_ids: [globalCharId] });

      expect(DataManager.getEventById(globalEventId).characters_ids).toContain(globalCharId);

      const success = DataManager.deleteCharacterFromSource(globalCharId);

      expect(success).toBe(true);
      expect(DataManager.getAllCharacters()).toHaveLength(0);
      expect(DataManager.getEventById(globalEventId).characters_ids).not.toContain(globalCharId);
    });
  });

  describe('Place Management', () => {
    const sourceId = 's1';
    beforeEach(() => {
      DataManager.addSource({ id: sourceId, name: 'Source 1' });
    });

    it('should add place to source', () => {
      const placeData = { id: 'p1', name: 'Place 1' };
      const globalId = DataManager.addPlaceToSource(sourceId, placeData);

      expect(globalId).toBe(`${sourceId}_${placeData.id}`);
      expect(DataManager.getAllPlaces()).toHaveLength(1);
    });

    it('should delete place and update event references', () => {
      const placeId = 'p1';
      const globalPlaceId = DataManager.addPlaceToSource(sourceId, { id: placeId });
      // Note: deletePlaceFromSource uses local ID for event update logic currently, check implementation
      // Implementation:
      // allEvents.forEach(event => {
      //   if (event.sourceId === placeSourceId && event.place_id === localPlaceId) {
      //     event.place_id = null;
      //   }
      // });

      const globalEventId = DataManager.addEventToSource(sourceId, { id: 'e1', place_id: placeId });

      expect(DataManager.getEventById(globalEventId).place_id).toBe(placeId);

      const success = DataManager.deletePlaceFromSource(globalPlaceId);

      expect(success).toBe(true);
      expect(DataManager.getAllPlaces()).toHaveLength(0);
      expect(DataManager.getEventById(globalEventId).place_id).toBeNull();
    });
  });

  describe('Theme Management', () => {
    it('should add theme', () => {
      const themeData = { id: 't1', name: 'Theme 1' };
      const result = DataManager.addTheme(themeData);

      expect(result).toBe('t1');
      expect(DataManager.getAllThemes()).toHaveLength(1);
    });

    it('should delete theme and update event references', () => {
        const themeId = 't1';
        DataManager.addTheme({ id: themeId, name: 'Theme 1' });
        const sourceId = 's1';
        DataManager.addSource({ id: sourceId, name: 'Source 1' });

        const globalEventId = DataManager.addEventToSource(sourceId, {
            id: 'e1',
            main_theme_id: themeId,
            secondary_tags_ids: [themeId]
        });

        expect(DataManager.getEventById(globalEventId).main_theme_id).toBe(themeId);
        expect(DataManager.getEventById(globalEventId).secondary_tags_ids).toContain(themeId);

        const success = DataManager.deleteTheme(themeId);

        expect(success).toBe(true);
        expect(DataManager.getAllThemes()).toHaveLength(0);
        expect(DataManager.getEventById(globalEventId).main_theme_id).toBeNull();
        expect(DataManager.getEventById(globalEventId).secondary_tags_ids).not.toContain(themeId);
    });
  });

  describe('loadSourceDataFromString', () => {
      it('should load valid source data', () => {
          const validJson = JSON.stringify({
              source_info: { id: 's1', name: 'Imported Source' },
              events: [{ id: 'e1', title: 'Event 1' }],
              characters: [{ id: 'c1', name: 'Char 1' }],
              places: [{ id: 'p1', name: 'Place 1' }],
              themes: [{ id: 't1', name: 'Theme 1' }]
          });

          const result = DataManager.loadSourceDataFromString(validJson, 'test.json');

          expect(result).toBe(true);
          expect(DataManager.getSourcesInfo()).toHaveLength(1);
          expect(DataManager.getAllEvents()).toHaveLength(1);
          expect(DataManager.getAllCharacters()).toHaveLength(1);
          expect(DataManager.getAllPlaces()).toHaveLength(1);
          expect(DataManager.getAllThemes()).toHaveLength(1);
      });

      it('should return false for invalid json', () => {
          const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
          const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

          const result = DataManager.loadSourceDataFromString('{ invalid json', 'test.json');

          expect(result).toBe(false);

          consoleSpy.mockRestore();
          alertSpy.mockRestore();
      });

      it('should return false if source_info is missing', () => {
          const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
          const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

          const json = JSON.stringify({ events: [] });
          const result = DataManager.loadSourceDataFromString(json, 'test.json');

          expect(result).toBe(false);

          consoleSpy.mockRestore();
          alertSpy.mockRestore();
      });
  });
});
