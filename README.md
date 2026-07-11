# No Agenda Time Machine

A Python-based DVR for the No Agenda stream with time-shifted web playback.

## Features

- **Continuous Stream Recording**: Captures the No Agenda ICY audio stream 24/7
- **Automatic Segmentation**: Splits recording into MP3 segments based on metadata changes
- **Time-Shifted Playback**: Web player lets you jump back and listen to any point in the last 72 hours
- **Static HTML Player**: No backend required – pure JavaScript in the browser
- **12-Hour Time Format**: Clean, readable time display with date (e.g., "9:30:15 AM" on "Sat Jul 11")
- **Dual-Buffer Audio**: Smooth segment transitions with A/B player architecture
- **Live Edge Handling**: Automatically stays near the live stream with 30-second offset

## Architecture

```
Python Recorder (recorderd.py)
    ↓ writes
/var/www/html/noAgendaTimeMachine/
    ├── playlist.json          # Segment list
    └── audio/segments/
        ├── track_*.mp3        # Audio files
        └── track_*.json       # Metadata sidecars

Browser (index.html)
    ↓ fetches
playlist.json → segments/*.json → segments/*.mp3 → Audio playback
```

## Requirements

- Python 3.8+
- screen (for detached session management)
- Web server (nginx, apache, or Python's http.server)

## Installation

### 1. Clone or Copy Files

```bash
# Create deployment directory
sudo mkdir -p /var/www/html/noAgendaTimeMachine/audio/segments

# Copy files
cp index.html /var/www/html/noAgendaTimeMachine/
cp noAgendaTimeMachine.py /var/www/html/noAgendaTimeMachine/audio/recorderd.py
cp start.sh /var/www/html/noAgendaTimeMachine/audio/
```

### 2. Configure Permissions

```bash
# Set ownership
sudo chown -R www-data:www-data /var/www/html/noAgendaTimeMachine

# Make scripts executable
chmod +x /var/www/html/noAgendaTimeMachine/audio/*.sh
```

### 3. Configure the Recorder

Edit `/var/www/html/noAgendaTimeMachine/audio/recorderd.py`:

```python
STREAM_URL = "https://listen.noagendastream.com/noagenda?type=.mp3"
WEB_DIR = "/var/www/html/noAgendaTimeMachine"
MAX_AGE = 72 * 3600           # 72 hours retention
MAX_CHUNK_DUR = 4 * 3600      # 4 hours max per segment
METADATA_IGNORE_MIN = 5        # Ignore title flips < 5s
```

## Usage

### Starting the Recorder

```bash
cd /var/www/html/noAgendaTimeMachine/audio
./start.sh
```

### Managing the Screen Session

```bash
# Attach to view logs
screen -r noagendarecorder

# Detach (leave running)
# Press: Ctrl+A, then D

# Stop the recorder
screen -S noagendarecorder -X quit
```

### Accessing the Web Player

Open your browser to: `http://your-server/noAgendaTimeMachine/`

**Player Controls:**
- ▶️ Play/Pause button
- ⏮️ Previous track (seeks to start of current or previous segment)
- ⏭️ Next track (advances to next segment)
- Seek slider - drag to any position in the timeline
- Jump buttons: -1h, -10m, -30s, +30s, +10m, +1h

## Project Structure

```
noAgendaTimeMachine/
├── README.md
├── TODO.md                  # Feature tracking
├── .gitignore
├── .claude/                 # Claude Code configuration
│   └── CLAUDE.md
├── validation/              # Development/validation directory
│   ├── index.html           # Web player (source)
│   ├── noAgendaTimeMachine.py
│   ├── start.sh
│   ├── production/          # Deployment package
│   │   ├── index.html
│   │   └── audio/
│   │       ├── recorderd.py
│   │       └── start.sh
│   ├── tests/               # Test files
│   └── docs/                # Design documentation
└── test_validation/         # Playwright browser tests
```

## Development

### Local Testing

```bash
cd validation
python3 noAgendaTimeMachine.py

# Or use screen
./start.sh
screen -r noagendarecorder
```

### Running Tests

```bash
# Unit tests
cd validation/tests
node -e "eval(require('fs').readFileSync('feature2_test.html', 'utf8'))"

# Playwright browser tests
cd test_validation
npx playwright test tests/feature2.spec.js
```

## Configuration

### Frontend Constants (in `index.html`)

- `LIVE_EDGE_OFFSET`: 30 seconds (fixed offset from live edge)
- `PLAYLIST_URL`: `'playlist.json'`
- `POLL_INTERVAL`: 5000ms (5 seconds)

### Backend Constants (in `recorderd.py`)

- `STREAM_URL`: No Agenda stream URL
- `WEB_DIR`: Web root directory
- `MAX_AGE`: Segment retention period (default: 72 hours)
- `MAX_CHUNK_DUR`: Maximum segment duration (default: 4 hours)

## Status

| Component | Status |
|-----------|--------|
| Bug Fixes | ✅ Complete (3/3) |
| Features | 🚧 In Progress (1/12) |
| Production Ready | ✅ Yes |

**Fixed Bugs:**
- ✅ Live Edge Stalling
- ✅ Previous Track Freezing
- ✅ Next Track Button

**Completed Features:**
- ✅ Feature #2: 12-hour clock format with date display

## License

This project is provided as-is for personal use with the No Agenda stream.

## Credits

- Inspired by the [No Agenda Stream](https://noagenda.stream/)
- Built with Claude Code
