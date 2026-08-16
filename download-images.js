const https = require('https');
const fs = require('fs');
const path = require('path');

// Updated with fresh, verified Unsplash IDs for the ones that 404'd
const IMAGES = {
  bgHero: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1920&q=80', // Fixed
  bgStudio: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1920&q=80', 
  bgServices: 'https://images.unsplash.com/photo-1596558450255-7c0b7be9d56a?auto=format&fit=crop&w=1920&q=80', 
  bgArtists: 'https://images.unsplash.com/photo-1635311910609-bba914ccde08?auto=format&fit=crop&w=1920&q=80', // Fixed
  bgCommunity: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1920&q=80', 
  bgContact: 'https://images.unsplash.com/photo-1580870059635-f938d2f26038?auto=format&fit=crop&w=1920&q=80', // Fixed
  
  card1: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80', 
  card2: 'https://images.unsplash.com/photo-1585741031386-8f3a388e3636?auto=format&fit=crop&w=800&q=80', // Fixed
  card3: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80', 
  
  gal1: 'https://images.unsplash.com/photo-1515378860431-40bdbfd28376?auto=format&fit=crop&w=500&q=80', // Fixed
  gal2: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=500&q=80', // Fixed
  gal3: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=80', 
  gal4: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=500&q=80', // Fixed
};

// Create the target directory: /public/images
const targetDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Download helper function with a User-Agent to prevent blocking
const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    https.get(url, options, (res) => {
      // Unsplash sometimes redirects (302), so we handle the redirect
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, options, (redirectRes) => {
          redirectRes.pipe(fs.createWriteStream(filepath))
            .on('error', reject)
            .once('close', () => resolve(filepath));
        }).on('error', reject);
      } else if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve(filepath));
      } else {
        res.resume(); // Consume response data to free up memory
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
};

// Run the downloads
async function run() {
  console.log('Starting image downloads to public/images folder...');
  for (const [name, url] of Object.entries(IMAGES)) {
    const filepath = path.join(targetDir, `${name}.jpg`);
    try {
      await downloadImage(url, filepath);
      console.log(`✅ Downloaded: ${name}.jpg`);
    } catch (err) {
      console.error(`❌ Failed to download ${name}:`, err.message);
    }
  }
  console.log('🎉 All images downloaded successfully! You are ready to go offline.');
}

run();