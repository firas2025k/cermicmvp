/* ─── Shared Cart Logic ─────────────────────────────────────────────────── */

const CART = {
  items: [
    { id: 1, name: 'Large Serving Board', variant: 'L · Natural',  price: 68, qty: 1,
      img: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=120&q=80' },
    { id: 2, name: 'Stoneware Dinner Plate', variant: 'Ø 27 cm · Chalk White', price: 42, qty: 2,
      img: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=120&q=80' },
  ],

  open() {
    document.getElementById('cartDrawer').classList.remove('translate-x-full');
    document.getElementById('cartOverlay').classList.remove('opacity-0', 'pointer-events-none');
  },

  close() {
    document.getElementById('cartDrawer').classList.add('translate-x-full');
    document.getElementById('cartOverlay').classList.add('opacity-0', 'pointer-events-none');
  },

  add(name, variant, price, img) {
    const existing = this.items.find(i => i.name === name && i.variant === variant);
    if (existing) {
      existing.qty++;
    } else {
      this.items.push({ id: Date.now(), name, variant, price, qty: 1, img });
    }
    this.render();
    this.open();
  },

  changeQty(id, delta) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) this.items = this.items.filter(i => i.id !== id);
    this.render();
  },

  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.render();
  },

  subtotal() {
    return this.items.reduce((s, i) => s + i.price * i.qty, 0);
  },

  count() {
    return this.items.reduce((s, i) => s + i.qty, 0);
  },

  render() {
    const list  = document.getElementById('cartList');
    const badge = document.getElementById('cartBadge');
    const sub   = document.getElementById('cartSubtotal');
    const empty = document.getElementById('cartEmpty');
    const foot  = document.getElementById('cartFooter');

    badge.textContent = this.count();
    badge.style.display = this.count() > 0 ? 'flex' : 'none';

    if (this.items.length === 0) {
      list.innerHTML  = '';
      empty.style.display = 'flex';
      foot.style.display  = 'none';
      return;
    }

    empty.style.display = 'none';
    foot.style.display  = 'block';
    sub.textContent = '€ ' + this.subtotal().toFixed(2).replace('.', ',');

    list.innerHTML = this.items.map(item => `
      <li class="flex gap-4 py-5 border-b border-warm-border last:border-0">
        <img src="${item.img}" alt="${item.name}"
             class="w-20 h-20 object-cover flex-shrink-0" />
        <div class="flex-1 min-w-0">
          <p class="font-serif text-base font-light text-charcoal leading-snug mb-0.5">${item.name}</p>
          <p class="font-sans text-xs text-warm-gray mb-3">${item.variant}</p>
          <div class="flex items-center justify-between">
            <div class="flex items-center border border-warm-border">
              <button onclick="CART.changeQty(${item.id}, -1)"
                      class="w-7 h-7 flex items-center justify-center text-warm-gray hover:text-charcoal text-lg leading-none border-r border-warm-border transition-colors">−</button>
              <span class="font-sans text-xs w-8 text-center">${item.qty}</span>
              <button onclick="CART.changeQty(${item.id}, 1)"
                      class="w-7 h-7 flex items-center justify-center text-warm-gray hover:text-charcoal text-lg leading-none border-l border-warm-border transition-colors">+</button>
            </div>
            <div class="flex items-center gap-3">
              <span class="font-sans text-sm font-medium text-charcoal">€ ${(item.price * item.qty).toFixed(2).replace('.', ',')}</span>
              <button onclick="CART.remove(${item.id})" class="text-warm-gray hover:text-bordeaux transition-colors" title="Remove">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
        </div>
      </li>
    `).join('');
  }
};

/* ─── Cart Drawer HTML injected into <body> ─────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const drawer = document.createElement('div');
  drawer.innerHTML = `
    <!-- Overlay -->
    <div id="cartOverlay"
         onclick="CART.close()"
         class="fixed inset-0 z-[60] opacity-0 pointer-events-none transition-opacity duration-300"
         style="background:rgba(44,42,39,0.4);"></div>

    <!-- Drawer -->
    <aside id="cartDrawer"
           class="fixed top-0 right-0 h-full w-full max-w-md z-[70] translate-x-full transition-transform duration-400 ease-in-out flex flex-col"
           style="background:#F8F4EE; box-shadow:-8px 0 40px rgba(44,42,39,0.15);">

      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-5 border-b"
           style="border-color:#E2DBD0;">
        <h2 class="font-serif text-2xl font-light" style="color:#2C2A27;">Your Cart</h2>
        <button onclick="CART.close()" class="transition-colors" style="color:#8C8680;" onmouseover="this.style.color='#2C2A27'" onmouseout="this.style.color='#8C8680'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Empty state -->
      <div id="cartEmpty" class="flex-1 flex flex-col items-center justify-center gap-4 px-6" style="display:none;">
        <svg class="w-12 h-12" style="color:#E2DBD0;" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        <p class="font-serif text-xl font-light" style="color:#8C8680;">Your cart is empty</p>
        <button onclick="CART.close()"
                class="font-sans text-xs tracking-widest uppercase px-6 py-3 border transition-all duration-200"
                style="border-color:#4A5E3A;color:#4A5E3A;"
                onmouseover="this.style.background='#4A5E3A';this.style.color='#F8F4EE';"
                onmouseout="this.style.background='transparent';this.style.color='#4A5E3A';">
          Continue Shopping
        </button>
      </div>

      <!-- Items list -->
      <ul id="cartList" class="flex-1 overflow-y-auto px-6 py-2"></ul>

      <!-- Footer -->
      <div id="cartFooter" class="px-6 py-6 border-t" style="border-color:#E2DBD0;">
        <!-- Free shipping progress -->
        <div class="mb-5">
          <div class="flex justify-between items-center mb-2">
            <p class="font-sans text-xs" style="color:#8C8680;">Free shipping from € 80,00</p>
            <p class="font-sans text-xs font-medium" style="color:#4A5E3A;" id="shippingNote"></p>
          </div>
          <div class="h-px w-full" style="background:#E2DBD0;">
            <div id="shippingBar" class="h-px transition-all duration-500" style="background:#4A5E3A; width:0%;"></div>
          </div>
        </div>

        <!-- Subtotal -->
        <div class="flex items-center justify-between mb-5">
          <p class="font-sans text-sm tracking-wide uppercase" style="color:#2C2A27;">Subtotal</p>
          <p class="font-serif text-xl font-light" id="cartSubtotal" style="color:#2C2A27;">€ 0,00</p>
        </div>

        <!-- Buttons -->
        <a href="#"
           onclick="CART.close(); return false;"
           class="flex items-center justify-center w-full py-3.5 mb-3 font-sans text-sm tracking-wide border transition-all duration-200"
           style="border-color:#4A5E3A;color:#4A5E3A;"
           onmouseover="this.style.background='#4A5E3A';this.style.color='#F8F4EE';"
           onmouseout="this.style.background='transparent';this.style.color='#4A5E3A';">
          View Cart
        </a>
        <a href="checkout.html"
           class="flex items-center justify-center w-full py-3.5 font-sans text-sm tracking-wide text-white transition-colors duration-200"
           style="background:#6B1F3A;"
           onmouseover="this.style.background='#4E1628';"
           onmouseout="this.style.background='#6B1F3A';">
          Proceed to Checkout &rarr;
        </a>

        <p class="font-sans text-[10px] text-center mt-4" style="color:#8C8680;">
          Taxes and shipping calculated at checkout
        </p>
      </div>
    </aside>
  `;
  document.body.appendChild(drawer);

  CART.render();

  /* update shipping bar whenever render is called */
  const _origRender = CART.render.bind(CART);
  CART.render = function() {
    _origRender();
    const pct = Math.min((this.subtotal() / 80) * 100, 100);
    const bar  = document.getElementById('shippingBar');
    const note = document.getElementById('shippingNote');
    if (bar) bar.style.width = pct + '%';
    if (note) {
      const remaining = 80 - this.subtotal();
      note.textContent = remaining > 0 ? `€ ${remaining.toFixed(2).replace('.',',')} away` : 'Free shipping!';
      note.style.color = remaining > 0 ? '#8C8680' : '#4A5E3A';
    }
  };
  CART.render();
});
