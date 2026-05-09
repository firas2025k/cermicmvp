2026-05-09 11:42:48.686 [error] Error: Failed query: select "payload_locked_documents"."id", "payload_locked_documents"."global_slug", "payload_locked_documents"."updated_at", "payload_locked_documents__rels"."data" as "_rels" from "payload_locked_documents" "payload_locked_documents" left join lateral (select coalesce(json_agg(json_build_array("payload_locked_documents__rels"."order", "payload_locked_documents__rels"."path", "payload_locked_documents__rels"."users_id", "payload_locked_documents__rels"."pages_id", "payload_locked_documents__rels"."categories_id", "payload_locked_documents__rels"."category_product_orders_id", "payload_locked_documents__rels"."media_id", "payload_locked_documents__rels"."forms_id", "payload_locked_documents__rels"."form_submissions_id", "payload_locked_documents__rels"."addresses_id", "payload_locked_documents__rels"."variants_id", "payload_locked_documents__rels"."variant_types_id", "payload_locked_documents__rels"."variant_options_id", "payload_locked_documents__rels"."products_id", "payload_locked_documents__rels"."carts_id", "payload_locked_documents__rels"."orders_id", "payload_locked_documents__rels"."transactions_id") order by "payload_locked_documents__rels"."order" asc), '[]'::json) as "data" from (select * from "payload_locked_documents_rels" "payload_locked_documents__rels" where "payload_locked_documents__rels"."parent_id" = "payload_locked_documents"."id" order by "payload_locked_documents__rels"."order" asc) "payload_locked_documents__rels") "payload_locked_documents__rels" on true where "payload_locked_documents"."global_slug" is not null order by "payload_locked_documents"."created_at" desc
params: 
    at iT.queryWithCache (.next/server/chunks/3236.js:214:20008)
    at async (.next/server/chunks/3236.js:214:23096)
    at async dY (.next/server/chunks/3236.js:182:1334)
    at async x (.next/server/chunks/3236.js:87:323139)
    at async x (.next/server/chunks/2810.js:5:6452)
    at async af (.next/server/app/(payload)/admin/[[...segments]]/page.js:15:95706) {
  query: `select "payload_locked_documents"."id", "payload_locked_documents"."global_slug", "payload_locked_documents"."updated_at", "payload_locked_documents__rels"."data" as "_rels" from "payload_locked_documents" "payload_locked_documents" left join lateral (select coalesce(json_agg(json_build_array("payload_locked_documents__rels"."order", "payload_locked_documents__rels"."path", "payload_locked_documents__rels"."users_id", "payload_locked_documents__rels"."pages_id", "payload_locked_documents__rels"."categories_id", "payload_locked_documents__rels"."category_product_orders_id", "payload_locked_documents__rels"."media_id", "payload_locked_documents__rels"."forms_id", "payload_locked_documents__rels"."form_submissions_id", "payload_locked_documents__rels"."addresses_id", "payload_locked_documents__rels"."variants_id", "payload_locked_documents__rels"."variant_types_id", "payload_locked_documents__rels"."variant_options_id", "payload_locked_documents__rels"."products_id", "payload_locked_documents__rels"."carts_id", "payload_locked_documents__rels"."orders_id", "payload_locked_documents__rels"."transactions_id") order by "payload_locked_documents__rels"."order" asc), '[]'::json) as "data" from (select * from "payload_locked_documents_rels" "payload_locked_documents__rels" where "payload_locked_documents__rels"."parent_id" = "payload_locked_documents"."id" order by "payload_locked_documents__rels"."order" asc) "payload_locked_documents__rels") "payload_locked_documents__rels" on true where "payload_locked_documents"."global_slug" is not null order by "payload_locked_documents"."created_at" desc`,
  params: [],
  digest: '2147980887',
  [cause]: error: column payload_locked_documents__rels.category_product_orders_id does not exist
      at <unknown> (.next/server/chunks/3236.js:32:138016)
      at async (.next/server/chunks/3236.js:214:23305)
      at async iT.queryWithCache (.next/server/chunks/3236.js:214:19983)
      at async (.next/server/chunks/3236.js:214:23096)
      at async dY (.next/server/chunks/3236.js:182:1334)
      at async x (.next/server/chunks/3236.js:87:323139)
      at async x (.next/server/chunks/2810.js:5:6452)
      at async af (.next/server/app/(payload)/admin/[[...segments]]/page.js:15:95706) {
    length: 156,
    severity: 'ERROR',
    code: '42703',
    detail: undefined,
    hint: undefined,
    position: '518',
    internalPosition: undefined,
    internalQuery: undefined,
    where: undefined,
    schema: undefined,
    table: undefined,
    column: undefined,
    dataType: undefined,
    constraint: undefined,
    file: 'parse_relation.c',
    line: '3716',
    routine: 'errorMissingColumn'
  }
}