# Regression checks

Run `node --test mythbound/tests/regression.test.cjs` from the root using Node 20 or newer. No dependencies needed. These tests check the script loading, class data, shared portrait layout, intro timing and all four mobile transformation cleanup paths.

For visual verification, run the Playwright comparison script after installing Playwright and its browsers: `npm install --no-save playwright`, `npx playwright install chromium webkit`, then `node mythbound/tests/browser-compare.cjs`. It compares the approved baseline against the current checkout and exercises login, the three revealed Saint paths, the sealed path, both genders, ability details and world navigation. Its output goes in a temporary directory. Real iPhone hardware is still required to confirm Safari's device-specific GPU rendering.
