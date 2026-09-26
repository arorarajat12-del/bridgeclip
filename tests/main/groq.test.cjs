'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { loadMain, tempDir, fakeElectron } = require('../zernio/support/load-main.cjs')

test('Groq key is encrypted and selected independently of OpenRouter', () => {
  const { dir, cleanup } = tempDir()
  try {
    const store = loadMain("export * from './src/main/settings-store'", { electron: fakeElectron(dir).electron })
    store.replaceApiKey('openrouterApiKey', 'openrouter-secret')
    store.replaceApiKey('groqApiKey', 'groq-secret')
    const publicSettings = store.publicSettings(store.loadSettings())
    store.savePublicSettings({ ...publicSettings, aiProvider: 'groq' })
    const settings = store.loadSettings()
    assert.equal(settings.aiProvider, 'groq')
    assert.equal(settings.openrouterApiKey, 'openrouter-secret')
    assert.equal(settings.groqApiKey, 'groq-secret')
    assert.equal(store.getSettingsForBridge(settings).AI_PROVIDER, 'groq')
    assert.equal(store.getSettingsForBridge(settings).GROQ_API_KEY, 'groq-secret')
    assert.equal(store.getSettingsForBridge(settings).OPENROUTER_API_KEY, '')
    assert.equal(store.publicSettings(settings).groqConfigured, true)
    const saved = fs.readFileSync(path.join(dir, 'userData', 'settings.json'), 'utf8')
    assert.equal(saved.includes('groq-secret'), false)
    assert.equal(saved.includes('openrouter-secret'), false)
  } finally { cleanup() }
})

test('automatic metadata routes a Groq key only to Groq', async () => {
  const { dir, cleanup } = tempDir()
  const previous = global.fetch
  try {
    const api = loadMain("export * from './src/main/automation-metadata'; export * as settings from './src/main/settings-store'", { electron: fakeElectron(dir).electron })
    api.settings.replaceApiKey('groqApiKey', 'groq-secret')
    api.settings.savePublicSettings({ ...api.settings.publicSettings(api.settings.loadSettings()), aiProvider: 'groq' })
    let request
    global.fetch = async (url, options) => {
      request = { url, options }
      return new Response('{}', { status: 401 })
    }
    await assert.rejects(api.generateAutomationMetadata('This is a long enough transcript to ground a post.', 'Title', '', ['twitter']), /Groq rejected the API key/)
    assert.equal(request.url, 'https://api.groq.com/openai/v1/chat/completions')
    assert.equal(request.options.headers.Authorization, 'Bearer groq-secret')
    const body = JSON.parse(request.options.body)
    assert.equal(body.model, 'openai/gpt-oss-120b')
    assert.equal(body.provider, undefined)
  } finally { global.fetch = previous; cleanup() }
})
