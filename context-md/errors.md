2026-06-05 20:50:54.486 [info] [20:50:54] [31mERROR[39m: [36mFailed query: insert into "products_trust_bullets" ("_order", "_parent_id", "id", "label") values ($1, $2, $3, $4) returning "_order", "_parent_id", "id", "label"
2026-06-05 20:50:54.486 [info] params: 1,39,6a2334153665a20ab9a1a5c0,testing number 1[39m
2026-06-05 20:50:54.486 [info] err: {
2026-06-05 20:50:54.486 [info] "type": "hI",
2026-06-05 20:50:54.486 [info] "message": "Failed query: insert into \"products_trust_bullets\" (\"_order\", \"_parent_id\", \"id\", \"label\") values ($1, $2, $3, $4) returning \"_order\", \"_parent_id\", \"id\", \"label\"\nparams: 1,39,6a2334153665a20ab9a1a5c0,testing number 1: invalid input syntax for type integer: \"6a2334153665a20ab9a1a5c0\"",
2026-06-05 20:50:54.486 [info] "stack":
2026-06-05 20:50:54.486 [info] Error: Failed query: insert into "products_trust_bullets" ("_order", "_parent_id", "id", "label") values ($1, $2, $3, $4) returning "_order", "_parent_id", "id", "label"
2026-06-05 20:50:54.486 [info] params: 1,39,6a2334153665a20ab9a1a5c0,testing number 1
2026-06-05 20:50:54.486 [info] at iT.queryWithCache (/var/task/.next/server/chunks/2916.js:214:20008)
2026-06-05 20:50:54.486 [info] at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
2026-06-05 20:50:54.488 [info] at async /var/task/.next/server/chunks/2916.js:214:23096
2026-06-05 20:50:54.488 [info] at async Object.hx [as insert] (/var/task/.next/server/chunks/2916.js:194:24081)
2026-06-05 20:50:54.488 [info] at async dR (/var/task/.next/server/chunks/2916.js:172:40176)
2026-06-05 20:50:54.488 [info] at async dT (/var/task/.next/server/chunks/2916.js:172:47845)
2026-06-05 20:50:54.488 [info] at async Object.es [as updateOne] (/var/task/.next/server/chunks/2916.js:189:10762)
2026-06-05 20:50:54.488 [info] at async s (/var/task/.next/server/chunks/2916.js:135:69680)
2026-06-05 20:50:54.488 [info] at async x (/var/task/.next/server/chunks/2916.js:93:125842)
2026-06-05 20:50:54.488 [info] at async handler (/var/task/.next/server/chunks/2916.js:225:45676)
2026-06-05 20:50:54.488 [info] caused by: error: invalid input syntax for type integer: "6a2334153665a20ab9a1a5c0"
2026-06-05 20:50:54.488 [info] at /var/task/.next/server/chunks/2916.js:86:23356
2026-06-05 20:50:54.488 [info] at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
2026-06-05 20:50:54.488 [info] at async /var/task/.next/server/chunks/2916.js:214:23305
2026-06-05 20:50:54.488 [info] at async iT.queryWithCache (/var/task/.next/server/chunks/2916.js:214:19983)
2026-06-05 20:50:54.488 [info] at async /var/task/.next/server/chunks/2916.js:214:23096
2026-06-05 20:50:54.488 [info] at async Object.hx [as insert] (/var/task/.next/server/chunks/2916.js:194:24081)
2026-06-05 20:50:54.488 [info] at async dR (/var/task/.next/server/chunks/2916.js:172:40176)
2026-06-05 20:50:54.488 [info] at async dT (/var/task/.next/server/chunks/2916.js:172:47845)
2026-06-05 20:50:54.488 [info] at async Object.es [as updateOne] (/var/task/.next/server/chunks/2916.js:189:10762)
2026-06-05 20:50:54.488 [info] at async s (/var/task/.next/server/chunks/2916.js:135:69680)
2026-06-05 20:50:54.488 [info] "query": "insert into \"products_trust_bullets\" (\"_order\", \"_parent_id\", \"id\", \"label\") values ($1, $2, $3, $4) returning \"_order\", \"_parent_id\", \"id\", \"label\"",
2026-06-05 20:50:54.488 [info] "params": [
2026-06-05 20:50:54.488 [info] 1,
2026-06-05 20:50:54.488 [info] 39,
2026-06-05 20:50:54.488 [info] "6a2334153665a20ab9a1a5c0",
2026-06-05 20:50:54.488 [info] "testing number 1"
2026-06-05 20:50:54.488 [info] ]
2026-06-05 20:50:54.488 [info] }


2026-06-05 20:51:47.203 [info] [20:51:47] [31mERROR[39m: [36mFailed query: insert into "products_faq_items" ("_order", "_parent_id", "id", "question", "answer") values ($1, $2, $3, $4, $5) returning "_order", "_parent_id", "id", "question", "answer"
2026-06-05 20:51:47.203 [info] params: 1,39,6a2336d824f8407d3abeccb9,faq,dsdfssaf[39m
2026-06-05 20:51:47.203 [info] err: {
2026-06-05 20:51:47.203 [info] "type": "hI",
2026-06-05 20:51:47.203 [info] "message": "Failed query: insert into \"products_faq_items\" (\"_order\", \"_parent_id\", \"id\", \"question\", \"answer\") values ($1, $2, $3, $4, $5) returning \"_order\", \"_parent_id\", \"id\", \"question\", \"answer\"\nparams: 1,39,6a2336d824f8407d3abeccb9,faq,dsdfssaf: invalid input syntax for type integer: \"6a2336d824f8407d3abeccb9\"",
2026-06-05 20:51:47.203 [info] "stack":
2026-06-05 20:51:47.203 [info] Error: Failed query: insert into "products_faq_items" ("_order", "_parent_id", "id", "question", "answer") values ($1, $2, $3, $4, $5) returning "_order", "_parent_id", "id", "question", "answer"
2026-06-05 20:51:47.203 [info] params: 1,39,6a2336d824f8407d3abeccb9,faq,dsdfssaf
2026-06-05 20:51:47.203 [info] at iT.queryWithCache (/var/task/.next/server/chunks/2916.js:214:20008)
2026-06-05 20:51:47.203 [info] at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
2026-06-05 20:51:47.204 [info] at async /var/task/.next/server/chunks/2916.js:214:23096
2026-06-05 20:51:47.204 [info] at async Object.hx [as insert] (/var/task/.next/server/chunks/2916.js:194:24081)
2026-06-05 20:51:47.204 [info] at async dR (/var/task/.next/server/chunks/2916.js:172:40176)
2026-06-05 20:51:47.204 [info] at async dT (/var/task/.next/server/chunks/2916.js:172:47845)
2026-06-05 20:51:47.204 [info] at async Object.es [as updateOne] (/var/task/.next/server/chunks/2916.js:189:10762)
2026-06-05 20:51:47.204 [info] at async s (/var/task/.next/server/chunks/2916.js:135:69680)
2026-06-05 20:51:47.204 [info] at async x (/var/task/.next/server/chunks/2916.js:93:125842)
2026-06-05 20:51:47.204 [info] at async handler (/var/task/.next/server/chunks/2916.js:225:45676)
2026-06-05 20:51:47.204 [info] caused by: error: invalid input syntax for type integer: "6a2336d824f8407d3abeccb9"
2026-06-05 20:51:47.204 [info] at /var/task/.next/server/chunks/2916.js:86:23356
2026-06-05 20:51:47.204 [info] at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
2026-06-05 20:51:47.204 [info] at async /var/task/.next/server/chunks/2916.js:214:23305
2026-06-05 20:51:47.204 [info] at async iT.queryWithCache (/var/task/.next/server/chunks/2916.js:214:19983)
2026-06-05 20:51:47.204 [info] at async /var/task/.next/server/chunks/2916.js:214:23096
2026-06-05 20:51:47.204 [info] at async Object.hx [as insert] (/var/task/.next/server/chunks/2916.js:194:24081)
2026-06-05 20:51:47.204 [info] at async dR (/var/task/.next/server/chunks/2916.js:172:40176)
2026-06-05 20:51:47.204 [info] at async dT (/var/task/.next/server/chunks/2916.js:172:47845)
2026-06-05 20:51:47.204 [info] at async Object.es [as updateOne] (/var/task/.next/server/chunks/2916.js:189:10762)
2026-06-05 20:51:47.204 [info] at async s (/var/task/.next/server/chunks/2916.js:135:69680)
2026-06-05 20:51:47.204 [info] "query": "insert into \"products_faq_items\" (\"_order\", \"_parent_id\", \"id\", \"question\", \"answer\") values ($1, $2, $3, $4, $5) returning \"_order\", \"_parent_id\", \"id\", \"question\", \"answer\"",
2026-06-05 20:51:47.204 [info] "params": [
2026-06-05 20:51:47.204 [info] 1,
2026-06-05 20:51:47.204 [info] 39,
2026-06-05 20:51:47.204 [info] "6a2336d824f8407d3abeccb9",
2026-06-05 20:51:47.204 [info] "faq",
2026-06-05 20:51:47.204 [info] "dsdfssaf"
2026-06-05 20:51:47.204 [info] ]
2026-06-05 20:51:47.204 [info] }