# After Hours — browser life prototype (0.1)

Launch at /mythbound-social/life/ using GitHub Pages. Existing websites are unchanged.

- WASD / arrow keys, drag camera, scroll zoom; E near the computer or door.
- Two placeholder 3D rooms, collision bounds, local positional save, touch buttons.
- Virtual desktop embeds the real Afterhours, Mythbound, Livewire and Viewpoint sites on the same origin.
- The menu also provides direct access if WebGL is unavailable.
- Engine: Babylon.js 7.34.1 (external CDN, suitable for experimentation; self-host for production).

## Memory contract

memory.js exposes WorldMemory.player(), record(source,type,details), all(), load(), save(state), snapshot().
A random local player ID namespaces history and room state. Mythbound's existing local nickname/avatar are read, not overwritten. The journal logs actual new room events, website loads and selected interactions made through the embedded computer. It does not import historical scripted content, monitor external browsing or record messages/passwords. Existing sites' own state is unchanged. No AI, authentication, database or cross-device sync yet. Local files can be edited by users and are not a security boundary; storage may be cleared or fail.

To add another website, extend the apps registry and websiteForLocation in life.js. To integrate a separate origin, implement explicit postMessage events with origin validation or authenticated backend calls; do not pass secrets in URLs. For direct visits outside the computer, add an explicit bridge to that website's event handlers.

Future backend: authenticate accounts, authorize each event by server-side player ID, store per-player immutable events plus separate canonical lore and character knowledge, support retrieval filtered by character/visibility, export/delete, and enforce rate limits. Keep API credentials on server only. The local event schema is versioned so a future migration can import these prototype events with player consent. Never provide every character indiscriminately with all private events; use knowledge and visibility filters.

All room art is procedural graybox geometry. The friend's interior, working title and palette are provisional. No actual MMORPG combat or AI chat is present.

## Character laboratory (build 04)

Menu → Developer · Character laboratory. Edit Fighter's profile, simulate time/location/mood/relationship/events, test dialogue, audition voices, inspect structured results and export the test session. The default preview uses explicitly labeled scripted example responses; it is not AI. Browser speech is temporary, not Fighter's selected Pocket voice. Lab profile persists locally; transcripts are temporary unless exported and never enter WorldMemory. Fighter is a stationary shared-geometry avatar in the friend room only, with a nameplate and collision. No AI connects to his in-world entity yet.

### Optional live local tests

From a local checkout of the repository, serve the root using `python -m http.server 3000 --bind 127.0.0.1`, then open http://localhost:3000/life/ (use localhost, not the GitHub Pages URL). Install Ollama separately, run `ollama pull qwen3:4b` (or another installed model) and start Ollama. If necessary configure OLLAMA_ORIGINS=http://localhost:3000 before starting it. Install Pocket TTS following Kyutai's instructions, including any required model access, and run `uvx pocket-tts serve` (port 8000). The Pocket server must permit the localhost:3000 origin. Choose the respective live providers in the lab; check local services first. Marius and Javert are only audition candidates, not an approved final casting. The lab sends only the manually entered personality, test context and recent live test turns; no real journal or secrets. Calls are restricted to localhost development, and no public backend or AI API key is deployed. Requests are buffered, not streamed yet. Actual model installation and performance are untested; GitHub Pages remains a static preview.

## Build 05 — NPC-to-NPC dialogue

Buddy is a temporary guest at Fighter's apartment, sharing avatar geometry with a green shirt. Both are stationary and have collision. Visit the apartment and start a bounded exchange (up to six live turns, four scripted preview turns), optionally adding a public remark first. Next line skips reading time, Stop cancels, opening another interface or leaving ends the exchange. Speech bubbles track the speaker's 3D position. The temporary log resets on room change/new exchange. This experiment is text-only; no autonomous scheduling, voice playback, private conversations, persistent NPC memories or action execution yet.

The lab has separate editable personalities and shared provider/model selection. On GitHub Pages choose Preview; locally choose Ollama and an installed model. Both NPCs use the same loaded model; requests contain only the active character profile and public exchange, never private lab history, manual known memories, or WorldMemory. Guest placement, personalities and turn limits are provisional. Live model and renderer still require browser testing.

## Build 06 — Fighter and Chaotic

Temporary Buddy becomes Chaotic. Both have creator-defined starter personalities and separate speaking styles. Fighter's outfit sketches stay in his private profile, not Chaotic's. Public dialogue remains shared. The v2 profile loads new canon on first use, carries over the old provider/model/voice settings and manual memories, and leaves the v1 record as backup. Provider/model changes save the current profile. NPC turns use a repetition penalty and reject repeated normalized dialogue from the same speaker, retrying once before ending if necessary. The six-turn limit and stationary models remain. No persistent NPC memory or action execution yet.
