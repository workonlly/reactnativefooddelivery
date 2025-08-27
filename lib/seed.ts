import { ID } from "react-native-appwrite";
import { appwriteConfig, databases, storage } from "./appwrite";
import dummyData from "./data";

interface Category {
    name: string;
    description: string;
}

interface Customization {
    name: string;
    price: number;
    type: "topping" | "side" | "size" | "crust" | string; // extend as needed
}

interface MenuItem {
    name: string;
    description: string;
    image_url: string;
    price: number;
    rating: number;
    calories: number;
    protein: number;
    category_name: string;
    customizations: string[]; // list of customization names
}

interface DummyData {
    categories: Category[];
    customizations: Customization[];
    menu: MenuItem[];
}

// ensure dummyData has correct shape
const data = dummyData as DummyData;

async function clearAll(collectionId: string): Promise<void> {
    try {
        console.log(`🗑️ Clearing collection: ${collectionId}`);
        const list = await databases.listDocuments(
            appwriteConfig.databaseId,
            collectionId
        );

        console.log(`Found ${list.documents.length} documents to delete`);
        
        await Promise.all(
            list.documents.map((doc) =>
                databases.deleteDocument(appwriteConfig.databaseId, collectionId, doc.$id)
            )
        );
        
        console.log(`✅ Cleared ${list.documents.length} documents from collection ${collectionId}`);
    } catch (error) {
        console.error(`❌ Error clearing collection ${collectionId}:`, error);
        throw error;
    }
}

async function clearStorage(): Promise<void> {
    try {
        console.log("🗑️ Clearing storage bucket...");
        const list = await storage.listFiles(appwriteConfig.bucketId);
        
        console.log(`Found ${list.files.length} files to delete`);

        await Promise.all(
            list.files.map((file) =>
                storage.deleteFile(appwriteConfig.bucketId, file.$id)
            )
        );
        
        console.log(`✅ Cleared ${list.files.length} files from storage`);
    } catch (error) {
        console.error("❌ Error clearing storage:", error);
        throw error;
    }
}

async function uploadImageToStorage(imageUrl: string): Promise<string> {
    try {
        // Check if it's a local asset name (no http and no dots indicating URL)
        const isLocalAsset = !imageUrl.startsWith('http') && !imageUrl.includes('://');
        
        if (isLocalAsset) {
            console.log(`📸 Using local asset: ${imageUrl}`);
            // For local assets, just return the asset name - the component will handle it
            return imageUrl;
        }
        
        console.log(`📸 Fetching image from: ${imageUrl}`);
        
        // Add timeout and retry logic
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch(imageUrl, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        
        // Check file size (limit to 10MB)
        if (blob.size > 10 * 1024 * 1024) {
            console.warn(`⚠️ Image too large (${blob.size} bytes), using placeholder`);
            return imageUrl; // Return original URL as fallback
        }

        const fileObj = {
            name: imageUrl.split("/").pop()?.split('?')[0] || `file-${Date.now()}.png`,
            type: blob.type || 'image/png',
            size: blob.size,
            uri: imageUrl,
        };

        console.log(`📤 Uploading file: ${fileObj.name}, size: ${fileObj.size} bytes, type: ${fileObj.type}`);
        
        const file = await storage.createFile(
            appwriteConfig.bucketId,
            ID.unique(),
            fileObj
        );

        // Generate the proper view URL for Appwrite storage
        const viewUrl = `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.bucketId}/files/${file.$id}/view?project=${appwriteConfig.projectId}`;
        console.log(`✅ Image uploaded successfully: ${file.$id}`);
        console.log(`📷 Image URL: ${viewUrl}`);
        return viewUrl;
    } catch (error) {
        console.error(`❌ Error uploading image from ${imageUrl}:`, error);
        console.log(`🔄 Using original URL as fallback`);
        // Return original URL as fallback instead of failing
        return imageUrl;
    }
}

async function seed(skipImageUpload: boolean = false): Promise<void> {
    try {
        console.log("🌱 Starting seeding process...");
        
        // 1. Clear all
        console.log("🧹 Clearing existing data...");
        await clearAll(appwriteConfig.categoriesCollectionId);
        await clearAll(appwriteConfig.customizationsCollectionId);
        await clearAll(appwriteConfig.menuCollectionId);
        await clearAll(appwriteConfig.menuCustomizationsCollectionId);
        
        if (!skipImageUpload) {
            await clearStorage();
        }
        console.log("✅ Data cleared successfully");

        // 2. Create Categories
        console.log("📁 Creating categories...");
        const categoryMap: Record<string, string> = {};
        for (const cat of data.categories) {
            const doc = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.categoriesCollectionId,
                ID.unique(),
                cat
            );
            categoryMap[cat.name] = doc.$id;
            console.log(`✅ Created category: ${cat.name}`);
        }

        // 3. Create Customizations
        console.log("🎨 Creating customizations...");
        const customizationMap: Record<string, string> = {};
        for (const cus of data.customizations) {
            const doc = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.customizationsCollectionId,
                ID.unique(),
                {
                    name: cus.name,
                    price: cus.price,
                    type: cus.type,
                }
            );
            customizationMap[cus.name] = doc.$id;
            console.log(`✅ Created customization: ${cus.name}`);
        }

        // 4. Create Menu Items
        console.log("🍔 Creating menu items...");
        const menuMap: Record<string, string> = {};
        for (const item of data.menu) {
            let uploadedImage = item.image_url; // Default to original URL
            
            if (!skipImageUpload) {
                console.log(`📸 Uploading image for: ${item.name}`);
                uploadedImage = await uploadImageToStorage(item.image_url);
            } else {
                console.log(`⏭️ Skipping image upload for: ${item.name}, using original URL`);
            }

            const doc = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.menuCollectionId,
                ID.unique(),
                {
                    name: item.name,
                    description: item.description,
                    image_url: uploadedImage,
                    price: item.price,
                    rating: item.rating,
                    calories: item.calories,
                    protein: item.protein,
                    categories: categoryMap[item.category_name],
                }
            );

            menuMap[item.name] = doc.$id;
            console.log(`✅ Created menu item: ${item.name}`);

            // 5. Create menu_customizations
            console.log(`🔗 Creating customizations for: ${item.name}`);
            for (const cusName of item.customizations) {
                if (customizationMap[cusName]) {
                    await databases.createDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.menuCustomizationsCollectionId,
                        ID.unique(),
                        {
                            menu: doc.$id,
                            customizations: customizationMap[cusName],
                        }
                    );
                    console.log(`✅ Linked ${cusName} to ${item.name}`);
                } else {
                    console.warn(`⚠️ Customization '${cusName}' not found for menu item '${item.name}'`);
                }
            }
        }

        console.log("✅ Seeding complete.");
        
        // Verify data was created
        const menuCount = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.menuCollectionId);
        const customizationCount = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.customizationsCollectionId);
        const menuCustomizationCount = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.menuCustomizationsCollectionId);
        
        console.log(`📊 Summary:`);
        console.log(`   Categories: ${Object.keys(categoryMap).length}`);
        console.log(`   Customizations: ${Object.keys(customizationMap).length}`);
        console.log(`   Menu Items: ${menuCount.total}`);
        console.log(`   Menu-Customization Links: ${menuCustomizationCount.total}`);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        throw error;
    }
}

export default seed;
