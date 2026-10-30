/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ue = globalThis, Ne = ue.ShadowRoot && (ue.ShadyCSS === void 0 || ue.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Be = Symbol(), Ze = /* @__PURE__ */ new WeakMap();
let xt = class {
  constructor(t, s, n) {
    if (this._$cssResult$ = !0, n !== Be) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = s;
  }
  get styleSheet() {
    let t = this.o;
    const s = this.t;
    if (Ne && t === void 0) {
      const n = s !== void 0 && s.length === 1;
      n && (t = Ze.get(s)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), n && Ze.set(s, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Ut = (e) => new xt(typeof e == "string" ? e : e + "", void 0, Be), jt = (e, ...t) => {
  const s = e.length === 1 ? e[0] : t.reduce((n, i, r) => n + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + e[r + 1], e[0]);
  return new xt(s, e, Be);
}, Wt = (e, t) => {
  if (Ne) e.adoptedStyleSheets = t.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of t) {
    const n = document.createElement("style"), i = ue.litNonce;
    i !== void 0 && n.setAttribute("nonce", i), n.textContent = s.cssText, e.appendChild(n);
  }
}, Je = Ne ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let s = "";
  for (const n of t.cssRules) s += n.cssText;
  return Ut(s);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Vt, defineProperty: Gt, getOwnPropertyDescriptor: qt, getOwnPropertyNames: Yt, getOwnPropertySymbols: Zt, getPrototypeOf: Jt } = Object, we = globalThis, Xe = we.trustedTypes, Xt = Xe ? Xe.emptyScript : "", Qt = we.reactiveElementPolyfillSupport, V = (e, t) => e, me = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? Xt : null;
      break;
    case Object:
    case Array:
      e = e == null ? e : JSON.stringify(e);
  }
  return e;
}, fromAttribute(e, t) {
  let s = e;
  switch (t) {
    case Boolean:
      s = e !== null;
      break;
    case Number:
      s = e === null ? null : Number(e);
      break;
    case Object:
    case Array:
      try {
        s = JSON.parse(e);
      } catch {
        s = null;
      }
  }
  return s;
} }, Me = (e, t) => !Vt(e, t), Qe = { attribute: !0, type: String, converter: me, reflect: !1, useDefault: !1, hasChanged: Me };
Symbol.metadata ??= Symbol("metadata"), we.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let P = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, s = Qe) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(t, s), !s.noAccessor) {
      const n = Symbol(), i = this.getPropertyDescriptor(t, n, s);
      i !== void 0 && Gt(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, s, n) {
    const { get: i, set: r } = qt(this.prototype, t) ?? { get() {
      return this[s];
    }, set(o) {
      this[s] = o;
    } };
    return { get: i, set(o) {
      const d = i?.call(this);
      r?.call(this, o), this.requestUpdate(t, d, n);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? Qe;
  }
  static _$Ei() {
    if (this.hasOwnProperty(V("elementProperties"))) return;
    const t = Jt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(V("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(V("properties"))) {
      const s = this.properties, n = [...Yt(s), ...Zt(s)];
      for (const i of n) this.createProperty(i, s[i]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const s = litPropertyMetadata.get(t);
      if (s !== void 0) for (const [n, i] of s) this.elementProperties.set(n, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, n] of this.elementProperties) {
      const i = this._$Eu(s, n);
      i !== void 0 && this._$Eh.set(i, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const s = [];
    if (Array.isArray(t)) {
      const n = new Set(t.flat(1 / 0).reverse());
      for (const i of n) s.unshift(Je(i));
    } else t !== void 0 && s.push(Je(t));
    return s;
  }
  static _$Eu(t, s) {
    const n = s.attribute;
    return n === !1 ? void 0 : typeof n == "string" ? n : typeof t == "string" ? t.toLowerCase() : void 0;
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
    const t = /* @__PURE__ */ new Map(), s = this.constructor.elementProperties;
    for (const n of s.keys()) this.hasOwnProperty(n) && (t.set(n, this[n]), delete this[n]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Wt(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, s, n) {
    this._$AK(t, n);
  }
  _$ET(t, s) {
    const n = this.constructor.elementProperties.get(t), i = this.constructor._$Eu(t, n);
    if (i !== void 0 && n.reflect === !0) {
      const r = (n.converter?.toAttribute !== void 0 ? n.converter : me).toAttribute(s, n.type);
      this._$Em = t, r == null ? this.removeAttribute(i) : this.setAttribute(i, r), this._$Em = null;
    }
  }
  _$AK(t, s) {
    const n = this.constructor, i = n._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const r = n.getPropertyOptions(i), o = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : me;
      this._$Em = i;
      const d = o.fromAttribute(s, r.type);
      this[i] = d ?? this._$Ej?.get(i) ?? d, this._$Em = null;
    }
  }
  requestUpdate(t, s, n, i = !1, r) {
    if (t !== void 0) {
      const o = this.constructor;
      if (i === !1 && (r = this[t]), n ??= o.getPropertyOptions(t), !((n.hasChanged ?? Me)(r, s) || n.useDefault && n.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, n)))) return;
      this.C(t, s, n);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, s, { useDefault: n, reflect: i, wrapped: r }, o) {
    n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, o ?? s ?? this[t]), r !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || n || (s = void 0), this._$AL.set(t, s)), i === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (s) {
      Promise.reject(s);
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
        for (const [i, r] of this._$Ep) this[i] = r;
        this._$Ep = void 0;
      }
      const n = this.constructor.elementProperties;
      if (n.size > 0) for (const [i, r] of n) {
        const { wrapped: o } = r, d = this[i];
        o !== !0 || this._$AL.has(i) || d === void 0 || this.C(i, void 0, r, d);
      }
    }
    let t = !1;
    const s = this._$AL;
    try {
      t = this.shouldUpdate(s), t ? (this.willUpdate(s), this._$EO?.forEach((n) => n.hostUpdate?.()), this.update(s)) : this._$EM();
    } catch (n) {
      throw t = !1, this._$EM(), n;
    }
    t && this._$AE(s);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((s) => s.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
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
    this._$Eq &&= this._$Eq.forEach((s) => this._$ET(s, this[s])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
P.elementStyles = [], P.shadowRootOptions = { mode: "open" }, P[V("elementProperties")] = /* @__PURE__ */ new Map(), P[V("finalized")] = /* @__PURE__ */ new Map(), Qt?.({ ReactiveElement: P }), (we.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Re = globalThis, et = (e) => e, fe = Re.trustedTypes, tt = fe ? fe.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, kt = "$lit$", D = `lit$${Math.random().toFixed(9).slice(2)}$`, St = "?" + D, en = `<${St}>`, F = document, Z = () => F.createComment(""), J = (e) => e === null || typeof e != "object" && typeof e != "function", Le = Array.isArray, tn = (e) => Le(e) || typeof e?.[Symbol.iterator] == "function", xe = `[ 	
\f\r]`, j = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, nt = /-->/g, st = />/g, C = RegExp(`>|${xe}(?:([^\\s"'>=/]+)(${xe}*=${xe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), it = /'/g, rt = /"/g, zt = /^(?:script|style|textarea|title)$/i, nn = (e) => (t, ...s) => ({ _$litType$: e, strings: t, values: s }), c = nn(1), H = Symbol.for("lit-noChange"), f = Symbol.for("lit-nothing"), ot = /* @__PURE__ */ new WeakMap(), O = F.createTreeWalker(F, 129);
function Et(e, t) {
  if (!Le(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return tt !== void 0 ? tt.createHTML(t) : t;
}
const sn = (e, t) => {
  const s = e.length - 1, n = [];
  let i, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = j;
  for (let d = 0; d < s; d++) {
    const a = e[d];
    let l, h, p = -1, m = 0;
    for (; m < a.length && (o.lastIndex = m, h = o.exec(a), h !== null); ) m = o.lastIndex, o === j ? h[1] === "!--" ? o = nt : h[1] !== void 0 ? o = st : h[2] !== void 0 ? (zt.test(h[2]) && (i = RegExp("</" + h[2], "g")), o = C) : h[3] !== void 0 && (o = C) : o === C ? h[0] === ">" ? (o = i ?? j, p = -1) : h[1] === void 0 ? p = -2 : (p = o.lastIndex - h[2].length, l = h[1], o = h[3] === void 0 ? C : h[3] === '"' ? rt : it) : o === rt || o === it ? o = C : o === nt || o === st ? o = j : (o = C, i = void 0);
    const v = o === C && e[d + 1].startsWith("/>") ? " " : "";
    r += o === j ? a + en : p >= 0 ? (n.push(l), a.slice(0, p) + kt + a.slice(p) + D + v) : a + D + (p === -2 ? d : v);
  }
  return [Et(e, r + (e[s] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), n];
};
class X {
  constructor({ strings: t, _$litType$: s }, n) {
    let i;
    this.parts = [];
    let r = 0, o = 0;
    const d = t.length - 1, a = this.parts, [l, h] = sn(t, s);
    if (this.el = X.createElement(l, n), O.currentNode = this.el.content, s === 2 || s === 3) {
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
    for (; (i = O.nextNode()) !== null && a.length < d; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const p of i.getAttributeNames()) if (p.endsWith(kt)) {
          const m = h[o++], v = i.getAttribute(p).split(D), u = /([.?@])?(.*)/.exec(m);
          a.push({ type: 1, index: r, name: u[2], strings: v, ctor: u[1] === "." ? on : u[1] === "?" ? an : u[1] === "@" ? dn : _e }), i.removeAttribute(p);
        } else p.startsWith(D) && (a.push({ type: 6, index: r }), i.removeAttribute(p));
        if (zt.test(i.tagName)) {
          const p = i.textContent.split(D), m = p.length - 1;
          if (m > 0) {
            i.textContent = fe ? fe.emptyScript : "";
            for (let v = 0; v < m; v++) i.append(p[v], Z()), O.nextNode(), a.push({ type: 2, index: ++r });
            i.append(p[m], Z());
          }
        }
      } else if (i.nodeType === 8) if (i.data === St) a.push({ type: 2, index: r });
      else {
        let p = -1;
        for (; (p = i.data.indexOf(D, p + 1)) !== -1; ) a.push({ type: 7, index: r }), p += D.length - 1;
      }
      r++;
    }
  }
  static createElement(t, s) {
    const n = F.createElement("template");
    return n.innerHTML = t, n;
  }
}
function U(e, t, s = e, n) {
  if (t === H) return t;
  let i = n !== void 0 ? s._$Co?.[n] : s._$Cl;
  const r = J(t) ? void 0 : t._$litDirective$;
  return i?.constructor !== r && (i?._$AO?.(!1), r === void 0 ? i = void 0 : (i = new r(e), i._$AT(e, s, n)), n !== void 0 ? (s._$Co ??= [])[n] = i : s._$Cl = i), i !== void 0 && (t = U(e, i._$AS(e, t.values), i, n)), t;
}
class rn {
  constructor(t, s) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = s;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: s }, parts: n } = this._$AD, i = (t?.creationScope ?? F).importNode(s, !0);
    O.currentNode = i;
    let r = O.nextNode(), o = 0, d = 0, a = n[0];
    for (; a !== void 0; ) {
      if (o === a.index) {
        let l;
        a.type === 2 ? l = new ne(r, r.nextSibling, this, t) : a.type === 1 ? l = new a.ctor(r, a.name, a.strings, this, t) : a.type === 6 && (l = new cn(r, this, t)), this._$AV.push(l), a = n[++d];
      }
      o !== a?.index && (r = O.nextNode(), o++);
    }
    return O.currentNode = F, i;
  }
  p(t) {
    let s = 0;
    for (const n of this._$AV) n !== void 0 && (n.strings !== void 0 ? (n._$AI(t, n, s), s += n.strings.length - 2) : n._$AI(t[s])), s++;
  }
}
class ne {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, s, n, i) {
    this.type = 2, this._$AH = f, this._$AN = void 0, this._$AA = t, this._$AB = s, this._$AM = n, this.options = i, this._$Cv = i?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const s = this._$AM;
    return s !== void 0 && t?.nodeType === 11 && (t = s.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, s = this) {
    t = U(this, t, s), J(t) ? t === f || t == null || t === "" ? (this._$AH !== f && this._$AR(), this._$AH = f) : t !== this._$AH && t !== H && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : tn(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== f && J(this._$AH) ? this._$AA.nextSibling.data = t : this.T(F.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: s, _$litType$: n } = t, i = typeof n == "number" ? this._$AC(t) : (n.el === void 0 && (n.el = X.createElement(Et(n.h, n.h[0]), this.options)), n);
    if (this._$AH?._$AD === i) this._$AH.p(s);
    else {
      const r = new rn(i, this), o = r.u(this.options);
      r.p(s), this.T(o), this._$AH = r;
    }
  }
  _$AC(t) {
    let s = ot.get(t.strings);
    return s === void 0 && ot.set(t.strings, s = new X(t)), s;
  }
  k(t) {
    Le(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let n, i = 0;
    for (const r of t) i === s.length ? s.push(n = new ne(this.O(Z()), this.O(Z()), this, this.options)) : n = s[i], n._$AI(r), i++;
    i < s.length && (this._$AR(n && n._$AB.nextSibling, i), s.length = i);
  }
  _$AR(t = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); t !== this._$AB; ) {
      const n = et(t).nextSibling;
      et(t).remove(), t = n;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class _e {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, s, n, i, r) {
    this.type = 1, this._$AH = f, this._$AN = void 0, this.element = t, this.name = s, this._$AM = i, this.options = r, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(new String()), this.strings = n) : this._$AH = f;
  }
  _$AI(t, s = this, n, i) {
    const r = this.strings;
    let o = !1;
    if (r === void 0) t = U(this, t, s, 0), o = !J(t) || t !== this._$AH && t !== H, o && (this._$AH = t);
    else {
      const d = t;
      let a, l;
      for (t = r[0], a = 0; a < r.length - 1; a++) l = U(this, d[n + a], s, a), l === H && (l = this._$AH[a]), o ||= !J(l) || l !== this._$AH[a], l === f ? t = f : t !== f && (t += (l ?? "") + r[a + 1]), this._$AH[a] = l;
    }
    o && !i && this.j(t);
  }
  j(t) {
    t === f ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class on extends _e {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === f ? void 0 : t;
  }
}
class an extends _e {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== f);
  }
}
class dn extends _e {
  constructor(t, s, n, i, r) {
    super(t, s, n, i, r), this.type = 5;
  }
  _$AI(t, s = this) {
    if ((t = U(this, t, s, 0) ?? f) === H) return;
    const n = this._$AH, i = t === f && n !== f || t.capture !== n.capture || t.once !== n.once || t.passive !== n.passive, r = t !== f && (n === f || i);
    i && this.element.removeEventListener(this.name, this, n), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class cn {
  constructor(t, s, n) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = n;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    U(this, t);
  }
}
const ln = Re.litHtmlPolyfillSupport;
ln?.(X, ne), (Re.litHtmlVersions ??= []).push("3.3.3");
const un = (e, t, s) => {
  const n = s?.renderBefore ?? t;
  let i = n._$litPart$;
  if (i === void 0) {
    const r = s?.renderBefore ?? null;
    n._$litPart$ = i = new ne(t.insertBefore(Z(), r), r, void 0, s ?? {});
  }
  return i._$AI(e), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ke = globalThis;
class M extends P {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = un(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return H;
  }
}
M._$litElement$ = !0, M.finalized = !0, Ke.litElementHydrateSupport?.({ LitElement: M });
const pn = Ke.litElementPolyfillSupport;
pn?.({ LitElement: M });
(Ke.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Tt = (e) => (t, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const hn = { attribute: !0, type: String, converter: me, reflect: !1, hasChanged: Me }, mn = (e = hn, t, s) => {
  const { kind: n, metadata: i } = s;
  let r = globalThis.litPropertyMetadata.get(i);
  if (r === void 0 && globalThis.litPropertyMetadata.set(i, r = /* @__PURE__ */ new Map()), n === "setter" && ((e = Object.create(e)).wrapped = !0), r.set(s.name, e), n === "accessor") {
    const { name: o } = s;
    return { set(d) {
      const a = t.get.call(this);
      t.set.call(this, d), this.requestUpdate(o, a, e, !0, d);
    }, init(d) {
      return d !== void 0 && this.C(o, void 0, e, d), d;
    } };
  }
  if (n === "setter") {
    const { name: o } = s;
    return function(d) {
      const a = this[o];
      t.call(this, d), this.requestUpdate(o, a, e, !0, d);
    };
  }
  throw Error("Unsupported decorator location: " + n);
};
function fn(e) {
  return (t, s) => typeof s == "object" ? mn(e, t, s) : ((n, i, r) => {
    const o = i.hasOwnProperty(r);
    return i.constructor.createProperty(r, n), o ? Object.getOwnPropertyDescriptor(i, r) : void 0;
  })(e, t, s);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function _(e) {
  return fn({ ...e, state: !0, attribute: !1 });
}
const gn = { 1: "indoor", 2: "outdoor", 3: "gateway", 4: "door" };
function vn(e, t) {
  if (t) return e >> 16 === 0 ? e >> 8 & 255 : null;
  if (e > 65535) return null;
  const s = e >> 8;
  return (s & 15) === 0 ? s >> 4 : null;
}
function He(e, t) {
  const s = vn(e, t);
  return s !== null && gn[s] || "unknown";
}
const ke = (e, t) => He(e, t) === "indoor", bn = (e, t) => He(e, t) === "outdoor";
function $(e, t) {
  return "0x" + e.toString(16).padStart(t ? 6 : 4, "0");
}
function Se(e, t) {
  return e.toString(16).toUpperCase().padStart(t ? 6 : 4, "0");
}
function G(e) {
  return "0x" + e.toString(16).padStart(2, "0");
}
function q(e) {
  return e.map((t) => t.toString(16).toUpperCase().padStart(2, "0")).join(" ");
}
const yn = {
  indoor: "Innenstation",
  outdoor: "Außenstation",
  gateway: "Gateway",
  door: "Türsteuergerät",
  unknown: "Gerät"
};
function z(e, t) {
  const s = He(e, t), n = yn[s], i = $(e, t);
  return s === "indoor" || s === "outdoor" ? `${n} #${e & 255} (${i})` : `${n} (${i})`;
}
function pe(e) {
  const { x10: t, x1: s } = e;
  if (!(t === void 0 || s === void 0) && !(!Number.isInteger(t) || !Number.isInteger(s) || t < 0 || t > 9 || s < 0 || s > 9))
    return t * 10 + s;
}
function ge(e, t) {
  return (t ? 256 : 4096) | e & 255;
}
function $n(e, t) {
  return t ? [e >> 16 & 255, e >> 8 & 255, e & 255] : [e >> 8 & 255, e & 255];
}
function wn(e, t) {
  e: for (let s = 0; s + t.length <= e.length; s++) {
    for (let n = 0; n < t.length; n++) if (e[s + n] !== t[n]) continue e;
    return !0;
  }
  return !1;
}
function Dt(e, t) {
  return wn(e.data, $n(t, e.threeByte));
}
function Ue(e, t) {
  return e.src === t || e.dst === t || Dt(e, t);
}
const Q = 8, je = [
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
], R = "baseline", E = (e) => `ring:${typeof e == "string" ? e : e.key}`, T = (e) => `open:${typeof e == "string" ? e : e.key}`;
function ve(e) {
  const t = e.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return t === "" ? "tuer" : /^[0-9]/.test(t) ? `tuer_${t}` : t;
}
function We(e, t) {
  let s = e;
  for (let n = 2; t.has(s); n++) s = `${e}_${n}`;
  return t.add(s), s;
}
function Ct(e) {
  const t = /* @__PURE__ */ new Set(), s = {};
  for (const n of e) s[n.key] = We(n.id ? ve(n.id) : ve(n.name), t);
  return s;
}
function _n(e) {
  return e === "floor" ? "mdi:door-closed" : "mdi:door";
}
function be(e) {
  return e.icon ?? _n(e.type);
}
function se(e) {
  let t = !1;
  return e.map((s) => {
    const n = s.type === "outdoor" && s.open, i = n && s.default && !t;
    return i && (t = !0), { ...s, open: n, default: i };
  });
}
function An(e, t = "Neue Tür", s = "outdoor") {
  return { key: We(ve(t), new Set(e.map((i) => i.key))), name: t, type: s, open: s === "outdoor", default: !1 };
}
function at(e) {
  if (!Array.isArray(e) || e.length === 0)
    throw new Error('"doors" muss eine Liste mit mindestens einer Tür sein.');
  if (e.length > Q) throw new Error(`Höchstens ${Q} Türen möglich.`);
  const t = /* @__PURE__ */ new Set(), s = e.map((n, i) => {
    if (typeof n != "object" || n === null || typeof n.name != "string" || n.name.trim() === "")
      throw new Error(`Tür ${i + 1}: "name" fehlt.`);
    const r = n.type ?? "outdoor";
    if (r !== "outdoor" && r !== "floor")
      throw new Error(`Tür "${n.name}": "type" muss outdoor (Außentür) oder floor (Etagenruf) sein.`);
    const o = n.name.trim(), d = {
      key: We(ve(typeof n.id == "string" ? n.id : o), t),
      name: o,
      type: r,
      open: r === "outdoor" && n.open !== !1,
      default: n.default === !0
    };
    return typeof n.id == "string" && n.id.trim() !== "" && (d.id = n.id.trim()), typeof n.icon == "string" && n.icon.trim() !== "" && (d.icon = n.icon.trim()), d;
  });
  if (s.filter((n) => n.default).length > 1) throw new Error('Nur eine Tür kann "default: true" haben.');
  return se(s);
}
function xn(e) {
  if (!Array.isArray(e)) return;
  const t = /* @__PURE__ */ new Set(), s = [];
  for (const n of e.slice(0, Q)) {
    if (typeof n != "object" || n === null) continue;
    const i = n;
    if (typeof i.key != "string" || !/^[a-z0-9_]+$/.test(i.key) || t.has(i.key) || typeof i.name != "string" || i.type !== "outdoor" && i.type !== "floor") continue;
    t.add(i.key);
    const r = {
      key: i.key,
      name: i.name,
      type: i.type,
      open: i.open === !0,
      default: i.default === !0
    };
    typeof i.id == "string" && (r.id = i.id), typeof i.icon == "string" && (r.icon = i.icon), s.push(r);
  }
  return s.length > 0 ? se(s) : void 0;
}
const kn = /\[\s*([0-9a-f]{4}|[0-9a-f]{6})\s*(»|Â»|>>|>)\s*([0-9a-f]{4}|[0-9a-f]{6})\s*\]/i, Sn = /^\s*,?\s*type\s*[:=]?\s*(?:0x)?([0-9a-f]{1,2})(?![0-9a-f])/i, zn = /^\s*,?\s*data\s*[:=]?\s*(.*?)\s*$/i, En = /((?:[0-9a-f]{2}[.:\s]){2,}[0-9a-f]{2})\s*(?:\(\s*(\d+)\s*\))?\s*$/i;
function Tn(e) {
  const t = e.trim();
  if (t === "") return [];
  const s = t.split(/[\s.,:;-]+/).filter((i) => i !== ""), n = [];
  for (let i of s) {
    if (i = i.replace(/^0x/i, ""), !/^[0-9a-f]+$/i.test(i)) return null;
    if (i.length <= 2)
      n.push(parseInt(i, 16));
    else if (i.length % 2 === 0)
      for (let r = 0; r < i.length; r += 2) n.push(parseInt(i.slice(r, r + 2), 16));
    else
      return null;
  }
  return n;
}
function It(e) {
  const t = (m) => ({ ok: !1, line: e, reason: m });
  if (typeof e != "string") return t("not a string");
  const s = kn.exec(e);
  if (!s) return t("no address block");
  const [, n, i, r] = s, o = e.slice(s.index + s[0].length), d = Sn.exec(o);
  if (!d) return t("no message type");
  const a = o.slice(d[0].length);
  let l = [];
  if (a.trim() !== "") {
    const m = zn.exec(a);
    if (!m) return t("unexpected text after type");
    const v = Tn(m[1]);
    if (!v) return t("invalid data bytes");
    l = v;
  }
  const h = {
    src: parseInt(n, 16),
    dst: parseInt(r, 16),
    type: parseInt(d[1], 16),
    data: l,
    threeByte: n.length === 6 || r.length === 6,
    retransmission: i !== ">"
  }, p = En.exec(e.slice(0, s.index));
  return p && (h.raw = p[1].toUpperCase().replace(/[:\s]/g, "."), p[2] !== void 0 && (h.rawLength = parseInt(p[2], 10))), { ok: !0, frame: h };
}
const dt = 1, Dn = 10, ct = 17, Ot = 13, Ft = 14, Ee = 128, lt = [1, 129, 10, 17, 145], Cn = (e) => `Klingel „${e.name}“`, Te = (e) => `Öffnen „${e.name}“`, ee = (e, t) => e[t] ?? [], De = (e) => e.toString(16).toUpperCase().padStart(2, "0"), he = (e) => `${e.src}|${e.dst}|${e.type}|${e.data.join(",")}`;
function In(e) {
  const t = (s) => s === void 0 ? "*" : s.toString(16);
  return `${De(e.type)}|${t(e.src)}|${t(e.dst)}|${e.data ? e.data.map(De).join("") : "*"}`;
}
function ye(e, t) {
  let s = null;
  for (const n of e)
    (!s || n[1] > s[1] || n[1] === s[1] && t && t(n[0], s[0]) < 0) && (s = n);
  return s;
}
function L(e, t, s = 1) {
  e.set(t, (e.get(t) ?? 0) + s);
}
function On(e, t) {
  let s = 0;
  const n = {};
  for (const [i, r] of Object.entries(e.steps))
    n[i] = r.captures.map(
      (o) => o.lines.flatMap((d) => {
        s++;
        const a = It(d.line);
        return a.ok ? [a.frame] : (t.push(d.line), []);
      })
    );
  return { steps: n, total: s };
}
function Fn(e, t, s) {
  const n = /* @__PURE__ */ new Map();
  for (const a of t.filter((l) => l.open))
    for (const l of ee(e, T(a)))
      for (const h of l)
        (h.type === Ot || h.type === Ft) && ke(h.src, h.threeByte) && L(n, h.src);
  const i = (a, l) => a === s ? -1 : l === s ? 1 : a - l, r = ye(n, i);
  if (r) return { address: r[0], method: "open", count: r[1] };
  const o = /* @__PURE__ */ new Map();
  for (const a of Object.values(e))
    for (const l of a)
      for (const h of l)
        ke(h.src, h.threeByte) && L(o, h.src), ke(h.dst, h.threeByte) && h.dst !== h.src && L(o, h.dst);
  const d = ye(o, i);
  return d ? { address: d[0], method: "frequency", count: d[1] } : null;
}
function Pn(e, t, s) {
  const n = (i) => bn(i, t.threeByte) ? i : void 0;
  return e === "floor" ? t.type === ct && t.src === s ? { type: t.type, src: t.src } : t.type === (ct | Ee) && t.dst === s ? { type: t.type, dst: t.dst } : null : t.type === dt && t.dst === s ? { type: t.type, src: t.src, dst: t.dst, outdoor: n(t.src) } : t.type === (dt | Ee) && t.src === s ? { type: t.type, src: t.src, dst: t.dst, outdoor: n(t.dst) } : t.type === Dn && Dt(t, s) ? { type: t.type, src: t.src, dst: t.dst, data: [...t.data], outdoor: n(t.src) } : null;
}
function Nn(e, t) {
  return t.score - e.score || lt.indexOf(e.type) - lt.indexOf(t.type) || (e.key < t.key ? -1 : e.key > t.key ? 1 : 0);
}
function Pt(e, t, s) {
  const n = e.session.steps[t]?.skipped === !0;
  e.warnings.push({
    code: n ? "step_skipped" : "step_missing",
    severity: "info",
    step: t,
    message: `${s}: ${n ? "übersprungen" : "keine Aufnahme vorhanden"}.`
  });
}
function Bn(e, t) {
  const s = E(t), n = Cn(t), i = ee(e.steps, s), r = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
  i.forEach((l, h) => {
    for (const p of l) {
      if (e.baseline.has(he(p))) {
        e.stats.baselineFiltered++;
        continue;
      }
      if (!Ue(p, e.indoor)) {
        e.stats.neighbourFiltered++;
        continue;
      }
      const m = Pn(t.type, p, e.indoor);
      if (!m) {
        o.has(he(p)) || o.set(he(p), p);
        continue;
      }
      const v = In(m), u = r.get(v) ?? { match: m, in: /* @__PURE__ */ new Set() };
      u.in.add(h), r.set(v, u);
    }
  });
  const d = [...r].map(([l, { match: h, in: p }]) => ({
    key: l,
    ...h,
    occurrences: p.size,
    score: p.size / i.length,
    reliable: p.size === i.length
  }));
  d.sort(Nn);
  let a = d.filter((l) => l.reliable);
  if (i.length === 0)
    Pt(e, s, n);
  else if (d.length === 0)
    e.warnings.push({
      code: "no_ring_candidates",
      severity: "warning",
      step: s,
      message: `${n}: keine passenden Frames gefunden (erwartet: ${t.type === "floor" ? "Typ 11/91" : "Typ 01/81/0A"} mit Bezug zu ${$(e.indoor, e.threeByte)}).`
    });
  else {
    if (a.length === 0) {
      const l = d[0].score;
      a = d.filter((h) => h.score === l), e.warnings.push({
        code: "unstable_candidates",
        severity: "warning",
        step: s,
        message: `${n}: kein Kandidat kam in allen ${i.length} Aufnahmen vor; verwende die besten (${Math.round(l * 100)} %).`
      });
    }
    i.length === 1 && e.warnings.push({
      code: "single_capture",
      severity: "info",
      step: s,
      message: `${n}: nur eine Aufnahme – Stabilität nicht prüfbar. 2–3 Wiederholungen empfohlen.`
    });
  }
  return {
    door: t.key,
    captures: i.length,
    candidates: d,
    selected: a,
    outdoorAddress: Nt(a),
    otherFrames: [...o.values()]
  };
}
function Nt(e) {
  const t = /* @__PURE__ */ new Map();
  for (const s of e) s.outdoor !== void 0 && L(t, s.outdoor);
  return ye(t, (s, n) => s - n)?.[0];
}
function Mn(e, t, s) {
  const n = t.filter((a) => a.type === "outdoor" && s[a.key].selected.length > 0), i = /* @__PURE__ */ new Map();
  for (const a of n) for (const l of s[a.key].selected) L(i, l.key);
  const r = new Set([...i].filter(([, a]) => a > 1).map(([a]) => a)), o = (a) => s[a.key].selected.filter((l) => !r.has(l.key));
  let d = 0;
  for (let a = 0; a < n.length; a++)
    for (let l = a + 1; l < n.length; l++) {
      const [h, p] = [n[a], n[l]], m = s[h.key], v = s[p.key], u = new Set(v.selected.map((A) => A.key)), g = m.selected.some((A) => u.has(A.key)), b = m.outdoorAddress !== void 0 && m.outdoorAddress === v.outdoorAddress;
      !b && !(g && (o(h).length === 0 || o(p).length === 0)) || (d++, e.warnings.push({
        code: "doors_indistinguishable",
        severity: "warning",
        message: `„${h.name}“ und „${p.name}“ nicht unterscheidbar: beide Klingeln erzeugen dieselben Frames` + (b ? ` (Außenstation ${$(m.outdoorAddress, e.threeByte)})` : "") + ". Beide Klingel-Sensoren würden gemeinsam auslösen."
      }));
    }
  if (!(d > 0 || r.size === 0)) {
    for (const a of n) {
      const l = s[a.key];
      l.selected = o(a), l.outdoorAddress = Nt(l.selected);
    }
    e.warnings.push({
      code: "shared_candidates_removed",
      severity: "info",
      message: `${r.size} Kandidat(en) kamen bei mehreren Türen vor und wurden nicht verwendet.`
    });
  }
}
function Rn(e, t) {
  const s = T(t), n = Te(t), i = ee(e.steps, s);
  if (i.length === 0)
    return Pt(e, s, n), null;
  const r = /* @__PURE__ */ new Map();
  i.forEach((u, g) => {
    for (const b of u) {
      if (b.src !== e.indoor || b.type !== Ot && b.type !== Ft) continue;
      const A = `${b.dst}|${b.type}|${b.data.join(",")}`, k = r.get(A) ?? { frame: b, in: /* @__PURE__ */ new Set() };
      k.in.add(g), r.set(A, k);
    }
  });
  let o;
  for (const u of r.values()) (!o || u.in.size > o.in.size) && (o = u);
  if (!o)
    return e.warnings.push({
      code: "no_open_frame",
      severity: "warning",
      step: s,
      message: `${n}: kein 0D/0E-Frame von ${$(e.indoor, e.threeByte)} gefunden.`
    }), null;
  r.size > 1 && e.warnings.push({
    code: "multiple_open_frames",
    severity: "info",
    step: s,
    message: `${n}: ${r.size} verschiedene Öffnen-Frames gefunden, verwende den häufigsten.`
  }), o.in.size < i.length && e.warnings.push({
    code: "unstable_open",
    severity: "warning",
    step: s,
    message: `${n}: Öffnen-Frame nur in ${o.in.size} von ${i.length} Aufnahmen.`
  });
  const { frame: d } = o, a = {
    door: t.key,
    captures: i.length,
    destination: d.dst,
    messageType: d.type,
    data: [...d.data],
    occurrences: o.in.size,
    score: o.in.size / i.length
  }, l = d.type | Ee, h = [...o.in].map((u) => i[u].filter((g) => g.type === l)), p = h.some((u) => u.some((g) => g.dst === e.indoor)), m = /* @__PURE__ */ new Map();
  for (const u of h) {
    const g = new Set(u.filter((b) => !p || b.dst === e.indoor).map((b) => b.src));
    for (const b of g) L(m, b);
  }
  const v = m.has(d.dst) ? [d.dst, m.get(d.dst)] : ye(m, (u, g) => u - g);
  return v ? a.confirmation = {
    source: v[0],
    messageType: l,
    occurrences: v[1],
    ...p ? { destination: e.indoor } : {}
  } : e.warnings.push({
    code: "no_confirmation",
    severity: "info",
    step: s,
    message: `${n}: keine Bestätigung (${De(l)}) gefunden – das Schloss meldet dann keinen Status.`
  }), a;
}
function Ln(e) {
  return { door: e.key, captures: 0, candidates: [], selected: [], otherFrames: [] };
}
function Kn(e, t = {}) {
  const s = [], { steps: n, total: i } = On(e, s), r = [], o = {
    totalLines: i,
    parsedFrames: i - s.length,
    unparsedLines: s,
    baselineFiltered: 0,
    neighbourFiltered: 0
  }, d = Object.values(n).flat(2), a = t.expectedApartment ?? pe(e.dials), l = d.filter((y) => y.threeByte).length * 2 > d.length, h = a !== void 0 ? ge(a, l) : void 0;
  s.length > 0 && r.push({
    code: "unparsed_lines",
    severity: "info",
    message: `${s.length} Zeile(n) konnten nicht als Frame gelesen werden.`
  });
  const p = t.indoorAddress ?? e.indoorAddress, m = p !== void 0 ? { address: p, method: "manual", count: 0 } : Fn(n, e.doors, h), v = {
    indoor: null,
    threeByte: l,
    rings: Object.fromEntries(e.doors.map((y) => [y.key, Ln(y)])),
    opens: Object.fromEntries(e.doors.filter((y) => y.open).map((y) => [y.key, null])),
    warnings: r,
    stats: o
  };
  if (!m)
    return r.push({
      code: "no_indoor",
      severity: "error",
      message: "Keine Innenstationsadresse (10XX / 0001XX) gefunden. Wurden Frames aufgenommen?"
    }), v;
  const u = d.filter((y) => Ue(y, m.address)), g = u.length > 0 ? u.some((y) => y.threeByte) : m.address > 65535 || l;
  m.method === "manual" && u.length === 0 && d.length > 0 && r.push({
    code: "manual_indoor_unseen",
    severity: "warning",
    message: `Die eingestellte Innenstation ${$(m.address, g)} kommt in keinem aufgenommenen Frame vor.`
  }), u.some((y) => y.threeByte !== g) && r.push({
    code: "mixed_address_length",
    severity: "warning",
    message: "Gemischte 2- und 3-Byte-Adressen gefunden – bitte Aufnahmen prüfen."
  }), v.threeByte = g;
  const b = { ...m };
  a !== void 0 && (b.expected = ge(a, g), b.matchesExpected = b.expected === m.address, b.matchesExpected || r.push({
    code: "indoor_mismatch",
    severity: "warning",
    message: `Ermittelte Innenstation ${$(m.address, g)} weicht von der erwarteten Adresse ${$(b.expected, g)} (Wohnung ${a}) ab. Drehregler prüfen.`
  })), m.method === "frequency" && r.push({
    code: "indoor_by_frequency",
    severity: "info",
    message: `Innenstation ${z(m.address, g)} nur anhand der Häufigkeit bestimmt (kein Öffnen-Frame aufgenommen).`
  }), v.indoor = b;
  const A = {
    session: e,
    steps: n,
    indoor: m.address,
    threeByte: g,
    baseline: new Set(ee(n, R).flat().map(he)),
    warnings: r,
    stats: o
  };
  ee(n, R).length === 0 && r.push({
    code: "no_baseline",
    severity: "info",
    step: R,
    message: "Keine Baseline aufgenommen – Frames einer normalen Sprechverbindung können nicht ausgefiltert werden."
  });
  for (const y of e.doors) v.rings[y.key] = Bn(A, y);
  Mn(A, e.doors, v.rings);
  const k = e.doors.filter((y) => y.open);
  for (const y of k) v.opens[y.key] = Rn(A, y);
  for (let y = 0; y < k.length; y++)
    for (let ie = y + 1; ie < k.length; ie++) {
      const re = v.opens[k[y].key], oe = v.opens[k[ie].key];
      re && oe && re.destination === oe.destination && re.messageType === oe.messageType && q(re.data) === q(oe.data) && r.push({
        code: "same_open_frame",
        severity: "warning",
        message: `${Te(k[y])} und ${Te(k[ie])} senden denselben Frame – beide Schlösser würden dieselbe Tür öffnen. Meist war der Ruf beim Drücken der Schlüssel-Taste schon abgelaufen, sodass die Standard-Tür geöffnet wurde: Aufnahme verwerfen und direkt nach dem Klingeln wiederholen (oder jemanden klingeln lassen).`
      });
    }
  return v;
}
var Hn = Object.defineProperty, Un = Object.getOwnPropertyDescriptor, Ve = (e, t, s, n) => {
  for (var i = n > 1 ? void 0 : n ? Un(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (i = (n ? o(t, s, i) : o(i)) || i);
  return n && i && Hn(t, s, i), i;
};
const Bt = "abb-welcome-wizard-card-editor", jn = [
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
], Wn = {
  entity: "Debug-Textsensor des ESP32",
  title: "Titel (optional)",
  capture_seconds: "Aufnahmedauer",
  indoor_address: "Innenstationsadresse (optional)"
}, Vn = {
  entity: "Der Sensor, der jeden Bus-Frame anzeigt, z. B. „Doorbell Intercom“.",
  indoor_address: "Nur nötig, wenn die automatische Erkennung danebenliegt, z. B. 0x1010."
};
let $e = class extends M {
  setConfig(e) {
    this.config = e;
  }
  onValueChanged(e) {
    e.stopPropagation();
    const t = { ...this.config, ...e.detail.value };
    for (const s of ["title", "indoor_address", "capture_seconds"])
      (t[s] === "" || t[s] === void 0 || t[s] === null) && delete t[s];
    this.config = t, this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config: t }, bubbles: !0, composed: !0 })
    );
  }
  render() {
    return this.config ? c`
      <ha-form
        .hass=${this.hass}
        .data=${this.config}
        .schema=${jn}
        .computeLabel=${(e) => Wn[e.name] ?? e.name}
        .computeHelper=${(e) => Vn[e.name]}
        @value-changed=${this.onValueChanged}
      ></ha-form>
      <p style="color:var(--secondary-text-color);font-size:0.875rem;margin:12px 0 0">
        Die Türen (Namen, Öffner, Standard-Tür) richtest du direkt in der Karte auf der Startseite ein.
      </p>
    ` : f;
  }
};
Ve([
  _()
], $e.prototype, "hass", 2);
Ve([
  _()
], $e.prototype, "config", 2);
$e = Ve([
  Tt(Bt)
], $e);
const Gn = /* @__PURE__ */ new Set(["", "unknown", "unavailable"]);
function Mt(e, t) {
  if (e.event_type !== "state_changed" || e.data?.entity_id !== t) return null;
  const s = e.data.new_state?.state;
  return typeof s != "string" || Gn.has(s.trim()) ? null : { time: e.time_fired || (/* @__PURE__ */ new Date()).toISOString(), line: s };
}
function ae(e) {
  if (typeof e == "number")
    return Number.isInteger(e) && e > 0 && e <= 16777215 ? e : void 0;
  if (typeof e != "string") return;
  const t = e.trim().replace(/^0x/i, "");
  if (/^([0-9a-f]{4}|[0-9a-f]{6})$/i.test(t))
    return parseInt(t, 16);
}
const Ge = 6e3, Y = 2e3;
function qn(e, t, s, n) {
  return s ? { step: e, phase: "armed", armedAt: n, lines: [] } : {
    step: e,
    phase: "recording",
    armedAt: n,
    startedAt: new Date(n).toISOString(),
    endsAt: n + t * 1e3,
    lines: []
  };
}
function Yn(e, t, s, n) {
  return e.phase === "armed" ? {
    ...e,
    phase: "recording",
    startedAt: new Date(n).toISOString(),
    endsAt: n + s * 1e3,
    lines: [t]
  } : { ...e, lines: [...e.lines, t] };
}
function Zn(e, t) {
  return e.phase === "recording" && e.endsAt !== void 0 && t >= e.endsAt && !e.missed;
}
function ut(e) {
  return { ...e, missed: !0, syncAfter: void 0 };
}
function pt(e, t) {
  return e.missed ? { ...e, syncAfter: t + Ge } : e;
}
function Jn(e, t) {
  const s = e.phase === "armed" ? e.armedAt : Date.parse(e.startedAt ?? ""), n = e.endsAt !== void 0 ? Math.min(t, e.endsAt + Y) : t;
  return { start: (Number.isNaN(s) ? e.armedAt : s) - Y, end: n };
}
function Xn(e, t) {
  const s = [...e];
  for (const n of t) {
    const i = Date.parse(n.time);
    s.some((r) => r.line === n.line && Math.abs(Date.parse(r.time) - i) < 1e3) || s.push(n);
  }
  return s.sort((n, i) => Date.parse(n.time) - Date.parse(i.time));
}
function Qn(e, t, s, n) {
  let i = e;
  if (i.phase === "armed") {
    const d = t.find((a) => Date.parse(a.time) >= i.armedAt - Y);
    if (d) {
      const a = Date.parse(d.time);
      i = { ...i, phase: "recording", startedAt: d.time, endsAt: a + s * 1e3 };
    }
  }
  if (i.phase === "recording") {
    const d = Date.parse(i.startedAt ?? "") - Y, a = (i.endsAt ?? n) + Y, l = t.filter((h) => {
      const p = Date.parse(h.time);
      return p >= d && p <= a;
    });
    i = { ...i, lines: Xn(i.lines, l) };
  }
  const r = i.phase === "recording" && i.endsAt !== void 0 && n >= i.endsAt;
  return i.syncAfter !== void 0 && n >= i.syncAfter && (!r || n >= (i.endsAt ?? 0) + Ge) ? { ...i, missed: !1, syncAfter: void 0 } : i;
}
function es(e, t) {
  return (e?.[t] ?? []).flatMap((s) => {
    const n = Mt(
      {
        event_type: "state_changed",
        time_fired: new Date((s.lc ?? s.lu) * 1e3).toISOString(),
        data: {
          entity_id: t,
          old_state: null,
          new_state: {
            entity_id: t,
            state: s.s,
            last_changed: "",
            last_updated: "",
            attributes: {}
          }
        }
      },
      t
    );
    return n ? [n] : [];
  });
}
async function ts(e, t, s, n) {
  const i = await e.sendMessagePromise({
    type: "history/history_during_period",
    start_time: new Date(s).toISOString(),
    end_time: new Date(n).toISOString(),
    entity_ids: [t],
    include_start_time_state: !1,
    significant_changes_only: !1,
    minimal_response: !1,
    no_attributes: !0
  });
  return es(i, t);
}
const Ce = "abb-welcome-wizard-session", Ie = 2, ns = Object.freeze({ skipped: !1, captures: [] }), ss = {
  baseline: R,
  ring_gate: E("tor"),
  ring_house: E("haustuer"),
  ring_apartment: E("wohnung"),
  open_gate: T("tor"),
  open_house: T("haustuer")
};
function ht(e, t = je, s = /* @__PURE__ */ new Date()) {
  const n = s.toISOString();
  return {
    format: Ce,
    version: Ie,
    entity: e,
    createdAt: n,
    updatedAt: n,
    dials: {},
    doors: se(t),
    steps: {}
  };
}
function S(e, t) {
  return e.steps[t] ?? ns;
}
function Ae(e, t) {
  return { ...e, updatedAt: t.toISOString() };
}
function qe(e, t, s, n) {
  return Ae({ ...e, steps: { ...e.steps, [t]: s(S(e, t)) } }, n);
}
function is(e, t, s, n = /* @__PURE__ */ new Date()) {
  return qe(e, t, (i) => ({ skipped: !1, captures: [...i.captures, s] }), n);
}
function mt(e, t, s, n = /* @__PURE__ */ new Date()) {
  return qe(
    e,
    t,
    (i) => ({ ...i, captures: i.captures.filter((r, o) => o !== s) }),
    n
  );
}
function rs(e, t, s, n = /* @__PURE__ */ new Date()) {
  return qe(e, t, (i) => ({ ...i, skipped: s }), n);
}
function ft(e, t, s = /* @__PURE__ */ new Date()) {
  const n = Ae({ ...e }, s);
  return t === void 0 ? delete n.indoorAddress : n.indoorAddress = t, n;
}
function os(e, t, s = /* @__PURE__ */ new Date()) {
  return Ae({ ...e, dials: { ...t } }, s);
}
function W(e, t, s = /* @__PURE__ */ new Date()) {
  const n = se(t), i = /* @__PURE__ */ new Set([R]);
  for (const o of n)
    i.add(E(o)), o.open && i.add(T(o));
  const r = Object.fromEntries(Object.entries(e.steps).filter(([o]) => i.has(o)));
  return Ae({ ...e, doors: n, steps: r }, s);
}
function gt(e, t) {
  return S(e, E(t)).captures.length + S(e, T(t)).captures.length;
}
function as(e) {
  const t = e.doors.flatMap(
    (n) => n.open && !n.default ? [E(n), T(n)] : [E(n)]
  );
  let s;
  for (const n of t)
    for (const i of S(e, n).captures) {
      const r = Date.parse(i.endedAt);
      !Number.isNaN(r) && (s === void 0 || r > s) && (s = r);
    }
  return s === void 0 ? void 0 : new Date(s);
}
function Rt(e) {
  return JSON.stringify(e, null, 2);
}
const N = (e) => typeof e == "object" && e !== null, de = (e) => typeof e == "number" && Number.isInteger(e) ? e : void 0;
function ds(e) {
  const t = Array.isArray(e.captures) ? e.captures : [];
  return {
    skipped: e.skipped === !0,
    captures: t.filter(N).map((s) => ({
      startedAt: String(s.startedAt ?? ""),
      endedAt: String(s.endedAt ?? ""),
      lines: (Array.isArray(s.lines) ? s.lines : []).filter(N).filter((n) => typeof n.line == "string").map((n) => ({ time: String(n.time ?? ""), line: n.line }))
    }))
  };
}
function Lt(e) {
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    throw new Error("Datei ist kein gültiges JSON.");
  }
  if (!N(t) || t.format !== Ce)
    throw new Error("Datei ist keine ABB-Welcome-Wizard-Sitzung.");
  if (t.version !== 1 && t.version !== Ie)
    throw new Error(`Nicht unterstützte Sitzungsversion: ${String(t.version)}.`);
  if (typeof t.entity != "string") throw new Error("Sitzung ohne Entität.");
  const s = t.version === 1, n = !s && xn(t.doors) || se(je), i = {};
  for (const [d, a] of Object.entries(N(t.steps) ? t.steps : {})) {
    const l = s ? ss[d] : d;
    l && N(a) && (i[l] = ds(a));
  }
  const r = N(t.dials) ? t.dials : {}, o = {
    format: Ce,
    version: Ie,
    entity: t.entity,
    createdAt: String(t.createdAt ?? ""),
    updatedAt: String(t.updatedAt ?? ""),
    dials: { station: de(r.station), x10: de(r.x10), x1: de(r.x1) },
    doors: n,
    steps: i
  };
  return de(t.indoorAddress) !== void 0 && (o.indoorAddress = t.indoorAddress), { ...W(o, n), updatedAt: o.updatedAt };
}
const vt = 3, B = (e) => `„${e.name}“`;
function cs(e, t) {
  const s = e.type === "floor";
  return {
    id: E(e),
    kind: "ring",
    door: e,
    title: `Klingeln: ${e.name}`,
    short: e.name,
    icon: be(e),
    todo: [
      "Auf „Aufnahme starten“ tippen – die Aufnahme beginnt erst, wenn der erste Frame ankommt.",
      s ? `Den Klingeltaster an ${B(e)} (Etagenruf) drücken.` : `Zu ${B(e)} gehen und einmal klingeln. Nicht abheben, nicht öffnen.`,
      "Für eine zuverlässige Erkennung 2–3 Mal wiederholen (jeweils neue Aufnahme)."
    ],
    why: s ? "Der Etagenruf ist direkt an die Innenstation angeschlossen. Sie meldet ihn mit Typ 11 auf dem Bus, die Antwort hat Typ 91." : "Frames, die in jeder Wiederholung auftauchen, sind zuverlässige Kandidaten für den Klingel-Sensor." + (t > 1 ? " Jede Außentür hat in der Regel eine eigene Außenstation – darüber werden die Türen unterschieden." : ""),
    repetitions: 3,
    waitForFrame: !0,
    needsPause: !1
  };
}
function bt(e) {
  const t = {
    id: T(e),
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
      `An der Innenstation die Schlüssel-Taste drücken – ${B(e)} wird dabei wirklich geöffnet.`
    ],
    why: `Ohne vorheriges Klingeln öffnet die Schlüssel-Taste die Standard-Außenstation (${B(e)}). Liegt das letzte Klingeln zu kurz zurück, würde sie noch die zuletzt rufende Tür öffnen.`,
    needsPause: !0
  } : {
    ...t,
    todo: [
      `An ${B(e)} klingeln – oder klingeln lassen. Allein: klingeln und zügig zur Innenstation gehen.`,
      "Erst an der Innenstation auf „Aufnahme starten“ tippen (das Klingeln muss nicht mit aufgenommen werden).",
      `Sofort die Schlüssel-Taste drücken, solange der Ruf noch aktiv ist – ${B(e)} wird dabei wirklich geöffnet.`
    ],
    why: "Nach einem Klingeln öffnet die Schlüssel-Taste die rufende Außenstation – aber nur, solange der Ruf an der Innenstation noch aktiv ist. Ist er schon abgelaufen, öffnet sie die Standard-Tür; die Auswertung warnt dann. Gesucht wird der Frame vom Typ 0D/0E deiner Innenstation und die Bestätigung 8D/8E.",
    needsPause: !1
  };
}
function ls(e) {
  const t = e.filter((n) => n.type === "outdoor").length, s = e.filter((n) => n.open);
  return [
    {
      id: R,
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
    ...e.map((n) => cs(n, t)),
    // Doors opened after a doorbell first, the default door (needs a pause after ringing) last.
    ...s.filter((n) => !n.default).map(bt),
    ...s.filter((n) => n.default).map(bt)
  ];
}
const Ye = (e) => `abb-welcome-wizard-card:session:${e}`;
function us(e) {
  try {
    const t = window.localStorage.getItem(Ye(e));
    return t ? Lt(t) : void 0;
  } catch {
    return;
  }
}
function ps(e) {
  try {
    window.localStorage.setItem(Ye(e.entity), Rt(e));
  } catch {
  }
}
function hs(e) {
  try {
    window.localStorage.removeItem(Ye(e));
  } catch {
  }
}
const Oe = (e) => `abb-welcome-wizard-card:capture:${e}`;
function yt(e, t) {
  try {
    t ? window.localStorage.setItem(Oe(e), JSON.stringify(t)) : window.localStorage.removeItem(Oe(e));
  } catch {
  }
}
function ms(e) {
  try {
    const t = JSON.parse(window.localStorage.getItem(Oe(e)) ?? "null");
    if (t && typeof t.step == "string" && (t.phase === "armed" || t.phase === "recording") && typeof t.armedAt == "number" && Array.isArray(t.lines))
      return t;
  } catch {
  }
}
function $t(e, t, s) {
  const n = URL.createObjectURL(new Blob([t], { type: s })), i = document.createElement("a");
  i.href = n, i.download = e, document.body.appendChild(i), i.click(), i.remove(), setTimeout(() => URL.revokeObjectURL(n), 1e3);
}
async function fs(e) {
  try {
    return await navigator.clipboard.writeText(e), !0;
  } catch {
    const t = document.createElement("textarea");
    t.value = e, t.style.position = "fixed", t.style.opacity = "0", document.body.appendChild(t), t.select();
    let s = !1;
    try {
      s = document.execCommand("copy");
    } catch {
      s = !1;
    }
    return t.remove(), s;
  }
}
const gs = jt`
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
`, K = {
  name: "abb-welcome-demo",
  friendlyName: "ABB Welcome Demo",
  debugSensorName: "Doorbell Intercom",
  board: "esp32dev"
};
function wt(e) {
  return e.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || K.name;
}
const vs = ["wifi_ssid", "wifi_password", "api_encryption_key", "ota_password", "ap_password"];
function Kt(e) {
  const t = Ct(e);
  return e.map((s) => ({
    door: s,
    id: `klingel_${t[s.key]}`,
    name: `Klingel ${s.name}`,
    icon: "mdi:bell"
  }));
}
function Ht(e) {
  const t = Ct(e);
  return e.filter((s) => s.open).map((s) => ({ door: s, id: t[s.key], name: s.name, icon: be(s) }));
}
const Fe = "TÜRCODE – nicht öffentlich teilen!";
class bs {
  constructor() {
    this.lines = [];
  }
  line(t, s = "") {
    return this.lines.push(s === "" ? "" : " ".repeat(t) + s), this;
  }
  comment(t, s) {
    return this.line(t, `# ${s.replace(/[\r\n]+/g, " ")}`.trimEnd());
  }
  toString() {
    return this.lines.join(`
`) + `
`;
  }
}
function ce(e) {
  return `"${e.replace(/[\r\n]+/g, " ").replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
function Pe(e) {
  return e.toString(16).toUpperCase().padStart(2, "0");
}
function ys(e, t) {
  const s = [`(x.get_message_type() == ${G(e.type)})`];
  e.src !== void 0 && s.push(`(x.get_source_address() == ${$(e.src, t)})`), e.dst !== void 0 && s.push(`(x.get_destination_address() == ${$(e.dst, t)})`);
  let n = "";
  return e.data !== void 0 && (n = `std::vector<uint8_t> d = {${e.data.map(G).join(", ")}}; `, s.push("(x.get_data() == d)")), `'${n}return ${s.join(" && ")};'`;
}
function $s(e, t, s) {
  let n = `Typ ${Pe(e.type)}`;
  return e.src !== void 0 && e.dst !== void 0 ? n += `: ${z(e.src, s)} > ${z(e.dst, s)}` : e.src !== void 0 ? n += `, Quelle: ${z(e.src, s)}` : e.dst !== void 0 && (n += `, Ziel: ${z(e.dst, s)}`), e.data !== void 0 && (n += `, Data: ${e.data.map((i) => Pe(i)).join(" ")}`), `${n} (${e.occurrences}/${t} Aufnahmen)`;
}
function I(e, t, s, n, i) {
  e.line(t, `- ${s}.template.publish:`), e.line(t + 4, `id: ${n}`), e.line(t + 4, `state: ${i}`);
}
function _t(e, t, s, n) {
  I(e, t, "lock", s, "UNLOCKING"), e.line(t, `- delay: ${n}s`), I(e, t, "lock", s, "LOCKED");
}
function ws(e, t, s) {
  const { indoor: n, threeByte: i } = t;
  if (e.comment(0, "ABB-Welcome Wizard – generierte ESPHome-Konfiguration"), n) {
    const o = s.apartment !== void 0 ? `, Wohnung ${s.apartment}` : "";
    e.comment(0, `Innenstation: ${$(n.address, i)}${o}`);
  }
  e.comment(0, `Adresslänge: ${i ? "3 Byte (three_byte_address: true)" : "2 Byte"}`), e.comment(0, ""), s.device ? (e.comment(0, "Komplette Gerätekonfiguration auf Basis der ABB-Welcome-Demo-Firmware (Mat931)."), e.comment(0, `Im ESPHome Device Builder den Inhalt von ${s.device.name}.yaml hierdurch ersetzen.`), e.comment(0, "WICHTIG: esphome.name muss zum bestehenden Gerät passen – sonst ist es per OTA und"), e.comment(0, "in Home Assistant nicht mehr erreichbar."), e.comment(0, ""), e.comment(0, `Benötigt in secrets.yaml: ${vs.join(", ")}.`), e.comment(0, "Den API-Schlüssel aus der bisherigen Konfiguration übernehmen, sonst muss das Gerät in"), e.comment(0, "Home Assistant neu verbunden werden. Scheitert das Hochladen am OTA-Passwort, den"), e.comment(0, "ota-Abschnitt aus der bisherigen Datei übernehmen.")) : (e.comment(0, "Diese Abschnitte ersetzen die gleichnamigen Abschnitte der Demo-Firmware:"), e.comment(0, "esphome.on_boot, remote_receiver.on_abbwelcome, binary_sensor und lock."), e.comment(0, "Alle übrigen Einstellungen (wifi, api, ota, remote_transmitter, Pins von"), e.comment(0, "remote_receiver, text_sensor ...) unverändert lassen."), e.comment(0, ""), e.comment(0, "Voraussetzung (in der Demo-Firmware bereits gesetzt):"), e.comment(0, "esp32:"), e.comment(0, "  framework:"), e.comment(0, "    type: esp-idf")), Object.values(t.opens).some((o) => o !== null) && (e.comment(0, ""), e.comment(
    0,
    s.maskDoorCode ? "Türcodes sind durch Platzhalter ersetzt – vor dem Flashen die echten Werte eintragen!" : `ACHTUNG: "data" der Öffnen-Befehle ist euer ${Fe}`
  ));
  const r = t.warnings.filter((o) => o.severity !== "info");
  if (r.length > 0) {
    e.comment(0, "");
    for (const o of r) e.comment(0, `${o.severity === "error" ? "FEHLER" : "Warnung"}: ${o.message}`);
  }
  e.line(0);
}
function _s(e, t, s = {}) {
  const n = new bs(), { indoor: i, threeByte: r } = e, o = s.device ? { ...K, ...s.device } : void 0, d = o || s.debugSensorId === void 0 ? "doorbell_intercom" : s.debugSensorId, a = s.unlockSeconds ?? 3;
  if (ws(n, e, s), !i)
    return n.comment(0, "Keine Innenstationsadresse ermittelt – es kann keine Konfiguration erzeugt werden."), n.toString();
  const l = Kt(t), h = Ht(t), p = l.filter((u) => (e.rings[u.door.key]?.selected.length ?? 0) > 0), m = h.map((u) => ({ ...u, open: e.opens[u.door.key] ?? null })).filter((u) => u.open !== null), v = [
    ...l.filter((u) => !p.includes(u)).map((u) => u.name),
    ...h.filter((u) => !e.opens[u.door.key]).map((u) => `Öffnen ${u.name}`)
  ];
  if (o && (n.line(0, "esp32:"), n.line(2, `board: ${o.board}`), n.line(2, "framework:"), n.line(4, "type: esp-idf"), n.comment(4, "sdkconfig_options:"), n.comment(4, "  CONFIG_FREERTOS_UNICORE: y # nur bei Single-Core-ESP32 nötig"), n.line(0)), o || p.length + m.length > 0) {
    if (n.line(0, "esphome:"), o && (n.line(2, `name: ${o.name}`), n.line(2, `friendly_name: ${ce(o.friendlyName)}`)), p.length + m.length > 0) {
      n.line(2, "on_boot:");
      for (const u of p) I(n, 4, "binary_sensor", u.id, "OFF");
      for (const u of m) I(n, 4, "lock", u.id, "LOCKED");
    }
    n.line(0);
  }
  o && As(n), n.line(0, "remote_receiver:"), o ? xs(n) : n.comment(2, "pin, dump, filter, tolerance, idle, buffer_size ... aus der bestehenden Konfiguration"), n.line(2, "on_abbwelcome:"), n.line(4, "then:"), d && (n.comment(6, "Debug-Textsensor (id ggf. an eure Firmware anpassen)"), n.line(6, `- lambda: 'char buf[192]; x.format_to(buf, 192); id(${d}).publish_state(buf);'`));
  for (const u of p) {
    const g = e.rings[u.door.key], b = g.outdoorAddress !== void 0 ? ` – ${z(g.outdoorAddress, r)}` : "";
    n.comment(6, `${u.name}${b}`), n.line(6, "- if:"), n.line(10, "condition:"), n.line(12, "or:");
    for (const A of g.selected)
      n.comment(14, $s(A, g.captures, r)), n.line(14, `- lambda: ${ys(A, r)}`);
    n.line(10, "then:"), I(n, 12, "binary_sensor", u.id, "ON"), I(n, 12, "binary_sensor", u.id, "OFF");
  }
  for (const u of m) {
    const g = u.open.confirmation;
    g && (n.comment(6, `${u.name} geöffnet (Bestätigung Typ ${Pe(g.messageType)})`), n.line(6, "- if:"), n.line(10, "condition:"), n.line(12, "and:"), n.line(14, `- lambda: 'return (x.get_message_type() == ${G(g.messageType)});'`), n.line(
      14,
      `- lambda: 'return (x.get_source_address() == ${$(g.source, r)});'`
    ), g.destination !== void 0 && n.line(
      14,
      `- lambda: 'return (x.get_destination_address() == ${$(g.destination, r)});'`
    ), n.line(10, "then:"), _t(n, 12, u.id, a));
  }
  if (v.length > 0 && n.comment(6, `Nicht ermittelt: ${v.join(", ")}`), n.line(0), p.length > 0) {
    n.line(0, "binary_sensor:");
    for (const u of p)
      n.line(2, "- platform: template"), n.line(4, `name: ${ce(u.name)}`), n.line(4, `id: ${u.id}`), n.line(4, `icon: ${u.icon}`), n.line(4, "filters:"), n.line(6, "- delayed_off: 1s");
    n.line(0);
  }
  if (o && (n.line(0, "sensor:"), n.line(2, "- platform: internal_temperature"), n.line(4, 'name: "Internal Temperature"'), n.line(0), n.line(0, "text_sensor:"), n.line(2, "- platform: template"), n.line(
    4,
    `name: ${ce(o.debugSensorName ?? K.debugSensorName)} # Debug-Sensor für diese Karte`
  ), n.line(4, "id: doorbell_intercom"), n.line(4, "icon: mdi:bell-circle"), n.line(4, "update_interval: never"), n.line(0)), m.length > 0) {
    n.line(0, "lock:");
    for (const u of m) {
      const { open: g } = u, b = s.maskDoorCode ? g.data.map(() => 0) : g.data;
      n.line(2, "- platform: template"), n.line(4, `name: ${ce(u.name)}`), n.line(4, `id: ${u.id}`), n.line(4, `icon: ${u.icon}`), n.line(4, "lock_action:"), I(n, 6, "lock", u.id, "LOCKED"), n.line(4, "unlock_action:"), n.line(6, "- remote_transmitter.transmit_abbwelcome:"), n.line(10, `source_address: ${$(i.address, r)} # Innenstation`), n.line(
        10,
        `destination_address: ${$(g.destination, r)} # ${z(g.destination, r)}`
      ), n.line(10, `three_byte_address: ${r}`), n.line(
        10,
        `message_type: ${G(g.messageType)} # ${g.messageType === 14 ? "Schiebetür" : "Türöffner"}`
      );
      const A = s.maskDoorCode ? `PLATZHALTER: ${b.length} Byte ${Fe}` : Fe;
      n.line(10, `data: [${b.map(G).join(", ")}] # ${A}`), g.confirmation || (n.comment(6, "Keine Bestätigung vom Bus aufgenommen – Status wird nur angenommen"), _t(n, 6, u.id, a));
    }
  }
  return o && (m.length > 0 && n.line(0), n.line(0, "button:"), n.line(2, "- platform: restart"), n.line(4, 'name: "Reboot"'), n.line(2, "- platform: safe_mode"), n.line(4, 'name: "Reboot (Safe Mode)"'), n.line(0), n.line(0, "status_led:"), n.line(2, "pin:"), n.line(4, "number: GPIO2"), n.line(4, "ignore_strapping_warning: true")), n.toString();
}
function As(e) {
  e.line(0, "wifi:"), e.line(2, "ssid: !secret wifi_ssid"), e.line(2, "password: !secret wifi_password"), e.line(2, "ap:"), e.line(4, "password: !secret ap_password"), e.line(0), e.line(0, "captive_portal:"), e.line(0), e.line(0, "logger:"), e.line(0), e.line(0, "api:"), e.line(2, "encryption:"), e.line(4, "key: !secret api_encryption_key"), e.line(2, "batch_delay: 0ms # jeden Bus-Frame einzeln an Home Assistant senden"), e.line(0), e.line(0, "ota:"), e.line(2, "- platform: esphome"), e.line(4, "password: !secret ota_password"), e.line(0), e.line(0, "remote_transmitter:"), e.line(2, "pin: GPIO26"), e.line(2, "carrier_duty_percent: 100%"), e.line(2, "non_blocking: true"), e.line(0);
}
function xs(e) {
  e.line(2, "pin:"), e.line(4, "number: GPIO25"), e.line(4, "mode:"), e.line(6, "input: true"), e.line(2, "dump: [abbwelcome]"), e.line(2, "filter: 8us"), e.line(2, "tolerance:"), e.line(4, "type: time"), e.line(4, "value: 26us"), e.line(2, "idle: 1500us"), e.line(2, "buffer_size: 15kB"), e.line(2, "rmt_symbols: 320"), e.line(2, "clock_resolution: 500000");
}
var ks = Object.defineProperty, Ss = Object.getOwnPropertyDescriptor, x = (e, t, s, n) => {
  for (var i = n > 1 ? void 0 : n ? Ss(t, s) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (i = (n ? o(t, s, i) : o(i)) || i);
  return n && i && ks(t, s, i), i;
};
const te = "abb-welcome-wizard-card", zs = "0.4.0", At = 10, Es = 40, Ts = 900 * 1e3, Ds = {
  info: "mdi:information-outline",
  warning: "mdi:alert-outline",
  error: "mdi:alert-circle-outline"
};
function ze(e) {
  const t = new Date(e);
  return Number.isNaN(t.getTime()) ? "--:--:--" : t.toLocaleTimeString("de-DE", { hour12: !1 });
}
const le = (e) => e.toString(16).toUpperCase().padStart(2, "0");
let w = class extends M {
  constructor() {
    super(...arguments), this.page = 0, this.live = [], this.capture = null, this.now = Date.now(), this.toast = "", this.maskDoorCode = !1, this.showDoorCode = !1, this.exportMode = "full", this.deviceEdits = {}, this.indoorInput = "", this.receivedCount = 0, this.syncing = !1, this.lastSyncAt = 0, this.syncFailed = !1, this.onVisibilityChange = () => {
      this.capture && (this.capture = document.visibilityState === "hidden" ? ut(this.capture) : pt(this.capture, Date.now()));
    };
  }
  // ---- Lovelace API --------------------------------------------------------------------------------
  static getConfigElement() {
    return document.createElement(Bt);
  }
  static getStubConfig(e) {
    return { entity: Object.keys(e?.states ?? {}).filter(
      (s) => s.startsWith("sensor.") && /intercom|abb|welcome|frame|doorbell/i.test(s)
    )[0] ?? "sensor.doorbell_intercom", capture_seconds: At };
  }
  setConfig(e) {
    if (!e || typeof e.entity != "string" || !e.entity.includes("."))
      throw new Error('Bitte "entity" auf den Debug-Textsensor setzen, z. B. sensor.doorbell_intercom.');
    if (e.capture_seconds !== void 0 && (typeof e.capture_seconds != "number" || e.capture_seconds < 2 || e.capture_seconds > 120))
      throw new Error('"capture_seconds" muss eine Zahl zwischen 2 und 120 sein.');
    if (e.indoor_address !== void 0 && ae(e.indoor_address) === void 0)
      throw new Error('"indoor_address" muss eine Adresse wie 0x1010 oder 0x000110 sein.');
    e.doors !== void 0 && at(e.doors);
    const t = this.config?.entity !== e.entity;
    this.config = e, t && (this.resubscribe(), this.session = us(e.entity) ?? ht(e.entity, this.configDoors), this.indoorInput = this.session.indoorAddress !== void 0 ? $(this.session.indoorAddress, this.session.indoorAddress > 65535) : "", this.live = [], this.capture = null, this.resumeCapture(e.entity));
  }
  getCardSize() {
    return 10;
  }
  set hass(e) {
    const t = !this._hass, s = this.online;
    this._hass = e, this.capture && s !== this.online && (this.capture = this.online ? pt(this.capture, Date.now()) : ut(this.capture)), t && this.subscribe(), this.requestUpdate();
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
    this.session && this.page > this.resultPage && (this.page = this.resultPage), e.has("page") && e.get("page") !== void 0 && this.renderRoot.querySelector(".stepper .current")?.scrollIntoView?.({ block: "nearest", inline: "center", behavior: "smooth" }), e.has("capture") && (this.capture ? this.startTimer() : this.stopTimer(), this.config && yt(this.config.entity, this.capture));
  }
  // ---- Event subscription (read-only: the card never calls services or sends frames) ---------------
  subscribe() {
    this.unsubscribe || !this._hass?.connection || !this.config || !this.isConnected || (this.unsubscribe = this._hass.connection.subscribeEvents((e) => this.onStateChanged(e), "state_changed").catch((e) => {
      console.error(`${te}: subscribing to state_changed failed`, e), this.unsubscribe = void 0;
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
    const t = Mt(e, this.config.entity);
    t && (this.receivedCount++, this.live = [t, ...this.live].slice(0, Es), this.capture && (this.capture = Yn(this.capture, t, this.captureSeconds, Date.now())));
  }
  // ---- Capture -------------------------------------------------------------------------------------
  get captureSeconds() {
    return this.config?.capture_seconds ?? At;
  }
  startTimer() {
    this.timer === void 0 && (this.timer = window.setInterval(() => {
      this.now = Date.now(), this.capture && (this.capture.missed ? this.syncFromHistory() : Zn(this.capture, this.now) && this.finishCapture());
    }, 250));
  }
  stopTimer() {
    this.timer !== void 0 && window.clearInterval(this.timer), this.timer = void 0;
  }
  beginCapture(e) {
    const t = this.currentStep;
    t && (this.now = Date.now(), this.syncFailed = !1, this.capture = qn(t.id, this.captureSeconds, e, this.now));
  }
  /** Fill in frames missed while offline from the recorder history (read-only). */
  async syncFromHistory() {
    const e = this.capture, t = Date.now();
    if (!(!e?.missed || e.syncAfter === void 0 || !this.online || !this._hass?.connection || !this.config || this.syncing || t - this.lastSyncAt < 2e3)) {
      this.syncing = !0, this.lastSyncAt = t;
      try {
        const { start: s, end: n } = Jn(e, t), i = await ts(this._hass.connection, this.config.entity, s, n);
        this.capture?.armedAt === e.armedAt && (this.capture = Qn(this.capture, i, this.captureSeconds, Date.now()));
      } catch (s) {
        console.warn(`${te}: reading history failed`, s), this.capture?.armedAt === e.armedAt && !this.syncFailed && (this.syncFailed = !0, this.capture = { ...this.capture, missed: !1, syncAfter: void 0 }, this.showToast("Verpasste Frames konnten nicht aus dem Verlauf geladen werden."));
      } finally {
        this.syncing = !1;
      }
    }
  }
  /** Continue a capture that was interrupted by reloading the page or app. */
  resumeCapture(e) {
    const t = ms(e);
    if (!t) return;
    const s = this.steps.findIndex((n) => n.id === t.step);
    if (s < 0 || Date.now() - t.armedAt > Ts) {
      yt(e, null);
      return;
    }
    this.page = s + 1, this.capture = { ...t, missed: !0, syncAfter: Date.now() + Ge }, this.showToast("Unterbrochene Aufnahme wird fortgesetzt.");
  }
  finishCapture() {
    const e = this.capture;
    if (this.capture = null, !e || e.phase !== "recording") return;
    const t = Math.min(Date.now(), e.endsAt ?? Date.now());
    this.updateSession(
      is(this.session, e.step, {
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
    this.session = e, ps(e);
  }
  /** Doors from the card config (`doors:`), otherwise the default gate / house door / apartment setup. */
  get configDoors() {
    return this.config?.doors !== void 0 ? at(this.config.doors) : [...je];
  }
  get steps() {
    return this.stepsCache?.doors !== this.session.doors && (this.stepsCache = { doors: this.session.doors, steps: ls(this.session.doors) }), this.stepsCache.steps;
  }
  /** Page 0 is the start page, 1..steps.length are the recording steps, the last page is the result. */
  get resultPage() {
    return this.steps.length + 1;
  }
  get configIndoor() {
    return ae(this.config?.indoor_address);
  }
  get result() {
    const e = this.session.indoorAddress ?? this.configIndoor, t = this.analysisCache;
    if (t && t.session === this.session && t.indoor === e) return t.result;
    const s = Kn(this.session, { indoorAddress: e });
    return this.analysisCache = { session: this.session, indoor: e, result: s }, s;
  }
  /** Address used to highlight own frames: detected, manual or expected from the dials. */
  get highlightAddress() {
    const e = this.result.indoor?.address;
    if (e !== void 0) return e;
    const t = pe(this.session.dials);
    return t !== void 0 ? ge(t, !1) : void 0;
  }
  exportSession() {
    const e = (/* @__PURE__ */ new Date()).toISOString().slice(0, 16).replace(/[:T]/g, "-");
    $t(`abb-welcome-session-${e}.json`, Rt(this.session), "application/json");
  }
  importSession() {
    this.renderRoot.querySelector("#import")?.click();
  }
  async onImportFile(e) {
    const t = e.target, s = t.files?.[0];
    if (t.value = "", !(!s || !this.config))
      try {
        const n = Lt(await s.text());
        this.updateSession({ ...n, entity: this.config.entity }), this.indoorInput = n.indoorAddress !== void 0 ? $(n.indoorAddress, n.indoorAddress > 65535) : "", this.page = this.resultPage, this.showToast("Sitzung importiert.");
      } catch (n) {
        this.showToast(n instanceof Error ? n.message : String(n));
      }
  }
  resetSession() {
    this.config && window.confirm("Alle Aufnahmen dieser Sitzung löschen und neu beginnen?") && (hs(this.config.entity), this.updateSession(ht(this.config.entity, this.configDoors)), this.indoorInput = "", this.capture = null, this.page = 0);
  }
  onDialInput(e, t) {
    const s = t.target.value, n = s === "" ? void 0 : Number(s);
    this.updateSession(
      os(this.session, {
        ...this.session.dials,
        [e]: n !== void 0 && Number.isInteger(n) ? n : void 0
      })
    );
  }
  onIndoorInput(e) {
    this.indoorInput = e.target.value;
    const t = this.indoorInput.trim();
    if (t === "") this.updateSession(ft(this.session, void 0));
    else {
      const s = ae(t);
      s !== void 0 && this.updateSession(ft(this.session, s));
    }
  }
  updateDoor(e, t) {
    let s = this.session.doors.map((n) => n.key === e ? { ...n, ...t } : n);
    t.default && (s = s.map((n) => n.key === e ? n : { ...n, default: !1 })), this.updateSession(W(this.session, s));
  }
  renameDoor(e, t) {
    const s = t.target, n = s.value.trim();
    n === "" ? s.value = e.name : n !== e.name && this.updateDoor(e.key, { name: n });
  }
  addDoor() {
    this.session.doors.length >= Q || this.updateSession(W(this.session, [...this.session.doors, An(this.session.doors)]));
  }
  removeDoor(e) {
    if (this.session.doors.length <= 1) return;
    const t = gt(this.session, e);
    t > 0 && !window.confirm(`„${e.name}“ und ${t} Aufnahme(n) dieser Tür löschen?`) || this.updateSession(
      W(
        this.session,
        this.session.doors.filter((s) => s.key !== e.key)
      )
    );
  }
  resetDoors() {
    const e = this.configDoors, t = this.session.doors.filter((s) => !e.some((n) => n.key === s.key)).reduce((s, n) => s + gt(this.session, n), 0);
    t > 0 && !window.confirm(`Dabei gehen ${t} Aufnahme(n) entfernter Türen verloren. Fortfahren?`) || this.updateSession(W(this.session, e));
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
    e && this.updateSession(rs(this.session, e.id, !0)), this.goTo(this.page + 1);
  }
  // ---- Rendering -----------------------------------------------------------------------------------
  render() {
    return !this.config || !this.session ? f : c`
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
          ${this.capture ? f : this.renderConnectionStatus()}
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
        const s = S(this.session, t.id), n = s.captures.length > 0 ? "done" : s.skipped ? "skipped" : "";
        return { label: t.short, icon: n === "done" ? "mdi:check" : t.icon, status: n };
      }),
      { label: "Ergebnis", icon: "mdi:file-code-outline", status: "" }
    ];
    return c`
      <nav class="stepper" aria-label="Schritte">
        ${e.map(
      (t, s) => c`
            <button
              class="${t.status} ${s === this.page ? "current" : ""}"
              ?disabled=${!!this.capture}
              aria-current=${s === this.page ? "step" : "false"}
              title=${t.label}
              @click=${() => this.goTo(s)}
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
    const e = this.currentStep, t = e ? S(this.session, e.id).captures.length > 0 : !1;
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
        ${this.toast ? c`<span class="toast" role="status">${this.toast}</span>` : f}
        <span class="spacer"></span>
        ${e && !t ? c`<button class="btn text" ?disabled=${!!this.capture} @click=${this.skipStep}>
                Überspringen
              </button>` : f}
        ${this.page < this.resultPage ? c`<button
                class="btn ${!e || t ? "primary" : ""}"
                ?disabled=${!!this.capture}
                @click=${() => this.goTo(this.page + 1)}
              >
                ${this.page === this.steps.length ? "Auswerten" : "Weiter"}<ha-icon
                  icon="mdi:chevron-right"
                ></ha-icon>
              </button>` : f}
      </div>
    `;
  }
  // ---- Start page ----------------------------------------------------------------------------------
  renderStart() {
    const e = this.config.entity, t = this.hass?.states[e], s = pe(this.session.dials), n = this.result.threeByte, i = s !== void 0 ? ge(s, n) : void 0, r = this.indoorInput.trim() !== "" && ae(this.indoorInput) === void 0, o = this.configIndoor;
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
      (d) => c`
              <label class="field"
                >${d.toUpperCase()}
                <input
                  type="number"
                  min="0"
                  max="9"
                  inputmode="numeric"
                  .value=${this.session.dials[d]?.toString() ?? ""}
                  @change=${(a) => this.onDialInput(d, a)}
                />
              </label>
            `
    )}
        </div>
        ${i !== void 0 ? c`<p class="small">
                Wohnung <b>${s}</b> → erwartete Innenstationsadresse
                <span class="badge accent">${$(i, n)}</span>
              </p>` : f}
      </div>

      <details ?open=${o !== void 0 || this.session.indoorAddress !== void 0}>
        <summary>Innenstationsadresse manuell festlegen (für Profis)</summary>
        <div class="panel" style="border:none;padding:0">
          <p class="muted small">
            Normalerweise ermittelt der Assistent die Adresse selbst. Falls du sie kennst oder die Erkennung
            danebenliegt, kannst du sie hier
            vorgeben${o !== void 0 ? c` (Karten-Konfiguration:
                    <code>${$(o, o > 65535)}</code>)` : f}.
          </p>
          <label class="field"
            >Adresse (z. B. 0x1010 oder 0x000110)
            <input
              type="text"
              class=${r ? "invalid" : ""}
              placeholder=${o !== void 0 ? $(o, o > 65535) : "automatisch"}
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
                  <ha-icon icon=${be(t)}></ha-icon>
                  <input
                    type="text"
                    aria-label="Name der Tür"
                    maxlength="40"
                    .value=${t.name}
                    @change=${(s) => this.renameDoor(t, s)}
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
                    @change=${(s) => this.updateDoor(t.key, {
        type: s.target.value,
        open: s.target.value === "outdoor"
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
                      @change=${(s) => this.updateDoor(t.key, { open: s.target.checked })}
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
                      @change=${(s) => this.updateDoor(t.key, { default: s.target.checked })}
                    />Standard-Tür
                  </label>
                </div>
              </div>
            `
    )}
        </div>
        <div class="actions">
          <button class="btn" ?disabled=${e.length >= Q} @click=${this.addDoor}>
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
    return e.length === 0 ? f : c`<p class="muted small">Ohne elektrischen Öffner (nur Klingel): ${e.join(", ")}.</p>`;
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
    const s = this.live.length > 0;
    return c`
      <div class="panel">
        <h3 style="display:flex;align-items:center;gap:8px">
          <span class="live-dot ${s ? "" : "off"}"></span>${e}
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
    const s = this.highlightAddress;
    return c`
      <div class="frames" role="log">
        ${e.map((n) => {
      const i = It(n.line);
      if (!i.ok)
        return c`<div class="frame unparsed" title="Nicht erkannt">
              <span class="time">${ze(n.time)}</span><span class="route">?</span
              ><span class="detail">${n.line}</span>
            </div>`;
      const r = i.frame, o = s !== void 0 && Ue(r, s);
      return c`<div class="frame ${s === void 0 ? "" : o ? "own" : "foreign"}" title=${n.line}>
            <span class="time">${ze(n.time)}</span>
            <span class="route"
              >${Se(r.src, r.threeByte)} ${r.retransmission ? "»" : "›"}
              ${Se(r.dst, r.threeByte)}</span
            >
            <span class="detail"
              ><span class="type">${le(r.type)}</span>${r.data.length ? c` · ${q(r.data)}` : f}</span
            >
          </div>`;
    })}
      </div>
    `;
  }
  // ---- Recording step ------------------------------------------------------------------------------
  renderStep(e) {
    const s = S(this.session, e.id).captures.length;
    return c`
      <h2><ha-icon icon=${e.icon}></ha-icon>${e.title}</h2>
      <ol class="todo">
        ${e.todo.map((n) => c`<li>${n}</li>`)}
      </ol>
      <details>
        <summary>Warum?</summary>
        <p class="small">${e.why}</p>
      </details>
      ${e.needsPause ? this.renderPauseHint() : f}
      ${e.kind === "open" ? c`<div class="callout warning">
              <ha-icon icon="mdi:door-open"></ha-icon>
              <span
                >Die Tür öffnet sich bei diesem Schritt tatsächlich – nur ausführen, wenn das in Ordnung
                ist.</span
              >
            </div>` : f}

      <div class="panel">
        ${this.capture ? this.renderActiveCapture() : this.renderCaptureControls(e, s)}
      </div>

      ${s > 0 ? this.renderCaptures(e) : f}
      ${s > 0 ? this.renderStepFeedback(e) : f}
      ${this.capture ? this.renderLive("Frames dieser Aufnahme", [...this.capture.lines].reverse()) : this.renderLive("Live-Frames")}
    `;
  }
  renderPauseHint() {
    const e = as(this.session);
    if (!e) return c``;
    const t = (this.now - e.getTime()) / 6e4, s = t >= vt;
    return c`<div class="callout ${s ? "ok" : "warning"}">
      <ha-icon icon="mdi:timer-outline"></ha-icon>
      <span
        >Letztes Klingeln vor
        ${t < 1 ? "weniger als einer Minute" : `${Math.floor(t)} Minute(n)`}.
        ${s ? "Passt – die Schlüssel-Taste öffnet jetzt die Standard-Außenstation." : `Bitte noch etwas warten (mindestens ${vt} Minuten).`}</span
      >
    </div>`;
  }
  renderCaptureControls(e, t) {
    const s = this.captureSeconds, n = this.waitForFrame ?? e.waitForFrame;
    return c`
      <div class="actions">
        <button class="btn primary large" @click=${() => this.beginCapture(n)}>
          <ha-icon icon=${t === 0 ? "mdi:record-circle-outline" : "mdi:repeat"}></ha-icon>
          ${t === 0 ? "Aufnahme starten" : "Wiederholen"}
        </button>
        <span class="spacer" style="flex:1"></span>
        ${this.renderReps(t, e.repetitions)}
      </div>
      <label class="switch">
        <input
          type="checkbox"
          .checked=${n}
          @change=${(i) => this.waitForFrame = i.target.checked}
        />
        <span
          >Erst mit dem ersten Frame starten
          <span class="muted">(z. B. wenn du erst zur Tür gehen musst)</span></span
        >
      </label>
      <p class="muted small">
        ${n ? `Nach dem Tippen wartet die Karte auf den ersten Frame und nimmt ab dann ${s} s auf.` : `Die Aufnahme läuft ${s} s ab dem Tippen.`}
        ${t === 0 ? "" : t < e.repetitions ? `Empfohlen: ${e.repetitions} Aufnahmen.` : "Genug Aufnahmen – weiter zum nächsten Schritt."}
      </p>
    `;
  }
  renderReps(e, t) {
    const s = Math.max(e, t);
    return c`<span class="reps" title="${e} von ${t} empfohlenen Aufnahmen">
      ${Array.from({ length: s }, (n, i) => c`<span class=${i < e ? "filled" : ""}></span>`)}
    </span>`;
  }
  renderConnectionStatus() {
    return this.online ? this.capture?.missed ? c`<div class="callout info" role="status">
        <ha-icon icon="mdi:history"></ha-icon>
        <span>Verbindung wieder da – verpasste Frames werden aus dem Verlauf nachgeladen …</span>
      </div>` : f : c`<div class="callout warning" role="status">
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
    const t = this.captureSeconds * 1e3, s = Math.max(0, (e.endsAt ?? this.now) - this.now), n = 2 * Math.PI * 32, i = s === 0 && e.missed;
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
              stroke-dasharray=${n}
              stroke-dashoffset=${n * (1 - s / t)}
            ></circle>
          </svg>
          <div class="value">${Math.ceil(s / 1e3)}</div>
        </div>
        <div style="flex:1">
          <b>${i ? "Aufnahme wird vervollständigt …" : "Aufnahme läuft …"}</b>
          <p class="muted small">${e.lines.length} Frame(s) empfangen</p>
        </div>
        <button class="btn" @click=${this.finishCapture}>Jetzt beenden</button>
      </div>`;
  }
  renderCaptures(e) {
    const t = S(this.session, e.id).captures;
    return c`
      <div class="captures">
        <div class="actions">
          <h3 style="margin:0;flex:1">Aufnahmen</h3>
          <button
            class="btn text danger"
            @click=${() => this.updateSession(mt(this.session, e.id, t.length - 1))}
          >
            <ha-icon icon="mdi:undo"></ha-icon>Verwerfen
          </button>
        </div>
        ${t.map(
      (s, n) => c`
            <details class="capture-row">
              <summary>
                <ha-icon icon="mdi:chevron-right"></ha-icon>
                <span class="grow">Aufnahme ${n + 1} · ${ze(s.startedAt)}</span>
                <span class="badge ${s.lines.length ? "" : "warning"}">${s.lines.length} Frames</span>
                <button
                  class="icon"
                  title="Diese Aufnahme löschen"
                  @click=${(i) => {
        i.preventDefault(), this.updateSession(mt(this.session, e.id, n));
      }}
                >
                  <ha-icon icon="mdi:delete-outline"></ha-icon>
                </button>
              </summary>
              ${this.renderFrames(s.lines, "Keine Frames in dieser Aufnahme.")}
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
          >${S(this.session, e.id).captures.flatMap((n) => n.lines).length} Frames als Baseline
          markiert.</span
        >
      </div>`;
    if (e.kind === "ring") {
      const n = t.rings[e.door.key];
      return n.candidates.length > 0 ? c`<div class="panel">
            <h3>Erkannt</h3>
            ${this.renderCandidates(n)}
          </div>` : c`<div class="callout warning">
            <ha-icon icon="mdi:alert-outline"></ha-icon>
            <span
              >Noch keine passenden Klingel-Frames für
              ${z(t.indoor.address, t.threeByte)}.</span
            >
          </div>`;
    }
    const s = t.opens[e.door.key];
    return s ? c`<div class="panel">
          <h3>Erkannt</h3>
          ${this.renderOpen(s)}
        </div>` : c`<div class="callout warning">
          <ha-icon icon="mdi:alert-outline"></ha-icon>
          <span>Kein Öffnen-Frame (Typ 0D/0E) von der Innenstation gefunden.</span>
        </div>`;
  }
  // ---- Result page ---------------------------------------------------------------------------------
  renderResult() {
    const e = this.result, { indoor: t, threeByte: s } = e, n = pe(this.session.dials), i = this.device, r = _s(e, this.session.doors, {
      maskDoorCode: this.maskDoorCode,
      apartment: n,
      device: this.exportMode === "full" ? i : void 0
    });
    return Object.values(this.session.steps).some((d) => d.captures.length > 0) ? c`
      <h2><ha-icon icon="mdi:file-code-outline"></ha-icon>Ergebnis</h2>

      <div class="grid">
        <div class="panel stat">
          <span class="muted small">Innenstation</span>
          <span class="value">${t ? $(t.address, s) : "—"}</span>
          ${t ? c`<span class="small">
                  ${t.method === "manual" ? c`<span class="badge accent">manuell</span>` : t.method === "open" ? c`<span class="badge ok">aus Öffnen-Frames</span>` : c`<span class="badge warning">nach Häufigkeit</span>`}
                  ${t.expected !== void 0 ? t.matchesExpected ? c`<span class="badge ok"
                            ><ha-icon icon="mdi:check"></ha-icon>passt zu Wohnung ${n}</span
                          >` : c`<span class="badge warning"
                            >erwartet ${$(t.expected, s)} (Wohnung
                            ${n})</span
                          >` : f}
                </span>` : f}
        </div>
        <div class="panel stat">
          <span class="muted small">Adresslänge</span>
          <span class="value">${s ? "3 Byte" : "2 Byte"}</span>
          <span class="muted small">${s ? "three_byte_address: true" : "Standard"}</span>
        </div>
      </div>

      ${this.renderWarnings(e)}

      <div class="panel">
        <h3>Klingeln</h3>
        ${Kt(this.session.doors).map((d) => {
      const a = e.rings[d.door.key], l = a.selected.length > 0;
      return c`<div class="result-row">
            <ha-icon icon=${be(d.door)}></ha-icon>
            <div>
              <div class="row-head">
                <b>${d.name}</b>
                ${a.outdoorAddress !== void 0 ? c`<span class="muted small"
                        >${z(a.outdoorAddress, s)}</span
                      >` : f}
                <span class="spacer"></span>
                ${l ? c`<span class="badge ok">binary_sensor.${d.id}</span>` : c`<span class="badge ${a.captures ? "warning" : ""}"
                        >${a.captures ? "nicht erkannt" : "nicht aufgenommen"}</span
                      >`}
              </div>
              ${a.candidates.length > 0 ? this.renderCandidates(a) : f}
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
        ${Ht(this.session.doors).map((d) => {
      const a = e.opens[d.door.key], l = S(this.session, T(d.door)).captures.length > 0;
      return c`<div class="result-row">
            <ha-icon icon=${d.icon}></ha-icon>
            <div>
              <div class="row-head">
                <b>${d.name}</b>
                <span class="spacer"></span>
                ${a ? c`<span class="badge ok">lock.${d.id}</span>` : c`<span class="badge ${l ? "warning" : ""}"
                        >${l ? "nicht erkannt" : "nicht aufgenommen"}</span
                      >`}
              </div>
              ${a ? this.renderOpen(a) : f}
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
              @change=${(d) => this.maskDoorCode = d.target.checked}
            />Türcode maskieren
          </label>
        </h3>
        <div class="segmented" role="radiogroup" aria-label="Umfang">
          ${[
      ["full", "Komplette Datei"],
      ["snippet", "Nur geänderte Abschnitte"]
    ].map(
      ([d, a]) => c`<button
                role="radio"
                aria-checked=${this.exportMode === d}
                class=${this.exportMode === d ? "active" : ""}
                @click=${() => this.exportMode = d}
              >
                ${a}
              </button>`
    )}
        </div>
        ${this.exportMode === "full" ? this.renderDeviceFields(i) : f}
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
            @click=${() => $t(
      this.exportMode === "full" ? `${i.name}.yaml` : "abb-welcome-abschnitte.yaml",
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
                  ${e.stats.unparsedLines.map((d) => c`<div class="frame unparsed"><span></span><span></span><span>${d}</span></div>`)}
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
    const e = this.config ? this._hass?.entities?.[this.config.entity] : void 0, t = e?.device_id ? this._hass?.devices?.[e.device_id] : void 0, s = t?.name_by_user || t?.name || K.friendlyName, n = this.config ? this._hass?.states[this.config.entity]?.attributes.friendly_name : void 0, i = typeof n == "string" && n.startsWith(`${s} `) ? n.slice(s.length + 1) : K.debugSensorName;
    return {
      ...K,
      name: wt(s),
      friendlyName: s,
      debugSensorName: i,
      ...this.deviceEdits
    };
  }
  renderDeviceFields(e) {
    const t = (s, n, i) => c`<label class="field"
        >${n}
        <input
          type="text"
          .value=${e[s] ?? ""}
          @change=${(r) => {
      const o = r.target.value.trim(), d = { ...this.deviceEdits };
      o === "" ? delete d[s] : d[s] = s === "name" ? wt(o) : o, this.deviceEdits = d;
    }}
        />
        ${i ? c`<span>${i}</span>` : f}
      </label>`;
    return c`<div class="fields device-fields">
      ${t("name", "Gerätename", "esphome name – muss zum bestehenden Gerät passen")}
      ${t("friendlyName", "Anzeigename")}
      ${t("debugSensorName", "Debug-Sensor", "Unverändert lassen, damit diese Karte ihn findet")}
    </div>`;
  }
  async copyYaml(e) {
    this.showToast(
      await fs(e) ? "YAML kopiert." : "Kopieren nicht möglich – bitte manuell markieren."
    );
  }
  renderWarnings(e) {
    const t = ["error", "warning", "info"], s = [...e.warnings].sort(
      (r, o) => t.indexOf(r.severity) - t.indexOf(o.severity)
    );
    if (s.length === 0)
      return c`<div class="callout ok">
        <ha-icon icon="mdi:check-circle-outline"></ha-icon><span>Keine Auffälligkeiten.</span>
      </div>`;
    const n = s.filter((r) => r.severity !== "info"), i = s.filter((r) => r.severity === "info");
    return c`
      ${n.length === 0 ? c`<div class="callout ok">
              <ha-icon icon="mdi:check-circle-outline"></ha-icon><span>Keine Probleme gefunden.</span>
            </div>` : f}
      ${n.map(
      (r) => c`<div class="callout ${r.severity}">
            <ha-icon icon=${Ds[r.severity]}></ha-icon><span>${r.message}</span>
          </div>`
    )}
      ${i.length > 0 ? c`<details>
              <summary>${i.length} Hinweis(e)</summary>
              <ul class="small" style="margin:0;padding-left:1.2em;line-height:1.5">
                ${i.map((r) => c`<li>${r.message}</li>`)}
              </ul>
            </details>` : f}
    `;
  }
  renderCandidates(e) {
    const { threeByte: t } = this.result, s = new Set(e.selected.map((i) => i.key)), n = (i) => {
      const r = (d) => Se(d, t), o = i.src !== void 0 && i.dst !== void 0 ? `${r(i.src)} › ${r(i.dst)}` : i.src !== void 0 ? `von ${r(i.src)}` : i.dst !== void 0 ? `an ${r(i.dst)}` : "";
      return `Typ ${le(i.type)} ${o}${i.data ? ` · ${q(i.data)}` : ""}`;
    };
    return c`<div class="candidates">
      ${e.candidates.map(
      (i) => c`<div
            class="candidate ${s.has(i.key) ? "" : "unselected"}"
            title=${s.has(i.key) ? "wird verwendet" : "nicht in allen Aufnahmen – wird nicht verwendet"}
          >
            <code>${n(i)}</code>
            <div
              class="meter ${i.reliable ? "" : "partial"}"
              title="${i.occurrences}/${e.captures} Aufnahmen"
            >
              <div style="width:${Math.round(i.score * 100)}%"></div>
            </div>
          </div>`
    )}
    </div>`;
  }
  renderOpen(e) {
    const { threeByte: t } = this.result, s = this.showDoorCode ? q(e.data) : e.data.map(() => "••").join(" ");
    return c`<dl class="kv" style="margin:6px 0 0">
      <dt>Ziel</dt>
      <dd>${z(e.destination, t)}</dd>
      <dt>Typ</dt>
      <dd>${le(e.messageType)} ${e.messageType === 14 ? "(Schiebetür)" : "(Türöffner)"}</dd>
      <dt>Türcode</dt>
      <dd>${s || "—"}</dd>
      <dt>Bestätigung</dt>
      <dd>
        ${e.confirmation ? `${le(e.confirmation.messageType)} von ${$(e.confirmation.source, t)}` : "—"}
      </dd>
      <dt>Stabilität</dt>
      <dd>${e.occurrences}/${e.captures} Aufnahmen</dd>
    </dl>`;
  }
};
w.styles = gs;
x([
  _()
], w.prototype, "config", 2);
x([
  _()
], w.prototype, "session", 2);
x([
  _()
], w.prototype, "page", 2);
x([
  _()
], w.prototype, "live", 2);
x([
  _()
], w.prototype, "capture", 2);
x([
  _()
], w.prototype, "now", 2);
x([
  _()
], w.prototype, "toast", 2);
x([
  _()
], w.prototype, "maskDoorCode", 2);
x([
  _()
], w.prototype, "showDoorCode", 2);
x([
  _()
], w.prototype, "exportMode", 2);
x([
  _()
], w.prototype, "deviceEdits", 2);
x([
  _()
], w.prototype, "indoorInput", 2);
x([
  _()
], w.prototype, "receivedCount", 2);
x([
  _()
], w.prototype, "waitForFrame", 2);
w = x([
  Tt(te)
], w);
window.customCards = window.customCards ?? [];
window.customCards.some((e) => e.type === te) || window.customCards.push({
  type: te,
  name: "ABB-Welcome Wizard",
  description: "Assistent zum Einmessen von Klingeln und Türöffnern einer Busch-/ABB-Welcome-Anlage.",
  preview: !1,
  documentationURL: "https://github.com/jako-dev/esp32-abb-wizard-card"
});
console.info(
  `%c ABB-WELCOME-WIZARD-CARD %c ${zs} `,
  "background:#03a9f4;color:#fff",
  "background:#444;color:#fff"
);
export {
  w as AbbWelcomeWizardCard
};
