2026-05-09 16:51:32.791 [error] (node:4) Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.
In the next major version (pg-connection-string v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which have weaker security guarantees.

To prepare for this change:
- If you want the current behavior, explicitly use 'sslmode=verify-full'
- If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=require'

See https://www.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode definitions.
(Use `node --trace-warnings ...` to show where the warning was created)
2026-05-09 16:51:32.837 [info] [16:51:32] [33mWARN[39m: [36mNo email adapter provided. Email will be written to console. More info at https://payloadcms.com/docs/email/overview.[39m
2026-05-09 16:51:33.606 [info] [16:51:33] [31mERROR[39m: [36mError initiating payment with Stripe[39m
2026-05-09 16:51:33.606 [info] err: {
2026-05-09 16:51:33.606 [info] "type": "hI",
2026-05-09 16:51:33.606 [info] "message": "Failed query: insert into \"transactions\" (\"id\", \"payment_method\", \"stripe_customer_i_d\", \"stripe_payment_intent_i_d\", \"billing_address_title\", \"billing_address_first_name\", \"billing_address_last_name\", \"billing_address_company\", \"billing_address_address_line1\", \"billing_address_address_line2\", \"billing_address_city\", \"billing_address_state\", \"billing_address_postal_code\", \"billing_address_country\", \"billing_address_phone\", \"status\", \"customer_id\", \"customer_email\", \"order_id\", \"cart_id\", \"amount\", \"currency\", \"updated_at\", \"created_at\") values (default, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, default, $16, default, $17, $18, $19, $20, $21) returning \"id\", \"payment_method\", \"stripe_customer_i_d\", \"stripe_payment_intent_i_d\", \"billing_address_title\", \"billing_address_first_name\", \"billing_address_last_name\", \"billing_address_company\", \"billing_address_address_line1\", \"billing_address_address_line2\", \"billing_address_city\", \"billing_address_state\", \"billing_address_postal_code\", \"billing_address_country\", \"billing_address_phone\", \"status\", \"customer_id\", \"customer_email\", \"order_id\", \"cart_id\", \"amount\", \"currency\", \"updated_at\", \"created_at\"\nparams: stripe,cus_UUCVymIAcyABRa,pi_3TVE6DCD9nW9MVy01KfqVgh3,Mr.,amir,toubib,test company,rue dskasbnaks,,,vienna,,1559,AT,+4321627773500,pending,firasbentaleb@hotmail.com,7,1999,EUR,2026-05-09T16:51:33.590Z,2026-05-09T16:51:33.588Z: column \"payment_method\" of relation \"transactions\" does not exist",
2026-05-09 16:51:33.606 [info] "stack":
2026-05-09 16:51:33.606 [info] Error: Failed query: insert into "transactions" ("id", "payment_method", "stripe_customer_i_d", "stripe_payment_intent_i_d", "billing_address_title", "billing_address_first_name", "billing_address_last_name", "billing_address_company", "billing_address_address_line1", "billing_address_address_line2", "billing_address_city", "billing_address_state", "billing_address_postal_code", "billing_address_country", "billing_address_phone", "status", "customer_id", "customer_email", "order_id", "cart_id", "amount", "currency", "updated_at", "created_at") values (default, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, default, $16, default, $17, $18, $19, $20, $21) returning "id", "payment_method", "stripe_customer_i_d", "stripe_payment_intent_i_d", "billing_address_title", "billing_address_first_name", "billing_address_last_name", "billing_address_company", "billing_address_address_line1", "billing_address_address_line2", "billing_address_city", "billing_address_state", "billing_address_postal_code", "billing_address_country", "billing_address_phone", "status", "customer_id", "customer_email", "order_id", "cart_id", "amount", "currency", "updated_at", "created_at"
2026-05-09 16:51:33.606 [info] params: stripe,cus_UUCVymIAcyABRa,pi_3TVE6DCD9nW9MVy01KfqVgh3,Mr.,amir,toubib,test company,rue dskasbnaks,,,vienna,,1559,AT,+4321627773500,pending,firasbentaleb@hotmail.com,7,1999,EUR,2026-05-09T16:51:33.590Z,2026-05-09T16:51:33.588Z
2026-05-09 16:51:33.606 [info] at iT.queryWithCache (/var/task/.next/server/chunks/2916.js:214:20008)
2026-05-09 16:51:33.606 [info] at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
2026-05-09 16:51:33.607 [info] at async /var/task/.next/server/chunks/2916.js:214:23096
2026-05-09 16:51:33.607 [info] at async Object.hx [as insert] (/var/task/.next/server/chunks/2916.js:194:24081)
2026-05-09 16:51:33.607 [info] at async dT (/var/task/.next/server/chunks/2916.js:172:43620)
2026-05-09 16:51:33.607 [info] at async Object.dU [as create] (/var/task/.next/server/chunks/2916.js:172:48721)
2026-05-09 16:51:33.607 [info] at async R (/var/task/.next/server/chunks/2916.js:323:195756)
2026-05-09 16:51:33.607 [info] at async Object.initiatePayment (/var/task/.next/server/chunks/2916.js:93:104382)
2026-05-09 16:51:33.607 [info] at async /var/task/.next/server/chunks/2916.js:87:37733
2026-05-09 16:51:33.607 [info] at async q (/var/task/.next/server/chunks/5557.js:1:6332)
2026-05-09 16:51:33.607 [info] caused by: error: column "payment_method" of relation "transactions" does not exist
2026-05-09 16:51:33.607 [info] at /var/task/.next/server/chunks/2916.js:86:23356
2026-05-09 16:51:33.607 [info] at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
2026-05-09 16:51:33.607 [info] at async /var/task/.next/server/chunks/2916.js:214:23305
2026-05-09 16:51:33.607 [info] at async iT.queryWithCache (/var/task/.next/server/chunks/2916.js:214:19983)
2026-05-09 16:51:33.607 [info] at async /var/task/.next/server/chunks/2916.js:214:23096
2026-05-09 16:51:33.607 [info] at async Object.hx [as insert] (/var/task/.next/server/chunks/2916.js:194:24081)
2026-05-09 16:51:33.607 [info] at async dT (/var/task/.next/server/chunks/2916.js:172:43620)
2026-05-09 16:51:33.607 [info] at async Object.dU [as create] (/var/task/.next/server/chunks/2916.js:172:48721)
2026-05-09 16:51:33.607 [info] at async R (/var/task/.next/server/chunks/2916.js:323:195756)
2026-05-09 16:51:33.607 [info] at async Object.initiatePayment (/var/task/.next/server/chunks/2916.js:93:104382)
2026-05-09 16:51:33.607 [info] "query": "insert into \"transactions\" (\"id\", \"payment_method\", \"stripe_customer_i_d\", \"stripe_payment_intent_i_d\", \"billing_address_title\", \"billing_address_first_name\", \"billing_address_last_name\", \"billing_address_company\", \"billing_address_address_line1\", \"billing_address_address_line2\", \"billing_address_city\", \"billing_address_state\", \"billing_address_postal_code\", \"billing_address_country\", \"billing_address_phone\", \"status\", \"customer_id\", \"customer_email\", \"order_id\", \"cart_id\", \"amount\", \"currency\", \"updated_at\", \"created_at\") values (default, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, default, $16, default, $17, $18, $19, $20, $21) returning \"id\", \"payment_method\", \"stripe_customer_i_d\", \"stripe_payment_intent_i_d\", \"billing_address_title\", \"billing_address_first_name\", \"billing_address_last_name\", \"billing_address_company\", \"billing_address_address_line1\", \"billing_address_address_line2\", \"billing_address_city\", \"billing_address_state\", \"billing_address_postal_code\", \"billing_address_country\", \"billing_address_phone\", \"status\", \"customer_id\", \"customer_email\", \"order_id\", \"cart_id\", \"amount\", \"currency\", \"updated_at\", \"created_at\"",
2026-05-09 16:51:33.607 [info] "params": [
2026-05-09 16:51:33.607 [info] "stripe",
2026-05-09 16:51:33.607 [info] "cus_UUCVymIAcyABRa",
2026-05-09 16:51:33.607 [info] "pi_3TVE6DCD9nW9MVy01KfqVgh3",
2026-05-09 16:51:33.607 [info] "Mr.",
2026-05-09 16:51:33.607 [info] "amir",
2026-05-09 16:51:33.607 [info] "toubib",
2026-05-09 16:51:33.607 [info] "test company",
2026-05-09 16:51:33.607 [info] "rue dskasbnaks,",
2026-05-09 16:51:33.607 [info] "",
2026-05-09 16:51:33.607 [info] "vienna",
2026-05-09 16:51:33.607 [info] "",
2026-05-09 16:51:33.607 [info] "1559",
2026-05-09 16:51:33.607 [info] "AT",
2026-05-09 16:51:33.607 [info] "+4321627773500",
2026-05-09 16:51:33.607 [info] "pending",
2026-05-09 16:51:33.607 [info] "firasbentaleb@hotmail.com",
2026-05-09 16:51:33.607 [info] 7,
2026-05-09 16:51:33.607 [info] "1999",
2026-05-09 16:51:33.607 [info] "EUR",
2026-05-09 16:51:33.607 [info] "2026-05-09T16:51:33.590Z",
2026-05-09 16:51:33.607 [info] "2026-05-09T16:51:33.588Z"
2026-05-09 16:51:33.607 [info] ]
2026-05-09 16:51:33.607 [info] }