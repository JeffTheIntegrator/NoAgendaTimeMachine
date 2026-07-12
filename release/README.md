# No Agenda Time Machine - Releases

This directory contains versioned release packages ready for deployment to alertcraft.com.

## Structure

```
release/
├── README.md (this file)
└── v1.0.0/
    ├── RELEASE.md          # Release notes and deployment guide
    ├── recorderd.py        # Python stream recorder (385 lines)
    ├── index.html          # Web player with 12-hour time format
    └── start.sh            # Screen launcher script
```

## Quick Deploy

```bash
# Upload to alertcraft.com
scp release/v1.0.0/* user@alertcraft.com:/tmp/

# SSH and deploy
ssh user@alertcraft.com
sudo mkdir -p /var/www/html/noagendatimemachine/audio/segments
sudo cp /tmp/recorderd.py /var/www/html/noagendatimemachine/audio/
sudo cp /tmp/index.html /var/www/html/noagendatimemachine/
sudo cp /tmp/start.sh /var/www/html/noagendatimemachine/audio/
sudo chmod +x /var/www/html/noagendatimemachine/audio/*.{sh,py}
cd /var/www/html/noagendatimemachine/audio && ./start.sh
```

## Version History

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| v1.0.0 | 2026-07-11 | ✅ Stable | Initial production release. All bugs fixed. Feature #2 complete. |

See individual version directories for detailed release notes.
