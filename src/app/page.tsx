"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";

interface User {
    _id: string;
    email: string;
    name: string;
    createdAt: string;
}

export default function Home() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const { data } = await axiosInstance.get("/api/users/me");
                setUser(data);
            } catch (err) {
                console.error(err);
                if (err instanceof AxiosError) {
                    setError(
                        err.response?.data?.error ||
                            err.message ||
                            "Failed to fetch user data"
                    );
                } else {
                    setError("An unexpected error occurred");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentUser();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
                {error}
            </div>
        );
    }

    if (!user) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 rounded-lg p-4">
                Please log in to view your profile
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
                My Profile
            </h1>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-500">
                        Name
                    </label>
                    <div className="mt-1 text-lg text-gray-900">
                        {user.name}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-500">
                        Email
                    </label>
                    <div className="mt-1 text-lg text-gray-900">
                        {user.email}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-500">
                        Member Since
                    </label>
                    <div className="mt-1 text-lg text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>
    );
}
