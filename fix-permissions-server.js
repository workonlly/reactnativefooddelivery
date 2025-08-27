// Run this in a Node.js environment or Appwrite Functions with admin privileges
// This is just for reference - you'll need to run this server-side

const { Client, Storage, Permission, Role } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('68ae467c001a3dc05df4')
    .setKey('YOUR_API_KEY'); // You need an API key with proper permissions

const storage = new Storage(client);

async function fixBucketPermissions() {
    try {
        await storage.updateBucket(
            '68ae54b4002f298cd05c', // bucketId
            'Food Images', // name
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );
        console.log('Bucket permissions updated successfully');
    } catch (error) {
        console.error('Error updating bucket permissions:', error);
    }
}

// Call the function
fixBucketPermissions();
