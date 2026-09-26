# BridgeClip Groq macOS build

This fork adds **Groq** as a separate AI provider. In Settings → API keys, save a
Groq key and select Groq. Quality and Economy then use Groq for clip planning,
word-timed Whisper transcription, optional layout vision, and automatic social
metadata. OpenRouter remains available. Advanced model selection uses the
OpenRouter catalog and is disabled while Groq is selected.

## macOS installer

The `Build BridgeClip Groq for macOS` GitHub Actions workflow builds a macOS 15
Apple silicon DMG from this fork. After a successful build, the publish
workflow puts the DMG on the fork's public Releases page for direct sharing.
The build stages its own Python, FFmpeg, and yt-dlp runtime and runs checks
before packaging. A Groq key is entered after installation; no key is built in.

These are **ad-hoc signed local builds**, not official BridgeMind releases.
The build checks the app bundle signature before publishing. They have a
separate app ID and data folder, do not auto-update, and may require macOS to
approve opening an app from an unidentified developer in System Settings →
Privacy & Security. An Apple notarized public release requires an Apple
Developer ID and notarization credentials held by the publisher.

For a local build on an Apple silicon Mac:

```sh
brew install pkg-config libass nasm
npm ci
bash scripts/prepare-resources.sh arm64
npm run typecheck
npm run lint
npm run build
CSC_IDENTITY_AUTO_DISCOVERY=false npx electron-builder --mac --arm64 --publish never --config electron-builder.groq-mac.yml
```

DMGs are written to `dist/`.
