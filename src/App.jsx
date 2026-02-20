import { useState, useEffect, useCallback } from "react";

// ===================== Supabase設定 =====================
const SUPABASE_URL = "https://fccridilxkxuglnaeobp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjY3JpZGlseGt4dWdsbmFlb2JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0Nzg5NTAsImV4cCI6MjA4NzA1NDk1MH0.d7R6eOQL8KEtzzSA7wjhXL64N04vNCXe422NYfXRsZA";

const api = {
  headers: {
    "Content-Type": "application/json",
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
  },
  async getAll() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/messages?order=created_at.desc`, { headers: this.headers });
    if (!res.ok) throw new Error("取得失敗");
    const rows = await res.json();
    return rows.map((r) => r.data);
  },
  async upsert(msg) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: "POST",
      headers: { ...this.headers, "Prefer": "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({ id: msg.id, data: msg }),
    });
    if (!res.ok) throw new Error("保存失敗");
  },
  async delete(id) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/messages?id=eq.${id}`, {
      method: "DELETE",
      headers: this.headers,
    });
    if (!res.ok) throw new Error("削除失敗");
  },
};

// ===================== メンバー定義 =====================
// ここの name を実際のお名前に変更してください
const MEMBERS = [
  { id: "m1", name: "渡辺 陽子", color: "#2d6a4f" },
  { id: "m2", name: "吉見 浩太朗", color: "#1d4e89" },
  { id: "m3", name: "小林 のり子", color: "#7b2d8b" },
  { id: "m4", name: "三浦 嘉子", color: "#b8e71dff" },
  { id: "m5", name: "三島 淑", color: "#d35400" },
  { id: "m6", name: "渡辺 恵子", color: "#f81fffff" },
  { id: "m7", name: "成田 篤紀", color: "#8a9ee9ff" },  
];

function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return "たった今";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}時間前`;
  const d = new Date(ts);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function getMember(id) { return MEMBERS.find((m) => m.id === id); }
function getInitial(name) { return name ? name.charAt(0) : "？"; }

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #f5f4f0; --surface: #ffffff; --border: #e2ddd6;
    --primary: #0aeb85ff; --primary-light: #e8f5ee;
    --urgent: #c0392b; --urgent-light: #fdf0ee;
    --text: #1a1a1a; --text-sub: #6b6560;
    --radius: 12px; --shadow: 0 2px 12px rgba(0,0,0,0.08);
  }
  body { font-family: 'Noto Sans JP', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }
  .app { max-width: 480px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; }
  .header { background: var(--primary); color: white; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; }
  .header-title { font-size: 18px; font-weight: 700; }
  .header-user { display: flex; align-items: center; gap: 8px; font-size: 13px; opacity: 0.9; cursor: pointer; padding: 4px 10px; border-radius: 20px; transition: background 0.15s; }
  .header-user:hover { background: rgba(255,255,255,0.15); }
  .avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: white; flex-shrink: 0; }
  .avatar-sm { width: 28px; height: 28px; font-size: 11px; }
  .content { flex: 1; padding: 16px; padding-bottom: 90px; }
  .section-title { font-size: 12px; font-weight: 700; color: var(--text-sub); letter-spacing: 0.08em; margin-bottom: 10px; padding-left: 4px; }
  .msg-card { background: var(--surface); border-radius: var(--radius); padding: 16px; margin-bottom: 10px; border: 1.5px solid var(--border); cursor: pointer; transition: box-shadow 0.15s, transform 0.1s; }
  .msg-card:hover { box-shadow: var(--shadow); transform: translateY(-1px); }
  .msg-card.unread { border-left: 4px solid var(--primary); }
  .msg-card.urgent-card { border-left: 4px solid var(--urgent); background: var(--urgent-light); }
  .msg-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .msg-meta { flex: 1; min-width: 0; }
  .msg-from { font-size: 13px; font-weight: 700; }
  .msg-time { font-size: 11px; color: var(--text-sub); margin-top: 1px; }
  .msg-subject { font-size: 15px; font-weight: 700; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .msg-preview { font-size: 13px; color: var(--text-sub); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .task-count { font-size: 11px; color: var(--text-sub); margin-top: 8px; }
  .badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 700; }
  .badge-urgent { background: var(--urgent); color: white; }
  .badge-unread { background: var(--primary); color: white; width: 10px; height: 10px; border-radius: 50%; padding: 0; display: inline-block; flex-shrink: 0; }
  .empty { text-align: center; padding: 48px 24px; color: var(--text-sub); }
  .empty-icon { font-size: 48px; margin-bottom: 12px; }
  .empty-text { font-size: 15px; }
  .tabbar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 480px; background: white; border-top: 1.5px solid var(--border); display: flex; z-index: 100; }
  .tab { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 10px 4px 14px; font-size: 10px; color: var(--text-sub); cursor: pointer; border: none; background: none; transition: color 0.15s; position: relative; font-family: inherit; }
  .tab.active { color: var(--primary); }
  .tab-icon { font-size: 22px; margin-bottom: 2px; }
  .tab-badge { position: absolute; top: 6px; right: calc(50% - 20px); background: var(--urgent); color: white; width: 18px; height: 18px; border-radius: 50%; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
  .detail { animation: slideIn 0.2s ease; }
  @keyframes slideIn { from { opacity:0; transform: translateX(16px); } to { opacity:1; transform: translateX(0); } }
  .back-btn { display: flex; align-items: center; gap: 6px; background: none; border: none; color: white; font-size: 15px; cursor: pointer; padding: 4px 0; font-family: inherit; }
  .detail-card { background: var(--surface); border-radius: var(--radius); padding: 20px; border: 1.5px solid var(--border); margin-bottom: 12px; }
  .detail-subject { font-size: 20px; font-weight: 700; margin-bottom: 16px; line-height: 1.4; }
  .detail-from { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
  .detail-from-name { font-size: 14px; font-weight: 700; }
  .detail-from-time { font-size: 12px; color: var(--text-sub); }
  .divider { height: 1px; background: var(--border); margin: 16px 0; }
  .detail-body { font-size: 15px; line-height: 1.8; white-space: pre-wrap; }
  .tasks-section { margin-top: 20px; }
  .tasks-title { font-size: 13px; font-weight: 700; color: var(--text-sub); margin-bottom: 10px; }
  .task-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; margin-bottom: 6px; background: var(--bg); cursor: pointer; transition: background 0.1s; }
  .task-item:hover { background: #ece9e2; }
  .task-check { width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; }
  .task-check.done { background: var(--primary); border-color: var(--primary); }
  .task-text { font-size: 14px; line-height: 1.5; }
  .task-text.done { text-decoration: line-through; color: var(--text-sub); }
  .compose { animation: slideIn 0.2s ease; }
  .form-group { margin-bottom: 16px; }
  .form-label { font-size: 13px; font-weight: 700; color: var(--text-sub); margin-bottom: 6px; display: block; }
  .form-control { width: 100%; padding: 14px 16px; border: 1.5px solid var(--border); border-radius: 10px; font-size: 16px; font-family: inherit; color: var(--text); background: white; outline: none; transition: border-color 0.15s; }
  .form-control:focus { border-color: var(--primary); }
  textarea.form-control { resize: vertical; min-height: 120px; line-height: 1.7; }
  .to-list { display: flex; flex-wrap: wrap; gap: 8px; }
  .to-btn { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 10px; border: 1.5px solid var(--border); background: white; font-size: 14px; font-family: inherit; cursor: pointer; transition: all 0.15s; }
  .to-btn.selected { border-color: var(--primary); background: var(--primary-light); font-weight: 700; }
  .priority-row { display: flex; gap: 10px; }
  .priority-btn { flex: 1; padding: 12px; border-radius: 10px; border: 1.5px solid var(--border); background: white; font-size: 14px; font-family: inherit; cursor: pointer; transition: all 0.15s; text-align: center; }
  .priority-btn.sel-normal { border-color: var(--primary); background: var(--primary-light); font-weight: 700; color: var(--primary); }
  .priority-btn.sel-urgent { border-color: var(--urgent); background: var(--urgent-light); font-weight: 700; color: var(--urgent); }
  .task-add { display: flex; gap: 8px; margin-top: 10px; }
  .task-add input { flex: 1; }
  .task-add-btn { padding: 14px 18px; border-radius: 10px; background: var(--primary); color: white; border: none; font-size: 18px; cursor: pointer; }
  .task-list-item { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: var(--bg); border-radius: 8px; margin-top: 6px; }
  .task-del { background: none; border: none; color: var(--text-sub); font-size: 18px; cursor: pointer; padding: 0 4px; }
  .send-btn { width: 100%; padding: 18px; border-radius: 12px; background: var(--primary); color: white; border: none; font-size: 18px; font-weight: 700; font-family: inherit; cursor: pointer; transition: background 0.15s; margin-top: 8px; }
  .send-btn:hover { background: #245a41; }
  .send-btn:disabled { background: #aaa; cursor: not-allowed; }
  .user-select { display: flex; flex-direction: column; min-height: 100vh; background: var(--bg); max-width: 480px; margin: 0 auto; }
  .user-select-header { background: var(--primary); padding: 48px 24px 32px; color: white; text-align: center; }
  .user-select-logo { font-size: 48px; margin-bottom: 12px; }
  .user-select-title { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
  .user-select-sub { font-size: 14px; opacity: 0.8; }
  .user-select-body { padding: 28px 16px; }
  .user-select-prompt { font-size: 16px; font-weight: 700; margin-bottom: 16px; text-align: center; color: var(--text-sub); }
  .user-btn { display: flex; align-items: center; gap: 16px; width: 100%; padding: 18px 20px; margin-bottom: 10px; background: white; border: 1.5px solid var(--border); border-radius: var(--radius); cursor: pointer; font-family: inherit; transition: all 0.15s; }
  .user-btn:hover { border-color: var(--primary); background: var(--primary-light); box-shadow: var(--shadow); }
  .user-btn-name { font-size: 18px; font-weight: 700; }
  .toast { position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: #1a1a1a; color: white; padding: 12px 24px; border-radius: 24px; font-size: 14px; font-weight: 500; z-index: 999; white-space: nowrap; animation: toastIn 0.2s ease; }
  @keyframes toastIn { from { opacity:0; transform: translateX(-50%) translateY(8px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
  .unread-banner { background: var(--urgent-light); border: 1.5px solid var(--urgent); border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; font-size: 14px; font-weight: 700; color: var(--urgent); display: flex; align-items: center; gap: 8px; }
  .sent-to { font-size: 12px; color: var(--text-sub); margin-top: 6px; }
  .loading { text-align: center; padding: 48px 24px; color: var(--text-sub); font-size: 15px; }
  .loading-spin { font-size: 32px; display: block; margin-bottom: 12px; animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .error-banner { background: #fdf0ee; border: 1.5px solid var(--urgent); border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; font-size: 13px; color: var(--urgent); }
  .refresh-btn { background: none; border: none; color: var(--text-sub); font-size: 13px; cursor: pointer; font-family: inherit; padding: 2px 6px; border-radius: 6px; transition: background 0.1s; }
  .refresh-btn:hover { background: var(--border); }
  .delete-btn { width: 100%; padding: 14px; border-radius: 10px; background: none; border: 1.5px solid var(--urgent); color: var(--urgent); font-size: 15px; font-weight: 700; font-family: inherit; cursor: pointer; transition: all 0.15s; margin-top: 8px; }
  .delete-btn:hover { background: var(--urgent-light); }
  .confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: flex-end; justify-content: center; }
  .confirm-box { background: white; border-radius: 16px 16px 0 0; padding: 24px 20px 36px; width: 100%; max-width: 480px; }
  .confirm-title { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
  .confirm-sub { font-size: 14px; color: var(--text-sub); margin-bottom: 20px; }
  .confirm-btns { display: flex; gap: 10px; }
  .confirm-cancel { flex: 1; padding: 14px; border-radius: 10px; border: 1.5px solid var(--border); background: white; font-size: 15px; font-family: inherit; cursor: pointer; }
  .confirm-ok { flex: 1; padding: 14px; border-radius: 10px; border: none; background: var(--urgent); color: white; font-size: 15px; font-weight: 700; font-family: inherit; cursor: pointer; }
`;

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("inbox");
  const [detailMsg, setDetailMsg] = useState(null);
  const [toast, setToast] = useState(null);

  const [to, setTo] = useState("all");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState("normal");
  const [category, setCategory] = useState("msg");
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const fetchMessages = useCallback(async () => {
    setError(null);
    try {
      const msgs = await api.getAll();
      setMessages(msgs);
    } catch {
      setError("メッセージの取得に失敗しました。接続を確認してください。");
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    fetchMessages().finally(() => setLoading(false));
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, [currentUser, fetchMessages]);

  const unreadCount = currentUser
    ? messages.filter((m) => {
        const isForMe = m.toId === "all" || m.toId === currentUser.id;
        return isForMe && m.fromId !== currentUser.id && !m.readBy.includes(currentUser.id);
      }).length
    : 0;

  const inbox = currentUser
    ? messages
        .filter((m) => (m.toId === "all" || m.toId === currentUser.id) && m.fromId !== currentUser.id)
        .filter((m) => categoryFilter === 'all' || m.category === categoryFilter)
        .sort((a, b) => {
          const aU = !a.readBy.includes(currentUser.id);
          const bU = !b.readBy.includes(currentUser.id);
          if (aU !== bU) return aU ? -1 : 1;
          return b.createdAt - a.createdAt;
        })
    : [];

  const sent = currentUser
    ? messages.filter((m) => m.fromId === currentUser.id).sort((a, b) => b.createdAt - a.createdAt)
    : [];

  const openMsg = async (msg) => {
    setDetailMsg(msg);
    if (!msg.readBy.includes(currentUser.id)) {
      const updated = { ...msg, readBy: [...msg.readBy, currentUser.id] };
      try {
        await api.upsert(updated);
        setMessages((prev) => prev.map((m) => m.id === msg.id ? updated : m));
        setDetailMsg(updated);
      } catch {}
    }
  };


  const sendMsg = async () => {
    if (!body.trim() || sending) return;
    setSending(true);
    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      fromId: currentUser.id,
      toId: to,
      subject: subject.trim() || "（件名なし）",
      body: body.trim(),
      priority,
      category,
      createdAt: Date.now(),
      readBy: [currentUser.id],
      stamps: {},
      tasks: tasks.map((t, i) => ({ id: `t_${Date.now()}_${i}`, text: t, done: false })),
    };
    try {
      await api.upsert(newMsg);
      setMessages((prev) => [newMsg, ...prev]);
      setTab("inbox");
      setSubject(""); setBody(""); setTo("all"); setPriority("normal"); setCategory("msg"); setTasks([]);
      showToast("✅ 送信しました");
    } catch {
      showToast("❌ 送信に失敗しました。接続を確認してください。");
    } finally {
      setSending(false);
    }
  };

  const addTask = () => {
    if (!taskInput.trim()) return;
    setTasks([...tasks, taskInput.trim()]);
    setTaskInput("");
  };

  const deleteMsg = async () => {
    try {
      await api.delete(detailMsg.id);
      setMessages((prev) => prev.filter((m) => m.id !== detailMsg.id));
      setDetailMsg(null);
      setConfirmDelete(false);
      showToast("🗑️ 削除しました");
    } catch {
      showToast("❌ 削除に失敗しました");
      setConfirmDelete(false);
    }
  };


  const stampMsg = async (msgId, stampType) => {
    const msg = messages.find((m) => m.id === msgId);
    if (!msg) return;
    const current = (msg.stamps || {})[currentUser.id];
    const newStamps = { ...(msg.stamps || {}) };
    if (current === stampType) {
      delete newStamps[currentUser.id]; // 同じスタンプで取り消し
    } else {
      newStamps[currentUser.id] = stampType;
    }
    // スタンプを押したら既読にもする
    const newReadBy = msg.readBy.includes(currentUser.id)
      ? msg.readBy
      : [...msg.readBy, currentUser.id];
    const updated = { ...msg, stamps: newStamps, readBy: newReadBy };
    try {
      await api.upsert(updated);
      setMessages((prev) => prev.map((m) => m.id === msgId ? updated : m));
      setDetailMsg(updated);
    } catch {
      showToast("❌ 更新に失敗しました");
    }
  };
  // ======= ユーザー選択 =======
  if (!currentUser) {
    return (
      <>
        <style>{css}</style>
        <div className="user-select">
          <div className="user-select-header">
            <div className="user-select-logo">📋</div>
            <div className="user-select-title">社内連絡板</div>
            <div className="user-select-sub">伝言・引き継ぎアプリ</div>
          </div>
          <div className="user-select-body">
            <div className="user-select-prompt">あなたはどなたですか？</div>
            {MEMBERS.map((m) => (
              <button key={m.id} className="user-btn" onClick={() => setCurrentUser(m)}>
                <div className="avatar" style={{ background: m.color }}>{getInitial(m.name)}</div>
                <div className="user-btn-name">{m.name}</div>
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  // ======= 詳細画面 =======
  if (detailMsg) {
    const from = getMember(detailMsg.fromId);
    const toName = detailMsg.toId === "all" ? "全員" : getMember(detailMsg.toId)?.name;
    const doneTasks = detailMsg.tasks.filter((t) => t.done).length;
    return (
      <>
        <style>{css}</style>
        <div className="app">
          <div className="header">
            <button className="back-btn" onClick={() => setDetailMsg(null)}>← 戻る</button>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {detailMsg.category === "hand" ? <span className="badge-cat-hand">🔄 引き継ぎ</span> : <span className="badge-cat-msg">📢 伝言</span>}
              {detailMsg.priority === "urgent" && <span className="badge badge-urgent">⚡ 至急</span>}
            </div>
          </div>
          <div className="content detail">
            <div className="detail-card">
              <div className="detail-subject">{detailMsg.subject}</div>
              <div className="detail-from">
                <div className="avatar" style={{ background: from?.color }}>{getInitial(from?.name)}</div>
                <div>
                  <div className="detail-from-name">{from?.name} → {toName}</div>
                  <div className="detail-from-time">{timeAgo(detailMsg.createdAt)}</div>
                </div>
              </div>
              <div className="divider" />
              <div className="detail-body">{detailMsg.body}</div>
              {detailMsg.tasks.length > 0 && (
                <div className="tasks-section">
                  <div className="tasks-title">📝 引き継ぎタスク　{doneTasks}/{detailMsg.tasks.length} 完了</div>
                  {detailMsg.tasks.map((t) => (
                    <div key={t.id} className="task-item" onClick={() => toggleTask(detailMsg.id, t.id)}>
                      <div className={`task-check ${t.done ? "done" : ""}`}>
                        {t.done && <span style={{ color: "white", fontSize: 12 }}>✓</span>}
                      </div>
                      <div className={`task-text ${t.done ? "done" : ""}`}>{t.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {detailMsg.fromId !== currentUser.id && (
              <div className="stamp-row">
                {[["ok","👍","了解"], ["done","✅","完了"]].map(([type, emoji, label]) => {
                  const myStamp = (detailMsg.stamps || {})[currentUser.id];
                  const isStamped = myStamp === type;
                  return (
                    <button
                      key={type}
                      className={`stamp-btn ${isStamped ? `stamped-${type}` : ""}`}
                      onClick={() => stampMsg(detailMsg.id, type)}
                    >
                      {emoji}<span>{isStamped ? "取り消す" : label}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {detailMsg.fromId === currentUser.id && Object.keys(detailMsg.stamps || {}).length > 0 && (
              <div className="stamp-detail">
                <div className="stamp-detail-title">スタンプの状況</div>
                {Object.entries(detailMsg.stamps || {}).map(([uid, type]) => {
                  const member = getMember(uid);
                  return (
                    <div key={uid} className="stamp-detail-row">
                      <div className="avatar avatar-sm" style={{ background: member?.color }}>{getInitial(member?.name)}</div>
                      <span>{member?.name}</span>
                      <span>{type === "ok" ? "👍 了解" : "✅ 完了"}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {detailMsg.fromId === currentUser.id && (
              <button className="delete-btn" onClick={() => setConfirmDelete(true)}>
                🗑️ このメッセージを削除する
              </button>
            )}
          </div>
        </div>
        {confirmDelete && (
          <div className="confirm-overlay" onClick={() => setConfirmDelete(false)}>
            <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
              <div className="confirm-title">メッセージを削除しますか？</div>
              <div className="confirm-sub">削除すると全員の画面から消えます。元に戻せません。</div>
              <div className="confirm-btns">
                <button className="confirm-cancel" onClick={() => setConfirmDelete(false)}>キャンセル</button>
                <button className="confirm-ok" onClick={deleteMsg}>削除する</button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ======= メイン画面 =======
  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="header">
          <div className="header-title">📋 社内連絡板</div>
          <div className="header-user" onClick={() => setCurrentUser(null)}>
            <div className="avatar avatar-sm" style={{ background: currentUser.color }}>
              {getInitial(currentUser.name)}
            </div>
            {currentUser.name.split(" ")[0]}
          </div>
        </div>

        <div className="content">
          {/* 受信箱 */}
          {tab === "inbox" && (
            <>
              {unreadCount > 0 && (
                <div className="unread-banner">🔔 未読が {unreadCount} 件あります</div>
              )}
              {error && <div className="error-banner">⚠️ {error}</div>}
              <div className="filter-tabs">
                {[["all","すべて"],["msg","📢 伝言"],["hand","🔄 引き継ぎ"]].map(([val, label]) => {
                  const activeClass = categoryFilter === val ? (val === "hand" ? "active-hand" : "active") : "";
                  return <button key={val} className={`filter-tab ${activeClass}`} onClick={() => setCategoryFilter(val)}>{label}</button>;
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div className="section-title" style={{ marginBottom: 0 }}>受信メッセージ</div>
                <button className="refresh-btn" onClick={() => { setLoading(true); fetchMessages().finally(() => setLoading(false)); }}>
                  🔄 更新
                </button>
              </div>
              {loading ? (
                <div className="loading"><span className="loading-spin">⏳</span>読み込み中...</div>
              ) : inbox.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">📭</div>
                  <div className="empty-text">メッセージはありません</div>
                </div>
              ) : inbox.map((m) => {
                const from = getMember(m.fromId);
                const isUnread = !m.readBy.includes(currentUser.id);
                return (
                  <div key={m.id} className={`msg-card ${m.priority === "urgent" ? "urgent-card" : isUnread ? "unread" : ""}`} onClick={() => openMsg(m)}>
                    <div className="msg-header">
                      <div className="avatar avatar-sm" style={{ background: from?.color }}>{getInitial(from?.name)}</div>
                      <div className="msg-meta">
                        <div className="msg-from">{from?.name}</div>
                        <div className="msg-time">{timeAgo(m.createdAt)}</div>
                      </div>
                      {m.priority === "urgent" && <span className="badge badge-urgent">⚡ 至急</span>}
                      {isUnread && <span className="badge-unread" />}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <div className="msg-subject" style={{ margin: 0 }}>{m.subject}</div>
                        {m.category === "hand" ? <span className="badge-cat-hand">🔄 引き継ぎ</span> : <span className="badge-cat-msg">📢 伝言</span>}
                      </div>
                    <div className="msg-preview">{m.body}</div>
                    {m.tasks.length > 0 && (
                      <div className="task-count">📝 タスク {m.tasks.filter((t) => t.done).length}/{m.tasks.length} 完了</div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* 送信済み */}
          {tab === "sent" && (
            <>
              <div className="section-title">送信済みメッセージ</div>
              {loading ? (
                <div className="loading"><span className="loading-spin">⏳</span>読み込み中...</div>
              ) : sent.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">📤</div>
                  <div className="empty-text">送信したメッセージはありません</div>
                </div>
              ) : sent.map((m) => {
                const toName = m.toId === "all" ? "全員" : getMember(m.toId)?.name;
                const readCount = m.readBy.filter((id) => id !== currentUser.id).length;
                return (
                  <div key={m.id} className="msg-card" onClick={() => openMsg(m)}>
                    <div className="msg-header">
                      <div className="msg-meta">
                        <div className="msg-from" style={{ color: "var(--text-sub)", fontWeight: 500 }}>→ {toName}</div>
                        <div className="msg-time">{timeAgo(m.createdAt)}</div>
                      </div>
                      {m.priority === "urgent" && <span className="badge badge-urgent">⚡ 至急</span>}
                    </div>
                    <div className="msg-subject">{m.subject}</div>
                    <div className="msg-preview">{m.body}</div>
                    <div className="sent-to" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span>{readCount > 0 ? `👁既読${readCount}` : "まだ読まれていません"}</span>
                      {(() => {
                        const stamps = m.stamps || {};
                        const okCount = Object.values(stamps).filter(s => s === "ok").length;
                        const doneCount = Object.values(stamps).filter(s => s === "done").length;
                        return (
                          <>
                            {okCount > 0 && <span className="stamp-pill stamp-pill-ok">👍{okCount}</span>}
                            {doneCount > 0 && <span className="stamp-pill stamp-pill-done">✅{doneCount}</span>}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* 作成 */}
          {tab === "compose" && (
            <div className="compose">
              <div className="section-title">新しいメッセージ</div>
              <div style={{ background: "white", borderRadius: 12, padding: 16, border: "1.5px solid var(--border)" }}>
                <div className="form-group">
                  <label className="form-label">📨 宛先</label>
                  <div className="to-list">
                    <button className={`to-btn ${to === "all" ? "selected" : ""}`} onClick={() => setTo("all")}>📢 全員</button>
                    {MEMBERS.filter((m) => m.id !== currentUser.id).map((m) => (
                      <button key={m.id} className={`to-btn ${to === m.id ? "selected" : ""}`} onClick={() => setTo(m.id)}>
                        <div className="avatar avatar-sm" style={{ background: m.color }}>{getInitial(m.name)}</div>
                        {m.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">🗂️ カテゴリ</label>
                  <div className="priority-row">
                    <button className={`priority-btn ${category === "msg" ? "sel-normal" : ""}`} onClick={() => setCategory("msg")}>📢 伝言</button>
                    <button className={`priority-btn ${category === "hand" ? "sel-normal" : ""}`} onClick={() => setCategory("hand")}>🔄 引き継ぎ</button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">🚦 重要度</label>
                  <div className="priority-row">
                    <button className={`priority-btn ${priority === "normal" ? "sel-normal" : ""}`} onClick={() => setPriority("normal")}>通常</button>
                    <button className={`priority-btn ${priority === "urgent" ? "sel-urgent" : ""}`} onClick={() => setPriority("urgent")}>⚡ 至急</button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">📌 件名</label>
                  <input className="form-control" placeholder="例：午後の来客について" value={subject} onChange={(e) => setSubject(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">✏️ 内容</label>
                  <textarea className="form-control" placeholder="伝えたいことを書いてください" value={body} onChange={(e) => setBody(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">📝 引き継ぎタスク（任意）</label>
                  {tasks.map((t, i) => (
                    <div key={i} className="task-list-item">
                      <span style={{ flex: 1, fontSize: 14 }}>□ {t}</span>
                      <button className="task-del" onClick={() => setTasks(tasks.filter((_, j) => j !== i))}>✕</button>
                    </div>
                  ))}
                  <div className="task-add">
                    <input className="form-control" placeholder="タスクを追加してEnter" value={taskInput}
                      onChange={(e) => setTaskInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTask()} />
                    <button className="task-add-btn" onClick={addTask}>＋</button>
                  </div>
                </div>
                <button className="send-btn" onClick={sendMsg} disabled={!body.trim() || sending}>
                  {sending ? "送信中..." : "送信する"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="tabbar">
          <button className={`tab ${tab === "inbox" ? "active" : ""}`} onClick={() => setTab("inbox")}>
            {unreadCount > 0 && <span className="tab-badge">{unreadCount}</span>}
            <span className="tab-icon">📥</span>受信
          </button>
          <button className={`tab ${tab === "compose" ? "active" : ""}`} onClick={() => setTab("compose")}>
            <span className="tab-icon">✏️</span>作成
          </button>
          <button className={`tab ${tab === "sent" ? "active" : ""}`} onClick={() => setTab("sent")}>
            <span className="tab-icon">📤</span>送信済み
          </button>
        </div>

        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}

