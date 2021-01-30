# DisText
DisText (Discord Text) schedule generator

## Getting Started

To set up, have:
* npm (latest, at least 10.x): install with NodeJS: https://nodejs.org/en/
* stenciljs: (in this github directory, run): npm install @stencil/core@latest --save-exact
* ionic core: (in this github directory, run): npm install @ionic/core@latest --save-exact

* First time run: do npm update in order to get required dependencies
```bash
npm update
```

## Developing:

```bash
npm run-script dev
```

## To code/hack/help:

* You can merge directly to the MAIN branch, no PR needed. It will auto-deploy (after a few minutes) to https://distext.azurewebsites.net. 

## Production:

To build for production, run:

```bash
npm run-script build
```