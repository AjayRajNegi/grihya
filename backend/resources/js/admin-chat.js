// resources/js/admin-chat.js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const listEl = document.getElementById('convList');
const filterEl = document.getElementById('filterStatus');
const headerEl = document.getElementById('chatHeader');
const msgsEl = document.getElementById('chatMessages');
const inputEl = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');

let selected = null;
let echo = null;
let channel = null;

window.Pusher = Pusher;
echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_KEY,
    cluster: import.meta.env.VITE_PUSHER_CLUSTER || 'ap2',
    forceTLS: true,
});

function htmlEscape(s) { return String(s || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }

async function loadConversations() {
    const qs = new URLSearchParams();
    const status = filterEl.value;
    if (status) qs.set('status', status);
    const res = await fetch(`/admin/chat/conversations?${qs.toString()}`, { credentials: 'same-origin' });
    const data = await res.json();
    renderConvList(data.data || []);
}

function renderConvList(items) {
    listEl.innerHTML = '';
    items.forEach(it => {
        const btn = document.createElement('button');
        btn.className = 'w-full text-left border rounded p-2 hover:bg-gray-50';
        btn.innerHTML = `
      <div class="font-medium">${htmlEscape(it.client_name || 'Guest')}</div>
      <div class="text-xs text-gray-500">${it.public_token}</div>
      <div class="text-xs text-gray-400">${it.status} • ${it.last_message_at || ''}</div>
    `;
        btn.addEventListener('click', () => selectConversation(it));
        listEl.appendChild(btn);
    });
}

async function selectConversation(item) {
    selected = item;
    headerEl.innerHTML = `<div class="text-sm">Chat with <span class="font-semibold">${htmlEscape(item.client_name || 'Guest')}</span> • <code class="text-gray-500">${item.public_token}</code></div>`;
    msgsEl.innerHTML = '';

    if (channel) { echo.leaveChannel(channel.name); channel = null; }
    channel = echo.channel(`chat.conversation.${item.public_token}`);
    channel.listen('.message.sent', (e) => {
        appendMsg({ from: e.sender, text: e.body });
    });

    await loadMessages(item.public_token);
}

async function loadMessages(token) {
    const res = await fetch(`/api/chat/conversations/${token}/messages`);
    const data = await res.json();
    const msgs = data.data || [];
    msgsEl.innerHTML = '';
    msgs.forEach(m => {
        appendMsg({ from: m.sender, text: m.body });
    });
    msgsEl.scrollTop = msgsEl.scrollHeight;
}

function appendMsg({ from, text }) {
    const row = document.createElement('div');
    row.className = `mb-2 flex ${from === 'admin' ? 'justify-end' : 'justify-start'}`;
    const bubble = document.createElement('div');
    bubble.className = `${from === 'admin' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-900'} rounded-2xl px-3 py-2 max-w-[80%]`;
    bubble.textContent = text || '';
    row.appendChild(bubble);
    msgsEl.appendChild(row);
    msgsEl.scrollTop = msgsEl.scrollHeight;
}

async function sendAdminMessage() {
    const t = (inputEl.value || '').trim();
    if (!t || !selected) return;
    inputEl.value = '';
    appendMsg({ from: 'admin', text: t });
    await fetch(`/api/chat/conversations/${selected.public_token}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: t, sender: 'admin' }),
    });
}

filterEl.addEventListener('change', loadConversations);
sendBtn.addEventListener('click', sendAdminMessage);
inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendAdminMessage(); });

loadConversations();