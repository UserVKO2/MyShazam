import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] =
        useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async (event) => {
        event.preventDefault();

        setError("");

        if (password !== passwordConfirmation) {
            setError("Пароли не совпадают");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/register", {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });

            if (response.data.token) {
                localStorage.setItem(
                    "token",
                    response.data.token,
                );
            }

            navigate("/");
        } catch (err) {
            const errors = err?.response?.data?.errors;

            if (errors) {
                const firstError = Object.values(errors)
                    .flat()
                    .find(Boolean);

                setError(
                    firstError ||
                        "Не удалось создать аккаунт",
                );
            } else {
                setError(
                    err?.response?.data?.message ||
                        "Не удалось создать аккаунт",
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg)] text-white">
            <main className="flex min-h-screen items-center justify-center px-4 py-8">
                <section className="w-full max-w-[430px]">
                    <div className="mb-8 text-center">
                        <Link
                            to="/"
                            className="text-3xl font-bold tracking-wide text-white no-underline"
                        >
                            Tynda.kz
                        </Link>

                        <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                            Create your account
                        </p>
                    </div>

                    <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-7">
                        <h1 className="m-0 text-2xl font-bold text-white">
                            Register
                        </h1>

                        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                            Create a new Tynda.kz account
                        </p>

                        <form
                            onSubmit={handleRegister}
                            className="mt-6"
                        >
                            <div className="mb-4">
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-sm text-white"
                                >
                                    Name
                                </label>

                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(event) =>
                                        setName(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Enter your name"
                                    autoComplete="name"
                                    required
                                    className="box-border h-[50px] min-h-[50px] w-full rounded-none border border-white bg-transparent px-4 text-sm leading-normal text-white outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]"
                                />
                            </div>

                            <div className="mb-4">
                                <label
                                    htmlFor="register-email"
                                    className="mb-2 block text-sm text-white"
                                >
                                    Email
                                </label>

                                <input
                                    id="register-email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                    required
                                    className="box-border h-[50px] min-h-[50px] w-full rounded-none border border-white bg-transparent px-4 text-sm leading-normal text-white outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]"
                                />
                            </div>

                            <div className="mb-4">
                                <label
                                    htmlFor="register-password"
                                    className="mb-2 block text-sm text-white"
                                >
                                    Password
                                </label>

                                <input
                                    id="register-password"
                                    type="password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Create a password"
                                    autoComplete="new-password"
                                    required
                                    className="box-border h-[50px] min-h-[50px] w-full rounded-none border border-white bg-transparent px-4 text-sm leading-normal text-white outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]"
                                />
                            </div>

                            <div className="mb-4">
                                <label
                                    htmlFor="password-confirmation"
                                    className="mb-2 block text-sm text-white"
                                >
                                    Confirm password
                                </label>

                                <input
                                    id="password-confirmation"
                                    type="password"
                                    value={
                                        passwordConfirmation
                                    }
                                    onChange={(event) =>
                                        setPasswordConfirmation(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Repeat your password"
                                    autoComplete="new-password"
                                    required
                                    className="box-border h-[50px] min-h-[50px] w-full rounded-none border border-white bg-transparent px-4 text-sm leading-normal text-white outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]"
                                />
                            </div>

                            {error && (
                                <div className="mb-4 border border-[#ff6b6b] bg-transparent p-3 text-sm text-[#ff6b6b]">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="box-border h-[50px] min-h-[50px] w-full rounded-none border border-white bg-transparent px-5 text-sm font-semibold leading-none text-white transition-colors hover:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading
                                    ? "Creating..."
                                    : "Create account"}
                            </button>
                        </form>

                        <div className="mt-6 border-t border-[var(--color-border)] pt-5 text-center">
                            <p className="m-0 text-sm text-[var(--color-text-muted)]">
                                Already have an account?
                            </p>

                            <Link
                                to="/login"
                                className="mt-2 inline-block text-sm text-white no-underline transition-colors hover:text-[var(--color-accent)]"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}