// Interações simples: salvar localmente itens, likes e notas
// Nota: este é um protótipo front-end (sem backend). Usa localStorage.

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

function toast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.position = 'fixed';
  t.style.bottom = '16px';
  t.style.left = '50%';
  t.style.transform = 'translateX(-50%)';
  t.style.background = 'linear-gradient(180deg, #f7e27a, #d4af37)';
  t.style.color = '#111';
  t.style.padding = '10px 16px';
  t.style.border = '1px solid #b38b2e';
  t.style.borderRadius = '10px';
  t.style.boxShadow = '0 10px 24px rgba(212,175,55,0.25)';
  t.style.zIndex = '999';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1800);
}

// Exemplo: curtir/favoritar com animação simples
function bindFavoriteButtons() {
  $$('.fav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      btn.textContent = btn.classList.contains('active') ? '★ Favorito' : '☆ Favoritar';
      toast(btn.classList.contains('active') ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
    });
  });
}

// Persistência simples de wishlist
function bindWishlistForm() {
  const form = $('#wishlist-form');
  const list = $('#wishlist-list');
  if (!form || !list) return;

  const wishes = load('wishlist', []);
  renderWishes();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#wish-name').value.trim();
    const notes = $('#wish-notes').value.trim();
    if (!name) return toast('Adicione um nome para o item');
    wishes.push({ name, notes, id: Date.now() });
    save('wishlist', wishes);
    form.reset();
    renderWishes();
    toast('Desejo adicionado');
  });

  function renderWishes() {
    list.innerHTML = '';
    wishes.forEach(w => {
      const li = document.createElement('li');
      li.className = 'card';
      li.innerHTML = `
        <div class="flex" style="justify-content: space-between;">
          <div>
            <h3>${w.name}</h3>
            <p class="muted small">${w.notes || 'Sem observações'}</p>
          </div>
          <div class="flex">
            <button class="btn secondary" data-id="${w.id}" data-action="edit">Editar</button>
            <button class="btn danger" data-id="${w.id}" data-action="delete">Remover</button>
          </div>
        </div>`;
      list.appendChild(li);
    });

    $$('#wishlist-list .btn').forEach(b => {
      b.addEventListener('click', () => {
        const id = Number(b.dataset.id);
        const index = wishes.findIndex(x => x.id === id);
        if (index === -1) return;
        if (b.dataset.action === 'delete') {
          wishes.splice(index, 1);
          save('wishlist', wishes);
          renderWishes();
          toast('Desejo removido');
        } else {
          const newName = prompt('Novo nome do item:', wishes[index].name);
          const newNotes = prompt('Novas observações:', wishes[index].notes || '');
          if (newName !== null) wishes[index].name = newName.trim() || wishes[index].name;
          if (newNotes !== null) wishes[index].notes = newNotes.trim();
          save('wishlist', wishes);
          renderWishes();
          toast('Desejo atualizado');
        }
      });
    });
  }
}

// Persistência simples de favoritos
function bindFavorites() {
  const favList = $('#favorites-list');
  if (!favList) return;
  const favorites = load('favorites', []);
  renderFavorites();

  $('#add-favorite-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#fav-name').value.trim();
    const notes = $('#fav-notes').value.trim();
    if (!name) return toast('Informe o nome do item');
    favorites.push({ id: Date.now(), name, notes });
    save('favorites', favorites);
    e.target.reset();
    renderFavorites();
    toast('Favorito adicionado');
  });

  function renderFavorites() {
    favList.innerHTML = '';
    favorites.forEach(f => {
      const li = document.createElement('li');
      li.className = 'card';
      li.innerHTML = `
        <div class="flex" style="justify-content: space-between;">
          <div>
            <h3>${f.name}</h3>
            <p class="muted small">${f.notes || 'Sem observações'}</p>
          </div>
          <div class="flex">
            <button class="btn secondary" data-id="${f.id}" data-action="edit">Editar</button>
            <button class="btn danger" data-id="${f.id}" data-action="delete">Remover</button>
          </div>
        </div>`;
      favList.appendChild(li);
    });

    $$('#favorites-list .btn').forEach(b => {
      b.addEventListener('click', () => {
        const id = Number(b.dataset.id);
        const idx = favorites.findIndex(x => x.id === id);
        if (idx === -1) return;
        if (b.dataset.action === 'delete') {
          favorites.splice(idx, 1);
          save('favorites', favorites);
          renderFavorites();
          toast('Favorito removido');
        } else {
          const newName = prompt('Novo nome do item:', favorites[idx].name);
          const newNotes = prompt('Novas observações:', favorites[idx].notes || '');
          if (newName !== null) favorites[idx].name = newName.trim() || favorites[idx].name;
          if (newNotes !== null) favorites[idx].notes = newNotes.trim();
          save('favorites', favorites);
          renderFavorites();
          toast('Favorito atualizado');
        }
      });
    });
  }
}

// Comunidades: criar posts simples
function bindCommunity() {
  const form = $('#community-form');
  const feed = $('#community-feed');
  if (!form || !feed) return;

  const posts = load('community_posts', []);
  renderPosts();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = $('#post-title').value.trim();
    const content = $('#post-content').value.trim();
    if (!title || !content) return toast('Preencha título e conteúdo');
    posts.unshift({ id: Date.now(), title, content, createdAt: new Date().toISOString() });
    save('community_posts', posts);
    form.reset();
    renderPosts();
    toast('Post publicado');
  });

  function renderPosts() {
    feed.innerHTML = '';
    posts.forEach(p => {
      const div = document.createElement('div');
      div.className = 'card';
      const date = new Date(p.createdAt).toLocaleString();
      div.innerHTML = `
        <div class="flex" style="justify-content: space-between;">
          <h3>${p.title}</h3>
          <span class="badge">${date}</span>
        </div>
        <p class="muted">${p.content}</p>
        <div class="item-actions">
          <button class="btn secondary" data-id="${p.id}" data-action="like">Curtir</button>
          <button class="btn danger" data-id="${p.id}" data-action="delete">Excluir</button>
        </div>`;
      feed.appendChild(div);
    });

    $$('#community-feed .btn').forEach(b => {
      b.addEventListener('click', () => {
        const id = Number(b.dataset.id);
        const idx = posts.findIndex(x => x.id === id);
        if (idx === -1) return;
        if (b.dataset.action === 'delete') {
          posts.splice(idx, 1);
          save('community_posts', posts);
          renderPosts();
          toast('Post excluído');
        } else {
          toast('Você curtiu este post');
        }
      });
    });
  }
}

// Coleção do usuário: adicionar itens
function bindCollection() {
  const form = $('#collection-form');
  const list = $('#collection-list');
  if (!form || !list) return;

  const items = load('collection_items', []);
  renderItems();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#item-name').value.trim();
    const category = $('#item-category').value.trim();
    const notes = $('#item-notes').value.trim();
    const image = $('#item-image').value.trim();
    if (!name) return toast('Informe o nome do item');
    items.push({ id: Date.now(), name, category, notes, image });
    save('collection_items', items);
    e.target.reset();
    renderItems();
    toast('Item adicionado à coleção');
  });

  function renderItems() {
    list.innerHTML = '';
    items.forEach(it => {
      const li = document.createElement('li');
      li.className = 'card';
      li.innerHTML = `
        <div class="row">
          <div>
            ${it.image ? `<img src="${it.image}" alt="${it.name}" class="item-card">` : `<div class="editable">Sem imagem. Cole uma URL de imagem ao adicionar.</div>`}
          </div>
          <div>
            <h3>${it.name}</h3>
            <p class="muted small">Categoria: ${it.category || '—'}</p>
            <p class="muted small">${it.notes || 'Sem observações'}</p>
            <div class="item-actions">
              <button class="btn secondary" data-id="${it.id}" data-action="edit">Editar</button>
              <button class="btn danger" data-id="${it.id}" data-action="delete">Excluir</button>
            </div>
          </div>
        </div>`;
      list.appendChild(li);
    });

    $$('#collection-list .btn').forEach(b => {
      b.addEventListener('click', () => {
        const id = Number(b.dataset.id);
        const idx = items.findIndex(x => x.id === id);
        if (idx === -1) return;
        if (b.dataset.action === 'delete') {
          items.splice(idx, 1);
          save('collection_items', items);
          renderItems();
          toast('Item excluído');
        } else {
          const newName = prompt('Novo nome:', items[idx].name);
          const newCat = prompt('Nova categoria:', items[idx].category || '');
          const newNotes = prompt('Novas observações:', items[idx].notes || '');
          const newImg = prompt('Nova URL de imagem:', items[idx].image || '');
          if (newName !== null) items[idx].name = newName.trim() || items[idx].name;
          if (newCat !== null) items[idx].category = newCat.trim();
          if (newNotes !== null) items[idx].notes = newNotes.trim();
          if (newImg !== null) items[idx].image = newImg.trim();
          save('collection_items', items);
          renderItems();
          toast('Item atualizado');
        }
      });
    });
  }
}

// Perfil: salvar dados básicos
function bindProfile() {
  const form = $('#profile-form');
  if (!form) return;
  const data = load('profile', { displayName: '', bio: '', location: '' });

  $('#displayName').value = data.displayName || '';
  $('#bio').value = data.bio || '';
  $('#location').value = data.location || '';

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const displayName = $('#displayName').value.trim();
    const bio = $('#bio').value.trim();
    const location = $('#location').value.trim();
    save('profile', { displayName, bio, location });
    toast('Perfil atualizado');
  });
}

// Inicializações por página
document.addEventListener('DOMContentLoaded', () => {
  bindFavoriteButtons();
  bindWishlistForm();
  bindFavorites();
  bindCommunity();
  bindCollection();
  bindProfile();
});
