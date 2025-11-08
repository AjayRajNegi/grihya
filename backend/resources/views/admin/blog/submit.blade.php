@extends('layouts.admin')

@section('title', 'Submit Blog')

@section('content')
<div class="mb-6">
    <h1 class="text-2xl font-bold">Create Blog</h1>
    <p class="text-gray-600">Compose and publish a new blog post. Add rich content blocks as needed.</p>
</div>

@if ($errors->any())
<div class="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-800 p-3 text-sm">
    <ul class="list-disc ml-5">
        @foreach ($errors->all() as $e)
        <li>{{ $e }}</li>
        @endforeach
    </ul>
</div>
@endif

@if (session('success'))
<div class="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 p-3 text-sm">
    {{ session('success') }}
</div>
@endif

<form action="{{ route('admin.submit-blog.post') }}" method="POST" enctype="multipart/form-data" id="blogForm" class="space-y-6">
    @csrf

    <!-- Basics -->
    <div class="bg-white rounded-xl shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Basics</h2>

        <div class="grid md:grid-cols-2 gap-4">
            <div>
                <label class="text-sm text-gray-600">Title</label>
                <input type="text" name="title" id="title" required value="{{ old('title') }}"
                    placeholder="Enter the title"
                    class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600" />
            </div>
            <div>
                <label class="text-sm text-gray-600">Slug</label>
                <input type="text" name="slug" id="slug" required value="{{ old('slug') }}"
                    placeholder="auto-generated-from-title"
                    class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600" />
                <div class="text-xs text-gray-500 mt-1">Auto: <span id="slugAuto" class="font-mono"></span></div>
            </div>
        </div>

        <div class="mt-4">
            <label class="text-sm text-gray-600">Excerpt</label>
            <textarea name="excerpt" placeholder="Short summary (max 500 chars)"
                class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600 min-h-[100px]">{{ old('excerpt') }}</textarea>
        </div>
    </div>

    <!-- Publishing & SEO -->
    <div class="bg-white rounded-xl shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Publishing & SEO</h2>

        <div class="grid md:grid-cols-3 gap-4">
            <div>
                <label class="text-sm text-gray-600">Status</label>
                <select name="status" class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600">
                    <option value="draft" {{ old('status')==='draft' ? 'selected' : '' }}>Draft</option>
                    <option value="published" {{ old('status')==='published' ? 'selected' : '' }}>Published</option>
                </select>
            </div>
            <div>
                <label class="text-sm text-gray-600">Published at</label>
                <input type="datetime-local" name="published_at" value="{{ old('published_at') }}"
                    class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600" />
            </div>
            <div>
                <label class="text-sm text-gray-600">Cover Image</label>
                <input type="file" name="cover_image" accept="image/*"
                    class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600" />
                <div class="text-xs text-gray-500 mt-1">Optional. If validation fails, reselect the file before resubmitting.</div>
            </div>
        </div>

        <div class="mt-4 grid md:grid-cols-2 gap-4">
            <div>
                <label class="text-sm text-gray-600">Meta Title</label>
                <input type="text" name="meta_title" value="{{ old('meta_title') }}"
                    class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600" />
            </div>
            <div>
                <label class="text-sm text-gray-600">Meta Description</label>
                <input type="text" name="meta_description" value="{{ old('meta_description') }}"
                    class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600" />
            </div>
        </div>
    </div>

    <!-- Content Blocks -->
    <div class="bg-white rounded-xl shadow p-6">
        <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-semibold">Content Blocks</h2>
            <div class="flex flex-wrap gap-2">
                <button class="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-sm" type="button" data-add="hero">+ Hero</button>
                <button class="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-sm" type="button" data-add="heading">+ Heading</button>
                <button class="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-sm" type="button" data-add="paragraph">+ Paragraph</button>
                <button class="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-sm" type="button" data-add="list">+ List</button>
                <button class="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-sm" type="button" data-add="image">+ Image</button>
                <button class="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-sm" type="button" data-add="quote">+ Quote</button>
                <button class="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-sm" type="button" data-add="callout">+ Callout</button>
                <button class="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-sm" type="button" data-add="problem_solution">+ Problem/Solution</button>
            </div>
        </div>

        <div id="blocks" class="space-y-3"></div>

        <div class="mt-3 text-sm text-gray-500">Tip: Add as many blocks as you need. “Hero” is a top banner (title + optional image).</div>
    </div>

    <div class="flex items-center gap-2">
        <button class="px-5 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700" type="submit">Save Blog</button>
        <a href="{{ route('overview') }}" class="px-5 py-2 rounded border font-semibold hover:bg-gray-50">Back to Overview</a>
    </div>
</form>
@endsection

@section('scripts')
<script>
    const initialContent = @json(old('content', []));

    const titleEl = document.getElementById('title');
    const slugEl = document.getElementById('slug');
    const slugAutoEl = document.getElementById('slugAuto');
    let slugTouched = false;

    function slugify(s) {
        return (s || '').toLowerCase().trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }

    function updateSlugAuto() {
        const auto = slugify(titleEl.value);
        slugAutoEl.textContent = auto;
        if (!slugTouched) slugEl.value = auto;
    }
    titleEl.addEventListener('input', updateSlugAuto);
    slugEl.addEventListener('input', () => slugTouched = true);

    // Blocks
    const blocksWrap = document.getElementById('blocks');
    document.querySelectorAll('[data-add]').forEach(btn => {
        btn.addEventListener('click', () => addBlock(btn.dataset.add));
    });

    function addBlock(type) {
        const idx = blocksWrap.children.length;
        const block = document.createElement('div');
        block.className = 'border rounded-lg p-4';
        block.dataset.index = String(idx);
        block.dataset.type = type;
        block.innerHTML = renderBlock(idx, type);
        blocksWrap.appendChild(block);
        wireBlock(block, type);
        return block;
    }

    function wireBlock(block, type) {
        block.querySelector('[data-remove]')?.addEventListener('click', () => {
            block.remove();
            reindexBlocks();
        });
        block.querySelector('[data-up]')?.addEventListener('click', () => moveBlock(block, -1));
        block.querySelector('[data-down]')?.addEventListener('click', () => moveBlock(block, 1));

        const addItemBtn = block.querySelector('[data-add-item]');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => {
                const i = Number(block.dataset.index || 0);
                addListItem(block, i, '');
            });
        }
        block.querySelectorAll('[data-remove-item]').forEach(btn => {
            btn.addEventListener('click', () => btn.closest('.list-item')?.remove());
        });
    }

    function moveBlock(block, dir) {
        const sib = dir < 0 ? block.previousElementSibling : block.nextElementSibling;
        if (!sib) return;
        if (dir < 0) blocksWrap.insertBefore(block, sib);
        else blocksWrap.insertBefore(sib, block);
        reindexBlocks();
    }

    function reindexBlocks() {
        [...blocksWrap.children].forEach((el, i) => {
            el.dataset.index = String(i);
            el.querySelectorAll('[data-name]').forEach(input => {
                const n = input.getAttribute('data-name');
                if (!n) return;
                input.setAttribute('name', n.replace('__i__', String(i)));
            });
        });
    }

    function setVal(i, key, val) {
        const el = blocksWrap.querySelector(`[name="content[${i}][data][${key}]"]`);
        if (!el) return;
        if (el.tagName === 'SELECT') {
            [...el.options].forEach(opt => opt.selected = (opt.value == String(val)));
        } else {
            el.value = val != null ? String(val) : '';
        }
    }

    function addListItem(block, i, value) {
        const itemsWrap = block.querySelector('.list-items');
        const row = document.createElement('div');
        row.className = 'list-item flex gap-2 mb-2';
        row.innerHTML = `
      <input type="text"
             data-name="content[__i__][data][items][]"
             name="content[${i}][data][items][]"
             value="${value ? String(value).replace(/"/g, '&quot;') : ''}"
             placeholder="Bullet point"
             class="flex-1 rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600 px-3 py-2 text-sm" />
      <button type="button" class="px-3 py-1.5 rounded bg-red-100 text-red-700 text-sm" data-remove-item>Remove</button>
    `;
        itemsWrap.appendChild(row);
        row.querySelector('[data-remove-item]').addEventListener('click', () => row.remove());
    }

    function fillBlock(i, type, data) {
        if (!data) return;
        switch (type) {
            case 'hero':
                setVal(i, 'title', data.title || '');
                setVal(i, 'image_url', data.image_url || '');
                break;
            case 'heading':
                setVal(i, 'text', data.text || '');
                setVal(i, 'level', data.level != null ? data.level : 2);
                break;
            case 'paragraph':
                setVal(i, 'html', data.html || '');
                break;
            case 'image':
                setVal(i, 'src_url', data.src_url || data.src || '');
                setVal(i, 'alt', data.alt || '');
                setVal(i, 'caption', data.caption || '');
                break;
            case 'quote':
                setVal(i, 'text', data.text || '');
                setVal(i, 'author', data.author || '');
                break;
            case 'callout':
                setVal(i, 'variant', data.variant || 'info');
                setVal(i, 'html', data.html || '');
                break;
            case 'problem_solution':
                setVal(i, 'number', data.number != null ? data.number : '');
                setVal(i, 'title', data.title || '');
                setVal(i, 'problem', data.problem || '');
                setVal(i, 'solution', data.solution || '');
                break;
            case 'list': {
                const block = blocksWrap.querySelector(`[data-index="${i}"]`);
                if (!block) break;
                const styleSelect = block.querySelector(`[name="content[${i}][data][style]"]`);
                if (styleSelect) styleSelect.value = data.style === 'ol' ? 'ol' : 'ul';
                const items = Array.isArray(data.items) ? data.items : [];
                if (items.length) items.forEach(val => addListItem(block, i, val || ''));
                else addListItem(block, i, '');
                break;
            }
        }
    }

    function renderBlock(i, type) {
        const head = `
      <div class="flex items-center justify-between mb-3">
        <div class="text-sm text-gray-600"><strong class="text-gray-900">#${i + 1}</strong> • ${type}</div>
        <div class="flex gap-2">
          <button class="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm" type="button" data-up>↑</button>
          <button class="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm" type="button" data-down>↓</button>
          <button class="px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 text-sm" type="button" data-remove>Remove</button>
        </div>
      </div>
      <input type="hidden" data-name="content[__i__][type]" name="content[${i}][type]" value="${type}" />
    `;

        if (type === 'hero') {
            return head + `
        <label class="text-sm text-gray-600">Hero Title</label>
        <input type="text" data-name="content[__i__][data][title]" name="content[${i}][data][title]"
               class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600" />

        <label class="text-sm text-gray-600 mt-3">Hero Image (upload)</label>
        <input type="file" accept="image/*" data-name="content[__i__][data][file]" name="content[${i}][data][file]"
               class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600" />
        <div class="text-xs text-gray-500 mt-1">Or paste a URL (uploaded image takes priority if both are provided):</div>

        <label class="text-sm text-gray-600 mt-3">Hero Image URL</label>
        <input type="text" data-name="content[__i__][data][image_url]" name="content[${i}][data][image_url]"
               placeholder="/storage/blog/hero.jpg or https://..."
               class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600" />
      `;
        }
        if (type === 'heading') {
            return head + `
        <label class="text-sm text-gray-600">Heading Text</label>
        <input type="text" data-name="content[__i__][data][text]" name="content[${i}][data][text]"
               class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600" />
        <label class="text-sm text-gray-600 mt-3">Level</label>
        <select data-name="content[__i__][data][level]" name="content[${i}][data][level]"
                class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600">
          <option value="1">H1</option><option value="2" selected>H2</option><option value="3">H3</option><option value="4">H4</option>
        </select>
      `;
        }
        if (type === 'paragraph') {
            return head + `
        <label class="text-sm text-gray-600">Paragraph (HTML allowed)</label>
        <textarea data-name="content[__i__][data][html]" name="content[${i}][data][html]" rows="4"
                  class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600"></textarea>
      `;
        }
        if (type === 'image') {
            return head + `
        <label class="text-sm text-gray-600">Image file (optional)</label>
        <input type="file" accept="image/*" data-name="content[__i__][data][file]" name="content[${i}][data][file]"
               class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600" />
        <div class="text-xs text-gray-500 mt-1">Or paste an image URL:</div>

        <label class="text-sm text-gray-600 mt-3">Image URL</label>
        <input type="text" data-name="content[__i__][data][src_url]" name="content[${i}][data][src_url]"
               placeholder="/storage/blog/img.jpg or https://..."
               class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600" />

        <div class="grid md:grid-cols-2 gap-4 mt-3">
          <div>
            <label class="text-sm text-gray-600">Alt</label>
            <input type="text" data-name="content[__i__][data][alt]" name="content[${i}][data][alt]"
                   class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600" />
          </div>
          <div>
            <label class="text-sm text-gray-600">Caption</label>
            <input type="text" data-name="content[__i__][data][caption]" name="content[${i}][data][caption]"
                   class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600" />
          </div>
        </div>
      `;
        }
        if (type === 'quote') {
            return head + `
        <label class="text-sm text-gray-600">Quote Text</label>
        <textarea data-name="content[__i__][data][text]" name="content[${i}][data][text]" rows="3"
                  class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600"></textarea>
        <label class="text-sm text-gray-600 mt-3">Author (optional)</label>
        <input type="text" data-name="content[__i__][data][author]" name="content[${i}][data][author]"
               class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600" />
      `;
        }
        if (type === 'callout') {
            return head + `
        <label class="text-sm text-gray-600">Variant</label>
        <select data-name="content[__i__][data][variant]" name="content[${i}][data][variant]"
                class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600">
          <option value="info">Info</option><option value="success">Success</option>
          <option value="warning">Warning</option><option value="danger">Danger</option>
        </select>
        <label class="text-sm text-gray-600 mt-3">HTML</label>
        <textarea data-name="content[__i__][data][html]" name="content[${i}][data][html]" rows="4"
                  class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600"></textarea>
      `;
        }
        if (type === 'problem_solution') {
            return head + `
        <div class="grid md:grid-cols-3 gap-4">
          <div>
            <label class="text-sm text-gray-600">Number</label>
            <input type="text" data-name="content[__i__][data][number]" name="content[${i}][data][number]"
                   placeholder="1,2,3..." class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600" />
          </div>
          <div class="md:col-span-2">
            <label class="text-sm text-gray-600">Title</label>
            <input type="text" data-name="content[__i__][data][title]" name="content[${i}][data][title]"
                   placeholder="The Endless, Frustrating Search"
                   class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600" />
          </div>
        </div>
        <label class="text-sm text-gray-600 mt-3">Problem</label>
        <textarea data-name="content[__i__][data][problem]" name="content[${i}][data][problem]" rows="3"
                  class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600"></textarea>

        <label class="text-sm text-gray-600 mt-3">Solution</label>
        <textarea data-name="content[__i__][data][solution]" name="content[${i}][data][solution]" rows="3"
                  class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600"></textarea>
      `;
        }
        if (type === 'list') {
            return head + `
        <label class="text-sm text-gray-600">List style</label>
        <select data-name="content[__i__][data][style]" name="content[${i}][data][style]"
                class="mt-1 w-full rounded border-gray-300 focus:ring-indigo-600 focus:border-indigo-600">
          <option value="ul" selected>Bulleted (•)</option>
          <option value="ol">Numbered (1.)</option>
        </select>

        <div class="border-t my-3"></div>
        <div class="flex items-center justify-between mb-2">
          <div class="text-sm text-gray-500">Items</div>
          <button class="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-sm" type="button" data-add-item>+ Add item</button>
        </div>
        <div class="list-items"></div>
        <div class="text-xs text-gray-500 mt-2">Tip: Only non-empty items will be saved.</div>
      `;
        }
        return head + `<div class="text-sm text-gray-500">Unknown block type.</div>`;
    }

    // On load
    document.addEventListener('DOMContentLoaded', () => {
        if (slugEl.value) slugTouched = true;
        updateSlugAuto();

        if (Array.isArray(initialContent) && initialContent.length) {
            initialContent.forEach((blk, i) => {
                if (!blk || !blk.type) return;
                const el = addBlock(blk.type);
                fillBlock(i, blk.type, blk.data || {});
                if (blk.type === 'list') {
                    const itemsWrap = el.querySelector('.list-items');
                    if (itemsWrap && !itemsWrap.children.length) addListItem(el, i, '');
                }
            });
        }
    });
</script>
@endsection