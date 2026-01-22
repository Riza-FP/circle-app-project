import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchThreads } from "../store/threadSlice";
import CreateThread from "../components/CreateThread";
import MainLayout from "../layout/MainLayout";
import ThreadCard from "../components/ThreadCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Home = () => {
  const dispatch = useDispatch<any>();
  const threads = useSelector((state: any) => state.threads.list);

  useEffect(() => {
    dispatch(fetchThreads());
  }, [dispatch]);

  const user = useSelector((state: any) => state.auth.user);

  return (
    <MainLayout>
      <div className="border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-bold px-4 pt-4 mb-4">Home</h1>
        <div className="px-4">
          <CreateThread>
            <div className="flex items-center space-x-4 cursor-text w-full">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.avatar} className="object-cover" />
                <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="text-gray-500 text-xl">What is happening?!</div>
            </div>
          </CreateThread>
        </div>
      </div>

      <div>
        {threads.map((thread: any) => (
          <ThreadCard key={thread.id} thread={thread} />
        ))}
      </div>
    </MainLayout>
  );
};

export default Home;
