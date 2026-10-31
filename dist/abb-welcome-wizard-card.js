/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const be = globalThis, Ve = be.ShadowRoot && (be.ShadyCSS === void 0 || be.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, qe = Symbol(), ct = /* @__PURE__ */ new WeakMap();
let Ht = class {
  constructor(t, n, i) {
    if (this._$cssResult$ = !0, i !== qe) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = n;
  }
  get styleSheet() {
    let t = this.o;
    const n = this.t;
    if (Ve && t === void 0) {
      const i = n !== void 0 && n.length === 1;
      i && (t = ct.get(n)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && ct.set(n, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const ln = (e) => new Ht(typeof e == "string" ? e : e + "", void 0, qe), Ye = (e, ...t) => {
  const n = e.length === 1 ? e[0] : t.reduce((i, s, r) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + e[r + 1], e[0]);
  return new Ht(n, e, qe);
}, un = (e, t) => {
  if (Ve) e.adoptedStyleSheets = t.map((n) => n instanceof CSSStyleSheet ? n : n.styleSheet);
  else for (const n of t) {
    const i = document.createElement("style"), s = be.litNonce;
    s !== void 0 && i.setAttribute("nonce", s), i.textContent = n.cssText, e.appendChild(i);
  }
}, lt = Ve ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let n = "";
  for (const i of t.cssRules) n += i.cssText;
  return ln(n);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: pn, defineProperty: hn, getOwnPropertyDescriptor: fn, getOwnPropertyNames: mn, getOwnPropertySymbols: gn, getPrototypeOf: bn } = Object, ze = globalThis, ut = ze.trustedTypes, vn = ut ? ut.emptyScript : "", yn = ze.reactiveElementPolyfillSupport, Y = (e, t) => e, $e = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? vn : null;
      break;
    case Object:
    case Array:
      e = e == null ? e : JSON.stringify(e);
  }
  return e;
}, fromAttribute(e, t) {
  let n = e;
  switch (t) {
    case Boolean:
      n = e !== null;
      break;
    case Number:
      n = e === null ? null : Number(e);
      break;
    case Object:
    case Array:
      try {
        n = JSON.parse(e);
      } catch {
        n = null;
      }
  }
  return n;
} }, Ze = (e, t) => !pn(e, t), pt = { attribute: !0, type: String, converter: $e, reflect: !1, useDefault: !1, hasChanged: Ze };
Symbol.metadata ??= Symbol("metadata"), ze.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let L = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, n = pt) {
    if (n.state && (n.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((n = Object.create(n)).wrapped = !0), this.elementProperties.set(t, n), !n.noAccessor) {
      const i = Symbol(), s = this.getPropertyDescriptor(t, i, n);
      s !== void 0 && hn(this.prototype, t, s);
    }
  }
  static getPropertyDescriptor(t, n, i) {
    const { get: s, set: r } = fn(this.prototype, t) ?? { get() {
      return this[n];
    }, set(o) {
      this[n] = o;
    } };
    return { get: s, set(o) {
      const a = s?.call(this);
      r?.call(this, o), this.requestUpdate(t, a, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? pt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Y("elementProperties"))) return;
    const t = bn(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Y("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Y("properties"))) {
      const n = this.properties, i = [...mn(n), ...gn(n)];
      for (const s of i) this.createProperty(s, n[s]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const n = litPropertyMetadata.get(t);
      if (n !== void 0) for (const [i, s] of n) this.elementProperties.set(i, s);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [n, i] of this.elementProperties) {
      const s = this._$Eu(n, i);
      s !== void 0 && this._$Eh.set(s, n);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const n = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const s of i) n.unshift(lt(s));
    } else t !== void 0 && n.push(lt(t));
    return n;
  }
  static _$Eu(t, n) {
    const i = n.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), n = this.constructor.elementProperties;
    for (const i of n.keys()) this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return un(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, n, i) {
    this._$AK(t, i);
  }
  _$ET(t, n) {
    const i = this.constructor.elementProperties.get(t), s = this.constructor._$Eu(t, i);
    if (s !== void 0 && i.reflect === !0) {
      const r = (i.converter?.toAttribute !== void 0 ? i.converter : $e).toAttribute(n, i.type);
      this._$Em = t, r == null ? this.removeAttribute(s) : this.setAttribute(s, r), this._$Em = null;
    }
  }
  _$AK(t, n) {
    const i = this.constructor, s = i._$Eh.get(t);
    if (s !== void 0 && this._$Em !== s) {
      const r = i.getPropertyOptions(s), o = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : $e;
      this._$Em = s;
      const a = o.fromAttribute(n, r.type);
      this[s] = a ?? this._$Ej?.get(s) ?? a, this._$Em = null;
    }
  }
  requestUpdate(t, n, i, s = !1, r) {
    if (t !== void 0) {
      const o = this.constructor;
      if (s === !1 && (r = this[t]), i ??= o.getPropertyOptions(t), !((i.hasChanged ?? Ze)(r, n) || i.useDefault && i.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, i)))) return;
      this.C(t, n, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, n, { useDefault: i, reflect: s, wrapped: r }, o) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, o ?? n ?? this[t]), r !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (n = void 0), this._$AL.set(t, n)), s === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (n) {
      Promise.reject(n);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [s, r] of this._$Ep) this[s] = r;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [s, r] of i) {
        const { wrapped: o } = r, a = this[s];
        o !== !0 || this._$AL.has(s) || a === void 0 || this.C(s, void 0, r, a);
      }
    }
    let t = !1;
    const n = this._$AL;
    try {
      t = this.shouldUpdate(n), t ? (this.willUpdate(n), this._$EO?.forEach((i) => i.hostUpdate?.()), this.update(n)) : this._$EM();
    } catch (i) {
      throw t = !1, this._$EM(), i;
    }
    t && this._$AE(n);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((n) => n.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((n) => this._$ET(n, this[n])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
L.elementStyles = [], L.shadowRootOptions = { mode: "open" }, L[Y("elementProperties")] = /* @__PURE__ */ new Map(), L[Y("finalized")] = /* @__PURE__ */ new Map(), yn?.({ ReactiveElement: L }), (ze.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Je = globalThis, ht = (e) => e, we = Je.trustedTypes, ft = we ? we.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, Kt = "$lit$", I = `lit$${Math.random().toFixed(9).slice(2)}$`, jt = "?" + I, $n = `<${jt}>`, M = document, Q = () => M.createComment(""), ee = (e) => e === null || typeof e != "object" && typeof e != "function", Xe = Array.isArray, wn = (e) => Xe(e) || typeof e?.[Symbol.iterator] == "function", Ce = `[ 	
\f\r]`, V = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, mt = /-->/g, gt = />/g, F = RegExp(`>|${Ce}(?:([^\\s"'>=/]+)(${Ce}*=${Ce}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), bt = /'/g, vt = /"/g, Ut = /^(?:script|style|textarea|title)$/i, Wt = (e) => (t, ...n) => ({ _$litType$: e, strings: t, values: n }), c = Wt(1), kn = Wt(2), W = Symbol.for("lit-noChange"), m = Symbol.for("lit-nothing"), yt = /* @__PURE__ */ new WeakMap(), P = M.createTreeWalker(M, 129);
function Gt(e, t) {
  if (!Xe(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ft !== void 0 ? ft.createHTML(t) : t;
}
const xn = (e, t) => {
  const n = e.length - 1, i = [];
  let s, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = V;
  for (let a = 0; a < n; a++) {
    const d = e[a];
    let l, h, u = -1, f = 0;
    for (; f < d.length && (o.lastIndex = f, h = o.exec(d), h !== null); ) f = o.lastIndex, o === V ? h[1] === "!--" ? o = mt : h[1] !== void 0 ? o = gt : h[2] !== void 0 ? (Ut.test(h[2]) && (s = RegExp("</" + h[2], "g")), o = F) : h[3] !== void 0 && (o = F) : o === F ? h[0] === ">" ? (o = s ?? V, u = -1) : h[1] === void 0 ? u = -2 : (u = o.lastIndex - h[2].length, l = h[1], o = h[3] === void 0 ? F : h[3] === '"' ? vt : bt) : o === vt || o === bt ? o = F : o === mt || o === gt ? o = V : (o = F, s = void 0);
    const b = o === F && e[a + 1].startsWith("/>") ? " " : "";
    r += o === V ? d + $n : u >= 0 ? (i.push(l), d.slice(0, u) + Kt + d.slice(u) + I + b) : d + I + (u === -2 ? a : b);
  }
  return [Gt(e, r + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class te {
  constructor({ strings: t, _$litType$: n }, i) {
    let s;
    this.parts = [];
    let r = 0, o = 0;
    const a = t.length - 1, d = this.parts, [l, h] = xn(t, n);
    if (this.el = te.createElement(l, i), P.currentNode = this.el.content, n === 2 || n === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (s = P.nextNode()) !== null && d.length < a; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const u of s.getAttributeNames()) if (u.endsWith(Kt)) {
          const f = h[o++], b = s.getAttribute(u).split(I), p = /([.?@])?(.*)/.exec(f);
          d.push({ type: 1, index: r, name: p[2], strings: b, ctor: p[1] === "." ? An : p[1] === "?" ? Sn : p[1] === "@" ? zn : Ee }), s.removeAttribute(u);
        } else u.startsWith(I) && (d.push({ type: 6, index: r }), s.removeAttribute(u));
        if (Ut.test(s.tagName)) {
          const u = s.textContent.split(I), f = u.length - 1;
          if (f > 0) {
            s.textContent = we ? we.emptyScript : "";
            for (let b = 0; b < f; b++) s.append(u[b], Q()), P.nextNode(), d.push({ type: 2, index: ++r });
            s.append(u[f], Q());
          }
        }
      } else if (s.nodeType === 8) if (s.data === jt) d.push({ type: 2, index: r });
      else {
        let u = -1;
        for (; (u = s.data.indexOf(I, u + 1)) !== -1; ) d.push({ type: 7, index: r }), u += I.length - 1;
      }
      r++;
    }
  }
  static createElement(t, n) {
    const i = M.createElement("template");
    return i.innerHTML = t, i;
  }
}
function G(e, t, n = e, i) {
  if (t === W) return t;
  let s = i !== void 0 ? n._$Co?.[i] : n._$Cl;
  const r = ee(t) ? void 0 : t._$litDirective$;
  return s?.constructor !== r && (s?._$AO?.(!1), r === void 0 ? s = void 0 : (s = new r(e), s._$AT(e, n, i)), i !== void 0 ? (n._$Co ??= [])[i] = s : n._$Cl = s), s !== void 0 && (t = G(e, s._$AS(e, t.values), s, i)), t;
}
class _n {
  constructor(t, n) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = n;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: n }, parts: i } = this._$AD, s = (t?.creationScope ?? M).importNode(n, !0);
    P.currentNode = s;
    let r = P.nextNode(), o = 0, a = 0, d = i[0];
    for (; d !== void 0; ) {
      if (o === d.index) {
        let l;
        d.type === 2 ? l = new oe(r, r.nextSibling, this, t) : d.type === 1 ? l = new d.ctor(r, d.name, d.strings, this, t) : d.type === 6 && (l = new En(r, this, t)), this._$AV.push(l), d = i[++a];
      }
      o !== d?.index && (r = P.nextNode(), o++);
    }
    return P.currentNode = M, s;
  }
  p(t) {
    let n = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, n), n += i.strings.length - 2) : i._$AI(t[n])), n++;
  }
}
class oe {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, n, i, s) {
    this.type = 2, this._$AH = m, this._$AN = void 0, this._$AA = t, this._$AB = n, this._$AM = i, this.options = s, this._$Cv = s?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const n = this._$AM;
    return n !== void 0 && t?.nodeType === 11 && (t = n.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, n = this) {
    t = G(this, t, n), ee(t) ? t === m || t == null || t === "" ? (this._$AH !== m && this._$AR(), this._$AH = m) : t !== this._$AH && t !== W && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : wn(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== m && ee(this._$AH) ? this._$AA.nextSibling.data = t : this.T(M.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: n, _$litType$: i } = t, s = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = te.createElement(Gt(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === s) this._$AH.p(n);
    else {
      const r = new _n(s, this), o = r.u(this.options);
      r.p(n), this.T(o), this._$AH = r;
    }
  }
  _$AC(t) {
    let n = yt.get(t.strings);
    return n === void 0 && yt.set(t.strings, n = new te(t)), n;
  }
  k(t) {
    Xe(this._$AH) || (this._$AH = [], this._$AR());
    const n = this._$AH;
    let i, s = 0;
    for (const r of t) s === n.length ? n.push(i = new oe(this.O(Q()), this.O(Q()), this, this.options)) : i = n[s], i._$AI(r), s++;
    s < n.length && (this._$AR(i && i._$AB.nextSibling, s), n.length = s);
  }
  _$AR(t = this._$AA.nextSibling, n) {
    for (this._$AP?.(!1, !0, n); t !== this._$AB; ) {
      const i = ht(t).nextSibling;
      ht(t).remove(), t = i;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class Ee {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, n, i, s, r) {
    this.type = 1, this._$AH = m, this._$AN = void 0, this.element = t, this.name = n, this._$AM = s, this.options = r, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = m;
  }
  _$AI(t, n = this, i, s) {
    const r = this.strings;
    let o = !1;
    if (r === void 0) t = G(this, t, n, 0), o = !ee(t) || t !== this._$AH && t !== W, o && (this._$AH = t);
    else {
      const a = t;
      let d, l;
      for (t = r[0], d = 0; d < r.length - 1; d++) l = G(this, a[i + d], n, d), l === W && (l = this._$AH[d]), o ||= !ee(l) || l !== this._$AH[d], l === m ? t = m : t !== m && (t += (l ?? "") + r[d + 1]), this._$AH[d] = l;
    }
    o && !s && this.j(t);
  }
  j(t) {
    t === m ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class An extends Ee {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === m ? void 0 : t;
  }
}
class Sn extends Ee {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== m);
  }
}
class zn extends Ee {
  constructor(t, n, i, s, r) {
    super(t, n, i, s, r), this.type = 5;
  }
  _$AI(t, n = this) {
    if ((t = G(this, t, n, 0) ?? m) === W) return;
    const i = this._$AH, s = t === m && i !== m || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, r = t !== m && (i === m || s);
    s && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class En {
  constructor(t, n, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = n, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    G(this, t);
  }
}
const Dn = Je.litHtmlPolyfillSupport;
Dn?.(te, oe), (Je.litHtmlVersions ??= []).push("3.3.3");
const Tn = (e, t, n) => {
  const i = n?.renderBefore ?? t;
  let s = i._$litPart$;
  if (s === void 0) {
    const r = n?.renderBefore ?? null;
    i._$litPart$ = s = new oe(t.insertBefore(Q(), r), r, void 0, n ?? {});
  }
  return s._$AI(e), s;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Qe = globalThis;
class B extends L {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const n = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Tn(n, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return W;
  }
}
B._$litElement$ = !0, B.finalized = !0, Qe.litElementHydrateSupport?.({ LitElement: B });
const Cn = Qe.litElementPolyfillSupport;
Cn?.({ LitElement: B });
(Qe.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const De = (e) => (t, n) => {
  n !== void 0 ? n.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const On = { attribute: !0, type: String, converter: $e, reflect: !1, hasChanged: Ze }, In = (e = On, t, n) => {
  const { kind: i, metadata: s } = n;
  let r = globalThis.litPropertyMetadata.get(s);
  if (r === void 0 && globalThis.litPropertyMetadata.set(s, r = /* @__PURE__ */ new Map()), i === "setter" && ((e = Object.create(e)).wrapped = !0), r.set(n.name, e), i === "accessor") {
    const { name: o } = n;
    return { set(a) {
      const d = t.get.call(this);
      t.set.call(this, a), this.requestUpdate(o, d, e, !0, a);
    }, init(a) {
      return a !== void 0 && this.C(o, void 0, e, a), a;
    } };
  }
  if (i === "setter") {
    const { name: o } = n;
    return function(a) {
      const d = this[o];
      t.call(this, a), this.requestUpdate(o, d, e, !0, a);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function Bn(e) {
  return (t, n) => typeof n == "object" ? In(e, t, n) : ((i, s, r) => {
    const o = s.hasOwnProperty(r);
    return s.constructor.createProperty(r, i), o ? Object.getOwnPropertyDescriptor(s, r) : void 0;
  })(e, t, n);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function $(e) {
  return Bn({ ...e, state: !0, attribute: !1 });
}
const Fn = { 1: "indoor", 2: "outdoor", 3: "gateway", 4: "door" };
function Rn(e, t) {
  if (t) return e >> 16 === 0 ? e >> 8 & 255 : null;
  if (e > 65535) return null;
  const n = e >> 8;
  return (n & 15) === 0 ? n >> 4 : null;
}
function et(e, t) {
  const n = Rn(e, t);
  return n !== null && Fn[n] || "unknown";
}
const Oe = (e, t) => et(e, t) === "indoor", Pn = (e, t) => et(e, t) === "outdoor";
function w(e, t) {
  return "0x" + e.toString(16).padStart(t ? 6 : 4, "0");
}
function Ie(e, t) {
  return e.toString(16).toUpperCase().padStart(t ? 6 : 4, "0");
}
function Z(e) {
  return "0x" + e.toString(16).padStart(2, "0");
}
function J(e) {
  return e.map((t) => t.toString(16).toUpperCase().padStart(2, "0")).join(" ");
}
const Mn = {
  indoor: "Innenstation",
  outdoor: "Außenstation",
  gateway: "Gateway",
  door: "Türsteuergerät",
  unknown: "Gerät"
};
function E(e, t) {
  const n = et(e, t), i = Mn[n], s = w(e, t);
  return n === "indoor" || n === "outdoor" ? `${i} #${e & 255} (${s})` : `${i} (${s})`;
}
function ve(e) {
  const { x10: t, x1: n } = e;
  if (!(t === void 0 || n === void 0) && !(!Number.isInteger(t) || !Number.isInteger(n) || t < 0 || t > 9 || n < 0 || n > 9))
    return t * 10 + n;
}
function ke(e, t) {
  return (t ? 256 : 4096) | e & 255;
}
function Ln(e, t) {
  return t ? [e >> 16 & 255, e >> 8 & 255, e & 255] : [e >> 8 & 255, e & 255];
}
function Nn(e, t) {
  e: for (let n = 0; n + t.length <= e.length; n++) {
    for (let i = 0; i < t.length; i++) if (e[n + i] !== t[i]) continue e;
    return !0;
  }
  return !1;
}
function Vt(e, t) {
  return Nn(e.data, Ln(t, e.threeByte));
}
function tt(e, t) {
  return e.src === t || e.dst === t || Vt(e, t);
}
const ne = 8, nt = [
  { key: "tor", name: "Tor", type: "outdoor", open: !0, default: !1, icon: "mdi:gate" },
  { key: "haustuer", name: "Haustür", type: "outdoor", open: !0, default: !0, icon: "mdi:door" },
  {
    key: "wohnung",
    name: "Wohnungstür",
    type: "floor",
    open: !1,
    default: !1,
    icon: "mdi:door-closed"
  }
], K = "baseline", C = (e) => `ring:${typeof e == "string" ? e : e.key}`, O = (e) => `open:${typeof e == "string" ? e : e.key}`;
function xe(e) {
  const t = e.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return t === "" ? "tuer" : /^[0-9]/.test(t) ? `tuer_${t}` : t;
}
function it(e, t) {
  let n = e;
  for (let i = 2; t.has(n); i++) n = `${e}_${i}`;
  return t.add(n), n;
}
function qt(e) {
  const t = /* @__PURE__ */ new Set(), n = {};
  for (const i of e) n[i.key] = it(i.id ? xe(i.id) : xe(i.name), t);
  return n;
}
function Hn(e) {
  return e === "floor" ? "mdi:door-closed" : "mdi:door";
}
function _e(e) {
  return e.icon ?? Hn(e.type);
}
function ae(e) {
  let t = !1;
  return e.map((n) => {
    const i = n.type === "outdoor" && n.open, s = i && n.default && !t;
    return s && (t = !0), { ...n, open: i, default: s };
  });
}
function Kn(e, t = "Neue Tür", n = "outdoor") {
  return { key: it(xe(t), new Set(e.map((s) => s.key))), name: t, type: n, open: n === "outdoor", default: !1 };
}
function $t(e) {
  if (!Array.isArray(e) || e.length === 0)
    throw new Error('"doors" muss eine Liste mit mindestens einer Tür sein.');
  if (e.length > ne) throw new Error(`Höchstens ${ne} Türen möglich.`);
  const t = /* @__PURE__ */ new Set(), n = e.map((i, s) => {
    if (typeof i != "object" || i === null || typeof i.name != "string" || i.name.trim() === "")
      throw new Error(`Tür ${s + 1}: "name" fehlt.`);
    const r = i.type ?? "outdoor";
    if (r !== "outdoor" && r !== "floor")
      throw new Error(`Tür "${i.name}": "type" muss outdoor (Außentür) oder floor (Etagenruf) sein.`);
    const o = i.name.trim(), a = {
      key: it(xe(typeof i.id == "string" ? i.id : o), t),
      name: o,
      type: r,
      open: r === "outdoor" && i.open !== !1,
      default: i.default === !0
    };
    return typeof i.id == "string" && i.id.trim() !== "" && (a.id = i.id.trim()), typeof i.icon == "string" && i.icon.trim() !== "" && (a.icon = i.icon.trim()), a;
  });
  if (n.filter((i) => i.default).length > 1) throw new Error('Nur eine Tür kann "default: true" haben.');
  return ae(n);
}
function jn(e) {
  if (!Array.isArray(e)) return;
  const t = /* @__PURE__ */ new Set(), n = [];
  for (const i of e.slice(0, ne)) {
    if (typeof i != "object" || i === null) continue;
    const s = i;
    if (typeof s.key != "string" || !/^[a-z0-9_]+$/.test(s.key) || t.has(s.key) || typeof s.name != "string" || s.type !== "outdoor" && s.type !== "floor") continue;
    t.add(s.key);
    const r = {
      key: s.key,
      name: s.name,
      type: s.type,
      open: s.open === !0,
      default: s.default === !0
    };
    typeof s.id == "string" && (r.id = s.id), typeof s.icon == "string" && (r.icon = s.icon), n.push(r);
  }
  return n.length > 0 ? ae(n) : void 0;
}
const Un = /\[\s*([0-9a-f]{4}|[0-9a-f]{6})\s*(»|Â»|>>|>)\s*([0-9a-f]{4}|[0-9a-f]{6})\s*\]/i, Wn = /^\s*,?\s*type\s*[:=]?\s*(?:0x)?([0-9a-f]{1,2})(?![0-9a-f])/i, Gn = /^\s*,?\s*data\s*[:=]?\s*(.*?)\s*$/i, Vn = /((?:[0-9a-f]{2}[.:\s]){2,}[0-9a-f]{2})\s*(?:\(\s*(\d+)\s*\))?\s*$/i;
function qn(e) {
  const t = e.trim();
  if (t === "") return [];
  const n = t.split(/[\s.,:;-]+/).filter((s) => s !== ""), i = [];
  for (let s of n) {
    if (s = s.replace(/^0x/i, ""), !/^[0-9a-f]+$/i.test(s)) return null;
    if (s.length <= 2)
      i.push(parseInt(s, 16));
    else if (s.length % 2 === 0)
      for (let r = 0; r < s.length; r += 2) i.push(parseInt(s.slice(r, r + 2), 16));
    else
      return null;
  }
  return i;
}
function Yt(e) {
  const t = (f) => ({ ok: !1, line: e, reason: f });
  if (typeof e != "string") return t("not a string");
  const n = Un.exec(e);
  if (!n) return t("no address block");
  const [, i, s, r] = n, o = e.slice(n.index + n[0].length), a = Wn.exec(o);
  if (!a) return t("no message type");
  const d = o.slice(a[0].length);
  let l = [];
  if (d.trim() !== "") {
    const f = Gn.exec(d);
    if (!f) return t("unexpected text after type");
    const b = qn(f[1]);
    if (!b) return t("invalid data bytes");
    l = b;
  }
  const h = {
    src: parseInt(i, 16),
    dst: parseInt(r, 16),
    type: parseInt(a[1], 16),
    data: l,
    threeByte: i.length === 6 || r.length === 6,
    retransmission: s !== ">"
  }, u = Vn.exec(e.slice(0, n.index));
  return u && (h.raw = u[1].toUpperCase().replace(/[:\s]/g, "."), u[2] !== void 0 && (h.rawLength = parseInt(u[2], 10))), { ok: !0, frame: h };
}
const wt = 1, Yn = 10, kt = 17, Zt = 13, Jt = 14, Me = 128, xt = [1, 129, 10, 17, 145], Zn = (e) => `Klingel „${e.name}“`, Le = (e) => `Öffnen „${e.name}“`, ie = (e, t) => e[t] ?? [], Ne = (e) => e.toString(16).toUpperCase().padStart(2, "0"), ye = (e) => `${e.src}|${e.dst}|${e.type}|${e.data.join(",")}`;
function Jn(e) {
  const t = (n) => n === void 0 ? "*" : n.toString(16);
  return `${Ne(e.type)}|${t(e.src)}|${t(e.dst)}|${e.data ? e.data.map(Ne).join("") : "*"}`;
}
function Ae(e, t) {
  let n = null;
  for (const i of e)
    (!n || i[1] > n[1] || i[1] === n[1] && t && t(i[0], n[0]) < 0) && (n = i);
  return n;
}
function j(e, t, n = 1) {
  e.set(t, (e.get(t) ?? 0) + n);
}
function Xn(e, t) {
  let n = 0;
  const i = {};
  for (const [s, r] of Object.entries(e.steps))
    i[s] = r.captures.map(
      (o) => o.lines.flatMap((a) => {
        n++;
        const d = Yt(a.line);
        return d.ok ? [d.frame] : (t.push(a.line), []);
      })
    );
  return { steps: i, total: n };
}
function Qn(e, t, n) {
  const i = /* @__PURE__ */ new Map();
  for (const d of t.filter((l) => l.open))
    for (const l of ie(e, O(d)))
      for (const h of l)
        (h.type === Zt || h.type === Jt) && Oe(h.src, h.threeByte) && j(i, h.src);
  const s = (d, l) => d === n ? -1 : l === n ? 1 : d - l, r = Ae(i, s);
  if (r) return { address: r[0], method: "open", count: r[1] };
  const o = /* @__PURE__ */ new Map();
  for (const d of Object.values(e))
    for (const l of d)
      for (const h of l)
        Oe(h.src, h.threeByte) && j(o, h.src), Oe(h.dst, h.threeByte) && h.dst !== h.src && j(o, h.dst);
  const a = Ae(o, s);
  return a ? { address: a[0], method: "frequency", count: a[1] } : null;
}
function ei(e, t, n) {
  const i = (s) => Pn(s, t.threeByte) ? s : void 0;
  return e === "floor" ? t.type === kt && t.src === n ? { type: t.type, src: t.src } : t.type === (kt | Me) && t.dst === n ? { type: t.type, dst: t.dst } : null : t.type === wt && t.dst === n ? { type: t.type, src: t.src, dst: t.dst, outdoor: i(t.src) } : t.type === (wt | Me) && t.src === n ? { type: t.type, src: t.src, dst: t.dst, outdoor: i(t.dst) } : t.type === Yn && Vt(t, n) ? { type: t.type, src: t.src, dst: t.dst, data: [...t.data], outdoor: i(t.src) } : null;
}
function ti(e, t) {
  return t.score - e.score || xt.indexOf(e.type) - xt.indexOf(t.type) || (e.key < t.key ? -1 : e.key > t.key ? 1 : 0);
}
function Xt(e, t, n) {
  const i = e.session.steps[t]?.skipped === !0;
  e.warnings.push({
    code: i ? "step_skipped" : "step_missing",
    severity: "info",
    step: t,
    message: `${n}: ${i ? "übersprungen" : "keine Aufnahme vorhanden"}.`
  });
}
function ni(e, t) {
  const n = C(t), i = Zn(t), s = ie(e.steps, n), r = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
  s.forEach((l, h) => {
    for (const u of l) {
      if (e.baseline.has(ye(u))) {
        e.stats.baselineFiltered++;
        continue;
      }
      if (!tt(u, e.indoor)) {
        e.stats.neighbourFiltered++;
        continue;
      }
      const f = ei(t.type, u, e.indoor);
      if (!f) {
        o.has(ye(u)) || o.set(ye(u), u);
        continue;
      }
      const b = Jn(f), p = r.get(b) ?? { match: f, in: /* @__PURE__ */ new Set() };
      p.in.add(h), r.set(b, p);
    }
  });
  const a = [...r].map(([l, { match: h, in: u }]) => ({
    key: l,
    ...h,
    occurrences: u.size,
    score: u.size / s.length,
    reliable: u.size === s.length
  }));
  a.sort(ti);
  let d = a.filter((l) => l.reliable);
  if (s.length === 0)
    Xt(e, n, i);
  else if (a.length === 0)
    e.warnings.push({
      code: "no_ring_candidates",
      severity: "warning",
      step: n,
      message: `${i}: keine passenden Frames gefunden (erwartet: ${t.type === "floor" ? "Typ 11/91" : "Typ 01/81/0A"} mit Bezug zu ${w(e.indoor, e.threeByte)}).`
    });
  else {
    if (d.length === 0) {
      const l = a[0].score;
      d = a.filter((h) => h.score === l), e.warnings.push({
        code: "unstable_candidates",
        severity: "warning",
        step: n,
        message: `${i}: kein Kandidat kam in allen ${s.length} Aufnahmen vor; verwende die besten (${Math.round(l * 100)} %).`
      });
    }
    s.length === 1 && e.warnings.push({
      code: "single_capture",
      severity: "info",
      step: n,
      message: `${i}: nur eine Aufnahme – Stabilität nicht prüfbar. 2–3 Wiederholungen empfohlen.`
    });
  }
  return {
    door: t.key,
    captures: s.length,
    candidates: a,
    selected: d,
    outdoorAddress: Qt(d),
    otherFrames: [...o.values()]
  };
}
function Qt(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) n.outdoor !== void 0 && j(t, n.outdoor);
  return Ae(t, (n, i) => n - i)?.[0];
}
function ii(e, t, n) {
  const i = t.filter((d) => d.type === "outdoor" && n[d.key].selected.length > 0), s = /* @__PURE__ */ new Map();
  for (const d of i) for (const l of n[d.key].selected) j(s, l.key);
  const r = new Set([...s].filter(([, d]) => d > 1).map(([d]) => d)), o = (d) => n[d.key].selected.filter((l) => !r.has(l.key));
  let a = 0;
  for (let d = 0; d < i.length; d++)
    for (let l = d + 1; l < i.length; l++) {
      const [h, u] = [i[d], i[l]], f = n[h.key], b = n[u.key], p = new Set(b.selected.map((x) => x.key)), g = f.selected.some((x) => p.has(x.key)), v = f.outdoorAddress !== void 0 && f.outdoorAddress === b.outdoorAddress;
      !v && !(g && (o(h).length === 0 || o(u).length === 0)) || (a++, e.warnings.push({
        code: "doors_indistinguishable",
        severity: "warning",
        message: `„${h.name}“ und „${u.name}“ nicht unterscheidbar: beide Klingeln erzeugen dieselben Frames` + (v ? ` (Außenstation ${w(f.outdoorAddress, e.threeByte)})` : "") + ". Beide Klingel-Sensoren würden gemeinsam auslösen."
      }));
    }
  if (!(a > 0 || r.size === 0)) {
    for (const d of i) {
      const l = n[d.key];
      l.selected = o(d), l.outdoorAddress = Qt(l.selected);
    }
    e.warnings.push({
      code: "shared_candidates_removed",
      severity: "info",
      message: `${r.size} Kandidat(en) kamen bei mehreren Türen vor und wurden nicht verwendet.`
    });
  }
}
function si(e, t) {
  const n = O(t), i = Le(t), s = ie(e.steps, n);
  if (s.length === 0)
    return Xt(e, n, i), null;
  const r = /* @__PURE__ */ new Map();
  s.forEach((p, g) => {
    for (const v of p) {
      if (v.src !== e.indoor || v.type !== Zt && v.type !== Jt) continue;
      const x = `${v.dst}|${v.type}|${v.data.join(",")}`, S = r.get(x) ?? { frame: v, in: /* @__PURE__ */ new Set() };
      S.in.add(g), r.set(x, S);
    }
  });
  let o;
  for (const p of r.values()) (!o || p.in.size > o.in.size) && (o = p);
  if (!o)
    return e.warnings.push({
      code: "no_open_frame",
      severity: "warning",
      step: n,
      message: `${i}: kein 0D/0E-Frame von ${w(e.indoor, e.threeByte)} gefunden.`
    }), null;
  r.size > 1 && e.warnings.push({
    code: "multiple_open_frames",
    severity: "info",
    step: n,
    message: `${i}: ${r.size} verschiedene Öffnen-Frames gefunden, verwende den häufigsten.`
  }), o.in.size < s.length && e.warnings.push({
    code: "unstable_open",
    severity: "warning",
    step: n,
    message: `${i}: Öffnen-Frame nur in ${o.in.size} von ${s.length} Aufnahmen.`
  });
  const { frame: a } = o, d = {
    door: t.key,
    captures: s.length,
    destination: a.dst,
    messageType: a.type,
    data: [...a.data],
    occurrences: o.in.size,
    score: o.in.size / s.length
  }, l = a.type | Me, h = [...o.in].map((p) => s[p].filter((g) => g.type === l)), u = h.some((p) => p.some((g) => g.dst === e.indoor)), f = /* @__PURE__ */ new Map();
  for (const p of h) {
    const g = new Set(p.filter((v) => !u || v.dst === e.indoor).map((v) => v.src));
    for (const v of g) j(f, v);
  }
  const b = f.has(a.dst) ? [a.dst, f.get(a.dst)] : Ae(f, (p, g) => p - g);
  return b ? d.confirmation = {
    source: b[0],
    messageType: l,
    occurrences: b[1],
    ...u ? { destination: e.indoor } : {}
  } : e.warnings.push({
    code: "no_confirmation",
    severity: "info",
    step: n,
    message: `${i}: keine Bestätigung (${Ne(l)}) gefunden – das Schloss meldet dann keinen Status.`
  }), d;
}
function ri(e) {
  return { door: e.key, captures: 0, candidates: [], selected: [], otherFrames: [] };
}
function oi(e, t = {}) {
  const n = [], { steps: i, total: s } = Xn(e, n), r = [], o = {
    totalLines: s,
    parsedFrames: s - n.length,
    unparsedLines: n,
    baselineFiltered: 0,
    neighbourFiltered: 0
  }, a = Object.values(i).flat(2), d = t.expectedApartment ?? ve(e.dials), l = a.filter((y) => y.threeByte).length * 2 > a.length, h = d !== void 0 ? ke(d, l) : void 0;
  n.length > 0 && r.push({
    code: "unparsed_lines",
    severity: "info",
    message: `${n.length} Zeile(n) konnten nicht als Frame gelesen werden.`
  });
  const u = t.indoorAddress ?? e.indoorAddress, f = u !== void 0 ? { address: u, method: "manual", count: 0 } : Qn(i, e.doors, h), b = {
    indoor: null,
    threeByte: l,
    rings: Object.fromEntries(e.doors.map((y) => [y.key, ri(y)])),
    opens: Object.fromEntries(e.doors.filter((y) => y.open).map((y) => [y.key, null])),
    warnings: r,
    stats: o
  };
  if (!f)
    return r.push({
      code: "no_indoor",
      severity: "error",
      message: "Keine Innenstationsadresse (10XX / 0001XX) gefunden. Wurden Frames aufgenommen?"
    }), b;
  const p = a.filter((y) => tt(y, f.address)), g = p.length > 0 ? p.some((y) => y.threeByte) : f.address > 65535 || l;
  f.method === "manual" && p.length === 0 && a.length > 0 && r.push({
    code: "manual_indoor_unseen",
    severity: "warning",
    message: `Die eingestellte Innenstation ${w(f.address, g)} kommt in keinem aufgenommenen Frame vor.`
  }), p.some((y) => y.threeByte !== g) && r.push({
    code: "mixed_address_length",
    severity: "warning",
    message: "Gemischte 2- und 3-Byte-Adressen gefunden – bitte Aufnahmen prüfen."
  }), b.threeByte = g;
  const v = { ...f };
  d !== void 0 && (v.expected = ke(d, g), v.matchesExpected = v.expected === f.address, v.matchesExpected || r.push({
    code: "indoor_mismatch",
    severity: "warning",
    message: `Ermittelte Innenstation ${w(f.address, g)} weicht von der erwarteten Adresse ${w(v.expected, g)} (Wohnung ${d}) ab. Drehregler prüfen.`
  })), f.method === "frequency" && r.push({
    code: "indoor_by_frequency",
    severity: "info",
    message: `Innenstation ${E(f.address, g)} nur anhand der Häufigkeit bestimmt (kein Öffnen-Frame aufgenommen).`
  }), b.indoor = v;
  const x = {
    session: e,
    steps: i,
    indoor: f.address,
    threeByte: g,
    baseline: new Set(ie(i, K).flat().map(ye)),
    warnings: r,
    stats: o
  };
  ie(i, K).length === 0 && r.push({
    code: "no_baseline",
    severity: "info",
    step: K,
    message: "Keine Baseline aufgenommen – Frames einer normalen Sprechverbindung können nicht ausgefiltert werden."
  });
  for (const y of e.doors) b.rings[y.key] = ni(x, y);
  ii(x, e.doors, b.rings);
  const S = e.doors.filter((y) => y.open);
  for (const y of S) b.opens[y.key] = si(x, y);
  for (let y = 0; y < S.length; y++)
    for (let de = y + 1; de < S.length; de++) {
      const ce = b.opens[S[y].key], le = b.opens[S[de].key];
      ce && le && ce.destination === le.destination && ce.messageType === le.messageType && J(ce.data) === J(le.data) && r.push({
        code: "same_open_frame",
        severity: "warning",
        message: `${Le(S[y])} und ${Le(S[de])} senden denselben Frame – beide Schlösser würden dieselbe Tür öffnen. Meist war der Ruf beim Drücken der Schlüssel-Taste schon abgelaufen, sodass die Standard-Tür geöffnet wurde: Aufnahme verwerfen und direkt nach dem Klingeln wiederholen (oder jemanden klingeln lassen).`
      });
    }
  return b;
}
var ai = Object.defineProperty, di = Object.getOwnPropertyDescriptor, st = (e, t, n, i) => {
  for (var s = i > 1 ? void 0 : i ? di(t, n) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (s = (i ? o(t, n, s) : o(s)) || s);
  return i && s && ai(t, n, s), s;
};
const en = "abb-welcome-wizard-card-editor", ci = [
  { name: "entity", required: !0, selector: { entity: { domain: "sensor" } } },
  { name: "title", selector: { text: {} } },
  {
    type: "grid",
    name: "",
    schema: [
      {
        name: "capture_seconds",
        selector: { number: { min: 2, max: 120, step: 1, mode: "box", unit_of_measurement: "s" } }
      },
      { name: "indoor_address", selector: { text: {} } }
    ]
  }
], li = {
  entity: "Debug-Textsensor des ESP32",
  title: "Titel (optional)",
  capture_seconds: "Aufnahmedauer",
  indoor_address: "Innenstationsadresse (optional)"
}, ui = {
  entity: "Der Sensor, der jeden Bus-Frame anzeigt, z. B. „Doorbell Intercom“.",
  indoor_address: "Nur nötig, wenn die automatische Erkennung danebenliegt, z. B. 0x1010."
};
let Se = class extends B {
  setConfig(e) {
    this.config = e;
  }
  onValueChanged(e) {
    e.stopPropagation();
    const t = { ...this.config, ...e.detail.value };
    for (const n of ["title", "indoor_address", "capture_seconds"])
      (t[n] === "" || t[n] === void 0 || t[n] === null) && delete t[n];
    this.config = t, this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config: t }, bubbles: !0, composed: !0 })
    );
  }
  render() {
    return this.config ? c`
      <ha-form
        .hass=${this.hass}
        .data=${this.config}
        .schema=${ci}
        .computeLabel=${(e) => li[e.name] ?? e.name}
        .computeHelper=${(e) => ui[e.name]}
        @value-changed=${this.onValueChanged}
      ></ha-form>
      <p style="color:var(--secondary-text-color);font-size:0.875rem;margin:12px 0 0">
        Die Türen (Namen, Öffner, Standard-Tür) richtest du direkt in der Karte auf der Startseite ein.
      </p>
    ` : m;
  }
};
st([
  $()
], Se.prototype, "hass", 2);
st([
  $()
], Se.prototype, "config", 2);
Se = st([
  De(en)
], Se);
const pi = /* @__PURE__ */ new Set(["", "unknown", "unavailable"]);
function tn(e, t) {
  if (e.event_type !== "state_changed" || e.data?.entity_id !== t) return null;
  const n = e.data.new_state?.state;
  return typeof n != "string" || pi.has(n.trim()) ? null : { time: e.time_fired || (/* @__PURE__ */ new Date()).toISOString(), line: n };
}
function ue(e) {
  if (typeof e == "number")
    return Number.isInteger(e) && e > 0 && e <= 16777215 ? e : void 0;
  if (typeof e != "string") return;
  const t = e.trim().replace(/^0x/i, "");
  if (/^([0-9a-f]{4}|[0-9a-f]{6})$/i.test(t))
    return parseInt(t, 16);
}
const rt = 6e3, X = 2e3;
function hi(e, t, n, i) {
  return n ? { step: e, phase: "armed", armedAt: i, lines: [] } : {
    step: e,
    phase: "recording",
    armedAt: i,
    startedAt: new Date(i).toISOString(),
    endsAt: i + t * 1e3,
    lines: []
  };
}
function fi(e, t, n, i) {
  return e.phase === "armed" ? {
    ...e,
    phase: "recording",
    startedAt: new Date(i).toISOString(),
    endsAt: i + n * 1e3,
    lines: [t]
  } : { ...e, lines: [...e.lines, t] };
}
function mi(e, t) {
  return e.phase === "recording" && e.endsAt !== void 0 && t >= e.endsAt && !e.missed;
}
function _t(e) {
  return { ...e, missed: !0, syncAfter: void 0 };
}
function At(e, t) {
  return e.missed ? { ...e, syncAfter: t + rt } : e;
}
function gi(e, t) {
  const n = e.phase === "armed" ? e.armedAt : Date.parse(e.startedAt ?? ""), i = e.endsAt !== void 0 ? Math.min(t, e.endsAt + X) : t;
  return { start: (Number.isNaN(n) ? e.armedAt : n) - X, end: i };
}
function bi(e, t) {
  const n = [...e];
  for (const i of t) {
    const s = Date.parse(i.time);
    n.some((r) => r.line === i.line && Math.abs(Date.parse(r.time) - s) < 1e3) || n.push(i);
  }
  return n.sort((i, s) => Date.parse(i.time) - Date.parse(s.time));
}
function vi(e, t, n, i) {
  let s = e;
  if (s.phase === "armed") {
    const a = t.find((d) => Date.parse(d.time) >= s.armedAt - X);
    if (a) {
      const d = Date.parse(a.time);
      s = { ...s, phase: "recording", startedAt: a.time, endsAt: d + n * 1e3 };
    }
  }
  if (s.phase === "recording") {
    const a = Date.parse(s.startedAt ?? "") - X, d = (s.endsAt ?? i) + X, l = t.filter((h) => {
      const u = Date.parse(h.time);
      return u >= a && u <= d;
    });
    s = { ...s, lines: bi(s.lines, l) };
  }
  const r = s.phase === "recording" && s.endsAt !== void 0 && i >= s.endsAt;
  return s.syncAfter !== void 0 && i >= s.syncAfter && (!r || i >= (s.endsAt ?? 0) + rt) ? { ...s, missed: !1, syncAfter: void 0 } : s;
}
function yi(e, t) {
  return (e?.[t] ?? []).flatMap((n) => {
    const i = tn(
      {
        event_type: "state_changed",
        time_fired: new Date((n.lc ?? n.lu) * 1e3).toISOString(),
        data: {
          entity_id: t,
          old_state: null,
          new_state: {
            entity_id: t,
            state: n.s,
            last_changed: "",
            last_updated: "",
            attributes: {}
          }
        }
      },
      t
    );
    return i ? [i] : [];
  });
}
async function nn(e, t, n, i) {
  return await e.sendMessagePromise({
    type: "history/history_during_period",
    start_time: new Date(n).toISOString(),
    end_time: new Date(i).toISOString(),
    entity_ids: t,
    include_start_time_state: !1,
    significant_changes_only: !1,
    minimal_response: !1,
    no_attributes: !0
  }) ?? {};
}
async function $i(e, t, n, i) {
  return yi(await nn(e, [t], n, i), t);
}
function wi(e) {
  const t = {};
  for (const [n, i] of Object.entries(e))
    for (const s of i) s.s === "on" && (t[n] = (s.lc ?? s.lu) * 1e3);
  return t;
}
const He = "abb-welcome-wizard-session", Ke = 2, ki = Object.freeze({ skipped: !1, captures: [] }), xi = {
  baseline: K,
  ring_gate: C("tor"),
  ring_house: C("haustuer"),
  ring_apartment: C("wohnung"),
  open_gate: O("tor"),
  open_house: O("haustuer")
};
function St(e, t = nt, n = /* @__PURE__ */ new Date()) {
  const i = n.toISOString();
  return {
    format: He,
    version: Ke,
    entity: e,
    createdAt: i,
    updatedAt: i,
    dials: {},
    doors: ae(t),
    steps: {}
  };
}
function z(e, t) {
  return e.steps[t] ?? ki;
}
function Te(e, t) {
  return { ...e, updatedAt: t.toISOString() };
}
function ot(e, t, n, i) {
  return Te({ ...e, steps: { ...e.steps, [t]: n(z(e, t)) } }, i);
}
function _i(e, t, n, i = /* @__PURE__ */ new Date()) {
  return ot(e, t, (s) => ({ skipped: !1, captures: [...s.captures, n] }), i);
}
function zt(e, t, n, i = /* @__PURE__ */ new Date()) {
  return ot(
    e,
    t,
    (s) => ({ ...s, captures: s.captures.filter((r, o) => o !== n) }),
    i
  );
}
function Ai(e, t, n, i = /* @__PURE__ */ new Date()) {
  return ot(e, t, (s) => ({ ...s, skipped: n }), i);
}
function Et(e, t, n = /* @__PURE__ */ new Date()) {
  const i = Te({ ...e }, n);
  return t === void 0 ? delete i.indoorAddress : i.indoorAddress = t, i;
}
function Si(e, t, n = /* @__PURE__ */ new Date()) {
  return Te({ ...e, dials: { ...t } }, n);
}
function q(e, t, n = /* @__PURE__ */ new Date()) {
  const i = ae(t), s = /* @__PURE__ */ new Set([K]);
  for (const o of i)
    s.add(C(o)), o.open && s.add(O(o));
  const r = Object.fromEntries(Object.entries(e.steps).filter(([o]) => s.has(o)));
  return Te({ ...e, doors: i, steps: r }, n);
}
function Dt(e, t) {
  return z(e, C(t)).captures.length + z(e, O(t)).captures.length;
}
function zi(e) {
  const t = e.doors.flatMap(
    (i) => i.open && !i.default ? [C(i), O(i)] : [C(i)]
  );
  let n;
  for (const i of t)
    for (const s of z(e, i).captures) {
      const r = Date.parse(s.endedAt);
      !Number.isNaN(r) && (n === void 0 || r > n) && (n = r);
    }
  return n === void 0 ? void 0 : new Date(n);
}
function sn(e) {
  return JSON.stringify(e, null, 2);
}
const N = (e) => typeof e == "object" && e !== null, pe = (e) => typeof e == "number" && Number.isInteger(e) ? e : void 0;
function Ei(e) {
  const t = Array.isArray(e.captures) ? e.captures : [];
  return {
    skipped: e.skipped === !0,
    captures: t.filter(N).map((n) => ({
      startedAt: String(n.startedAt ?? ""),
      endedAt: String(n.endedAt ?? ""),
      lines: (Array.isArray(n.lines) ? n.lines : []).filter(N).filter((i) => typeof i.line == "string").map((i) => ({ time: String(i.time ?? ""), line: i.line }))
    }))
  };
}
function rn(e) {
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    throw new Error("Datei ist kein gültiges JSON.");
  }
  if (!N(t) || t.format !== He)
    throw new Error("Datei ist keine ABB-Welcome-Wizard-Sitzung.");
  if (t.version !== 1 && t.version !== Ke)
    throw new Error(`Nicht unterstützte Sitzungsversion: ${String(t.version)}.`);
  if (typeof t.entity != "string") throw new Error("Sitzung ohne Entität.");
  const n = t.version === 1, i = !n && jn(t.doors) || ae(nt), s = {};
  for (const [a, d] of Object.entries(N(t.steps) ? t.steps : {})) {
    const l = n ? xi[a] : a;
    l && N(d) && (s[l] = Ei(d));
  }
  const r = N(t.dials) ? t.dials : {}, o = {
    format: He,
    version: Ke,
    entity: t.entity,
    createdAt: String(t.createdAt ?? ""),
    updatedAt: String(t.updatedAt ?? ""),
    dials: { station: pe(r.station), x10: pe(r.x10), x1: pe(r.x1) },
    doors: i,
    steps: s
  };
  return pe(t.indoorAddress) !== void 0 && (o.indoorAddress = t.indoorAddress), { ...q(o, i), updatedAt: o.updatedAt };
}
const Tt = 3, H = (e) => `„${e.name}“`;
function Di(e, t) {
  const n = e.type === "floor";
  return {
    id: C(e),
    kind: "ring",
    door: e,
    title: `Klingeln: ${e.name}`,
    short: e.name,
    icon: _e(e),
    todo: [
      "Auf „Aufnahme starten“ tippen – die Aufnahme beginnt erst, wenn der erste Frame ankommt.",
      n ? `Den Klingeltaster an ${H(e)} (Etagenruf) drücken.` : `Zu ${H(e)} gehen und einmal klingeln. Nicht abheben, nicht öffnen.`,
      "Für eine zuverlässige Erkennung 2–3 Mal wiederholen (jeweils neue Aufnahme)."
    ],
    why: n ? "Der Etagenruf ist direkt an die Innenstation angeschlossen. Sie meldet ihn mit Typ 11 auf dem Bus, die Antwort hat Typ 91." : "Frames, die in jeder Wiederholung auftauchen, sind zuverlässige Kandidaten für den Klingel-Sensor." + (t > 1 ? " Jede Außentür hat in der Regel eine eigene Außenstation – darüber werden die Türen unterschieden." : ""),
    repetitions: 3,
    waitForFrame: !0,
    needsPause: !1
  };
}
function Ct(e) {
  const t = {
    id: O(e),
    kind: "open",
    door: e,
    title: `Öffnen: ${e.name}`,
    short: `${e.name} öffnen`,
    icon: "mdi:key-variant",
    repetitions: 2,
    waitForFrame: !1
  };
  return e.default ? {
    ...t,
    todo: [
      "Einige Minuten nach dem letzten Klingeln warten.",
      "Auf „Aufnahme starten“ tippen.",
      `An der Innenstation die Schlüssel-Taste drücken – ${H(e)} wird dabei wirklich geöffnet.`
    ],
    why: `Ohne vorheriges Klingeln öffnet die Schlüssel-Taste die Standard-Außenstation (${H(e)}). Liegt das letzte Klingeln zu kurz zurück, würde sie noch die zuletzt rufende Tür öffnen.`,
    needsPause: !0
  } : {
    ...t,
    todo: [
      `An ${H(e)} klingeln – oder klingeln lassen. Allein: klingeln und zügig zur Innenstation gehen.`,
      "Erst an der Innenstation auf „Aufnahme starten“ tippen (das Klingeln muss nicht mit aufgenommen werden).",
      `Sofort die Schlüssel-Taste drücken, solange der Ruf noch aktiv ist – ${H(e)} wird dabei wirklich geöffnet.`
    ],
    why: "Nach einem Klingeln öffnet die Schlüssel-Taste die rufende Außenstation – aber nur, solange der Ruf an der Innenstation noch aktiv ist. Ist er schon abgelaufen, öffnet sie die Standard-Tür; die Auswertung warnt dann. Gesucht wird der Frame vom Typ 0D/0E deiner Innenstation und die Bestätigung 8D/8E.",
    needsPause: !1
  };
}
function Ti(e) {
  const t = e.filter((i) => i.type === "outdoor").length, n = e.filter((i) => i.open);
  return [
    {
      id: K,
      kind: "baseline",
      title: "Baseline: Sprechverbindung ohne Klingeln",
      short: "Baseline",
      icon: "mdi:phone-outline",
      todo: [
        "Auf „Aufnahme starten“ tippen.",
        "An der Innenstation ohne vorheriges Klingeln die Sprech- bzw. Lautsprecher-Taste drücken (oder Hörer abnehmen).",
        "Kurz warten und die Verbindung wieder beenden."
      ],
      why: "Frames, die schon bei einer normalen Sprechverbindung auftreten, eignen sich nicht als Klingel-Erkennung. Sie werden später von den Klingel-Aufnahmen abgezogen.",
      repetitions: 1,
      waitForFrame: !1,
      needsPause: !1
    },
    ...e.map((i) => Di(i, t)),
    // Doors opened after a doorbell first, the default door (needs a pause after ringing) last.
    ...n.filter((i) => !i.default).map(Ct),
    ...n.filter((i) => i.default).map(Ct)
  ];
}
const at = (e) => `abb-welcome-wizard-card:session:${e}`;
function Ci(e) {
  try {
    const t = window.localStorage.getItem(at(e));
    return t ? rn(t) : void 0;
  } catch {
    return;
  }
}
function Oi(e) {
  try {
    window.localStorage.setItem(at(e.entity), sn(e));
  } catch {
  }
}
function Ii(e) {
  try {
    window.localStorage.removeItem(at(e));
  } catch {
  }
}
const je = (e) => `abb-welcome-wizard-card:capture:${e}`;
function Ot(e, t) {
  try {
    t ? window.localStorage.setItem(je(e), JSON.stringify(t)) : window.localStorage.removeItem(je(e));
  } catch {
  }
}
function Bi(e) {
  try {
    const t = JSON.parse(window.localStorage.getItem(je(e)) ?? "null");
    if (t && typeof t.step == "string" && (t.phase === "armed" || t.phase === "recording") && typeof t.armedAt == "number" && Array.isArray(t.lines))
      return t;
  } catch {
  }
}
function It(e, t, n) {
  const i = URL.createObjectURL(new Blob([t], { type: n })), s = document.createElement("a");
  s.href = i, s.download = e, document.body.appendChild(s), s.click(), s.remove(), setTimeout(() => URL.revokeObjectURL(i), 1e3);
}
async function Fi(e) {
  try {
    return await navigator.clipboard.writeText(e), !0;
  } catch {
    const t = document.createElement("textarea");
    t.value = e, t.style.position = "fixed", t.style.opacity = "0", document.body.appendChild(t), t.select();
    let n = !1;
    try {
      n = document.execCommand("copy");
    } catch {
      n = !1;
    }
    return t.remove(), n;
  }
}
const Ri = Ye`
  :host {
    --wiz-accent: var(--primary-color, #03a9f4);
    --wiz-text: var(--primary-text-color, #212121);
    --wiz-muted: var(--secondary-text-color, #727272);
    --wiz-divider: var(--divider-color, rgba(0, 0, 0, 0.12));
    --wiz-surface: var(--secondary-background-color, rgba(127, 127, 127, 0.08));
    --wiz-ok: var(--success-color, #43a047);
    --wiz-warn: var(--warning-color, #ffa600);
    --wiz-error: var(--error-color, #db4437);
    --wiz-info: var(--info-color, #039be5);
    --wiz-radius: var(--ha-card-border-radius, 12px);
    --wiz-mono: var(--code-font-family, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
    display: block;
  }

  ha-card {
    overflow: hidden;
    color: var(--wiz-text);
  }

  .header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 16px 8px;
  }
  .header .title {
    flex: 1;
    min-width: 0;
  }
  .header h1 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 500;
    line-height: 1.3;
  }
  @media (max-width: 420px) {
    .header .header-icon {
      display: none;
    }
  }
  .header .subtitle {
    color: var(--wiz-muted);
    font-size: 0.875rem;
  }
  .header-icon {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--wiz-accent) 15%, transparent);
    color: var(--wiz-accent);
    flex: none;
  }

  /* Stepper */
  .stepper {
    display: flex;
    gap: 4px;
    padding: 8px 16px 12px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .stepper::-webkit-scrollbar {
    display: none;
  }
  .stepper button {
    all: unset;
    cursor: pointer;
    flex: 1 0 auto;
    min-width: 34px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-size: 0.7rem;
    color: var(--wiz-muted);
    text-align: center;
  }
  .stepper button:focus-visible .dot {
    outline: 2px solid var(--wiz-accent);
    outline-offset: 2px;
  }
  .stepper .dot {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 2px solid var(--wiz-divider);
    background: var(--card-background-color, transparent);
    --mdc-icon-size: 16px;
    transition:
      background 0.2s,
      border-color 0.2s;
  }
  .stepper .done .dot {
    border-color: var(--wiz-ok);
    color: var(--wiz-ok);
  }
  .stepper .skipped .dot {
    border-style: dashed;
  }
  .stepper .current {
    color: var(--wiz-text);
    font-weight: 500;
  }
  .stepper .current .dot {
    border-color: var(--wiz-accent);
    background: var(--wiz-accent);
    color: var(--text-primary-color, #fff);
  }
  .stepper .label {
    max-width: 72px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .progress {
    height: 3px;
    background: var(--wiz-divider);
  }
  .progress > div {
    height: 100%;
    background: var(--wiz-accent);
    transition: width 0.3s;
  }

  .content {
    padding: 16px;
    display: grid;
    gap: 16px;
  }
  h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  h3 {
    margin: 0 0 8px;
    font-size: 0.95rem;
    font-weight: 500;
  }
  p {
    margin: 0;
    line-height: 1.5;
  }
  .muted {
    color: var(--wiz-muted);
  }
  .small {
    font-size: 0.85rem;
  }
  ol.todo {
    margin: 0;
    padding-left: 1.4em;
    display: grid;
    gap: 6px;
    line-height: 1.45;
  }
  details {
    border-radius: 8px;
    background: var(--wiz-surface);
    padding: 8px 12px;
  }
  details summary {
    cursor: pointer;
    color: var(--wiz-muted);
    font-size: 0.875rem;
  }
  details[open] summary {
    margin-bottom: 6px;
  }

  /* Panels and callouts */
  .panel {
    border: 1px solid var(--wiz-divider);
    border-radius: var(--wiz-radius);
    padding: 12px;
    display: grid;
    gap: 10px;
  }
  .callout {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 0.875rem;
    line-height: 1.45;
    background: color-mix(in srgb, var(--callout-color) 12%, transparent);
    --mdc-icon-size: 20px;
  }
  .callout ha-icon {
    color: var(--callout-color);
    flex: none;
  }
  .callout.info {
    --callout-color: var(--wiz-info);
  }
  .callout.ok {
    --callout-color: var(--wiz-ok);
  }
  .callout.warning {
    --callout-color: var(--wiz-warn);
  }
  .callout.error {
    --callout-color: var(--wiz-error);
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 500;
    background: color-mix(in srgb, var(--badge-color, var(--wiz-muted)) 15%, transparent);
    color: var(--badge-color, var(--wiz-muted));
    white-space: nowrap;
    --mdc-icon-size: 14px;
  }
  .badge.ok {
    --badge-color: var(--wiz-ok);
  }
  .badge.warning {
    --badge-color: var(--wiz-warn);
  }
  .badge.error {
    --badge-color: var(--wiz-error);
  }
  .badge.accent {
    --badge-color: var(--wiz-accent);
  }

  /* Form */
  .fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
    gap: 8px;
  }
  label.field {
    display: grid;
    gap: 4px;
    font-size: 0.75rem;
    color: var(--wiz-muted);
  }
  input[type='number'],
  input[type='text'] {
    font: inherit;
    font-size: 1rem;
    color: var(--wiz-text);
    background: var(--wiz-surface);
    border: 1px solid var(--wiz-divider);
    border-radius: 8px;
    padding: 8px 10px;
    min-width: 0;
  }
  input:focus {
    outline: 2px solid var(--wiz-accent);
    outline-offset: -1px;
  }
  input.invalid {
    border-color: var(--wiz-error);
  }
  .switch {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 0.875rem;
    cursor: pointer;
  }

  /* Export */
  .segmented {
    display: inline-flex;
    border: 1px solid var(--wiz-divider);
    border-radius: 999px;
    padding: 2px;
    gap: 2px;
    justify-self: start;
    flex-wrap: wrap;
  }
  .segmented button {
    font: inherit;
    font-size: 0.85rem;
    border: none;
    background: transparent;
    color: var(--wiz-text);
    padding: 6px 14px;
    border-radius: 999px;
    cursor: pointer;
  }
  .segmented button.active {
    background: var(--wiz-accent);
    color: var(--text-primary-color, #fff);
  }
  .segmented button:focus-visible {
    outline: 2px solid var(--wiz-accent);
    outline-offset: 1px;
  }
  .device-fields {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }
  .device-fields label.field span {
    font-size: 0.7rem;
  }

  /* Door editor */
  .doors {
    display: grid;
    gap: 8px;
  }
  .door-row {
    display: grid;
    gap: 6px;
    padding: 8px;
    border-radius: 8px;
    background: var(--wiz-surface);
  }
  .door-main {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .door-main ha-icon {
    color: var(--wiz-muted);
    flex: none;
  }
  .door-main input {
    flex: 1;
    background: var(--card-background-color, transparent);
  }
  .door-options {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 16px;
    padding-left: 32px;
  }
  select {
    font: inherit;
    font-size: 0.875rem;
    color: var(--wiz-text);
    background: var(--card-background-color, transparent);
    border: 1px solid var(--wiz-divider);
    border-radius: 8px;
    padding: 6px 8px;
    max-width: 100%;
  }
  .switch:has(input:disabled) {
    opacity: 0.5;
  }

  /* Buttons */
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }
  button.btn {
    font: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 36px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid var(--wiz-divider);
    background: transparent;
    color: var(--wiz-accent);
    cursor: pointer;
    --mdc-icon-size: 18px;
    transition:
      background 0.15s,
      opacity 0.15s;
  }
  button.btn:hover {
    background: color-mix(in srgb, var(--wiz-accent) 8%, transparent);
  }
  button.btn:focus-visible {
    outline: 2px solid var(--wiz-accent);
    outline-offset: 2px;
  }
  button.btn.primary {
    background: var(--wiz-accent);
    border-color: var(--wiz-accent);
    color: var(--text-primary-color, #fff);
  }
  button.btn.primary:hover {
    background: color-mix(in srgb, var(--wiz-accent) 85%, black);
  }
  button.btn.large {
    min-height: 44px;
    padding: 0 20px;
    font-size: 0.95rem;
  }
  button.btn.text {
    border-color: transparent;
  }
  button.btn.danger {
    color: var(--wiz-error);
  }
  button.btn:disabled {
    opacity: 0.4;
    cursor: default;
  }
  button.icon {
    all: unset;
    cursor: pointer;
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: var(--wiz-muted);
    --mdc-icon-size: 20px;
  }
  button.icon:disabled {
    opacity: 0.3;
    cursor: default;
  }
  button.icon:hover {
    background: var(--wiz-surface);
  }
  button.icon:focus-visible {
    outline: 2px solid var(--wiz-accent);
  }

  /* Capture */
  .capture {
    display: flex;
    gap: 16px;
    align-items: center;
  }
  .ring {
    position: relative;
    width: 72px;
    height: 72px;
    flex: none;
  }
  .ring svg {
    transform: rotate(-90deg);
  }
  .ring circle {
    fill: none;
    stroke-width: 6;
  }
  .ring .track {
    stroke: var(--wiz-divider);
  }
  .ring .bar {
    stroke: var(--wiz-accent);
    stroke-linecap: round;
    transition: stroke-dashoffset 0.25s linear;
  }
  .ring .value {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-size: 1.3rem;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }
  .pulse {
    width: 72px;
    height: 72px;
    flex: none;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: var(--wiz-accent);
    background: color-mix(in srgb, var(--wiz-accent) 15%, transparent);
    animation: pulse 1.6s ease-in-out infinite;
    --mdc-icon-size: 32px;
  }
  @keyframes pulse {
    50% {
      box-shadow: 0 0 0 10px color-mix(in srgb, var(--wiz-accent) 0%, transparent);
      background: color-mix(in srgb, var(--wiz-accent) 25%, transparent);
    }
    0%,
    100% {
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--wiz-accent) 35%, transparent);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .pulse {
      animation: none;
    }
  }
  .reps {
    display: flex;
    gap: 6px;
    align-items: center;
  }
  .reps span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--wiz-divider);
  }
  .reps span.filled {
    background: var(--wiz-ok);
  }

  /* Lists */
  .captures {
    display: grid;
    gap: 6px;
  }
  .capture-row {
    border-radius: 8px;
    background: var(--wiz-surface);
  }
  .capture-row summary {
    list-style: none;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 6px 6px 12px;
    cursor: pointer;
    color: var(--wiz-text);
  }
  .capture-row summary::-webkit-details-marker {
    display: none;
  }
  .capture-row summary .grow {
    flex: 1;
  }
  .capture-row .frames {
    padding: 0 8px 8px;
  }

  .frames {
    display: grid;
    gap: 2px;
    max-height: 260px;
    overflow-y: auto;
    font-family: var(--wiz-mono);
    font-size: 0.78rem;
  }
  .frame {
    display: grid;
    grid-template-columns: auto auto 1fr;
    gap: 8px;
    align-items: baseline;
    padding: 3px 6px;
    border-radius: 6px;
  }
  .frame .time {
    color: var(--wiz-muted);
  }
  .frame .route {
    white-space: nowrap;
  }
  .frame .detail {
    overflow-wrap: anywhere;
  }
  .frame.own {
    background: color-mix(in srgb, var(--wiz-accent) 10%, transparent);
  }
  .frame.foreign {
    opacity: 0.55;
  }
  .frame.unparsed {
    color: var(--wiz-warn);
  }
  .frame .type {
    font-weight: 600;
  }
  .empty {
    color: var(--wiz-muted);
    font-size: 0.85rem;
    padding: 8px 0;
    text-align: center;
  }
  .live-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--wiz-ok);
    display: inline-block;
  }
  .live-dot.off {
    background: var(--wiz-muted);
  }

  /* Results */
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
  }
  .stat {
    display: grid;
    gap: 2px;
  }
  .stat .value {
    font-size: 1.3rem;
    font-weight: 500;
    font-family: var(--wiz-mono);
  }
  .row-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 8px;
  }
  .row-head .spacer {
    flex: 1;
  }
  .result-row {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 10px;
    align-items: start;
    padding: 10px 0;
    border-top: 1px solid var(--wiz-divider);
  }
  .result-row:first-of-type {
    border-top: none;
  }
  .result-row > ha-icon {
    color: var(--wiz-muted);
    margin-top: 2px;
  }
  .candidates {
    display: grid;
    gap: 4px;
    margin-top: 6px;
  }
  .candidate {
    display: grid;
    grid-template-columns: 1fr 64px;
    gap: 8px;
    align-items: center;
    font-size: 0.8rem;
  }
  .candidate code {
    font-family: var(--wiz-mono);
    overflow-wrap: anywhere;
  }
  .candidate.unselected {
    opacity: 0.55;
  }
  .meter {
    height: 6px;
    border-radius: 3px;
    background: var(--wiz-divider);
    overflow: hidden;
  }
  .meter > div {
    height: 100%;
    background: var(--wiz-ok);
  }
  .meter.partial > div {
    background: var(--wiz-warn);
  }
  .kv {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 2px 12px;
    font-size: 0.85rem;
  }
  .kv dt {
    color: var(--wiz-muted);
  }
  .kv dd {
    margin: 0;
    font-family: var(--wiz-mono);
  }
  pre.yaml {
    margin: 0;
    padding: 12px;
    border-radius: 8px;
    background: var(--code-editor-background-color, var(--wiz-surface));
    font-family: var(--wiz-mono);
    font-size: 0.75rem;
    line-height: 1.5;
    max-height: 420px;
    overflow: auto;
    white-space: pre;
  }

  .footer {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 12px 16px 16px;
    border-top: 1px solid var(--wiz-divider);
  }
  .footer .spacer {
    flex: 1;
  }
  .toast {
    font-size: 0.85rem;
    color: var(--wiz-ok);
  }
  input[type='file'] {
    display: none;
  }
`, U = {
  name: "abb-welcome-demo",
  friendlyName: "ABB Welcome Demo",
  debugSensorName: "Doorbell Intercom",
  board: "esp32dev"
};
function Bt(e) {
  return e.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || U.name;
}
const Pi = ["wifi_ssid", "wifi_password", "api_encryption_key", "ota_password", "ap_password"];
function on(e) {
  const t = qt(e);
  return e.map((n) => ({
    door: n,
    id: `klingel_${t[n.key]}`,
    name: `Klingel ${n.name}`,
    icon: "mdi:bell"
  }));
}
function an(e) {
  const t = qt(e);
  return e.filter((n) => n.open).map((n) => ({ door: n, id: t[n.key], name: n.name, icon: _e(n) }));
}
const Ue = "TÜRCODE – nicht öffentlich teilen!";
class Mi {
  constructor() {
    this.lines = [];
  }
  line(t, n = "") {
    return this.lines.push(n === "" ? "" : " ".repeat(t) + n), this;
  }
  comment(t, n) {
    return this.line(t, `# ${n.replace(/[\r\n]+/g, " ")}`.trimEnd());
  }
  toString() {
    return this.lines.join(`
`) + `
`;
  }
}
function he(e) {
  return `"${e.replace(/[\r\n]+/g, " ").replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
function We(e) {
  return e.toString(16).toUpperCase().padStart(2, "0");
}
function Li(e, t) {
  const n = [`(x.get_message_type() == ${Z(e.type)})`];
  e.src !== void 0 && n.push(`(x.get_source_address() == ${w(e.src, t)})`), e.dst !== void 0 && n.push(`(x.get_destination_address() == ${w(e.dst, t)})`);
  let i = "";
  return e.data !== void 0 && (i = `std::vector<uint8_t> d = {${e.data.map(Z).join(", ")}}; `, n.push("(x.get_data() == d)")), `'${i}return ${n.join(" && ")};'`;
}
function Ni(e, t, n) {
  let i = `Typ ${We(e.type)}`;
  return e.src !== void 0 && e.dst !== void 0 ? i += `: ${E(e.src, n)} > ${E(e.dst, n)}` : e.src !== void 0 ? i += `, Quelle: ${E(e.src, n)}` : e.dst !== void 0 && (i += `, Ziel: ${E(e.dst, n)}`), e.data !== void 0 && (i += `, Data: ${e.data.map((s) => We(s)).join(" ")}`), `${i} (${e.occurrences}/${t} Aufnahmen)`;
}
function R(e, t, n, i, s) {
  e.line(t, `- ${n}.template.publish:`), e.line(t + 4, `id: ${i}`), e.line(t + 4, `state: ${s}`);
}
function Ft(e, t, n, i) {
  R(e, t, "lock", n, "UNLOCKING"), e.line(t, `- delay: ${i}s`), R(e, t, "lock", n, "LOCKED");
}
function Hi(e, t, n) {
  const { indoor: i, threeByte: s } = t;
  if (e.comment(0, "ABB-Welcome Wizard – generierte ESPHome-Konfiguration"), i) {
    const o = n.apartment !== void 0 ? `, Wohnung ${n.apartment}` : "";
    e.comment(0, `Innenstation: ${w(i.address, s)}${o}`);
  }
  e.comment(0, `Adresslänge: ${s ? "3 Byte (three_byte_address: true)" : "2 Byte"}`), e.comment(0, ""), n.device ? (e.comment(0, "Komplette Gerätekonfiguration auf Basis der ABB-Welcome-Demo-Firmware (Mat931)."), e.comment(0, `Im ESPHome Device Builder den Inhalt von ${n.device.name}.yaml hierdurch ersetzen.`), e.comment(0, "WICHTIG: esphome.name muss zum bestehenden Gerät passen – sonst ist es per OTA und"), e.comment(0, "in Home Assistant nicht mehr erreichbar."), e.comment(0, ""), e.comment(0, `Benötigt in secrets.yaml: ${Pi.join(", ")}.`), e.comment(0, "Den API-Schlüssel aus der bisherigen Konfiguration übernehmen, sonst muss das Gerät in"), e.comment(0, "Home Assistant neu verbunden werden. Scheitert das Hochladen am OTA-Passwort, den"), e.comment(0, "ota-Abschnitt aus der bisherigen Datei übernehmen.")) : (e.comment(0, "Diese Abschnitte ersetzen die gleichnamigen Abschnitte der Demo-Firmware:"), e.comment(0, "esphome.on_boot, remote_receiver.on_abbwelcome, binary_sensor und lock."), e.comment(0, "Alle übrigen Einstellungen (wifi, api, ota, remote_transmitter, Pins von"), e.comment(0, "remote_receiver, text_sensor ...) unverändert lassen."), e.comment(0, ""), e.comment(0, "Voraussetzung (in der Demo-Firmware bereits gesetzt):"), e.comment(0, "esp32:"), e.comment(0, "  framework:"), e.comment(0, "    type: esp-idf")), Object.values(t.opens).some((o) => o !== null) && (e.comment(0, ""), e.comment(
    0,
    n.maskDoorCode ? "Türcodes sind durch Platzhalter ersetzt – vor dem Flashen die echten Werte eintragen!" : `ACHTUNG: "data" der Öffnen-Befehle ist euer ${Ue}`
  ));
  const r = t.warnings.filter((o) => o.severity !== "info");
  if (r.length > 0) {
    e.comment(0, "");
    for (const o of r) e.comment(0, `${o.severity === "error" ? "FEHLER" : "Warnung"}: ${o.message}`);
  }
  e.line(0);
}
function Ki(e, t, n = {}) {
  const i = new Mi(), { indoor: s, threeByte: r } = e, o = n.device ? { ...U, ...n.device } : void 0, a = o || n.debugSensorId === void 0 ? "doorbell_intercom" : n.debugSensorId, d = n.unlockSeconds ?? 3;
  if (Hi(i, e, n), !s)
    return i.comment(0, "Keine Innenstationsadresse ermittelt – es kann keine Konfiguration erzeugt werden."), i.toString();
  const l = on(t), h = an(t), u = l.filter((p) => (e.rings[p.door.key]?.selected.length ?? 0) > 0), f = h.map((p) => ({ ...p, open: e.opens[p.door.key] ?? null })).filter((p) => p.open !== null), b = [
    ...l.filter((p) => !u.includes(p)).map((p) => p.name),
    ...h.filter((p) => !e.opens[p.door.key]).map((p) => `Öffnen ${p.name}`)
  ];
  if (o && (i.line(0, "esp32:"), i.line(2, `board: ${o.board}`), i.line(2, "framework:"), i.line(4, "type: esp-idf"), i.comment(4, "sdkconfig_options:"), i.comment(4, "  CONFIG_FREERTOS_UNICORE: y # nur bei Single-Core-ESP32 nötig"), i.line(0)), o || u.length + f.length > 0) {
    if (i.line(0, "esphome:"), o && (i.line(2, `name: ${o.name}`), i.line(2, `friendly_name: ${he(o.friendlyName)}`)), u.length + f.length > 0) {
      i.line(2, "on_boot:");
      for (const p of u) R(i, 4, "binary_sensor", p.id, "OFF");
      for (const p of f) R(i, 4, "lock", p.id, "LOCKED");
    }
    i.line(0);
  }
  o && ji(i), i.line(0, "remote_receiver:"), o ? Ui(i) : i.comment(2, "pin, dump, filter, tolerance, idle, buffer_size ... aus der bestehenden Konfiguration"), i.line(2, "on_abbwelcome:"), i.line(4, "then:"), a && (i.comment(6, "Debug-Textsensor (id ggf. an eure Firmware anpassen)"), i.line(6, `- lambda: 'char buf[192]; x.format_to(buf, 192); id(${a}).publish_state(buf);'`));
  for (const p of u) {
    const g = e.rings[p.door.key], v = g.outdoorAddress !== void 0 ? ` – ${E(g.outdoorAddress, r)}` : "";
    i.comment(6, `${p.name}${v}`), i.line(6, "- if:"), i.line(10, "condition:"), i.line(12, "or:");
    for (const x of g.selected)
      i.comment(14, Ni(x, g.captures, r)), i.line(14, `- lambda: ${Li(x, r)}`);
    i.line(10, "then:"), R(i, 12, "binary_sensor", p.id, "ON"), R(i, 12, "binary_sensor", p.id, "OFF");
  }
  for (const p of f) {
    const g = p.open.confirmation;
    g && (i.comment(6, `${p.name} geöffnet (Bestätigung Typ ${We(g.messageType)})`), i.line(6, "- if:"), i.line(10, "condition:"), i.line(12, "and:"), i.line(14, `- lambda: 'return (x.get_message_type() == ${Z(g.messageType)});'`), i.line(
      14,
      `- lambda: 'return (x.get_source_address() == ${w(g.source, r)});'`
    ), g.destination !== void 0 && i.line(
      14,
      `- lambda: 'return (x.get_destination_address() == ${w(g.destination, r)});'`
    ), i.line(10, "then:"), Ft(i, 12, p.id, d));
  }
  if (b.length > 0 && i.comment(6, `Nicht ermittelt: ${b.join(", ")}`), i.line(0), u.length > 0) {
    i.line(0, "binary_sensor:");
    for (const p of u)
      i.line(2, "- platform: template"), i.line(4, `name: ${he(p.name)}`), i.line(4, `id: ${p.id}`), i.line(4, `icon: ${p.icon}`), i.line(4, "filters:"), i.line(6, "- delayed_off: 1s");
    i.line(0);
  }
  if (o && (i.line(0, "sensor:"), i.line(2, "- platform: internal_temperature"), i.line(4, 'name: "Internal Temperature"'), i.line(0), i.line(0, "text_sensor:"), i.line(2, "- platform: template"), i.line(
    4,
    `name: ${he(o.debugSensorName ?? U.debugSensorName)} # Debug-Sensor für diese Karte`
  ), i.line(4, "id: doorbell_intercom"), i.line(4, "icon: mdi:bell-circle"), i.line(4, "update_interval: never"), i.line(0)), f.length > 0) {
    i.line(0, "lock:");
    for (const p of f) {
      const { open: g } = p, v = n.maskDoorCode ? g.data.map(() => 0) : g.data;
      i.line(2, "- platform: template"), i.line(4, `name: ${he(p.name)}`), i.line(4, `id: ${p.id}`), i.line(4, `icon: ${p.icon}`), i.line(4, "lock_action:"), R(i, 6, "lock", p.id, "LOCKED"), i.line(4, "unlock_action:"), i.line(6, "- remote_transmitter.transmit_abbwelcome:"), i.line(10, `source_address: ${w(s.address, r)} # Innenstation`), i.line(
        10,
        `destination_address: ${w(g.destination, r)} # ${E(g.destination, r)}`
      ), i.line(10, `three_byte_address: ${r}`), i.line(
        10,
        `message_type: ${Z(g.messageType)} # ${g.messageType === 14 ? "Schiebetür" : "Türöffner"}`
      );
      const x = n.maskDoorCode ? `PLATZHALTER: ${v.length} Byte ${Ue}` : Ue;
      i.line(10, `data: [${v.map(Z).join(", ")}] # ${x}`), g.confirmation || (i.comment(6, "Keine Bestätigung vom Bus aufgenommen – Status wird nur angenommen"), Ft(i, 6, p.id, d));
    }
  }
  return o && (f.length > 0 && i.line(0), i.line(0, "button:"), i.line(2, "- platform: restart"), i.line(4, 'name: "Reboot"'), i.line(2, "- platform: safe_mode"), i.line(4, 'name: "Reboot (Safe Mode)"'), i.line(0), i.line(0, "status_led:"), i.line(2, "pin:"), i.line(4, "number: GPIO2"), i.line(4, "ignore_strapping_warning: true")), i.toString();
}
function ji(e) {
  e.line(0, "wifi:"), e.line(2, "ssid: !secret wifi_ssid"), e.line(2, "password: !secret wifi_password"), e.line(2, "ap:"), e.line(4, "password: !secret ap_password"), e.line(0), e.line(0, "captive_portal:"), e.line(0), e.line(0, "logger:"), e.line(0), e.line(0, "api:"), e.line(2, "encryption:"), e.line(4, "key: !secret api_encryption_key"), e.line(2, "batch_delay: 0ms # jeden Bus-Frame einzeln an Home Assistant senden"), e.line(0), e.line(0, "ota:"), e.line(2, "- platform: esphome"), e.line(4, "password: !secret ota_password"), e.line(0), e.line(0, "remote_transmitter:"), e.line(2, "pin: GPIO26"), e.line(2, "carrier_duty_percent: 100%"), e.line(2, "non_blocking: true"), e.line(0);
}
function Ui(e) {
  e.line(2, "pin:"), e.line(4, "number: GPIO25"), e.line(4, "mode:"), e.line(6, "input: true"), e.line(2, "dump: [abbwelcome]"), e.line(2, "filter: 8us"), e.line(2, "tolerance:"), e.line(4, "type: time"), e.line(4, "value: 26us"), e.line(2, "idle: 1500us"), e.line(2, "buffer_size: 15kB"), e.line(2, "rmt_symbols: 320"), e.line(2, "clock_resolution: 500000");
}
var Wi = Object.defineProperty, Gi = Object.getOwnPropertyDescriptor, _ = (e, t, n, i) => {
  for (var s = i > 1 ? void 0 : i ? Gi(t, n) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (s = (i ? o(t, n, s) : o(s)) || s);
  return i && s && Wi(t, n, s), s;
};
const se = "abb-welcome-wizard-card", Vi = "0.6.0", Rt = 10, qi = 40, Yi = 900 * 1e3, Zi = {
  info: "mdi:information-outline",
  warning: "mdi:alert-outline",
  error: "mdi:alert-circle-outline"
};
function Be(e) {
  const t = new Date(e);
  return Number.isNaN(t.getTime()) ? "--:--:--" : t.toLocaleTimeString("de-DE", { hour12: !1 });
}
const fe = (e) => e.toString(16).toUpperCase().padStart(2, "0");
let k = class extends B {
  constructor() {
    super(...arguments), this.page = 0, this.live = [], this.capture = null, this.now = Date.now(), this.toast = "", this.maskDoorCode = !1, this.showDoorCode = !1, this.exportMode = "full", this.deviceEdits = {}, this.indoorInput = "", this.receivedCount = 0, this.syncing = !1, this.lastSyncAt = 0, this.syncFailed = !1, this.onVisibilityChange = () => {
      this.capture && (this.capture = document.visibilityState === "hidden" ? _t(this.capture) : At(this.capture, Date.now()));
    };
  }
  // ---- Lovelace API --------------------------------------------------------------------------------
  static getConfigElement() {
    return document.createElement(en);
  }
  static getStubConfig(e) {
    return { entity: Object.keys(e?.states ?? {}).filter(
      (n) => n.startsWith("sensor.") && /intercom|abb|welcome|frame|doorbell/i.test(n)
    )[0] ?? "sensor.doorbell_intercom", capture_seconds: Rt };
  }
  setConfig(e) {
    if (!e || typeof e.entity != "string" || !e.entity.includes("."))
      throw new Error('Bitte "entity" auf den Debug-Textsensor setzen, z. B. sensor.doorbell_intercom.');
    if (e.capture_seconds !== void 0 && (typeof e.capture_seconds != "number" || e.capture_seconds < 2 || e.capture_seconds > 120))
      throw new Error('"capture_seconds" muss eine Zahl zwischen 2 und 120 sein.');
    if (e.indoor_address !== void 0 && ue(e.indoor_address) === void 0)
      throw new Error('"indoor_address" muss eine Adresse wie 0x1010 oder 0x000110 sein.');
    e.doors !== void 0 && $t(e.doors);
    const t = this.config?.entity !== e.entity;
    this.config = e, t && (this.resubscribe(), this.session = Ci(e.entity) ?? St(e.entity, this.configDoors), this.indoorInput = this.session.indoorAddress !== void 0 ? w(this.session.indoorAddress, this.session.indoorAddress > 65535) : "", this.live = [], this.capture = null, this.resumeCapture(e.entity));
  }
  getCardSize() {
    return 10;
  }
  set hass(e) {
    const t = !this._hass, n = this.online;
    this._hass = e, this.capture && n !== this.online && (this.capture = this.online ? At(this.capture, Date.now()) : _t(this.capture)), t && this.subscribe(), this.requestUpdate();
  }
  get hass() {
    return this._hass;
  }
  get online() {
    return this._hass?.connected !== !1;
  }
  connectedCallback() {
    super.connectedCallback(), this.subscribe(), document.addEventListener("visibilitychange", this.onVisibilityChange);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), document.removeEventListener("visibilitychange", this.onVisibilityChange), this.unsubscribeEvents(), this.stopTimer();
  }
  updated(e) {
    this.session && this.page > this.resultPage && (this.page = this.resultPage), e.has("page") && e.get("page") !== void 0 && this.renderRoot.querySelector(".stepper .current")?.scrollIntoView?.({ block: "nearest", inline: "center", behavior: "smooth" }), e.has("capture") && (this.capture ? this.startTimer() : this.stopTimer(), this.config && Ot(this.config.entity, this.capture));
  }
  // ---- Event subscription (read-only: the card never calls services or sends frames) ---------------
  subscribe() {
    this.unsubscribe || !this._hass?.connection || !this.config || !this.isConnected || (this.unsubscribe = this._hass.connection.subscribeEvents((e) => this.onStateChanged(e), "state_changed").catch((e) => {
      console.error(`${se}: subscribing to state_changed failed`, e), this.unsubscribe = void 0;
    }));
  }
  unsubscribeEvents() {
    const e = this.unsubscribe;
    this.unsubscribe = void 0, e?.then((t) => t?.()).catch(() => {
    });
  }
  resubscribe() {
    this.unsubscribeEvents(), this.subscribe();
  }
  onStateChanged(e) {
    if (!this.config) return;
    const t = tn(e, this.config.entity);
    t && (this.receivedCount++, this.live = [t, ...this.live].slice(0, qi), this.capture && (this.capture = fi(this.capture, t, this.captureSeconds, Date.now())));
  }
  // ---- Capture -------------------------------------------------------------------------------------
  get captureSeconds() {
    return this.config?.capture_seconds ?? Rt;
  }
  startTimer() {
    this.timer === void 0 && (this.timer = window.setInterval(() => {
      this.now = Date.now(), this.capture && (this.capture.missed ? this.syncFromHistory() : mi(this.capture, this.now) && this.finishCapture());
    }, 250));
  }
  stopTimer() {
    this.timer !== void 0 && window.clearInterval(this.timer), this.timer = void 0;
  }
  beginCapture(e) {
    const t = this.currentStep;
    t && (this.now = Date.now(), this.syncFailed = !1, this.capture = hi(t.id, this.captureSeconds, e, this.now));
  }
  /** Fill in frames missed while offline from the recorder history (read-only). */
  async syncFromHistory() {
    const e = this.capture, t = Date.now();
    if (!(!e?.missed || e.syncAfter === void 0 || !this.online || !this._hass?.connection || !this.config || this.syncing || t - this.lastSyncAt < 2e3)) {
      this.syncing = !0, this.lastSyncAt = t;
      try {
        const { start: n, end: i } = gi(e, t), s = await $i(this._hass.connection, this.config.entity, n, i);
        this.capture?.armedAt === e.armedAt && (this.capture = vi(this.capture, s, this.captureSeconds, Date.now()));
      } catch (n) {
        console.warn(`${se}: reading history failed`, n), this.capture?.armedAt === e.armedAt && !this.syncFailed && (this.syncFailed = !0, this.capture = { ...this.capture, missed: !1, syncAfter: void 0 }, this.showToast("Verpasste Frames konnten nicht aus dem Verlauf geladen werden."));
      } finally {
        this.syncing = !1;
      }
    }
  }
  /** Continue a capture that was interrupted by reloading the page or app. */
  resumeCapture(e) {
    const t = Bi(e);
    if (!t) return;
    const n = this.steps.findIndex((i) => i.id === t.step);
    if (n < 0 || Date.now() - t.armedAt > Yi) {
      Ot(e, null);
      return;
    }
    this.page = n + 1, this.capture = { ...t, missed: !0, syncAfter: Date.now() + rt }, this.showToast("Unterbrochene Aufnahme wird fortgesetzt.");
  }
  finishCapture() {
    const e = this.capture;
    if (this.capture = null, !e || e.phase !== "recording") return;
    const t = Math.min(Date.now(), e.endsAt ?? Date.now());
    this.updateSession(
      _i(this.session, e.step, {
        startedAt: e.startedAt ?? (/* @__PURE__ */ new Date()).toISOString(),
        endedAt: new Date(t).toISOString(),
        lines: e.lines
      })
    ), this.showToast(
      e.lines.length > 0 ? `Aufnahme gespeichert (${e.lines.length} Frames).` : "Aufnahme gespeichert – es kamen keine Frames an."
    );
  }
  cancelCapture() {
    this.capture = null;
  }
  // ---- Session -------------------------------------------------------------------------------------
  updateSession(e) {
    this.session = e, Oi(e);
  }
  /** Doors from the card config (`doors:`), otherwise the default gate / house door / apartment setup. */
  get configDoors() {
    return this.config?.doors !== void 0 ? $t(this.config.doors) : [...nt];
  }
  get steps() {
    return this.stepsCache?.doors !== this.session.doors && (this.stepsCache = { doors: this.session.doors, steps: Ti(this.session.doors) }), this.stepsCache.steps;
  }
  /** Page 0 is the start page, 1..steps.length are the recording steps, the last page is the result. */
  get resultPage() {
    return this.steps.length + 1;
  }
  get configIndoor() {
    return ue(this.config?.indoor_address);
  }
  get result() {
    const e = this.session.indoorAddress ?? this.configIndoor, t = this.analysisCache;
    if (t && t.session === this.session && t.indoor === e) return t.result;
    const n = oi(this.session, { indoorAddress: e });
    return this.analysisCache = { session: this.session, indoor: e, result: n }, n;
  }
  /** Address used to highlight own frames: detected, manual or expected from the dials. */
  get highlightAddress() {
    const e = this.result.indoor?.address;
    if (e !== void 0) return e;
    const t = ve(this.session.dials);
    return t !== void 0 ? ke(t, !1) : void 0;
  }
  exportSession() {
    const e = (/* @__PURE__ */ new Date()).toISOString().slice(0, 16).replace(/[:T]/g, "-");
    It(`abb-welcome-session-${e}.json`, sn(this.session), "application/json");
  }
  importSession() {
    this.renderRoot.querySelector("#import")?.click();
  }
  async onImportFile(e) {
    const t = e.target, n = t.files?.[0];
    if (t.value = "", !(!n || !this.config))
      try {
        const i = rn(await n.text());
        this.updateSession({ ...i, entity: this.config.entity }), this.indoorInput = i.indoorAddress !== void 0 ? w(i.indoorAddress, i.indoorAddress > 65535) : "", this.page = this.resultPage, this.showToast("Sitzung importiert.");
      } catch (i) {
        this.showToast(i instanceof Error ? i.message : String(i));
      }
  }
  resetSession() {
    this.config && window.confirm("Alle Aufnahmen dieser Sitzung löschen und neu beginnen?") && (Ii(this.config.entity), this.updateSession(St(this.config.entity, this.configDoors)), this.indoorInput = "", this.capture = null, this.page = 0);
  }
  onDialInput(e, t) {
    const n = t.target.value, i = n === "" ? void 0 : Number(n);
    this.updateSession(
      Si(this.session, {
        ...this.session.dials,
        [e]: i !== void 0 && Number.isInteger(i) ? i : void 0
      })
    );
  }
  onIndoorInput(e) {
    this.indoorInput = e.target.value;
    const t = this.indoorInput.trim();
    if (t === "") this.updateSession(Et(this.session, void 0));
    else {
      const n = ue(t);
      n !== void 0 && this.updateSession(Et(this.session, n));
    }
  }
  updateDoor(e, t) {
    let n = this.session.doors.map((i) => i.key === e ? { ...i, ...t } : i);
    t.default && (n = n.map((i) => i.key === e ? i : { ...i, default: !1 })), this.updateSession(q(this.session, n));
  }
  renameDoor(e, t) {
    const n = t.target, i = n.value.trim();
    i === "" ? n.value = e.name : i !== e.name && this.updateDoor(e.key, { name: i });
  }
  addDoor() {
    this.session.doors.length >= ne || this.updateSession(q(this.session, [...this.session.doors, Kn(this.session.doors)]));
  }
  removeDoor(e) {
    if (this.session.doors.length <= 1) return;
    const t = Dt(this.session, e);
    t > 0 && !window.confirm(`„${e.name}“ und ${t} Aufnahme(n) dieser Tür löschen?`) || this.updateSession(
      q(
        this.session,
        this.session.doors.filter((n) => n.key !== e.key)
      )
    );
  }
  resetDoors() {
    const e = this.configDoors, t = this.session.doors.filter((n) => !e.some((i) => i.key === n.key)).reduce((n, i) => n + Dt(this.session, i), 0);
    t > 0 && !window.confirm(`Dabei gehen ${t} Aufnahme(n) entfernter Türen verloren. Fortfahren?`) || this.updateSession(q(this.session, e));
  }
  showToast(e) {
    this.toast = e, window.clearTimeout(this.toastTimer), this.toastTimer = window.setTimeout(() => this.toast = "", 4e3);
  }
  // ---- Navigation ----------------------------------------------------------------------------------
  get currentStep() {
    const e = this.steps;
    return this.page >= 1 && this.page <= e.length ? e[this.page - 1] : void 0;
  }
  goTo(e) {
    this.capture || (this.page = Math.max(0, Math.min(this.resultPage, e)), this.waitForFrame = void 0);
  }
  skipStep() {
    const e = this.currentStep;
    e && this.updateSession(Ai(this.session, e.id, !0)), this.goTo(this.page + 1);
  }
  // ---- Rendering -----------------------------------------------------------------------------------
  render() {
    return !this.config || !this.session ? m : c`
      <ha-card>
        <div class="header">
          <div class="header-icon"><ha-icon icon="mdi:doorbell-video"></ha-icon></div>
          <div class="title">
            <h1>${this.config.title ?? "ABB-Welcome Einrichtung"}</h1>
            <div class="subtitle">Klingeln & Türöffner einmessen</div>
          </div>
          <button class="icon" title="Sitzung exportieren (JSON)" @click=${this.exportSession}>
            <ha-icon icon="mdi:download-outline"></ha-icon>
          </button>
          <button class="icon" title="Sitzung importieren (JSON)" @click=${this.importSession}>
            <ha-icon icon="mdi:upload-outline"></ha-icon>
          </button>
          <button class="icon" title="Neu beginnen" @click=${this.resetSession}>
            <ha-icon icon="mdi:restart"></ha-icon>
          </button>
          <input id="import" type="file" accept="application/json,.json" @change=${this.onImportFile} />
        </div>
        ${this.renderStepper()}
        <div class="progress"><div style="width:${this.page / this.resultPage * 100}%"></div></div>
        <div class="content">
          ${this.capture ? m : this.renderConnectionStatus()}
          ${this.page === 0 ? this.renderStart() : this.page >= this.resultPage ? this.renderResult() : this.renderStep(this.steps[this.page - 1])}
        </div>
        ${this.renderFooter()}
      </ha-card>
    `;
  }
  renderStepper() {
    const e = [
      { label: "Start", icon: "mdi:play", status: "" },
      ...this.steps.map((t) => {
        const n = z(this.session, t.id), i = n.captures.length > 0 ? "done" : n.skipped ? "skipped" : "";
        return { label: t.short, icon: i === "done" ? "mdi:check" : t.icon, status: i };
      }),
      { label: "Ergebnis", icon: "mdi:file-code-outline", status: "" }
    ];
    return c`
      <nav class="stepper" aria-label="Schritte">
        ${e.map(
      (t, n) => c`
            <button
              class="${t.status} ${n === this.page ? "current" : ""}"
              ?disabled=${!!this.capture}
              aria-current=${n === this.page ? "step" : "false"}
              title=${t.label}
              @click=${() => this.goTo(n)}
            >
              <span class="dot"><ha-icon icon=${t.icon}></ha-icon></span>
              <span class="label">${t.label}</span>
            </button>
          `
    )}
      </nav>
    `;
  }
  renderFooter() {
    const e = this.currentStep, t = e ? z(this.session, e.id).captures.length > 0 : !1;
    return c`
      <div class="footer">
        <button
          class="btn text"
          ?disabled=${this.page === 0 || !!this.capture}
          @click=${() => this.goTo(this.page - 1)}
        >
          <ha-icon icon="mdi:chevron-left"></ha-icon>Zurück
        </button>
        <span class="spacer"></span>
        ${this.toast ? c`<span class="toast" role="status">${this.toast}</span>` : m}
        <span class="spacer"></span>
        ${e && !t ? c`<button class="btn text" ?disabled=${!!this.capture} @click=${this.skipStep}>
                Überspringen
              </button>` : m}
        ${this.page < this.resultPage ? c`<button
                class="btn ${!e || t ? "primary" : ""}"
                ?disabled=${!!this.capture}
                @click=${() => this.goTo(this.page + 1)}
              >
                ${this.page === this.steps.length ? "Auswerten" : "Weiter"}<ha-icon
                  icon="mdi:chevron-right"
                ></ha-icon>
              </button>` : m}
      </div>
    `;
  }
  // ---- Start page ----------------------------------------------------------------------------------
  renderStart() {
    const e = this.config.entity, t = this.hass?.states[e], n = ve(this.session.dials), i = this.result.threeByte, s = n !== void 0 ? ke(n, i) : void 0, r = this.indoorInput.trim() !== "" && ue(this.indoorInput) === void 0, o = this.configIndoor;
    return c`
      <h2><ha-icon icon="mdi:hand-wave-outline"></ha-icon>Willkommen</h2>
      <p>
        Dieser Assistent führt dich in wenigen Minuten durch das Einmessen deiner Busch-Welcome / ABB-Welcome
        Gegensprechanlage: Du klingelst und drückst die Schlüssel-Taste, die Karte schneidet die Bus-Frames
        mit, wertet sie aus und erzeugt die fertige ESPHome-Konfiguration.
      </p>
      <div class="callout ok">
        <ha-icon icon="mdi:shield-check-outline"></ha-icon>
        <span
          ><b>Nur lesen:</b> Die Karte sendet nichts auf den Bus und löst keine Aktionen aus. Türen öffnen
          sich nur, wenn du selbst die Schlüssel-Taste drückst.</span
        >
      </div>

      <div class="panel">
        <h3>1 · Datenquelle prüfen</h3>
        ${t ? c`<div class="callout ${this.receivedCount > 0 ? "ok" : "info"}">
                <ha-icon
                  icon=${this.receivedCount > 0 ? "mdi:check-circle-outline" : "mdi:timer-sand"}
                ></ha-icon>
                <span>
                  <b>${t.attributes.friendly_name ?? e}</b> gefunden.
                  ${this.receivedCount > 0 ? c`${this.receivedCount} Frame(s) seit dem Öffnen der Karte empfangen.` : c`Noch keine neuen Frames – drück zum Test kurz eine Taste an der Innenstation.`} <br /><span class="muted small">Letzter Wert: <code>${t.state}</code></span>
                </span>
              </div>` : c`<div class="callout error">
                <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
                <span
                  >Die Entität <code>${e}</code> existiert nicht. Trage in der Karten-Konfiguration unter
                  <code>entity</code> den Debug-Textsensor deines ESP32 ein (z. B. „Doorbell Intercom“).</span
                >
              </div>`}
      </div>

      <div class="panel">
        <h3>2 · Drehregler der Innenstation (optional)</h3>
        <p class="muted small">
          Auf der Rückseite deiner Innenstation. X10 und X1 ergeben die Wohnungsnummer – daraus folgt die
          erwartete Adresse. Sie dient nur zur Kontrolle, die echte Adresse wird aus den Frames ermittelt.
        </p>
        <div class="fields">
          ${["station", "x10", "x1"].map(
      (a) => c`
              <label class="field"
                >${a.toUpperCase()}
                <input
                  type="number"
                  min="0"
                  max="9"
                  inputmode="numeric"
                  .value=${this.session.dials[a]?.toString() ?? ""}
                  @change=${(d) => this.onDialInput(a, d)}
                />
              </label>
            `
    )}
        </div>
        ${s !== void 0 ? c`<p class="small">
                Wohnung <b>${n}</b> → erwartete Innenstationsadresse
                <span class="badge accent">${w(s, i)}</span>
              </p>` : m}
      </div>

      <details ?open=${o !== void 0 || this.session.indoorAddress !== void 0}>
        <summary>Innenstationsadresse manuell festlegen (für Profis)</summary>
        <div class="panel" style="border:none;padding:0">
          <p class="muted small">
            Normalerweise ermittelt der Assistent die Adresse selbst. Falls du sie kennst oder die Erkennung
            danebenliegt, kannst du sie hier
            vorgeben${o !== void 0 ? c` (Karten-Konfiguration:
                    <code>${w(o, o > 65535)}</code>)` : m}.
          </p>
          <label class="field"
            >Adresse (z. B. 0x1010 oder 0x000110)
            <input
              type="text"
              class=${r ? "invalid" : ""}
              placeholder=${o !== void 0 ? w(o, o > 65535) : "automatisch"}
              .value=${this.indoorInput}
              @input=${this.onIndoorInput}
            />
          </label>
        </div>
      </details>

      ${this.renderDoorEditor()} ${this.renderLive("Live-Frames")} ${this.renderLimitations()}
    `;
  }
  renderDoorEditor() {
    const e = this.session.doors;
    return c`
      <div class="panel">
        <h3>3 · Türen deiner Anlage</h3>
        <p class="muted small">
          Für jede Tür gibt es einen Klingel-Schritt, für Türen mit Öffner zusätzlich einen Öffnen-Schritt.
          Namen frei wählbar – sie werden auch für die Sensoren und Schlösser in ESPHome verwendet.
        </p>
        <div class="doors">
          ${e.map(
      (t) => c`
              <div class="door-row">
                <div class="door-main">
                  <ha-icon icon=${_e(t)}></ha-icon>
                  <input
                    type="text"
                    aria-label="Name der Tür"
                    maxlength="40"
                    .value=${t.name}
                    @change=${(n) => this.renameDoor(t, n)}
                  />
                  <button
                    class="icon"
                    title="Tür entfernen"
                    ?disabled=${e.length <= 1}
                    @click=${() => this.removeDoor(t)}
                  >
                    <ha-icon icon="mdi:delete-outline"></ha-icon>
                  </button>
                </div>
                <div class="door-options">
                  <select
                    aria-label="Art der Klingel"
                    .value=${t.type}
                    @change=${(n) => this.updateDoor(t.key, {
        type: n.target.value,
        open: n.target.value === "outdoor"
      })}
                  >
                    <option value="outdoor">Außentür (eigene Außenstation)</option>
                    <option value="floor">Wohnungstür (Etagenruf)</option>
                  </select>
                  <label class="switch" title="Die Schlüssel-Taste der Innenstation kann diese Tür öffnen">
                    <input
                      type="checkbox"
                      .checked=${t.open}
                      ?disabled=${t.type === "floor"}
                      @change=${(n) => this.updateDoor(t.key, { open: n.target.checked })}
                    />Türöffner
                  </label>
                  <label
                    class="switch"
                    title="Öffnet sich mit der Schlüssel-Taste auch ohne vorheriges Klingeln"
                  >
                    <input
                      type="checkbox"
                      .checked=${t.default}
                      ?disabled=${!t.open}
                      @change=${(n) => this.updateDoor(t.key, { default: n.target.checked })}
                    />Standard-Tür
                  </label>
                </div>
              </div>
            `
    )}
        </div>
        <div class="actions">
          <button class="btn" ?disabled=${e.length >= ne} @click=${this.addDoor}>
            <ha-icon icon="mdi:plus"></ha-icon>Tür hinzufügen
          </button>
          <button class="btn text" @click=${this.resetDoors}>Vorgabe wiederherstellen</button>
        </div>
        <details>
          <summary>Was bedeuten die Optionen?</summary>
          <ul class="small" style="margin:0;padding-left:1.2em;line-height:1.5">
            <li>
              <b>Außentür:</b> Tür mit eigener Außenstation (Klingeltaster mit Lautsprecher), z. B. Tor oder
              Haustür.
            </li>
            <li>
              <b>Wohnungstür (Etagenruf):</b> Klingeltaster, der direkt an der Innenstation angeschlossen ist.
              Kein Öffner.
            </li>
            <li>
              <b>Türöffner:</b> Die Schlüssel-Taste der Innenstation öffnet diese Tür (nach dem Klingeln an
              ihr).
            </li>
            <li>
              <b>Standard-Tür:</b> Die Tür, die die Schlüssel-Taste auch <i>ohne</i> vorheriges Klingeln
              öffnet – meist die Haustür. Höchstens eine.
            </li>
          </ul>
        </details>
      </div>
    `;
  }
  renderDoorsWithoutOpener() {
    const e = this.session.doors.filter((t) => !t.open).map((t) => `„${t.name}“`);
    return e.length === 0 ? m : c`<p class="muted small">Ohne elektrischen Öffner (nur Klingel): ${e.join(", ")}.</p>`;
  }
  renderLimitations() {
    return c`
      <details>
        <summary>Bekannte Einschränkungen</summary>
        <p class="small">
          Home Assistant meldet nur <i>Änderungen</i> des Sensors. Kommen zwei identische Frames direkt
          hintereinander, erscheint nur einer – Wiederholungen (») können also fehlen. Die Auswertung hängt
          deshalb nicht von exakten Wiederholungszahlen ab. Firmwares, die nur den letzten Frame alle 100 ms
          melden, können Frames verschlucken (<code>api: batch_delay: 0ms</code> hilft).
        </p>
      </details>
    `;
  }
  // ---- Live list -----------------------------------------------------------------------------------
  renderLive(e, t = this.live) {
    const n = this.live.length > 0;
    return c`
      <div class="panel">
        <h3 style="display:flex;align-items:center;gap:8px">
          <span class="live-dot ${n ? "" : "off"}"></span>${e}
          <span class="muted small" style="font-weight:normal"
            >${t.length > 0 ? `(${t.length})` : ""}</span
          >
        </h3>
        ${this.renderFrames(t, "Warte auf Frames … Tipp: Taste an der Innenstation drücken.")}
      </div>
    `;
  }
  renderFrames(e, t) {
    if (e.length === 0) return c`<div class="empty">${t}</div>`;
    const n = this.highlightAddress;
    return c`
      <div class="frames" role="log">
        ${e.map((i) => {
      const s = Yt(i.line);
      if (!s.ok)
        return c`<div class="frame unparsed" title="Nicht erkannt">
              <span class="time">${Be(i.time)}</span><span class="route">?</span
              ><span class="detail">${i.line}</span>
            </div>`;
      const r = s.frame, o = n !== void 0 && tt(r, n);
      return c`<div class="frame ${n === void 0 ? "" : o ? "own" : "foreign"}" title=${i.line}>
            <span class="time">${Be(i.time)}</span>
            <span class="route"
              >${Ie(r.src, r.threeByte)} ${r.retransmission ? "»" : "›"}
              ${Ie(r.dst, r.threeByte)}</span
            >
            <span class="detail"
              ><span class="type">${fe(r.type)}</span>${r.data.length ? c` · ${J(r.data)}` : m}</span
            >
          </div>`;
    })}
      </div>
    `;
  }
  // ---- Recording step ------------------------------------------------------------------------------
  renderStep(e) {
    const n = z(this.session, e.id).captures.length;
    return c`
      <h2><ha-icon icon=${e.icon}></ha-icon>${e.title}</h2>
      <ol class="todo">
        ${e.todo.map((i) => c`<li>${i}</li>`)}
      </ol>
      <details>
        <summary>Warum?</summary>
        <p class="small">${e.why}</p>
      </details>
      ${e.needsPause ? this.renderPauseHint() : m}
      ${e.kind === "open" ? c`<div class="callout warning">
              <ha-icon icon="mdi:door-open"></ha-icon>
              <span
                >Die Tür öffnet sich bei diesem Schritt tatsächlich – nur ausführen, wenn das in Ordnung
                ist.</span
              >
            </div>` : m}

      <div class="panel">
        ${this.capture ? this.renderActiveCapture() : this.renderCaptureControls(e, n)}
      </div>

      ${n > 0 ? this.renderCaptures(e) : m}
      ${n > 0 ? this.renderStepFeedback(e) : m}
      ${this.capture ? this.renderLive("Frames dieser Aufnahme", [...this.capture.lines].reverse()) : this.renderLive("Live-Frames")}
    `;
  }
  renderPauseHint() {
    const e = zi(this.session);
    if (!e) return c``;
    const t = (this.now - e.getTime()) / 6e4, n = t >= Tt;
    return c`<div class="callout ${n ? "ok" : "warning"}">
      <ha-icon icon="mdi:timer-outline"></ha-icon>
      <span
        >Letztes Klingeln vor
        ${t < 1 ? "weniger als einer Minute" : `${Math.floor(t)} Minute(n)`}.
        ${n ? "Passt – die Schlüssel-Taste öffnet jetzt die Standard-Außenstation." : `Bitte noch etwas warten (mindestens ${Tt} Minuten).`}</span
      >
    </div>`;
  }
  renderCaptureControls(e, t) {
    const n = this.captureSeconds, i = this.waitForFrame ?? e.waitForFrame;
    return c`
      <div class="actions">
        <button class="btn primary large" @click=${() => this.beginCapture(i)}>
          <ha-icon icon=${t === 0 ? "mdi:record-circle-outline" : "mdi:repeat"}></ha-icon>
          ${t === 0 ? "Aufnahme starten" : "Wiederholen"}
        </button>
        <span class="spacer" style="flex:1"></span>
        ${this.renderReps(t, e.repetitions)}
      </div>
      <label class="switch">
        <input
          type="checkbox"
          .checked=${i}
          @change=${(s) => this.waitForFrame = s.target.checked}
        />
        <span
          >Erst mit dem ersten Frame starten
          <span class="muted">(z. B. wenn du erst zur Tür gehen musst)</span></span
        >
      </label>
      <p class="muted small">
        ${i ? `Nach dem Tippen wartet die Karte auf den ersten Frame und nimmt ab dann ${n} s auf.` : `Die Aufnahme läuft ${n} s ab dem Tippen.`}
        ${t === 0 ? "" : t < e.repetitions ? `Empfohlen: ${e.repetitions} Aufnahmen.` : "Genug Aufnahmen – weiter zum nächsten Schritt."}
      </p>
    `;
  }
  renderReps(e, t) {
    const n = Math.max(e, t);
    return c`<span class="reps" title="${e} von ${t} empfohlenen Aufnahmen">
      ${Array.from({ length: n }, (i, s) => c`<span class=${s < e ? "filled" : ""}></span>`)}
    </span>`;
  }
  renderConnectionStatus() {
    return this.online ? this.capture?.missed ? c`<div class="callout info" role="status">
        <ha-icon icon="mdi:history"></ha-icon>
        <span>Verbindung wieder da – verpasste Frames werden aus dem Verlauf nachgeladen …</span>
      </div>` : m : c`<div class="callout warning" role="status">
        <ha-icon icon="mdi:wifi-off"></ha-icon>
        <span
          >Keine Verbindung zu Home
          Assistant.${this.capture ? " Mach einfach weiter – Home Assistant zeichnet die Frames trotzdem auf. Sobald die Verbindung zurück ist, holt die Karte sie aus dem Verlauf nach." : " Live-Frames sind pausiert."}</span
        >
      </div>`;
  }
  renderActiveCapture() {
    const e = this.capture;
    if (e.phase === "armed")
      return c`${this.renderConnectionStatus()}
        <div class="capture">
          <div class="pulse"><ha-icon icon="mdi:bell-ring-outline"></ha-icon></div>
          <div style="flex:1">
            <b>Bereit – jetzt klingeln bzw. Taste drücken.</b>
            <p class="muted small">Die Aufnahme startet automatisch mit dem ersten Frame.</p>
          </div>
          <button class="btn text" @click=${this.cancelCapture}>Abbrechen</button>
        </div>`;
    const t = this.captureSeconds * 1e3, n = Math.max(0, (e.endsAt ?? this.now) - this.now), i = 2 * Math.PI * 32, s = n === 0 && e.missed;
    return c`${this.renderConnectionStatus()}
      <div class="capture">
        <div class="ring" role="timer" aria-label="Verbleibende Sekunden">
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle class="track" cx="36" cy="36" r="32"></circle>
            <circle
              class="bar"
              cx="36"
              cy="36"
              r="32"
              stroke-dasharray=${i}
              stroke-dashoffset=${i * (1 - n / t)}
            ></circle>
          </svg>
          <div class="value">${Math.ceil(n / 1e3)}</div>
        </div>
        <div style="flex:1">
          <b>${s ? "Aufnahme wird vervollständigt …" : "Aufnahme läuft …"}</b>
          <p class="muted small">${e.lines.length} Frame(s) empfangen</p>
        </div>
        <button class="btn" @click=${this.finishCapture}>Jetzt beenden</button>
      </div>`;
  }
  renderCaptures(e) {
    const t = z(this.session, e.id).captures;
    return c`
      <div class="captures">
        <div class="actions">
          <h3 style="margin:0;flex:1">Aufnahmen</h3>
          <button
            class="btn text danger"
            @click=${() => this.updateSession(zt(this.session, e.id, t.length - 1))}
          >
            <ha-icon icon="mdi:undo"></ha-icon>Verwerfen
          </button>
        </div>
        ${t.map(
      (n, i) => c`
            <details class="capture-row">
              <summary>
                <ha-icon icon="mdi:chevron-right"></ha-icon>
                <span class="grow">Aufnahme ${i + 1} · ${Be(n.startedAt)}</span>
                <span class="badge ${n.lines.length ? "" : "warning"}">${n.lines.length} Frames</span>
                <button
                  class="icon"
                  title="Diese Aufnahme löschen"
                  @click=${(s) => {
        s.preventDefault(), this.updateSession(zt(this.session, e.id, i));
      }}
                >
                  <ha-icon icon="mdi:delete-outline"></ha-icon>
                </button>
              </summary>
              ${this.renderFrames(n.lines, "Keine Frames in dieser Aufnahme.")}
            </details>
          `
    )}
      </div>
    `;
  }
  /** Immediate feedback on what the analysis found for this step. */
  renderStepFeedback(e) {
    const t = this.result;
    if (!t.indoor)
      return c`<div class="callout info">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        <span>Innenstation noch nicht erkannt – sie ergibt sich spätestens aus den Öffnen-Schritten.</span>
      </div>`;
    if (e.kind === "baseline" || !e.door)
      return c`<div class="callout ok">
        <ha-icon icon="mdi:check-circle-outline"></ha-icon>
        <span
          >${z(this.session, e.id).captures.flatMap((i) => i.lines).length} Frames als Baseline
          markiert.</span
        >
      </div>`;
    if (e.kind === "ring") {
      const i = t.rings[e.door.key];
      return i.candidates.length > 0 ? c`<div class="panel">
            <h3>Erkannt</h3>
            ${this.renderCandidates(i)}
          </div>` : c`<div class="callout warning">
            <ha-icon icon="mdi:alert-outline"></ha-icon>
            <span
              >Noch keine passenden Klingel-Frames für
              ${E(t.indoor.address, t.threeByte)}.</span
            >
          </div>`;
    }
    const n = t.opens[e.door.key];
    return n ? c`<div class="panel">
          <h3>Erkannt</h3>
          ${this.renderOpen(n)}
        </div>` : c`<div class="callout warning">
          <ha-icon icon="mdi:alert-outline"></ha-icon>
          <span>Kein Öffnen-Frame (Typ 0D/0E) von der Innenstation gefunden.</span>
        </div>`;
  }
  // ---- Result page ---------------------------------------------------------------------------------
  renderResult() {
    const e = this.result, { indoor: t, threeByte: n } = e, i = ve(this.session.dials), s = this.device, r = Ki(e, this.session.doors, {
      maskDoorCode: this.maskDoorCode,
      apartment: i,
      device: this.exportMode === "full" ? s : void 0
    });
    return Object.values(this.session.steps).some((a) => a.captures.length > 0) ? c`
      <h2><ha-icon icon="mdi:file-code-outline"></ha-icon>Ergebnis</h2>

      <div class="grid">
        <div class="panel stat">
          <span class="muted small">Innenstation</span>
          <span class="value">${t ? w(t.address, n) : "—"}</span>
          ${t ? c`<span class="small">
                  ${t.method === "manual" ? c`<span class="badge accent">manuell</span>` : t.method === "open" ? c`<span class="badge ok">aus Öffnen-Frames</span>` : c`<span class="badge warning">nach Häufigkeit</span>`}
                  ${t.expected !== void 0 ? t.matchesExpected ? c`<span class="badge ok"
                            ><ha-icon icon="mdi:check"></ha-icon>passt zu Wohnung ${i}</span
                          >` : c`<span class="badge warning"
                            >erwartet ${w(t.expected, n)} (Wohnung
                            ${i})</span
                          >` : m}
                </span>` : m}
        </div>
        <div class="panel stat">
          <span class="muted small">Adresslänge</span>
          <span class="value">${n ? "3 Byte" : "2 Byte"}</span>
          <span class="muted small">${n ? "three_byte_address: true" : "Standard"}</span>
        </div>
      </div>

      ${this.renderWarnings(e)}

      <div class="panel">
        <h3>Klingeln</h3>
        ${on(this.session.doors).map((a) => {
      const d = e.rings[a.door.key], l = d.selected.length > 0;
      return c`<div class="result-row">
            <ha-icon icon=${_e(a.door)}></ha-icon>
            <div>
              <div class="row-head">
                <b>${a.name}</b>
                ${d.outdoorAddress !== void 0 ? c`<span class="muted small"
                        >${E(d.outdoorAddress, n)}</span
                      >` : m}
                <span class="spacer"></span>
                ${l ? c`<span class="badge ok">binary_sensor.${a.id}</span>` : c`<span class="badge ${d.captures ? "warning" : ""}"
                        >${d.captures ? "nicht erkannt" : "nicht aufgenommen"}</span
                      >`}
              </div>
              ${d.candidates.length > 0 ? this.renderCandidates(d) : m}
            </div>
          </div>`;
    })}
      </div>

      <div class="panel">
        <h3 style="display:flex;align-items:center;gap:8px">
          <span style="flex:1">Türöffner (Schlüssel-Taste)</span>
          <button
            class="icon"
            title="Türcode anzeigen/verbergen"
            @click=${() => this.showDoorCode = !this.showDoorCode}
          >
            <ha-icon icon=${this.showDoorCode ? "mdi:eye-off-outline" : "mdi:eye-outline"}></ha-icon>
          </button>
        </h3>
        ${an(this.session.doors).map((a) => {
      const d = e.opens[a.door.key], l = z(this.session, O(a.door)).captures.length > 0;
      return c`<div class="result-row">
            <ha-icon icon=${a.icon}></ha-icon>
            <div>
              <div class="row-head">
                <b>${a.name}</b>
                <span class="spacer"></span>
                ${d ? c`<span class="badge ok">lock.${a.id}</span>` : c`<span class="badge ${l ? "warning" : ""}"
                        >${l ? "nicht erkannt" : "nicht aufgenommen"}</span
                      >`}
              </div>
              ${d ? this.renderOpen(d) : m}
            </div>
          </div>`;
    })}
        ${this.renderDoorsWithoutOpener()}
      </div>

      <div class="panel">
        <h3 style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span style="flex:1">ESPHome-Konfiguration</span>
          <label class="switch">
            <input
              type="checkbox"
              .checked=${this.maskDoorCode}
              @change=${(a) => this.maskDoorCode = a.target.checked}
            />Türcode maskieren
          </label>
        </h3>
        <div class="segmented" role="radiogroup" aria-label="Umfang">
          ${[
      ["full", "Komplette Datei"],
      ["snippet", "Nur geänderte Abschnitte"]
    ].map(
      ([a, d]) => c`<button
                role="radio"
                aria-checked=${this.exportMode === a}
                class=${this.exportMode === a ? "active" : ""}
                @click=${() => this.exportMode = a}
              >
                ${d}
              </button>`
    )}
        </div>
        ${this.exportMode === "full" ? this.renderDeviceFields(s) : m}
        <p class="muted small">
          ${this.exportMode === "full" ? c`Im ESPHome Device Builder beim Gerät auf <b>Bearbeiten</b>, den gesamten Inhalt durch
                  diese Datei ersetzen und <b>Installieren</b> (drahtlos). Benötigt in
                  <code>secrets.yaml</code>: wifi_ssid, wifi_password, api_encryption_key, ota_password,
                  ap_password – den API-Schlüssel aus der bisherigen Datei übernehmen.` : "In der ESPHome-Konfiguration deines ESP32 die gleichnamigen Abschnitte der Demo-Firmware ersetzen und per OTA installieren."}
          ${this.maskDoorCode ? "Türcodes sind durch Platzhalter ersetzt – gut zum Teilen in Foren." : c`<b>Enthält deinen Türcode – nicht öffentlich teilen.</b>`}
        </p>
        <div class="actions">
          <button class="btn primary" @click=${() => this.copyYaml(r)}>
            <ha-icon icon="mdi:content-copy"></ha-icon>Kopieren
          </button>
          <button
            class="btn"
            @click=${() => It(
      this.exportMode === "full" ? `${s.name}.yaml` : "abb-welcome-abschnitte.yaml",
      r,
      "text/yaml"
    )}
          >
            <ha-icon icon="mdi:download"></ha-icon>Herunterladen
          </button>
        </div>
        <pre class="yaml">${r}</pre>
      </div>

      <details>
        <summary>
          Statistik · ${e.stats.parsedFrames} Frames, ${e.stats.baselineFiltered} per Baseline und
          ${e.stats.neighbourFiltered} als Nachbar-Frames ausgefiltert
        </summary>
        ${e.stats.unparsedLines.length > 0 ? c`<p class="small">${e.stats.unparsedLines.length} nicht erkannte Zeile(n):</p>
                <div class="frames">
                  ${e.stats.unparsedLines.map((a) => c`<div class="frame unparsed"><span></span><span></span><span>${a}</span></div>`)}
                </div>` : c`<p class="small muted">Alle Zeilen wurden erkannt.</p>`}
      </details>
      ${this.renderLimitations()}
    ` : c`<h2><ha-icon icon="mdi:file-code-outline"></ha-icon>Ergebnis</h2>
        <div class="callout info">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          <span>Noch keine Aufnahmen. Geh die Schritte durch oder importiere eine gespeicherte Sitzung.</span>
        </div>`;
  }
  /** Device settings: user edits, otherwise suggested from the debug sensor's device in Home Assistant. */
  get device() {
    const e = this.config ? this._hass?.entities?.[this.config.entity] : void 0, t = e?.device_id ? this._hass?.devices?.[e.device_id] : void 0, n = t?.name_by_user || t?.name || U.friendlyName, i = this.config ? this._hass?.states[this.config.entity]?.attributes.friendly_name : void 0, s = typeof i == "string" && i.startsWith(`${n} `) ? i.slice(n.length + 1) : U.debugSensorName;
    return {
      ...U,
      name: Bt(n),
      friendlyName: n,
      debugSensorName: s,
      ...this.deviceEdits
    };
  }
  renderDeviceFields(e) {
    const t = (n, i, s) => c`<label class="field"
        >${i}
        <input
          type="text"
          .value=${e[n] ?? ""}
          @change=${(r) => {
      const o = r.target.value.trim(), a = { ...this.deviceEdits };
      o === "" ? delete a[n] : a[n] = n === "name" ? Bt(o) : o, this.deviceEdits = a;
    }}
        />
        ${s ? c`<span>${s}</span>` : m}
      </label>`;
    return c`<div class="fields device-fields">
      ${t("name", "Gerätename", "esphome name – muss zum bestehenden Gerät passen")}
      ${t("friendlyName", "Anzeigename")}
      ${t("debugSensorName", "Debug-Sensor", "Unverändert lassen, damit diese Karte ihn findet")}
    </div>`;
  }
  async copyYaml(e) {
    this.showToast(
      await Fi(e) ? "YAML kopiert." : "Kopieren nicht möglich – bitte manuell markieren."
    );
  }
  renderWarnings(e) {
    const t = ["error", "warning", "info"], n = [...e.warnings].sort(
      (r, o) => t.indexOf(r.severity) - t.indexOf(o.severity)
    );
    if (n.length === 0)
      return c`<div class="callout ok">
        <ha-icon icon="mdi:check-circle-outline"></ha-icon><span>Keine Auffälligkeiten.</span>
      </div>`;
    const i = n.filter((r) => r.severity !== "info"), s = n.filter((r) => r.severity === "info");
    return c`
      ${i.length === 0 ? c`<div class="callout ok">
              <ha-icon icon="mdi:check-circle-outline"></ha-icon><span>Keine Probleme gefunden.</span>
            </div>` : m}
      ${i.map(
      (r) => c`<div class="callout ${r.severity}">
            <ha-icon icon=${Zi[r.severity]}></ha-icon><span>${r.message}</span>
          </div>`
    )}
      ${s.length > 0 ? c`<details>
              <summary>${s.length} Hinweis(e)</summary>
              <ul class="small" style="margin:0;padding-left:1.2em;line-height:1.5">
                ${s.map((r) => c`<li>${r.message}</li>`)}
              </ul>
            </details>` : m}
    `;
  }
  renderCandidates(e) {
    const { threeByte: t } = this.result, n = new Set(e.selected.map((s) => s.key)), i = (s) => {
      const r = (a) => Ie(a, t), o = s.src !== void 0 && s.dst !== void 0 ? `${r(s.src)} › ${r(s.dst)}` : s.src !== void 0 ? `von ${r(s.src)}` : s.dst !== void 0 ? `an ${r(s.dst)}` : "";
      return `Typ ${fe(s.type)} ${o}${s.data ? ` · ${J(s.data)}` : ""}`;
    };
    return c`<div class="candidates">
      ${e.candidates.map(
      (s) => c`<div
            class="candidate ${n.has(s.key) ? "" : "unselected"}"
            title=${n.has(s.key) ? "wird verwendet" : "nicht in allen Aufnahmen – wird nicht verwendet"}
          >
            <code>${i(s)}</code>
            <div
              class="meter ${s.reliable ? "" : "partial"}"
              title="${s.occurrences}/${e.captures} Aufnahmen"
            >
              <div style="width:${Math.round(s.score * 100)}%"></div>
            </div>
          </div>`
    )}
    </div>`;
  }
  renderOpen(e) {
    const { threeByte: t } = this.result, n = this.showDoorCode ? J(e.data) : e.data.map(() => "••").join(" ");
    return c`<dl class="kv" style="margin:6px 0 0">
      <dt>Ziel</dt>
      <dd>${E(e.destination, t)}</dd>
      <dt>Typ</dt>
      <dd>${fe(e.messageType)} ${e.messageType === 14 ? "(Schiebetür)" : "(Türöffner)"}</dd>
      <dt>Türcode</dt>
      <dd>${n || "—"}</dd>
      <dt>Bestätigung</dt>
      <dd>
        ${e.confirmation ? `${fe(e.confirmation.messageType)} von ${w(e.confirmation.source, t)}` : "—"}
      </dd>
      <dt>Stabilität</dt>
      <dd>${e.occurrences}/${e.captures} Aufnahmen</dd>
    </dl>`;
  }
};
k.styles = Ri;
_([
  $()
], k.prototype, "config", 2);
_([
  $()
], k.prototype, "session", 2);
_([
  $()
], k.prototype, "page", 2);
_([
  $()
], k.prototype, "live", 2);
_([
  $()
], k.prototype, "capture", 2);
_([
  $()
], k.prototype, "now", 2);
_([
  $()
], k.prototype, "toast", 2);
_([
  $()
], k.prototype, "maskDoorCode", 2);
_([
  $()
], k.prototype, "showDoorCode", 2);
_([
  $()
], k.prototype, "exportMode", 2);
_([
  $()
], k.prototype, "deviceEdits", 2);
_([
  $()
], k.prototype, "indoorInput", 2);
_([
  $()
], k.prototype, "receivedCount", 2);
_([
  $()
], k.prototype, "waitForFrame", 2);
k = _([
  De(se)
], k);
window.customCards = window.customCards ?? [];
window.customCards.some((e) => e.type === se) || window.customCards.push({
  type: se,
  name: "ABB-Welcome Wizard",
  description: "Assistent zum Einmessen von Klingeln und Türöffnern einer Busch-/ABB-Welcome-Anlage.",
  preview: !1,
  documentationURL: "https://github.com/jako-dev/esp32-abb-wizard-card"
});
console.info(
  `%c ABB-WELCOME-WIZARD-CARD %c ${Vi} `,
  "background:#03a9f4;color:#fff",
  "background:#444;color:#fff"
);
const Ge = "abb-welcome-door-card", me = {
  layout: "tiles",
  ring_window: 60,
  hold_time: 800,
  action: "unlock"
}, ge = (e, t, n) => {
  if (e !== void 0) {
    if (typeof e == "string" && t.includes(e)) return e;
    throw new Error(`"${n}" muss einer dieser Werte sein: ${t.join(", ")}.`);
  }
}, Fe = (e, t, n) => {
  if (!(e === void 0 || e === "" || e === null)) {
    if (typeof e != "string" || !e.startsWith(`${t}.`))
      throw new Error(`"${n}" muss eine ${t}-Entität sein (z. B. ${t}.haustuer).`);
    return e;
  }
};
function Ji(e) {
  if (typeof e != "object" || e === null) throw new Error("Ungültige Konfiguration.");
  const t = e;
  if (!Array.isArray(t.doors)) throw new Error('"doors" muss eine Liste von Türen sein.');
  const n = t.ring_window;
  if (n !== void 0 && (typeof n != "number" || n < 0 || n > 600))
    throw new Error('"ring_window" muss zwischen 0 und 600 Sekunden liegen.');
  const i = t.hold_time;
  if (i !== void 0 && (typeof i != "number" || i < 200 || i > 5e3))
    throw new Error('"hold_time" muss zwischen 200 und 5000 ms liegen.');
  const s = t.doors.map((o, a) => {
    if (typeof o != "object" || o === null) throw new Error(`Tür ${a + 1}: ungültiger Eintrag.`);
    const d = o, l = typeof d.name == "string" && d.name.trim() !== "" ? d.name.trim() : void 0, h = `Tür ${l ? `„${l}“` : a + 1}`;
    try {
      const u = {
        name: l ?? `Tür ${a + 1}`,
        lock: Fe(d.lock, "lock", "lock"),
        doorbell: Fe(d.doorbell, "binary_sensor", "doorbell"),
        camera: Fe(d.camera, "camera", "camera"),
        camera_view: ge(d.camera_view, ["ring", "always"], "camera_view"),
        confirm: ge(d.confirm, ["slide", "hold", "tap", "dialog"], "confirm"),
        action: ge(d.action, ["unlock", "open"], "action")
      };
      if (typeof d.icon == "string" && d.icon !== "" && (u.icon = d.icon), d.users !== void 0) {
        if (!Array.isArray(d.users) || d.users.some((f) => typeof f != "string"))
          throw new Error('"users" muss eine Liste von Benutzer-IDs sein.');
        u.users = d.users;
      }
      if (!u.lock && !u.doorbell) throw new Error('braucht mindestens "lock" oder "doorbell".');
      for (const f of Object.keys(u))
        u[f] === void 0 && delete u[f];
      return u;
    } catch (u) {
      throw new Error(`${h}: ${u.message}`);
    }
  }), r = t.layout === "compact" ? "bar" : t.layout;
  return {
    ...t,
    layout: ge(r, ["tiles", "rows", "buttons", "bar"], "layout"),
    doors: s
  };
}
function Re(e, t, n = "main") {
  const i = e.confirm ?? (t === "buttons" ? "hold" : "slide");
  return i === "slide" && n === "main" && (t === "buttons" || t === "bar") ? "hold" : i;
}
const Pt = (e, t) => typeof e?.attributes.friendly_name == "string" ? e.attributes.friendly_name : t;
function dn(e) {
  const t = Object.keys(e).sort(), n = t.filter((r) => r.startsWith("lock.")), i = /* @__PURE__ */ new Set(), s = [];
  for (const r of t.filter((o) => /^binary_sensor\..*klingel_?/.test(o))) {
    const o = r.replace(/^binary_sensor\..*klingel_?/, ""), a = o ? n.find((l) => !i.has(l) && l.endsWith(o)) : void 0;
    a && i.add(a);
    const d = Pt(e[r], o).replace(/^.*Klingel\s*/i, "") || o;
    s.push({ name: d, doorbell: r, ...a ? { lock: a } : {} });
  }
  for (const r of n.filter((o) => !i.has(o)))
    s.push({ name: Pt(e[r], r), lock: r });
  return s;
}
function Mt(e) {
  switch (e) {
    case "locked":
      return { label: "Verriegelt", tone: "locked" };
    case "unlocking":
      return { label: "Wird entriegelt …", tone: "busy" };
    case "locking":
      return { label: "Wird verriegelt …", tone: "busy" };
    case "opening":
      return { label: "Wird geöffnet …", tone: "busy" };
    case "unlocked":
      return { label: "Entriegelt", tone: "open" };
    case "open":
      return { label: "Offen", tone: "open" };
    case "jammed":
      return { label: "Blockiert", tone: "problem" };
    case void 0:
      return { label: "Nicht gefunden", tone: "unavailable" };
    default:
      return { label: "Nicht verfügbar", tone: "unavailable" };
  }
}
const Pe = (e) => e === "unlocking" || e === "unlocked" || e === "opening" || e === "open", Xi = (e) => e === "unlocked" || e === "open";
function Qi(e, t, n) {
  if (e === void 0 || n <= 0) return 0;
  const i = Math.ceil((e + n * 1e3 - t) / 1e3);
  return i > 0 ? Math.min(i, n) : 0;
}
function es(e, t) {
  const n = Math.max(0, Math.round((t - e) / 1e3));
  if (n < 45) return "gerade eben";
  if (n < 3600) return `vor ${Math.max(1, Math.round(n / 60))} min`;
  const i = new Date(e), s = i.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }), r = new Date(t), o = Math.round(
    (new Date(r.getFullYear(), r.getMonth(), r.getDate()).getTime() - new Date(i.getFullYear(), i.getMonth(), i.getDate()).getTime()) / 864e5
  );
  return o === 0 ? n < 6 * 3600 ? `vor ${Math.round(n / 3600)} h` : `heute ${s}` : o === 1 ? `gestern ${s}` : `${i.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })} ${s}`;
}
function Lt(e, t) {
  return !e.users || e.users.length === 0 || t !== void 0 && e.users.includes(t);
}
function ts(e, t, n) {
  return e.map((i, s) => ({ door: i, index: s })).sort((i, s) => {
    const r = t(i.door) > 0, o = t(s.door) > 0;
    return r !== o ? r ? -1 : 1 : r && o ? n(s.door) - n(i.door) : i.index - s.index;
  }).map((i) => i.door);
}
var ns = Object.defineProperty, is = Object.getOwnPropertyDescriptor, dt = (e, t, n, i) => {
  for (var s = i > 1 ? void 0 : i ? is(t, n) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (s = (i ? o(t, n, s) : o(s)) || s);
  return i && s && ns(t, n, s), s;
};
const cn = "abb-welcome-door-card-editor", ss = [
  { name: "title", selector: { text: {} } },
  {
    type: "grid",
    name: "",
    schema: [
      {
        name: "layout",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "tiles", label: "Kacheln (Tablet)" },
              { value: "rows", label: "Liste (Handy)" },
              { value: "buttons", label: "Schlüssel-Knöpfe (Wandtablet)" },
              { value: "bar", label: "Statusleiste (kompakt)" }
            ]
          }
        }
      },
      {
        name: "ring_window",
        selector: { number: { min: 0, max: 600, step: 5, mode: "box", unit_of_measurement: "s" } }
      }
    ]
  }
], rs = [
  {
    type: "grid",
    name: "",
    schema: [
      { name: "name", required: !0, selector: { text: {} } },
      { name: "icon", selector: { icon: {} } }
    ]
  },
  { name: "lock", selector: { entity: { domain: "lock" } } },
  { name: "doorbell", selector: { entity: { domain: "binary_sensor" } } },
  {
    type: "grid",
    name: "",
    schema: [
      {
        name: "confirm",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "slide", label: "Schieben" },
              { value: "hold", label: "Gedrückt halten" },
              { value: "dialog", label: "Mit Rückfrage" },
              { value: "tap", label: "Einmal tippen" }
            ]
          }
        }
      },
      {
        name: "action",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "unlock", label: "Entriegeln (Standard)" },
              { value: "open", label: "Öffnen / Falle ziehen" }
            ]
          }
        }
      }
    ]
  },
  { name: "camera", selector: { entity: { domain: "camera" } } },
  {
    name: "camera_view",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "ring", label: "Nur beim Klingeln" },
          { value: "always", label: "Immer" }
        ]
      }
    }
  }
], os = {
  title: "Titel (optional)",
  layout: "Darstellung",
  ring_window: "Klingel-Hinweis anzeigen für",
  name: "Name",
  icon: "Icon (optional)",
  lock: "Schloss",
  doorbell: "Klingel-Sensor (optional)",
  confirm: "Öffnen bestätigen durch (leer = passend zur Darstellung)",
  action: "Aktion",
  camera: "Kamera (optional)",
  camera_view: "Kamerabild zeigen"
}, as = {
  lock: "Schloss aus dem ABB-Welcome-Wizard oder jedes andere, z. B. Aqara.",
  doorbell: "z. B. binary_sensor.klingel_tor – hebt die Tür beim Klingeln hervor.",
  action: "„Öffnen“ nur für Schlösser mit Falle (z. B. Nuki „Tür aufziehen“)."
};
let re = class extends B {
  setConfig(e) {
    this.config = { ...e, doors: Array.isArray(e.doors) ? e.doors : [] };
  }
  emit(e) {
    this.config = e, this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config: e }, bubbles: !0, composed: !0 })
    );
  }
  clean(e) {
    const t = { ...e };
    for (const [n, i] of Object.entries(t))
      (i === "" || i === void 0 || i === null) && delete t[n];
    return t;
  }
  onCardChanged(e) {
    e.stopPropagation(), this.emit(this.clean({ ...this.config, ...e.detail.value, doors: this.config.doors }));
  }
  updateDoors(e) {
    this.emit({ ...this.config, doors: e });
  }
  onDoorChanged(e, t) {
    t.stopPropagation();
    const n = [...this.config.doors];
    n[e] = this.clean(t.detail.value), this.updateDoors(n);
  }
  move(e, t) {
    const n = [...this.config.doors], [i] = n.splice(e, 1);
    n.splice(e + t, 0, i), this.updateDoors(n);
  }
  discover() {
    const e = dn(this.hass?.states ?? {}), t = new Set(this.config.doors.flatMap((i) => [i.lock, i.doorbell]).filter(Boolean)), n = e.filter((i) => !t.has(i.lock) && !t.has(i.doorbell));
    this.updateDoors([...this.config.doors, ...n]);
  }
  render() {
    if (!this.config) return m;
    const e = this.config.doors, t = (i) => os[i.name] ?? i.name, n = (i) => as[i.name];
    return c`
      <ha-form
        .hass=${this.hass}
        .data=${this.config}
        .schema=${ss}
        .computeLabel=${t}
        @value-changed=${this.onCardChanged}
      ></ha-form>
      ${e.map(
      (i, s) => c`
          <div class="door">
            <div class="door-header">
              <b>${i.name || `Tür ${s + 1}`}</b>
              <button
                class="icon"
                title="Nach oben"
                ?disabled=${s === 0}
                @click=${() => this.move(s, -1)}
              >
                <ha-icon icon="mdi:arrow-up"></ha-icon>
              </button>
              <button
                class="icon"
                title="Nach unten"
                ?disabled=${s === e.length - 1}
                @click=${() => this.move(s, 1)}
              >
                <ha-icon icon="mdi:arrow-down"></ha-icon>
              </button>
              <button
                class="icon"
                title="Tür entfernen"
                @click=${() => this.updateDoors(e.filter((r, o) => o !== s))}
              >
                <ha-icon icon="mdi:delete-outline"></ha-icon>
              </button>
            </div>
            <ha-form
              .hass=${this.hass}
              .data=${i}
              .schema=${rs}
              .computeLabel=${t}
              .computeHelper=${n}
              @value-changed=${(r) => this.onDoorChanged(s, r)}
            ></ha-form>
          </div>
        `
    )}
      <div class="actions">
        <button @click=${() => this.updateDoors([...e, { name: "Neue Tür" }])}>+ Tür hinzufügen</button>
        <button @click=${this.discover}>Türen automatisch finden</button>
      </div>
      <p>
        „Automatisch finden“ sucht die Klingel-Sensoren und Schlösser aus dem ABB-Welcome-Wizard und alle
        anderen Schlösser. Bestimmte Benutzer kannst du per YAML mit <code>users:</code> (Benutzer-IDs)
        festlegen.
      </p>
    `;
  }
};
re.styles = Ye`
    .door {
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      border-radius: 12px;
      padding: 8px 12px 12px;
      margin-top: 12px;
    }
    .door-header {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 4px;
    }
    .door-header b {
      flex: 1;
    }
    .actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 12px;
    }
    button {
      font: inherit;
      cursor: pointer;
      border-radius: 999px;
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      background: transparent;
      color: var(--primary-color);
      padding: 6px 14px;
    }
    button.icon {
      border: none;
      padding: 4px;
      color: var(--secondary-text-color);
      --mdc-icon-size: 20px;
    }
    button:disabled {
      opacity: 0.35;
      cursor: default;
    }
    p {
      color: var(--secondary-text-color);
      font-size: 0.875rem;
    }
  `;
dt([
  $()
], re.prototype, "hass", 2);
dt([
  $()
], re.prototype, "config", 2);
re = dt([
  De(cn)
], re);
const ds = Ye`
  :host {
    --door-accent: var(--primary-color, #1a73e8);
    --door-on-accent: var(--text-primary-color, #fff);
    --door-text: var(--primary-text-color, #1b1c1f);
    --door-muted: var(--secondary-text-color, #5d636c);
    --door-line: var(--divider-color, rgba(0, 0, 0, 0.12));
    --door-surface: color-mix(in srgb, var(--door-text) 5%, transparent);
    --door-track: color-mix(in srgb, var(--door-text) 9%, transparent);
    /* Slider knob stays white in light and dark themes (like iOS); key buttons use the card colour. */
    --door-knob: #fff;
    --door-face: var(--card-background-color, #fff);
    --door-ok: var(--success-color, #43a047);
    --door-warn: var(--warning-color, #ef8f00);
    --door-error: var(--error-color, #db4437);
    --door-radius: 18px;
    display: block;
  }
  ha-card {
    color: var(--door-text);
    padding: 16px;
  }
  .title {
    margin: 0 0 12px;
    font-size: 1.15rem;
    font-weight: 600;
  }
  .empty {
    color: var(--door-muted);
  }
  ha-icon {
    --mdc-icon-size: 22px;
  }

  /* ---- Shared parts ---------------------------------------------------------------- */
  .head {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  .head-main,
  .keytile-head {
    all: unset;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex: 1;
    border-radius: 12px;
  }
  .head-main:focus-visible,
  .keytile-head:focus-visible {
    outline: 2px solid var(--door-accent);
    outline-offset: 3px;
  }
  .ico {
    flex: none;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    color: var(--tone);
    background: color-mix(in srgb, var(--tone) 15%, transparent);
    transition:
      background 0.3s,
      color 0.3s;
  }
  .tone-locked {
    --tone: var(--door-ok);
  }
  .tone-open {
    --tone: var(--door-warn);
  }
  .tone-busy {
    --tone: var(--door-accent);
  }
  .tone-problem {
    --tone: var(--door-error);
  }
  .tone-unavailable {
    --tone: var(--door-muted);
  }
  .ico.tone-ring {
    background: var(--door-accent);
    color: var(--door-on-accent);
  }
  .txt {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .name {
    font-size: 15px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .state {
    font-size: 13px;
    color: var(--door-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .badge {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px 4px 7px;
    border-radius: 999px;
    background: var(--door-accent);
    color: var(--door-on-accent);
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    --mdc-icon-size: 15px;
  }
  .mini {
    flex: none;
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 50%;
    border: 1px solid var(--door-line);
    background: transparent;
    color: var(--door-text);
    display: grid;
    place-items: center;
    cursor: pointer;
    --mdc-icon-size: 18px;
  }
  .camera {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border-radius: 12px;
    background: var(--door-track);
  }
  .hint {
    font-size: 12px;
    color: var(--door-muted);
  }
  .hint.error {
    color: var(--door-error);
  }
  button:focus-visible {
    outline: 2px solid var(--door-accent);
    outline-offset: 2px;
  }

  /* ---- Slider ("zum Öffnen schieben") --------------------------------------------- */
  .slider {
    position: relative;
    height: 48px;
    border-radius: 24px;
    background: var(--door-track);
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
    transition: background 0.3s;
  }
  .slider.small {
    height: 40px;
    width: 140px;
    flex: none;
  }
  .slabel {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding-left: 36px;
    font-size: 13px;
    font-weight: 500;
    color: var(--door-muted);
    opacity: var(--fade, 1);
    pointer-events: none;
    white-space: nowrap;
  }
  .slider.small .slabel {
    padding-left: 30px;
    font-size: 12px;
  }
  .knob {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 40px;
    height: 40px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: var(--door-knob);
    color: var(--door-accent);
    display: grid;
    place-items: center;
    cursor: grab;
    touch-action: none;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    transform: translateX(var(--x, 0));
    transition:
      transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1),
      left 0.4s cubic-bezier(0.2, 0.8, 0.2, 1),
      color 0.3s;
  }
  .slider.small .knob {
    width: 32px;
    height: 32px;
    --mdc-icon-size: 18px;
  }
  .slider.dragging .knob {
    transition: none;
    cursor: grabbing;
  }
  .slider.filled {
    background: var(--door-accent);
  }
  .slider.filled .slabel {
    color: var(--door-on-accent);
  }
  .slider.done,
  .slider.failed,
  .slider.busy {
    background: var(--door-ok);
  }
  .slider.failed {
    background: var(--door-error);
  }
  .slider.busy {
    background: var(--door-accent);
  }
  .slider.done .slabel,
  .slider.failed .slabel,
  .slider.busy .slabel {
    color: #fff;
    opacity: 1;
    padding-left: 0;
    padding-right: 44px;
  }
  .slider.done .knob,
  .slider.failed .knob,
  .slider.busy .knob {
    left: calc(100% - 44px);
    transform: none;
  }
  .slider.small.done .knob,
  .slider.small.failed .knob,
  .slider.small.busy .knob {
    left: calc(100% - 36px);
  }
  .slider.done .knob {
    color: var(--door-ok);
  }
  .slider.failed .knob {
    color: var(--door-error);
  }
  .slider.disabled {
    opacity: 0.45;
  }

  /* ---- Press button (hold / tap / dialog) ----------------------------------------- */
  .press {
    position: relative;
    overflow: hidden;
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    min-height: 48px;
    padding: 0 18px;
    border: none;
    border-radius: 24px;
    background: color-mix(in srgb, var(--door-accent) 14%, transparent);
    color: var(--door-accent);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    touch-action: none;
    --mdc-icon-size: 20px;
  }
  .press.full {
    width: 100%;
  }
  .press.small {
    min-height: 40px;
    padding: 0 14px;
    font-size: 13px;
    flex: none;
  }
  .press.filled {
    background: var(--door-accent);
    color: var(--door-on-accent);
  }
  .press.done {
    background: var(--door-ok);
    color: #fff;
  }
  .press.failed {
    background: var(--door-error);
    color: #fff;
  }
  .press > * {
    position: relative;
  }
  .press::before,
  .chip::before {
    content: '';
    position: absolute;
    inset: 0;
    background: color-mix(in srgb, var(--door-accent) 30%, transparent);
    transform: scaleX(0);
    transform-origin: left;
  }
  .press.filled::before {
    background: rgba(255, 255, 255, 0.3);
  }
  .press.holding::before,
  .chip.holding::before {
    transform: scaleX(1);
    transition: transform var(--hold-ms, 800ms) linear;
  }
  .press:disabled {
    opacity: 0.5;
    cursor: default;
  }

  /* ---- A · Tiles ------------------------------------------------------------------- */
  .tiles {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
    gap: 12px;
  }
  .tile {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 14px;
    border-radius: var(--door-radius);
    background: var(--door-surface);
    outline: 2px solid transparent;
    transition:
      outline-color 0.3s,
      background 0.3s;
  }
  .tile > .slider,
  .tile > .press {
    margin-top: auto;
  }
  .tile.ringing {
    grid-column: 1 / -1;
    outline-color: var(--door-accent);
    background: color-mix(in srgb, var(--door-accent) 9%, transparent);
  }

  /* ---- A · Rows -------------------------------------------------------------------- */
  .rows {
    display: flex;
    flex-direction: column;
  }
  .row {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 0;
    border-top: 1px solid var(--door-line);
  }
  .row:first-child {
    border-top: none;
  }
  .row.ringing {
    border-top: none;
    margin-bottom: 6px;
    padding: 12px;
    border-radius: var(--door-radius);
    background: color-mix(in srgb, var(--door-accent) 12%, transparent);
  }
  .row.ringing + .row {
    border-top: none;
  }

  /* ---- B · Round key buttons ------------------------------------------------------- */
  .buttons {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 170px), 1fr));
    gap: 12px;
  }
  .keytile {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 16px 14px 18px;
    border-radius: 22px;
    background: var(--door-surface);
    text-align: center;
    transition:
      background 0.3s,
      color 0.3s;
  }
  .keytile-head {
    flex-direction: column;
    gap: 2px;
    align-items: center;
    flex: none;
    max-width: 100%;
  }
  .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    margin-right: 6px;
    border-radius: 50%;
    background: var(--tone);
    vertical-align: 1px;
  }
  .keytile.ringing {
    background: var(--door-accent);
    color: var(--door-on-accent);
  }
  .keytile.ringing .state,
  .keytile.ringing .keyhint {
    color: var(--door-on-accent);
  }
  .keytile.ringing .dot {
    background: var(--door-on-accent);
  }
  .key {
    position: relative;
    width: 104px;
    height: 104px;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    touch-action: none;
    border-radius: 50%;
  }
  .key:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .ring {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }
  .ring circle {
    fill: none;
    stroke-width: 4;
    stroke-linecap: round;
  }
  .ring-bg {
    stroke: var(--door-track);
  }
  .ring-fg {
    stroke: var(--door-accent);
  }
  .key.holding .ring-fg {
    stroke-dashoffset: 0 !important;
    transition: stroke-dashoffset var(--hold-ms, 800ms) linear;
  }
  .keytile.ringing .ring-bg {
    stroke: rgba(255, 255, 255, 0.35);
  }
  .keytile.ringing .ring-fg {
    stroke: #fff;
  }
  .face {
    position: absolute;
    inset: 10px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: var(--door-face);
    color: var(--door-accent);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    transition:
      background 0.3s,
      color 0.3s;
    --mdc-icon-size: 34px;
  }
  .face.idle {
    position: static;
    width: 84px;
    height: 84px;
    color: var(--door-muted);
    box-shadow: none;
    background: var(--door-track);
  }
  .keytile.done .face {
    background: var(--door-ok);
    color: #fff;
  }
  .keyhint {
    font-size: 12px;
    font-weight: 500;
    color: var(--door-muted);
  }

  /* ---- C · Status bar -------------------------------------------------------------- */
  .bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .chip {
    position: relative;
    overflow: hidden;
    font: inherit;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 52px;
    padding: 6px 14px 6px 6px;
    border-radius: 16px;
    border: 1px solid transparent;
    background: var(--door-surface);
    color: var(--door-text);
    text-align: left;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    touch-action: none;
  }
  .chip > * {
    position: relative;
  }
  .chip .ico {
    width: 36px;
    height: 36px;
    border-radius: 11px;
    --mdc-icon-size: 20px;
  }
  .chip .name {
    font-size: 14px;
  }
  .chip .state {
    font-size: 12px;
  }
  .chip.ringing {
    border-color: var(--door-accent);
  }
  .chip.done .ico {
    background: var(--door-ok);
    color: #fff;
  }
  .chip:disabled {
    opacity: 0.6;
    cursor: default;
  }
  .hero {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 12px;
    padding: 16px;
    border-radius: var(--door-radius);
    background: var(--door-accent);
    color: var(--door-on-accent);
    transition: background 0.3s;
  }
  .hero.done {
    background: var(--door-ok);
  }
  .hero-top {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .hero-ico {
    flex: none;
    width: 46px;
    height: 46px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    background: rgba(255, 255, 255, 0.2);
    --mdc-icon-size: 26px;
  }
  .hero-title {
    font-size: 18px;
    font-weight: 600;
  }
  .hero-text {
    font-size: 13px;
    opacity: 0.9;
  }
  .count {
    margin-left: auto;
    font-size: 24px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .hero-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .hero-actions > .slider,
  .hero-actions > .press {
    flex: 1;
  }
  .hero .slider.filled {
    background: rgba(255, 255, 255, 0.22);
  }
  .hero .press.filled {
    background: #fff;
    color: var(--door-accent);
  }
  .hero .hint {
    color: var(--door-on-accent);
  }
  .ghost {
    flex: none;
    font: inherit;
    font-size: 13px;
    font-weight: 500;
    padding: 10px 14px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.55);
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  @media (prefers-reduced-motion: reduce) {
    .knob,
    .tile,
    .press::before,
    .chip::before {
      transition: none !important;
    }
  }
`;
var cs = Object.defineProperty, ls = Object.getOwnPropertyDescriptor, D = (e, t, n, i) => {
  for (var s = i > 1 ? void 0 : i ? ls(t, n) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (s = (i ? o(t, n, s) : o(s)) || s);
  return i && s && cs(t, n, s), s;
};
const us = 8e3, ps = 4e3, hs = 6e3, fs = 168 * 3600 * 1e3, ms = 0.85, gs = 4, Nt = 2 * Math.PI * 48, T = (e) => c`<ha-icon icon=${e}></ha-icon>`;
let A = class extends B {
  constructor() {
    super(...arguments), this.now = Date.now(), this.lastRings = {}, this.dismissed = {}, this.pending = {};
  }
  static getConfigElement() {
    return document.createElement(cn);
  }
  static getStubConfig(e) {
    const t = dn(e?.states ?? {});
    return { doors: t.length > 0 ? t : [{ name: "Haustür", lock: "lock.haustuer" }] };
  }
  setConfig(e) {
    this.config = Ji(e), this.pending = {}, this.confirming = void 0, this.loadRingHistory();
  }
  getCardSize() {
    const e = this.config?.doors.length ?? 1;
    switch (this.layout) {
      case "bar":
        return 2;
      case "rows":
        return e + 1;
      case "buttons":
        return 4;
      default:
        return 2 * Math.ceil(e / 2) + 1;
    }
  }
  getGridOptions() {
    return { columns: 12, min_columns: 4 };
  }
  set hass(e) {
    const t = this._hass;
    if (this._hass = e, this.config) {
      const n = { ...this.lastRings };
      let i = !1;
      for (const s of this.config.doors) {
        if (!s.doorbell) continue;
        const r = e.states[s.doorbell], o = t?.states[s.doorbell];
        t && r?.state === "on" && o?.state !== "on" && (n[s.doorbell] = Date.parse(r.last_changed) || Date.now(), i = !0);
      }
      i && (this.lastRings = n), this.updatePending(e);
    }
    t || this.loadRingHistory(), this.requestUpdate();
  }
  get hass() {
    return this._hass;
  }
  connectedCallback() {
    super.connectedCallback(), this.timer = window.setInterval(() => this.tick(), 1e3);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.clearInterval(this.timer), this.cancelHold();
  }
  get layout() {
    return this.config?.layout ?? me.layout;
  }
  /** Last ring per doorbell from the recorder, so "klingelte vor …" survives reloads and restarts. */
  async loadRingHistory() {
    const e = (this.config?.doors ?? []).flatMap((n) => n.doorbell ? [n.doorbell] : []), t = e.join(",");
    if (!(!this._hass?.connection?.sendMessagePromise || e.length === 0 || this.historyLoadedFor === t)) {
      this.historyLoadedFor = t;
      try {
        const n = Date.now(), i = await nn(this._hass.connection, e, n - fs, n), s = { ...wi(i) };
        for (const [r, o] of Object.entries(this.lastRings))
          s[r] = Math.max(o, s[r] ?? 0);
        this.lastRings = s;
      } catch {
      }
    }
  }
  tick() {
    this.now = Date.now(), this.confirming && this.now > this.confirming.until && (this.confirming = void 0), this.hint && this.now > this.hint.until && (this.hint = void 0);
    let e = !1;
    const t = { ...this.pending };
    for (const [n, i] of Object.entries(t)) {
      const s = Number(n);
      i.phase === "sent" && this.now - i.at > us ? (t[s] = { phase: "noresponse", at: this.now }, e = !0) : i.phase !== "sending" && i.phase !== "sent" && this.now - i.at > ps && (delete t[s], e = !0);
    }
    e && (this.pending = t);
  }
  updatePending(e) {
    if (!this.config) return;
    let t = !1;
    const n = { ...this.pending };
    this.config.doors.forEach((i, s) => {
      n[s]?.phase === "sent" && i.lock && Pe(e.states[i.lock]?.state) && (n[s] = { phase: "done", at: Date.now() }, this.haptic("success"), t = !0);
    }), t && (this.pending = n);
  }
  haptic(e) {
    window.dispatchEvent(new CustomEvent("haptic", { detail: e }));
  }
  moreInfo(e) {
    e && this.dispatchEvent(
      new CustomEvent("hass-more-info", { detail: { entityId: e }, bubbles: !0, composed: !0 })
    );
  }
  // ---- Opening ---------------------------------------------------------------------------------------
  async callLock(e, t, n) {
    if (!(!this._hass || !t.lock)) {
      this.pending = { ...this.pending, [e]: { phase: "sending" } };
      try {
        await this._hass.callService("lock", n, { entity_id: t.lock });
        const i = n === "lock" || Pe(this._hass.states[t.lock]?.state);
        this.pending = {
          ...this.pending,
          [e]: i ? { phase: "done", at: Date.now() } : { phase: "sent", at: Date.now() }
        }, i && this.haptic("success");
      } catch (i) {
        const s = i instanceof Error ? i.message : i?.message ?? String(i);
        this.pending = { ...this.pending, [e]: { phase: "error", at: Date.now(), message: s } }, this.haptic("failure");
      }
    }
  }
  openDoor(e, t) {
    this.confirming = void 0, this.callLock(e, t, t.action ?? me.action);
  }
  holdTime() {
    return this.config?.hold_time ?? me.hold_time;
  }
  isBusy(e) {
    const t = this.pending[e]?.phase;
    return t === "sending" || t === "sent";
  }
  startHold(e, t, n) {
    n.preventDefault(), !(this.holding !== void 0 || this.isBusy(e)) && (this.holding = e, this.haptic("light"), this.holdTimer = window.setTimeout(() => {
      this.holdTimer = void 0, this.holding = void 0, this.openDoor(e, t);
    }, this.holdTime()));
  }
  endHold(e) {
    this.holding === e && (this.holdTimer !== void 0 && (this.hint = { index: e, text: "Zum Öffnen gedrückt halten", until: Date.now() + 2500 }), this.cancelHold());
  }
  cancelHold() {
    window.clearTimeout(this.holdTimer), this.holdTimer = void 0, this.holding = void 0;
  }
  /** Event handlers for buttons in hold / tap / dialog mode. */
  pressHandlers(e, t, n) {
    return n !== "hold" ? {
      click: () => {
        this.confirming?.index === e || n === "tap" ? this.openDoor(e, t) : this.confirming = { index: e, until: Date.now() + hs };
      }
    } : {
      pointerdown: (i) => {
        i.button === 0 && this.startHold(e, t, i);
      },
      pointerup: () => this.endHold(e),
      pointerleave: () => this.endHold(e),
      pointercancel: () => this.endHold(e),
      contextmenu: (i) => i.preventDefault(),
      keydown: (i) => {
        (i.key === "Enter" || i.key === " ") && !i.repeat && this.startHold(e, t, i);
      },
      keyup: (i) => {
        (i.key === "Enter" || i.key === " ") && this.endHold(e);
      },
      click: (i) => i.preventDefault()
    };
  }
  // ---- Slider ----------------------------------------------------------------------------------------
  slideStart(e, t, n) {
    if (this.isBusy(t) || n.button !== 0) return;
    n.preventDefault();
    const i = n.currentTarget, s = i.parentElement, r = Math.max(
      1,
      s.getBoundingClientRect().width - i.getBoundingClientRect().width - 2 * gs
    );
    i.setPointerCapture?.(n.pointerId), this.drag = { id: e, x: 0, max: r, start: n.clientX };
  }
  slideMove(e, t) {
    this.drag?.id === e && (this.drag = { ...this.drag, x: Math.min(this.drag.max, Math.max(0, t.clientX - this.drag.start)) });
  }
  slideEnd(e, t, n) {
    if (this.drag?.id !== e) return;
    const i = this.drag.x >= this.drag.max * ms;
    this.drag = void 0, i ? this.openDoor(t, n) : this.hint = { index: t, text: "Zum Öffnen ganz nach rechts schieben", until: Date.now() + 2500 };
  }
  // ---- State helpers ---------------------------------------------------------------------------------
  lastRing(e) {
    return e.doorbell ? this.lastRings[e.doorbell] ?? 0 : 0;
  }
  remaining(e) {
    if (!e.doorbell) return 0;
    const t = this.lastRings[e.doorbell];
    if (t !== void 0 && this.dismissed[e.doorbell] === t) return 0;
    const n = this._hass?.states[e.doorbell]?.state === "on", i = this.config?.ring_window ?? me.ring_window;
    return Math.max(n ? i : 0, Qi(t, this.now, i));
  }
  dismiss(e) {
    e.doorbell && (this.dismissed = { ...this.dismissed, [e.doorbell]: this.lastRing(e) });
  }
  lockState(e) {
    return e.lock ? this._hass?.states[e.lock]?.state : void 0;
  }
  tone(e) {
    return e.lock ? Mt(this.lockState(e)).tone : "locked";
  }
  operable(e) {
    return !!e.lock && Lt(e, this._hass?.user?.id);
  }
  doorIcon(e, t) {
    return e.icon ? e.icon : t ? "mdi:bell-ring" : e.lock ? Pe(this.lockState(e)) ? "mdi:lock-open-variant" : "mdi:lock" : "mdi:bell";
  }
  stateLine(e, t = !1) {
    const n = [];
    if (e.lock && n.push(Mt(this.lockState(e)).label), this.remaining(e) > 0) n.push("klingelt");
    else if (!t) {
      const i = this.lastRing(e);
      i > 0 ? n.push(`klingelte ${es(i, this.now)}`) : e.lock || n.push("Klingel");
    }
    return n.join(" · ");
  }
  /** Label for the action, reflecting a running or finished command. */
  actionLabel(e, t) {
    switch (this.pending[e]?.phase) {
      case "sending":
        return "Wird gesendet …";
      case "sent":
        return "Warte auf Tür …";
      case "done":
        return "Geöffnet";
      case "noresponse":
        return "Gesendet – keine Rückmeldung";
      case "error":
        return "Fehlgeschlagen";
      default:
        return this.confirming?.index === e ? "Wirklich öffnen?" : t;
    }
  }
  feedbackClass(e) {
    const t = this.pending[e]?.phase;
    return t === "done" ? "done" : t === "error" ? "failed" : this.isBusy(e) ? "busy" : "";
  }
  // ---- Rendering -------------------------------------------------------------------------------------
  render() {
    if (!this.config) return m;
    const e = ts(
      this.config.doors.map((n, i) => ({ door: n, index: i })),
      (n) => this.remaining(n.door),
      (n) => this.lastRing(n.door)
    ), t = this.config.doors.length === 0 ? c`<div class="empty">Noch keine Türen konfiguriert – im Karten-Editor hinzufügen.</div>` : this.layout === "rows" ? this.renderRows(e) : this.layout === "buttons" ? this.renderButtons(e) : this.layout === "bar" ? this.renderBar(e) : this.renderTiles(e);
    return c`
      <ha-card style="--hold-ms:${this.holdTime()}ms">
        ${this.config.title ? c`<h2 class="title">${this.config.title}</h2>` : m} ${t}
      </ha-card>
    `;
  }
  renderHead(e, t, n) {
    return c`<div class="head">
      <button class="head-main" @click=${() => this.moreInfo(e.lock ?? e.doorbell)}>
        <span class="ico tone-${t ? "ring" : this.tone(e)}"
          >${T(this.doorIcon(e, t))}</span
        >
        <span class="txt">
          <span class="name">${e.name}</span>
          <span class="state">${this.stateLine(e)}</span>
        </span>
      </button>
      ${t ? c`<span class="badge">${T("mdi:bell-ring")}${this.remaining(e)} s</span>` : m}
      ${n ?? m}
    </div>`;
  }
  renderLockAgain(e, t) {
    return !this.operable(e) || !Xi(this.lockState(e)) ? m : c`<button
      class="mini"
      title="${e.name} verriegeln"
      aria-label="${e.name} verriegeln"
      @click=${() => this.callLock(t, e, "lock")}
    >
      ${T("mdi:lock")}
    </button>`;
  }
  renderHint(e, t) {
    const n = this.pending[t];
    return n?.phase === "error" ? c`<div class="hint error">Fehler: ${n.message}</div>` : this.hint?.index === t ? c`<div class="hint">${this.hint.text}</div>` : e.lock && !Lt(e, this._hass?.user?.id) ? c`<div class="hint">Öffnen nur für berechtigte Personen</div>` : m;
  }
  renderCamera(e, t) {
    const n = e.camera ? this._hass?.states[e.camera]?.attributes.entity_picture : void 0;
    if (typeof n != "string" || !(t || e.camera_view === "always")) return m;
    const i = `${n}${n.includes("?") ? "&" : "?"}t=${Math.floor(this.now / 2e3)}`;
    return c`<img class="camera" alt="Kamera ${e.name}" src=${i} />`;
  }
  /** The open control for a door: slider, hold / tap / dialog button. */
  renderAction(e, t, n = {}) {
    if (!this.operable(e)) return m;
    const i = this.tone(e) === "unavailable", s = Re(e, this.layout, n.place), r = n.size ?? "full", o = n.filled ? "filled" : "";
    if (s === "slide") {
      const l = `${n.place ?? "main"}-${t}`, h = this.drag?.id === l, u = h ? this.drag.x : 0, f = h ? 1 - u / this.drag.max : 1, b = this.feedbackClass(t);
      return c`<div
        class="slider ${r} ${o} ${b} ${h ? "dragging" : ""} ${i ? "disabled" : ""}"
        style="--x:${u}px;--fade:${f}"
      >
        <span class="slabel"
          >${this.actionLabel(t, r === "small" ? "Öffnen" : "Zum Öffnen schieben")}</span
        >
        <button
          class="knob"
          aria-label="${e.name} öffnen – schieben oder Eingabetaste"
          ?disabled=${i || this.isBusy(t)}
          @pointerdown=${(p) => this.slideStart(l, t, p)}
          @pointermove=${(p) => this.slideMove(l, p)}
          @pointerup=${() => this.slideEnd(l, t, e)}
          @pointercancel=${() => this.drag = void 0}
          @keydown=${(p) => {
        (p.key === "Enter" || p.key === " " || p.key === "ArrowRight") && (p.preventDefault(), this.openDoor(t, e));
      }}
        >
          ${T(b === "done" ? "mdi:check" : b === "failed" ? "mdi:alert" : "mdi:chevron-double-right")}
        </button>
      </div>`;
    }
    const a = this.pressHandlers(t, e, s), d = s === "hold" ? r === "small" ? "Halten" : "Halten zum Öffnen" : "Öffnen";
    return c`<button
      class="press ${r} ${o} ${this.feedbackClass(t)} ${this.holding === t ? "holding" : ""}"
      ?disabled=${i || this.isBusy(t)}
      aria-label="${e.name} öffnen"
      @pointerdown=${"pointerdown" in a ? a.pointerdown : void 0}
      @pointerup=${"pointerup" in a ? a.pointerup : void 0}
      @pointerleave=${"pointerleave" in a ? a.pointerleave : void 0}
      @pointercancel=${"pointercancel" in a ? a.pointercancel : void 0}
      @contextmenu=${"contextmenu" in a ? a.contextmenu : void 0}
      @keydown=${"keydown" in a ? a.keydown : void 0}
      @keyup=${"keyup" in a ? a.keyup : void 0}
      @click=${a.click}
    >
      ${T(this.pending[t]?.phase === "done" ? "mdi:check" : "mdi:door-open")}
      <span>${this.actionLabel(t, d)}</span>
    </button>`;
  }
  // A · Tiles: ringing doors span the full width.
  renderTiles(e) {
    return c`<div class="tiles">
      ${e.map(({ door: t, index: n }) => {
      const i = this.remaining(t) > 0;
      return c`<div class="tile ${i ? "ringing" : ""}">
          ${this.renderHead(t, i, this.renderLockAgain(t, n))}
          ${this.renderCamera(t, i)} ${this.renderAction(t, n, { filled: i })}
          ${this.renderHint(t, n)}
        </div>`;
    })}
    </div>`;
  }
  // A · List for phones: compact control on the right, full slider for ringing doors.
  renderRows(e) {
    return c`<div class="rows">
      ${e.map(({ door: t, index: n }) => {
      const i = this.remaining(t) > 0, s = c`${this.renderLockAgain(t, n)}
        ${i ? m : this.renderAction(t, n, { size: "small" })}`;
      return c`<div class="row ${i ? "ringing" : ""}">
          ${this.renderHead(t, i, s)} ${this.renderCamera(t, i)}
          ${i ? this.renderAction(t, n, { filled: !0 }) : m}
          ${this.renderHint(t, n)}
        </div>`;
    })}
    </div>`;
  }
  // B · Large round key buttons with a progress ring while holding.
  renderButtons(e) {
    return c`<div class="buttons">
      ${e.map(({ door: t, index: n }) => {
      const i = this.remaining(t) > 0, s = Re(t, "buttons"), r = this.pressHandlers(n, t, s), o = this.tone(t) === "unavailable" || this.isBusy(n), a = this.pending[n]?.phase;
      return c`<div class="keytile ${i ? "ringing" : ""} ${this.feedbackClass(n)}">
          <button class="keytile-head" @click=${() => this.moreInfo(t.lock ?? t.doorbell)}>
            <span class="name">${t.name}</span>
            <span class="state"
              ><span class="dot tone-${this.tone(t)}"></span>${this.stateLine(t, !0)}</span
            >
          </button>
          ${this.renderCamera(t, i)}
          ${this.operable(t) ? c`<button
                    class="key ${this.holding === n ? "holding" : ""}"
                    aria-label="${t.name} öffnen"
                    ?disabled=${o}
                    @pointerdown=${"pointerdown" in r ? r.pointerdown : void 0}
                    @pointerup=${"pointerup" in r ? r.pointerup : void 0}
                    @pointerleave=${"pointerleave" in r ? r.pointerleave : void 0}
                    @pointercancel=${"pointercancel" in r ? r.pointercancel : void 0}
                    @contextmenu=${"contextmenu" in r ? r.contextmenu : void 0}
                    @keydown=${"keydown" in r ? r.keydown : void 0}
                    @keyup=${"keyup" in r ? r.keyup : void 0}
                    @click=${r.click}
                  >
                    <svg class="ring" viewBox="0 0 104 104" aria-hidden="true">
                      ${kn`<circle class="ring-bg" cx="52" cy="52" r="48"></circle>
                    <circle class="ring-fg" cx="52" cy="52" r="48" style="stroke-dasharray:${Nt};stroke-dashoffset:${Nt}"></circle>`}
                    </svg>
                    <span class="face"
                      >${T(a === "done" ? "mdi:check" : t.icon ?? "mdi:key-variant")}</span
                    >
                  </button>
                  <span class="keyhint"
                    >${this.actionLabel(n, s === "hold" ? "Gedrückt halten" : "Tippen zum Öffnen")}</span
                  >` : c`<span class="face idle">${T(this.doorIcon(t, i))}</span>`}
          ${this.renderLockAgain(t, n)} ${this.renderHint(t, n)}
        </div>`;
    })}
    </div>`;
  }
  // C · Status bar: chips, plus a large panel for the ringing door.
  renderBar(e) {
    const t = e.find((n) => this.remaining(n.door) > 0);
    return c`
      ${t ? this.renderHero(t) : m}
      <div class="bar">${e.map((n) => this.renderChip(n, n === t))}</div>
    `;
  }
  renderHero({ door: e, index: t }) {
    const n = this.pending[t]?.phase === "done";
    return c`<div class="hero ${n ? "done" : ""}" role="status">
      <div class="hero-top">
        <span class="hero-ico">${T(n ? "mdi:check" : "mdi:bell-ring")}</span>
        <span class="txt">
          <span class="hero-title">${n ? `${e.name} geöffnet` : `Es klingelt: ${e.name}`}</span>
          <span class="hero-text"
            >${n ? "Bestätigt" : e.lock ? "Jetzt öffnen, solange der Ruf aktiv ist" : this.stateLine(e)}</span
          >
        </span>
        <span class="count">${this.remaining(e)} s</span>
      </div>
      ${this.renderCamera(e, !0)}
      <div class="hero-actions">
        ${this.renderAction(e, t, { place: "hero", filled: !0 })}
        <button class="ghost" @click=${() => this.dismiss(e)}>Ignorieren</button>
      </div>
      ${this.renderHint(e, t)}
    </div>`;
  }
  renderChip({ door: e, index: t }, n) {
    const i = this.operable(e) && this.tone(e) !== "unavailable", s = Re(e, "bar"), r = i ? this.pressHandlers(t, e, s) : { click: () => this.moreInfo(e.doorbell) }, o = this.pending[t] || this.confirming?.index === t ? this.actionLabel(t, "") : this.stateLine(e, !0);
    return c`<button
      class="chip ${n ? "ringing" : ""} ${this.holding === t ? "holding" : ""} ${this.feedbackClass(t)}"
      title=${this.stateLine(e)}
      aria-label=${i ? `${e.name} öffnen` : e.name}
      ?disabled=${this.isBusy(t)}
      @pointerdown=${"pointerdown" in r ? r.pointerdown : void 0}
      @pointerup=${"pointerup" in r ? r.pointerup : void 0}
      @pointerleave=${"pointerleave" in r ? r.pointerleave : void 0}
      @pointercancel=${"pointercancel" in r ? r.pointercancel : void 0}
      @contextmenu=${"contextmenu" in r ? r.contextmenu : void 0}
      @keydown=${"keydown" in r ? r.keydown : void 0}
      @keyup=${"keyup" in r ? r.keyup : void 0}
      @click=${r.click}
    >
      <span class="ico tone-${n ? "ring" : this.tone(e)}"
        >${T(this.doorIcon(e, n))}</span
      >
      <span class="txt"><span class="name">${e.name}</span><span class="state">${o}</span></span>
    </button>`;
  }
};
A.styles = ds;
D([
  $()
], A.prototype, "config", 2);
D([
  $()
], A.prototype, "now", 2);
D([
  $()
], A.prototype, "lastRings", 2);
D([
  $()
], A.prototype, "dismissed", 2);
D([
  $()
], A.prototype, "pending", 2);
D([
  $()
], A.prototype, "holding", 2);
D([
  $()
], A.prototype, "drag", 2);
D([
  $()
], A.prototype, "confirming", 2);
D([
  $()
], A.prototype, "hint", 2);
A = D([
  De(Ge)
], A);
window.customCards = window.customCards ?? [];
window.customCards.some((e) => e.type === Ge) || window.customCards.push({
  type: Ge,
  name: "ABB-Welcome Türen",
  description: "Türen öffnen und verriegeln, mit Klingel-Anzeige – für ABB-Welcome-Schlösser und jedes andere Schloss.",
  preview: !0,
  documentationURL: "https://github.com/jako-dev/esp32-abb-wizard-card"
});
