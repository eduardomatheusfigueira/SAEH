# SAEH Data Management Page Plan

This document outlines the plan for creating a new Data Management Page within the SAEH (Sistema de Auxílio ao Estudo Histórico) application. This page will allow users to manage historical data sources, events, characters, places, themes, and profiles directly within the UI, rather than manually editing JSON files.

## User Requirements Summary

Based on user feedback, the Data Management Page should adhere to the following key principles:

1.  **Scope of Editing & Creation:**
    *   Changes (edits, creations, deletions) made on the management page will be staged in memory and **not** reflected live in the main application view (map/timeline) until a profile is saved and reloaded, or a similar explicit "apply" action is taken.
    *   New entities (events, characters, etc.) can be created "in-memory."
2.  **Saving Changes:**
    *   The primary method for persisting modifications will be by **saving the entire current session as a Profile file**. This profile will embed all data, including any modifications or new in-memory creations.
3.  **Source Management:**
    *   The UI will allow editing of `source_info` (name, author, color, etc.).
    *   Users will be able to unload/remove sources from the current session.
    *   Creating new, empty "in-memory" sources will be supported.
4.  **Profile Management & Editing Embedded Data:**
    *   Users will be able to edit the datasets (events, characters, etc.) embedded within a currently loaded profile through the UI. These changes are then saved by re-saving the profile.

## High-Level Plan

The development will be structured in phases:

**Phase 1: `DataManager.js` Enhancements (Backend Logic)**

This phase is critical as it lays the foundation for all UI interactions. The existing `DataManager.js` is primarily designed for loading entire source files. It needs to be extended to support granular, in-memory CRUD (Create, Read, Update, Delete) operations.

*   **Implement In-Memory CRUD Functions:**
    *   `addSource(sourceInfoData)`: Adds a new source object to `allSourcesInfo`. Handles generation of a unique `sourceId` if one is not provided (e.g., for "new in-memory source").
    *   `updateSourceInfo(sourceId, newSourceInfoData)`: Updates the `source_info` for a given `sourceId`.
    *   `removeSource(sourceId)`: Removes a source and all its associated entities (events, characters, places) from the in-memory arrays. (Careful consideration for themes, which are currently global).
    *   `addEventToSource(sourceId, eventData)`: Adds an event to `allEvents`, associating it with `sourceId`. Generates a unique `event.id` (within that source) and a `globalId`.
    *   `updateEventInSource(globalEventId, updatedEventData)`: Finds an event by its `globalId` and updates its data.
    *   `deleteEventFromSource(globalEventId)`: Removes an event from `allEvents`.
    *   Similar `add/update/delete` functions for `characters` and `places`, ensuring they are linked to a `sourceId` and have unique `globalId`s.
    *   `addTheme(themeData)`: Adds a new theme to `allThemes` if an ID match isn't found.
    *   `updateTheme(themeId, updatedThemeData)`: Updates an existing theme by its `id`.
    *   `deleteTheme(themeId)`: Removes a theme. (Consider UI warnings or prevention if the theme is currently in use by events).
*   **ID Management:**
    *   Implement a robust and consistent strategy for generating unique `id` values for newly created entities (sources, events, characters, places, themes), ensuring they are unique within their respective scopes (e.g., `event.id` unique per `sourceId`). `globalId`s (`sourceId_entityId`) must also remain unique.
*   **State Integrity:**
    *   Ensure that operations like `removeSource` correctly clean up all dependent entities.
    *   When an entity (e.g., a character) is deleted, consider how to handle references to it in other entities (e.g., an event's `characters_ids` array). This might involve removing the ID from linking arrays or warning the user.

**Phase 2: Data Management Page UI - Structure and Read Operations**

1.  **New Route/View:**
    *   Create a new React component, e.g., `DataManagementPage.jsx`.
    *   Add a route (e.g., `/manage-data`) in `App.jsx` to render this component. This page should likely be a distinct view, separate from the main map/timeline interface.
2.  **Layout:**
    *   **Main Navigation:** A clear navigation structure (e.g., tabs or a sidebar) to switch between managing:
        *   Sources
        *   Events
        *   Characters
        *   Places
        *   Themes
    *   **List Pane:** Displays a filterable and sortable list of the selected entity type.
    *   **Detail/Edit Pane:** Displays the full details of an item selected from the list. This pane will later house the editing forms.
3.  **Sources Tab:**
    *   List all currently loaded sources (from `DataManager.getSourcesInfo()`).
    *   Display key `source_info` details (ID, name, author, color).
    *   Buttons:
        *   "Create New Source (In-Memory)"
        *   "Load Source File(s)" (leverages existing `handleLoadSourceDataFiles` logic in `App.jsx`, which uses `DataManager.loadSourceDataFromString`)
        *   "Unload Selected Source" (calls `DataManager.removeSource` and updates UI)
    *   When a source is selected here, it can act as a filter for the Events, Characters, and Places tabs.
4.  **Events Tab:**
    *   Dropdown to filter events by their parent `sourceId`.
    *   List events displaying key information (e.g., ID, Title, Date(s), short description).
    *   When an event is selected, its full data is shown in the Detail/Edit Pane.
    *   Button: "Create New Event" (will require selecting a source first or adding to a designated "active" or "new in-memory" source).
5.  **Characters, Places, Themes Tabs:**
    *   Similar structure to the Events Tab: list view, (source filter if applicable for characters/places), detail view.
    *   Themes are global, so no source filter is needed for the Themes tab.
6.  **Global Actions:**
    *   "Save All to Profile" Button: Prominently displayed. This will trigger the existing `handleSaveProfile` logic in `App.jsx`, which uses `DataManager.constructProfileData()` to serialize the current in-memory state.
    *   "Load Profile" Button: Triggers `handleLoadProfileFile` from `App.jsx`.

**Phase 3: Data Management Page UI - Create/Edit/Delete Operations**

This phase focuses on making the Detail/Edit Pane interactive.

1.  **Source Editing (`source_info`):**
    *   When a source is selected in the Sources Tab, its details appear in the Detail/Edit Pane.
    *   Form fields for: `id` (read-only for existing, editable for new in-memory if manual ID is desired, otherwise auto-generated), `name`, `author`, `color` (using a color picker component), `description_short`, `article_full.current` (textarea or basic rich text editor).
    *   "Save Source Changes" button: Calls the new `DataManager.updateSourceInfo` or `DataManager.addSource` for new in-memory sources.
2.  **Entity Editing (Events, Characters, Places, Themes):**
    *   When an entity is selected from its respective list, the Detail/Edit Pane shows a form with all its properties.
    *   **Input Types:** Use appropriate HTML input types (`text`, `date`, `number`, `textarea`) and custom components (e.g., for `color`, multi-select for ID arrays).
    *   **Event Form Example:**
        *   `id` (read-only for existing, auto-generated/user-input for new)
        *   `title` (text)
        *   `date_type` (select: "single", "period")
        *   `start_date`, `end_date` (date inputs)
        *   `characters_ids` (multi-select dropdown populated from `DataManager.getAllCharacters()`, filtered by current source or all sources)
        *   `place_id` (dropdown populated from `DataManager.getAllPlaces()`)
        *   `longitude`, `latitude` (number inputs, potentially auto-filled if a place with coords is selected)
        *   `main_theme_id` (dropdown populated from `DataManager.getAllThemes()`)
        *   `secondary_tags_ids` (multi-select for themes)
        *   `description_short` (textarea)
        *   `article_full.current` (large textarea or simple rich text editor)
    *   **Linked IDs:** For fields like `character_ids`, `place_id`, `main_theme_id`, provide user-friendly selectors (dropdowns, searchable selects) populated from the relevant `DataManager` getters.
    *   "Save Entity Changes" button: Calls the appropriate `DataManager.update[EntityType]InSource` or `DataManager.add[EntityType]ToSource` function.
    *   "Delete Entity" button: Calls the appropriate `DataManager.delete[EntityType]FromSource` function, with a confirmation dialog.
3.  **Entity Creation:**
    *   "Create New..." buttons on each tab will present a blank version of the Detail/Edit form.
    *   For entities tied to a source (Events, Characters, Places), the user must first select or create a parent source.
    *   "Create Entity" button on the form calls the relevant `DataManager.add...` function.
4.  **`article_full` Editing:**
    *   Use a sufficiently large textarea. Consider a simple Markdown editor or a basic rich text editor component for better formatting control of the `current` (and `previous`, if used) fields.
5.  **ID Handling in UI:**
    *   For new entities, `id` fields should ideally be auto-suggested (e.g., based on title, or a simple counter per source) or auto-generated by `DataManager` to ensure uniqueness within their scope. The UI could allow overriding if necessary, with validation.
    *   Display `globalId` for reference where helpful, but primary editing focuses on local `id` and other content fields.

**Visual Design and Workflow Considerations:**

*   **Clear "Unsaved Changes" Indicator:** The UI must clearly show if there are pending in-memory changes that have not yet been saved to a Profile. This could be a global indicator or per-tab/per-item.
*   **User-Friendly Forms:** Forms need to be well-organized, with clear labels, input validation (e.g., date formats, required fields), and helpful error messages.
*   **Component Reusability:** Design form components that can be reused for similar field types across different entities.
*   **Performance:** For large datasets, ensure list rendering and filtering are performant.
*   **Confirmation Dialogs:** Use for delete operations and potentially for unloading sources with unsaved changes.

## Conceptual Data Flow Diagram

```mermaid
graph TD
    A[App.jsx Main UI State] -- Loads/Saves Profile --> B(Profile File .json);
    A -- Manages/Reads from --> C{DataManager.js In-Memory State};
    C -- Populated by --> D[Loaded Source Files .json via App.jsx];
    C -- Populated by --> B[Loaded Profile Data via App.jsx];

    E[Data Management Page UI] -- Reads current data from --> C;
    E -- Stages edits/creations/deletions in --> C_Staged(DataManager.js In-Memory State);
    %% Note: C_Staged is the same as C, but emphasizing it's being modified by E
    
    E -- "Save All to Profile" action --> A; %% App.jsx then uses C (which is C_Staged) to build profile

    subgraph DataManager.js In-Memory State (C)
        direction LR
        SINFO[allSourcesInfo]
        EVT[allEvents]
        CHAR[allCharacters]
        PLC[allPlaces]
        THM[allThemes]
    end

    subgraph "Data Management Page UI (React Components)"
        direction TB
        NAV[Main Navigation: Sources | Events | Chars | Places | Themes]
        
        NAV -- Selects Tab --> LIST_PANEL[List Pane: Shows items of selected type]
        LIST_PANEL -- Selects Item / Create New --> DETAIL_EDIT_PANEL[Detail/Edit Pane: Form for item]
        
        DETAIL_EDIT_PANEL -- User Edits --> TEMP_FORM_STATE[Temporary Form State];
        TEMP_FORM_STATE -- "Save Item Changes" --> E_CALLS_DM[UI calls DataManager CRUD funcs];
        E_CALLS_DM -- Modifies --> C;
        
        LIST_PANEL -- "Delete Item" --> E_CALLS_DM_DELETE[UI calls DataManager delete funcs];
        E_CALLS_DM_DELETE -- Modifies --> C;
    end

    F[Main App View (Map/Timeline)] -- Reads data from --> C;
    %% F is NOT live-updated by E's direct modifications to C.
    %% F re-renders based on C when App.jsx state changes (e.g., after profile load).
```

This plan provides a solid foundation for developing the Data Management Page.