import {SafeAreaView} from "react-native-safe-area-context";
import { FlatList, Image, Pressable, Text, TouchableOpacity, View, StatusBar} from "react-native";
import {Fragment, useState} from "react";
import cn from 'clsx';
import { router } from 'expo-router';

import CartButton from "@/components/CartButton";
import {images, offers} from "@/constants";
import useAuthStore from "@/store/auth.store";
import useAppwrite from "@/lib/useAppwrite";
import { getCategories } from "@/lib/appwrite";

export default function Index() {
  const { user } = useAuthStore();
  const { data: categories } = useAppwrite({ fn: getCategories });
  const [currentTime, setCurrentTime] = useState(new Date());

  // Get greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Function to handle offer navigation
  const handleOfferPress = (offerTitle: string) => {
    console.log(`Offer pressed: ${offerTitle}`);
    console.log(`Categories available:`, categories);
    
    // Find the category ID by name
    const findCategoryId = (categoryName: string) => {
      const category = categories?.find(cat => cat.name === categoryName);
      console.log(`Looking for category: ${categoryName}, found:`, category);
      return category?.$id;
    };
    
    switch (offerTitle) {
      case 'SUMMER COMBO':
        // Navigate to search with all items (no category filter)
        console.log('Navigating to search (no filter)');
        router.push('/search');
        break;
      case 'BURGER BASH':
        // Navigate to search with burger category
        const burgerId = findCategoryId('Burgers');
        console.log('Burger category ID:', burgerId);
        if (burgerId) {
          router.push(`/search?category=${burgerId}`);
        } else {
          console.log('Burger category not found, navigating to search');
          router.push('/search');
        }
        break;
      case 'PIZZA PARTY':
        // Navigate to search with pizza category
        const pizzaId = findCategoryId('Pizzas');
        console.log('Pizza category ID:', pizzaId);
        if (pizzaId) {
          router.push(`/search?category=${pizzaId}`);
        } else {
          console.log('Pizza category not found, navigating to search');
          router.push('/search');
        }
        break;
      case 'BURRITO DELIGHT':
        // Navigate to search with burrito category
        const burritoId = findCategoryId('Burritos');
        console.log('Burrito category ID:', burritoId);
        if (burritoId) {
          router.push(`/search?category=${burritoId}`);
        } else {
          console.log('Burrito category not found, navigating to search');
          router.push('/search');
        }
        break;
      default:
        // Default to search page
        console.log('Default case, navigating to search');
        router.push('/search');
    }
  };

  return (
      <SafeAreaView className="flex-1 bg-white">
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          
          <FlatList
              data={offers}
              renderItem={({ item, index }) => (
                  <View className="mx-5 mb-6">
                      <Pressable
                          className="rounded-3xl overflow-hidden shadow-lg"
                          style={{ 
                              backgroundColor: item.color,
                              minHeight: 160,
                              shadowColor: item.color,
                              shadowOffset: { width: 0, height: 8 },
                              shadowOpacity: 0.3,
                              shadowRadius: 12,
                              elevation: 8
                          }}
                          android_ripple={{ color: "#ffffff22"}}
                          onPress={() => {
                            console.log(`Navigating to ${item.title}`);
                            handleOfferPress(item.title);
                          }}
                      >
                          {({ pressed }) => (
                              <View className="flex-row items-center p-6">
                                  <View className="flex-1">
                                      <Text className="text-3xl font-bold text-white leading-tight mb-2">
                                          {item.title}
                                      </Text>
                                      <View className="bg-white/20 rounded-full p-3 backdrop-blur-sm self-start">
                                          <Image
                                            source={images.arrowRight}
                                            className="size-6"
                                            resizeMode="contain"
                                            tintColor="#ffffff"
                                          />
                                      </View>
                                  </View>
                                  <View className="w-24 h-24">
                                    <Image 
                                        source={item.image} 
                                        className="size-full"
                                        resizeMode="contain" 
                                        style={{
                                            transform: [{ scale: pressed ? 0.95 : 1 }]
                                        }}
                                    />
                                  </View>
                              </View>
                          )}
                      </Pressable>
                  </View>
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 120 }}
              ListHeaderComponent={() => (
                  <View className="px-5 py-6">
                      {/* Header Section */}
                      <View className="flex-row items-center justify-between mb-8">
                          <View className="flex-1">
                              <Text className="text-lg text-gray-400 font-medium">
                                  {getGreeting()} 👋
                              </Text>
                              <Text className="text-2xl font-bold text-gray-900 mt-1">
                                  {user?.name || 'Food Lover'}
                              </Text>
                          </View>
                          <CartButton />
                      </View>

                      {/* Delivery Location */}
                      <View className="bg-gray-50 rounded-2xl p-4 mb-8">
                          <View className="flex-row items-center justify-between">
                              <View className="flex-1">
                                  <Text className="text-sm font-semibold text-primary uppercase tracking-wide">
                                      DELIVER TO
                                  </Text>
                                  <TouchableOpacity className="flex-row items-center mt-1">
                                      <Image 
                                          source={images.location} 
                                          className="w-4 h-4 mr-2"
                                          resizeMode="contain"
                                          tintColor="#666"
                                      />
                                      <Text className="text-lg font-bold text-gray-900 mr-2">
                                          Croatia
                                      </Text>
                                      <Image 
                                          source={images.arrowDown} 
                                          className="w-3 h-3"
                                          resizeMode="contain"
                                          tintColor="#666"
                                      />
                                  </TouchableOpacity>
                              </View>
                              <View className="bg-green-100 rounded-full px-3 py-1">
                                  <Text className="text-green-600 font-semibold text-xs">
                                      Available
                                  </Text>
                              </View>
                          </View>
                      </View>

                      {/* Popular Categories Quick Access */}
                      <View className="mb-8">
                          <Text className="text-xl font-bold text-gray-900 mb-4">
                              Quick Categories
                          </Text>
                          <View className="flex-row flex-wrap gap-3">
                              {categories?.slice(0, 4).map((category) => (
                                  <TouchableOpacity
                                      key={category.$id}
                                      className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex-row items-center"
                                      onPress={() => router.push(`/search?category=${category.$id}`)}
                                  >
                                      <Text className="text-gray-700 font-medium text-sm">
                                          {category.name}
                                      </Text>
                                      <Image 
                                          source={images.arrowRight} 
                                          className="w-3 h-3 ml-2"
                                          resizeMode="contain"
                                          tintColor="#666"
                                      />
                                  </TouchableOpacity>
                              ))}
                          </View>
                      </View>

                      {/* Special Offers Section Header */}
                      <View className="flex-row items-center justify-between mb-6">
                          <View>
                              <Text className="text-xl font-bold text-gray-900">
                                  Special Offers
                              </Text>
                              <Text className="text-gray-500 mt-1">
                                  Don't miss out on these amazing deals!
                              </Text>
                          </View>
                          <TouchableOpacity 
                              className="bg-primary/10 rounded-full p-2"
                              onPress={() => router.push('/search')}
                          >
                              <Text className="text-primary font-semibold text-sm px-2">
                                  View All
                              </Text>
                          </TouchableOpacity>
                      </View>
                  </View>
              )}
          />
      </SafeAreaView>
  );
}
