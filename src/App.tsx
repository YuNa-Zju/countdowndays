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
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

export default App;
