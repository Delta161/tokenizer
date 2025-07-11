// pages/projects/[id].tsx

import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export async function getServerSideProps(context) {
    const { id } = context.params;
    const res = await fetch(`http://localhost:3001/api/projects/${id}`);
    const project = await res.json();

    return { props: { project } };
}
      

    return (
        <>
            <Head>
                <title>{project.title} | Tokenizer Estate</title>
            </Head>

            <main className="px-6 py-12 bg-gray-50 min-h-screen">
                {/* Breadcrumb */}
                <nav className="text-sm text-gray-500 mb-4">
                    <Link href="/" className="hover:underline">Home</Link> /
                    <Link href="/projects" className="hover:underline"> Property </Link> /
                    <span className="text-black">{project.title}</span>
                </nav>

                {/* Overview Grid */}
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Left: Info */}
                    <div>
                        <img
                            src={project.imageUrl}
                            alt={project.title}
                            className="rounded-xl w-full h-72 object-cover mb-4"
                        />
                        <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                        <p className="text-gray-600 mb-2">{project.location}</p>
                        <p className="text-sm text-gray-500 mb-1">Issuer: {project.issuer}</p>
                        <p className="text-sm text-gray-500 mb-1">Chain: {project.network}</p>
                        <p className="text-sm text-gray-500 mb-1">Project Type: {project.type}</p>
                        <p className="text-sm text-gray-500 mb-1">Launch Date: {project.launchDate}</p>
                    </div>

                    {/* Right: Token Metrics */}
                    <div className="bg-white rounded-xl shadow p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Token Price</span>
                            <span className="text-lg font-semibold">€{project.tokenPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Tokens Remaining</span>
                            <span className="text-sm">{project.tokensAvailable} / {project.totalTokens}</span>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-700">Funding Progress</span>
                            <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                                <div
                                    className="h-2 bg-green-500 rounded-full"
                                    style={{ width: `${project.fundedPercent}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{project.fundedPercent}% funded</p>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-700">Status</span>
                            <p className="text-sm text-green-700 mt-1">{project.status}</p>
                        </div>

                        <button className="w-full mt-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition">
                            Sign Up to Invest
                        </button>

                        <p className="text-xs text-gray-500 mt-4">
                            Investing requires ID verification. Please complete KYC to proceed.
                        </p>
                    </div>
                </div>

                {/* Description */}
                <div className="max-w-4xl mx-auto mb-12">
                    <h2 className="text-xl font-semibold mb-3">Project Description</h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {project.description}
                    </p>
                </div>

                {/* Token Details */}
                <div className="max-w-4xl mx-auto mb-12">
                    <h2 className="text-xl font-semibold mb-3">Token Details</h2>
                    <ul className="text-sm text-gray-700 space-y-1">
                        <li><strong>Token Address:</strong> <span className="text-blue-600 underline">{project.tokenAddress}</span></li>
                        <li><strong>Total Supply:</strong> {project.totalTokens} tokens</li>
                        <li><strong>Token Standard:</strong> ERC-20</li>
                        <li><strong>Blockchain Network:</strong> {project.network}</li>
                    </ul>
                </div>

                {/* Legal Disclaimer */}
                <div className="max-w-4xl mx-auto text-xs text-gray-500 border-t pt-6">
                    <p>
                        This information does not constitute an offer to sell or a solicitation of an offer to buy securities.
                        Tokenized assets on this platform represent value claims through SPV structures, not legal ownership of property.
                        Please read our full Terms and Risk Disclosure.
                    </p>
                </div>
            </main>
        </>
    );
}
// This page displays detailed information about a specific real estate project.
// It includes project overview, token metrics, description, and legal disclaimer.  
// It is a dynamic page that fetches project data from the router query parameters.
// The project data is currently hardcoded but should be replaced with real data from an API or database in the future.
// The page also includes a button for users to sign up for investment, which will require KYC verification.
// The layout is responsive and designed to provide a clear overview of the project and its investment opportunities.
// The project details are displayed in a grid format with sections for project info, token metrics,        