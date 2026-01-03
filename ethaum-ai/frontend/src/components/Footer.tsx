import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t bg-gray-50">
            <div className="container mx-auto px-4 py-12">
                <div className="grid gap-8 md:grid-cols-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
                                <span className="text-sm font-bold text-white">E</span>
                            </div>
                            <span className="text-lg font-semibold text-gray-900">
                                EthAum AI
                            </span>
                        </div>
                        <p className="mt-4 text-sm text-gray-600">
                            AI-powered credibility for growth-stage startups.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900">Product</h4>
                        <ul className="mt-4 space-y-2 text-sm text-gray-600">
                            <li>
                                <Link href="/marketplace" className="hover:text-gray-900">
                                    Marketplace
                                </Link>
                            </li>
                            <li>
                                <Link href="/insights" className="hover:text-gray-900">
                                    Insights
                                </Link>
                            </li>
                            <li>
                                <Link href="/launch" className="hover:text-gray-900">
                                    Launch
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900">Company</h4>
                        <ul className="mt-4 space-y-2 text-sm text-gray-600">
                            <li>
                                <Link href="#" className="hover:text-gray-900">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-gray-900">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-gray-900">
                                    Careers
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900">Legal</h4>
                        <ul className="mt-4 space-y-2 text-sm text-gray-600">
                            <li>
                                <Link href="#" className="hover:text-gray-900">
                                    Privacy
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-gray-900">
                                    Terms
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t pt-8 text-center text-sm text-gray-500">
                    © 2026 EthAum AI. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
