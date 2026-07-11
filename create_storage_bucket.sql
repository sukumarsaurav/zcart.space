-- Run this in your Supabase SQL Editor to create the shop-assets storage bucket

INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-assets', 'shop-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to the bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'shop-assets');

-- Allow authenticated users to upload to the bucket
CREATE POLICY "Auth Upload" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'shop-assets' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their uploads
CREATE POLICY "Auth Update" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'shop-assets' 
    AND auth.role() = 'authenticated'
);
