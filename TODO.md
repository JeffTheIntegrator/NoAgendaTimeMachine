# No Agenda Time Machine - TODO

This file tracks feature requests and UI improvements for the No Agenda Time Machine project.

---

## Feature Requests & UI Improvements (v1.3.0 Complete - 12/12)

| # | Feature / Bug | Description |
|---|---------------|-------------|
| **1** | Remove green bar | Remove the green bar on the timeline that is representing buffering | ✅ Complete (2026-07-11) |
| **2** | 12-hour clock format | Display time with 12-hour clock. Add date and day name (e.g., "Sat Jul 11") in smaller font below the time. Apply to playing time and times on either side of the timeline | ✅ Complete (2026-07-11) |
| **3** | Fixed segment title height | Reserve three rows of text for segment title. Currently the space varies with title length, causing buttons to move | ✅ Complete (2026-07-11) |
| **4** | Prevent page zoom | Prevent page from zooming in/out when tapping quickly (e.g., pressing -1min twice). Player width should match window width | ✅ Complete (2026-07-11) |
| **5** | Remove status text | Remove "paused"/"playing" text underneath the segment title | ✅ Complete (2026-07-11) |
| **6** | Live button | Add a "Live" button that starts playing as close to live as possible when touched | ✅ Complete (2026-07-11) |
| **7** | Update heading | Change heading from "No Agenda DVR" to "No Agenda Time Machine" | ✅ Complete (2026-07-11) |
| **8** | White button text/icons | Make text/icon color on buttons white, same as other white text | ✅ Complete (2026-07-11) |
| **9** | Equal button sizes | Make skip forward and backward buttons the same size as the play/pause button | ✅ Complete (2026-07-11) |
| **10** | Larger slider button | Make the slider button larger to support touch interaction on mobile devices | ✅ Complete (2026-07-11) |
| **11** | Match CSS formatting | Match CSS formatting from https://noagenda.stream/#/livestream | ✅ Complete (2026-07-11) |
| **12** | Remaining validation | Complete remaining test case validations (currently 12/16 pending) | ✅ Complete (2026-07-11) |

---

## New Features & Validation Tasks (v1.4.3) - Updated 2026-07-29

### v1.4.3 Features

| # | Feature | Description | Status |
|---|---------|-------------|--------|
| **13** | Slider drag updates title | As the slider is dragged across the timeline, change the title to the title of the segment at that dragged time position | ✅ Complete (2026-07-12) |
| **14a** | Slider improvements | Segment-based slider (finer control), swap -1h/-30s button order, remove time labels below timeline | ✅ Complete (2026-07-28) |
| **14** | Hamburger segment list | Add a hamburger button that when clicked brings up a scrollable list of segments with index of date/time they start (e.g., list showing start time + title, clickable to seek) | ✅ Complete (2026-07-29) |

### v1.4.0 Simplification

| # | Task | Description | Status |
|---|------|-------------|--------|
| **S1** | Consolidate index.html copies | Reduce 3 live copies (validation/, validation/production/, test_validation/) to 1 canonical + symlink. All live copies were identical. | ✅ Complete (2026-07-12) |
| **S2** | Consolidate Python/start.sh | Remove validation/noAgendaTimeMachine.py and validation/start.sh — canonical is validation/production/audio/recorderd.py and start.sh | ✅ Complete (2026-07-12) |

### Validation Tasks (Extended Playback & Navigation Stress)

| # | Validation Task | Description | Status |
|---|-----------------|-------------|--------|
| **15** | Validate 30s at live edge | Validate 30 seconds playing at live edge, look for unusual log messages and any pauses or jumps in audio playback | ⏳ Pending |
| **16** | Validate 60s random track skipping | Validate 60 seconds of playback while randomly skipping back and forth in tracks. Monitor for unusual log messages or stopping of playback or playing at the wrong time | ⏳ Pending |
| **17** | Validate 120s random bidirectional skipping | Validate 120 seconds of playback while randomly skipping back and forth in random forward and rearward direction. Monitor for unusual log messages or stopping of playback or playing at the wrong time | ⏳ Pending |

---

## Status Legend

- ⏳ Pending
- 🚧 In Progress
- ✅ Complete

---

*Last updated: 2026-07-29 - Feature #14 (hamburger segment list) complete for v1.5.0*

