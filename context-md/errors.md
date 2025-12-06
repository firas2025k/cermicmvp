# console error
main-app.js?v=1764870647559:1137 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
AddToCart.tsx:44  POST http://localhost:3000/api/carts?depth=2&populate%5Bproducts%5D%5BpriceInUSD%5D=true&populate%5Bproducts%5D%5Bslug%5D=true&populate%5Bproducts%5D%5Btitle%5D=true&populate%5Bproducts%5D%5Bgallery%5D=true&populate%5Bproducts%5D%5Binventory%5D=true&populate%5Bproducts%5D%5BpriceInEUR%5D=true&populate%5Bvariants%5D%5Boptions%5D=true&populate%5Bvariants%5D%5BpriceInUSD%5D=true&populate%5Bvariants%5D%5Btitle%5D=true&populate%5Bvariants%5D%5Binventory%5D=true&populate%5Bvariants%5D%5BpriceInEUR%5D=true&select%5Bitems%5D=true&select%5Bsubtotal%5D=true 400 (Bad Request)
EcommerceProvider.useCallback[createCart] @ index.js:115
EcommerceProvider.useCallback[addItem] @ index.js:273
AddToCart.useCallback[addToCart] @ AddToCart.tsx:44
executeDispatch @ react-dom-client.development.js:16922
runWithFiberInDEV @ react-dom-client.development.js:873
processDispatchQueue @ react-dom-client.development.js:16972
eval @ react-dom-client.development.js:17573
batchedUpdates$1 @ react-dom-client.development.js:3313
dispatchEventForPluginEventSystem @ react-dom-client.development.js:17126
dispatchEvent @ react-dom-client.development.js:21309
dispatchDiscreteEvent @ react-dom-client.development.js:21277
<button>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:345
Button @ button.tsx:47
react_stack_bottom_frame @ react-dom-client.development.js:23553
renderWithHooksAgain @ react-dom-client.development.js:6864
renderWithHooks @ react-dom-client.development.js:6776
updateFunctionComponent @ react-dom-client.development.js:9070
beginWork @ react-dom-client.development.js:10680
runWithFiberInDEV @ react-dom-client.development.js:873
performUnitOfWork @ react-dom-client.development.js:15678
workLoopSync @ react-dom-client.development.js:15498
renderRootSync @ react-dom-client.development.js:15478
performWorkOnRoot @ react-dom-client.development.js:14942
performSyncWorkOnRoot @ react-dom-client.development.js:16782
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:16628
processRootScheduleInMicrotask @ react-dom-client.development.js:16666
eval @ react-dom-client.development.js:16801
<Button>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:345
AddToCart @ AddToCart.tsx:103
react_stack_bottom_frame @ react-dom-client.development.js:23553
renderWithHooksAgain @ react-dom-client.development.js:6864
renderWithHooks @ react-dom-client.development.js:6776
updateFunctionComponent @ react-dom-client.development.js:9070
beginWork @ react-dom-client.development.js:10680
runWithFiberInDEV @ react-dom-client.development.js:873
performUnitOfWork @ react-dom-client.development.js:15678
workLoopSync @ react-dom-client.development.js:15498
renderRootSync @ react-dom-client.development.js:15478
performWorkOnRoot @ react-dom-client.development.js:14942
performSyncWorkOnRoot @ react-dom-client.development.js:16782
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:16628
processRootScheduleInMicrotask @ react-dom-client.development.js:16666
eval @ react-dom-client.development.js:16801
<AddToCart>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:345
ProductDescription @ ProductDescription.tsx:118
react_stack_bottom_frame @ react-dom-client.development.js:23553
renderWithHooksAgain @ react-dom-client.development.js:6864
renderWithHooks @ react-dom-client.development.js:6776
updateFunctionComponent @ react-dom-client.development.js:9070
beginWork @ react-dom-client.development.js:10629
runWithFiberInDEV @ react-dom-client.development.js:873
performUnitOfWork @ react-dom-client.development.js:15678
workLoopConcurrentByScheduler @ react-dom-client.development.js:15672
renderRootConcurrent @ react-dom-client.development.js:15647
performWorkOnRoot @ react-dom-client.development.js:14941
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16767
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
ProductPage @ page.tsx:145
initializeElement @ react-server-dom-webpack-client.browser.development.js:1205
eval @ react-server-dom-webpack-client.browser.development.js:2828
initializeModelChunk @ react-server-dom-webpack-client.browser.development.js:1107
getOutlinedModel @ react-server-dom-webpack-client.browser.development.js:1483
parseModelString @ react-server-dom-webpack-client.browser.development.js:1820
eval @ react-server-dom-webpack-client.browser.development.js:2758
initializeModelChunk @ react-server-dom-webpack-client.browser.development.js:1107
getOutlinedModel @ react-server-dom-webpack-client.browser.development.js:1483
parseModelString @ react-server-dom-webpack-client.browser.development.js:1820
eval @ react-server-dom-webpack-client.browser.development.js:2758
initializeModelChunk @ react-server-dom-webpack-client.browser.development.js:1107
processFullStringRow @ react-server-dom-webpack-client.browser.development.js:2630
processFullBinaryRow @ react-server-dom-webpack-client.browser.development.js:2604
processBinaryChunk @ react-server-dom-webpack-client.browser.development.js:2731
progress @ react-server-dom-webpack-client.browser.development.js:2995
<ProductPage>
initializeFakeTask @ react-server-dom-webpack-client.browser.development.js:2406
resolveDebugInfo @ react-server-dom-webpack-client.browser.development.js:2431
processFullStringRow @ react-server-dom-webpack-client.browser.development.js:2632
processFullBinaryRow @ react-server-dom-webpack-client.browser.development.js:2604
processBinaryChunk @ react-server-dom-webpack-client.browser.development.js:2731
progress @ react-server-dom-webpack-client.browser.development.js:2995
"use server"
ResponseInstance @ react-server-dom-webpack-client.browser.development.js:1868
createResponseFromOptions @ react-server-dom-webpack-client.browser.development.js:2856
exports.createFromReadableStream @ react-server-dom-webpack-client.browser.development.js:3227
eval @ app-index.js:131
(app-pages-browser)/./node_modules/.pnpm/next@15.4.8_@babel+core@7.28.5_@playwright+test@1.56.1_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/client/app-index.js @ main-app.js?v=1764870647559:160
options.factory @ webpack.js:1
__webpack_require__ @ webpack.js:1
fn @ webpack.js:1
eval @ app-next-dev.js:14
eval @ app-bootstrap.js:62
eval @ app-bootstrap.js:52
Promise.then
loadScriptsInSequence @ app-bootstrap.js:51
appBootstrap @ app-bootstrap.js:56
eval @ app-next-dev.js:13
(app-pages-browser)/./node_modules/.pnpm/next@15.4.8_@babel+core@7.28.5_@playwright+test@1.56.1_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/client/app-next-dev.js @ main-app.js?v=1764870647559:182
options.factory @ webpack.js:1
__webpack_require__ @ webpack.js:1
__webpack_exec__ @ main-app.js?v=1764870647559:1801
(anonymous) @ main-app.js?v=1764870647559:1802
webpackJsonpCallback @ webpack.js:1
(anonymous) @ main-app.js?v=1764870647559:9
AddToCart.tsx:52 Error adding to cart: Error: Failed to create cart: {"errors":[{"name":"ValidationError","data":{"collection":"carts","errors":[{"label":"Currency","message":"This field has an invalid selection.","path":"currency"}]},"message":"The following field is invalid: Currency"}]}
    at EcommerceProvider.useCallback[createCart] (index.js:129:23)
    at async EcommerceProvider.useCallback[addItem] (index.js:273:33)
error @ intercept-console-error.js:57
AddToCart.useCallback[addToCart] @ AddToCart.tsx:52
Promise.catch
AddToCart.useCallback[addToCart] @ AddToCart.tsx:51
executeDispatch @ react-dom-client.development.js:16922
runWithFiberInDEV @ react-dom-client.development.js:873
processDispatchQueue @ react-dom-client.development.js:16972
eval @ react-dom-client.development.js:17573
batchedUpdates$1 @ react-dom-client.development.js:3313
dispatchEventForPluginEventSystem @ react-dom-client.development.js:17126
dispatchEvent @ react-dom-client.development.js:21309
dispatchDiscreteEvent @ react-dom-client.development.js:21277
<button>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:345
Button @ button.tsx:47
react_stack_bottom_frame @ react-dom-client.development.js:23553
renderWithHooksAgain @ react-dom-client.development.js:6864
renderWithHooks @ react-dom-client.development.js:6776
updateFunctionComponent @ react-dom-client.development.js:9070
beginWork @ react-dom-client.development.js:10680
runWithFiberInDEV @ react-dom-client.development.js:873
performUnitOfWork @ react-dom-client.development.js:15678
workLoopSync @ react-dom-client.development.js:15498
renderRootSync @ react-dom-client.development.js:15478
performWorkOnRoot @ react-dom-client.development.js:14942
performSyncWorkOnRoot @ react-dom-client.development.js:16782
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:16628
processRootScheduleInMicrotask @ react-dom-client.development.js:16666
eval @ react-dom-client.development.js:16801
<Button>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:345
AddToCart @ AddToCart.tsx:103
react_stack_bottom_frame @ react-dom-client.development.js:23553
renderWithHooksAgain @ react-dom-client.development.js:6864
renderWithHooks @ react-dom-client.development.js:6776
updateFunctionComponent @ react-dom-client.development.js:9070
beginWork @ react-dom-client.development.js:10680
runWithFiberInDEV @ react-dom-client.development.js:873
performUnitOfWork @ react-dom-client.development.js:15678
workLoopSync @ react-dom-client.development.js:15498
renderRootSync @ react-dom-client.development.js:15478
performWorkOnRoot @ react-dom-client.development.js:14942
performSyncWorkOnRoot @ react-dom-client.development.js:16782
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:16628
processRootScheduleInMicrotask @ react-dom-client.development.js:16666
eval @ react-dom-client.development.js:16801
<AddToCart>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:345
ProductDescription @ ProductDescription.tsx:118
react_stack_bottom_frame @ react-dom-client.development.js:23553
renderWithHooksAgain @ react-dom-client.development.js:6864
renderWithHooks @ react-dom-client.development.js:6776
updateFunctionComponent @ react-dom-client.development.js:9070
beginWork @ react-dom-client.development.js:10629
runWithFiberInDEV @ react-dom-client.development.js:873
performUnitOfWork @ react-dom-client.development.js:15678
workLoopConcurrentByScheduler @ react-dom-client.development.js:15672
renderRootConcurrent @ react-dom-client.development.js:15647
performWorkOnRoot @ react-dom-client.development.js:14941
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16767
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
ProductPage @ page.tsx:145
initializeElement @ react-server-dom-webpack-client.browser.development.js:1205
eval @ react-server-dom-webpack-client.browser.development.js:2828
initializeModelChunk @ react-server-dom-webpack-client.browser.development.js:1107
getOutlinedModel @ react-server-dom-webpack-client.browser.development.js:1483
parseModelString @ react-server-dom-webpack-client.browser.development.js:1820
eval @ react-server-dom-webpack-client.browser.development.js:2758
initializeModelChunk @ react-server-dom-webpack-client.browser.development.js:1107
getOutlinedModel @ react-server-dom-webpack-client.browser.development.js:1483
parseModelString @ react-server-dom-webpack-client.browser.development.js:1820
eval @ react-server-dom-webpack-client.browser.development.js:2758
initializeModelChunk @ react-server-dom-webpack-client.browser.development.js:1107
processFullStringRow @ react-server-dom-webpack-client.browser.development.js:2630
processFullBinaryRow @ react-server-dom-webpack-client.browser.development.js:2604
processBinaryChunk @ react-server-dom-webpack-client.browser.development.js:2731
progress @ react-server-dom-webpack-client.browser.development.js:2995
<ProductPage>
initializeFakeTask @ react-server-dom-webpack-client.browser.development.js:2406
resolveDebugInfo @ react-server-dom-webpack-client.browser.development.js:2431
processFullStringRow @ react-server-dom-webpack-client.browser.development.js:2632
processFullBinaryRow @ react-server-dom-webpack-client.browser.development.js:2604
processBinaryChunk @ react-server-dom-webpack-client.browser.development.js:2731
progress @ react-server-dom-webpack-client.browser.development.js:2995
"use server"
ResponseInstance @ react-server-dom-webpack-client.browser.development.js:1868
createResponseFromOptions @ react-server-dom-webpack-client.browser.development.js:2856
exports.createFromReadableStream @ react-server-dom-webpack-client.browser.development.js:3227
eval @ app-index.js:131
(app-pages-browser)/./node_modules/.pnpm/next@15.4.8_@babel+core@7.28.5_@playwright+test@1.56.1_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/client/app-index.js @ main-app.js?v=1764870647559:160
options.factory @ webpack.js:1
__webpack_require__ @ webpack.js:1
fn @ webpack.js:1
eval @ app-next-dev.js:14
eval @ app-bootstrap.js:62
eval @ app-bootstrap.js:52
Promise.then
loadScriptsInSequence @ app-bootstrap.js:51
appBootstrap @ app-bootstrap.js:56
eval @ app-next-dev.js:13
(app-pages-browser)/./node_modules/.pnpm/next@15.4.8_@babel+core@7.28.5_@playwright+test@1.56.1_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/client/app-next-dev.js @ main-app.js?v=1764870647559:182
options.factory @ webpack.js:1
__webpack_require__ @ webpack.js:1
__webpack_exec__ @ main-app.js?v=1764870647559:1801
(anonymous) @ main-app.js?v=1764870647559:1802
webpackJsonpCallback @ webpack.js:1
(anonymous) @ main-app.js?v=1764870647559:9

# terminal error 
GET /products/cartago-cermic 200 in 1142ms
[18:51:02] INFO: The following field is invalid: Currency
 POST /api/carts?depth=2&populate%5Bproducts%5D%5BpriceInUSD%5D=true&populate%5Bproducts%5D%5Bslug%5D=true&populate%5Bproducts%5D%5Btitle%5D=true&populate%5Bproducts%5D%5Bgallery%5D=true&populate%5Bproducts%5D%5Binventory%5D=true&populate%5Bproducts%5D%5BpriceInEUR%5D=true&populate%5Bvariants%5D%5Boptions%5D=true&populate%5Bvariants%5D%5BpriceInUSD%5D=true&populate%5Bvariants%5D%5Btitle%5D=true&populate%5Bvariants%5D%5Binventory%5D=true&populate%5Bvariants%5D%5BpriceInEUR%5D=true&select%5Bitems%5D=true&select%5Bsubtotal%5D=true 400 in 790ms
 ✓ Compiled in 8.5s (1618 modules)