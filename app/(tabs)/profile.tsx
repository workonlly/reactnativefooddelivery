import {View, Text, Image, TouchableOpacity, ScrollView, Alert} from 'react-native'
import {SafeAreaView} from "react-native-safe-area-context";
import {images} from "@/constants";
import useAuthStore from "@/store/auth.store";
import {router} from "expo-router";

const Profile = () => {
    const { user, signOut, isLoading, isAuthenticated } = useAuthStore();

    // Show loading state if user data is still being fetched
    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 justify-center items-center">
                    <Text className="body-regular text-gray-200">Loading profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const handleSignOut = async () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await signOut();
                            router.replace("/(auth)/sign-in");
                        } catch (error) {
                            console.error("Sign out failed:", error);
                            Alert.alert("Error", "Failed to sign out. Please try again.");
                        }
                    }
                }
            ]
        );
    };

    const profileOptions = [
        {
            id: 1,
            title: "Edit Profile",
            icon: images.pencil,
            onPress: () => {
                // TODO: Navigate to edit profile
                Alert.alert("Coming Soon", "Edit profile feature will be available soon!");
            }
        },
        {
            id: 2,
            title: "Order History",
            icon: images.clock,
            onPress: () => {
                // TODO: Navigate to order history
                Alert.alert("Coming Soon", "Order history feature will be available soon!");
            }
        },
        {
            id: 3,
            title: "Payment Methods",
            icon: images.dollar,
            onPress: () => {
                // TODO: Navigate to payment methods
                Alert.alert("Coming Soon", "Payment methods feature will be available soon!");
            }
        },
        {
            id: 4,
            title: "Delivery Address",
            icon: images.location,
            onPress: () => {
                // TODO: Navigate to delivery address
                Alert.alert("Coming Soon", "Delivery address feature will be available soon!");
            }
        },
        {
            id: 5,
            title: "Support",
            icon: images.phone,
            onPress: () => {
                // TODO: Navigate to support
                Alert.alert("Support", "Contact us at support@fooddelivery.com");
            }
        }
    ];

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="px-5 py-8">
                    <Text className="h2-bold text-dark-100 text-center">Profile</Text>
                </View>

                {/* User Info Section */}
                <View className="px-5 mb-8">
                    <View className="bg-gray-50 rounded-2xl p-6 items-center shadow-sm">
                        <View className="w-24 h-24 rounded-full bg-primary items-center justify-center mb-4 shadow-md">
                            {user?.avatar ? (
                                <Image 
                                    source={{ uri: user.avatar }} 
                                    className="w-24 h-24 rounded-full"
                                    resizeMode="cover"
                                />
                            ) : (
                                <Text className="h1-bold text-white">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </Text>
                            )}
                        </View>
                        <Text className="h3-bold text-dark-100 mb-1">
                            {user?.name || 'Loading...'}
                        </Text>
                        <Text className="body-regular text-gray-200">
                            {user?.email || 'Loading email...'}
                        </Text>
                        
                        {/* Quick Stats */}
                        <View className="flex-row mt-6 w-full justify-around">
                            <View className="items-center">
                                <Text className="h4-bold text-primary">0</Text>
                                <Text className="small-regular text-gray-200">Orders</Text>
                            </View>
                            <View className="items-center">
                                <Text className="h4-bold text-primary">0</Text>
                                <Text className="small-regular text-gray-200">Favorites</Text>
                            </View>
                            <View className="items-center">
                                <Text className="h4-bold text-primary">★ 5.0</Text>
                                <Text className="small-regular text-gray-200">Rating</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Profile Options */}
                <View className="px-5 mb-8">
                    <Text className="h4-bold text-dark-100 mb-4">Account Settings</Text>
                    <View className="bg-white rounded-2xl shadow-sm">
                        {profileOptions.map((option, index) => (
                            <TouchableOpacity
                                key={option.id}
                                className={`flex-row items-center justify-between p-4 ${
                                    index !== profileOptions.length - 1 ? 'border-b border-gray-100' : ''
                                }`}
                                onPress={option.onPress}
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                                        <Image 
                                            source={option.icon} 
                                            className="w-5 h-5"
                                            resizeMode="contain"
                                            tintColor="#6B7280"
                                        />
                                    </View>
                                    <Text className="body-semibold text-dark-100">
                                        {option.title}
                                    </Text>
                                </View>
                                <Image 
                                    source={images.arrowRight} 
                                    className="w-4 h-4"
                                    resizeMode="contain"
                                    tintColor="#6B7280"
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Sign Out Button */}
                <View className="px-5 mb-20">
                    <TouchableOpacity
                        className="bg-red-500 rounded-2xl p-4 flex-row items-center justify-center shadow-sm"
                        onPress={handleSignOut}
                        disabled={isLoading}
                        style={{
                            opacity: isLoading ? 0.7 : 1,
                        }}
                    >
                        <Image 
                            source={images.logout} 
                            className="w-5 h-5 mr-3"
                            resizeMode="contain"
                            tintColor="#FFFFFF"
                        />
                        <Text className="body-bold text-white">
                            {isLoading ? 'Signing Out...' : 'Sign Out'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* App Info */}
                <View className="px-5 py-4 border-t border-gray-100">
                    <Text className="small-regular text-gray-200 text-center">
                        Food Delivery App v1.0.0
                    </Text>
                    <Text className="small-regular text-gray-200 text-center mt-1">
                        Made with ❤️ for food lovers
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Profile
