import {Text, TouchableOpacity, Image, Platform, View} from 'react-native'
import {MenuItem} from "@/type";
import {appwriteConfig} from "@/lib/appwrite";
import {useCartStore} from "@/store/cart.store";
import { useState } from 'react';

const MenuCard = ({ item: { $id, image_url, name, price }}: { item: MenuItem}) => {
    const [imageError, setImageError] = useState(false);
    
    // Check if the image_url is a local asset name, Appwrite storage URL, or external URL
    const isLocalAsset = image_url && !image_url.startsWith('http') && !image_url.includes('cloud.appwrite.io');
    const isAppwriteStorageUrl = image_url?.includes(appwriteConfig.endpoint) || image_url?.includes('nyc.cloud.appwrite.io');
    
    let imageSource;
    if (isLocalAsset) {
        // Map local asset names to require statements
        const assetMap: { [key: string]: any } = {
            'burger-one.png': require('../assets/images/burger-one.png'),
            'burger-two.png': require('../assets/images/burger-two.png'),
            'pizza-one.png': require('../assets/images/pizza-one.png'),
            'buritto.png': require('../assets/images/buritto.png'),
            'salad.png': require('../assets/images/salad.png'),
            'fries.png': require('../assets/images/fries.png'),
            'mozarella-sticks.png': require('../assets/images/mozarella-sticks.png'),
        };
        imageSource = assetMap[image_url] || require('../assets/images/burger-one.png'); // fallback
        console.log(`Using local asset: ${image_url}`);
    } else if (isAppwriteStorageUrl) {
        // For Appwrite storage URLs, construct the proper URL
        const fileId = image_url.split('/files/')[1]?.split('/')[0];
        if (fileId) {
            const correctUrl = `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.bucketId}/files/${fileId}/view?project=${appwriteConfig.projectId}`;
            imageSource = { uri: correctUrl };
            console.log(`Using corrected Appwrite URL: ${correctUrl}`);
        } else {
            // Fallback to original URL
            imageSource = { uri: image_url };
            console.log(`Using original Appwrite URL: ${image_url}`);
        }
    } else {
        // External URL
        imageSource = { uri: image_url };
        console.log(`Using external URL: ${image_url}`);
    }
    
    const { addItem } = useCartStore();

    return (
        <TouchableOpacity className="menu-card" style={Platform.OS === 'android' ? { elevation: 10, shadowColor: '#878787'}: {}}>
            {!imageError ? (
                <Image 
                    source={imageSource} 
                    className="size-32 absolute -top-10" 
                    resizeMode="contain"
                    onError={() => {
                        console.log(`Failed to load image: ${image_url}`);
                        setImageError(true);
                    }}
                />
            ) : (
                <View className="size-32 absolute -top-10 bg-gray-200 items-center justify-center rounded-lg">
                    <Text className="text-gray-500 text-xs">No Image</Text>
                </View>
            )}
            <Text className="text-center base-bold text-dark-100 mb-2" numberOfLines={1}>{name}</Text>
            <Text className="body-regular text-gray-200 mb-4">From ${price}</Text>
            <TouchableOpacity onPress={() => addItem({ id: $id, name, price, image_url: image_url, customizations: []})}>
                <Text className="paragraph-bold text-primary">Add to Cart +</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    )
}
export default MenuCard
