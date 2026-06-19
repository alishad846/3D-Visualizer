const {
  supabase,
  SUPABASE_SERVICE_ROLE_KEY,
} = require('../config/supabase');

function hasServiceRoleKey() {
  return typeof SUPABASE_SERVICE_ROLE_KEY === 'string' && SUPABASE_SERVICE_ROLE_KEY.trim() !== '';
}

class StorageService {
  constructor() {
    this.bucketName = 'models';
    this.bucketEnsured = false;
  }

  async ensureBucketExists() {
    if (this.bucketEnsured) return;
    if (!supabase) {
      console.warn('[StorageService] Supabase client is not configured.');
      return;
    }
    if (!hasServiceRoleKey()) {
      console.warn('[StorageService] SUPABASE_SERVICE_ROLE_KEY is not configured. Bucket bootstrap is skipped because anon keys cannot manage Storage buckets.');
      return;
    }
    
    try {
      const { data: buckets, error: getBucketsError } = await supabase.storage.listBuckets();
      if (getBucketsError) throw getBucketsError;
      
      const bucketExists = buckets.some(b => b.name === this.bucketName);
      if (!bucketExists) {
        console.log(`[StorageService] Creating bucket '${this.bucketName}'...`);
        const { error: createError } = await supabase.storage.createBucket(this.bucketName, {
          public: true,
        });
        if (createError) throw createError;
        console.log(`[StorageService] Bucket '${this.bucketName}' created successfully.`);
      }
      this.bucketEnsured = true;
    } catch (e) {
      console.warn('[StorageService] Failed to check/create bucket:', e.message);
    }
  }

  async uploadFile(file, folder = 'assets') {
    if (!supabase) {
      throw new Error('Supabase client is not configured. Please check your env variables.');
    }
    if (!hasServiceRoleKey()) {
      throw new Error('Supabase Storage uploads require SUPABASE_SERVICE_ROLE_KEY. Anon keys are blocked because Storage RLS will reject inserts.');
    }

    await this.ensureBucketExists();

    const fileExt = file.originalname.split('.').pop().toLowerCase();
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    const fileName = `${folder}/${uniqueId}.${fileExt}`;

    const contentTypeMap = {
      glb: 'model/gltf-binary',
      gltf: 'model/gltf+json',
      usdz: 'model/vnd.usdz+zip',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
      svg: 'image/svg+xml',
    };
    const contentType = contentTypeMap[fileExt] || file.mimetype || 'application/octet-stream';

    const { error } = await supabase.storage
      .from(this.bucketName)
      .upload(fileName, file.buffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      console.error('[StorageService] Supabase upload failed:', error);
      throw new Error(`Failed to upload to storage: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(fileName);

    return {
      filePath: fileName,
      publicUrl
    };
  }
}

module.exports = new StorageService();
