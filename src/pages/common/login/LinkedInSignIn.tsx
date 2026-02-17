"use client";
import { FaLinkedinIn } from "react-icons/fa";
const LinkedInSignIn = () => {
  const handleLinkedInLogin = () => { 
    const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID!;

    // ✅ Choose redirect URI based on mode  
    const redirectUri =
      process.env.NEXT_PUBLIC_DEVELOPMENT_MODE === "prod"
        ? process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI_PROD!
        : process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI_TEST!;

    const state = Math.random().toString(36).substring(2);
    sessionStorage.setItem("linkedin_state", state);  

    const authUrl =
      "https://www.linkedin.com/oauth/v2/authorization" +
      "?response_type=code" +
      `&client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${state}` +
      "&scope=openid%20profile%20email";  

    window.location.href = authUrl;
  };

  return <span className="socialIcon linkdin"  onClick={handleLinkedInLogin}><FaLinkedinIn /></span>
};

export default LinkedInSignIn;
