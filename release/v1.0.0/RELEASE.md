# No Agenda Time Machine v1.0.0

**Release Date:** 2026-07-11
**Status:** Production Ready

## What's Included

| File | Description | Lines |
|------|-------------|-------|
| `recorderd.py` | Python stream recorder | 385 |
| `index.html` | Static web player | 730 |
| `start.sh` | Screen session launcher | 81 |

## Deployment to alertcraft.com

### Prerequisites

```bash
# SSH into alertcraft.com
ssh user@alertcraft.com
```

### Step 1: Create Directory Structure

```bash
sudo mkdir -p /var/www/html/noagendatimemachine/audio/segments
sudo chown -R www-data:www-data /var/www/html/noagendatimemachine
```

### Step 2: Upload Files

```bash
# From local machine, upload files
scp recorderd.py user@alertcraft.com:/var/www/html/noagendatimemachine/audio/
scp index.html user@alertcraft.com:/var/www/html/noagendatimemachine/
scp start.sh user@alertcraft.com:/var/www/html/noagendatimemachine/audio/
```

### Step 3: Set Permissions

```bash
ssh user@alertcraft.com
cd /var/www/html/noagendatimemachine/audio
chmod +x start.sh
chmod +x recorderd.py
```

### Step 4: Configure (Edit recorderd.py)

```bash
nano /var/www/html/noagendatimemachine/audio/recorderd.py
```

Verify these settings:
```python
STREAM_URL = "https://listen.noagendastream.com/noagenda?type=.mp3"
WEB_DIR = "/var/www/html/noagendatimemachine"
MAX_AGE = 72 * 3600
```

### Step 5: Start the Recorder

```bash
cd /var/www/html/noagendatimemachine/audio
./start.sh
```

### Step 6: Verify

```bash
# Check screen session
screen -list | grep noagendarecorder

# Attach to view logs
screen -r noagendarecorder
# Press Ctrl+A, D to detach

# Check web interface
curl http://alertcraft.com/noagendatimemachine/
```

## Release Notes

### Features
- ✅ 12-hour clock format with date display (Feature #2)
- ✅ Continuous stream recording with automatic segmentation
- ✅ Time-shifted playback (72-hour retention)
- ✅ Dual-buffer audio player for smooth transitions
- ✅ Live edge handling with 30-second offset

### Bug Fixes
- ✅ Bug 1: Live Edge Stalling - Fixed with state synchronization and recovery limiting
- ✅ Bug 2: Previous Track Freezing - Fixed with player switching mechanism
- ✅ Bug 3: Next Track Button - Fixed with corrected segment indexing

### Known Limitations
- No multi-stream support (single No Agenda stream only)
- No authentication (public access)
- Fixed 72-hour retention window

## Changelog

### v1.0.0 (2026-07-11)
- Initial production release
- All 3 critical bugs fixed
- Feature #2: 12-hour time format implemented
- Validated with 15 automated tests

## Testing

Automated test results for this release:
- Unit tests: 10/10 passed
- Playwright browser tests: 5/5 passed
- Manual validation: All bugs confirmed fixed

## Support

For issues or questions, see the main repository README.md
