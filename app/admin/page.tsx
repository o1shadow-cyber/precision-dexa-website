"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Slot = {
  id: string;
  slot_date: string;
  slot_time: string;
  status: "available" | "held" | "booked";
  held_until: string | null;
};

const statusColors: Record<Slot["status"], { bg: string; fg: string }> = {
  available: { bg: "#E7F0E9", fg: "#3F6B4E" },
  held: { bg: "#F5EFE0", fg: "#8A6A2C" },
  booked: { bg: "#E4EAF0", fg: "#0D3B66" },
};

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function AdminPage() {
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  const loadSlots = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/slots");
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const body = await res.json();
    setSlots(body.slots ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAdding(true);
    const res = await fetch("/api/admin/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slot_date: newDate, slot_time: newTime }),
    });
    setAdding(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Couldn't add that slot");
      return;
    }
    setNewDate("");
    setNewTime("");
    loadSlots();
  }

  function startEdit(slot: Slot) {
    setEditingId(slot.id);
    setEditDate(slot.slot_date);
    setEditTime(slot.slot_time);
  }

  async function saveEdit(id: string) {
    setError(null);
    const res = await fetch(`/api/admin/slots/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slot_date: editDate, slot_time: editTime }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Couldn't save that change");
      return;
    }
    setEditingId(null);
    loadSlots();
  }

  async function handleDelete(id: string) {
    setError(null);
    const res = await fetch(`/api/admin/slots/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Couldn't delete that slot");
      return;
    }
    loadSlots();
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const grouped = slots.reduce<Record<string, Slot[]>>((acc, slot) => {
    (acc[slot.slot_date] ??= []).push(slot);
    return acc;
  }, {});

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(40px,6vw,72px) 20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              font: "500 11px/1 var(--font-inter),sans-serif",
              letterSpacing: ".22em",
              textTransform: "uppercase",
              color: "#5E7F6B",
            }}
          >
            Admin
          </p>
          <h1 style={{ margin: "10px 0 0", font: "400 32px/1.2 Georgia,serif", color: "#0D3B66" }}>
            Manage scan slots
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="pdx-link"
          style={{
            background: "none",
            border: "1px solid #E7E1D6",
            padding: "10px 18px",
            font: "400 13px/1 var(--font-inter),sans-serif",
            color: "#33424C",
          }}
        >
          Sign out
        </button>
      </div>

      <form
        onSubmit={handleAdd}
        style={{
          marginTop: 32,
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "end",
          background: "#fff",
          border: "1px solid #E7E1D6",
          borderTop: "2px solid #C6B18E",
          padding: 20,
        }}
      >
        <label style={{ font: "400 13px/1.4 var(--font-inter),sans-serif", color: "#33424C" }}>
          Date
          <input
            type="date"
            required
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            style={{
              display: "block",
              marginTop: 6,
              padding: "10px 12px",
              border: "1px solid #E7E1D6",
              font: "400 14px/1 var(--font-inter),sans-serif",
            }}
          />
        </label>
        <label style={{ font: "400 13px/1.4 var(--font-inter),sans-serif", color: "#33424C" }}>
          Time
          <input
            type="time"
            required
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            style={{
              display: "block",
              marginTop: 6,
              padding: "10px 12px",
              border: "1px solid #E7E1D6",
              font: "400 14px/1 var(--font-inter),sans-serif",
            }}
          />
        </label>
        <button
          type="submit"
          disabled={adding}
          className="pdx-btn-primary"
          style={{
            background: "#0D3B66",
            color: "#F7F7F5",
            border: 0,
            padding: "12px 22px",
            font: "500 12.5px/1 var(--font-inter),sans-serif",
            letterSpacing: ".1em",
            textTransform: "uppercase",
          }}
        >
          {adding ? "Adding…" : "Add slot"}
        </button>
      </form>

      {error && (
        <p style={{ marginTop: 16, color: "#B3413C", font: "400 14px/1.4 var(--font-inter),sans-serif" }}>
          {error}
        </p>
      )}

      <div style={{ marginTop: 40 }}>
        {loading && (
          <p style={{ color: "#8A8378", font: "400 14px/1.4 var(--font-inter),sans-serif" }}>Loading…</p>
        )}
        {!loading && slots.length === 0 && (
          <p style={{ color: "#8A8378", font: "400 14px/1.4 var(--font-inter),sans-serif" }}>
            No slots yet — add one above.
          </p>
        )}
        {Object.entries(grouped).map(([date, daySlots]) => (
          <div key={date} style={{ marginBottom: 32 }}>
            <h2
              style={{
                margin: "0 0 12px",
                font: "400 18px/1.3 Georgia,serif",
                color: "#0D3B66",
                borderBottom: "1px solid #E7E1D6",
                paddingBottom: 8,
              }}
            >
              {formatDate(date)}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {daySlots.map((slot) => {
                const colors = statusColors[slot.status];
                const isEditing = editingId === slot.id;
                return (
                  <div
                    key={slot.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 12,
                      padding: "12px 16px",
                      background: "#fff",
                      border: "1px solid #E7E1D6",
                    }}
                  >
                    {isEditing ? (
                      <>
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          style={{ padding: "6px 8px", border: "1px solid #E7E1D6" }}
                        />
                        <input
                          type="time"
                          value={editTime}
                          onChange={(e) => setEditTime(e.target.value)}
                          style={{ padding: "6px 8px", border: "1px solid #E7E1D6" }}
                        />
                        <button
                          onClick={() => saveEdit(slot.id)}
                          className="pdx-link"
                          style={{ background: "none", border: 0, color: "#5E7F6B", font: "500 13px/1 var(--font-inter),sans-serif" }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="pdx-link"
                          style={{ background: "none", border: 0, color: "#8A8378", font: "400 13px/1 var(--font-inter),sans-serif" }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span style={{ font: "400 15px/1 var(--font-inter),sans-serif", color: "#33424C", minWidth: 90 }}>
                          {formatTime(slot.slot_time)}
                        </span>
                        <span
                          style={{
                            font: "500 10.5px/1 var(--font-inter),sans-serif",
                            letterSpacing: ".08em",
                            textTransform: "uppercase",
                            color: colors.fg,
                            background: colors.bg,
                            padding: "4px 10px",
                          }}
                        >
                          {slot.status}
                        </span>
                        <span style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
                          <button
                            onClick={() => startEdit(slot)}
                            disabled={slot.status !== "available"}
                            className="pdx-link"
                            style={{
                              background: "none",
                              border: 0,
                              color: slot.status === "available" ? "#33424C" : "#C7C1B5",
                              font: "400 13px/1 var(--font-inter),sans-serif",
                              cursor: slot.status === "available" ? "pointer" : "not-allowed",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(slot.id)}
                            disabled={slot.status === "booked"}
                            style={{
                              background: "none",
                              border: 0,
                              color: slot.status === "booked" ? "#C7C1B5" : "#B3413C",
                              font: "400 13px/1 var(--font-inter),sans-serif",
                              cursor: slot.status === "booked" ? "not-allowed" : "pointer",
                            }}
                          >
                            Delete
                          </button>
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
