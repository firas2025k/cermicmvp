firas@firass-Air ceramic % pnpm dev

> ceramic@1.0.0 dev /Users/firas/projects/amir/ceramic
> cross-env NODE_OPTIONS=--no-deprecation next dev

 ⚠ Warning: Found multiple lockfiles. Selecting /Users/firas/projects/amir/pnpm-lock.yaml.
   Consider removing the lockfiles at:
   * /Users/firas/projects/amir/ceramic/pnpm-lock.yaml

   ▲ Next.js 15.4.8
   - Local:        http://localhost:3000
   - Network:      http://192.168.1.190:3000
   - Environments: .env

 ✓ Starting...
 ✓ Ready in 4.6s
 ○ Compiling / ...
 ✓ Compiled / in 10.9s (2312 modules)
[Error: Mismatching "payload" dependency versions found: @payloadcms/plugin-cloud-storage@3.68.3 (Please change this to 3.66.0). All "payload" packages must have the same version. This is an error with your set-up, not a bug in Payload. Please go to your package.json and ensure all "payload" packages have the same version.]
 ⨯ unhandledRejection: [Error: Mismatching "payload" dependency versions found: @payloadcms/plugin-cloud-storage@3.68.3 (Please change this to 3.66.0). All "payload" packages must have the same version. This is an error with your set-up, not a bug in Payload. Please go to your package.json and ensure all "payload" packages have the same version.]
 ⨯ unhandledRejection:  [Error: Mismatching "payload" dependency versions found: @payloadcms/plugin-cloud-storage@3.68.3 (Please change this to 3.66.0). All "payload" packages must have the same version. This is an error with your set-up, not a bug in Payload. Please go to your package.json and ensure all "payload" packages have the same version.]
[✓] Pulling schema from database...
[17:25:14] WARN: No email adapter provided. Email will be written to console. More info at https://payloadcms.com/docs/email/overview.
Header data: {
  "id": 1,
  "navItems": [
    {
      "id": "693168806fec1e5efa6efaac",
      "link": {
        "type": "custom",
        "newTab": null,
        "url": "/shop",
        "label": "Our shop"
      }
    }
  ],
  "updatedAt": "2025-12-04T10:55:23.888Z",
  "createdAt": "2025-12-04T10:55:23.888Z",
  "globalType": "header"
}
Nav items: [
  {
    id: '693168806fec1e5efa6efaac',
    link: { type: 'custom', newTab: null, url: '/shop', label: 'Our shop' }
  }
]
Nav items length: 1
 GET / 200 in 41869ms
 ○ Compiling /api/[...slug] ...
 ⨯ upstream image response timed out for http://localhost:3000/api/media/file/arcana-4K-1.webp
[Error: "url" parameter is valid but upstream response timed out] {
  statusCode: 504
}
 ✓ Compiled /[slug] in 18.1s (3046 modules)
Generating import map
No new imports found, skipping writing import map
Header data: {
  "id": 1,
  "navItems": [
    {
      "id": "693168806fec1e5efa6efaac",
      "link": {
        "type": "custom",
        "newTab": null,
        "url": "/shop",
        "label": "Our shop"
      }
    }
  ],
  "updatedAt": "2025-12-04T10:55:23.888Z",
  "createdAt": "2025-12-04T10:55:23.888Z",
  "globalType": "header"
}
Nav items: [
  {
    id: '693168806fec1e5efa6efaac',
    link: { type: 'custom', newTab: null, url: '/shop', label: 'Our shop' }
  }
]
Nav items length: 1
Header data: {
  "id": 1,
  "navItems": [
    {
      "id": "693168806fec1e5efa6efaac",
      "link": {
        "type": "custom",
        "newTab": null,
        "url": "/shop",
        "label": "Our shop"
      }
    }
  ],
  "updatedAt": "2025-12-04T10:55:23.888Z",
  "createdAt": "2025-12-04T10:55:23.888Z",
  "globalType": "header"
}
Nav items: [
  {
    id: '693168806fec1e5efa6efaac',
    link: { type: 'custom', newTab: null, url: '/shop', label: 'Our shop' }
  }
]
Nav items length: 1
 GET / 200 in 18954ms
 GET / 200 in 1632ms
 GET /api/media/file/Berlin-4K-1.webp 200 in 5235ms
 GET /api/users/me?depth=0&select%5Bid%5D=true&select%5Bcarts%5D=true 200 in 25311ms
 GET /api/users/me 200 in 25335ms
 GET /api/users/me 200 in 5819ms
/Users/firas/projects/amir/ceramic/node_modules/.pnpm/payload@3.66.0_graphql@16.12.0_typescript@5.7.2/node_modules/payload/src/utilities/dependencies/dependencyChecker.ts:63
          throw new Error(
                ^


Error: Mismatching "payload" dependency versions found: @payloadcms/plugin-cloud-storage@3.68.3 (Please change this to 3.66.0). All "payload" packages must have the same version. This is an error with your set-up, not a bug in Payload. Please go to your package.json and ensure all "payload" packages have the same version.
    at checkDependencies (file:///Users/firas/projects/amir/ceramic/node_modules/.pnpm/payload@3.66.0_graphql@16.12.0_typescript@5.7.2/node_modules/payload/dist/utilities/dependencies/dependencyChecker.js:22:27)

Node.js v22.20.0
 GET /api/carts/1?depth=2&populate%5Bproducts%5D%5BpriceInUSD%5D=true&populate%5Bproducts%5D%5Bslug%5D=true&populate%5Bproducts%5D%5Btitle%5D=true&populate%5Bproducts%5D%5Bgallery%5D=true&populate%5Bproducts%5D%5Binventory%5D=true&populate%5Bproducts%5D%5BpriceInEUR%5D=true&populate%5Bvariants%5D%5Boptions%5D=true&populate%5Bvariants%5D%5BpriceInUSD%5D=true&populate%5Bvariants%5D%5Btitle%5D=true&populate%5Bvariants%5D%5Binventory%5D=true&populate%5Bvariants%5D%5BpriceInEUR%5D=true&select%5Bitems%5D=true&select%5Bsubtotal%5D=true 200 in 25670ms
 GET /api/addresses?depth=0&limit=0&pagination=false 200 in 339ms
/Users/firas/projects/amir/ceramic/node_modules/.pnpm/payload@3.66.0_graphql@16.12.0_typescript@5.7.2/node_modules/payload/src/utilities/dependencies/dependencyChecker.ts:63
          throw new Error(
                ^


Error: Mismatching "payload" dependency versions found: @payloadcms/plugin-cloud-storage@3.68.3 (Please change this to 3.66.0). All "payload" packages must have the same version. This is an error with your set-up, not a bug in Payload. Please go to your package.json and ensure all "payload" packages have the same version.
    at checkDependencies (file:///Users/firas/projects/amir/ceramic/node_modules/.pnpm/payload@3.66.0_graphql@16.12.0_typescript@5.7.2/node_modules/payload/dist/utilities/dependencies/dependencyChecker.js:22:27)

Node.js v22.20.0
 ⨯ [Error: Jest worker encountered 2 child process exceptions, exceeding retry limit] {
  type: 'WorkerError',
  page: '/favicon.svg'
}
 ○ Compiling /_error ...
 ✓ Compiled /_error in 10.6s (3374 modules)
 GET /favicon.svg 500 in 49607ms
Header data: {
  "id": 1,
  "navItems": [
    {
      "id": "693168806fec1e5efa6efaac",
      "link": {
        "type": "custom",
        "newTab": null,
        "url": "/shop",
        "label": "Our shop"
      }
    }
  ],
  "updatedAt": "2025-12-04T10:55:23.888Z",
  "createdAt": "2025-12-04T10:55:23.888Z",
  "globalType": "header"
}
Nav items: [
  {
    id: '693168806fec1e5efa6efaac',
    link: { type: 'custom', newTab: null, url: '/shop', label: 'Our shop' }
  }
]
Nav items length: 1
 GET / 200 in 7463ms
Header data: {
  "id": 1,
  "navItems": [
    {
      "id": "693168806fec1e5efa6efaac",
      "link": {
        "type": "custom",
        "newTab": null,
        "url": "/shop",
        "label": "Our shop"
      }
    }
  ],
  "updatedAt": "2025-12-04T10:55:23.888Z",
  "createdAt": "2025-12-04T10:55:23.888Z",
  "globalType": "header"
}
Nav items: [
  {
    id: '693168806fec1e5efa6efaac',
    link: { type: 'custom', newTab: null, url: '/shop', label: 'Our shop' }
  }
]
Nav items length: 1
 GET / 200 in 1792ms
 GET /api/media/file/Berlin-4K-1.webp 200 in 219ms
 GET /api/media/file/Berlin-4K-1.webp 200 in 80ms
 ✓ Compiled in 2.3s (1051 modules)
Generating import map
No new imports found, skipping writing import map
 ✓ Compiled in 960ms (1051 modules)
Generating import map
No new imports found, skipping writing import map
Header data: {
  "id": 1,
  "navItems": [
    {
      "id": "693168806fec1e5efa6efaac",
      "link": {
        "type": "custom",
        "newTab": null,
        "url": "/shop",
        "label": "Our shop"
      }
    }
  ],
  "updatedAt": "2025-12-04T10:55:23.888Z",
  "createdAt": "2025-12-04T10:55:23.888Z",
  "globalType": "header"
}
Nav items: [
  {
    id: '693168806fec1e5efa6efaac',
    link: { type: 'custom', newTab: null, url: '/shop', label: 'Our shop' }
  }
]
Nav items length: 1
Header data: {
  "id": 1,
  "navItems": [
    {