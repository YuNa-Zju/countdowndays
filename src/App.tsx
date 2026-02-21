import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import EventList from "./components/EventList";
import FloatingButton from "./components/FloatingButton";
import GlobalModals from "./components/GlobalModals";
import { useEventStore } from "./store/eventStore";
import "./App.css";

function App() {
  // 1. 从 Store 中拿出 fetchData 方法
  const { fetchData } = useEventStore();

  // 2. 🌟 核心初始化：组件挂载时，主动去拿一次数据
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-base-200 font-sans transition-colors duration-300">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <EventList />
      </main>
      <FloatingButton />

      <GlobalModals />

      <Toaster
        position="bottom-center"
        reverseOrder={false}
        toastOptions={{
          className:
            "!bg-base-100 !text-base-content !rounded-full !shadow-xl !border !border-base-200 !px-6 !py-3 font-medium",
          duration: 3000,
        }}
      />
    </div>
  );
}

export default App;
