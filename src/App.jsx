import { useState, useMemo } from "react";

const CATEGORIES = [
  { name: "Food & Dining", icon: "🍜", color: "#FF6B6B" },
  { name: "Transport", icon: "🚗", color: "#4ECDC4" },
  { name: "Shopping", icon: "🛍️", color: "#FFE66D" },
  { name: "Entertainment", icon: "🎮", color: "#A78BFA" },
  { name: "Health", icon: "💊", color: "#6EE7B7" },
  { name: "Bills & Utilities", icon: "⚡", color: "#FCA5A5" },
  { name: "Travel", icon: "✈️", color: "#93C5FD" },
  { name: "Other", icon: "📦", color: "#D1D5DB" },
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const initialExpenses = [
  {
    id: 1,
    title: "Dinner at Taj",
    amount: 1200,
    category: "Food & Dining",
    date: "2026-03-20",
    note: "Family dinner",
  },
  {
    id: 2,
    title: "Uber ride",
    amount: 230,
    category: "Transport",
    date: "2026-03-21",
    note: "",
  },
  {
    id: 3,
    title: "Grocery store",
    amount: 870,
    category: "Food & Dining",
    date: "2026-03-22",
    note: "Weekly groceries",
  },
  {
    id: 4,
    title: "Netflix subscription",
    amount: 649,
    category: "Entertainment",
    date: "2026-03-23",
    note: "",
  },
  {
    id: 5,
    title: "Electricity bill",
    amount: 1540,
    category: "Bills & Utilities",
    date: "2026-03-18",
    note: "March bill",
  },
  {
    id: 6,
    title: "Gym membership",
    amount: 999,
    category: "Health",
    date: "2026-03-01",
    note: "",
  },
  {
    id: 7,
    title: "New shoes",
    amount: 2499,
    category: "Shopping",
    date: "2026-03-15",
    note: "Nike running shoes",
  },
  {
    id: 8,
    title: "Weekend trip",
    amount: 4500,
    category: "Travel",
    date: "2026-03-10",
    note: "Goa trip",
  },
];

function formatINR(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}

function getCategoryMeta(name) {
  return CATEGORIES.find((c) => c.name === name) || CATEGORIES[7];
}

// ─── Theme tokens ───────────────────────────────────────────────────────────
function getTheme(dark) {
  return dark
    ? {
        appBg: "#070B14",
        sidebarBg: "#0B1120",
        sidebarBorder: "#1E293B",
        cardBg: "#0B1120",
        cardBorder: "#1E293B",
        inputBg: "#0F172A",
        inputBorder: "#1E293B",
        inputColor: "#E2E8F0",
        inputPlaceholder: "#334155",
        textPrimary: "#fff",
        textSecondary: "#E2E8F0",
        textMuted: "#64748B",
        textDim: "#475569",
        textMid: "#94A3B8",
        textBody: "#CBD5E1",
        navActive: "#1E293B",
        navActiveText: "#E2E8F0",
        progressBg: "#1E293B",
        barBg: "#1E293B",
        barMonthInactive: "#1E293B",
        deleteBtn: "#1E293B",
        deleteBtnColor: "#64748B",
        txHover: "#0F172A",
        listRowBorder: "#1E293B",
        modalBg: "#0B1120",
        modalBorder: "#1E293B",
        btnOutlineBorder: "#334155",
        btnOutlineColor: "#94A3B8",
        scrollTrack: "#070B14",
        scrollThumb: "#1E293B",
        selectOptionBg: "#0F172A",
        logoText: "#fff",
        toggleBg: "#1E293B",
        toggleColor: "#A78BFA",
        toggleIcon: "☀️",
        toggleLabel: "Light",
      }
    : {
        appBg: "#F1F5F9",
        sidebarBg: "#fff",
        sidebarBorder: "#E2E8F0",
        cardBg: "#fff",
        cardBorder: "#E2E8F0",
        inputBg: "#F8FAFC",
        inputBorder: "#CBD5E1",
        inputColor: "#1E293B",
        inputPlaceholder: "#94A3B8",
        textPrimary: "#0F172A",
        textSecondary: "#1E293B",
        textMuted: "#64748B",
        textDim: "#64748B",
        textMid: "#475569",
        textBody: "#334155",
        navActive: "#F1F5F9",
        navActiveText: "#0F172A",
        progressBg: "#E2E8F0",
        barBg: "#E2E8F0",
        barMonthInactive: "#E2E8F0",
        deleteBtn: "#F1F5F9",
        deleteBtnColor: "#94A3B8",
        txHover: "#F8FAFC",
        listRowBorder: "#E2E8F0",
        modalBg: "#fff",
        modalBorder: "#E2E8F0",
        btnOutlineBorder: "#CBD5E1",
        btnOutlineColor: "#64748B",
        scrollTrack: "#F1F5F9",
        scrollThumb: "#CBD5E1",
        selectOptionBg: "#fff",
        logoText: "#0F172A",
        toggleBg: "#F1F5F9",
        toggleColor: "#6D28D9",
        toggleIcon: "🌙",
        toggleLabel: "Dark",
      };
}

export default function ExpenseTracker() {
  const [dark, setDark] = useState(true);
  const t = getTheme(dark);

  const [expenses, setExpenses] = useState(initialExpenses);
  const [view, setView] = useState("dashboard");
  const [filterCat, setFilterCat] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Food & Dining",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });
  const [errors, setErrors] = useState({});

  const totalSpent = useMemo(
    () => expenses.reduce((s, e) => s + e.amount, 0),
    [expenses],
  );

  const thisMonth = useMemo(() => {
    const now = new Date();
    return expenses
      .filter((e) => {
        const d = new Date(e.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((s, e) => s + e.amount, 0);
  }, [expenses]);

  const categoryTotals = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const recentExpenses = useMemo(
    () =>
      [...expenses]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5),
    [expenses],
  );

  const filteredExpenses = useMemo(() => {
    let list = [...expenses];
    if (filterCat !== "All")
      list = list.filter((e) => e.category === filterCat);
    if (searchTerm)
      list = list.filter((e) =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    if (sortBy === "date")
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
    else if (sortBy === "amount") list.sort((a, b) => b.amount - a.amount);
    else if (sortBy === "title")
      list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [expenses, filterCat, sortBy, searchTerm]);

  const monthlyData = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      map[key] = (map[key] || 0) + e.amount;
    });
    return map;
  }, [expenses]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const validateForm = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
      e.amount = "Enter a valid amount";
    if (!form.date) e.date = "Date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = () => {
    if (!validateForm()) return;
    const newExp = { id: Date.now(), ...form, amount: Number(form.amount) };
    setExpenses((prev) => [newExp, ...prev]);
    setForm({
      title: "",
      amount: "",
      category: "Food & Dining",
      date: new Date().toISOString().split("T")[0],
      note: "",
    });
    setErrors({});
    showToast("Expense added successfully! 🎉");
    setView("dashboard");
  };

  const handleDelete = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setDeleteId(null);
    showToast("Expense deleted", "error");
  };

  const maxCatAmount = categoryTotals.length ? categoryTotals[0][1] : 1;

  // ── Dynamic styles (theme-aware) ────────────────────────────────────────
  const s = {
    app: {
      display: "flex",
      minHeight: "100vh",
      background: t.appBg,
      fontFamily: "'DM Sans', sans-serif",
      color: t.textSecondary,
      transition: "background 0.3s, color 0.3s",
    },
    sidebar: {
      width: 240,
      background: t.sidebarBg,
      borderRight: `1px solid ${t.sidebarBorder}`,
      display: "flex",
      flexDirection: "column",
      padding: "28px 16px",
      position: "sticky",
      top: 0,
      height: "100vh",
      gap: 8,
      transition: "background 0.3s",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 32,
      paddingLeft: 8,
    },
    logoIcon: { fontSize: 28 },
    logoText: {
      fontSize: 22,
      fontWeight: 700,
      color: t.logoText,
      fontFamily: "'Playfair Display', serif",
      letterSpacing: -0.5,
    },
    nav: { display: "flex", flexDirection: "column", gap: 4 },
    navBtn: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 12px",
      borderRadius: 10,
      background: "transparent",
      border: "none",
      color: t.textMuted,
      cursor: "pointer",
      fontSize: 14,
      fontWeight: 500,
      textAlign: "left",
      transition: "all 0.2s",
    },
    navBtnActive: { background: t.navActive, color: t.navActiveText },
    navIcon: { fontSize: 16, width: 20 },
    sidebarCard: {
      marginTop: "auto",
      background: t.inputBg,
      borderRadius: 12,
      padding: 16,
      border: `1px solid ${t.sidebarBorder}`,
    },
    progressBar: {
      height: 4,
      background: t.progressBg,
      borderRadius: 99,
      marginTop: 10,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      background: "linear-gradient(90deg,#6EE7B7,#059669)",
      borderRadius: 99,
      transition: "width 0.6s ease",
    },
    main: {
      flex: 1,
      padding: "32px 36px",
      overflowY: "auto",
      maxWidth: "100%",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 32,
    },
    headerLeft: { display: "flex", flexDirection: "column" },
    pageTitle: {
      margin: 0,
      fontSize: 28,
      fontWeight: 700,
      color: t.textPrimary,
      fontFamily: "'Playfair Display', serif",
      letterSpacing: -0.5,
    },
    pageSubtitle: { margin: "4px 0 0", color: t.textDim, fontSize: 13 },
    headerRight: { display: "flex", alignItems: "center", gap: 12 },
    toggleBtn: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      background: t.toggleBg,
      border: `1.5px solid ${t.sidebarBorder}`,
      borderRadius: 10,
      padding: "8px 14px",
      color: t.toggleColor,
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s",
      fontFamily: "'DM Sans', sans-serif",
    },
    addBtn: {
      background: "linear-gradient(135deg,#6D28D9,#A78BFA)",
      border: "none",
      borderRadius: 10,
      padding: "10px 20px",
      color: "#fff",
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      whiteSpace: "nowrap",
    },
    statsRow: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 16,
      marginBottom: 24,
    },
    statCard: {
      background: t.cardBg,
      border: `1px solid ${t.cardBorder}`,
      borderRadius: 16,
      padding: 20,
      transition: "transform 0.2s, border-color 0.2s, background 0.3s",
    },
    statLabel: {
      color: t.textMuted,
      fontSize: 12,
      margin: "0 0 6px",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    statValue: {
      fontSize: 22,
      fontWeight: 700,
      margin: "0 0 4px",
      fontFamily: "'Playfair Display', serif",
    },
    statSub: { color: t.textDim, fontSize: 11, margin: 0 },
    statIcon: {
      fontSize: 20,
      width: 40,
      height: 40,
      borderRadius: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    twoCol: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 20,
      marginBottom: 24,
    },
    card: {
      background: t.cardBg,
      border: `1px solid ${t.cardBorder}`,
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      transition: "background 0.3s",
    },
    cardTitle: {
      margin: "0 0 20px",
      fontSize: 16,
      fontWeight: 600,
      color: t.textSecondary,
    },
    catDot: {
      width: 28,
      height: 28,
      borderRadius: 8,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 14,
    },
    barBg: {
      height: 4,
      background: t.barBg,
      borderRadius: 99,
      overflow: "hidden",
    },
    barFill: {
      height: "100%",
      borderRadius: 99,
      transition: "width 0.6s ease",
    },
    linkBtn: {
      background: "none",
      border: "none",
      color: "#A78BFA",
      cursor: "pointer",
      fontSize: 13,
      padding: 0,
    },
    txRow: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 0",
      cursor: "default",
      transition: "all 0.15s",
      borderRadius: 8,
    },
    txIcon: {
      width: 38,
      height: 38,
      borderRadius: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 18,
      flexShrink: 0,
    },
    txTitle: { margin: 0, color: t.textBody, fontSize: 13, fontWeight: 500 },
    txMeta: { margin: "2px 0 0", color: t.textDim, fontSize: 11 },
    label: {
      display: "block",
      marginBottom: 6,
      color: t.textMid,
      fontSize: 12,
      fontWeight: 500,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    input: {
      width: "100%",
      background: t.inputBg,
      border: `1.5px solid ${t.inputBorder}`,
      borderRadius: 10,
      padding: "11px 14px",
      color: t.inputColor,
      fontSize: 14,
      outline: "none",
      boxSizing: "border-box",
      fontFamily: "'DM Sans', sans-serif",
      transition: "background 0.3s, border 0.3s, color 0.3s",
    },
    inputError: { borderColor: "#FF6B6B" },
    inputPrefix: {
      position: "absolute",
      left: 12,
      top: "50%",
      transform: "translateY(-50%)",
      color: t.textMuted,
      fontSize: 15,
    },
    errText: { color: "#FF6B6B", fontSize: 11, margin: "4px 0 0" },
    catGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 },
    catBtn: {
      border: `1.5px solid ${t.inputBorder}`,
      borderRadius: 10,
      padding: "10px 4px",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
      transition: "all 0.2s",
      fontFamily: "'DM Sans', sans-serif",
    },
    submitBtn: {
      background: "linear-gradient(135deg,#6D28D9,#A78BFA)",
      border: "none",
      borderRadius: 12,
      padding: "14px",
      color: "#fff",
      fontSize: 15,
      fontWeight: 600,
      cursor: "pointer",
      width: "100%",
      letterSpacing: 0.3,
    },
    filterBar: {
      display: "flex",
      gap: 12,
      marginBottom: 16,
      alignItems: "center",
      flexWrap: "wrap",
    },
    listRow: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "14px 0",
    },
    catTag: {
      fontSize: 11,
      padding: "2px 8px",
      borderRadius: 99,
      fontWeight: 500,
    },
    deleteBtn: {
      background: t.deleteBtn,
      border: "none",
      color: t.deleteBtnColor,
      cursor: "pointer",
      width: 28,
      height: 28,
      borderRadius: 8,
      fontSize: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s",
    },
    toast: {
      position: "fixed",
      bottom: 24,
      right: 24,
      padding: "12px 20px",
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 600,
      zIndex: 9999,
      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      animation: "slideUp 0.3s ease",
    },
    modalOverlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9998,
      backdropFilter: "blur(4px)",
    },
    modal: {
      background: t.modalBg,
      border: `1px solid ${t.modalBorder}`,
      borderRadius: 20,
      padding: "32px 40px",
      textAlign: "center",
      maxWidth: 320,
    },
    btnOutline: {
      flex: 1,
      background: "transparent",
      border: `1.5px solid ${t.btnOutlineBorder}`,
      borderRadius: 10,
      padding: "10px",
      color: t.btnOutlineColor,
      cursor: "pointer",
      fontSize: 14,
      fontFamily: "'DM Sans', sans-serif",
    },
    btnDanger: {
      flex: 1,
      background: "#FF6B6B",
      border: "none",
      borderRadius: 10,
      padding: "10px",
      color: "#fff",
      cursor: "pointer",
      fontSize: 14,
      fontWeight: 600,
      fontFamily: "'DM Sans', sans-serif",
    },
  };

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; }
    .fade-in { animation: fadeIn 0.35s ease; }
    @keyframes fadeIn  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
    .stat-card:hover { transform: translateY(-2px); }
    .tx-row:hover { background: ${t.txHover}; padding-left: 8px; padding-right: 8px; }
    input[type=date]::-webkit-calendar-picker-indicator { filter: ${dark ? "invert(0.5)" : "invert(0.3)"}; cursor: pointer; }
    select option { background: ${t.selectOptionBg}; color: ${t.inputColor}; }
    input::placeholder, textarea::placeholder { color: ${t.inputPlaceholder}; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: ${t.scrollTrack}; }
    ::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 99px; }
  `;

  return (
    <div style={s.app}>
      <style>{globalStyles}</style>

      {/* Toast */}
      {toast && (
        <div
          style={{
            ...s.toast,
            background: toast.type === "error" ? "#FF6B6B" : "#6EE7B7",
            color: "#111",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
            <h3
              style={{ margin: "0 0 8px", color: t.textPrimary, fontSize: 18 }}
            >
              Delete Expense?
            </h3>
            <p style={{ color: t.textMid, margin: "0 0 24px", fontSize: 14 }}>
              This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button style={s.btnOutline} onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button
                style={s.btnDanger}
                onClick={() => handleDelete(deleteId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside style={s.sidebar}>
        <div style={s.logo}>
          <span style={s.logoIcon}>💰</span>
          <span style={s.logoText}>Spendly</span>
        </div>

        <nav style={s.nav}>
          {[
            { id: "dashboard", icon: "◈", label: "Dashboard" },
            { id: "add", icon: "＋", label: "Add Expense" },
            { id: "list", icon: "≡", label: "All Expenses" },
          ].map((item) => (
            <button
              key={item.id}
              style={{
                ...s.navBtn,
                ...(view === item.id ? s.navBtnActive : {}),
              }}
              onClick={() => setView(item.id)}
            >
              <span style={s.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={s.sidebarCard}>
          <p
            style={{
              color: t.textMuted,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 1,
              margin: "0 0 6px",
            }}
          >
            Budget Left
          </p>
          <p
            style={{
              color: "#6EE7B7",
              fontSize: 22,
              fontWeight: 700,
              margin: 0,
              fontFamily: "'Playfair Display', serif",
            }}
          >
            {formatINR(Math.max(0, 25000 - thisMonth))}
          </p>
          <div style={s.progressBar}>
            <div
              style={{
                ...s.progressFill,
                width: `${Math.min((thisMonth / 25000) * 100, 100)}%`,
              }}
            />
          </div>
          <p style={{ color: t.textMuted, fontSize: 11, margin: "6px 0 0" }}>
            {formatINR(thisMonth)} of ₹25,000 used
          </p>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={s.main}>
        {/* Header */}
        <header style={s.header}>
          <div style={s.headerLeft}>
            <h1 style={s.pageTitle}>
              {view === "dashboard"
                ? "Overview"
                : view === "add"
                  ? "New Expense"
                  : "Transactions"}
            </h1>
            <p style={s.pageSubtitle}>
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div style={s.headerRight}>
            {/* ── Theme Toggle ── */}
            <button style={s.toggleBtn} onClick={() => setDark((d) => !d)}>
              <span>{t.toggleIcon}</span>
              <span>{t.toggleLabel} Mode</span>
            </button>
            <button style={s.addBtn} onClick={() => setView("add")}>
              + Add Expense
            </button>
          </div>
        </header>

        {/* ════ DASHBOARD ════ */}
        {view === "dashboard" && (
          <div className="fade-in">
            <div style={s.statsRow}>
              {[
                {
                  label: "Total Spent",
                  value: formatINR(totalSpent),
                  sub: "All time",
                  icon: "💸",
                  color: "#FF6B6B",
                },
                {
                  label: "This Month",
                  value: formatINR(thisMonth),
                  sub: "March 2026",
                  icon: "📅",
                  color: "#A78BFA",
                },
                {
                  label: "Transactions",
                  value: expenses.length,
                  sub: "Total entries",
                  icon: "📋",
                  color: "#4ECDC4",
                },
                {
                  label: "Avg per Day",
                  value: formatINR(Math.round(thisMonth / 25)),
                  sub: "This month",
                  icon: "📊",
                  color: "#FFE66D",
                },
              ].map((stat, i) => (
                <div key={i} style={s.statCard} className="stat-card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <p style={s.statLabel}>{stat.label}</p>
                      <p style={{ ...s.statValue, color: stat.color }}>
                        {stat.value}
                      </p>
                      <p style={s.statSub}>{stat.sub}</p>
                    </div>
                    <span
                      style={{ ...s.statIcon, background: stat.color + "22" }}
                    >
                      {stat.icon}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={s.twoCol}>
              {/* Category Breakdown */}
              <div style={s.card}>
                <h2 style={s.cardTitle}>Spending by Category</h2>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  {categoryTotals.map(([cat, amt]) => {
                    const meta = getCategoryMeta(cat);
                    const pct = Math.round((amt / maxCatAmount) * 100);
                    return (
                      <div key={cat}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 6,
                          }}
                        >
                          <span
                            style={{
                              color: t.textBody,
                              fontSize: 13,
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <span
                              style={{
                                ...s.catDot,
                                background: meta.color + "22",
                                color: meta.color,
                              }}
                            >
                              {meta.icon}
                            </span>
                            {cat}
                          </span>
                          <span
                            style={{
                              color: meta.color,
                              fontWeight: 600,
                              fontSize: 13,
                            }}
                          >
                            {formatINR(amt)}
                          </span>
                        </div>
                        <div style={s.barBg}>
                          <div
                            style={{
                              ...s.barFill,
                              width: `${pct}%`,
                              background: `linear-gradient(90deg, ${meta.color}99, ${meta.color})`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Transactions */}
              <div style={s.card}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <h2 style={s.cardTitle}>Recent Transactions</h2>
                  <button style={s.linkBtn} onClick={() => setView("list")}>
                    View all →
                  </button>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {recentExpenses.map((exp) => {
                    const meta = getCategoryMeta(exp.category);
                    return (
                      <div key={exp.id} style={s.txRow} className="tx-row">
                        <div
                          style={{
                            ...s.txIcon,
                            background: meta.color + "22",
                            color: meta.color,
                          }}
                        >
                          {meta.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={s.txTitle}>{exp.title}</p>
                          <p style={s.txMeta}>
                            {exp.category} ·{" "}
                            {new Date(exp.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                        </div>
                        <span
                          style={{
                            color: "#FF6B6B",
                            fontWeight: 700,
                            fontSize: 14,
                          }}
                        >
                          -{formatINR(exp.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Monthly Bar Chart */}
            <div style={s.card}>
              <h2 style={s.cardTitle}>Monthly Overview — 2026</h2>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-end",
                  height: 100,
                  padding: "0 8px",
                }}
              >
                {MONTHS.map((m, i) => {
                  const amt = monthlyData[`2026-${i}`] || 0;
                  const maxAmt = Math.max(
                    ...MONTHS.map((_, j) => monthlyData[`2026-${j}`] || 0),
                    1,
                  );
                  const h = Math.max((amt / maxAmt) * 80, amt > 0 ? 8 : 2);
                  const isCurrent = i === new Date().getMonth();
                  return (
                    <div
                      key={m}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        flex: 1,
                        gap: 4,
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: h,
                          borderRadius: 4,
                          minHeight: 4,
                          background: isCurrent
                            ? "linear-gradient(180deg,#A78BFA,#6D28D9)"
                            : t.barMonthInactive,
                          boxShadow: isCurrent ? "0 0 10px #A78BFA55" : "none",
                          transition: "height 0.4s ease",
                        }}
                        title={formatINR(amt)}
                      />
                      <span
                        style={{
                          fontSize: 9,
                          color: isCurrent ? "#A78BFA" : t.textDim,
                          fontWeight: isCurrent ? 700 : 400,
                        }}
                      >
                        {m}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ════ ADD EXPENSE ════ */}
        {view === "add" && (
          <div className="fade-in" style={{ maxWidth: 560 }}>
            <div style={s.card}>
              <h2 style={s.cardTitle}>Expense Details</h2>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 18 }}
              >
                <div>
                  <label style={s.label}>Title *</label>
                  <input
                    style={{
                      ...s.input,
                      ...(errors.title ? s.inputError : {}),
                    }}
                    placeholder="e.g. Coffee at Starbucks"
                    value={form.title}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, title: e.target.value }))
                    }
                  />
                  {errors.title && <p style={s.errText}>{errors.title}</p>}
                </div>

                <div>
                  <label style={s.label}>Amount (₹) *</label>
                  <div style={{ position: "relative" }}>
                    <span style={s.inputPrefix}>₹</span>
                    <input
                      style={{
                        ...s.input,
                        paddingLeft: 36,
                        ...(errors.amount ? s.inputError : {}),
                      }}
                      placeholder="0.00"
                      type="number"
                      value={form.amount}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, amount: e.target.value }))
                      }
                    />
                  </div>
                  {errors.amount && <p style={s.errText}>{errors.amount}</p>}
                </div>

                <div>
                  <label style={s.label}>Category</label>
                  <div style={s.catGrid}>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.name}
                        style={{
                          ...s.catBtn,
                          background:
                            form.category === cat.name
                              ? cat.color + "33"
                              : t.inputBg,
                          border: `1.5px solid ${form.category === cat.name ? cat.color : t.inputBorder}`,
                          color:
                            form.category === cat.name
                              ? cat.color
                              : t.textMuted,
                        }}
                        onClick={() =>
                          setForm((p) => ({ ...p, category: cat.name }))
                        }
                      >
                        <span style={{ fontSize: 18 }}>{cat.icon}</span>
                        <span style={{ fontSize: 11 }}>
                          {cat.name.split(" ")[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={s.label}>Date *</label>
                  <input
                    style={{ ...s.input, ...(errors.date ? s.inputError : {}) }}
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, date: e.target.value }))
                    }
                  />
                  {errors.date && <p style={s.errText}>{errors.date}</p>}
                </div>

                <div>
                  <label style={s.label}>Note (optional)</label>
                  <textarea
                    style={{ ...s.input, height: 72, resize: "none" }}
                    placeholder="Any extra details..."
                    value={form.note}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, note: e.target.value }))
                    }
                  />
                </div>

                <button style={s.submitBtn} onClick={handleAdd}>
                  Add Expense →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════ ALL EXPENSES ════ */}
        {view === "list" && (
          <div className="fade-in">
            <div style={s.filterBar}>
              <input
                style={{ ...s.input, maxWidth: 240, marginBottom: 0 }}
                placeholder="🔍 Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                style={{ ...s.input, maxWidth: 180, marginBottom: 0 }}
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.name}>{c.name}</option>
                ))}
              </select>
              <select
                style={{ ...s.input, maxWidth: 160, marginBottom: 0 }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Sort: Date</option>
                <option value="amount">Sort: Amount</option>
                <option value="title">Sort: Title</option>
              </select>
              <span
                style={{ color: t.textMuted, fontSize: 13, marginLeft: "auto" }}
              >
                {filteredExpenses.length} result
                {filteredExpenses.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div style={s.card}>
              {filteredExpenses.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 0",
                    color: t.textDim,
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                  <p style={{ fontSize: 16 }}>No expenses found</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {filteredExpenses.map((exp, i) => {
                    const meta = getCategoryMeta(exp.category);
                    return (
                      <div
                        key={exp.id}
                        className="tx-row"
                        style={{
                          ...s.listRow,
                          borderBottom:
                            i < filteredExpenses.length - 1
                              ? `1px solid ${t.listRowBorder}`
                              : "none",
                        }}
                      >
                        <div
                          style={{
                            ...s.txIcon,
                            background: meta.color + "22",
                            color: meta.color,
                            flexShrink: 0,
                          }}
                        >
                          {meta.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            <p style={s.txTitle}>{exp.title}</p>
                            <span
                              style={{
                                ...s.catTag,
                                background: meta.color + "22",
                                color: meta.color,
                              }}
                            >
                              {exp.category}
                            </span>
                          </div>
                          {exp.note && (
                            <p
                              style={{
                                color: t.textDim,
                                fontSize: 12,
                                margin: "2px 0 0",
                              }}
                            >
                              {exp.note}
                            </p>
                          )}
                          <p style={s.txMeta}>
                            {new Date(exp.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              color: "#FF6B6B",
                              fontWeight: 700,
                              fontSize: 15,
                            }}
                          >
                            -{formatINR(exp.amount)}
                          </span>
                          <button
                            style={s.deleteBtn}
                            onClick={() => setDeleteId(exp.id)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
