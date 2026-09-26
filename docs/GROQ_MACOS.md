# BridgeClip Groq macOS build

This fork adds **Groq** as a separate AI provider. In Settings → API keys, save a
Groq key and select Groq. Quality and Economy then use Groq for clip planning,
word-timed Whisper transcription, optional layout vision, and automatic social
metadata. OpenRouter remains available. Advanced model selection uses the
OpenRouter catalog and is disabled while Groq is selected.

## macOS installer

The `Build BridgeClip Groq for macOS` GitHub Actions workflow builds Apple
silicon and Intel DMGs from this fork. Run it from the Actions tab; download
the `BridgeClip-Groq-macOS-arm64` or `BridgeClip-Groq-macOS-x64` artifact from
the completed run and open the DMG inside. The build stages its own Python,
FFmpeg, and yt-dlp runtime for each architecture and runs checks before
packaging. A Groq key is entered after installation; no key is built in.

These are **unsigned local builds**, not official BridgeMind releases. They
have a separate app ID and data folder, do not auto-update, and may require
macOS to approve opening an app from an unidentified developer. A signed,
notarized public release requires an Apple Developer ID and notarization
credentials held by the publisher.

For a local build on a Mac of the matching architecture:

```sh
brew install pkg-config libass nasm
npm ci
bash scripts/prepare-resources.sh arm64 # use x64 on Intel
npm run typecheck
npm run lint
npm run build
CSC_IDENTITY_AUTO_DISCOVERY=false npx electron-builder --mac --arm64 --publish never --config electron-builder.groq-mac.yml
```

Use `--x64` on Intel. DMGs are written to `dist/`.
