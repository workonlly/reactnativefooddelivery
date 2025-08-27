import { storage, appwriteConfig } from './appwrite';

export async function testStorageAccess() {
    try {
        console.log('🧪 Testing storage access...');
        
        // Try to list files in the bucket
        const files = await storage.listFiles(appwriteConfig.bucketId);
        console.log(`✅ Found ${files.files.length} files in storage`);
        
        if (files.files.length > 0) {
            const firstFile = files.files[0];
            const testUrl = `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.bucketId}/files/${firstFile.$id}/view?project=${appwriteConfig.projectId}`;
            console.log(`📷 Test image URL: ${testUrl}`);
            
            // Try to fetch the image to test accessibility
            try {
                const response = await fetch(testUrl);
                if (response.ok) {
                    console.log('✅ Storage images are accessible');
                    return { success: true, url: testUrl };
                } else {
                    console.log(`❌ Storage access failed: ${response.status} ${response.statusText}`);
                    return { success: false, error: `HTTP ${response.status}` };
                }
            } catch (fetchError) {
                console.log(`❌ Network error accessing storage: ${fetchError}`);
                return { success: false, error: 'Network error' };
            }
        } else {
            console.log('ℹ️ No files found in storage bucket');
            return { success: true, message: 'No files to test' };
        }
    } catch (error) {
        console.error('❌ Storage test failed:', error);
        return { success: false, error: error };
    }
}

export async function getStorageInfo() {
    try {
        console.log('📋 Storage Configuration:');
        console.log(`   Endpoint: ${appwriteConfig.endpoint}`);
        console.log(`   Project ID: ${appwriteConfig.projectId}`);
        console.log(`   Bucket ID: ${appwriteConfig.bucketId}`);
        
        const files = await storage.listFiles(appwriteConfig.bucketId);
        console.log(`   Files count: ${files.files.length}`);
        
        return {
            endpoint: appwriteConfig.endpoint,
            projectId: appwriteConfig.projectId,
            bucketId: appwriteConfig.bucketId,
            filesCount: files.files.length,
            files: files.files.map(f => ({
                id: f.$id,
                name: f.name,
                url: `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.bucketId}/files/${f.$id}/view?project=${appwriteConfig.projectId}`
            }))
        };
    } catch (error) {
        console.error('❌ Failed to get storage info:', error);
        throw error;
    }
}

export async function debugImageUrl(fileId: string) {
    const testUrl = `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.bucketId}/files/${fileId}/view?project=${appwriteConfig.projectId}`;
    console.log(`🔍 Testing URL: ${testUrl}`);
    
    try {
        const response = await fetch(testUrl, { method: 'HEAD' });
        console.log(`📊 Response status: ${response.status}`);
        console.log(`📊 Response headers:`, response.headers);
        
        if (response.ok) {
            console.log('✅ URL is accessible');
            return { success: true, url: testUrl };
        } else {
            console.log(`❌ URL not accessible: ${response.status} ${response.statusText}`);
            return { success: false, status: response.status, statusText: response.statusText };
        }
    } catch (error) {
        console.log(`❌ Network error: ${error}`);
        return { success: false, error: error };
    }
}
