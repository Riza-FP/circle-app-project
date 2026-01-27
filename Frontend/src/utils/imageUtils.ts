
export const getAvatarUrl = (path: string | undefined | null) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `http://localhost:5000${path}`;
};
