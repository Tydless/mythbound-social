# Mythbound Social — Afterhours

A small, original, mobile-friendly fictional social-media profile introducing a modern romance roleplay character.

Built with plain HTML, CSS, and JavaScript. No backend, accounts, databases, build tools, or actual advertising.

## Features
- Fictional personal profile and eight story posts (championship → injury → gaming life).
- Open posts and read scripted comments by his two best friends.
- Story highlight links, local like/follow demo, chronological toggle.
- Fictional Mythbound Online advertisement / outfit design contest.
- Finale: private Mythbound message — “Yo. I'm waiting. Come online!”
- Accessible pop-up controls with Escape and keyboard tab handling.

## Your artwork
Create an `images/` directory and upload your images, such as:
`images/champion.png`, `images/hospital.png`, `images/princess.png`.

In `script.js`, edit the corresponding entry in the `posts` array:
```js
image: "images/champion.png",
```
When empty (`image: ""`), a stylized placeholder renders instead.

To add a Mythbound ad illustration, set `ad.image` in `script.js`.

## Change the character
- `index.html`: profile, handle, bio, page layout, and highlights.
- `script.js`: post text, comments, dates, friends, advertisement, finale DM.
- `styles.css`: colors, typography, layout and mobile styling.

All present names, usernames, follower counts and posts are **temporary story placeholders**.

To link to your finished DreamJourney bot, add its URL near the top of `script.js`:
```js
const ROLEPLAY_URL = "https://your-roleplay-link";
```

## Publish with GitHub Pages
This repository is currently private; on GitHub Free, GitHub Pages requires a public repository. If you want a public website, make the repository public when you're comfortable making its contents visible.

Open repository **Settings → Pages → Build and deployment**, select **Deploy from a branch**, `main`, and `/(root)`, then save. The expected address is:

https://tydless.github.io/mythbound-social/

**Note:** the Pages address won't work until publishing is enabled and deployment succeeds.

## Privacy and use
This is fictional UI; follow, like, and comment displays are local demos only. No real user accounts, advertising, chat service, or personal data collection. Do not put private details or unreleased artwork you want to keep secret into a public repository.
