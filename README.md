# pretext site

Static site files live in `docs/`.

For GitHub Pages, push this repository and set the Pages source to the branch's `/docs` folder. The local development server is optional:

```sh
npm start
```

For a static-only preview, serve the `docs/` folder directly:

```sh
npx serve docs
```

Plain `npx serve` from the repository root will redirect to `docs/`. Old `/public` URLs also redirect to `docs/`.
