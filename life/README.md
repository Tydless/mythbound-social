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
