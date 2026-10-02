import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Menu,
    X,
    House,
    User,
    Settings,
    LogOut,
} from "lucide-react";
import api from "../services/api";

export default function Header() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await api.post("/logout");
        } catch {
            // Даже если API logout недоступен,
            // локальный токен всё равно удаляем.
        }

        localStorage.removeItem("token");
        setMenuOpen(false);
        navigate("/login");
    };

    return (
        <>
            {/* HEADER */}
            <header className="border-b border-[var(--color-border)]">
                <div className="mx-auto flex min-h-[64px] max-w-[1100px] items-center justify-between gap-4 px-4 sm:px-6">
                    <Link
                        to="/"
                        className="text-xl font-bold tracking-wide text-white no-underline"
                    >
                        Tynda.kz
                    </Link>

                    <button
                        type="button"
                        onClick={() => setMenuOpen(true)}
                        aria-label="Открыть меню"
                        className="flex items-center justify-center border-0 bg-transparent p-2 text-[var(--color-accent)] outline-none transition-transform hover:scale-110"
                    >
                        <Menu
                            size={27}
                            strokeWidth={1.8}
                        />
                    </button>
                </div>
            </header>

            {/* OVERLAY */}
            <div
                onClick={() => setMenuOpen(false)}
                className={`fixed inset-0 z-40 bg-black/70 transition-opacity duration-300 ${
                    menuOpen
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                }`}
            />

            {/* SIDE MENU */}
            <aside
                className={`fixed right-0 top-0 z-50 flex h-full w-[280px] max-w-[85vw] flex-col border-l border-[var(--color-border)] bg-[var(--color-bg)] transition-transform duration-300 ease-out ${
                    menuOpen
                        ? "translate-x-0"
                        : "translate-x-full"
                }`}
            >
                <div className="relative flex min-h-[64px] items-center justify-center border-b border-[var(--color-border)]">
                    <span className="text-base font-semibold uppercase tracking-[0.2em] text-white">
                        Menu
                    </span>

                    <button
                        type="button"
                        onClick={() => setMenuOpen(false)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 border-0 bg-transparent p-2 text-[var(--color-accent)] outline-none transition-transform hover:scale-110"
                        aria-label="Закрыть меню"
                    >
                        <X
                            size={25}
                            strokeWidth={1.8}
                        />
                    </button>
                </div>

                <nav className="flex flex-1 flex-col">
                    <div className="flex flex-1 flex-col items-center justify-center gap-9">
                        <Link
                            to="/"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 text-base font-medium uppercase tracking-wider text-white no-underline transition-colors hover:text-[var(--color-accent)]"
                        >
                            <House size={20} strokeWidth={1.5} />
                            <span>Главная</span>
                        </Link>

                        <Link
                            to="/profile"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 text-base font-medium uppercase tracking-wider text-white no-underline transition-colors hover:text-[var(--color-accent)]"
                        >
                            <User size={20} strokeWidth={1.5} />
                            <span>Профиль</span>
                        </Link>

                        <Link
                            to="/settings"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 text-base font-medium uppercase tracking-wider text-white no-underline transition-colors hover:text-[var(--color-accent)]"
                        >
                            <Settings size={20} strokeWidth={1.5} />
                            <span>Настройки</span>
                        </Link>
                    </div>

                    <div className="flex justify-center border-t border-[var(--color-border)] py-7">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center gap-3 border-0 bg-transparent p-2 text-base font-medium uppercase tracking-wider text-white transition-colors hover:text-[var(--color-accent)]"
                        >
                            <LogOut size={20} strokeWidth={1.5} />
                            <span>Выйти</span>
                        </button>
                    </div>
                </nav>
            </aside>
        </>
    );
}