import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import EventList from "./components/EventList";
import FloatingButton from "./components/FloatingButton";
import GlobalModals from "./components/GlobalModals";
import "./App.css";

function App() {
  return (
    <div className="min-h-screen bg-base-200 font-sans transition-colors duration-300">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <EventList />
      </main>
      <FloatingButton />

      <GlobalModals />

      {/* 5. Toast 强制居下，完全不透明胶囊风格 */}
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
