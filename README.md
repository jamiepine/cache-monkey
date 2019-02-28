# Cache Monkey

> Thats hot.

#### Build Setup

```bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build

# run unit tests
npm test


# lint all JS/Vue component files in `src/`
npm run lint

```

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).

NOTES:
Building for OSX might error with .icns that aren't "clean". This command fixes it.
https://winsmarts.com/ios-macos-code-signing-error-resource-fork-finder-information-or-similar-detritus-not-allowed-b7333a7596b5

```
// find offending files (run in project directory)
xattr -lr ./
// fix them
find . -type f -name '*.icns' -exec xattr -c {} \;
```
