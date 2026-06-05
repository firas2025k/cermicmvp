2026-06-05 21:10:31.762 [info] [21:10:31] [31mERROR[39m: [36mThere was an error while saving a version for the products with ID 39.[39m
2026-06-05 21:10:31.762 [info] err: {
2026-06-05 21:10:31.762 [info] "type": "hI",
2026-06-05 21:10:31.762 [info] "message": "Failed query: insert into \"_products_v_version_faq_items\" (\"_order\", \"_parent_id\", \"id\", \"question\", \"answer\", \"_uuid\") values ($1, $2, default, $3, $4, $5) returning \"_order\", \"_parent_id\", \"id\", \"question\", \"answer\", \"_uuid\"\nparams: 1,707,quest 1,hgvj,k.lnj,6a2336d824f8407d3abeccb9: null value in column \"id\" of relation \"_products_v_version_faq_items\" violates not-null constraint",
2026-06-05 21:10:31.762 [info] "stack":
2026-06-05 21:10:31.763 [info] Error: Failed query: insert into "_products_v_version_faq_items" ("_order", "_parent_id", "id", "question", "answer", "_uuid") values ($1, $2, default, $3, $4, $5) returning "_order", "_parent_id", "id", "question", "answer", "_uuid"
2026-06-05 21:10:31.763 [info] params: 1,707,quest 1,hgvj,k.lnj,6a2336d824f8407d3abeccb9
2026-06-05 21:10:31.763 [info] at iT.queryWithCache (/var/task/.next/server/chunks/2916.js:214:20008)
2026-06-05 21:10:31.763 [info] at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
2026-06-05 21:10:31.763 [info] at async /var/task/.next/server/chunks/2916.js:214:23096
2026-06-05 21:10:31.763 [info] at async Object.hx [as insert] (/var/task/.next/server/chunks/2916.js:194:24081)
2026-06-05 21:10:31.763 [info] at async dR (/var/task/.next/server/chunks/2916.js:172:40176)
2026-06-05 21:10:31.763 [info] at async dT (/var/task/.next/server/chunks/2916.js:172:47845)
2026-06-05 21:10:31.763 [info] at async Object.et [as updateVersion] (/var/task/.next/server/chunks/2916.js:189:11293)
2026-06-05 21:10:31.763 [info] at async j (/var/task/.next/server/chunks/2916.js:87:283312)
2026-06-05 21:10:31.763 [info] at async s (/var/task/.next/server/chunks/2916.js:135:69773)
2026-06-05 21:10:31.763 [info] at async x (/var/task/.next/server/chunks/2916.js:93:125842)
2026-06-05 21:10:31.763 [info] caused by: error: null value in column "id" of relation "_products_v_version_faq_items" violates not-null constraint
2026-06-05 21:10:31.763 [info] at /var/task/.next/server/chunks/2916.js:86:23356
2026-06-05 21:10:31.763 [info] at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
2026-06-05 21:10:31.763 [info] at async /var/task/.next/server/chunks/2916.js:214:23305
2026-06-05 21:10:31.763 [info] at async iT.queryWithCache (/var/task/.next/server/chunks/2916.js:214:19983)
2026-06-05 21:10:31.763 [info] at async /var/task/.next/server/chunks/2916.js:214:23096
2026-06-05 21:10:31.763 [info] at async Object.hx [as insert] (/var/task/.next/server/chunks/2916.js:194:24081)
2026-06-05 21:10:31.763 [info] at async dR (/var/task/.next/server/chunks/2916.js:172:40176)
2026-06-05 21:10:31.763 [info] at async dT (/var/task/.next/server/chunks/2916.js:172:47845)
2026-06-05 21:10:31.763 [info] at async Object.et [as updateVersion] (/var/task/.next/server/chunks/2916.js:189:11293)
2026-06-05 21:10:31.763 [info] at async j (/var/task/.next/server/chunks/2916.js:87:283312)
2026-06-05 21:10:31.763 [info] "query": "insert into \"_products_v_version_faq_items\" (\"_order\", \"_parent_id\", \"id\", \"question\", \"answer\", \"_uuid\") values ($1, $2, default, $3, $4, $5) returning \"_order\", \"_parent_id\", \"id\", \"question\", \"answer\", \"_uuid\"",
2026-06-05 21:10:31.763 [info] "params": [
2026-06-05 21:10:31.763 [info] 1,
2026-06-05 21:10:31.763 [info] 707,
2026-06-05 21:10:31.763 [info] "quest 1",
2026-06-05 21:10:31.763 [info] "hgvj,k.lnj",
2026-06-05 21:10:31.763 [info] "6a2336d824f8407d3abeccb9"
2026-06-05 21:10:31.763 [info] ]
2026-06-05 21:10:31.763 [info] }
2026-06-05 21:10:31.771 [info] [21:10:31] [31mERROR[39m: [36mCannot read properties of undefined (reading 'title')[39m
2026-06-05 21:10:31.771 [info] err: {
2026-06-05 21:10:31.771 [info] "type": "TypeError",
2026-06-05 21:10:31.771 [info] "message": "Cannot read properties of undefined (reading 'title')",
2026-06-05 21:10:31.771 [info] "stack":
2026-06-05 21:10:31.771 [info] TypeError: Cannot read properties of undefined (reading 'title')
2026-06-05 21:10:31.771 [info] at m (/var/task/.next/server/chunks/2916.js:9:49330)
2026-06-05 21:10:31.771 [info] at /var/task/.next/server/chunks/2916.js:9:59701
2026-06-05 21:10:31.771 [info] at Array.forEach (<anonymous>)
2026-06-05 21:10:31.771 [info] at o (/var/task/.next/server/chunks/2916.js:9:59678)
2026-06-05 21:10:31.771 [info] at f (/var/task/.next/server/chunks/2916.js:319:58769)
2026-06-05 21:10:31.771 [info] at s (/var/task/.next/server/chunks/2916.js:135:69930)
2026-06-05 21:10:31.771 [info] at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
2026-06-05 21:10:31.771 [info] at async x (/var/task/.next/server/chunks/2916.js:93:125842)
2026-06-05 21:10:31.771 [info] at async handler (/var/task/.next/server/chunks/2916.js:225:45676)
2026-06-05 21:10:31.771 [info] at async q (/var/task/.next/server/chunks/5557.js:1:6332)
2026-06-05 21:10:31.771 [info] }