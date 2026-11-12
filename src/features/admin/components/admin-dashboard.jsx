import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  ExternalLink,
  LogOut,
  MessageSquareText,
  Plus,
  Settings,
  ShieldCheck,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import { adminApi } from "../admin-api";
import { parseGuestCsv, parseGuestNames } from "../guest-import";

const inputClass =
  "mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100";
const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60";
const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50";

const emptyInvitation = {
  uid: "",
  title: "",
  description: "",
  groom_name: "",
  bride_name: "",
  parent_groom: "",
  parent_bride: "",
  wedding_date: "",
  time: "",
  location: "",
  address: "",
  maps_url: "",
  maps_embed: "",
  og_image: "",
  favicon: "/favicon.svg",
  audio: "",
  language: "id",
};

function toInvitationPayload(form) {
  const optional = (value) => value ?? "";
  return {
    uid: form.uid.trim().toLowerCase(),
    title: form.title,
    description: optional(form.description),
    groomName: form.groom_name,
    brideName: form.bride_name,
    parentGroom: optional(form.parent_groom),
    parentBride: optional(form.parent_bride),
    date: form.wedding_date,
    time: optional(form.time),
    location: optional(form.location),
    address: optional(form.address),
    mapsUrl: optional(form.maps_url),
    mapsEmbed: optional(form.maps_embed),
    ogImage: optional(form.og_image),
    favicon: optional(form.favicon),
    audio: optional(form.audio),
    language: form.language || "id",
  };
}

function useNotice() {
  const [notice, setNotice] = useState("");
  return {
    notice,
    showNotice(message) {
      setNotice(message);
      window.setTimeout(() => setNotice(""), 4000);
    },
  };
}

function Notice({ children }) {
  if (!children) return null;
  return (
    <p
      className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
      role="status"
    >
      {children}
    </p>
  );
}

function ErrorMessage({ children }) {
  if (!children) return null;
  return (
    <p
      className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700"
      role="alert"
    >
      {children}
    </p>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  maxLength,
  placeholder,
}) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <input
        className={inputClass}
        type={type}
        value={value ?? ""}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextArea({ label, value, onChange, rows = 3 }) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <textarea
        className={inputClass}
        rows={rows}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Overview({ invitations, selectedUid, setSelectedUid }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedUid) {
      setStats(null);
      return;
    }
    let active = true;
    adminApi
      .stats(selectedUid)
      .then((response) => {
        if (active) {
          setStats(response.data);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });
    return () => {
      active = false;
    };
  }, [selectedUid]);

  const metrics = [
    { label: "Hadir", value: stats?.attending ?? 0, color: "text-emerald-700" },
    {
      label: "Tidak hadir",
      value: stats?.not_attending ?? 0,
      color: "text-rose-700",
    },
    { label: "Belum pasti", value: stats?.maybe ?? 0, color: "text-amber-700" },
    { label: "Total RSVP", value: stats?.total ?? 0, color: "text-stone-900" },
  ];

  return (
    <section>
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Ringkasan</h1>
          <p className="mt-1 text-sm text-stone-500">
            Pantau konfirmasi kehadiran dan aktivitas undangan.
          </p>
        </div>
        <label className="text-sm font-medium text-stone-600">
          Undangan
          <select
            className={`${inputClass} min-w-56`}
            value={selectedUid}
            onChange={(event) => setSelectedUid(event.target.value)}
          >
            {invitations.map((invitation) => (
              <option key={invitation.uid} value={invitation.uid}>
                {invitation.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ErrorMessage>{error}</ErrorMessage>
      {!invitations.length ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
          <CalendarDays className="mx-auto text-rose-500" size={30} />
          <h2 className="mt-3 font-semibold text-stone-900">
            Belum ada undangan
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Buat undangan pertama untuk mulai mengelola tamu dan RSVP.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <article
                key={metric.label}
                className="rounded-xl border border-stone-200 bg-white p-5"
              >
                <p className="text-sm text-stone-500">{metric.label}</p>
                <p className={`mt-2 text-3xl font-semibold ${metric.color}`}>
                  {metric.value}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-stone-200 bg-white p-5">
            <p className="text-sm text-stone-500">Undangan dikelola</p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">
              {invitations.length}
            </p>
          </div>
        </>
      )}
    </section>
  );
}

function AgendaEditor({ uid, agenda, refresh, showNotice }) {
  const blank = {
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    address: "",
    orderIndex: agenda.length,
  };
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  function edit(event) {
    setEditingId(event.id);
    setForm({
      title: event.title,
      date: event.date,
      startTime: event.start_time || "",
      endTime: event.end_time || "",
      location: event.location || "",
      address: event.address || "",
      orderIndex: event.order_index,
    });
  }

  async function save(event) {
    event.preventDefault();
    setError("");
    try {
      if (editingId) {
        await adminApi.updateAgenda(uid, editingId, form);
      } else {
        await adminApi.createAgenda(uid, form);
      }
      setEditingId(null);
      setForm({ ...blank, orderIndex: agenda.length + 1 });
      await refresh();
      showNotice("Agenda berhasil disimpan.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function remove(id) {
    if (!window.confirm("Hapus acara ini dari agenda?")) return;
    try {
      await adminApi.deleteAgenda(uid, id);
      await refresh();
      showNotice("Acara dihapus.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="mt-7 border-t border-stone-100 pt-6">
      <h3 className="font-semibold text-stone-900">Agenda acara</h3>
      <div className="mt-3 space-y-2">
        {agenda.map((event) => (
          <div
            key={event.id}
            className="flex items-center justify-between gap-3 rounded-lg bg-stone-50 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-stone-800">
                {event.title}
              </p>
              <p className="text-xs text-stone-500">
                {event.date} · {event.start_time || "Waktu belum diisi"}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button className={secondaryButton} onClick={() => edit(event)}>
                Edit
              </button>
              <button
                className="rounded-lg p-2 text-rose-700 hover:bg-rose-50"
                aria-label={`Hapus ${event.title}`}
                onClick={() => remove(event.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {!agenda.length && (
          <p className="text-sm text-stone-500">Agenda belum ditambahkan.</p>
        )}
      </div>
      <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={save}>
        <Field
          label="Nama acara"
          required
          value={form.title}
          onChange={(value) => setForm({ ...form, title: value })}
        />
        <Field
          label="Tanggal"
          type="date"
          required
          value={form.date}
          onChange={(value) => setForm({ ...form, date: value })}
        />
        <Field
          label="Waktu mulai"
          value={form.startTime}
          onChange={(value) => setForm({ ...form, startTime: value })}
          placeholder="09.00 WIB"
        />
        <Field
          label="Waktu selesai"
          value={form.endTime}
          onChange={(value) => setForm({ ...form, endTime: value })}
          placeholder="Selesai"
        />
        <Field
          label="Lokasi"
          value={form.location}
          onChange={(value) => setForm({ ...form, location: value })}
        />
        <Field
          label="Alamat"
          value={form.address}
          onChange={(value) => setForm({ ...form, address: value })}
        />
        <ErrorMessage>{error}</ErrorMessage>
        <div className="flex items-end gap-2">
          <button className={primaryButton}>
            {editingId ? "Simpan perubahan acara" : "Tambah acara"}
          </button>
          {editingId && (
            <button
              type="button"
              className={secondaryButton}
              onClick={() => {
                setEditingId(null);
                setForm({ ...blank, orderIndex: agenda.length });
              }}
            >
              Batal
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function BankEditor({ uid, banks, refresh, showNotice }) {
  const blank = {
    bank: "",
    accountNumber: "",
    accountName: "",
    orderIndex: banks.length,
  };
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  function edit(bank) {
    setEditingId(bank.id);
    setForm({
      bank: bank.bank,
      accountNumber: bank.account_number,
      accountName: bank.account_name,
      orderIndex: bank.order_index,
    });
  }

  async function save(event) {
    event.preventDefault();
    setError("");
    try {
      if (editingId) await adminApi.updateBank(uid, editingId, form);
      else await adminApi.createBank(uid, form);
      setEditingId(null);
      setForm({ ...blank, orderIndex: banks.length + 1 });
      await refresh();
      showNotice("Rekening berhasil disimpan.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function remove(id) {
    if (!window.confirm("Hapus rekening ini?")) return;
    try {
      await adminApi.deleteBank(uid, id);
      await refresh();
      showNotice("Rekening dihapus.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="mt-7 border-t border-stone-100 pt-6">
      <h3 className="font-semibold text-stone-900">
        Rekening / amplop digital
      </h3>
      <div className="mt-3 space-y-2">
        {banks.map((bank) => (
          <div
            key={bank.id}
            className="flex items-center justify-between gap-3 rounded-lg bg-stone-50 px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium text-stone-800">
                {bank.bank} · {bank.account_number}
              </p>
              <p className="text-xs text-stone-500">{bank.account_name}</p>
            </div>
            <div className="flex gap-2">
              <button className={secondaryButton} onClick={() => edit(bank)}>
                Edit
              </button>
              <button
                className="rounded-lg p-2 text-rose-700 hover:bg-rose-50"
                aria-label={`Hapus rekening ${bank.bank}`}
                onClick={() => remove(bank.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {!banks.length && (
          <p className="text-sm text-stone-500">Rekening belum ditambahkan.</p>
        )}
      </div>
      <form className="mt-4 grid gap-3 sm:grid-cols-3" onSubmit={save}>
        <Field
          label="Nama bank"
          required
          value={form.bank}
          onChange={(value) => setForm({ ...form, bank: value })}
        />
        <Field
          label="Nomor rekening"
          required
          value={form.accountNumber}
          onChange={(value) => setForm({ ...form, accountNumber: value })}
        />
        <Field
          label="Nama pemilik"
          required
          value={form.accountName}
          onChange={(value) => setForm({ ...form, accountName: value })}
        />
        <ErrorMessage>{error}</ErrorMessage>
        <div className="sm:col-span-3">
          <button className={primaryButton}>
            {editingId ? "Simpan rekening" : "Tambah rekening"}
          </button>
          {editingId && (
            <button
              type="button"
              className={`${secondaryButton} ml-2`}
              onClick={() => {
                setEditingId(null);
                setForm({ ...blank, orderIndex: banks.length });
              }}
            >
              Batal
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function InvitationManager({
  invitations,
  selectedUid,
  setSelectedUid,
  refreshInvitations,
  showNotice,
}) {
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState(emptyInvitation);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [detailTab, setDetailTab] = useState("settings");

  async function refreshDetail(uid = selectedUid) {
    if (!uid) return;
    const response = await adminApi.invitation(uid);
    setDetail(response.data);
    setForm(response.data);
  }

  useEffect(() => {
    let active = true;
    if (!selectedUid || creating) {
      setDetail(null);
      return () => {
        active = false;
      };
    }
    adminApi
      .invitation(selectedUid)
      .then((response) => {
        if (active) {
          setDetail(response.data);
          setForm(response.data);
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });
    return () => {
      active = false;
    };
  }, [selectedUid, creating]);

  function startCreate() {
    setCreating(true);
    setSelectedUid("");
    setDetail(null);
    setForm(emptyInvitation);
    setError("");
  }

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = toInvitationPayload(form);
      if (creating) {
        await adminApi.createInvitation(payload);
        setCreating(false);
        setSelectedUid(payload.uid);
      } else {
        await adminApi.updateInvitation(selectedUid, payload);
      }
      await refreshInvitations();
      if (!creating) await refreshDetail(selectedUid);
      showNotice(
        creating ? "Undangan berhasil dibuat." : "Undangan diperbarui.",
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeInvitation() {
    if (
      !window.confirm(
        "Hapus undangan beserta semua agenda, rekening, dan RSVP-nya? Tindakan ini tidak dapat dibatalkan.",
      )
    ) {
      return;
    }
    try {
      await adminApi.deleteInvitation(selectedUid);
      setCreating(false);
      setSelectedUid("");
      setDetail(null);
      await refreshInvitations();
      showNotice("Undangan dan data terkait telah dihapus.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const editingExisting = Boolean(selectedUid && !creating);
  const disabled = busy;

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">
            Kelola undangan
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Atur detail acara, agenda, rekening, dan tautan lokasi.
          </p>
        </div>
        <button className={primaryButton} onClick={startCreate}>
          <Plus size={16} /> Undangan baru
        </button>
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <article className="rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-sm text-stone-500">Jumlah undangan</p>
          <p className="mt-1 text-2xl font-semibold text-stone-900">
            {invitations.length}
          </p>
        </article>
        <article className="rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-sm text-stone-500">Total RSVP dan ucapan</p>
          <p className="mt-1 text-2xl font-semibold text-stone-900">
            {invitations.reduce(
              (total, invitation) => total + Number(invitation.wish_count || 0),
              0,
            )}
          </p>
        </article>
      </div>
      <ErrorMessage>{error}</ErrorMessage>
      <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="h-fit rounded-xl border border-stone-200 bg-white p-3">
          <p className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
            Undangan saya
          </p>
          {invitations.map((invitation) => (
            <button
              key={invitation.uid}
              className={`mb-1 w-full rounded-lg px-3 py-2.5 text-left text-sm ${
                selectedUid === invitation.uid && !creating
                  ? "bg-rose-50 font-semibold text-rose-800"
                  : "text-stone-700 hover:bg-stone-50"
              }`}
              onClick={() => {
                setCreating(false);
                setSelectedUid(invitation.uid);
                setDetailTab("settings");
              }}
            >
              <span className="block truncate">{invitation.title}</span>
              <span className="mt-0.5 block text-xs font-normal text-stone-500">
                {invitation.wedding_date} · {invitation.wish_count} RSVP
              </span>
            </button>
          ))}
          {!invitations.length && (
            <p className="px-2 py-3 text-sm text-stone-500">
              Belum ada undangan.
            </p>
          )}
        </aside>
        <div className="rounded-xl border border-stone-200 bg-white p-5 sm:p-7">
          {creating || editingExisting ? (
            <>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">
                    {creating ? "Undangan baru" : "Detail undangan"}
                  </h2>
                  {editingExisting && (
                    <a
                      className="mt-1 inline-flex items-center gap-1 text-sm text-rose-700 hover:underline"
                      href={`/${selectedUid}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Buka halaman undangan <ExternalLink size={13} />
                    </a>
                  )}
                </div>
                {editingExisting && (
                  <button
                    className="rounded-lg p-2 text-rose-700 hover:bg-rose-50"
                    aria-label="Hapus undangan"
                    onClick={removeInvitation}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              {editingExisting && (
                <div className="mb-5 flex flex-wrap gap-2 border-b border-stone-100 pb-4">
                  {[
                    ["settings", "Pengaturan"],
                    ["wishes", "Ucapan & RSVP"],
                    ["guests", "Tamu"],
                  ].map(([tab, label]) => (
                    <button
                      key={tab}
                      className={`rounded-lg px-3 py-2 text-sm font-medium ${
                        detailTab === tab
                          ? "bg-rose-50 text-rose-800"
                          : "text-stone-600 hover:bg-stone-50"
                      }`}
                      onClick={() => setDetailTab(tab)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
              {(creating || detailTab === "settings") && (
                <>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={save}>
                <Field
                  label="UID (tautan)"
                  required
                  maxLength={100}
                  placeholder="nama-pasangan-2026"
                  value={form.uid}
                  onChange={(value) => setForm({ ...form, uid: value })}
                />
                <Field
                  label="Judul undangan"
                  required
                  value={form.title}
                  onChange={(value) => setForm({ ...form, title: value })}
                />
                <Field
                  label="Nama mempelai pria"
                  required
                  value={form.groom_name}
                  onChange={(value) => setForm({ ...form, groom_name: value })}
                />
                <Field
                  label="Nama mempelai wanita"
                  required
                  value={form.bride_name}
                  onChange={(value) => setForm({ ...form, bride_name: value })}
                />
                <Field
                  label="Orang tua mempelai pria"
                  value={form.parent_groom}
                  onChange={(value) =>
                    setForm({ ...form, parent_groom: value })
                  }
                />
                <Field
                  label="Orang tua mempelai wanita"
                  value={form.parent_bride}
                  onChange={(value) =>
                    setForm({ ...form, parent_bride: value })
                  }
                />
                <Field
                  label="Tanggal"
                  type="date"
                  required
                  value={form.wedding_date}
                  onChange={(value) =>
                    setForm({ ...form, wedding_date: value })
                  }
                />
                <Field
                  label="Waktu"
                  value={form.time}
                  onChange={(value) => setForm({ ...form, time: value })}
                />
                <Field
                  label="Lokasi"
                  value={form.location}
                  onChange={(value) => setForm({ ...form, location: value })}
                />
                <Field
                  label="Alamat"
                  value={form.address}
                  onChange={(value) => setForm({ ...form, address: value })}
                />
                <Field
                  label="Tautan Google Maps"
                  value={form.maps_url}
                  onChange={(value) => setForm({ ...form, maps_url: value })}
                />
                <Field
                  label="Tautan gambar OG"
                  value={form.og_image}
                  onChange={(value) => setForm({ ...form, og_image: value })}
                />
                <Field
                  label="Favicon (path atau HTTPS URL)"
                  value={form.favicon}
                  onChange={(value) => setForm({ ...form, favicon: value })}
                />
                <Field
                  label="Audio (HTTPS URL)"
                  value={form.audio}
                  onChange={(value) => setForm({ ...form, audio: value })}
                />
                <TextArea
                  label="Deskripsi"
                  value={form.description}
                  onChange={(value) => setForm({ ...form, description: value })}
                />
                <div className="sm:col-span-2">
                  <TextArea
                    label="Google Maps embed URL (HTTPS)"
                    value={form.maps_embed}
                    onChange={(value) =>
                      setForm({ ...form, maps_embed: value })
                    }
                  />
                </div>
                <label className="block text-sm font-medium text-stone-700">
                  Bahasa undangan
                  <select
                    className={inputClass}
                    value={form.language}
                    onChange={(event) =>
                      setForm({ ...form, language: event.target.value })
                    }
                  >
                    <option value="id">Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </label>
                <div className="sm:col-span-2">
                  <ErrorMessage>{error}</ErrorMessage>
                  <button className={primaryButton} disabled={disabled}>
                    {busy
                      ? "Menyimpan..."
                      : creating
                        ? "Buat undangan"
                        : "Simpan perubahan"}
                  </button>
                  {creating && (
                    <p className="mt-2 text-xs text-stone-500">
                      UID hanya boleh berisi huruf kecil, angka, dan tanda
                      hubung.
                    </p>
                  )}
                </div>
              </form>
              {editingExisting && detail && (
                <>
                  <AgendaEditor
                    uid={selectedUid}
                    agenda={detail.agenda}
                    refresh={refreshDetail}
                    showNotice={showNotice}
                  />
                  <BankEditor
                    uid={selectedUid}
                    banks={detail.banks}
                    refresh={refreshDetail}
                    showNotice={showNotice}
                  />
                </>
              )}
                </>
              )}
              {editingExisting && detailTab === "wishes" && (
                <Wishes selectedUid={selectedUid} showNotice={showNotice} />
              )}
              {editingExisting && detailTab === "guests" && (
                <GuestManager uid={selectedUid} showNotice={showNotice} />
              )}
            </>
          ) : (
            <div className="py-12 text-center text-sm text-stone-500">
              Pilih undangan untuk mengedit, atau buat undangan baru.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Wishes({ selectedUid, showNotice }) {
  const [wishes, setWishes] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!selectedUid) {
      setWishes([]);
      setTotal(0);
      return;
    }
    try {
      const response = await adminApi.wishes(selectedUid, offset);
      const statsResponse = await adminApi.stats(selectedUid);
      setWishes(response.data);
      setTotal(response.pagination.total);
      setStats(statsResponse.data);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }, [offset, selectedUid]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function remove(wish) {
    if (!window.confirm(`Hapus ucapan dari ${wish.name}?`)) return;
    try {
      await adminApi.deleteWish(selectedUid, wish.id);
      await refresh();
      showNotice("Ucapan tamu dihapus.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-900">Ucapan & RSVP</h1>
        <p className="mt-1 text-sm text-stone-500">
          Tinjau konfirmasi kehadiran dan moderasi pesan tamu.
        </p>
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Hadir", stats?.attending ?? 0],
          ["Tidak hadir", stats?.not_attending ?? 0],
          ["Belum pasti", stats?.maybe ?? 0],
          ["Total RSVP", stats?.total ?? 0],
        ].map(([label, value]) => (
          <article
            key={label}
            className="rounded-xl border border-stone-200 bg-white p-4"
          >
            <p className="text-sm text-stone-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">
              {value}
            </p>
          </article>
        ))}
      </div>
      <ErrorMessage>{error}</ErrorMessage>
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
        <div className="border-b border-stone-100 px-5 py-3 text-sm text-stone-500">
          {total} ucapan
        </div>
        <div className="divide-y divide-stone-100">
          {wishes.map((wish) => (
            <article
              key={wish.id}
              className="flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-start"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-stone-900">{wish.name}</h2>
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                    {wish.attendance}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-stone-700">
                  {wish.message}
                </p>
                <p className="mt-2 text-xs text-stone-400">{wish.created_at}</p>
              </div>
              <button
                className="self-end rounded-lg p-2 text-rose-700 hover:bg-rose-50 sm:self-start"
                aria-label={`Hapus ucapan dari ${wish.name}`}
                onClick={() => remove(wish)}
              >
                <Trash2 size={17} />
              </button>
            </article>
          ))}
          {!wishes.length && (
            <p className="px-5 py-10 text-center text-sm text-stone-500">
              Belum ada RSVP atau ucapan.
            </p>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-stone-100 px-5 py-3">
          <button
            className={secondaryButton}
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - 50))}
          >
            Sebelumnya
          </button>
          <span className="text-xs text-stone-500">
            {total ? offset + 1 : 0}–{Math.min(offset + 50, total)} dari {total}
          </span>
          <button
            className={secondaryButton}
            disabled={offset + 50 >= total}
            onClick={() => setOffset(offset + 50)}
          >
            Berikutnya
          </button>
        </div>
      </div>
    </section>
  );
}

function RequestManager({ showNotice }) {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [requestResponse, statsResponse] = await Promise.all([
        adminApi.invitationRequests(),
        adminApi.requestStats(),
      ]);
      setRequests(requestResponse.data);
      setStats(statsResponse.data);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function changeStatus(request, status) {
    try {
      await adminApi.updateRequestStatus(request.id, status);
      await refresh();
      showNotice("Status request diperbarui.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function whatsappLink(request) {
    const text = `Assalamu'alaikum ${request.groom_name} dan ${request.bride_name}, kami menerima request undangan untuk acara tanggal ${request.event_date}. Boleh kami bantu membahas detail undangannya?`;
    return `https://wa.me/${request.whatsapp}?text=${encodeURIComponent(text)}`;
  }

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-900">
          Request undangan
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Hubungi calon pengguna secara manual melalui WhatsApp, lalu perbarui
          status request.
        </p>
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Semua request", stats?.total ?? 0],
          ["Perlu dihubungi", stats?.pending ?? 0],
          ["Sudah dihubungi", stats?.contacted ?? 0],
          ["Disetujui", stats?.approved ?? 0],
        ].map(([label, value]) => (
          <article
            key={label}
            className="rounded-xl border border-stone-200 bg-white p-4"
          >
            <p className="text-sm text-stone-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">
              {value}
            </p>
          </article>
        ))}
      </div>
      <ErrorMessage>{error}</ErrorMessage>
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-stone-100 bg-stone-50 text-xs uppercase text-stone-500">
            <tr>
              <th className="px-4 py-3">Mempelai</th>
              <th className="px-4 py-3">Tanggal acara</th>
              <th className="px-4 py-3">WhatsApp</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="px-4 py-3 font-medium text-stone-800">
                  {request.groom_name} & {request.bride_name}
                </td>
                <td className="px-4 py-3 text-stone-600">
                  {request.event_date}
                </td>
                <td className="px-4 py-3 text-stone-600">
                  +{request.whatsapp}
                </td>
                <td className="px-4 py-3">
                  <select
                    className="rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-xs"
                    value={request.status}
                    onChange={(event) =>
                      changeStatus(request, event.target.value)
                    }
                    aria-label={`Status request ${request.groom_name} dan ${request.bride_name}`}
                  >
                    <option value="pending">Perlu dihubungi</option>
                    <option value="contacted">Sudah dihubungi</option>
                    <option value="approved">Disetujui</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <a
                    className={secondaryButton}
                    href={whatsappLink(request)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                      if (request.status === "pending") {
                        changeStatus(request, "contacted");
                      }
                    }}
                  >
                    <MessageSquareText size={15} /> Hubungi
                  </a>
                </td>
              </tr>
            ))}
            {!requests.length && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-stone-500">
                  Belum ada request undangan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function GuestManager({ uid, showNotice }) {
  const [guests, setGuests] = useState([]);
  const [bulkText, setBulkText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const response = await adminApi.guests(uid);
      setGuests(response.data);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }, [uid]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function importGuests(rows) {
    if (!rows.length) {
      setError("Tidak ada nama tamu yang dapat diimpor.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await adminApi.importGuests(uid, rows);
      setBulkText("");
      await refresh();
      showNotice(
        `${response.data.inserted} tamu ditambahkan, ${response.data.updated} diperbarui.`,
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function uploadCsv(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await importGuests(parseGuestCsv(await file.text()));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      event.target.value = "";
    }
  }

  async function remove(guest) {
    if (
      !window.confirm(
        `Hapus tamu ${guest.name}? Data RSVP/ucapannya yang sudah masuk tetap disimpan.`,
      )
    ) {
      return;
    }
    try {
      await adminApi.deleteGuest(uid, guest.id);
      await refresh();
      showNotice("Tamu dihapus.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function inviteUrl(guest) {
    return `${window.location.origin}/${uid}/tamu/${guest.slug}`;
  }

  function whatsappUrl(guest) {
    const text = `Assalamu'alaikum ${guest.name}, kami mengundang Anda ke acara pernikahan kami. Silakan buka undangan berikut: ${inviteUrl(guest)}`;
    return `https://wa.me/${guest.phone || ""}?text=${encodeURIComponent(text)}`;
  }

  async function copyLink(guest) {
    try {
      await navigator.clipboard.writeText(inviteUrl(guest));
      showNotice(`Link undangan untuk ${guest.name} disalin.`);
    } catch (requestError) {
      setError(`Gagal menyalin link: ${requestError.message}`);
    }
  }

  const invited = guests.filter((guest) => guest.attendance).length;
  const attending = guests.filter(
    (guest) => guest.attendance === "ATTENDING",
  ).length;

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-stone-900">Daftar tamu</h2>
        <p className="mt-1 text-sm text-stone-500">
          Impor CSV atau tempel nama tamu. Tautan personal dan pesan WhatsApp
          dibuat untuk setiap tamu.
        </p>
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          ["Jumlah tamu", guests.length],
          ["Sudah RSVP", invited],
          ["Konfirmasi hadir", attending],
        ].map(([label, value]) => (
          <article
            key={label}
            className="rounded-xl border border-stone-200 bg-white p-4"
          >
            <p className="text-sm text-stone-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">
              {value}
            </p>
          </article>
        ))}
      </div>
      <ErrorMessage>{error}</ErrorMessage>
      <div className="mb-5 grid gap-4 rounded-xl border border-stone-200 bg-white p-5 md:grid-cols-[1fr_auto]">
        <div>
          <TextArea
            label="Tempel nama (satu per baris, atau pisahkan dengan koma/titik koma)"
            value={bulkText}
            onChange={setBulkText}
            rows={4}
          />
          <p className="mt-1 text-xs text-stone-500">
            Untuk nomor WhatsApp, unggah CSV dengan kolom `nama,whatsapp`.
          </p>
        </div>
        <div className="flex flex-col justify-end gap-2">
          <button
            className={primaryButton}
            disabled={busy || !bulkText.trim()}
            onClick={() => importGuests(parseGuestNames(bulkText))}
          >
            <Plus size={16} /> Tambahkan nama
          </button>
          <label className={`${secondaryButton} cursor-pointer`}>
            <Users size={15} /> Impor CSV
            <input
              className="sr-only"
              type="file"
              accept=".csv,text/csv"
              onChange={uploadCsv}
            />
          </label>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full min-w-[740px] text-left text-sm">
          <thead className="border-b border-stone-100 bg-stone-50 text-xs uppercase text-stone-500">
            <tr>
              <th className="px-4 py-3">Nama tamu</th>
              <th className="px-4 py-3">WhatsApp</th>
              <th className="px-4 py-3">RSVP</th>
              <th className="px-4 py-3">Link personal</th>
              <th className="px-4 py-3">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {guests.map((guest) => (
              <tr key={guest.id}>
                <td className="px-4 py-3 font-medium text-stone-800">
                  {guest.name}
                </td>
                <td className="px-4 py-3 text-stone-600">
                  {guest.phone ? `+${guest.phone}` : "—"}
                </td>
                <td className="px-4 py-3 text-stone-600">
                  {guest.attendance || "Belum RSVP"}
                </td>
                <td className="px-4 py-3">
                  <button
                    className="text-rose-700 hover:underline"
                    onClick={() => copyLink(guest)}
                  >
                    /{uid}/to/{guest.slug}
                  </button>
                </td>
                <td className="flex items-center gap-2 px-4 py-3">
                  <a
                    className={secondaryButton}
                    href={whatsappUrl(guest)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageSquareText size={15} /> WhatsApp
                  </a>
                  <button
                    className="rounded-lg p-2 text-rose-700 hover:bg-rose-50"
                    aria-label={`Hapus ${guest.name}`}
                    onClick={() => remove(guest)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {!guests.length && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-stone-500">
                  Belum ada tamu yang ditambahkan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SettingsPanel({ showNotice }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await adminApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      showNotice("Password berhasil diubah.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-900">Pengaturan</h1>
        <p className="mt-1 text-sm text-stone-500">
          Perbarui keamanan akun dashboard.
        </p>
      </div>
      <form
        className="max-w-xl rounded-xl border border-stone-200 bg-white p-5 sm:p-7"
        onSubmit={submit}
      >
        <h2 className="font-semibold text-stone-900">Ganti password</h2>
        <p className="mt-1 text-sm text-stone-500">
          Gunakan minimal 12 karakter. Sesi lain akan dikeluarkan setelah
          password diperbarui.
        </p>
        <div className="mt-5 space-y-4">
          <Field
            label="Password saat ini"
            type="password"
            required
            value={currentPassword}
            onChange={setCurrentPassword}
          />
          <Field
            label="Password baru"
            type="password"
            required
            maxLength={128}
            value={newPassword}
            onChange={setNewPassword}
          />
          {newPassword.length > 0 && newPassword.length < 12 && (
            <p className="text-xs text-rose-700">
              Password baru minimal 12 karakter.
            </p>
          )}
          <ErrorMessage>{error}</ErrorMessage>
          <button
            className={primaryButton}
            disabled={busy || newPassword.length < 12}
          >
            {busy ? "Memperbarui..." : "Perbarui password"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default function AdminDashboard({ administrator, onLogout }) {
  const [invitations, setInvitations] = useState([]);
  const [selectedUid, setSelectedUid] = useState("");
  const [section, setSection] = useState("overview");
  const [error, setError] = useState("");
  const { notice, showNotice } = useNotice();

  async function refreshInvitations() {
    const response = await adminApi.invitations();
    setInvitations(response.data);
    setSelectedUid((current) =>
      response.data.some((invitation) => invitation.uid === current)
        ? current
        : (response.data[0]?.uid ?? ""),
    );
    setError("");
  }

  useEffect(() => {
    refreshInvitations().catch((requestError) =>
      setError(requestError.message),
    );
  }, []);

  async function logout() {
    try {
      await adminApi.logout();
      onLogout();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const sections = useMemo(
    () => [
      { id: "overview", label: "Ringkasan", icon: BarChart3 },
      { id: "invitations", label: "Undangan", icon: CalendarDays },
      { id: "requests", label: "Request", icon: MessageSquareText },
      { id: "settings", label: "Pengaturan", icon: Settings },
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-[#faf9f7] text-stone-800">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="/admin" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <ShieldCheck size={20} />
            </span>
            <span>
              <span className="block font-serif text-xl leading-5 text-stone-900">
                Sakeenah
              </span>
              <span className="text-xs text-stone-500">Dashboard undangan</span>
            </span>
          </a>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-stone-600 sm:inline">
              {administrator.username}
            </span>
            <button className={secondaryButton} onClick={logout}>
              <LogOut size={15} /> Keluar
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:py-9">
        <nav className="flex gap-2 overflow-x-auto lg:block lg:space-y-1">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition lg:w-full ${
                section === id
                  ? "bg-rose-50 text-rose-800"
                  : "text-stone-600 hover:bg-white"
              }`}
              onClick={() => setSection(id)}
            >
              <Icon size={17} /> {label}
            </button>
          ))}
          <a
            className="hidden items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-white lg:flex"
            href="/"
          >
            <Wallet size={17} /> Lihat situs
          </a>
        </nav>
        <main className="min-w-0">
          <Notice>{notice}</Notice>
          <ErrorMessage>{error}</ErrorMessage>
          {section === "overview" && (
            <Overview
              invitations={invitations}
              selectedUid={selectedUid}
              setSelectedUid={setSelectedUid}
            />
          )}
          {section === "invitations" && (
            <InvitationManager
              invitations={invitations}
              selectedUid={selectedUid}
              setSelectedUid={setSelectedUid}
              refreshInvitations={refreshInvitations}
              showNotice={showNotice}
            />
          )}
          {section === "requests" && <RequestManager showNotice={showNotice} />}
          {section === "settings" && <SettingsPanel showNotice={showNotice} />}
        </main>
      </div>
    </div>
  );
}
