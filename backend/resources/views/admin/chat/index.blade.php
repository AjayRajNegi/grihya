@extends('layouts.admin')

@section('title', 'Live Chat')

@section('content')
<div class="mb-6">
    <h1 class="text-2xl font-bold text-slate-900">Live Chat</h1>
    <p class="text-gray-600">Manage conversations</p>
</div>

<div class="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
    <!-- Left: Conversations -->
    <aside class="rounded-xl border border-slate-200 bg-white">
        <div class="p-3 border-b border-slate-200">
            <div class="flex items-center gap-2">
                <input id="searchBox" type="text" placeholder="Search name or token..."
                    class="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm" />
            </div>
            <div class="mt-3 flex items-center justify-between">
                <div id="convTitle" class="text-sm font-semibold text-slate-900">Conversations</div>
                <select id="filterStatus" class="border rounded px-2 py-1 text-xs">
                    <option value="">All</option>
                    <option value="open">Open</option>
                    <option value="assigned">Assigned</option>
                    <option value="closed">Closed</option>
                </select>
            </div>
        </div>
        <div id="convList" class="max-h-[560px] overflow-y-auto"></div>
    </aside>

    <!-- Right: Chat window -->
    <section class="rounded-xl border border-slate-200 bg-white flex flex-col h-[700px]">
        <div id="chatHeader" class="border-b border-slate-200 p-4 flex items-center justify-between">
            <div class="text-sm text-slate-700">Select a conversation</div>
        </div>
        <div id="chatMessages" class="flex-1 p-4 overflow-y-auto bg-slate-50"></div>
        <div class="border-t border-slate-200 p-4">
            <div class="flex items-center gap-2">
                <input id="msgInput" type="text" placeholder="Type a message..." class="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <button id="sendBtn" class="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700">Send</button>
            </div>
            <div class="mt-2 text-[11px] text-slate-500">Press Enter to send • Shift+Enter for a new line</div>
        </div>
    </section>
</div>
@endsection

@section('scripts')
{{-- Pusher + Echo --}}
<script src="https://js.pusher.com/7.2/pusher.min.js"></script>
<script src="https://unpkg.com/laravel-echo/dist/echo.iife.js"></script>

<script>
    // Environment
    window.CHAT_ENV = {
        PUSHER_KEY: @json(config('broadcasting.connections.pusher.key')),
        PUSHER_CLUSTER: @json(data_get(config('broadcasting.connections.pusher'), 'options.cluster', 'ap2')),
    };

    (function() {
        const msgsEl = document.getElementById('chatMessages');
        const inputEl = document.getElementById('msgInput');
        const sendBtn = document.getElementById('sendBtn');
        const headerEl = document.getElementById('chatHeader');
        const listEl = document.getElementById('convList');
        const filterEl = document.getElementById('filterStatus');
        const searchBox = document.getElementById('searchBox');
        const convTitle = document.getElementById('convTitle');

        // Routes (server-generated URLs)
        const ROUTES = {
            list: @json(route('admin.chat.list')),
            messages: @json(route('admin.chat.messages', ['token' => '__TOKEN__'])),
            send: @json(route('admin.chat.send', ['token' => '__TOKEN__'])),
            read: @json(route('admin.chat.read', ['token' => '__TOKEN__'])),
            status: @json(route('admin.chat.status', ['token' => '__TOKEN__'])), // must exist in web.php
        };
        const urlMessages = t => ROUTES.messages.replace('__TOKEN__', encodeURIComponent(t));
        const urlSend = t => ROUTES.send.replace('__TOKEN__', encodeURIComponent(t));
        const urlRead = t => ROUTES.read.replace('__TOKEN__', encodeURIComponent(t));
        const urlStatus = t => ROUTES.status.replace('__TOKEN__', encodeURIComponent(t));

        const csrf = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        // Realtime init (safe)
        const hasPusherKey = !!(window.CHAT_ENV && window.CHAT_ENV.PUSHER_KEY);
        const hasPusherLib = typeof window.Pusher !== 'undefined';
        const hasEchoLib = typeof window.Echo === 'function' || typeof Echo === 'function';

        let EchoInstance = null;
        if (hasPusherKey && hasPusherLib && hasEchoLib) {
            const EchoCtor = typeof window.Echo === 'function' ? window.Echo : Echo;
            try {
                EchoInstance = new EchoCtor({
                    broadcaster: 'pusher',
                    key: window.CHAT_ENV.PUSHER_KEY,
                    cluster: window.CHAT_ENV.PUSHER_CLUSTER || 'ap2',
                    forceTLS: true,
                });
            } catch (e) {
                console.warn('[chat] realtime init failed', e);
            }
        }

        // State
        let selected = null; // { token, name, status }
        let currentChannelName = null;
        let msgPollTimer = null;

        // Utilities
        function htmlEscape(s) {
            return String(s || '').replace(/[&<>"']/g, m => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            } [m]));
        }

        function fmtTime(iso) {
            if (!iso) return '';
            const d = new Date(iso);
            if (isNaN(d.getTime())) return '';
            return d.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        async function fetchJSON(url, options = {}) {
            const res = await fetch(url, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(options.headers || {})
                },
                ...options,
            });
            const text = await res.text();
            if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
            return JSON.parse(text);
        }

        // Status helpers (chip + label)
        function statusLabel(s) {
            if (s === 'open') return 'Open';
            if (s === 'assigned') return 'Assigned';
            if (s === 'closed') return 'Closed';
            return s || '';
        }

        function statusClasses(s) {
            switch (s) {
                case 'open':
                    return 'bg-emerald-100 text-emerald-700';
                case 'assigned':
                    return 'bg-indigo-100 text-indigo-700';
                case 'closed':
                    return 'bg-rose-100 text-rose-700';
                default:
                    return 'bg-slate-100 text-slate-700';
            }
        }

        function statusChipHTML(s) {
            return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] ${statusClasses(s)}">${statusLabel(s)}</span>`;
        }

        // Unread total -> heading + document title
        function renderTotalUnreadBadge(total) {
            if (total > 0) {
                convTitle.innerHTML = `Conversations <span class="ml-2 inline-flex items-center justify-center h-5 min-w-[1.25rem] rounded-full bg-indigo-600 text-white text-[10px] px-1.5">${total}</span>`;
                updateDocTitle(total);
            } else {
                convTitle.textContent = 'Conversations';
                updateDocTitle(0);
            }
        }

        function updateDocTitle(unread) {
            const base = 'Live Chat';
            document.title = unread > 0 ? `(${unread}) ${base}` : base;
        }

        // Conversations list
        async function loadConversations() {
            try {
                const qs = new URLSearchParams();
                const status = filterEl?.value || '';
                if (status) qs.set('status', status);

                const url = ROUTES.list + (qs.toString() ? `?${qs.toString()}` : '');
                const json = await fetchJSON(url);
                const items = json.data || [];
                renderConvList(items);

                // Auto-select first if nothing selected
                if (!selected && items.length) {
                    selectConversation({
                        token: items[0].public_token,
                        name: items[0].client_name || 'Guest',
                        status: items[0].status || 'open',
                    });
                }
                // Clear if current selection disappeared
                if (selected && !items.some(it => it.public_token === selected.token)) {
                    selected = null;
                    headerEl.innerHTML = '<div class="text-sm text-slate-700">Select a conversation</div>';
                    msgsEl.innerHTML = '';
                }
            } catch (e) {
                console.warn('Conversation list error', e);
                renderConvList([]);
            }
        }

        function renderConvList(items) {
            const q = (searchBox?.value || '').toLowerCase();
            const filtered = items.filter(it => {
                const name = (it.client_name || 'Guest').toLowerCase();
                const tok = (it.public_token || '').toLowerCase();
                return !q || name.includes(q) || tok.includes(q);
            });

            // Total unread across visible list
            const totalUnread = filtered.reduce((sum, it) => sum + (Number(it.unread_count) || 0), 0);
            renderTotalUnreadBadge(totalUnread);

            listEl.innerHTML = '';
            filtered.forEach(it => {
                const unread = Number(it.unread_count ?? it.unread ?? it.unreadMessages ?? 0);

                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'w-full text-left p-3 border-b last:border-b-0 border-slate-100 hover:bg-slate-50 flex items-start gap-3';
                btn.dataset.token = it.public_token;
                btn.dataset.name = it.client_name || 'Guest';
                btn.dataset.status = it.status || 'open';

                btn.innerHTML = `
                    <div class="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">
                      ${(it.client_name || 'G').charAt(0).toUpperCase()}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between">
                        <div class="font-medium text-slate-900 truncate">
                          ${htmlEscape(it.client_name || 'Guest')}
                          <span class="ml-2 align-middle">${statusChipHTML(it.status)}</span>
                        </div>
                        <div class="flex items-center gap-2">
                          ${unread > 0 ? `<span class="inline-flex items-center justify-center h-5 min-w-[1.25rem] rounded-full bg-indigo-600 text-white text-[10px] px-1.5">${unread}</span>` : ''}
                        </div>
                      </div>
                      <div class="mt-0.5 text-xs text-slate-600 truncate">${htmlEscape(it.public_token)}</div>
                    </div>
                `;

                btn.addEventListener('click', () => selectConversation({
                    token: it.public_token,
                    name: it.client_name || 'Guest',
                    status: it.status || 'open',
                }));
                listEl.appendChild(btn);
            });
        }

        // Select a conversation
        async function selectConversation(it) {
            selected = it;

            headerEl.innerHTML = `
                <div class="flex items-center gap-2">
                    <div class="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">
                      ${htmlEscape(it.name.charAt(0).toUpperCase())}
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-slate-900">${htmlEscape(it.name)}</div>
                      <div class="text-[11px] text-slate-500">
                        Token: <code>${htmlEscape(it.token)}</code>
                        ${EchoInstance ? '• <span class="inline-flex h-2 w-2 rounded-full bg-indigo-500"></span> Online' : ''}
                      </div>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <label class="text-xs text-slate-500">Status:</label>
                    <select id="statusChange" class="border rounded px-2 py-1 text-xs">
                        <option value="open">Open</option>
                        <option value="assigned">Assigned</option>
                        <option value="closed">Closed</option>
                    </select>
                    <span id="statusSaved" class="text-xs text-emerald-600 hidden">Saved</span>
                </div>
            `;

            // Bind status change
            const statusSel = document.getElementById('statusChange');
            const statusSaved = document.getElementById('statusSaved');
            if (statusSel) {
                statusSel.value = it.status || 'open';
                statusSel.addEventListener('change', async () => {
                    const newStatus = statusSel.value;
                    try {
                        statusSel.disabled = true;
                        await updateStatus(it.token, newStatus);
                        selected.status = newStatus;
                        statusSel.disabled = false;
                        statusSaved.classList.remove('hidden');
                        setTimeout(() => statusSaved.classList.add('hidden'), 1200);
                        await loadConversations(); // refresh unread + status chips
                    } catch (e) {
                        console.warn('Failed to update status', e);
                        statusSel.disabled = false;
                        statusSel.value = selected.status || 'open';
                        alert('Failed to update status. Please try again.');
                    }
                });
            }

            msgsEl.innerHTML = '';

            if (EchoInstance && currentChannelName) {
                try {
                    EchoInstance.leave(currentChannelName);
                } catch (_) {}
                currentChannelName = null;
            }
            if (msgPollTimer) clearInterval(msgPollTimer);

            // Poll messages in selected convo
            msgPollTimer = setInterval(() => loadMessages(it.token), 3000);

            // Realtime subscribe to selected convo
            if (EchoInstance) {
                try {
                    currentChannelName = `chat.conversation.${it.token}`;
                    const ch = EchoInstance.channel(currentChannelName);
                    ch.listen('.message.sent', async (e) => {
                        appendMsg({
                            from: e.sender,
                            text: e.body,
                            ts: e.created_at
                        });
                        scrollToBottom();
                        // Selected convo: if user sent, mark as read and refresh list (unread should drop to 0)
                        if (e.sender === 'user') {
                            await markRead(it.token);
                            await loadConversations();
                        }
                    });
                } catch (e) {
                    console.warn('[admin] channel subscribe failed', e);
                }
            }

            await loadMessages(it.token);
            await markRead(it.token); // sets unread_count = 0 for selected convo
            await loadConversations(); // reflect unread changes immediately
        }

        // Optional: realtime global refresh for unread on other conversations
        if (EchoInstance) {
            try {
                // Backend should broadcast user messages to this channel with payload incl. conversation token
                EchoInstance.channel('chat.admin').listen('.message.sent', async (e) => {
                    const token = e.token || e.conversation_token || e.public_token;
                    if (!selected || token !== selected.token) {
                        // Not the selected conversation: refresh list to update unread badges
                        await loadConversations();
                    }
                });
            } catch (e) {
                console.warn('[admin] global channel subscribe failed', e);
            }
        }

        // Backend calls
        async function updateStatus(token, status) {
            const res = await fetch(urlStatus(token), {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrf,
                },
                body: JSON.stringify({
                    status
                }),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        }

        async function loadMessages(token) {
            try {
                const data = await fetchJSON(urlMessages(token));
                const msgs = data.data || [];
                msgsEl.innerHTML = '';
                msgs.forEach(m => appendMsg({
                    from: m.sender,
                    text: m.body,
                    ts: m.created_at
                }));
                scrollToBottom();
            } catch (e) {
                console.warn('[admin] loadMessages failed', e);
            }
        }

        async function markRead(token) {
            try {
                await fetch(urlRead(token), {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': csrf,
                    },
                    body: JSON.stringify({}),
                });
            } catch (e) {
                console.warn('[admin] markRead failed', e);
            }
        }

        // UI helpers
        function appendMsg({
            from,
            text,
            ts
        }) {
            const row = document.createElement('div');
            row.className = `mb-3 flex ${from === 'admin' ? 'justify-end' : 'justify-start'}`;

            const wrap = document.createElement('div');
            wrap.className = 'max-w-[80%]';

            const bubble = document.createElement('div');
            bubble.className = `${from === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-900'} rounded-2xl px-3 py-2 text-sm`;
            bubble.textContent = text || '';

            const time = document.createElement('div');
            time.className = `mt-1 text-[10px] ${from === 'admin' ? 'text-right text-slate-400' : 'text-slate-500'}`;
            time.textContent = fmtTime(ts) || new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });

            wrap.appendChild(bubble);
            wrap.appendChild(time);
            row.appendChild(wrap);
            msgsEl.appendChild(row);
        }

        function scrollToBottom() {
            msgsEl.scrollTop = msgsEl.scrollHeight;
        }

        async function sendAdminMessage() {
            const t = (inputEl.value || '').trim();
            if (!t || !selected) return;

            inputEl.value = '';
            appendMsg({
                from: 'admin',
                text: t,
                ts: new Date().toISOString()
            });

            try {
                const res = await fetch(urlSend(selected.token), {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': csrf,
                    },
                    body: JSON.stringify({
                        body: t
                    }),
                });
                if (!res.ok) console.error('sendAdminMessage failed', await res.text());
                scrollToBottom();
            } catch (e) {
                console.error('sendAdminMessage failed', e);
            }
        }

        sendBtn.addEventListener('click', sendAdminMessage);
        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendAdminMessage();
            }
        });
        filterEl?.addEventListener('change', () => loadConversations());
        searchBox?.addEventListener('input', () => loadConversations());

        // Boot
        loadConversations();
        setInterval(loadConversations, 5000); // keeps unread badges fresh
    })();
</script>
@endsection