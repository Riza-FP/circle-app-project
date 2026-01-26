import { useParams } from "react-router-dom";

const Profile = () => {
    const { id } = useParams();
    return (
        <div className="w-full text-white p-4">
            <h1 className="text-2xl font-bold">Profile Page</h1>
            <p className="text-gray-500">UserID: {id}</p>
            <p className="text-gray-500">Coming soon...</p>
        </div>
    );
};

export default Profile;
