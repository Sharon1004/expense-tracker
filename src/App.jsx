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

export default function ExpenseTracker() {
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

  return (
    <div style={styles.app}>
      <style>{globalStyles}</style>

      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            ...styles.toast,
            background: toast.type === "error" ? "#FF6B6B" : "#6EE7B7",
            color: "#111",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ margin: "0 0 8px", color: "#fff", fontSize: 18 }}>
              Delete Expense?
            </h3>
            <p style={{ color: "#94A3B8", margin: "0 0 24px", fontSize: 14 }}>
              This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                style={styles.btnOutline}
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
              <button
                style={styles.btnDanger}
                onClick={() => handleDelete(deleteId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>💰</span>
          <span style={styles.logoText}>Spendly</span>
        </div>

        <nav style={styles.nav}>
          {[
            { id: "dashboard", icon: "◈", label: "Dashboard" },
            { id: "add", icon: "＋", label: "Add Expense" },
            { id: "list", icon: "≡", label: "All Expenses" },
          ].map((item) => (
            <button
              key={item.id}
              style={{
                ...styles.navBtn,
                ...(view === item.id ? styles.navBtnActive : {}),
              }}
              onClick={() => setView(item.id)}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={styles.sidebarCard}>
          <p
            style={{
              color: "#64748B",
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
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${Math.min((thisMonth / 25000) * 100, 100)}%`,
              }}
            />
          </div>
          <p style={{ color: "#64748B", fontSize: 11, margin: "6px 0 0" }}>
            {formatINR(thisMonth)} of ₹25,000 used
          </p>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={styles.main}>
        {/* Header */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>
              {view === "dashboard"
                ? "Overview"
                : view === "add"
                  ? "New Expense"
                  : "Transactions"}
            </h1>
            <p style={styles.pageSubtitle}>
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <button style={styles.addBtn} onClick={() => setView("add")}>
            + Add Expense
          </button>
        </header>

        {/* ════════════ DASHBOARD VIEW ════════════ */}
        {view === "dashboard" && (
          <div className="fade-in">
            {/* Stat Cards */}
            <div style={styles.statsRow}>
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
              ].map((s, i) => (
                <div key={i} style={styles.statCard} className="stat-card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <p style={styles.statLabel}>{s.label}</p>
                      <p style={{ ...styles.statValue, color: s.color }}>
                        {s.value}
                      </p>
                      <p style={styles.statSub}>{s.sub}</p>
                    </div>
                    <span
                      style={{ ...styles.statIcon, background: s.color + "22" }}
                    >
                      {s.icon}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Two-column row */}
            <div style={styles.twoCol}>
              {/* Category Breakdown */}
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Spending by Category</h2>
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
                              color: "#CBD5E1",
                              fontSize: 13,
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <span
                              style={{
                                ...styles.catDot,
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
                        <div style={styles.barBg}>
                          <div
                            style={{
                              ...styles.barFill,
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
              <div style={styles.card}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <h2 style={styles.cardTitle}>Recent Transactions</h2>
                  <button
                    style={styles.linkBtn}
                    onClick={() => setView("list")}
                  >
                    View all →
                  </button>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {recentExpenses.map((exp) => {
                    const meta = getCategoryMeta(exp.category);
                    return (
                      <div key={exp.id} style={styles.txRow} className="tx-row">
                        <div
                          style={{
                            ...styles.txIcon,
                            background: meta.color + "22",
                            color: meta.color,
                          }}
                        >
                          {meta.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={styles.txTitle}>{exp.title}</p>
                          <p style={styles.txMeta}>
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
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Monthly Overview — 2026</h2>
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
                            : "#1E293B",
                          boxShadow: isCurrent ? "0 0 10px #A78BFA55" : "none",
                          transition: "height 0.4s ease",
                        }}
                        title={formatINR(amt)}
                      />
                      <span
                        style={{
                          fontSize: 9,
                          color: isCurrent ? "#A78BFA" : "#475569",
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

        {/* ════════════ ADD EXPENSE VIEW ════════════ */}
        {view === "add" && (
          <div className="fade-in" style={{ maxWidth: 560 }}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Expense Details</h2>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 18 }}
              >
                {/* Title */}
                <div>
                  <label style={styles.label}>Title *</label>
                  <input
                    style={{
                      ...styles.input,
                      ...(errors.title ? styles.inputError : {}),
                    }}
                    placeholder="e.g. Coffee at Starbucks"
                    value={form.title}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, title: e.target.value }))
                    }
                  />
                  {errors.title && <p style={styles.errText}>{errors.title}</p>}
                </div>

                {/* Amount */}
                <div>
                  <label style={styles.label}>Amount (₹) *</label>
                  <div style={{ position: "relative" }}>
                    <span style={styles.inputPrefix}>₹</span>
                    <input
                      style={{
                        ...styles.input,
                        paddingLeft: 36,
                        ...(errors.amount ? styles.inputError : {}),
                      }}
                      placeholder="0.00"
                      type="number"
                      value={form.amount}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, amount: e.target.value }))
                      }
                    />
                  </div>
                  {errors.amount && (
                    <p style={styles.errText}>{errors.amount}</p>
                  )}
                </div>

                {/* Category Picker */}
                <div>
                  <label style={styles.label}>Category</label>
                  <div style={styles.catGrid}>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.name}
                        style={{
                          ...styles.catBtn,
                          background:
                            form.category === cat.name
                              ? cat.color + "33"
                              : "#0F172A",
                          border: `1.5px solid ${form.category === cat.name ? cat.color : "#1E293B"}`,
                          color:
                            form.category === cat.name ? cat.color : "#64748B",
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

                {/* Date */}
                <div>
                  <label style={styles.label}>Date *</label>
                  <input
                    style={{
                      ...styles.input,
                      ...(errors.date ? styles.inputError : {}),
                    }}
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, date: e.target.value }))
                    }
                  />
                  {errors.date && <p style={styles.errText}>{errors.date}</p>}
                </div>

                {/* Note */}
                <div>
                  <label style={styles.label}>Note (optional)</label>
                  <textarea
                    style={{ ...styles.input, height: 72, resize: "none" }}
                    placeholder="Any extra details..."
                    value={form.note}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, note: e.target.value }))
                    }
                  />
                </div>

                <button style={styles.submitBtn} onClick={handleAdd}>
                  Add Expense →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════ ALL EXPENSES VIEW ════════════ */}
        {view === "list" && (
          <div className="fade-in">
            {/* Filter Bar */}
            <div style={styles.filterBar}>
              <input
                style={{ ...styles.input, maxWidth: 240, marginBottom: 0 }}
                placeholder="🔍 Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                style={{ ...styles.input, maxWidth: 180, marginBottom: 0 }}
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.name}>{c.name}</option>
                ))}
              </select>
              <select
                style={{ ...styles.input, maxWidth: 160, marginBottom: 0 }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Sort: Date</option>
                <option value="amount">Sort: Amount</option>
                <option value="title">Sort: Title</option>
              </select>
              <span
                style={{ color: "#64748B", fontSize: 13, marginLeft: "auto" }}
              >
                {filteredExpenses.length} result
                {filteredExpenses.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div style={styles.card}>
              {filteredExpenses.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 0",
                    color: "#475569",
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
                          ...styles.listRow,
                          borderBottom:
                            i < filteredExpenses.length - 1
                              ? "1px solid #1E293B"
                              : "none",
                        }}
                      >
                        <div
                          style={{
                            ...styles.txIcon,
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
                            <p style={styles.txTitle}>{exp.title}</p>
                            <span
                              style={{
                                ...styles.catTag,
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
                                color: "#475569",
                                fontSize: 12,
                                margin: "2px 0 0",
                              }}
                            >
                              {exp.note}
                            </p>
                          )}
                          <p style={styles.txMeta}>
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
                            style={styles.deleteBtn}
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

/* ─────────────────────────────────────────
   STYLES
───────────────────────────────────────── */
const styles = {
  app: {
    display: "flex",
    minHeight: "100vh",
    background: "#070B14",
    fontFamily: "'DM Sans', sans-serif",
    color: "#E2E8F0",
  },
  sidebar: {
    width: 240,
    background: "#0B1120",
    borderRight: "1px solid #1E293B",
    display: "flex",
    flexDirection: "column",
    padding: "28px 16px",
    position: "sticky",
    top: 0,
    height: "100vh",
    gap: 8,
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
    color: "#fff",
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
    color: "#64748B",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    textAlign: "left",
    transition: "all 0.2s",
  },
  navBtnActive: { background: "#1E293B", color: "#E2E8F0" },
  navIcon: { fontSize: 16, width: 20 },
  sidebarCard: {
    marginTop: "auto",
    background: "#0F172A",
    borderRadius: 12,
    padding: 16,
    border: "1px solid #1E293B",
  },
  progressBar: {
    height: 4,
    background: "#1E293B",
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
  main: { flex: 1, padding: "32px 36px", overflowY: "auto", maxWidth: "100%" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  pageTitle: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
    color: "#fff",
    fontFamily: "'Playfair Display', serif",
    letterSpacing: -0.5,
  },
  pageSubtitle: { margin: "4px 0 0", color: "#475569", fontSize: 13 },
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
    background: "#0B1120",
    border: "1px solid #1E293B",
    borderRadius: 16,
    padding: 20,
    transition: "transform 0.2s, border-color 0.2s",
  },
  statLabel: {
    color: "#64748B",
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
  statSub: { color: "#475569", fontSize: 11, margin: 0 },
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
    background: "#0B1120",
    border: "1px solid #1E293B",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  cardTitle: {
    margin: "0 0 20px",
    fontSize: 16,
    fontWeight: 600,
    color: "#E2E8F0",
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
    background: "#1E293B",
    borderRadius: 99,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 99, transition: "width 0.6s ease" },
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
  txTitle: { margin: 0, color: "#CBD5E1", fontSize: 13, fontWeight: 500 },
  txMeta: { margin: "2px 0 0", color: "#475569", fontSize: 11 },
  label: {
    display: "block",
    marginBottom: 6,
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    width: "100%",
    background: "#0F172A",
    border: "1.5px solid #1E293B",
    borderRadius: 10,
    padding: "11px 14px",
    color: "#E2E8F0",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
  },
  inputError: { borderColor: "#FF6B6B" },
  inputPrefix: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#64748B",
    fontSize: 15,
  },
  errText: { color: "#FF6B6B", fontSize: 11, margin: "4px 0 0" },
  catGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 },
  catBtn: {
    border: "1.5px solid #1E293B",
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
    background: "#1E293B",
    border: "none",
    color: "#64748B",
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
    background: "#0B1120",
    border: "1px solid #1E293B",
    borderRadius: 20,
    padding: "32px 40px",
    textAlign: "center",
    maxWidth: 320,
  },
  btnOutline: {
    flex: 1,
    background: "transparent",
    border: "1.5px solid #334155",
    borderRadius: 10,
    padding: "10px",
    color: "#94A3B8",
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

/* ─────────────────────────────────────────
   GLOBAL CSS (injected via <style> tag)
───────────────────────────────────────── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; }
  .fade-in { animation: fadeIn 0.35s ease; }
  @keyframes fadeIn  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
  .stat-card:hover { transform: translateY(-2px); border-color: #334155 !important; }
  .tx-row:hover { background: #0F172A; padding-left: 8px; padding-right: 8px; }
  input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
  select option { background: #0F172A; }
  input::placeholder, textarea::placeholder { color: #334155; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #070B14; }
  ::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 99px; }
`;
