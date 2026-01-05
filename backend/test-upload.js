const fs = require('fs');
const FormData = require('form-data');
const http = require('http');

function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const req = http.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: options.method,
      headers: options.headers
    }, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      if (data.pipe) {
        data.pipe(req);
      } else {
        req.write(data);
        req.end();
      }
    } else {
      req.end();
    }
  });
}

async function testFileUpload() {
  try {
    // Login first
    console.log('🔐 Logging in...');
    const loginResponse = await makeRequest('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }, JSON.stringify({
      email: 'admin@derjiproductions.com',
      password: 'admin123'
    }));

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${JSON.stringify(loginResponse.data)}`);
    }

    const accessToken = loginResponse.data.data.accessToken;
    console.log('✅ Login successful');

    // Create a proper test image (1x1 PNG)
    const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync('test-upload.png', pngBuffer);
    console.log('📁 Created test image file');

    // Upload file
    console.log('📤 Uploading file...');
    const form = new FormData();
    form.append('file', fs.createReadStream('test-upload.png'), {
      filename: 'test-upload.png',
      contentType: 'image/png'
    });

    const uploadResponse = await makeRequest('http://localhost:5000/api/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        ...form.getHeaders()
      }
    }, form);
    
    if (!uploadResponse.ok) {
      console.error('Upload failed with status:', uploadResponse.status);
      console.error('Response:', uploadResponse.data);
      throw new Error(`Upload failed: ${JSON.stringify(uploadResponse.data)}`);
    }

    console.log('✅ File uploaded successfully!');
    console.log('📊 Upload response:', JSON.stringify(uploadResponse.data, null, 2));

    // Test file deletion
    const fileKey = uploadResponse.data.data.id;
    const encodedKey = encodeURIComponent(fileKey);
    console.log(`🗑️ Deleting file with key: ${fileKey}`);
    console.log(`🗑️ Encoded key: ${encodedKey}`);

    const deleteResponse = await makeRequest(`http://localhost:5000/api/files/${encodedKey}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!deleteResponse.ok) {
      console.error('Delete failed with status:', deleteResponse.status);
      console.error('Response:', deleteResponse.data);
      throw new Error(`Delete failed: ${JSON.stringify(deleteResponse.data)}`);
    }

    console.log('✅ File deleted successfully!');
    console.log('📊 Delete response:', JSON.stringify(deleteResponse.data, null, 2));

    // Cleanup
    fs.unlinkSync('test-upload.png');
    console.log('🧹 Cleaned up test files');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

testFileUpload();