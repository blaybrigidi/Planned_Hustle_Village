-- ============================================
-- MESSAGE ATTACHMENTS & SERVICE LINKS MIGRATION
-- ============================================
-- Run this in your Supabase SQL Editor

-- Step 1: Add attachments column to messages table (JSONB array of image URLs)
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Step 2: Add service_id column to messages table for product/service linking
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES services(id) ON DELETE SET NULL;

-- Step 3: Add index on service_id for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_service_id ON messages(service_id);

-- Step 4: Add index on attachments for better query performance (GIN index for JSONB)
CREATE INDEX IF NOT EXISTS idx_messages_attachments ON messages USING GIN (attachments);

-- Step 5: Add comments for documentation
COMMENT ON COLUMN messages.attachments IS 'Array of image URLs stored in Supabase Storage message-attachments bucket';
COMMENT ON COLUMN messages.service_id IS 'Optional reference to a service/product that is linked in this message';

-- Step 6: Verify the changes
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND column_name IN ('attachments', 'service_id');

