2026-08-18 21:23:12.920 [info] [21:23:12] [31mERROR[39m: [36mError while sending email to address: email. Email not sent.[39m
2026-08-18 21:23:12.920 [info] err: {
2026-08-18 21:23:12.920 [info] "type": "g",
2026-08-18 21:23:12.920 [info] "message": "Error sending email: 422 validation_error - Invalid `to` field. The email address needs to follow the `email@example.com` or `Name <email@example.com>` format.",
2026-08-18 21:23:12.920 [info] "stack":
2026-08-18 21:23:12.920 [info] g: Error sending email: 422 validation_error - Invalid `to` field. The email address needs to follow the `email@example.com` or `Name <email@example.com>` format.
2026-08-18 21:23:12.920 [info] at bG.sendEmail (/var/task/.next/server/chunks/6321.js:129:50292)
2026-08-18 21:23:12.920 [info] at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
2026-08-18 21:23:12.920 [info] at async /var/task/.next/server/chunks/6321.js:221:817
2026-08-18 21:23:12.920 [info] at async Promise.all (index 0)
2026-08-18 21:23:12.920 [info] at async P (/var/task/.next/server/chunks/6321.js:221:760)
2026-08-18 21:23:12.920 [info] at async R (/var/task/.next/server/chunks/6321.js:9:144506)
2026-08-18 21:23:12.920 [info] at async aX (/var/task/.next/server/chunks/6321.js:261:26261)
2026-08-18 21:23:12.920 [info] at async q (/var/task/.next/server/chunks/4561.js:1:6335)
2026-08-18 21:23:12.920 [info] at async /var/task/.next/server/chunks/4561.js:1:9124
2026-08-18 21:23:12.920 [info] at async rH.do (/var/task/node_modules/.pnpm/next@15.5.12_@babel+core@7.29.0_supports-color@7.2.0__@playwright+test@1.56.1_babel-plu_2e31ac4fae5df5e5391a0737f872cab4/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:5:21048)
2026-08-18 21:23:12.920 [info] "data": null,
2026-08-18 21:23:12.920 [info] "isOperational": true,
2026-08-18 21:23:12.920 [info] "isPublic": true,
2026-08-18 21:23:12.920 [info] "status": 422,
2026-08-18 21:23:12.920 [info] "name": "g"
2026-08-18 21:23:12.920 [info] }