"use client"; 
import { GoogleOAuthProvider } from "@react-oauth/google"; 
export default function GoogleProviderWrapper({ children }: any) {
  return (
    <GoogleOAuthProvider clientId="398434619326-9ilsmfq8j74kbosrhuvp19oqajdsaikh.apps.googleusercontent.com">
      {children}
    </GoogleOAuthProvider>
  );
}
