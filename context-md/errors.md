2026-09-14 18:27:14.302 [info] [18:27:14] [31mERROR[39m: [36m[order-emails] Failed to re-fetch order; sending with create payload[39m
2026-09-14 18:27:14.302 [info] [35morderId[39m: 4
2026-09-14 18:27:14.302 [info] err: {
2026-09-14 18:27:14.302 [info] "type": "g",
2026-09-14 18:27:14.302 [info] "message": "Not Found",
2026-09-14 18:27:14.302 [info] "stack":
2026-09-14 18:27:14.302 [info] g: Not Found
2026-09-14 18:27:14.302 [info] at u (/var/task/.next/server/chunks/1101.js:138:21408)
2026-09-14 18:27:14.302 [info] at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
2026-09-14 18:27:14.302 [info] at async bg (/var/task/.next/server/chunks/6362.js:182:276)
2026-09-14 18:27:14.302 [info] at async R (/var/task/.next/server/chunks/1101.js:323:209596)
2026-09-14 18:27:14.303 [info] at async w (/var/task/.next/server/app/api/orders/confirm-stripe/route.js:1:6571)
2026-09-14 18:27:14.303 [info] at async A (/var/task/.next/server/app/api/orders/confirm-stripe/route.js:1:8061)
2026-09-14 18:27:14.303 [info] at async rH.do (/var/task/node_modules/.pnpm/next@15.5.12_@babel+core@7.29.0_@playwright+test@1.56.1_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:5:21048)
2026-09-14 18:27:14.303 [info] at async rH.handle (/var/task/node_modules/.pnpm/next@15.5.12_@babel+core@7.29.0_@playwright+test@1.56.1_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:5:25866)
2026-09-14 18:27:14.303 [info] at async k (/var/task/.next/server/app/api/orders/confirm-stripe/route.js:1:11163)
2026-09-14 18:27:14.303 [info] at async rH.handleResponse (/var/task/node_modules/.pnpm/next@15.5.12_@babel+core@7.29.0_@playwright+test@1.56.1_react-dom@19.2.1_react@19.2.1__react@19.2.1_sass@1.77.4/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:1:110676)
2026-09-14 18:27:14.303 [info] "data": null,
2026-09-14 18:27:14.303 [info] "isOperational": true,
2026-09-14 18:27:14.303 [info] "isPublic": true,
2026-09-14 18:27:14.303 [info] "status": 404,
2026-09-14 18:27:14.303 [info] "name": "g"
2026-09-14 18:27:14.303 [info] }
2026-09-14 18:27:14.705 [info] [18:27:14] [31mERROR[39m: [36m[order-emails] Invoice/PDF failed — sending confirmation without attachment[39m
2026-09-14 18:27:14.705 [info] [35morderId[39m: 4
2026-09-14 18:27:14.705 [info] err: {
2026-09-14 18:27:14.705 [info] "type": "hI",
2026-09-14 18:27:14.705 [info] "message": "Failed query: insert into \"invoices\" (\"id\", \"number\", \"order_id\", \"customer_email\", \"issued_at\", \"currency\", \"amount_gross\", \"amount_net\", \"amount_tax\", \"shipping_cents\", \"pdf_id\", \"updated_at\", \"created_at\") values (default, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) returning \"id\", \"number\", \"order_id\", \"customer_email\", \"issued_at\", \"currency\", \"amount_gross\", \"amount_net\", \"amount_tax\", \"shipping_cents\", \"pdf_id\", \"updated_at\", \"created_at\"\nparams: NABEA-2026-0001,4,firasbentaleb@hotmail.com,2026-09-14T18:27:14.299Z,EUR,2499,2083,416,0,177,2026-09-14T18:27:14.684Z,2026-09-14T18:27:14.684Z: insert or update on table \"invoices\" violates foreign key constraint \"invoices_order_id_orders_id_fk\"",
2026-09-14 18:27:14.705 [info] "stack":
2026-09-14 18:27:14.705 [info] Error: Failed query: insert into "invoices" ("id", "number", "order_id", "customer_email", "issued_at", "currency", "amount_gross", "amount_net", "amount_tax", "shipping_cents", "pdf_id", "updated_at", "created_at") values (default, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) returning "id", "number", "order_id", "customer_email", "issued_at", "currency", "amount_gross", "amount_net", "amount_tax", "shipping_cents", "pdf_id", "updated_at", "created_at"
2026-09-14 18:27:14.705 [info] params: NABEA-2026-0001,4,firasbentaleb@hotmail.com,2026-09-14T18:27:14.299Z,EUR,2499,2083,416,0,177,2026-09-14T18:27:14.684Z,2026-09-14T18:27:14.684Z
2026-09-14 18:27:14.705 [info] at iT.queryWithCache (/var/task/.next/server/chunks/1101.js:214:20008)
2026-09-14 18:27:14.705 [info] at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
2026-09-14 18:27:14.705 [info] at async /var/task/.next/server/chunks/1101.js:214:23096
2026-09-14 18:27:14.705 [info] at async Object.hx [as insert] (/var/task/.next/server/chunks/1101.js:194:24081)
2026-09-14 18:27:14.705 [info] at async dT (/var/task/.next/server/chunks/1101.js:172:43620)
2026-09-14 18:27:14.705 [info] at async Object.dU [as create] (/var/task/.next/server/chunks/1101.js:172:48721)
2026-09-14 18:27:14.705 [info] at async R (/var/task/.next/server/chunks/1101.js:323:208678)
2026-09-14 18:27:14.705 [info] at async n (/var/task/.next/server/chunks/6362.js:65:38890)
2026-09-14 18:27:14.705 [info] at async a2 (/var/task/.next/server/chunks/6362.js:65:39354)
2026-09-14 18:27:14.705 [info] at async bf (/var/task/.next/server/chunks/6362.js:123:1367)
2026-09-14 18:27:14.705 [info] caused by: error: insert or update on table "invoices" violates foreign key constraint "invoices_order_id_orders_id_fk"
2026-09-14 18:27:14.705 [info] at /var/task/.next/server/chunks/1101.js:86:23604
2026-09-14 18:27:14.705 [info] at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
2026-09-14 18:27:14.705 [info] at async /var/task/.next/server/chunks/1101.js:214:23305
2026-09-14 18:27:14.705 [info] at async iT.queryWithCache (/var/task/.next/server/chunks/1101.js:214:19983)
2026-09-14 18:27:14.705 [info] at async /var/task/.next/server/chunks/1101.js:214:23096
2026-09-14 18:27:14.705 [info] at async Object.hx [as insert] (/var/task/.next/server/chunks/1101.js:194:24081)
2026-09-14 18:27:14.705 [info] at async dT (/var/task/.next/server/chunks/1101.js:172:43620)
2026-09-14 18:27:14.705 [info] at async Object.dU [as create] (/var/task/.next/server/chunks/1101.js:172:48721)
2026-09-14 18:27:14.705 [info] at async R (/var/task/.next/server/chunks/1101.js:323:208678)
2026-09-14 18:27:14.706 [info] at async n (/var/task/.next/server/chunks/6362.js:65:38890)
2026-09-14 18:27:14.706 [info] "query": "insert into \"invoices\" (\"id\", \"number\", \"order_id\", \"customer_email\", \"issued_at\", \"currency\", \"amount_gross\", \"amount_net\", \"amount_tax\", \"shipping_cents\", \"pdf_id\", \"updated_at\", \"created_at\") values (default, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) returning \"id\", \"number\", \"order_id\", \"customer_email\", \"issued_at\", \"currency\", \"amount_gross\", \"amount_net\", \"amount_tax\", \"shipping_cents\", \"pdf_id\", \"updated_at\", \"created_at\"",
2026-09-14 18:27:14.706 [info] "params": [
2026-09-14 18:27:14.706 [info] "NABEA-2026-0001",
2026-09-14 18:27:14.706 [info] 4,
2026-09-14 18:27:14.706 [info] "firasbentaleb@hotmail.com",
2026-09-14 18:27:14.706 [info] "2026-09-14T18:27:14.299Z",
2026-09-14 18:27:14.706 [info] "EUR",
2026-09-14 18:27:14.706 [info] "2499",
2026-09-14 18:27:14.706 [info] "2083",
2026-09-14 18:27:14.706 [info] "416",
2026-09-14 18:27:14.706 [info] "0",
2026-09-14 18:27:14.706 [info] 177,
2026-09-14 18:27:14.706 [info] "2026-09-14T18:27:14.684Z",
2026-09-14 18:27:14.706 [info] "2026-09-14T18:27:14.684Z"
2026-09-14 18:27:14.706 [info] ]
2026-09-14 18:27:14.706 [info] }