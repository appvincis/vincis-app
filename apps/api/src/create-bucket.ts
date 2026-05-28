import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucket() {
  const bucketName = process.env.SUPABASE_BUCKET_EDITAIS || 'editais';
  console.log(`Checking if bucket "${bucketName}" exists...`);
  
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error("Error listing buckets:", listError);
    process.exit(1);
  }

  const exists = buckets.some(b => b.name === bucketName);
  if (exists) {
    console.log(`Bucket "${bucketName}" already exists.`);
  } else {
    console.log(`Creating bucket "${bucketName}" (Private)...`);
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: false,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['application/pdf'],
    });

    if (error) {
      console.error("Error creating bucket:", error);
      process.exit(1);
    }
    console.log(`Bucket "${bucketName}" created successfully!`);
  }
}

createBucket();
