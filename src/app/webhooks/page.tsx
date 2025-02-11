"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";

export default function Webhooks() {
    const [payload, setPayload] = useState("");
    const [signature, setSignature] = useState("");
    const [response, setResponse] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGenerateSignature = async () => {
        try {
            setLoading(true);
            setError("");
            setSignature("");

            const { data } = await axiosInstance.post(
                "/api/webhook/signature",
                payload,
                {
                    headers: {
                        "Content-Type": "text/plain",
                    },
                }
            );

            if (data.signature) {
                setSignature(data.signature);
            } else {
                setError(data.error || "Failed to generate signature");
            }
        } catch (err) {
            console.error(err);
            if (err instanceof AxiosError) {
                setError(
                    err.response?.data?.error ||
                        err.message ||
                        "An error occurred while generating signature"
                );
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleTestWebhook = async () => {
        try {
            setLoading(true);
            setError("");
            setResponse("");

            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please login first");
                return;
            }

            const { data } = await axiosInstance.post("/api/webhook", payload, {
                headers: {
                    "Content-Type": "application/json",
                    "x-webhook-signature": signature,
                },
            });

            setResponse(JSON.stringify(data, null, 2));

            if (!data.success) {
                setError(data.error || "Webhook test failed");
            }
        } catch (err) {
            console.error(err);
            if (err instanceof AxiosError) {
                setError(
                    err.response?.data?.error ||
                        err.message ||
                        "An error occurred while testing webhook"
                );
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Test Webhooks
                </h1>
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-4">
                        {error}
                    </div>
                )}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payload (JSON)
                        </label>
                        <textarea
                            value={payload}
                            onChange={(e) => setPayload(e.target.value)}
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Input your data in JSON format"
                        />
                    </div>

                    <div className="flex space-x-4">
                        <button
                            onClick={handleGenerateSignature}
                            disabled={loading || !payload}
                            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            Generate Signature
                        </button>
                        <button
                            onClick={handleTestWebhook}
                            disabled={loading || !payload || !signature}
                            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            Test Webhook
                        </button>
                    </div>

                    {signature && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                Signature
                            </h2>
                            <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                                {signature}
                            </pre>
                        </div>
                    )}

                    {response && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                Response
                            </h2>
                            <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                                {response}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
