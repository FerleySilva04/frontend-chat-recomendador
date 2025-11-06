import { Link, Outlet, useLocation } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { useEffect } from "react";

export default function MainLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const links = [
    { path: "/", label: "Chatbot" },
    { path: "/models", label: "Modelos" },
    { path: "/conversations", label: "Conversaciones" },
  ];

  return (
    <div className="flex flex-col min-h-screen font-[Open_Sans] bg-[#F3F4F6] text-[#1F2937]">
      {/* ===== HEADER ===== */}
      <header
        className="w-full shadow-md border-b border-[#004d29]"
        style={{ backgroundColor: "#006E3A" }} // verde UdeA institucional
      >
        <div className="flex items-center justify-between px-6 py-3 max-w-6xl mx-auto">
          <h1 className="text-base sm:text-lg font-semibold text-white">
            Chatbot Recomendador de Cursos — UdeA
          </h1>

          <nav className="flex items-center gap-6 text-sm sm:text-base font-semibold">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors duration-150 ${
                  pathname === link.path
                    ? "text-[#FFD700] border-b-2 border-[#FFD700]"
                    : "text-white hover:text-[#FFD700]"
                }`}
                style={{ color: pathname === link.path ? "#FFD700" : "white" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <main className="flex-1 w-full px-6 py-8 max-w-6xl mx-auto">
        <Outlet />
      </main>

      {/* ===== FOOTER ===== */}
      <footer
        className="w-full text-center text-sm py-3 shadow-inner"
        style={{ backgroundColor: "#006E3A", color: "white" }}
      >
        <div className="flex items-center justify-center gap-2">
          <GraduationCap className="w-4 h-4 text-white" />
          <span>
            © {new Date().getFullYear()} Universidad de Antioquia — Proyecto Chatbot
          </span>
        </div>
      </footer>
    </div>
  );
}
