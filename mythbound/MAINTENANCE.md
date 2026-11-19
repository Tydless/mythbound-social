# Mythbound maintenance guide

This folder contains the fictional MMORPG portal. The root Afterhours project and all shared artwork/audio remain unchanged. No framework, bundler or backend is required.

## File ownership

- `index.html`: document markup, first-paint Whimble intro CSS and bootstrap, small portal controllers.
- `styles.css`, `account.css`, `world-atlas.css`: original foundation.
- `portal-layout.css`: logo, header, responsive navigation and news layout.
- `class-codex.css`: core class interface, radar, scenery and tooltips.
- `portal-polish.css`: shared visual refinements.
- `class-portrait.css`: shared portrait coordinates and early effects.
- `portal-atlas.css`, `portal-social.css`: atlas presentation and social UI overrides.
- `class-specializations.css`: Saint paths, skills, backgrounds and presentation.
- `portal-finishing.css`: carousel and Whimble footer.
- `class-mobile-effects.css`: touch-specific effects and mobile layout safeguards.
- `class-data.js`: class stats, abilities, specialization data, icons, scenes.
- `class-voice.js`: gender-specific voice lines, narrator audio lifecycle and music ducking.
- `class-transform-audio.js`: transformation sound, choir and fallbacks.
- `class-portrait-effects.js`: desktop and mobile transformation effects.
- `class-showcase.js`: active class/path/gender, UI rendering, scene lifecycle, interaction.
- `app.js`, `account.js`, `social.js`, `world-atlas.js`: existing navigation, fictional login, social UI and atlas.

## Design invariants

Preserve stylesheet order in the bootstrap; the extracted rules retain their historical cascade deliberately. Keep critical intro CSS inline so its first paint is not delayed. Shared portraits use one centered aspect-ratio stage with object-fit:contain; do not add individual offsets to compensate for source art. Standardize source canvas sizes and transparent margins instead. Preserve the existing mobile effect implementation independently of desktop. Keep existing storage keys, asset filenames, DOM IDs, event names and public integration hooks stable. Hidden legacy DOM nodes are dependencies of account/social controllers, not safe deletions.

## Workflow

Edit the existing owning file/rule before adding an override. Add next class content in class-data.js and use the existing class/path/ability renderer; no duplicated markup per class. A new class voice set follows the current filename conventions. Use a branch for maintenance, run the tests, compare desktop/mobile screenshots, and verify actual iPhone Safari before merging. Use a separate change for asset corrections.

Run `node --test mythbound/tests/regression.test.cjs` from repository root. Browser checks are described in tests/README.md.

## Scope of initial refactor

The approved working snapshot is 27cfb88559f8358e620d0d7193651a808f37b7e8. All preexisting CSS declarations and their order were retained; whitespace/comments and file boundaries changed only. No visual overrides were deleted speculatively. Further cascade deduplication and legacy DOM removal require browser coverage and belong in subsequent small commits.
