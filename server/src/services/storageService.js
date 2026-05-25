const { supabase } = require('../config/supabase');

class StorageService {
  constructor() {
    this.bucketName = 'scanvista-assets';
    this.bucketEnsured = false;
  }

  async ensureBucketExists() {
    if (this.bucketEnsured) return;
    if (!supabase) {
      console.warn('[StorageService] Supabase client is not configured.');
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
          fileSizeLimit: 157286400 // 150MB
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

    await this.ensureBucketExists();

    const fileExt = file.originalname.split('.').pop().toLowerCase();
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    const fileName = `${folder}/${uniqueId}.${fileExt}`;

    // Upload buffer to Supabase storage
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
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