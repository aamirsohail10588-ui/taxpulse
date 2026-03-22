"use client";

import { useState, useEffect } from "react";

// ─── COMPLIANCE CALENDAR ───────────────────────────────────────────────
// All major GST/TDS due dates for India FY 2025-26
const COMPLIANCE_RULES = [
  // GST
  {
    id: "gstr1_monthly",
    label: "GSTR-1 (Monthly)",
    type: "GST",
    day: 11,
    freq: "monthly",
    color: "#00c896",
    penalty: "₹50/day (max ₹5,000)",
  },
  {
    id: "gstr1_qrmp",
    label: "GSTR-1 (QRMP — IFF)",
    type: "GST",
    day: 13,
    freq: "monthly",
    color: "#00c896",
    penalty: "₹50/day (max ₹5,000)",
  },
  {
    id: "gstr3b_monthly",
    label: "GSTR-3B (Monthly)",
    type: "GST",
    day: 20,
    freq: "monthly",
    color: "#00c896",
    penalty: "₹50/day + 18% interest",
  },
  {
    id: "gstr3b_qrmp_a",
    label: "GSTR-3B (QRMP — Cat A)",
    type: "GST",
    day: 22,
    freq: "monthly",
    color: "#00c896",
    penalty: "₹50/day",
  },
  {
    id: "gstr3b_qrmp_b",
    label: "GSTR-3B (QRMP — Cat B)",
    type: "GST",
    day: 24,
    freq: "monthly",
    color: "#00c896",
    penalty: "₹50/day",
  },
  {
    id: "gstr9",
    label: "GSTR-9 (Annual)",
    type: "GST",
    day: 31,
    freq: "dec_only",
    color: "#00c896",
    penalty: "₹200/day",
  },
  // TDS
  {
    id: "tds_deposit",
    label: "TDS Deposit (Govt)",
    type: "TDS",
    day: 7,
    freq: "monthly",
    color: "#ff9f43",
    penalty: "1.5%/month interest",
  },
  {
    id: "tds_deposit_non",
    label: "TDS Deposit (Non-Govt)",
    type: "TDS",
    day: 7,
    freq: "monthly",
    color: "#ff9f43",
    penalty: "1.5%/month interest",
  },
  {
    id: "tds_return_q1",
    label: "TDS Return Q1 (26Q/24Q)",
    type: "TDS",
    day: 31,
    freq: "quarterly_jul",
    color: "#ff9f43",
    penalty: "₹200/day",
  },
  {
    id: "tds_return_q2",
    label: "TDS Return Q2 (26Q/24Q)",
    type: "TDS",
    day: 31,
    freq: "quarterly_oct",
    color: "#ff9f43",
    penalty: "₹200/day",
  },
  {
    id: "tds_return_q3",
    label: "TDS Return Q3 (26Q/24Q)",
    type: "TDS",
    day: 31,
    freq: "quarterly_jan",
    color: "#ff9f43",
    penalty: "₹200/day",
  },
  {
    id: "tds_return_q4",
    label: "TDS Return Q4 (26Q/24Q)",
    type: "TDS",
    day: 31,
    freq: "quarterly_may",
    color: "#ff9f43",
    penalty: "₹200/day",
  },
  // Advance Tax
  {
    id: "adv_tax_q1",
    label: "Advance Tax Q1 (15%)",
    type: "IT",
    day: 15,
    freq: "jun_only",
    color: "#a78bfa",
    penalty: "1% interest/month",
  },
  {
    id: "adv_tax_q2",
    label: "Advance Tax Q2 (45%)",
    type: "IT",
    day: 15,
    freq: "sep_only",
    color: "#a78bfa",
    penalty: "1% interest/month",
  },
  {
    id: "adv_tax_q3",
    label: "Advance Tax Q3 (75%)",
    type: "IT",
    day: 15,
    freq: "dec_only",
    color: "#a78bfa",
    penalty: "1% interest/month",
  },
  {
    id: "adv_tax_q4",
    label: "Advance Tax Q4 (100%)",
    type: "IT",
    day: 15,
    freq: "mar_only",
    color: "#a78bfa",
    penalty: "1% interest/month",
  },
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

function getDueDates(today) {
  const results = [];
  const y = today.getFullYear();
  const m = today.getMonth(); // 0-indexed

  COMPLIANCE_RULES.forEach((rule) => {
    const addDeadline = (year, month) => {
      const due = new Date(year, month, rule.day);
      const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      if (diff >= -5 && diff <= 60) {
        results.push({
          ...rule,
          due,
          diff,
          monthLabel: MONTHS[month] + " " + year,
          status:
            diff < 0
              ? "overdue"
              : diff <= 3
                ? "critical"
                : diff <= 7
                  ? "urgent"
                  : diff <= 14
                    ? "upcoming"
                    : "scheduled",
        });
      }
    };

    if (rule.freq === "monthly") {
      addDeadline(y, m);
      addDeadline(y, m + 1 > 11 ? 0 : m + 1);
    } else if (rule.freq === "dec_only" && m === 11) addDeadline(y, m);
    else if (rule.freq === "jun_only" && m === 5) addDeadline(y, m);
    else if (rule.freq === "sep_only" && m === 8) addDeadline(y, m);
    else if (rule.freq === "mar_only" && m === 2) addDeadline(y, m);
    else if (rule.freq === "quarterly_jul" && m >= 6 && m <= 8)
      addDeadline(y, 6);
    else if (rule.freq === "quarterly_oct" && m >= 9 && m <= 11)
      addDeadline(y, 9);
    else if (rule.freq === "quarterly_jan" && m >= 0 && m <= 2)
      addDeadline(y, 0);
    else if (rule.freq === "quarterly_may" && m >= 3 && m <= 5)
      addDeadline(y, 4);
  });

  return results.sort((a, b) => a.diff - b.diff);
}

const STATUS_CONFIG = {
  overdue: {
    label: "OVERDUE",
    bg: "#3a0a0a",
    border: "#ff4757",
    text: "#ff6b6b",
    dot: "#ff4757",
  },
  critical: {
    label: "CRITICAL",
    bg: "#2d1500",
    border: "#ff6b35",
    text: "#ff8c5a",
    dot: "#ff6b35",
  },
  urgent: {
    label: "URGENT",
    bg: "#2d2000",
    border: "#ffa502",
    text: "#ffc048",
    dot: "#ffa502",
  },
  upcoming: {
    label: "UPCOMING",
    bg: "#001a2d",
    border: "#0090ff",
    text: "#40b3ff",
    dot: "#0090ff",
  },
  scheduled: {
    label: "SCHEDULED",
    bg: "#001a12",
    border: "#00c896",
    text: "#00e0aa",
    dot: "#00c896",
  },
};

const TYPE_COLOR = { GST: "#00c896", TDS: "#ff9f43", IT: "#a78bfa" };

// ─── DEMO CLIENTS ──────────────────────────────────────────────────────
const DEMO_CLIENTS = [
  {
    id: 1,
    name: "Ravi Traders",
    gstin: "29AABCT1332L1ZD",
    phone: "+919876543210",
    email: "ravi@ravitraders.com",
    filings: ["gstr1_monthly", "gstr3b_monthly", "tds_deposit"],
  },
  {
    id: 2,
    name: "Lakshmi Steel Works",
    gstin: "29AADCS0472N1ZP",
    phone: "+919845001234",
    email: "lakshmi@steelworks.in",
    filings: ["gstr1_monthly", "gstr3b_monthly"],
  },
  {
    id: 3,
    name: "Prakash Electronics",
    gstin: "29AAECS2931M2Z1",
    phone: "+919900112233",
    email: "prakash@electronics.in",
    filings: ["gstr3b_qrmp_a", "tds_return_q4", "adv_tax_q4"],
  },
  {
    id: 4,
    name: "Kiran Constructions",
    gstin: "29AAHCK9182D1Z5",
    phone: "+919741234567",
    email: "kiran@constructions.in",
    filings: [
      "gstr1_monthly",
      "gstr3b_monthly",
      "tds_deposit",
      "tds_return_q4",
    ],
  },
  {
    id: 5,
    name: "Deepa Fashion House",
    gstin: "29AAKCD8821F1ZR",
    phone: "+919632145870",
    email: "deepa@fashionhouse.in",
    filings: ["gstr3b_qrmp_b", "gstr1_qrmp"],
  },
];

// ─── MAIN APP ──────────────────────────────────────────────────────────
export default function TaxPulse() {
  const [clients, setClients] = useState(DEMO_CLIENTS);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filterType, setFilterType] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [reminderSent, setReminderSent] = useState({});
  const [toast, setToast] = useState(null);
  const [newClient, setNewClient] = useState({
    name: "",
    gstin: "",
    phone: "",
    email: "",
    filings: [],
  });

  const today = new Date(2026, 2, 22); // March 22 2026
  const allDeadlines = getDueDates(today);

  // Build client-deadline matrix
  const clientDeadlines = clients
    .flatMap((client) =>
      allDeadlines
        .filter((d) => client.filings.includes(d.id))
        .map((d) => ({ ...d, client })),
    )
    .sort((a, b) => a.diff - b.diff);

  const filtered = clientDeadlines.filter((d) => {
    const typeMatch = filterType === "ALL" || d.type === filterType;
    const statusMatch = filterStatus === "ALL" || d.status === filterStatus;
    return typeMatch && statusMatch;
  });

  // Stats
  const overdue = clientDeadlines.filter((d) => d.status === "overdue").length;
  const critical = clientDeadlines.filter(
    (d) => d.status === "critical",
  ).length;
  const urgent = clientDeadlines.filter((d) => d.status === "urgent").length;
  const upcoming = clientDeadlines.filter(
    (d) => d.status === "upcoming",
  ).length;
  const thisMonth = clientDeadlines.filter(
    (d) => d.diff >= 0 && d.diff <= 31,
  ).length;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const sendReminder = (item, channel) => {
    const key = `${item.client.id}-${item.id}-${channel}`;
    setReminderSent((prev) => ({ ...prev, [key]: true }));
    const ch = channel === "whatsapp" ? "WhatsApp" : "Email";
    showToast(`${ch} reminder sent to ${item.client.name} for ${item.label}`);
  };

  const sendBulkReminders = () => {
    const urgentItems = clientDeadlines.filter(
      (d) =>
        d.status === "critical" ||
        d.status === "urgent" ||
        d.status === "overdue",
    );
    urgentItems.forEach((item) => {
      const key1 = `${item.client.id}-${item.id}-email`;
      const key2 = `${item.client.id}-${item.id}-whatsapp`;
      setReminderSent((prev) => ({ ...prev, [key1]: true, [key2]: true }));
    });
    showToast(
      `Bulk reminders sent to ${urgentItems.length} deadline(s) via Email + WhatsApp`,
      "success",
    );
  };

  const addClient = () => {
    if (!newClient.name || !newClient.gstin) return;
    setClients((prev) => [
      ...prev,
      {
        ...newClient,
        id: Date.now(),
        filings: newClient.filings.length
          ? newClient.filings
          : ["gstr1_monthly", "gstr3b_monthly"],
      },
    ]);
    setNewClient({ name: "", gstin: "", phone: "", email: "", filings: [] });
    setShowAddClient(false);
    showToast(`Client "${newClient.name}" added successfully`);
  };

  const toggleFiling = (id) => {
    setNewClient((prev) => ({
      ...prev,
      filings: prev.filings.includes(id)
        ? prev.filings.filter((f) => f !== id)
        : [...prev.filings, id],
    }));
  };

  return (
    <div
      style={{
        background: "#050709",
        minHeight: "100vh",
        fontFamily: "'DM Mono', monospace",
        color: "#d4dde8",
        padding: "0",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0d12; }
        ::-webkit-scrollbar-thumb { background: #1e2530; border-radius: 4px; }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .fadein { animation: fadein .3s ease; }
        @keyframes fadein { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .tab-btn { background:transparent; border:none; cursor:pointer; font-family:'DM Mono',monospace; font-size:11px; letter-spacing:1.5px; text-transform:uppercase; padding:8px 16px; border-radius:6px; transition:all .15s; }
        .tab-btn.active { background:#0f2318; color:#00c896; border:1px solid #00c89640; }
        .tab-btn:not(.active) { color:#4a5568; border:1px solid transparent; }
        .tab-btn:not(.active):hover { color:#8a99aa; background:#0d1117; }
        .filter-pill { background:transparent; border:1px solid #1e2530; border-radius:20px; cursor:pointer; font-family:'DM Mono',monospace; font-size:9px; letter-spacing:1px; text-transform:uppercase; padding:4px 12px; transition:all .15s; color:#4a5568; }
        .filter-pill:hover { border-color:#2a3548; color:#8a99aa; }
        .filter-pill.on { border-color:#00c89660; color:#00c896; background:#00c89610; }
        .stat-card { background:#080b10; border:1px solid #141922; border-radius:12px; padding:16px 18px; transition:all .2s; cursor:default; }
        .stat-card:hover { border-color:#1e2d1e; transform:translateY(-1px); }
        .deadline-row { background:#080b10; border:1px solid #141922; border-radius:10px; padding:13px 16px; margin-bottom:7px; transition:all .15s; }
        .deadline-row:hover { background:#0d1117; border-color:#1e2530; }
        .btn-sm { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:.8px; text-transform:uppercase; padding:5px 10px; border-radius:5px; border:1px solid; cursor:pointer; transition:all .15s; background:transparent; white-space:nowrap; }
        .btn-wa { border-color:#25d36640; color:#25d366; }
        .btn-wa:hover { background:#25d36620; }
        .btn-em { border-color:#4d9fff40; color:#4d9fff; }
        .btn-em:hover { background:#4d9fff20; }
        .btn-sent { border-color:#1e2530; color:#3a4555; cursor:default; }
        .input-field { background:#080b10; border:1px solid #1e2530; border-radius:8px; padding:9px 13px; color:#d4dde8; font-family:'DM Mono',monospace; font-size:12px; outline:none; width:100%; transition:border-color .15s; }
        .input-field:focus { border-color:#00c89650; }
        .input-field::placeholder { color:#2a3548; }
        .modal-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:#000000cc; display:flex; align-items:center; justify-content:center; z-index:100; padding:16px; }
        .modal { background:#080b10; border:1px solid #1e2530; border-radius:16px; padding:24px; width:100%; max-width:540px; max-height:90vh; overflow-y:auto; }
        .checkbox-item { display:flex; align-items:center; gap:8px; padding:6px 0; cursor:pointer; }
        .checkbox-item input { accent-color:#00c896; }
        .timeline-bar { height:3px; border-radius:3px; background:#141922; overflow:hidden; }
        .timeline-fill { height:100%; border-radius:3px; transition:width .5s ease; }
        .client-card { background:#080b10; border:1px solid #141922; border-radius:10px; padding:14px 16px; cursor:pointer; transition:all .15s; }
        .client-card:hover { border-color:#1e2d3a; background:#0a0e15; }
        .badge { font-family:'DM Mono',monospace; font-size:8px; letter-spacing:1px; padding:2px 7px; border-radius:3px; text-transform:uppercase; }
        .toast { position:fixed; bottom:24px; right:24px; background:#0f1922; border:1px solid #00c89650; border-radius:10px; padding:12px 18px; font-size:12px; color:#00e0aa; z-index:999; animation:fadein .3s ease; max-width:320px; }
      `}</style>

      {/* TOPBAR */}
      <div
        style={{
          background: "#060810",
          borderBottom: "1px solid #0f1520",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg,#00c896,#0066ff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
            }}
          >
            ⚡
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Outfit',sans-serif",
                fontWeight: 700,
                fontSize: 16,
                letterSpacing: "-0.5px",
                color: "#fff",
              }}
            >
              TaxPulse
            </div>
            <div
              style={{
                fontSize: 9,
                color: "#2a3d55",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              GST · TDS · Compliance Dashboard
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              fontSize: 10,
              color: "#2a4030",
              fontFamily: "'DM Mono',monospace",
            }}
          >
            <span style={{ color: "#00c896" }}>●</span> {clients.length} clients
          </div>
          <button
            onClick={sendBulkReminders}
            style={{
              background: "linear-gradient(135deg,#00c896,#00a878)",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              color: "#001a10",
              fontFamily: "'DM Mono',monospace",
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "1px",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            ⚡ Bulk Remind
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px" }}>
        {/* STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5,1fr)",
            gap: 10,
            marginBottom: 20,
          }}
        >
          {[
            { label: "Overdue", val: overdue, color: "#ff4757", bg: "#2d0808" },
            {
              label: "Critical",
              val: critical,
              color: "#ff6b35",
              bg: "#2d1500",
            },
            { label: "Urgent", val: urgent, color: "#ffa502", bg: "#2d2000" },
            {
              label: "Upcoming",
              val: upcoming,
              color: "#0090ff",
              bg: "#001a2d",
            },
            {
              label: "This Month",
              val: thisMonth,
              color: "#00c896",
              bg: "#001a12",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="stat-card"
              style={{
                borderColor:
                  s.val > 0 && s.label !== "This Month"
                    ? s.color + "40"
                    : "#141922",
              }}
            >
              <div
                style={{
                  fontFamily: "'Outfit',sans-serif",
                  fontSize: 28,
                  fontWeight: 700,
                  color: s.val > 0 ? s.color : "#2a3548",
                  lineHeight: 1,
                }}
              >
                {s.val}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "#3a4a5a",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  marginTop: 4,
                }}
              >
                {s.label}
              </div>
              {s.val > 0 && s.label === "Overdue" && (
                <div
                  className="pulse"
                  style={{ fontSize: 8, color: "#ff4757", marginTop: 4 }}
                >
                  Action required
                </div>
              )}
            </div>
          ))}
        </div>

        {/* TABS */}
        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 20,
            borderBottom: "1px solid #0f1520",
            paddingBottom: 12,
          }}
        >
          {[
            ["dashboard", "📊 Dashboard"],
            ["clients", "👥 Clients"],
            ["calendar", "📅 Calendar"],
            ["setup", "⚙ Setup"],
          ].map(([t, l]) => (
            <button
              key={t}
              className={`tab-btn ${activeTab === t ? "active" : ""}`}
              onClick={() => setActiveTab(t)}
            >
              {l}
            </button>
          ))}
        </div>

        {/* ══ DASHBOARD TAB ══ */}
        {activeTab === "dashboard" && (
          <div className="fadein">
            {/* Filters */}
            <div
              style={{
                display: "flex",
                gap: 6,
                marginBottom: 16,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  color: "#2a3548",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  marginRight: 4,
                }}
              >
                Type:
              </span>
              {["ALL", "GST", "TDS", "IT"].map((f) => (
                <button
                  key={f}
                  className={`filter-pill ${filterType === f ? "on" : ""}`}
                  onClick={() => setFilterType(f)}
                >
                  {f}
                </button>
              ))}
              <span
                style={{
                  fontSize: 9,
                  color: "#2a3548",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  marginLeft: 10,
                  marginRight: 4,
                }}
              >
                Status:
              </span>
              {[
                "ALL",
                "overdue",
                "critical",
                "urgent",
                "upcoming",
                "scheduled",
              ].map((f) => (
                <button
                  key={f}
                  className={`filter-pill ${filterStatus === f ? "on" : ""}`}
                  onClick={() => setFilterStatus(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Deadline Rows */}
            {filtered.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 0",
                  color: "#2a3548",
                  fontSize: 13,
                }}
              >
                No deadlines match the selected filter.
              </div>
            )}
            {filtered.map((item, i) => {
              const sc = STATUS_CONFIG[item.status];
              const keyWA = `${item.client.id}-${item.id}-whatsapp`;
              const keyEM = `${item.client.id}-${item.id}-email`;
              const progress = Math.max(
                0,
                Math.min(
                  100,
                  item.diff <= 0
                    ? 100
                    : item.diff >= 30
                      ? 5
                      : 100 - (item.diff / 30) * 95,
                ),
              );
              return (
                <div
                  key={i}
                  className="deadline-row fadein"
                  style={{ borderColor: sc.border + "40" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 4,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: sc.dot,
                            display: "inline-block",
                            flexShrink: 0,
                          }}
                          className={
                            item.status === "overdue" ||
                            item.status === "critical"
                              ? "pulse"
                              : ""
                          }
                        />
                        <span
                          style={{
                            fontFamily: "'Outfit',sans-serif",
                            fontWeight: 600,
                            fontSize: 13,
                            color: "#d4dde8",
                          }}
                        >
                          {item.label}
                        </span>
                        <span
                          className="badge"
                          style={{
                            background: sc.bg,
                            color: sc.text,
                            border: `1px solid ${sc.border}40`,
                          }}
                        >
                          {sc.label}
                        </span>
                        <span
                          className="badge"
                          style={{
                            background: TYPE_COLOR[item.type] + "15",
                            color: TYPE_COLOR[item.type],
                            border: `1px solid ${TYPE_COLOR[item.type]}40`,
                          }}
                        >
                          {item.type}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#3a5060",
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ color: "#4a6a7a" }}>Client:</span>{" "}
                        <span style={{ color: "#6a8a9a" }}>
                          {item.client.name}
                        </span>
                        <span style={{ margin: "0 8px", color: "#1e2530" }}>
                          ·
                        </span>
                        <span style={{ color: "#4a6a7a" }}>Due:</span>{" "}
                        <span style={{ color: sc.text }}>
                          {item.diff < 0
                            ? `${Math.abs(item.diff)} days overdue`
                            : item.diff === 0
                              ? "Due TODAY"
                              : `${item.diff} days (${item.due.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })})`}
                        </span>
                        <span style={{ margin: "0 8px", color: "#1e2530" }}>
                          ·
                        </span>
                        <span style={{ color: "#4a6a7a" }}>Penalty:</span>{" "}
                        <span style={{ color: "#ff6b4a", fontSize: 10 }}>
                          {item.penalty}
                        </span>
                      </div>
                      <div
                        className="timeline-bar"
                        style={{ width: "100%", maxWidth: 280 }}
                      >
                        <div
                          className="timeline-fill"
                          style={{
                            width: `${progress}%`,
                            background:
                              item.status === "scheduled"
                                ? "#00c896"
                                : item.status === "upcoming"
                                  ? "#0090ff"
                                  : item.status === "urgent"
                                    ? "#ffa502"
                                    : item.status === "critical"
                                      ? "#ff6b35"
                                      : "#ff4757",
                          }}
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 5,
                        flexShrink: 0,
                        alignItems: "center",
                      }}
                    >
                      <button
                        className={`btn-sm ${reminderSent[keyWA] ? "btn-sent" : "btn-wa"}`}
                        onClick={() =>
                          !reminderSent[keyWA] && sendReminder(item, "whatsapp")
                        }
                        disabled={reminderSent[keyWA]}
                      >
                        {reminderSent[keyWA] ? "✓ WA Sent" : "📱 WhatsApp"}
                      </button>
                      <button
                        className={`btn-sm ${reminderSent[keyEM] ? "btn-sent" : "btn-em"}`}
                        onClick={() =>
                          !reminderSent[keyEM] && sendReminder(item, "email")
                        }
                        disabled={reminderSent[keyEM]}
                      >
                        {reminderSent[keyEM] ? "✓ Email Sent" : "✉ Email"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ CLIENTS TAB ══ */}
        {activeTab === "clients" && (
          <div className="fadein">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 11, color: "#3a4a5a" }}>
                {clients.length} clients registered
              </div>
              <button
                onClick={() => setShowAddClient(true)}
                style={{
                  background: "#0f2318",
                  border: "1px solid #00c89640",
                  borderRadius: 8,
                  padding: "8px 16px",
                  color: "#00c896",
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 10,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                + Add Client
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
                gap: 10,
              }}
            >
              {clients.map((client) => {
                const cd = clientDeadlines.filter(
                  (d) => d.client.id === client.id,
                );
                const ov = cd.filter((d) => d.status === "overdue").length;
                const cr = cd.filter((d) => d.status === "critical").length;
                return (
                  <div
                    key={client.id}
                    className="client-card"
                    onClick={() =>
                      setSelectedClient(
                        client.id === selectedClient ? null : client.id,
                      )
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 8,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: "'Outfit',sans-serif",
                            fontWeight: 600,
                            fontSize: 14,
                            color: "#d4dde8",
                            marginBottom: 2,
                          }}
                        >
                          {client.name}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: "#2a4050",
                            fontFamily: "'DM Mono',monospace",
                          }}
                        >
                          {client.gstin}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        {ov > 0 && (
                          <span
                            className="badge"
                            style={{
                              background: "#2d0808",
                              color: "#ff6b6b",
                              border: "1px solid #ff475740",
                            }}
                          >
                            {ov} overdue
                          </span>
                        )}
                        {cr > 0 && (
                          <span
                            className="badge"
                            style={{
                              background: "#2d1500",
                              color: "#ff8c5a",
                              border: "1px solid #ff6b3540",
                            }}
                          >
                            {cr} critical
                          </span>
                        )}
                        {ov === 0 && cr === 0 && (
                          <span
                            className="badge"
                            style={{
                              background: "#001a12",
                              color: "#00c896",
                              border: "1px solid #00c89640",
                            }}
                          >
                            ✓ OK
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#2a4050",
                        marginBottom: 8,
                      }}
                    >
                      📱 {client.phone} · ✉ {client.email}
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {client.filings.map((f) => {
                        const rule = COMPLIANCE_RULES.find((r) => r.id === f);
                        return rule ? (
                          <span
                            key={f}
                            className="badge"
                            style={{
                              background: TYPE_COLOR[rule.type] + "15",
                              color: TYPE_COLOR[rule.type],
                              border: `1px solid ${TYPE_COLOR[rule.type]}30`,
                            }}
                          >
                            {rule.type}
                          </span>
                        ) : null;
                      })}
                      <span style={{ fontSize: 10, color: "#2a4050" }}>
                        {client.filings.length} filing types
                      </span>
                    </div>
                    {selectedClient === client.id && (
                      <div
                        style={{
                          marginTop: 12,
                          paddingTop: 12,
                          borderTop: "1px solid #0f1520",
                        }}
                        className="fadein"
                      >
                        {cd.slice(0, 5).map((d, i) => {
                          const sc = STATUS_CONFIG[d.status];
                          return (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "5px 0",
                                borderBottom: "1px solid #0a0f15",
                                fontSize: 11,
                              }}
                            >
                              <span style={{ color: "#5a7080" }}>
                                {d.label}
                              </span>
                              <span
                                style={{
                                  color: sc.text,
                                  fontFamily: "'DM Mono',monospace",
                                  fontSize: 10,
                                }}
                              >
                                {d.diff < 0
                                  ? `${Math.abs(d.diff)}d overdue`
                                  : `${d.diff}d left`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ CALENDAR TAB ══ */}
        {activeTab === "calendar" && (
          <div className="fadein">
            <div style={{ fontSize: 11, color: "#3a4a5a", marginBottom: 16 }}>
              Upcoming compliance deadlines — next 60 days
            </div>
            {["March 2026", "April 2026", "May 2026"].map((month) => {
              const monthDeadlines = clientDeadlines.filter(
                (d) => d.monthLabel === month && d.diff >= 0,
              );
              if (!monthDeadlines.length) return null;
              return (
                <div key={month} style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      fontFamily: "'Outfit',sans-serif",
                      fontWeight: 600,
                      fontSize: 13,
                      color: "#00c896",
                      marginBottom: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span>📅 {month}</span>
                    <span
                      style={{
                        fontSize: 10,
                        color: "#2a4050",
                        fontWeight: 400,
                      }}
                    >
                      ({monthDeadlines.length} deadlines)
                    </span>
                  </div>
                  {[...new Set(monthDeadlines.map((d) => d.due.getDate()))]
                    .sort((a, b) => a - b)
                    .map((day) => {
                      const dayItems = monthDeadlines.filter(
                        (d) => d.due.getDate() === day,
                      );
                      return (
                        <div
                          key={day}
                          style={{
                            display: "flex",
                            gap: 12,
                            marginBottom: 8,
                            alignItems: "flex-start",
                          }}
                        >
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 8,
                              background: "#080b10",
                              border: "1px solid #141922",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <div
                              style={{
                                fontFamily: "'Outfit',sans-serif",
                                fontWeight: 700,
                                fontSize: 16,
                                lineHeight: 1,
                                color: "#d4dde8",
                              }}
                            >
                              {day}
                            </div>
                          </div>
                          <div style={{ flex: 1 }}>
                            {dayItems.map((item, i) => {
                              const sc = STATUS_CONFIG[item.status];
                              return (
                                <div
                                  key={i}
                                  style={{
                                    background: "#080b10",
                                    border: `1px solid ${sc.border}30`,
                                    borderRadius: 8,
                                    padding: "8px 12px",
                                    marginBottom: 4,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <div>
                                    <span
                                      style={{
                                        fontSize: 12,
                                        fontWeight: 500,
                                        color: "#c4cdd8",
                                        fontFamily: "'Outfit',sans-serif",
                                      }}
                                    >
                                      {item.label}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: 10,
                                        color: "#3a5060",
                                        marginLeft: 8,
                                      }}
                                    >
                                      {item.client.name}
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: 4,
                                      alignItems: "center",
                                    }}
                                  >
                                    <span
                                      className="badge"
                                      style={{
                                        background: sc.bg,
                                        color: sc.text,
                                        border: `1px solid ${sc.border}40`,
                                      }}
                                    >
                                      {sc.label}
                                    </span>
                                    <span
                                      className="badge"
                                      style={{
                                        background:
                                          TYPE_COLOR[item.type] + "15",
                                        color: TYPE_COLOR[item.type],
                                      }}
                                    >
                                      {item.type}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              );
            })}
          </div>
        )}

        {/* ══ SETUP TAB ══ */}
        {activeTab === "setup" && (
          <div className="fadein" style={{ maxWidth: 600 }}>
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontFamily: "'Outfit',sans-serif",
                  fontWeight: 600,
                  fontSize: 15,
                  color: "#d4dde8",
                  marginBottom: 4,
                }}
              >
                How to Deploy TaxPulse (₹0)
              </div>
              <div style={{ fontSize: 11, color: "#3a5060", lineHeight: 1.7 }}>
                Follow these steps to go live with real reminders.
              </div>
            </div>
            {[
              {
                step: "01",
                title: "Create Supabase Project (Free)",
                color: "#00c896",
                desc: "Go to supabase.com → New Project. Create a 'clients' table and a 'deadlines' table. Paste the schema below into SQL Editor.",
                code: `-- clients table\nCREATE TABLE clients (\n  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n  name TEXT NOT NULL,\n  gstin TEXT NOT NULL,\n  phone TEXT,\n  email TEXT,\n  filings TEXT[] DEFAULT '{}',\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);\n\n-- reminders log\nCREATE TABLE reminders (\n  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n  client_id UUID REFERENCES clients(id),\n  rule_id TEXT,\n  channel TEXT,\n  sent_at TIMESTAMPTZ DEFAULT NOW()\n);`,
              },
              {
                step: "02",
                title: "Set Up Resend (Free Email — 3k/month)",
                color: "#4d9fff",
                desc: "Go to resend.com → Sign up free → Get API Key. Add it as RESEND_API_KEY environment variable in Vercel.",
                code: `// Send email reminder\nimport { Resend } from 'resend';\nconst resend = new Resend(process.env.RESEND_API_KEY);\n\nawait resend.emails.send({\n  from: 'TaxPulse <noreply@yourdomain.com>',\n  to: client.email,\n  subject: \`⚠ GSTR-3B Due in 3 Days — \${client.name}\`,\n  html: \`<p>Dear \${client.name},<br/>Your GSTR-3B is due on \${dueDate}.<br/>Penalty if missed: ₹50/day.</p>\`\n});`,
              },
              {
                step: "03",
                title: "Set Up Twilio WhatsApp (Free Trial)",
                color: "#25d366",
                desc: "Go to twilio.com/whatsapp → Sign up → Get free sandbox. Add TWILIO_SID, TWILIO_TOKEN, TWILIO_WHATSAPP_FROM as env vars.",
                code: `// Send WhatsApp reminder\nimport twilio from 'twilio';\nconst client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);\n\nawait client.messages.create({\n  from: 'whatsapp:+14155238886', // Twilio sandbox\n  to: \`whatsapp:\${clientPhone}\`,\n  body: \`⚡ TaxPulse Alert: GSTR-3B for \${clientName} is due on \${dueDate}. Penalty: ₹50/day. File now to avoid interest.\`\n});`,
              },
              {
                step: "04",
                title: "Deploy to Vercel (Free Forever)",
                color: "#a78bfa",
                desc: "Push code to GitHub → Connect to Vercel → Add env vars (Supabase URL, Supabase Anon Key, Resend Key, Twilio creds) → Deploy. Done.",
                code: `# .env.local\nNEXT_PUBLIC_SUPABASE_URL=your_supabase_url\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key\nRESEND_API_KEY=your_resend_key\nTWILIO_SID=your_twilio_sid\nTWILIO_TOKEN=your_twilio_token\nTWILIO_WHATSAPP_FROM=whatsapp:+14155238886\n\n# Deploy\nnpx vercel --prod`,
              },
            ].map((s) => (
              <div
                key={s.step}
                style={{
                  background: "#080b10",
                  border: `1px solid ${s.color}30`,
                  borderRadius: 12,
                  padding: 18,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: s.color + "20",
                      border: `1px solid ${s.color}40`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      color: s.color,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {s.step}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Outfit',sans-serif",
                        fontWeight: 600,
                        fontSize: 13,
                        color: "#d4dde8",
                        marginBottom: 3,
                      }}
                    >
                      {s.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#4a6070",
                        lineHeight: 1.6,
                      }}
                    >
                      {s.desc}
                    </div>
                  </div>
                </div>
                <pre
                  style={{
                    background: "#050709",
                    border: "1px solid #0f1520",
                    borderRadius: 8,
                    padding: "12px 14px",
                    fontSize: 10,
                    color: "#5a8a6a",
                    overflowX: "auto",
                    lineHeight: 1.6,
                    fontFamily: "'DM Mono',monospace",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {s.code}
                </pre>
              </div>
            ))}

            <div
              style={{
                background: "#080b10",
                border: "1px solid #00c89630",
                borderRadius: 12,
                padding: 18,
                marginTop: 8,
              }}
            >
              <div
                style={{
                  fontFamily: "'Outfit',sans-serif",
                  fontWeight: 600,
                  fontSize: 13,
                  color: "#00c896",
                  marginBottom: 10,
                }}
              >
                💰 Monetization — How to Charge
              </div>
              {[
                [
                  "Starter",
                  "₹499/mo",
                  "Up to 10 clients, email reminders only",
                ],
                [
                  "Professional",
                  "₹999/mo",
                  "Up to 50 clients, Email + WhatsApp reminders",
                ],
                [
                  "CA Firm Pro",
                  "₹1,999/mo",
                  "Unlimited clients, bulk reminders, priority support",
                ],
              ].map(([plan, price, desc]) => (
                <div
                  key={plan}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #0a0f15",
                    fontSize: 11,
                  }}
                >
                  <div>
                    <span
                      style={{
                        color: "#d4dde8",
                        fontFamily: "'Outfit',sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      {plan}
                    </span>
                    <span style={{ color: "#3a5060", marginLeft: 8 }}>
                      {desc}
                    </span>
                  </div>
                  <span
                    style={{
                      color: "#00c896",
                      fontFamily: "'DM Mono',monospace",
                      fontWeight: 500,
                    }}
                  >
                    {price}
                  </span>
                </div>
              ))}
              <div style={{ fontSize: 11, color: "#3a5060", marginTop: 10 }}>
                10 CA firms at ₹999 ={" "}
                <span style={{ color: "#00c896" }}>₹9,990/month</span>{" "}
                recurring. Zero cost to operate on free tiers below 50 clients.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ADD CLIENT MODAL */}
      {showAddClient && (
        <div
          className="modal-overlay"
          onClick={(e) =>
            e.target === e.currentTarget && setShowAddClient(false)
          }
        >
          <div className="modal fadein">
            <div
              style={{
                fontFamily: "'Outfit',sans-serif",
                fontWeight: 700,
                fontSize: 16,
                color: "#d4dde8",
                marginBottom: 16,
              }}
            >
              Add New Client
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 9,
                    color: "#3a5060",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    marginBottom: 5,
                  }}
                >
                  Business Name *
                </div>
                <input
                  className="input-field"
                  value={newClient.name}
                  onChange={(e) =>
                    setNewClient((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Ravi Traders"
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 9,
                    color: "#3a5060",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    marginBottom: 5,
                  }}
                >
                  GSTIN *
                </div>
                <input
                  className="input-field"
                  value={newClient.gstin}
                  onChange={(e) =>
                    setNewClient((p) => ({ ...p, gstin: e.target.value }))
                  }
                  placeholder="29AABCT1332L1ZD"
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 9,
                    color: "#3a5060",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    marginBottom: 5,
                  }}
                >
                  WhatsApp Number
                </div>
                <input
                  className="input-field"
                  value={newClient.phone}
                  onChange={(e) =>
                    setNewClient((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="+919876543210"
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 9,
                    color: "#3a5060",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    marginBottom: 5,
                  }}
                >
                  Email
                </div>
                <input
                  className="input-field"
                  value={newClient.email}
                  onChange={(e) =>
                    setNewClient((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="client@example.com"
                />
              </div>
            </div>
            <div
              style={{
                fontSize: 9,
                color: "#3a5060",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Filing Types
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                marginBottom: 16,
                maxHeight: 180,
                overflowY: "auto",
              }}
            >
              {COMPLIANCE_RULES.map((rule) => (
                <label key={rule.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={newClient.filings.includes(rule.id)}
                    onChange={() => toggleFiling(rule.id)}
                  />
                  <span style={{ fontSize: 11, color: "#5a7080" }}>
                    {rule.label}
                  </span>
                  <span
                    className="badge"
                    style={{
                      background: TYPE_COLOR[rule.type] + "15",
                      color: TYPE_COLOR[rule.type],
                    }}
                  >
                    {rule.type}
                  </span>
                </label>
              ))}
            </div>
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button
                onClick={() => setShowAddClient(false)}
                style={{
                  background: "transparent",
                  border: "1px solid #1e2530",
                  borderRadius: 8,
                  padding: "9px 18px",
                  color: "#4a6070",
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 10,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={addClient}
                style={{
                  background: "#0f2318",
                  border: "1px solid #00c89640",
                  borderRadius: 8,
                  padding: "9px 18px",
                  color: "#00c896",
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 10,
                  cursor: "pointer",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && <div className="toast">✓ {toast.msg}</div>}
    </div>
  );
}
