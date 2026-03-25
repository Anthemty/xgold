import Navbar from "@/components/navbar";

export default function DAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-amber-950/20 to-slate-950">
      <Navbar />
      {children}
    </div>
  );
}
