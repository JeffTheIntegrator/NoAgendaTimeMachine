#!/bin/bash
# No Agenda Time Machine - Screen Launcher
# Starts the recorder in a detached screen session

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SESSION_NAME="noagendarecorder"
PYTHON_SCRIPT="$SCRIPT_DIR/noAgendaTimeMachine.py"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if screen is installed
if ! command -v screen &> /dev/null; then
    log_error "screen is not installed. Install it with: sudo apt install screen"
    exit 1
fi

# Check if Python script exists
if [ ! -f "$PYTHON_SCRIPT" ]; then
    log_error "Python script not found: $PYTHON_SCRIPT"
    exit 1
fi

# Check if session already exists
if screen -list | grep -q "$SESSION_NAME"; then
    log_warn "Session '$SESSION_NAME' already exists"
    echo "Attach with: screen -r $SESSION_NAME"
    echo "View logs: screen -r $SESSION_NAME"
    echo "Detach: Ctrl+A, then D"
    exit 0
fi

# Start the recorder in a detached screen session
log_info "Starting No Agenda Time Machine recorder..."
log_info "Session: $SESSION_NAME"
log_info "Script: $PYTHON_SCRIPT"

screen -dmS "$SESSION_NAME" python3 "$PYTHON_SCRIPT"

# Wait a moment for screen to start
sleep 1

# Verify session started
if screen -list | grep -q "$SESSION_NAME"; then
    log_info "Recorder started successfully"
    echo ""
    echo "Commands:"
    echo "  Attach to view logs:    screen -r $SESSION_NAME"
    echo "  Detach (leave running): Ctrl+A, then D"
    echo "  Stop the recorder:     screen -S $SESSION_NAME -X quit"
    echo "  List all sessions:     screen -list"
else
    log_error "Failed to start session"
    exit 1
fi
