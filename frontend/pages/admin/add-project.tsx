import { useState } from "react";

const TABS = [
    { key: "general", label: "General" },
    { key: "financial", label: "Financial" },
    { key: "details", label: "Details" },
];

export default function AddProjectForm() {
    const [form, setForm] = useState({
        title: "",
        location: "",
        imageUrl: "",
        type: "",
        tokenPrice: "",
        totalTokens: "",
        description: "",
    });
    const [activeTab, setActiveTab] = useState("general");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Call your API
        console.log("Submitting:", form);
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            <h1 className="text-2xl font-bold mb-6">Add New Project</h1>
            {/* Tabs */}
            <div className="mb-6 flex border-b border-gray-200">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 -mb-px border-b-2 font-medium transition ${
                            activeTab === tab.key
                                ? "border-purple-600 text-purple-700"
                                : "border-transparent text-gray-500 hover:text-purple-700"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <form
                onSubmit={handleSubmit}
                className="space-y-6 bg-white p-6 rounded-lg shadow border border-gray-200"
            >
                {/* General Tab */}
                {activeTab === "general" && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                                name="title"
                                type="text"
                                value={form.title}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Location</label>
                            <input
                                name="location"
                                type="text"
                                value={form.location}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Image URL</label>
                            <input
                                name="imageUrl"
                                type="url"
                                value={form.imageUrl}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                required
                            />
                        </div>
                    </>
                )}

                {/* Financial Tab */}
                {activeTab === "financial" && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Property Type</label>
                            <input
                                name="type"
                                type="text"
                                value={form.type}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Token Price (€)</label>
                                <input
                                    name="tokenPrice"
                                    type="number"
                                    step="0.01"
                                    value={form.tokenPrice}
                                    onChange={handleChange}
                                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Total Tokens</label>
                                <input
                                    name="totalTokens"
                                    type="number"
                                    value={form.totalTokens}
                                    onChange={handleChange}
                                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                    required
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* Details Tab */}
                {activeTab === "details" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            rows={4}
                            value={form.description}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        ></textarea>
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition"
                >
                    Submit Project
                </button>
            </form>
        </div>
    );
}
