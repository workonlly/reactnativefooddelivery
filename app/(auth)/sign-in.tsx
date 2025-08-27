import {View, Text, Button, Alert} from 'react-native'
import {Link, router} from "expo-router";
import CustomInput from "@/components/CustomInput";
import CustomButton from "@/components/CustomButton";
import {useState} from "react";
import {signIn} from "@/lib/appwrite";
import * as Sentry from '@sentry/react-native'
import useAuthStore from "@/store/auth.store";

const SignIn = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });
    const { fetchAuthenticatedUser, signOut, isAuthenticated } = useAuthStore();

    const submit = async () => {
        const { email, password } = form;

        if(!email || !password) return Alert.alert('Error', 'Please enter valid email address & password.');

        setIsSubmitting(true)

        try {
            await signIn({ email, password });
            
            // Update the auth state after successful sign-in
            await fetchAuthenticatedUser();
            
            // The redirect will happen automatically via the auth layout
        } catch(error: any) {
            Alert.alert('Error', error.message);
            Sentry.captureEvent(error);
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleEndSession = async () => {
        Alert.alert(
            'End Session',
            'Are you sure you want to sign out of your current session?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        setIsSigningOut(true);
                        try {
                            await signOut();
                            Alert.alert('Success', 'You have been signed out successfully.');
                        } catch (error: any) {
                            Alert.alert('Error', 'Failed to sign out. Please try again.');
                            Sentry.captureEvent(error);
                        } finally {
                            setIsSigningOut(false);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    }

    return (
        <View className="gap-10 bg-white rounded-lg p-5 mt-5">
            <CustomInput
                placeholder="Enter your email"
                value={form.email}
                onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
                label="Email"
                keyboardType="email-address"
            />
            <CustomInput
                placeholder="Enter your password"
                value={form.password}
                onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
                label="Password"
                secureTextEntry={true}
            />

            <CustomButton
                title="Sign In"
                isLoading={isSubmitting}
                onPress={submit}
            />

            {/* End Session Button - Only show if there might be an active session */}
            <CustomButton
                title="End Current Session"
                isLoading={isSigningOut}
                onPress={handleEndSession}
                style="bg-red-500"
            />

            <View className="flex justify-center mt-5 flex-row gap-2">
                <Text className="base-regular text-gray-100">
                    Don't have an account?
                </Text>
                <Link href="/sign-up" className="base-bold text-primary">
                    Sign Up
                </Link>
            </View>
        </View>
    )
}

export default SignIn
