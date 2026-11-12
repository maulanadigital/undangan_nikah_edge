import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, ShieldCheck } from "lucide-react";

const fieldClass =
  "mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100";

export default function PublicHome() {
  const [form, setForm] = useState({
    groomName: "",
    brideName: "",
    eventDate: "",
    whatsapp: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request gagal dikirim.");
      setSuccess(true);
      setForm({ groomName: "", brideName: "", eventDate: "", whatsapp: "" });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] px-4 py-8 text-stone-800 sm:py-14">
      <header className="mx-auto flex max-w-5xl items-center justify-between">
        <a href="/" className="flex items-center gap-2 font-serif text-2xl">
          <Heart className="text-rose-600" size={21} />
          Sakeenah
        </a>
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-600 hover:bg-white"
        >
          <ShieldCheck size={16} /> Login admin
        </Link>
      </header>

      <div className="mx-auto grid max-w-5xl items-center gap-10 py-12 md:grid-cols-[1fr_0.9fr] md:py-20">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-600">
            Undangan digital personal
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-stone-900 sm:text-5xl">
            Rayakan hari istimewa dengan undangan yang berkesan.
          </h1>
          <p className="mt-5 max-w-xl leading-7 text-stone-600">
            Kirim detail acara Anda. Admin kami akan menghubungi melalui
            WhatsApp untuk membahas pembuatan undangan.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-stone-500">
            Setiap undangan memiliki tautan sendiri untuk dibagikan kepada tamu.
            <ArrowRight size={16} />
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-stone-900">
            Request undangan baru
          </h2>
          <p className="mt-1 text-sm leading-6 text-stone-500">
            Isi informasi dasar. Admin akan menghubungi Anda secara manual.
          </p>

          {success ? (
            <div className="mt-6 rounded-xl bg-emerald-50 p-5 text-sm leading-6 text-emerald-800">
              Request berhasil dikirim. Admin akan menghubungi Anda melalui
              WhatsApp.
              <button
                className="mt-3 block font-semibold underline"
                onClick={() => setSuccess(false)}
              >
                Kirim request lain
              </button>
            </div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={submit}>
              <label className="block text-sm font-medium">
                Nama mempelai pria
                <input
                  className={fieldClass}
                  required
                  maxLength={120}
                  value={form.groomName}
                  onChange={(event) =>
                    setForm({ ...form, groomName: event.target.value })
                  }
                />
              </label>
              <label className="block text-sm font-medium">
                Nama mempelai wanita
                <input
                  className={fieldClass}
                  required
                  maxLength={120}
                  value={form.brideName}
                  onChange={(event) =>
                    setForm({ ...form, brideName: event.target.value })
                  }
                />
              </label>
              <label className="block text-sm font-medium">
                Tanggal acara
                <input
                  className={fieldClass}
                  type="date"
                  required
                  value={form.eventDate}
                  onChange={(event) =>
                    setForm({ ...form, eventDate: event.target.value })
                  }
                />
              </label>
              <label className="block text-sm font-medium">
                Nomor WhatsApp
                <input
                  className={fieldClass}
                  type="tel"
                  required
                  maxLength={24}
                  placeholder="08xxxxxxxxxx"
                  value={form.whatsapp}
                  onChange={(event) =>
                    setForm({ ...form, whatsapp: event.target.value })
                  }
                />
              </label>
              {error && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </p>
              )}
              <button
                className="w-full rounded-lg bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                disabled={busy}
              >
                {busy ? "Mengirim..." : "Kirim request"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
