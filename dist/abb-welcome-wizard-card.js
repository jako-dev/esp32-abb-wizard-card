/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const X = globalThis, _e = X.ShadowRoot && (X.ShadyCSS === void 0 || X.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Ae = Symbol(), De = /* @__PURE__ */ new WeakMap();
let tt = class {
  constructor(e, n, s) {
    if (this._$cssResult$ = !0, s !== Ae) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = n;
  }
  get styleSheet() {
    let e = this.o;
    const n = this.t;
    if (_e && e === void 0) {
      const s = n !== void 0 && n.length === 1;
      s && (e = De.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), s && De.set(n, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const vt = (t) => new tt(typeof t == "string" ? t : t + "", void 0, Ae), bt = (t, ...e) => {
  const n = t.length === 1 ? t[0] : e.reduce((s, i, r) => s + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + t[r + 1], t[0]);
  return new tt(n, t, Ae);
}, $t = (t, e) => {
  if (_e) t.adoptedStyleSheets = e.map((n) => n instanceof CSSStyleSheet ? n : n.styleSheet);
  else for (const n of e) {
    const s = document.createElement("style"), i = X.litNonce;
    i !== void 0 && s.setAttribute("nonce", i), s.textContent = n.cssText, t.appendChild(s);
  }
}, Fe = _e ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let n = "";
  for (const s of e.cssRules) n += s.cssText;
  return vt(n);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: yt, defineProperty: wt, getOwnPropertyDescriptor: _t, getOwnPropertyNames: At, getOwnPropertySymbols: xt, getPrototypeOf: St } = Object, oe = globalThis, Pe = oe.trustedTypes, kt = Pe ? Pe.emptyScript : "", zt = oe.reactiveElementPolyfillSupport, N = (t, e) => t, te = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? kt : null;
      break;
    case Object:
    case Array:
      t = t == null ? t : JSON.stringify(t);
  }
  return t;
}, fromAttribute(t, e) {
  let n = t;
  switch (e) {
    case Boolean:
      n = t !== null;
      break;
    case Number:
      n = t === null ? null : Number(t);
      break;
    case Object:
    case Array:
      try {
        n = JSON.parse(t);
      } catch {
        n = null;
      }
  }
  return n;
} }, xe = (t, e) => !yt(t, e), Be = { attribute: !0, type: String, converter: te, reflect: !1, useDefault: !1, hasChanged: xe };
Symbol.metadata ??= Symbol("metadata"), oe.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let D = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, n = Be) {
    if (n.state && (n.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((n = Object.create(n)).wrapped = !0), this.elementProperties.set(e, n), !n.noAccessor) {
      const s = Symbol(), i = this.getPropertyDescriptor(e, s, n);
      i !== void 0 && wt(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, n, s) {
    const { get: i, set: r } = _t(this.prototype, e) ?? { get() {
      return this[n];
    }, set(o) {
      this[n] = o;
    } };
    return { get: i, set(o) {
      const d = i?.call(this);
      r?.call(this, o), this.requestUpdate(e, d, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Be;
  }
  static _$Ei() {
    if (this.hasOwnProperty(N("elementProperties"))) return;
    const e = St(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(N("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(N("properties"))) {
      const n = this.properties, s = [...At(n), ...xt(n)];
      for (const i of s) this.createProperty(i, n[i]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const n = litPropertyMetadata.get(e);
      if (n !== void 0) for (const [s, i] of n) this.elementProperties.set(s, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [n, s] of this.elementProperties) {
      const i = this._$Eu(n, s);
      i !== void 0 && this._$Eh.set(i, n);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const n = [];
    if (Array.isArray(e)) {
      const s = new Set(e.flat(1 / 0).reverse());
      for (const i of s) n.unshift(Fe(i));
    } else e !== void 0 && n.push(Fe(e));
    return n;
  }
  static _$Eu(e, n) {
    const s = n.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
  }
  addController(e) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
  }
  removeController(e) {
    this._$EO?.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), n = this.constructor.elementProperties;
    for (const s of n.keys()) this.hasOwnProperty(s) && (e.set(s, this[s]), delete this[s]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return $t(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, n, s) {
    this._$AK(e, s);
  }
  _$ET(e, n) {
    const s = this.constructor.elementProperties.get(e), i = this.constructor._$Eu(e, s);
    if (i !== void 0 && s.reflect === !0) {
      const r = (s.converter?.toAttribute !== void 0 ? s.converter : te).toAttribute(n, s.type);
      this._$Em = e, r == null ? this.removeAttribute(i) : this.setAttribute(i, r), this._$Em = null;
    }
  }
  _$AK(e, n) {
    const s = this.constructor, i = s._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const r = s.getPropertyOptions(i), o = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : te;
      this._$Em = i;
      const d = o.fromAttribute(n, r.type);
      this[i] = d ?? this._$Ej?.get(i) ?? d, this._$Em = null;
    }
  }
  requestUpdate(e, n, s, i = !1, r) {
    if (e !== void 0) {
      const o = this.constructor;
      if (i === !1 && (r = this[e]), s ??= o.getPropertyOptions(e), !((s.hasChanged ?? xe)(r, n) || s.useDefault && s.reflect && r === this._$Ej?.get(e) && !this.hasAttribute(o._$Eu(e, s)))) return;
      this.C(e, n, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, n, { useDefault: s, reflect: i, wrapped: r }, o) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, o ?? n ?? this[e]), r !== !0 || o !== void 0) || (this._$AL.has(e) || (this.hasUpdated || s || (n = void 0), this._$AL.set(e, n)), i === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (n) {
      Promise.reject(n);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
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
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [i, r] of s) {
        const { wrapped: o } = r, d = this[i];
        o !== !0 || this._$AL.has(i) || d === void 0 || this.C(i, void 0, r, d);
      }
    }
    let e = !1;
    const n = this._$AL;
    try {
      e = this.shouldUpdate(n), e ? (this.willUpdate(n), this._$EO?.forEach((s) => s.hostUpdate?.()), this.update(n)) : this._$EM();
    } catch (s) {
      throw e = !1, this._$EM(), s;
    }
    e && this._$AE(n);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    this._$EO?.forEach((n) => n.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
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
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq &&= this._$Eq.forEach((n) => this._$ET(n, this[n])), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
D.elementStyles = [], D.shadowRootOptions = { mode: "open" }, D[N("elementProperties")] = /* @__PURE__ */ new Map(), D[N("finalized")] = /* @__PURE__ */ new Map(), zt?.({ ReactiveElement: D }), (oe.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Se = globalThis, Re = (t) => t, ne = Se.trustedTypes, Ne = ne ? ne.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, nt = "$lit$", S = `lit$${Math.random().toFixed(9).slice(2)}$`, st = "?" + S, Et = `<${st}>`, O = document, U = () => O.createComment(""), j = (t) => t === null || typeof t != "object" && typeof t != "function", ke = Array.isArray, Tt = (t) => ke(t) || typeof t?.[Symbol.iterator] == "function", ce = `[ 	
\f\r]`, B = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, He = /-->/g, Me = />/g, z = RegExp(`>|${ce}(?:([^\\s"'>=/]+)(${ce}*=${ce}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ke = /'/g, Le = /"/g, it = /^(?:script|style|textarea|title)$/i, Ct = (t) => (e, ...n) => ({ _$litType$: t, strings: e, values: n }), l = Ct(1), F = Symbol.for("lit-noChange"), f = Symbol.for("lit-nothing"), Ue = /* @__PURE__ */ new WeakMap(), C = O.createTreeWalker(O, 129);
function rt(t, e) {
  if (!ke(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Ne !== void 0 ? Ne.createHTML(e) : e;
}
const Ot = (t, e) => {
  const n = t.length - 1, s = [];
  let i, r = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = B;
  for (let d = 0; d < n; d++) {
    const a = t[d];
    let u, c, h = -1, p = 0;
    for (; p < a.length && (o.lastIndex = p, c = o.exec(a), c !== null); ) p = o.lastIndex, o === B ? c[1] === "!--" ? o = He : c[1] !== void 0 ? o = Me : c[2] !== void 0 ? (it.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = z) : c[3] !== void 0 && (o = z) : o === z ? c[0] === ">" ? (o = i ?? B, h = -1) : c[1] === void 0 ? h = -2 : (h = o.lastIndex - c[2].length, u = c[1], o = c[3] === void 0 ? z : c[3] === '"' ? Le : Ke) : o === Le || o === Ke ? o = z : o === He || o === Me ? o = B : (o = z, i = void 0);
    const m = o === z && t[d + 1].startsWith("/>") ? " " : "";
    r += o === B ? a + Et : h >= 0 ? (s.push(u), a.slice(0, h) + nt + a.slice(h) + S + m) : a + S + (h === -2 ? d : m);
  }
  return [rt(t, r + (t[n] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), s];
};
class W {
  constructor({ strings: e, _$litType$: n }, s) {
    let i;
    this.parts = [];
    let r = 0, o = 0;
    const d = e.length - 1, a = this.parts, [u, c] = Ot(e, n);
    if (this.el = W.createElement(u, s), C.currentNode = this.el.content, n === 2 || n === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (i = C.nextNode()) !== null && a.length < d; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const h of i.getAttributeNames()) if (h.endsWith(nt)) {
          const p = c[o++], m = i.getAttribute(h).split(S), g = /([.?@])?(.*)/.exec(p);
          a.push({ type: 1, index: r, name: g[2], strings: m, ctor: g[1] === "." ? Dt : g[1] === "?" ? Ft : g[1] === "@" ? Pt : ae }), i.removeAttribute(h);
        } else h.startsWith(S) && (a.push({ type: 6, index: r }), i.removeAttribute(h));
        if (it.test(i.tagName)) {
          const h = i.textContent.split(S), p = h.length - 1;
          if (p > 0) {
            i.textContent = ne ? ne.emptyScript : "";
            for (let m = 0; m < p; m++) i.append(h[m], U()), C.nextNode(), a.push({ type: 2, index: ++r });
            i.append(h[p], U());
          }
        }
      } else if (i.nodeType === 8) if (i.data === st) a.push({ type: 2, index: r });
      else {
        let h = -1;
        for (; (h = i.data.indexOf(S, h + 1)) !== -1; ) a.push({ type: 7, index: r }), h += S.length - 1;
      }
      r++;
    }
  }
  static createElement(e, n) {
    const s = O.createElement("template");
    return s.innerHTML = e, s;
  }
}
function P(t, e, n = t, s) {
  if (e === F) return e;
  let i = s !== void 0 ? n._$Co?.[s] : n._$Cl;
  const r = j(e) ? void 0 : e._$litDirective$;
  return i?.constructor !== r && (i?._$AO?.(!1), r === void 0 ? i = void 0 : (i = new r(t), i._$AT(t, n, s)), s !== void 0 ? (n._$Co ??= [])[s] = i : n._$Cl = i), i !== void 0 && (e = P(t, i._$AS(t, e.values), i, s)), e;
}
class It {
  constructor(e, n) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = n;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: n }, parts: s } = this._$AD, i = (e?.creationScope ?? O).importNode(n, !0);
    C.currentNode = i;
    let r = C.nextNode(), o = 0, d = 0, a = s[0];
    for (; a !== void 0; ) {
      if (o === a.index) {
        let u;
        a.type === 2 ? u = new q(r, r.nextSibling, this, e) : a.type === 1 ? u = new a.ctor(r, a.name, a.strings, this, e) : a.type === 6 && (u = new Bt(r, this, e)), this._$AV.push(u), a = s[++d];
      }
      o !== a?.index && (r = C.nextNode(), o++);
    }
    return C.currentNode = O, i;
  }
  p(e) {
    let n = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(e, s, n), n += s.strings.length - 2) : s._$AI(e[n])), n++;
  }
}
class q {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, n, s, i) {
    this.type = 2, this._$AH = f, this._$AN = void 0, this._$AA = e, this._$AB = n, this._$AM = s, this.options = i, this._$Cv = i?.isConnected ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const n = this._$AM;
    return n !== void 0 && e?.nodeType === 11 && (e = n.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, n = this) {
    e = P(this, e, n), j(e) ? e === f || e == null || e === "" ? (this._$AH !== f && this._$AR(), this._$AH = f) : e !== this._$AH && e !== F && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Tt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== f && j(this._$AH) ? this._$AA.nextSibling.data = e : this.T(O.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: n, _$litType$: s } = e, i = typeof s == "number" ? this._$AC(e) : (s.el === void 0 && (s.el = W.createElement(rt(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === i) this._$AH.p(n);
    else {
      const r = new It(i, this), o = r.u(this.options);
      r.p(n), this.T(o), this._$AH = r;
    }
  }
  _$AC(e) {
    let n = Ue.get(e.strings);
    return n === void 0 && Ue.set(e.strings, n = new W(e)), n;
  }
  k(e) {
    ke(this._$AH) || (this._$AH = [], this._$AR());
    const n = this._$AH;
    let s, i = 0;
    for (const r of e) i === n.length ? n.push(s = new q(this.O(U()), this.O(U()), this, this.options)) : s = n[i], s._$AI(r), i++;
    i < n.length && (this._$AR(s && s._$AB.nextSibling, i), n.length = i);
  }
  _$AR(e = this._$AA.nextSibling, n) {
    for (this._$AP?.(!1, !0, n); e !== this._$AB; ) {
      const s = Re(e).nextSibling;
      Re(e).remove(), e = s;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class ae {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, n, s, i, r) {
    this.type = 1, this._$AH = f, this._$AN = void 0, this.element = e, this.name = n, this._$AM = i, this.options = r, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = f;
  }
  _$AI(e, n = this, s, i) {
    const r = this.strings;
    let o = !1;
    if (r === void 0) e = P(this, e, n, 0), o = !j(e) || e !== this._$AH && e !== F, o && (this._$AH = e);
    else {
      const d = e;
      let a, u;
      for (e = r[0], a = 0; a < r.length - 1; a++) u = P(this, d[s + a], n, a), u === F && (u = this._$AH[a]), o ||= !j(u) || u !== this._$AH[a], u === f ? e = f : e !== f && (e += (u ?? "") + r[a + 1]), this._$AH[a] = u;
    }
    o && !i && this.j(e);
  }
  j(e) {
    e === f ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Dt extends ae {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === f ? void 0 : e;
  }
}
class Ft extends ae {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== f);
  }
}
class Pt extends ae {
  constructor(e, n, s, i, r) {
    super(e, n, s, i, r), this.type = 5;
  }
  _$AI(e, n = this) {
    if ((e = P(this, e, n, 0) ?? f) === F) return;
    const s = this._$AH, i = e === f && s !== f || e.capture !== s.capture || e.once !== s.once || e.passive !== s.passive, r = e !== f && (s === f || i);
    i && this.element.removeEventListener(this.name, this, s), r && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Bt {
  constructor(e, n, s) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = n, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    P(this, e);
  }
}
const Rt = Se.litHtmlPolyfillSupport;
Rt?.(W, q), (Se.litHtmlVersions ??= []).push("3.3.3");
const Nt = (t, e, n) => {
  const s = n?.renderBefore ?? e;
  let i = s._$litPart$;
  if (i === void 0) {
    const r = n?.renderBefore ?? null;
    s._$litPart$ = i = new q(e.insertBefore(U(), r), r, void 0, n ?? {});
  }
  return i._$AI(t), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ze = globalThis;
class H extends D {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const n = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Nt(n, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return F;
  }
}
H._$litElement$ = !0, H.finalized = !0, ze.litElementHydrateSupport?.({ LitElement: H });
const Ht = ze.litElementPolyfillSupport;
Ht?.({ LitElement: H });
(ze.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Mt = (t) => (e, n) => {
  n !== void 0 ? n.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Kt = { attribute: !0, type: String, converter: te, reflect: !1, hasChanged: xe }, Lt = (t = Kt, e, n) => {
  const { kind: s, metadata: i } = n;
  let r = globalThis.litPropertyMetadata.get(i);
  if (r === void 0 && globalThis.litPropertyMetadata.set(i, r = /* @__PURE__ */ new Map()), s === "setter" && ((t = Object.create(t)).wrapped = !0), r.set(n.name, t), s === "accessor") {
    const { name: o } = n;
    return { set(d) {
      const a = e.get.call(this);
      e.set.call(this, d), this.requestUpdate(o, a, t, !0, d);
    }, init(d) {
      return d !== void 0 && this.C(o, void 0, t, d), d;
    } };
  }
  if (s === "setter") {
    const { name: o } = n;
    return function(d) {
      const a = this[o];
      e.call(this, d), this.requestUpdate(o, a, t, !0, d);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function Ut(t) {
  return (e, n) => typeof n == "object" ? Lt(t, e, n) : ((s, i, r) => {
    const o = i.hasOwnProperty(r);
    return i.constructor.createProperty(r, s), o ? Object.getOwnPropertyDescriptor(i, r) : void 0;
  })(t, e, n);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function w(t) {
  return Ut({ ...t, state: !0, attribute: !1 });
}
const jt = { 1: "indoor", 2: "outdoor", 3: "gateway", 4: "door" };
function Wt(t, e) {
  if (e) return t >> 16 === 0 ? t >> 8 & 255 : null;
  if (t > 65535) return null;
  const n = t >> 8;
  return (n & 15) === 0 ? n >> 4 : null;
}
function Ee(t, e) {
  const n = Wt(t, e);
  return n !== null && jt[n] || "unknown";
}
const le = (t, e) => Ee(t, e) === "indoor", qt = (t, e) => Ee(t, e) === "outdoor";
function v(t, e) {
  return "0x" + t.toString(16).padStart(e ? 6 : 4, "0");
}
function ue(t, e) {
  return t.toString(16).toUpperCase().padStart(e ? 6 : 4, "0");
}
function M(t) {
  return "0x" + t.toString(16).padStart(2, "0");
}
function K(t) {
  return t.map((e) => e.toString(16).toUpperCase().padStart(2, "0")).join(" ");
}
const Gt = {
  indoor: "Innenstation",
  outdoor: "Außenstation",
  gateway: "Gateway",
  door: "Türsteuergerät",
  unknown: "Gerät"
};
function A(t, e) {
  const n = Ee(t, e), s = Gt[n], i = v(t, e);
  return n === "indoor" || n === "outdoor" ? `${s} #${t & 255} (${i})` : `${s} (${i})`;
}
function Q(t) {
  const { x10: e, x1: n } = t;
  if (!(e === void 0 || n === void 0) && !(!Number.isInteger(e) || !Number.isInteger(n) || e < 0 || e > 9 || n < 0 || n > 9))
    return e * 10 + n;
}
function se(t, e) {
  return (e ? 256 : 4096) | t & 255;
}
function Vt(t, e) {
  return e ? [t >> 16 & 255, t >> 8 & 255, t & 255] : [t >> 8 & 255, t & 255];
}
function Zt(t, e) {
  e: for (let n = 0; n + e.length <= t.length; n++) {
    for (let s = 0; s < e.length; s++) if (t[n + s] !== e[s]) continue e;
    return !0;
  }
  return !1;
}
function ot(t, e) {
  return Zt(t.data, Vt(e, t.threeByte));
}
function Te(t, e) {
  return t.src === e || t.dst === e || ot(t, e);
}
const Yt = /\[\s*([0-9a-f]{4}|[0-9a-f]{6})\s*(»|Â»|>>|>)\s*([0-9a-f]{4}|[0-9a-f]{6})\s*\]/i, Jt = /^\s*,?\s*type\s*[:=]?\s*(?:0x)?([0-9a-f]{1,2})(?![0-9a-f])/i, Xt = /^\s*,?\s*data\s*[:=]?\s*(.*?)\s*$/i, Qt = /((?:[0-9a-f]{2}[.:\s]){2,}[0-9a-f]{2})\s*(?:\(\s*(\d+)\s*\))?\s*$/i;
function en(t) {
  const e = t.trim();
  if (e === "") return [];
  const n = e.split(/[\s.,:;-]+/).filter((i) => i !== ""), s = [];
  for (let i of n) {
    if (i = i.replace(/^0x/i, ""), !/^[0-9a-f]+$/i.test(i)) return null;
    if (i.length <= 2)
      s.push(parseInt(i, 16));
    else if (i.length % 2 === 0)
      for (let r = 0; r < i.length; r += 2) s.push(parseInt(i.slice(r, r + 2), 16));
    else
      return null;
  }
  return s;
}
function at(t) {
  const e = (p) => ({ ok: !1, line: t, reason: p });
  if (typeof t != "string") return e("not a string");
  const n = Yt.exec(t);
  if (!n) return e("no address block");
  const [, s, i, r] = n, o = t.slice(n.index + n[0].length), d = Jt.exec(o);
  if (!d) return e("no message type");
  const a = o.slice(d[0].length);
  let u = [];
  if (a.trim() !== "") {
    const p = Xt.exec(a);
    if (!p) return e("unexpected text after type");
    const m = en(p[1]);
    if (!m) return e("invalid data bytes");
    u = m;
  }
  const c = {
    src: parseInt(s, 16),
    dst: parseInt(r, 16),
    type: parseInt(d[1], 16),
    data: u,
    threeByte: s.length === 6 || r.length === 6,
    retransmission: i !== ">"
  }, h = Qt.exec(t.slice(0, n.index));
  return h && (c.raw = h[1].toUpperCase().replace(/[:\s]/g, "."), h[2] !== void 0 && (c.rawLength = parseInt(h[2], 10))), { ok: !0, frame: c };
}
const dt = ["ring_gate", "ring_house", "ring_apartment"], ct = ["open_gate", "open_house"], je = 1, tn = 10, We = 17, lt = 13, ut = 14, me = 128, qe = [1, 129, 10, 17, 145], k = {
  baseline: "Baseline",
  ring_gate: "Klingeln Tor",
  ring_house: "Klingeln Haustür",
  ring_apartment: "Klingeln Wohnungstür",
  open_gate: "Öffnen Tor",
  open_house: "Öffnen Haustür"
}, fe = (t) => t.toString(16).toUpperCase().padStart(2, "0"), ee = (t) => `${t.src}|${t.dst}|${t.type}|${t.data.join(",")}`;
function nn(t) {
  const e = (n) => n === void 0 ? "*" : n.toString(16);
  return `${fe(t.type)}|${e(t.src)}|${e(t.dst)}|${t.data ? t.data.map(fe).join("") : "*"}`;
}
function ie(t, e) {
  let n = null;
  for (const s of t)
    (!n || s[1] > n[1] || s[1] === n[1] && e && e(s[0], n[0]) < 0) && (n = s);
  return n;
}
function L(t, e, n = 1) {
  t.set(e, (t.get(e) ?? 0) + n);
}
function sn(t, e) {
  let n = 0;
  const s = {};
  for (const [i, r] of Object.entries(t.steps))
    s[i] = r.captures.map(
      (o) => o.lines.flatMap((d) => {
        n++;
        const a = at(d.line);
        return a.ok ? [a.frame] : (e.push(d.line), []);
      })
    );
  return { steps: s, total: n };
}
function rn(t, e) {
  const n = /* @__PURE__ */ new Map();
  for (const d of ct)
    for (const a of t[d])
      for (const u of a)
        (u.type === lt || u.type === ut) && le(u.src, u.threeByte) && L(n, u.src);
  const s = (d, a) => d === e ? -1 : a === e ? 1 : d - a, i = ie(n, s);
  if (i) return { address: i[0], method: "open", count: i[1] };
  const r = /* @__PURE__ */ new Map();
  for (const d of Object.values(t))
    for (const a of d)
      for (const u of a)
        le(u.src, u.threeByte) && L(r, u.src), le(u.dst, u.threeByte) && u.dst !== u.src && L(r, u.dst);
  const o = ie(r, s);
  return o ? { address: o[0], method: "frequency", count: o[1] } : null;
}
function on(t, e, n) {
  const s = (i) => qt(i, e.threeByte) ? i : void 0;
  return t === "ring_apartment" ? e.type === We && e.src === n ? { type: e.type, src: e.src } : e.type === (We | me) && e.dst === n ? { type: e.type, dst: e.dst } : null : e.type === je && e.dst === n ? { type: e.type, src: e.src, dst: e.dst, outdoor: s(e.src) } : e.type === (je | me) && e.src === n ? { type: e.type, src: e.src, dst: e.dst, outdoor: s(e.dst) } : e.type === tn && ot(e, n) ? { type: e.type, src: e.src, dst: e.dst, data: [...e.data], outdoor: s(e.src) } : null;
}
function an(t, e) {
  return e.score - t.score || qe.indexOf(t.type) - qe.indexOf(e.type) || (t.key < e.key ? -1 : t.key > e.key ? 1 : 0);
}
function ht(t, e) {
  const n = t.session.steps[e].skipped;
  t.warnings.push({
    code: n ? "step_skipped" : "step_missing",
    severity: "info",
    step: e,
    message: `${k[e]}: ${n ? "übersprungen" : "keine Aufnahme vorhanden"}.`
  });
}
function dn(t, e) {
  const n = t.steps[e], s = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  n.forEach((d, a) => {
    for (const u of d) {
      if (t.baseline.has(ee(u))) {
        t.stats.baselineFiltered++;
        continue;
      }
      if (!Te(u, t.indoor)) {
        t.stats.neighbourFiltered++;
        continue;
      }
      const c = on(e, u, t.indoor);
      if (!c) {
        i.has(ee(u)) || i.set(ee(u), u);
        continue;
      }
      const h = nn(c), p = s.get(h) ?? { match: c, in: /* @__PURE__ */ new Set() };
      p.in.add(a), s.set(h, p);
    }
  });
  const r = [...s].map(([d, { match: a, in: u }]) => ({
    key: d,
    ...a,
    occurrences: u.size,
    score: u.size / n.length,
    reliable: u.size === n.length
  }));
  r.sort(an);
  let o = r.filter((d) => d.reliable);
  if (n.length === 0)
    ht(t, e);
  else if (r.length === 0)
    t.warnings.push({
      code: "no_ring_candidates",
      severity: "warning",
      step: e,
      message: `${k[e]}: keine passenden Frames gefunden (erwartet: ${e === "ring_apartment" ? "Typ 11/91" : "Typ 01/81/0A"} mit Bezug zu ${v(t.indoor, t.threeByte)}).`
    });
  else {
    if (o.length === 0) {
      const d = r[0].score;
      o = r.filter((a) => a.score === d), t.warnings.push({
        code: "unstable_candidates",
        severity: "warning",
        step: e,
        message: `${k[e]}: kein Kandidat kam in allen ${n.length} Aufnahmen vor; verwende die besten (${Math.round(d * 100)} %).`
      });
    }
    n.length === 1 && t.warnings.push({
      code: "single_capture",
      severity: "info",
      step: e,
      message: `${k[e]}: nur eine Aufnahme – Stabilität nicht prüfbar. 2–3 Wiederholungen empfohlen.`
    });
  }
  return {
    step: e,
    captures: n.length,
    candidates: r,
    selected: o,
    outdoorAddress: ge(o),
    otherFrames: [...i.values()]
  };
}
function ge(t) {
  const e = /* @__PURE__ */ new Map();
  for (const n of t) n.outdoor !== void 0 && L(e, n.outdoor);
  return ie(e, (n, s) => n - s)?.[0];
}
function cn(t, e, n) {
  if (e.selected.length === 0 || n.selected.length === 0) return;
  const s = new Set(n.selected.map((a) => a.key)), i = new Set(e.selected.filter((a) => s.has(a.key)).map((a) => a.key)), r = e.selected.filter((a) => !i.has(a.key)), o = n.selected.filter((a) => !i.has(a.key));
  if (r.length === 0 || o.length === 0 || e.outdoorAddress !== void 0 && e.outdoorAddress === n.outdoorAddress) {
    t.warnings.push({
      code: "gate_house_indistinguishable",
      severity: "warning",
      message: "Tor und Haustür nicht unterscheidbar: beide Klingeln erzeugen dieselben Frames" + (e.outdoorAddress !== void 0 && e.outdoorAddress === n.outdoorAddress ? ` (Außenstation ${v(e.outdoorAddress, t.threeByte)})` : "") + ". Beide Klingel-Sensoren würden gemeinsam auslösen."
    });
    return;
  }
  i.size > 0 && (e.selected = r, n.selected = o, e.outdoorAddress = ge(r), n.outdoorAddress = ge(o), t.warnings.push({
    code: "gate_house_shared_removed",
    severity: "info",
    message: `${i.size} Kandidat(en) kamen bei Tor und Haustür vor und wurden nicht verwendet.`
  }));
}
function ln(t, e) {
  const n = t.steps[e];
  if (n.length === 0)
    return ht(t, e), null;
  const s = /* @__PURE__ */ new Map();
  n.forEach((p, m) => {
    for (const g of p) {
      if (g.src !== t.indoor || g.type !== lt && g.type !== ut) continue;
      const _ = `${g.dst}|${g.type}|${g.data.join(",")}`, x = s.get(_) ?? { frame: g, in: /* @__PURE__ */ new Set() };
      x.in.add(m), s.set(_, x);
    }
  });
  let i;
  for (const p of s.values()) (!i || p.in.size > i.in.size) && (i = p);
  if (!i)
    return t.warnings.push({
      code: "no_open_frame",
      severity: "warning",
      step: e,
      message: `${k[e]}: kein 0D/0E-Frame von ${v(t.indoor, t.threeByte)} gefunden.`
    }), null;
  s.size > 1 && t.warnings.push({
    code: "multiple_open_frames",
    severity: "info",
    step: e,
    message: `${k[e]}: ${s.size} verschiedene Öffnen-Frames gefunden, verwende den häufigsten.`
  }), i.in.size < n.length && t.warnings.push({
    code: "unstable_open",
    severity: "warning",
    step: e,
    message: `${k[e]}: Öffnen-Frame nur in ${i.in.size} von ${n.length} Aufnahmen.`
  });
  const { frame: r } = i, o = {
    step: e,
    captures: n.length,
    destination: r.dst,
    messageType: r.type,
    data: [...r.data],
    occurrences: i.in.size,
    score: i.in.size / n.length
  }, d = r.type | me, a = [...i.in].map((p) => n[p].filter((m) => m.type === d)), u = a.some((p) => p.some((m) => m.dst === t.indoor)), c = /* @__PURE__ */ new Map();
  for (const p of a) {
    const m = new Set(p.filter((g) => !u || g.dst === t.indoor).map((g) => g.src));
    for (const g of m) L(c, g);
  }
  const h = c.has(r.dst) ? [r.dst, c.get(r.dst)] : ie(c, (p, m) => p - m);
  return h ? o.confirmation = {
    source: h[0],
    messageType: d,
    occurrences: h[1],
    ...u ? { destination: t.indoor } : {}
  } : t.warnings.push({
    code: "no_confirmation",
    severity: "info",
    step: e,
    message: `${k[e]}: keine Bestätigung (${fe(d)}) gefunden – das Schloss meldet dann keinen Status.`
  }), o;
}
function he(t) {
  return { step: t, captures: 0, candidates: [], selected: [], otherFrames: [] };
}
function un(t, e = {}) {
  const n = [], { steps: s, total: i } = sn(t, n), r = [], o = {
    totalLines: i,
    parsedFrames: i - n.length,
    unparsedLines: n,
    baselineFiltered: 0,
    neighbourFiltered: 0
  }, d = Object.values(s).flat(2), a = e.expectedApartment ?? Q(t.dials), u = d.filter(($) => $.threeByte).length * 2 > d.length, c = a !== void 0 ? se(a, u) : void 0;
  n.length > 0 && r.push({
    code: "unparsed_lines",
    severity: "info",
    message: `${n.length} Zeile(n) konnten nicht als Frame gelesen werden.`
  });
  const h = e.indoorAddress ?? t.indoorAddress, p = h !== void 0 ? { address: h, method: "manual", count: 0 } : rn(s, c), m = {
    indoor: null,
    threeByte: u,
    rings: {
      ring_gate: he("ring_gate"),
      ring_house: he("ring_house"),
      ring_apartment: he("ring_apartment")
    },
    opens: { open_gate: null, open_house: null },
    warnings: r,
    stats: o
  };
  if (!p)
    return r.push({
      code: "no_indoor",
      severity: "error",
      message: "Keine Innenstationsadresse (10XX / 0001XX) gefunden. Wurden Frames aufgenommen?"
    }), m;
  const g = d.filter(($) => Te($, p.address)), _ = g.length > 0 ? g.some(($) => $.threeByte) : p.address > 65535 || u;
  p.method === "manual" && g.length === 0 && d.length > 0 && r.push({
    code: "manual_indoor_unseen",
    severity: "warning",
    message: `Die eingestellte Innenstation ${v(p.address, _)} kommt in keinem aufgenommenen Frame vor.`
  }), g.some(($) => $.threeByte !== _) && r.push({
    code: "mixed_address_length",
    severity: "warning",
    message: "Gemischte 2- und 3-Byte-Adressen gefunden – bitte Aufnahmen prüfen."
  }), m.threeByte = _;
  const x = { ...p };
  a !== void 0 && (x.expected = se(a, _), x.matchesExpected = x.expected === p.address, x.matchesExpected || r.push({
    code: "indoor_mismatch",
    severity: "warning",
    message: `Ermittelte Innenstation ${v(p.address, _)} weicht von der erwarteten Adresse ${v(x.expected, _)} (Wohnung ${a}) ab. Drehregler prüfen.`
  })), p.method === "frequency" && r.push({
    code: "indoor_by_frequency",
    severity: "info",
    message: `Innenstation ${A(p.address, _)} nur anhand der Häufigkeit bestimmt (kein Öffnen-Frame aufgenommen).`
  }), m.indoor = x;
  const de = {
    session: t,
    steps: s,
    indoor: p.address,
    threeByte: _,
    baseline: new Set(s.baseline.flat().map(ee)),
    warnings: r,
    stats: o
  };
  s.baseline.length === 0 && r.push({
    code: "no_baseline",
    severity: "info",
    step: "baseline",
    message: "Keine Baseline aufgenommen – Frames einer normalen Sprechverbindung können nicht ausgefiltert werden."
  });
  for (const $ of dt) m.rings[$] = dn(de, $);
  cn(de, m.rings.ring_gate, m.rings.ring_house);
  for (const $ of ct) m.opens[$] = ln(de, $);
  const { open_gate: G, open_house: V } = m.opens;
  return G && V && G.destination === V.destination && G.messageType === V.messageType && K(G.data) === K(V.data) && r.push({
    code: "gate_house_same_open",
    severity: "warning",
    message: "Öffnen Tor und Öffnen Haustür senden denselben Frame – beide Schlösser würden dieselbe Tür öffnen."
  }), m;
}
const hn = /* @__PURE__ */ new Set(["", "unknown", "unavailable"]);
function pn(t, e) {
  if (t.event_type !== "state_changed" || t.data?.entity_id !== e) return null;
  const n = t.data.new_state?.state;
  return typeof n != "string" || hn.has(n.trim()) ? null : { time: t.time_fired || (/* @__PURE__ */ new Date()).toISOString(), line: n };
}
function Z(t) {
  if (typeof t == "number")
    return Number.isInteger(t) && t > 0 && t <= 16777215 ? t : void 0;
  if (typeof t != "string") return;
  const e = t.trim().replace(/^0x/i, "");
  if (/^([0-9a-f]{4}|[0-9a-f]{6})$/i.test(e))
    return parseInt(e, 16);
}
function mn(t, e, n) {
  return e ? { phase: "armed", lines: [] } : { phase: "recording", startedAt: new Date(n).toISOString(), endsAt: n + t * 1e3, lines: [] };
}
function fn(t, e, n, s) {
  return t.phase === "armed" ? {
    phase: "recording",
    startedAt: new Date(s).toISOString(),
    endsAt: s + n * 1e3,
    lines: [e]
  } : { ...t, lines: [...t.lines, e] };
}
function gn(t, e) {
  return t.phase === "recording" && t.endsAt !== void 0 && e >= t.endsAt;
}
const pt = [
  "baseline",
  "ring_gate",
  "ring_house",
  "ring_apartment",
  "open_gate",
  "open_house"
], ve = "abb-welcome-wizard-session";
function mt() {
  const t = {};
  for (const e of pt) t[e] = { skipped: !1, captures: [] };
  return t;
}
function Ge(t, e = /* @__PURE__ */ new Date()) {
  const n = e.toISOString();
  return {
    format: ve,
    version: 1,
    entity: t,
    createdAt: n,
    updatedAt: n,
    dials: {},
    steps: mt()
  };
}
function Ce(t, e) {
  return { ...t, updatedAt: e.toISOString() };
}
function Oe(t, e, n, s) {
  return Ce({ ...t, steps: { ...t.steps, [e]: n(t.steps[e]) } }, s);
}
function vn(t, e, n, s = /* @__PURE__ */ new Date()) {
  return Oe(t, e, (i) => ({ skipped: !1, captures: [...i.captures, n] }), s);
}
function Ve(t, e, n, s = /* @__PURE__ */ new Date()) {
  return Oe(
    t,
    e,
    (i) => ({ ...i, captures: i.captures.filter((r, o) => o !== n) }),
    s
  );
}
function bn(t, e, n, s = /* @__PURE__ */ new Date()) {
  return Oe(t, e, (i) => ({ ...i, skipped: n }), s);
}
function Ze(t, e, n = /* @__PURE__ */ new Date()) {
  const s = Ce({ ...t }, n);
  return e === void 0 ? delete s.indoorAddress : s.indoorAddress = e, s;
}
function $n(t, e, n = /* @__PURE__ */ new Date()) {
  return Ce({ ...t, dials: { ...e } }, n);
}
function yn(t) {
  let e;
  for (const n of ["ring_gate", "ring_house", "ring_apartment", "open_gate"])
    for (const s of t.steps[n].captures) {
      const i = Date.parse(s.endedAt);
      !Number.isNaN(i) && (e === void 0 || i > e) && (e = i);
    }
  return e === void 0 ? void 0 : new Date(e);
}
function ft(t) {
  return JSON.stringify(t, null, 2);
}
const I = (t) => typeof t == "object" && t !== null, Y = (t) => typeof t == "number" && Number.isInteger(t) ? t : void 0;
function gt(t) {
  let e;
  try {
    e = JSON.parse(t);
  } catch {
    throw new Error("Datei ist kein gültiges JSON.");
  }
  if (!I(e) || e.format !== ve)
    throw new Error("Datei ist keine ABB-Welcome-Wizard-Sitzung.");
  if (e.version !== 1) throw new Error(`Nicht unterstützte Sitzungsversion: ${String(e.version)}.`);
  if (typeof e.entity != "string") throw new Error("Sitzung ohne Entität.");
  const n = mt(), s = I(e.steps) ? e.steps : {};
  for (const r of pt) {
    const o = s[r];
    if (!I(o)) continue;
    const d = Array.isArray(o.captures) ? o.captures : [];
    n[r] = {
      skipped: o.skipped === !0,
      captures: d.filter(I).map((a) => ({
        startedAt: String(a.startedAt ?? ""),
        endedAt: String(a.endedAt ?? ""),
        lines: (Array.isArray(a.lines) ? a.lines : []).filter(I).filter((u) => typeof u.line == "string").map((u) => ({ time: String(u.time ?? ""), line: u.line }))
      }))
    };
  }
  const i = I(e.dials) ? e.dials : {};
  return {
    format: ve,
    version: 1,
    entity: e.entity,
    createdAt: String(e.createdAt ?? ""),
    updatedAt: String(e.updatedAt ?? ""),
    dials: { station: Y(i.station), x10: Y(i.x10), x1: Y(i.x1) },
    ...Y(e.indoorAddress) !== void 0 ? { indoorAddress: e.indoorAddress } : {},
    steps: n
  };
}
const E = [
  {
    id: "baseline",
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
    waitForFrame: !1
  },
  {
    id: "ring_gate",
    title: "Klingeln am Tor",
    short: "Klingel Tor",
    icon: "mdi:gate",
    todo: [
      "Auf „Aufnahme starten“ tippen – die Aufnahme beginnt erst, wenn der erste Frame ankommt.",
      "Zum Tor gehen und einmal klingeln. Nicht abheben, nicht öffnen.",
      "Für eine zuverlässige Erkennung 2–3 Mal wiederholen (jeweils neue Aufnahme)."
    ],
    why: "Frames, die in jeder Wiederholung auftauchen, sind zuverlässige Kandidaten für den Klingel-Sensor. Über die Adresse der Außenstation werden Tor und Haustür unterschieden.",
    repetitions: 3,
    waitForFrame: !0
  },
  {
    id: "ring_house",
    title: "Klingeln an der Haustür",
    short: "Klingel Haustür",
    icon: "mdi:door",
    todo: [
      "Auf „Aufnahme starten“ tippen.",
      "An der Haustür (unten) einmal klingeln. Nicht abheben, nicht öffnen.",
      "2–3 Mal wiederholen."
    ],
    why: "Die Haustür hat in der Regel eine eigene Außenstation (z. B. 0x2002). Nur so lassen sich Tor und Haustür als getrennte Sensoren abbilden.",
    repetitions: 3,
    waitForFrame: !0
  },
  {
    id: "ring_apartment",
    title: "Klingeln an der Wohnungstür",
    short: "Klingel Wohnung",
    icon: "mdi:door-closed",
    todo: [
      "Auf „Aufnahme starten“ tippen.",
      "Den Klingeltaster an der Wohnungstür (Etagenruf) drücken.",
      "2–3 Mal wiederholen."
    ],
    why: "Der Etagenruf ist direkt an die Innenstation angeschlossen. Sie meldet ihn mit Typ 11 auf dem Bus, die Antwort hat Typ 91.",
    repetitions: 3,
    waitForFrame: !0
  },
  {
    id: "open_gate",
    title: "Tor öffnen (Schlüssel-Taste nach Klingeln)",
    short: "Öffnen Tor",
    icon: "mdi:key-variant",
    todo: [
      "Am Tor klingeln (lassen).",
      "Sofort danach auf „Aufnahme starten“ tippen.",
      "An der Innenstation die Schlüssel-Taste drücken – das Tor wird dabei wirklich geöffnet."
    ],
    why: "Nach einem Klingeln öffnet die Schlüssel-Taste die rufende Außenstation. Gesucht wird der Frame vom Typ 0D/0E von deiner Innenstation und die Bestätigung 8D/8E.",
    repetitions: 2,
    waitForFrame: !1
  },
  {
    id: "open_house",
    title: "Haustür öffnen (Schlüssel-Taste ohne Klingeln)",
    short: "Öffnen Haustür",
    icon: "mdi:key-outline",
    todo: [
      "Einige Minuten nach dem letzten Klingeln warten.",
      "Auf „Aufnahme starten“ tippen.",
      "An der Innenstation die Schlüssel-Taste drücken – die Haustür wird dabei wirklich geöffnet."
    ],
    why: "Ohne vorheriges Klingeln öffnet die Schlüssel-Taste die Standard-Außenstation. Liegt das letzte Klingeln zu kurz zurück, würde sie noch das Tor öffnen.",
    repetitions: 2,
    waitForFrame: !1
  }
], Ye = 3, Ie = (t) => `abb-welcome-wizard-card:session:${t}`;
function wn(t) {
  try {
    const e = window.localStorage.getItem(Ie(t));
    return e ? gt(e) : void 0;
  } catch {
    return;
  }
}
function _n(t) {
  try {
    window.localStorage.setItem(Ie(t.entity), ft(t));
  } catch {
  }
}
function An(t) {
  try {
    window.localStorage.removeItem(Ie(t));
  } catch {
  }
}
function Je(t, e, n) {
  const s = URL.createObjectURL(new Blob([e], { type: n })), i = document.createElement("a");
  i.href = s, i.download = t, document.body.appendChild(i), i.click(), i.remove(), setTimeout(() => URL.revokeObjectURL(s), 1e3);
}
async function xn(t) {
  try {
    return await navigator.clipboard.writeText(t), !0;
  } catch {
    const e = document.createElement("textarea");
    e.value = t, e.style.position = "fixed", e.style.opacity = "0", document.body.appendChild(e), e.select();
    let n = !1;
    try {
      n = document.execCommand("copy");
    } catch {
      n = !1;
    }
    return e.remove(), n;
  }
}
const Sn = bt`
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
`, be = [
  { step: "ring_gate", id: "klingel_tor", name: "Klingel Tor" },
  { step: "ring_house", id: "klingel_haustuer", name: "Klingel Haustür" },
  { step: "ring_apartment", id: "klingel_wohnung", name: "Klingel Wohnungstür" }
], $e = [
  { step: "open_gate", id: "tor", name: "Tor", icon: "mdi:gate" },
  { step: "open_house", id: "haustuer", name: "Haustür", icon: "mdi:door" }
], ye = "TÜRCODE – nicht öffentlich teilen!";
class kn {
  constructor() {
    this.lines = [];
  }
  line(e, n = "") {
    return this.lines.push(n === "" ? "" : " ".repeat(e) + n), this;
  }
  comment(e, n) {
    return this.line(e, `# ${n}`.trimEnd());
  }
  toString() {
    return this.lines.join(`
`) + `
`;
  }
}
function Xe(t) {
  return `"${t.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
function we(t) {
  return t.toString(16).toUpperCase().padStart(2, "0");
}
function zn(t, e) {
  const n = [`(x.get_message_type() == ${M(t.type)})`];
  t.src !== void 0 && n.push(`(x.get_source_address() == ${v(t.src, e)})`), t.dst !== void 0 && n.push(`(x.get_destination_address() == ${v(t.dst, e)})`);
  let s = "";
  return t.data !== void 0 && (s = `std::vector<uint8_t> d = {${t.data.map(M).join(", ")}}; `, n.push("(x.get_data() == d)")), `'${s}return ${n.join(" && ")};'`;
}
function En(t, e, n) {
  let s = `Typ ${we(t.type)}`;
  return t.src !== void 0 && t.dst !== void 0 ? s += `: ${A(t.src, n)} > ${A(t.dst, n)}` : t.src !== void 0 ? s += `, Quelle: ${A(t.src, n)}` : t.dst !== void 0 && (s += `, Ziel: ${A(t.dst, n)}`), t.data !== void 0 && (s += `, Data: ${t.data.map((i) => we(i)).join(" ")}`), `${s} (${t.occurrences}/${e} Aufnahmen)`;
}
function T(t, e, n, s, i) {
  t.line(e, `- ${n}.template.publish:`), t.line(e + 4, `id: ${s}`), t.line(e + 4, `state: ${i}`);
}
function Qe(t, e, n, s) {
  T(t, e, "lock", n, "UNLOCKING"), t.line(e, `- delay: ${s}s`), T(t, e, "lock", n, "LOCKED");
}
function Tn(t, e, n) {
  const { indoor: s, threeByte: i } = e;
  if (t.comment(0, "ABB-Welcome Wizard – generierte ESPHome-Konfiguration"), s) {
    const o = n.apartment !== void 0 ? `, Wohnung ${n.apartment}` : "";
    t.comment(0, `Innenstation: ${v(s.address, i)}${o}`);
  }
  t.comment(0, `Adresslänge: ${i ? "3 Byte (three_byte_address: true)" : "2 Byte"}`), t.comment(0, ""), t.comment(0, "Diese Abschnitte ersetzen die gleichnamigen Abschnitte der Demo-Firmware:"), t.comment(0, "esphome.on_boot, remote_receiver.on_abbwelcome, binary_sensor und lock."), t.comment(0, "Alle übrigen Einstellungen (wifi, api, ota, remote_transmitter, Pins von"), t.comment(0, "remote_receiver, text_sensor ...) unverändert lassen."), t.comment(0, ""), t.comment(0, "Voraussetzung (in der Demo-Firmware bereits gesetzt):"), t.comment(0, "esp32:"), t.comment(0, "  framework:"), t.comment(0, "    type: esp-idf"), (e.opens.open_gate || e.opens.open_house) && (t.comment(0, ""), t.comment(
    0,
    n.maskDoorCode ? "Türcodes sind durch Platzhalter ersetzt – vor dem Flashen die echten Werte eintragen!" : `ACHTUNG: "data" der Öffnen-Befehle ist euer ${ye}`
  ));
  const r = e.warnings.filter((o) => o.severity !== "info");
  if (r.length > 0) {
    t.comment(0, "");
    for (const o of r) t.comment(0, `${o.severity === "error" ? "FEHLER" : "Warnung"}: ${o.message}`);
  }
  t.line(0);
}
function Cn(t, e = {}) {
  const n = new kn(), { indoor: s, threeByte: i } = t, r = e.debugSensorId === void 0 ? "doorbell_intercom" : e.debugSensorId, o = e.unlockSeconds ?? 3;
  if (Tn(n, t, e), !s)
    return n.comment(0, "Keine Innenstationsadresse ermittelt – es kann keine Konfiguration erzeugt werden."), n.toString();
  const d = be.filter((c) => t.rings[c.step].selected.length > 0), a = $e.map((c) => ({ ...c, open: t.opens[c.step] })).filter(
    (c) => c.open !== null
  ), u = [
    ...be.filter((c) => !d.includes(c)).map((c) => c.name),
    ...$e.filter((c) => !t.opens[c.step]).map((c) => `Öffnen ${c.name}`)
  ];
  if (d.length + a.length > 0) {
    n.line(0, "esphome:"), n.line(2, "on_boot:");
    for (const c of d) T(n, 4, "binary_sensor", c.id, "OFF");
    for (const c of a) T(n, 4, "lock", c.id, "LOCKED");
    n.line(0);
  }
  n.line(0, "remote_receiver:"), n.comment(2, "pin, dump, filter, tolerance, idle, buffer_size ... aus der bestehenden Konfiguration"), n.line(2, "on_abbwelcome:"), n.line(4, "then:"), r && (n.comment(6, "Debug-Textsensor (id ggf. an eure Firmware anpassen)"), n.line(6, `- lambda: 'char buf[192]; x.format_to(buf, 192); id(${r}).publish_state(buf);'`));
  for (const c of d) {
    const h = t.rings[c.step], p = h.outdoorAddress !== void 0 ? ` – ${A(h.outdoorAddress, i)}` : "";
    n.comment(6, `${c.name}${p}`), n.line(6, "- if:"), n.line(10, "condition:"), n.line(12, "or:");
    for (const m of h.selected)
      n.comment(14, En(m, h.captures, i)), n.line(14, `- lambda: ${zn(m, i)}`);
    n.line(10, "then:"), T(n, 12, "binary_sensor", c.id, "ON"), T(n, 12, "binary_sensor", c.id, "OFF");
  }
  for (const c of a) {
    const h = c.open.confirmation;
    h && (n.comment(6, `${c.name} geöffnet (Bestätigung Typ ${we(h.messageType)})`), n.line(6, "- if:"), n.line(10, "condition:"), n.line(12, "and:"), n.line(14, `- lambda: 'return (x.get_message_type() == ${M(h.messageType)});'`), n.line(
      14,
      `- lambda: 'return (x.get_source_address() == ${v(h.source, i)});'`
    ), h.destination !== void 0 && n.line(
      14,
      `- lambda: 'return (x.get_destination_address() == ${v(h.destination, i)});'`
    ), n.line(10, "then:"), Qe(n, 12, c.id, o));
  }
  if (u.length > 0 && n.comment(6, `Nicht ermittelt: ${u.join(", ")}`), n.line(0), d.length > 0) {
    n.line(0, "binary_sensor:");
    for (const c of d)
      n.line(2, "- platform: template"), n.line(4, `name: ${Xe(c.name)}`), n.line(4, `id: ${c.id}`), n.line(4, "icon: mdi:bell"), n.line(4, "filters:"), n.line(6, "- delayed_off: 1s");
    n.line(0);
  }
  if (a.length > 0) {
    n.line(0, "lock:");
    for (const c of a) {
      const { open: h } = c, p = e.maskDoorCode ? h.data.map(() => 0) : h.data;
      n.line(2, "- platform: template"), n.line(4, `name: ${Xe(c.name)}`), n.line(4, `id: ${c.id}`), n.line(4, `icon: ${c.icon}`), n.line(4, "lock_action:"), T(n, 6, "lock", c.id, "LOCKED"), n.line(4, "unlock_action:"), n.line(6, "- remote_transmitter.transmit_abbwelcome:"), n.line(10, `source_address: ${v(s.address, i)} # Innenstation`), n.line(
        10,
        `destination_address: ${v(h.destination, i)} # ${A(h.destination, i)}`
      ), n.line(10, `three_byte_address: ${i}`), n.line(
        10,
        `message_type: ${M(h.messageType)} # ${h.messageType === 14 ? "Schiebetür" : "Türöffner"}`
      );
      const m = e.maskDoorCode ? `PLATZHALTER: ${p.length} Byte ${ye}` : ye;
      n.line(10, `data: [${p.map(M).join(", ")}] # ${m}`), h.confirmation || (n.comment(6, "Keine Bestätigung vom Bus aufgenommen – Status wird nur angenommen"), Qe(n, 6, c.id, o));
    }
  }
  return n.toString();
}
var On = Object.defineProperty, In = Object.getOwnPropertyDescriptor, y = (t, e, n, s) => {
  for (var i = s > 1 ? void 0 : s ? In(e, n) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (i = (s ? o(e, n, i) : o(i)) || i);
  return s && i && On(e, n, i), i;
};
const re = "abb-welcome-wizard-card", Dn = "0.1.0", et = 10, Fn = 40, R = E.length + 1, Pn = {
  info: "mdi:information-outline",
  warning: "mdi:alert-outline",
  error: "mdi:alert-circle-outline"
};
function pe(t) {
  const e = new Date(t);
  return Number.isNaN(e.getTime()) ? "--:--:--" : e.toLocaleTimeString("de-DE", { hour12: !1 });
}
const J = (t) => t.toString(16).toUpperCase().padStart(2, "0");
let b = class extends H {
  constructor() {
    super(...arguments), this.page = 0, this.live = [], this.capture = null, this.now = Date.now(), this.toast = "", this.maskDoorCode = !1, this.showDoorCode = !1, this.indoorInput = "", this.receivedCount = 0;
  }
  // ---- Lovelace API --------------------------------------------------------------------------------
  static getStubConfig(t) {
    return { entity: Object.keys(t?.states ?? {}).filter(
      (n) => n.startsWith("sensor.") && /intercom|abb|welcome|frame|doorbell/i.test(n)
    )[0] ?? "sensor.doorbell_intercom", capture_seconds: et };
  }
  setConfig(t) {
    if (!t || typeof t.entity != "string" || !t.entity.includes("."))
      throw new Error('Bitte "entity" auf den Debug-Textsensor setzen, z. B. sensor.doorbell_intercom.');
    if (t.capture_seconds !== void 0 && (typeof t.capture_seconds != "number" || t.capture_seconds < 2 || t.capture_seconds > 120))
      throw new Error('"capture_seconds" muss eine Zahl zwischen 2 und 120 sein.');
    if (t.indoor_address !== void 0 && Z(t.indoor_address) === void 0)
      throw new Error('"indoor_address" muss eine Adresse wie 0x1010 oder 0x000110 sein.');
    const e = this.config?.entity !== t.entity;
    this.config = t, e && (this.resubscribe(), this.session = wn(t.entity) ?? Ge(t.entity), this.indoorInput = this.session.indoorAddress !== void 0 ? v(this.session.indoorAddress, this.session.indoorAddress > 65535) : "", this.live = [], this.capture = null);
  }
  getCardSize() {
    return 10;
  }
  set hass(t) {
    const e = !this._hass;
    this._hass = t, e && this.subscribe(), this.requestUpdate();
  }
  get hass() {
    return this._hass;
  }
  connectedCallback() {
    super.connectedCallback(), this.subscribe();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.unsubscribeEvents(), this.stopTimer();
  }
  updated(t) {
    t.has("page") && t.get("page") !== void 0 && this.renderRoot.querySelector(".stepper .current")?.scrollIntoView?.({ block: "nearest", inline: "center", behavior: "smooth" }), t.has("capture") && (this.capture ? this.startTimer() : this.stopTimer());
  }
  // ---- Event subscription (read-only: the card never calls services or sends frames) ---------------
  subscribe() {
    this.unsubscribe || !this._hass?.connection || !this.config || !this.isConnected || (this.unsubscribe = this._hass.connection.subscribeEvents((t) => this.onStateChanged(t), "state_changed").catch((t) => {
      console.error(`${re}: subscribing to state_changed failed`, t), this.unsubscribe = void 0;
    }));
  }
  unsubscribeEvents() {
    const t = this.unsubscribe;
    this.unsubscribe = void 0, t?.then((e) => e?.()).catch(() => {
    });
  }
  resubscribe() {
    this.unsubscribeEvents(), this.subscribe();
  }
  onStateChanged(t) {
    if (!this.config) return;
    const e = pn(t, this.config.entity);
    e && (this.receivedCount++, this.live = [e, ...this.live].slice(0, Fn), this.capture && (this.capture = fn(this.capture, e, this.captureSeconds, Date.now())));
  }
  // ---- Capture -------------------------------------------------------------------------------------
  get captureSeconds() {
    return this.config?.capture_seconds ?? et;
  }
  startTimer() {
    this.timer === void 0 && (this.timer = window.setInterval(() => {
      this.now = Date.now(), this.capture && gn(this.capture, this.now) && this.finishCapture();
    }, 250));
  }
  stopTimer() {
    this.timer !== void 0 && window.clearInterval(this.timer), this.timer = void 0;
  }
  beginCapture(t) {
    this.now = Date.now(), this.capture = mn(this.captureSeconds, t, this.now);
  }
  finishCapture() {
    const t = this.capture, e = this.currentStep;
    this.capture = null, !(!t || t.phase !== "recording" || !e) && (this.updateSession(
      vn(this.session, e.id, {
        startedAt: t.startedAt ?? (/* @__PURE__ */ new Date()).toISOString(),
        endedAt: (/* @__PURE__ */ new Date()).toISOString(),
        lines: t.lines
      })
    ), this.showToast(
      t.lines.length > 0 ? `Aufnahme gespeichert (${t.lines.length} Frames).` : "Aufnahme gespeichert – es kamen keine Frames an."
    ));
  }
  cancelCapture() {
    this.capture = null;
  }
  // ---- Session -------------------------------------------------------------------------------------
  updateSession(t) {
    this.session = t, _n(t);
  }
  get configIndoor() {
    return Z(this.config?.indoor_address);
  }
  get result() {
    const t = this.session.indoorAddress ?? this.configIndoor, e = this.analysisCache;
    if (e && e.session === this.session && e.indoor === t) return e.result;
    const n = un(this.session, { indoorAddress: t });
    return this.analysisCache = { session: this.session, indoor: t, result: n }, n;
  }
  /** Address used to highlight own frames: detected, manual or expected from the dials. */
  get highlightAddress() {
    const t = this.result.indoor?.address;
    if (t !== void 0) return t;
    const e = Q(this.session.dials);
    return e !== void 0 ? se(e, !1) : void 0;
  }
  exportSession() {
    const t = (/* @__PURE__ */ new Date()).toISOString().slice(0, 16).replace(/[:T]/g, "-");
    Je(`abb-welcome-session-${t}.json`, ft(this.session), "application/json");
  }
  importSession() {
    this.renderRoot.querySelector("#import")?.click();
  }
  async onImportFile(t) {
    const e = t.target, n = e.files?.[0];
    if (e.value = "", !(!n || !this.config))
      try {
        const s = gt(await n.text());
        this.updateSession({ ...s, entity: this.config.entity }), this.indoorInput = s.indoorAddress !== void 0 ? v(s.indoorAddress, s.indoorAddress > 65535) : "", this.page = R, this.showToast("Sitzung importiert.");
      } catch (s) {
        this.showToast(s instanceof Error ? s.message : String(s));
      }
  }
  resetSession() {
    this.config && window.confirm("Alle Aufnahmen dieser Sitzung löschen und neu beginnen?") && (An(this.config.entity), this.updateSession(Ge(this.config.entity)), this.indoorInput = "", this.capture = null, this.page = 0);
  }
  onDialInput(t, e) {
    const n = e.target.value, s = n === "" ? void 0 : Number(n);
    this.updateSession(
      $n(this.session, {
        ...this.session.dials,
        [t]: s !== void 0 && Number.isInteger(s) ? s : void 0
      })
    );
  }
  onIndoorInput(t) {
    this.indoorInput = t.target.value;
    const e = this.indoorInput.trim();
    if (e === "") this.updateSession(Ze(this.session, void 0));
    else {
      const n = Z(e);
      n !== void 0 && this.updateSession(Ze(this.session, n));
    }
  }
  showToast(t) {
    this.toast = t, window.clearTimeout(this.toastTimer), this.toastTimer = window.setTimeout(() => this.toast = "", 4e3);
  }
  // ---- Navigation ----------------------------------------------------------------------------------
  get currentStep() {
    return this.page >= 1 && this.page <= E.length ? E[this.page - 1] : void 0;
  }
  goTo(t) {
    this.capture || (this.page = Math.max(0, Math.min(R, t)), this.waitForFrame = void 0);
  }
  skipStep() {
    const t = this.currentStep;
    t && this.updateSession(bn(this.session, t.id, !0)), this.goTo(this.page + 1);
  }
  // ---- Rendering -----------------------------------------------------------------------------------
  render() {
    return !this.config || !this.session ? f : l`
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
        <div class="progress"><div style="width:${this.page / R * 100}%"></div></div>
        <div class="content">
          ${this.page === 0 ? this.renderStart() : this.page === R ? this.renderResult() : this.renderStep(E[this.page - 1])}
        </div>
        ${this.renderFooter()}
      </ha-card>
    `;
  }
  renderStepper() {
    const t = [
      { label: "Start", icon: "mdi:play", status: "" },
      ...E.map((e) => {
        const n = this.session.steps[e.id], s = n.captures.length > 0 ? "done" : n.skipped ? "skipped" : "";
        return { label: e.short, icon: s === "done" ? "mdi:check" : e.icon, status: s };
      }),
      { label: "Ergebnis", icon: "mdi:file-code-outline", status: "" }
    ];
    return l`
      <nav class="stepper" aria-label="Schritte">
        ${t.map(
      (e, n) => l`
            <button
              class="${e.status} ${n === this.page ? "current" : ""}"
              ?disabled=${!!this.capture}
              aria-current=${n === this.page ? "step" : "false"}
              title=${e.label}
              @click=${() => this.goTo(n)}
            >
              <span class="dot"><ha-icon icon=${e.icon}></ha-icon></span>
              <span class="label">${e.label}</span>
            </button>
          `
    )}
      </nav>
    `;
  }
  renderFooter() {
    const t = this.currentStep, e = t ? this.session.steps[t.id].captures.length > 0 : !1;
    return l`
      <div class="footer">
        <button
          class="btn text"
          ?disabled=${this.page === 0 || !!this.capture}
          @click=${() => this.goTo(this.page - 1)}
        >
          <ha-icon icon="mdi:chevron-left"></ha-icon>Zurück
        </button>
        <span class="spacer"></span>
        ${this.toast ? l`<span class="toast" role="status">${this.toast}</span>` : f}
        <span class="spacer"></span>
        ${t && !e ? l`<button class="btn text" ?disabled=${!!this.capture} @click=${this.skipStep}>
                Überspringen
              </button>` : f}
        ${this.page < R ? l`<button
                class="btn ${!t || e ? "primary" : ""}"
                ?disabled=${!!this.capture}
                @click=${() => this.goTo(this.page + 1)}
              >
                ${this.page === E.length ? "Auswerten" : "Weiter"}<ha-icon
                  icon="mdi:chevron-right"
                ></ha-icon>
              </button>` : f}
      </div>
    `;
  }
  // ---- Start page ----------------------------------------------------------------------------------
  renderStart() {
    const t = this.config.entity, e = this.hass?.states[t], n = Q(this.session.dials), s = this.result.threeByte, i = n !== void 0 ? se(n, s) : void 0, r = this.indoorInput.trim() !== "" && Z(this.indoorInput) === void 0, o = this.configIndoor;
    return l`
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
        ${e ? l`<div class="callout ${this.receivedCount > 0 ? "ok" : "info"}">
                <ha-icon
                  icon=${this.receivedCount > 0 ? "mdi:check-circle-outline" : "mdi:timer-sand"}
                ></ha-icon>
                <span>
                  <b>${e.attributes.friendly_name ?? t}</b> gefunden.
                  ${this.receivedCount > 0 ? l`${this.receivedCount} Frame(s) seit dem Öffnen der Karte empfangen.` : l`Noch keine neuen Frames – drück zum Test kurz eine Taste an der Innenstation.`} <br /><span class="muted small">Letzter Wert: <code>${e.state}</code></span>
                </span>
              </div>` : l`<div class="callout error">
                <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
                <span
                  >Die Entität <code>${t}</code> existiert nicht. Trage in der Karten-Konfiguration unter
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
      (d) => l`
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
        ${i !== void 0 ? l`<p class="small">
                Wohnung <b>${n}</b> → erwartete Innenstationsadresse
                <span class="badge accent">${v(i, s)}</span>
              </p>` : f}
      </div>

      <details ?open=${o !== void 0 || this.session.indoorAddress !== void 0}>
        <summary>Innenstationsadresse manuell festlegen (für Profis)</summary>
        <div class="panel" style="border:none;padding:0">
          <p class="muted small">
            Normalerweise ermittelt der Assistent die Adresse selbst. Falls du sie kennst oder die Erkennung
            danebenliegt, kannst du sie hier
            vorgeben${o !== void 0 ? l` (Karten-Konfiguration:
                    <code>${v(o, o > 65535)}</code>)` : f}.
          </p>
          <label class="field"
            >Adresse (z. B. 0x1010 oder 0x000110)
            <input
              type="text"
              class=${r ? "invalid" : ""}
              placeholder=${o !== void 0 ? v(o, o > 65535) : "automatisch"}
              .value=${this.indoorInput}
              @input=${this.onIndoorInput}
            />
          </label>
        </div>
      </details>

      ${this.renderLive("Live-Frames")} ${this.renderLimitations()}
    `;
  }
  renderLimitations() {
    return l`
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
  renderLive(t, e = this.live) {
    const n = this.live.length > 0;
    return l`
      <div class="panel">
        <h3 style="display:flex;align-items:center;gap:8px">
          <span class="live-dot ${n ? "" : "off"}"></span>${t}
          <span class="muted small" style="font-weight:normal"
            >${e.length > 0 ? `(${e.length})` : ""}</span
          >
        </h3>
        ${this.renderFrames(e, "Warte auf Frames … Tipp: Taste an der Innenstation drücken.")}
      </div>
    `;
  }
  renderFrames(t, e) {
    if (t.length === 0) return l`<div class="empty">${e}</div>`;
    const n = this.highlightAddress;
    return l`
      <div class="frames" role="log">
        ${t.map((s) => {
      const i = at(s.line);
      if (!i.ok)
        return l`<div class="frame unparsed" title="Nicht erkannt">
              <span class="time">${pe(s.time)}</span><span class="route">?</span
              ><span class="detail">${s.line}</span>
            </div>`;
      const r = i.frame, o = n !== void 0 && Te(r, n);
      return l`<div class="frame ${n === void 0 ? "" : o ? "own" : "foreign"}" title=${s.line}>
            <span class="time">${pe(s.time)}</span>
            <span class="route"
              >${ue(r.src, r.threeByte)} ${r.retransmission ? "»" : "›"}
              ${ue(r.dst, r.threeByte)}</span
            >
            <span class="detail"
              ><span class="type">${J(r.type)}</span>${r.data.length ? l` · ${K(r.data)}` : f}</span
            >
          </div>`;
    })}
      </div>
    `;
  }
  // ---- Recording step ------------------------------------------------------------------------------
  renderStep(t) {
    const n = this.session.steps[t.id].captures.length;
    return l`
      <h2><ha-icon icon=${t.icon}></ha-icon>${t.title}</h2>
      <ol class="todo">
        ${t.todo.map((s) => l`<li>${s}</li>`)}
      </ol>
      <details>
        <summary>Warum?</summary>
        <p class="small">${t.why}</p>
      </details>
      ${t.id === "open_house" ? this.renderPauseHint() : f}
      ${t.id === "open_gate" || t.id === "open_house" ? l`<div class="callout warning">
              <ha-icon icon="mdi:door-open"></ha-icon>
              <span
                >Die Tür öffnet sich bei diesem Schritt tatsächlich – nur ausführen, wenn das in Ordnung
                ist.</span
              >
            </div>` : f}

      <div class="panel">
        ${this.capture ? this.renderActiveCapture() : this.renderCaptureControls(t, n)}
      </div>

      ${n > 0 ? this.renderCaptures(t) : f}
      ${n > 0 ? this.renderStepFeedback(t) : f}
      ${this.capture ? this.renderLive("Frames dieser Aufnahme", [...this.capture.lines].reverse()) : this.renderLive("Live-Frames")}
    `;
  }
  renderPauseHint() {
    const t = yn(this.session);
    if (!t) return l``;
    const e = (this.now - t.getTime()) / 6e4, n = e >= Ye;
    return l`<div class="callout ${n ? "ok" : "warning"}">
      <ha-icon icon="mdi:timer-outline"></ha-icon>
      <span
        >Letztes Klingeln vor
        ${e < 1 ? "weniger als einer Minute" : `${Math.floor(e)} Minute(n)`}.
        ${n ? "Passt – die Schlüssel-Taste öffnet jetzt die Standard-Außenstation." : `Bitte noch etwas warten (mindestens ${Ye} Minuten).`}</span
      >
    </div>`;
  }
  renderCaptureControls(t, e) {
    const n = this.captureSeconds, s = this.waitForFrame ?? t.waitForFrame;
    return l`
      <div class="actions">
        <button class="btn primary large" @click=${() => this.beginCapture(s)}>
          <ha-icon icon=${e === 0 ? "mdi:record-circle-outline" : "mdi:repeat"}></ha-icon>
          ${e === 0 ? "Aufnahme starten" : "Wiederholen"}
        </button>
        <span class="spacer" style="flex:1"></span>
        ${this.renderReps(e, t.repetitions)}
      </div>
      <label class="switch">
        <input
          type="checkbox"
          .checked=${s}
          @change=${(i) => this.waitForFrame = i.target.checked}
        />
        <span
          >Erst mit dem ersten Frame starten
          <span class="muted">(z. B. wenn du erst zur Tür gehen musst)</span></span
        >
      </label>
      <p class="muted small">
        ${s ? `Nach dem Tippen wartet die Karte auf den ersten Frame und nimmt ab dann ${n} s auf.` : `Die Aufnahme läuft ${n} s ab dem Tippen.`}
        ${e === 0 ? "" : e < t.repetitions ? `Empfohlen: ${t.repetitions} Aufnahmen.` : "Genug Aufnahmen – weiter zum nächsten Schritt."}
      </p>
    `;
  }
  renderReps(t, e) {
    const n = Math.max(t, e);
    return l`<span class="reps" title="${t} von ${e} empfohlenen Aufnahmen">
      ${Array.from({ length: n }, (s, i) => l`<span class=${i < t ? "filled" : ""}></span>`)}
    </span>`;
  }
  renderActiveCapture() {
    const t = this.capture;
    if (t.phase === "armed")
      return l`<div class="capture">
        <div class="pulse"><ha-icon icon="mdi:bell-ring-outline"></ha-icon></div>
        <div style="flex:1">
          <b>Bereit – jetzt klingeln bzw. Taste drücken.</b>
          <p class="muted small">Die Aufnahme startet automatisch mit dem ersten Frame.</p>
        </div>
        <button class="btn text" @click=${this.cancelCapture}>Abbrechen</button>
      </div>`;
    const e = this.captureSeconds * 1e3, n = Math.max(0, (t.endsAt ?? this.now) - this.now), s = 2 * Math.PI * 32;
    return l`<div class="capture">
      <div class="ring" role="timer" aria-label="Verbleibende Sekunden">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle class="track" cx="36" cy="36" r="32"></circle>
          <circle
            class="bar"
            cx="36"
            cy="36"
            r="32"
            stroke-dasharray=${s}
            stroke-dashoffset=${s * (1 - n / e)}
          ></circle>
        </svg>
        <div class="value">${Math.ceil(n / 1e3)}</div>
      </div>
      <div style="flex:1">
        <b>Aufnahme läuft …</b>
        <p class="muted small">${t.lines.length} Frame(s) empfangen</p>
      </div>
      <button class="btn" @click=${this.finishCapture}>Jetzt beenden</button>
    </div>`;
  }
  renderCaptures(t) {
    const e = this.session.steps[t.id].captures;
    return l`
      <div class="captures">
        <div class="actions">
          <h3 style="margin:0;flex:1">Aufnahmen</h3>
          <button
            class="btn text danger"
            @click=${() => this.updateSession(Ve(this.session, t.id, e.length - 1))}
          >
            <ha-icon icon="mdi:undo"></ha-icon>Verwerfen
          </button>
        </div>
        ${e.map(
      (n, s) => l`
            <details class="capture-row">
              <summary>
                <ha-icon icon="mdi:chevron-right"></ha-icon>
                <span class="grow">Aufnahme ${s + 1} · ${pe(n.startedAt)}</span>
                <span class="badge ${n.lines.length ? "" : "warning"}">${n.lines.length} Frames</span>
                <button
                  class="icon"
                  title="Diese Aufnahme löschen"
                  @click=${(i) => {
        i.preventDefault(), this.updateSession(Ve(this.session, t.id, s));
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
  renderStepFeedback(t) {
    const e = this.result;
    if (!e.indoor)
      return l`<div class="callout info">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        <span>Innenstation noch nicht erkannt – sie ergibt sich spätestens aus den Öffnen-Schritten.</span>
      </div>`;
    if (t.id === "baseline")
      return l`<div class="callout ok">
        <ha-icon icon="mdi:check-circle-outline"></ha-icon>
        <span
          >${this.session.steps.baseline.captures.flatMap((s) => s.lines).length} Frames als Baseline
          markiert.</span
        >
      </div>`;
    if (dt.includes(t.id)) {
      const s = e.rings[t.id];
      return s.candidates.length > 0 ? l`<div class="panel">
            <h3>Erkannt</h3>
            ${this.renderCandidates(s)}
          </div>` : l`<div class="callout warning">
            <ha-icon icon="mdi:alert-outline"></ha-icon>
            <span
              >Noch keine passenden Klingel-Frames für
              ${A(e.indoor.address, e.threeByte)}.</span
            >
          </div>`;
    }
    const n = e.opens[t.id];
    return n ? l`<div class="panel">
          <h3>Erkannt</h3>
          ${this.renderOpen(n)}
        </div>` : l`<div class="callout warning">
          <ha-icon icon="mdi:alert-outline"></ha-icon>
          <span>Kein Öffnen-Frame (Typ 0D/0E) von der Innenstation gefunden.</span>
        </div>`;
  }
  // ---- Result page ---------------------------------------------------------------------------------
  renderResult() {
    const t = this.result, { indoor: e, threeByte: n } = t, s = Q(this.session.dials), i = Cn(t, { maskDoorCode: this.maskDoorCode, apartment: s });
    return Object.values(this.session.steps).some((o) => o.captures.length > 0) ? l`
      <h2><ha-icon icon="mdi:file-code-outline"></ha-icon>Ergebnis</h2>

      <div class="grid">
        <div class="panel stat">
          <span class="muted small">Innenstation</span>
          <span class="value">${e ? v(e.address, n) : "—"}</span>
          ${e ? l`<span class="small">
                  ${e.method === "manual" ? l`<span class="badge accent">manuell</span>` : e.method === "open" ? l`<span class="badge ok">aus Öffnen-Frames</span>` : l`<span class="badge warning">nach Häufigkeit</span>`}
                  ${e.expected !== void 0 ? e.matchesExpected ? l`<span class="badge ok"
                            ><ha-icon icon="mdi:check"></ha-icon>passt zu Wohnung ${s}</span
                          >` : l`<span class="badge warning"
                            >erwartet ${v(e.expected, n)} (Wohnung
                            ${s})</span
                          >` : f}
                </span>` : f}
        </div>
        <div class="panel stat">
          <span class="muted small">Adresslänge</span>
          <span class="value">${n ? "3 Byte" : "2 Byte"}</span>
          <span class="muted small">${n ? "three_byte_address: true" : "Standard"}</span>
        </div>
      </div>

      ${this.renderWarnings(t)}

      <div class="panel">
        <h3>Klingeln</h3>
        ${be.map((o) => {
      const d = t.rings[o.step], a = d.selected.length > 0;
      return l`<div class="result-row">
            <ha-icon icon=${E.find((u) => u.id === o.step).icon}></ha-icon>
            <div>
              <div class="row-head">
                <b>${o.name}</b>
                ${d.outdoorAddress !== void 0 ? l`<span class="muted small"
                        >${A(d.outdoorAddress, n)}</span
                      >` : f}
                <span class="spacer"></span>
                ${a ? l`<span class="badge ok">binary_sensor.${o.id}</span>` : l`<span class="badge ${d.captures ? "warning" : ""}"
                        >${d.captures ? "nicht erkannt" : "nicht aufgenommen"}</span
                      >`}
              </div>
              ${d.candidates.length > 0 ? this.renderCandidates(d) : f}
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
        ${$e.map((o) => {
      const d = t.opens[o.step], a = this.session.steps[o.step].captures.length > 0;
      return l`<div class="result-row">
            <ha-icon icon=${o.icon}></ha-icon>
            <div>
              <div class="row-head">
                <b>${o.name}</b>
                <span class="spacer"></span>
                ${d ? l`<span class="badge ok">lock.${o.id}</span>` : l`<span class="badge ${a ? "warning" : ""}"
                        >${a ? "nicht erkannt" : "nicht aufgenommen"}</span
                      >`}
              </div>
              ${d ? this.renderOpen(d) : f}
            </div>
          </div>`;
    })}
        <p class="muted small">
          Die Wohnungstür hat keinen elektrischen Öffner und erscheint deshalb nur als Klingel.
        </p>
      </div>

      <div class="panel">
        <h3 style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span style="flex:1">ESPHome-Konfiguration</span>
          <label class="switch">
            <input
              type="checkbox"
              .checked=${this.maskDoorCode}
              @change=${(o) => this.maskDoorCode = o.target.checked}
            />Türcode maskieren
          </label>
        </h3>
        <p class="muted small">
          In der ESPHome-Konfiguration deines ESP32 die gleichnamigen Abschnitte der Demo-Firmware ersetzen
          und per OTA installieren.
          ${this.maskDoorCode ? "Türcodes sind durch Platzhalter ersetzt – gut zum Teilen in Foren." : l`<b>Enthält deinen Türcode – nicht öffentlich teilen.</b>`}
        </p>
        <div class="actions">
          <button class="btn primary" @click=${() => this.copyYaml(i)}>
            <ha-icon icon="mdi:content-copy"></ha-icon>Kopieren
          </button>
          <button class="btn" @click=${() => Je("abb-welcome.yaml", i, "text/yaml")}>
            <ha-icon icon="mdi:download"></ha-icon>Herunterladen
          </button>
        </div>
        <pre class="yaml">${i}</pre>
      </div>

      <details>
        <summary>
          Statistik · ${t.stats.parsedFrames} Frames, ${t.stats.baselineFiltered} per Baseline und
          ${t.stats.neighbourFiltered} als Nachbar-Frames ausgefiltert
        </summary>
        ${t.stats.unparsedLines.length > 0 ? l`<p class="small">${t.stats.unparsedLines.length} nicht erkannte Zeile(n):</p>
                <div class="frames">
                  ${t.stats.unparsedLines.map((o) => l`<div class="frame unparsed"><span></span><span></span><span>${o}</span></div>`)}
                </div>` : l`<p class="small muted">Alle Zeilen wurden erkannt.</p>`}
      </details>
      ${this.renderLimitations()}
    ` : l`<h2><ha-icon icon="mdi:file-code-outline"></ha-icon>Ergebnis</h2>
        <div class="callout info">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          <span>Noch keine Aufnahmen. Geh die Schritte durch oder importiere eine gespeicherte Sitzung.</span>
        </div>`;
  }
  async copyYaml(t) {
    this.showToast(
      await xn(t) ? "YAML kopiert." : "Kopieren nicht möglich – bitte manuell markieren."
    );
  }
  renderWarnings(t) {
    const e = ["error", "warning", "info"], n = [...t.warnings].sort(
      (r, o) => e.indexOf(r.severity) - e.indexOf(o.severity)
    );
    if (n.length === 0)
      return l`<div class="callout ok">
        <ha-icon icon="mdi:check-circle-outline"></ha-icon><span>Keine Auffälligkeiten.</span>
      </div>`;
    const s = n.filter((r) => r.severity !== "info"), i = n.filter((r) => r.severity === "info");
    return l`
      ${s.length === 0 ? l`<div class="callout ok">
              <ha-icon icon="mdi:check-circle-outline"></ha-icon><span>Keine Probleme gefunden.</span>
            </div>` : f}
      ${s.map(
      (r) => l`<div class="callout ${r.severity}">
            <ha-icon icon=${Pn[r.severity]}></ha-icon><span>${r.message}</span>
          </div>`
    )}
      ${i.length > 0 ? l`<details>
              <summary>${i.length} Hinweis(e)</summary>
              <ul class="small" style="margin:0;padding-left:1.2em;line-height:1.5">
                ${i.map((r) => l`<li>${r.message}</li>`)}
              </ul>
            </details>` : f}
    `;
  }
  renderCandidates(t) {
    const { threeByte: e } = this.result, n = new Set(t.selected.map((i) => i.key)), s = (i) => {
      const r = (d) => ue(d, e), o = i.src !== void 0 && i.dst !== void 0 ? `${r(i.src)} › ${r(i.dst)}` : i.src !== void 0 ? `von ${r(i.src)}` : i.dst !== void 0 ? `an ${r(i.dst)}` : "";
      return `Typ ${J(i.type)} ${o}${i.data ? ` · ${K(i.data)}` : ""}`;
    };
    return l`<div class="candidates">
      ${t.candidates.map(
      (i) => l`<div
            class="candidate ${n.has(i.key) ? "" : "unselected"}"
            title=${n.has(i.key) ? "wird verwendet" : "nicht in allen Aufnahmen – wird nicht verwendet"}
          >
            <code>${s(i)}</code>
            <div
              class="meter ${i.reliable ? "" : "partial"}"
              title="${i.occurrences}/${t.captures} Aufnahmen"
            >
              <div style="width:${Math.round(i.score * 100)}%"></div>
            </div>
          </div>`
    )}
    </div>`;
  }
  renderOpen(t) {
    const { threeByte: e } = this.result, n = this.showDoorCode ? K(t.data) : t.data.map(() => "••").join(" ");
    return l`<dl class="kv" style="margin:6px 0 0">
      <dt>Ziel</dt>
      <dd>${A(t.destination, e)}</dd>
      <dt>Typ</dt>
      <dd>${J(t.messageType)} ${t.messageType === 14 ? "(Schiebetür)" : "(Türöffner)"}</dd>
      <dt>Türcode</dt>
      <dd>${n || "—"}</dd>
      <dt>Bestätigung</dt>
      <dd>
        ${t.confirmation ? `${J(t.confirmation.messageType)} von ${v(t.confirmation.source, e)}` : "—"}
      </dd>
      <dt>Stabilität</dt>
      <dd>${t.occurrences}/${t.captures} Aufnahmen</dd>
    </dl>`;
  }
};
b.styles = Sn;
y([
  w()
], b.prototype, "config", 2);
y([
  w()
], b.prototype, "session", 2);
y([
  w()
], b.prototype, "page", 2);
y([
  w()
], b.prototype, "live", 2);
y([
  w()
], b.prototype, "capture", 2);
y([
  w()
], b.prototype, "now", 2);
y([
  w()
], b.prototype, "toast", 2);
y([
  w()
], b.prototype, "maskDoorCode", 2);
y([
  w()
], b.prototype, "showDoorCode", 2);
y([
  w()
], b.prototype, "indoorInput", 2);
y([
  w()
], b.prototype, "receivedCount", 2);
y([
  w()
], b.prototype, "waitForFrame", 2);
b = y([
  Mt(re)
], b);
window.customCards = window.customCards ?? [];
window.customCards.some((t) => t.type === re) || window.customCards.push({
  type: re,
  name: "ABB-Welcome Wizard",
  description: "Assistent zum Einmessen von Klingeln und Türöffnern einer Busch-/ABB-Welcome-Anlage.",
  preview: !1,
  documentationURL: "https://github.com/jako-dev/esp32-abb-wizard-card"
});
console.info(
  `%c ABB-WELCOME-WIZARD-CARD %c ${Dn} `,
  "background:#03a9f4;color:#fff",
  "background:#444;color:#fff"
);
export {
  b as AbbWelcomeWizardCard
};
