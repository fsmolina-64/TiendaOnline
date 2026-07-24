require('dotenv/config');
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function runTest() {
  console.log('--- TEST CLOUDINARY UPLOAD & DESTROY ---');
  console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || '(no configurado)');
  
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.log('[WARN] Credenciales de Cloudinary vacías en .env. Se requiere configurar CLOUDINARY_CLOUD_NAME, API_KEY y API_SECRET para ejecutar la prueba en vivo contra la API de Cloudinary.');
    return;
  }

  try {
    // 1x1 transparent GIF base64
    const sampleImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    
    console.log('1. Subiendo imagen de prueba a Cloudinary...');
    const uploadResult = await cloudinary.uploader.upload(sampleImage, {
      folder: 'tienda-online/test',
    });
    console.log('✔ Imagen subida con éxito!');
    console.log('   URL:', uploadResult.secure_url);
    console.log('   Public ID:', uploadResult.public_id);

    console.log('2. Eliminando imagen de Cloudinary...');
    const destroyResult = await cloudinary.uploader.destroy(uploadResult.public_id);
    console.log('✔ Resultado de eliminación:', destroyResult);
  } catch (error) {
    console.error('❌ Error durante la prueba de Cloudinary:', error.message || error);
  }
}

runTest();
