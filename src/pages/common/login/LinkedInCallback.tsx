"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { login } from "@/redux/slice/authSlice";
import Loader from "../loader/Loader";

export default function LinkedInCallback() {
    const router = useRouter();
    const params = useSearchParams();
    const dispatch = useDispatch();
    const called = useRef(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (called.current) return;
        called.current = true;

        const code = params.get("code");
        const error = params.get("error");

        if (error || !code) {
            router.replace("/");
            return;
        }

        sessionStorage.removeItem("linkedin_state");

        const loginWithLinkedIn = async () => {
            const API_URL =
                process.env.NEXT_PUBLIC_DEVELOPMENT_MODE === "prod"
                    ? process.env.NEXT_PUBLIC_API_URL_PROD!
                    : process.env.NEXT_PUBLIC_API_URL_TEST!;

            try {
                setLoading(true);

                const res = await fetch(
                    `${API_URL}/auth/linkedin/callback`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ code }),
                    }
                );

                const result = await res.json();

                if (!result.success) {
                    router.replace("/");
                    return;
                }

                const { token, user } = result.data;

                /* ✅ Save token */
                localStorage.setItem("token", token);

                /* ✅ Update redux */
                dispatch(login({ user, token }));

                /* ✅ Role-based redirect */
                switch (user.roletbl_roleName) {
                    case "SUPER_ADMIN":
                        router.replace("/super-admin");
                        break;
                    case "OPERATIONS_ADMIN":
                        router.replace("/operations-admin");
                        break;
                    case "FINANCE_ADMIN":
                        router.replace("/finance-admin");
                        break;
                    case "SUPPORT_ADMIN":
                        router.replace("/support-admin");
                        break;
                    case "RECRUITER":
                        router.replace("/recruiter");
                        break;
                    default:
                        router.replace("/");
                }
            } catch (err) {
                console.error("LinkedIn login failed:", err);
                router.replace("/");
            } finally {
                setLoading(false);
            }
        };

        loginWithLinkedIn();
    }, [dispatch, params, router]);

    /*  Loader while authenticating */
    if (loading) {
        return <Loader />;
    }
    return <Loader />;
}
