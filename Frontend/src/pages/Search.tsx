import { useState, useEffect } from "react";
import MainLayout from "../layout/MainLayout";
import { searchUsers } from "../services/searchApi";
import FollowCard from "../components/FollowCard";
import { useDebounce } from "../hooks/useDebounce";
import { Loader2, Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

const Search = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Debounce query (wait 500ms)
    const debouncedQuery = useDebounce(query, 500);

    useEffect(() => {
        const performSearch = async () => {
            if (!debouncedQuery.trim()) {
                setResults([]);
                setHasSearched(false);
                return;
            }

            setLoading(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 900));

                const res = await searchUsers(debouncedQuery);
                setResults(res.data.data.users);
                setHasSearched(true);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [debouncedQuery]);

    return (
        <MainLayout>
            <div className="w-full min-h-screen border-r border-gray-800 text-white">
                <div className="p-4 border-b border-gray-800">
                    <h1 className="text-xl font-bold mb-4">Search</h1>
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <Input
                            type="text"
                            placeholder="Search users..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-gray-900 border-gray-700 text-white pl-10 rounded-full focus:border-green-500 focus:ring-green-500"
                        />
                    </div>
                </div>

                <div className="p-0">
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                        </div>
                    ) : (
                        <>
                            {results.length > 0 ? (
                                results.map((user) => (
                                    <FollowCard key={user.id} user={user} />
                                ))
                            ) : (
                                hasSearched && debouncedQuery && (
                                    <div className="text-center text-gray-500 py-8">
                                        No users found matching "{debouncedQuery}".
                                    </div>
                                )
                            )}

                            {!hasSearched && !debouncedQuery && (
                                <div className="text-center text-gray-500 py-16 flex flex-col items-center">
                                    <SearchIcon className="w-12 h-12 mb-4 opacity-20" />
                                    <p>Try searching for people or topics.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default Search;
