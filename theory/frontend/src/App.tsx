import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/Home";
import Kegiatan from "@/pages/Kegiatan";
import Struktur from "@/pages/Struktur";
import Anggota from "@/pages/Anggota";
import Projek from "@/pages/Projek";
import Tujuan from "@/pages/Tujuan";
import Login from "@/pages/Login";
import Admin from "@/pages/Admin";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/kegiatan" element={<Kegiatan />} />
          <Route path="/struktur" element={<Struktur />} />
          <Route path="/anggota" element={<Anggota />} />
          <Route path="/projek" element={<Projek />} />
          <Route path="/tujuan" element={<Tujuan />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}
