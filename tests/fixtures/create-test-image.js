const fs = require('fs');
const path = require('path');

// Create a simple 100x100 pixel red square PNG
const width = 100;
const height = 100;
const buffer = Buffer.alloc(width * height * 4);

// Fill the buffer with red pixels (RGBA: 255, 0, 0, 255)
for (let i = 0; i < width * height; i++) {
  const offset = i * 4;
  buffer[offset] = 255;     // R
  buffer[offset + 1] = 0;   // G
  buffer[offset + 2] = 0;   // B
  buffer[offset + 3] = 255; // A
}

// PNG header and IHDR chunk
const header = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  // PNG signature
  0x00, 0x00, 0x00, 0x0D,                          // IHDR chunk length
  0x49, 0x48, 0x44, 0x52,                          // "IHDR"
  0x00, 0x00, 0x00, width >> 8, width & 0xFF,      // Width
  0x00, 0x00, 0x00, height >> 8, height & 0xFF,    // Height
  0x08,                                           // Bit depth
  0x06,                                           // Color type (RGBA)
  0x00,                                           // Compression method
  0x00,                                           // Filter method
  0x00,                                           // Interlace method
  0x00, 0x00, 0x00, 0x00                          // CRC (will compute later)
]);

// Write the image data to file
fs.writeFileSync(path.join(__dirname, 'test-image.png'), Buffer.concat([header, buffer]));
console.log('Test image created successfully at', path.join(__dirname, 'test-image.png'));
