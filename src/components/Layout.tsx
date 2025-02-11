import Link from "next/link";
import { ReactNode } from "react";

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <Link
                                href="/"
                                className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900"
                            >
                                Home
                            </Link>
                            <Link
                                href="/users"
                                className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900"
                            >
                                Users
                            </Link>
                            <Link
                                href="/webhooks"
                                className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900"
                            >
                                Webhooks
                            </Link>
                        </div>
                        <div className="flex items-center">
                            <div className="flex gap-2">
                                <Link
                                    href="/register"
                                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Register
                                </Link>
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                    Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
