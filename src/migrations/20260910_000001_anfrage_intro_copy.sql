-- Update Anfrage page form intro heading
-- Old: Schreiben Sie uns — wir antworten so schnell wie möglich
-- New: Wir freuen uns auf Ihre Nachricht

UPDATE pages_blocks_form_block
SET intro_content = jsonb_set(
  intro_content,
  '{root,children,0,children,0,text}',
  to_jsonb('Wir freuen uns auf Ihre Nachricht'::text),
  false
)
WHERE intro_content::text ILIKE '%Schreiben Sie uns%';

-- Versioned drafts/history (if present)
UPDATE _pages_v_blocks_form_block
SET intro_content = jsonb_set(
  intro_content,
  '{root,children,0,children,0,text}',
  to_jsonb('Wir freuen uns auf Ihre Nachricht'::text),
  false
)
WHERE intro_content::text ILIKE '%Schreiben Sie uns%';
