import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchThreads } from "../store/threadSlice";
import CreateThread from "../components/CreateThread";
import MainLayout from "../layout/MainLayout";
import ThreadCard from "../components/ThreadCard";

const Home = () => {
  const dispatch = useDispatch<any>();
  const threads = useSelector((state: any) => state.threads.list);

  useEffect(() => {
    dispatch(fetchThreads());
  }, [dispatch]);

  const refresh = () => {
    dispatch(fetchThreads());
  };



  return (
    <MainLayout>
      <div className="border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-bold px-4 pt-4 mb-4">Home</h1>
        <CreateThread refresh={refresh} />
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
