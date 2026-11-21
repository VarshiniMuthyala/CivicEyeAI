import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';

export const uploadImageToStorage = async (file) => {
  if (!file) return null;

  const bucketName = process.env.SUPABASE_BUCKET_NAME || 'civic-complaints';

  // If Supabase is configured, upload to Supabase Storage
  if (isSupabaseConfigured && supabase) {
    try {
      const fileBuffer = fs.readFileSync(file.path);
      const fileExt = path.extname(file.originalname);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExt}`;
      const filePath = `reports/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, fileBuffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      } else {
        console.warn('Supabase storage upload failed, falling back to local file URL:', error?.message);
      }
    } catch (err) {
      console.warn('Supabase storage exception, using local URL:', err.message);
    }
  }

  // Fallback: Local URL served by Express static
  return `/uploads/${path.basename(file.path)}`;
};
