import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Heart, LockKeyhole, ShieldCheck } from "lucide-react";
import { adminApi } from "./admin-api";
import AdminDashboard from "./components/admin-dashboard";

const fieldClass =
  "mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100";
const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60";

function AuthForm({ setup, onSuccess }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (setup) {
        await adminApi.setup({ username, password, setupToken });
      }
      await adminApi.login({ username, password });
      onSuccess({ username });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf9f7] px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-7 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            {setup ? <ShieldCheck size={22} /> : <Heart size={22} />}
          </div>
          <div>
            <p className="font-serif text-2xl text-stone-900">Sakeenah</p>
            <p className="text-sm text-stone-500">Pengelolaan undangan</p>
          </div>
        </div>
        <h1 className="text-xl font-semibold text-stone-900">
          {setup ? "Aktifkan akun pengelola" : "Masuk ke dashboard"}
        </h1>
        <p className="mt-1 text-sm leading-6 text-stone-500">
          {setup
            ? "Buat akun pengelola pertama. Kunci setup hanya digunakan satu kali."
            : "Kelola undangan, RSVP, dan ucapan tamu dengan aman."}
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-stone-700">
            Username
            <input
              className={fieldClass}
              type="text"
              autoComplete="username"
              maxLength={64}
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>
          {setup && (
            <label className="block text-sm font-medium text-stone-700">
              Kunci setup satu kali
              <input
                className={fieldClass}
                type="password"
                autoComplete="off"
                minLength={32}
                required
                value={setupToken}
                onChange={(event) => setSetupToken(event.target.value)}
              />
            </label>
          )}
          <label className="block text-sm font-medium text-stone-700">
            {setup ? "Buat password (min. 12 karakter)" : "Password"}
            <input
              className={fieldClass}
              type="password"
              autoComplete={setup ? "new-password" : "current-password"}
              minLength={setup ? 12 : 1}
              maxLength={128}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error && (
            <p
              className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
              role="alert"
            >
              {error}
            </p>
          )}
          <button className={`${buttonClass} w-full`} disabled={busy}>
            <LockKeyhole size={16} />
            {busy ? "Memproses..." : setup ? "Buat akun dan masuk" : "Masuk"}
          </button>
        </form>
        <a
          href="/"
          className="mt-6 block text-center text-sm text-stone-500 hover:text-rose-700"
        >
          Kembali ke undangan
        </a>
      </section>
    </main>
  );
}

export default function AdminApp() {
  const location = useLocation();
  const [state, setState] = useState({
    loading: true,
    administrator: null,
    setupRequired: false,
    setupAvailable: false,
    error: "",
  });

  useEffect(() => {
    let active = true;
    Promise.all([
      adminApi.setupStatus(),
      adminApi.me().catch((requestError) => {
        if (requestError.status === 401) return null;
        throw requestError;
      }),
    ])
      .then(([setup, auth]) => {
        if (active) {
          setState({
            loading: false,
            administrator: auth?.data || null,
            setupRequired: setup.setupRequired,
            setupAvailable: setup.setupAvailable,
            error: "",
          });
        }
      })
      .catch((requestError) => {
        if (active) {
          setState({
            loading: false,
            administrator: null,
            setupRequired: false,
            setupAvailable: false,
            error: requestError.message,
          });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  if (state.loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf9f7] text-sm text-stone-500">
        Memeriksa sesi...
      </main>
    );
  }

  if (state.error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf9f7] px-4">
        <section className="max-w-lg rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-stone-900">
            Dashboard tidak dapat dimuat
          </h1>
          <p className="mt-2 text-sm leading-6 text-rose-700" role="alert">
            {state.error}
          </p>
          <button
            className="mt-5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => window.location.reload()}
          >
            Coba lagi
          </button>
        </section>
      </main>
    );
  }

  if (!state.administrator) {
    const wantsSetup =
      state.setupRequired && location.pathname !== "/admin/login";
    if (wantsSetup && !state.setupAvailable) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#faf9f7] px-4">
          <section className="max-w-lg rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
            <ShieldCheck className="mb-4 text-rose-600" size={28} />
            <h1 className="text-xl font-semibold text-stone-900">
              Setup dashboard belum diaktifkan
            </h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Admin pertama belum dibuat. Pemilik situs perlu mengatur secret{" "}
              <code>ADMIN_SETUP_TOKEN</code> di Cloudflare, lalu muat ulang
              halaman ini. Secret dipakai sekali untuk membuat password admin.
            </p>
            <a
              href="/"
              className="mt-5 inline-flex text-sm font-medium text-rose-700"
            >
              Kembali ke undangan
            </a>
          </section>
        </main>
      );
    }
    return (
      <AuthForm
        setup={wantsSetup}
        onSuccess={(administrator) =>
          setState((current) => ({ ...current, administrator }))
        }
      />
    );
  }

  return (
    <AdminDashboard
      administrator={state.administrator}
      onLogout={() =>
        setState((current) => ({ ...current, administrator: null }))
      }
    />
  );
}
