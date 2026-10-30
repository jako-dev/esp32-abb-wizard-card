/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ce = globalThis, Fe = ce.ShadowRoot && (ce.ShadyCSS === void 0 || ce.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Pe = Symbol(), Ge = /* @__PURE__ */ new WeakMap();
let _t = class {
  constructor(e, n, s) {
    if (this._$cssResult$ = !0, s !== Pe) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = n;
  }
  get styleSheet() {
    let e = this.o;
    const n = this.t;
    if (Fe && e === void 0) {
      const s = n !== void 0 && n.length === 1;
      s && (e = Ge.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), s && Ge.set(n, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Kt = (t) => new _t(typeof t == "string" ? t : t + "", void 0, Pe), Ht = (t, ...e) => {
  const n = t.length === 1 ? t[0] : e.reduce((s, i, r) => s + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + t[r + 1], t[0]);
  return new _t(n, t, Pe);
}, Ut = (t, e) => {
  if (Fe) t.adoptedStyleSheets = e.map((n) => n instanceof CSSStyleSheet ? n : n.styleSheet);
  else for (const n of e) {
    const s = document.createElement("style"), i = ce.litNonce;
    i !== void 0 && s.setAttribute("nonce", i), s.textContent = n.cssText, t.appendChild(s);
  }
}, Ye = Fe ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let n = "";
  for (const s of e.cssRules) n += s.cssText;
  return Kt(n);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: jt, defineProperty: Wt, getOwnPropertyDescriptor: Vt, getOwnPropertyNames: qt, getOwnPropertySymbols: Gt, getPrototypeOf: Yt } = Object, be = globalThis, Ze = be.trustedTypes, Zt = Ze ? Ze.emptyScript : "", Jt = be.reactiveElementPolyfillSupport, W = (t, e) => t, he = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? Zt : null;
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
} }, Be = (t, e) => !jt(t, e), Je = { attribute: !0, type: String, converter: he, reflect: !1, useDefault: !1, hasChanged: Be };
Symbol.metadata ??= Symbol("metadata"), be.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let P = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, n = Je) {
    if (n.state && (n.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((n = Object.create(n)).wrapped = !0), this.elementProperties.set(e, n), !n.noAccessor) {
      const s = Symbol(), i = this.getPropertyDescriptor(e, s, n);
      i !== void 0 && Wt(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, n, s) {
    const { get: i, set: r } = Vt(this.prototype, e) ?? { get() {
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
    return this.elementProperties.get(e) ?? Je;
  }
  static _$Ei() {
    if (this.hasOwnProperty(W("elementProperties"))) return;
    const e = Yt(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(W("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(W("properties"))) {
      const n = this.properties, s = [...qt(n), ...Gt(n)];
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
      for (const i of s) n.unshift(Ye(i));
    } else e !== void 0 && n.push(Ye(e));
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
    return Ut(e, this.constructor.elementStyles), e;
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
      const r = (s.converter?.toAttribute !== void 0 ? s.converter : he).toAttribute(n, s.type);
      this._$Em = e, r == null ? this.removeAttribute(i) : this.setAttribute(i, r), this._$Em = null;
    }
  }
  _$AK(e, n) {
    const s = this.constructor, i = s._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const r = s.getPropertyOptions(i), o = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : he;
      this._$Em = i;
      const d = o.fromAttribute(n, r.type);
      this[i] = d ?? this._$Ej?.get(i) ?? d, this._$Em = null;
    }
  }
  requestUpdate(e, n, s, i = !1, r) {
    if (e !== void 0) {
      const o = this.constructor;
      if (i === !1 && (r = this[e]), s ??= o.getPropertyOptions(e), !((s.hasChanged ?? Be)(r, n) || s.useDefault && s.reflect && r === this._$Ej?.get(e) && !this.hasAttribute(o._$Eu(e, s)))) return;
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
P.elementStyles = [], P.shadowRootOptions = { mode: "open" }, P[W("elementProperties")] = /* @__PURE__ */ new Map(), P[W("finalized")] = /* @__PURE__ */ new Map(), Jt?.({ ReactiveElement: P }), (be.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ne = globalThis, Xe = (t) => t, pe = Ne.trustedTypes, Qe = pe ? pe.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, At = "$lit$", C = `lit$${Math.random().toFixed(9).slice(2)}$`, kt = "?" + C, Xt = `<${kt}>`, F = document, Y = () => F.createComment(""), Z = (t) => t === null || typeof t != "object" && typeof t != "function", Re = Array.isArray, Qt = (t) => Re(t) || typeof t?.[Symbol.iterator] == "function", _e = `[ 	
\f\r]`, U = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, et = /-->/g, tt = />/g, D = RegExp(`>|${_e}(?:([^\\s"'>=/]+)(${_e}*=${_e}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), nt = /'/g, st = /"/g, xt = /^(?:script|style|textarea|title)$/i, en = (t) => (e, ...n) => ({ _$litType$: t, strings: e, values: n }), c = en(1), K = Symbol.for("lit-noChange"), g = Symbol.for("lit-nothing"), it = /* @__PURE__ */ new WeakMap(), I = F.createTreeWalker(F, 129);
function St(t, e) {
  if (!Re(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Qe !== void 0 ? Qe.createHTML(e) : e;
}
const tn = (t, e) => {
  const n = t.length - 1, s = [];
  let i, r = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = U;
  for (let d = 0; d < n; d++) {
    const a = t[d];
    let u, h, p = -1, f = 0;
    for (; f < a.length && (o.lastIndex = f, h = o.exec(a), h !== null); ) f = o.lastIndex, o === U ? h[1] === "!--" ? o = et : h[1] !== void 0 ? o = tt : h[2] !== void 0 ? (xt.test(h[2]) && (i = RegExp("</" + h[2], "g")), o = D) : h[3] !== void 0 && (o = D) : o === D ? h[0] === ">" ? (o = i ?? U, p = -1) : h[1] === void 0 ? p = -2 : (p = o.lastIndex - h[2].length, u = h[1], o = h[3] === void 0 ? D : h[3] === '"' ? st : nt) : o === st || o === nt ? o = D : o === et || o === tt ? o = U : (o = D, i = void 0);
    const l = o === D && t[d + 1].startsWith("/>") ? " " : "";
    r += o === U ? a + Xt : p >= 0 ? (s.push(u), a.slice(0, p) + At + a.slice(p) + C + l) : a + C + (p === -2 ? d : l);
  }
  return [St(t, r + (t[n] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), s];
};
class J {
  constructor({ strings: e, _$litType$: n }, s) {
    let i;
    this.parts = [];
    let r = 0, o = 0;
    const d = e.length - 1, a = this.parts, [u, h] = tn(e, n);
    if (this.el = J.createElement(u, s), I.currentNode = this.el.content, n === 2 || n === 3) {
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
    for (; (i = I.nextNode()) !== null && a.length < d; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const p of i.getAttributeNames()) if (p.endsWith(At)) {
          const f = h[o++], l = i.getAttribute(p).split(C), m = /([.?@])?(.*)/.exec(f);
          a.push({ type: 1, index: r, name: m[2], strings: l, ctor: m[1] === "." ? sn : m[1] === "?" ? rn : m[1] === "@" ? on : $e }), i.removeAttribute(p);
        } else p.startsWith(C) && (a.push({ type: 6, index: r }), i.removeAttribute(p));
        if (xt.test(i.tagName)) {
          const p = i.textContent.split(C), f = p.length - 1;
          if (f > 0) {
            i.textContent = pe ? pe.emptyScript : "";
            for (let l = 0; l < f; l++) i.append(p[l], Y()), I.nextNode(), a.push({ type: 2, index: ++r });
            i.append(p[f], Y());
          }
        }
      } else if (i.nodeType === 8) if (i.data === kt) a.push({ type: 2, index: r });
      else {
        let p = -1;
        for (; (p = i.data.indexOf(C, p + 1)) !== -1; ) a.push({ type: 7, index: r }), p += C.length - 1;
      }
      r++;
    }
  }
  static createElement(e, n) {
    const s = F.createElement("template");
    return s.innerHTML = e, s;
  }
}
function H(t, e, n = t, s) {
  if (e === K) return e;
  let i = s !== void 0 ? n._$Co?.[s] : n._$Cl;
  const r = Z(e) ? void 0 : e._$litDirective$;
  return i?.constructor !== r && (i?._$AO?.(!1), r === void 0 ? i = void 0 : (i = new r(t), i._$AT(t, n, s)), s !== void 0 ? (n._$Co ??= [])[s] = i : n._$Cl = i), i !== void 0 && (e = H(t, i._$AS(t, e.values), i, s)), e;
}
class nn {
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
    const { el: { content: n }, parts: s } = this._$AD, i = (e?.creationScope ?? F).importNode(n, !0);
    I.currentNode = i;
    let r = I.nextNode(), o = 0, d = 0, a = s[0];
    for (; a !== void 0; ) {
      if (o === a.index) {
        let u;
        a.type === 2 ? u = new te(r, r.nextSibling, this, e) : a.type === 1 ? u = new a.ctor(r, a.name, a.strings, this, e) : a.type === 6 && (u = new an(r, this, e)), this._$AV.push(u), a = s[++d];
      }
      o !== a?.index && (r = I.nextNode(), o++);
    }
    return I.currentNode = F, i;
  }
  p(e) {
    let n = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(e, s, n), n += s.strings.length - 2) : s._$AI(e[n])), n++;
  }
}
class te {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, n, s, i) {
    this.type = 2, this._$AH = g, this._$AN = void 0, this._$AA = e, this._$AB = n, this._$AM = s, this.options = i, this._$Cv = i?.isConnected ?? !0;
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
    e = H(this, e, n), Z(e) ? e === g || e == null || e === "" ? (this._$AH !== g && this._$AR(), this._$AH = g) : e !== this._$AH && e !== K && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Qt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== g && Z(this._$AH) ? this._$AA.nextSibling.data = e : this.T(F.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: n, _$litType$: s } = e, i = typeof s == "number" ? this._$AC(e) : (s.el === void 0 && (s.el = J.createElement(St(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === i) this._$AH.p(n);
    else {
      const r = new nn(i, this), o = r.u(this.options);
      r.p(n), this.T(o), this._$AH = r;
    }
  }
  _$AC(e) {
    let n = it.get(e.strings);
    return n === void 0 && it.set(e.strings, n = new J(e)), n;
  }
  k(e) {
    Re(this._$AH) || (this._$AH = [], this._$AR());
    const n = this._$AH;
    let s, i = 0;
    for (const r of e) i === n.length ? n.push(s = new te(this.O(Y()), this.O(Y()), this, this.options)) : s = n[i], s._$AI(r), i++;
    i < n.length && (this._$AR(s && s._$AB.nextSibling, i), n.length = i);
  }
  _$AR(e = this._$AA.nextSibling, n) {
    for (this._$AP?.(!1, !0, n); e !== this._$AB; ) {
      const s = Xe(e).nextSibling;
      Xe(e).remove(), e = s;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class $e {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, n, s, i, r) {
    this.type = 1, this._$AH = g, this._$AN = void 0, this.element = e, this.name = n, this._$AM = i, this.options = r, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = g;
  }
  _$AI(e, n = this, s, i) {
    const r = this.strings;
    let o = !1;
    if (r === void 0) e = H(this, e, n, 0), o = !Z(e) || e !== this._$AH && e !== K, o && (this._$AH = e);
    else {
      const d = e;
      let a, u;
      for (e = r[0], a = 0; a < r.length - 1; a++) u = H(this, d[s + a], n, a), u === K && (u = this._$AH[a]), o ||= !Z(u) || u !== this._$AH[a], u === g ? e = g : e !== g && (e += (u ?? "") + r[a + 1]), this._$AH[a] = u;
    }
    o && !i && this.j(e);
  }
  j(e) {
    e === g ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class sn extends $e {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === g ? void 0 : e;
  }
}
class rn extends $e {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== g);
  }
}
class on extends $e {
  constructor(e, n, s, i, r) {
    super(e, n, s, i, r), this.type = 5;
  }
  _$AI(e, n = this) {
    if ((e = H(this, e, n, 0) ?? g) === K) return;
    const s = this._$AH, i = e === g && s !== g || e.capture !== s.capture || e.once !== s.once || e.passive !== s.passive, r = e !== g && (s === g || i);
    i && this.element.removeEventListener(this.name, this, s), r && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class an {
  constructor(e, n, s) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = n, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    H(this, e);
  }
}
const dn = Ne.litHtmlPolyfillSupport;
dn?.(J, te), (Ne.litHtmlVersions ??= []).push("3.3.3");
const cn = (t, e, n) => {
  const s = n?.renderBefore ?? e;
  let i = s._$litPart$;
  if (i === void 0) {
    const r = n?.renderBefore ?? null;
    s._$litPart$ = i = new te(e.insertBefore(Y(), r), r, void 0, n ?? {});
  }
  return i._$AI(t), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Me = globalThis;
class R extends P {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const n = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = cn(n, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return K;
  }
}
R._$litElement$ = !0, R.finalized = !0, Me.litElementHydrateSupport?.({ LitElement: R });
const ln = Me.litElementPolyfillSupport;
ln?.({ LitElement: R });
(Me.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const zt = (t) => (e, n) => {
  n !== void 0 ? n.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const un = { attribute: !0, type: String, converter: he, reflect: !1, hasChanged: Be }, hn = (t = un, e, n) => {
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
function pn(t) {
  return (e, n) => typeof n == "object" ? hn(t, e, n) : ((s, i, r) => {
    const o = i.hasOwnProperty(r);
    return i.constructor.createProperty(r, s), o ? Object.getOwnPropertyDescriptor(i, r) : void 0;
  })(t, e, n);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function _(t) {
  return pn({ ...t, state: !0, attribute: !1 });
}
const mn = { 1: "indoor", 2: "outdoor", 3: "gateway", 4: "door" };
function fn(t, e) {
  if (e) return t >> 16 === 0 ? t >> 8 & 255 : null;
  if (t > 65535) return null;
  const n = t >> 8;
  return (n & 15) === 0 ? n >> 4 : null;
}
function Le(t, e) {
  const n = fn(t, e);
  return n !== null && mn[n] || "unknown";
}
const Ae = (t, e) => Le(t, e) === "indoor", gn = (t, e) => Le(t, e) === "outdoor";
function $(t, e) {
  return "0x" + t.toString(16).padStart(e ? 6 : 4, "0");
}
function ke(t, e) {
  return t.toString(16).toUpperCase().padStart(e ? 6 : 4, "0");
}
function V(t) {
  return "0x" + t.toString(16).padStart(2, "0");
}
function q(t) {
  return t.map((e) => e.toString(16).toUpperCase().padStart(2, "0")).join(" ");
}
const yn = {
  indoor: "Innenstation",
  outdoor: "Außenstation",
  gateway: "Gateway",
  door: "Türsteuergerät",
  unknown: "Gerät"
};
function z(t, e) {
  const n = Le(t, e), s = yn[n], i = $(t, e);
  return n === "indoor" || n === "outdoor" ? `${s} #${t & 255} (${i})` : `${s} (${i})`;
}
function le(t) {
  const { x10: e, x1: n } = t;
  if (!(e === void 0 || n === void 0) && !(!Number.isInteger(e) || !Number.isInteger(n) || e < 0 || e > 9 || n < 0 || n > 9))
    return e * 10 + n;
}
function me(t, e) {
  return (e ? 256 : 4096) | t & 255;
}
function vn(t, e) {
  return e ? [t >> 16 & 255, t >> 8 & 255, t & 255] : [t >> 8 & 255, t & 255];
}
function bn(t, e) {
  e: for (let n = 0; n + e.length <= t.length; n++) {
    for (let s = 0; s < e.length; s++) if (t[n + s] !== e[s]) continue e;
    return !0;
  }
  return !1;
}
function Et(t, e) {
  return bn(t.data, vn(e, t.threeByte));
}
function Ke(t, e) {
  return t.src === e || t.dst === e || Et(t, e);
}
const X = 8, He = [
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
], M = "baseline", E = (t) => `ring:${typeof t == "string" ? t : t.key}`, T = (t) => `open:${typeof t == "string" ? t : t.key}`;
function fe(t) {
  const e = t.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return e === "" ? "tuer" : /^[0-9]/.test(e) ? `tuer_${e}` : e;
}
function Ue(t, e) {
  let n = t;
  for (let s = 2; e.has(n); s++) n = `${t}_${s}`;
  return e.add(n), n;
}
function Tt(t) {
  const e = /* @__PURE__ */ new Set(), n = {};
  for (const s of t) n[s.key] = Ue(s.id ? fe(s.id) : fe(s.name), e);
  return n;
}
function $n(t) {
  return t === "floor" ? "mdi:door-closed" : "mdi:door";
}
function ge(t) {
  return t.icon ?? $n(t.type);
}
function ne(t) {
  let e = !1;
  return t.map((n) => {
    const s = n.type === "outdoor" && n.open, i = s && n.default && !e;
    return i && (e = !0), { ...n, open: s, default: i };
  });
}
function wn(t, e = "Neue Tür", n = "outdoor") {
  return { key: Ue(fe(e), new Set(t.map((i) => i.key))), name: e, type: n, open: n === "outdoor", default: !1 };
}
function rt(t) {
  if (!Array.isArray(t) || t.length === 0)
    throw new Error('"doors" muss eine Liste mit mindestens einer Tür sein.');
  if (t.length > X) throw new Error(`Höchstens ${X} Türen möglich.`);
  const e = /* @__PURE__ */ new Set(), n = t.map((s, i) => {
    if (typeof s != "object" || s === null || typeof s.name != "string" || s.name.trim() === "")
      throw new Error(`Tür ${i + 1}: "name" fehlt.`);
    const r = s.type ?? "outdoor";
    if (r !== "outdoor" && r !== "floor")
      throw new Error(`Tür "${s.name}": "type" muss outdoor (Außentür) oder floor (Etagenruf) sein.`);
    const o = s.name.trim(), d = {
      key: Ue(fe(typeof s.id == "string" ? s.id : o), e),
      name: o,
      type: r,
      open: r === "outdoor" && s.open !== !1,
      default: s.default === !0
    };
    return typeof s.id == "string" && s.id.trim() !== "" && (d.id = s.id.trim()), typeof s.icon == "string" && s.icon.trim() !== "" && (d.icon = s.icon.trim()), d;
  });
  if (n.filter((s) => s.default).length > 1) throw new Error('Nur eine Tür kann "default: true" haben.');
  return ne(n);
}
function _n(t) {
  if (!Array.isArray(t)) return;
  const e = /* @__PURE__ */ new Set(), n = [];
  for (const s of t.slice(0, X)) {
    if (typeof s != "object" || s === null) continue;
    const i = s;
    if (typeof i.key != "string" || !/^[a-z0-9_]+$/.test(i.key) || e.has(i.key) || typeof i.name != "string" || i.type !== "outdoor" && i.type !== "floor") continue;
    e.add(i.key);
    const r = {
      key: i.key,
      name: i.name,
      type: i.type,
      open: i.open === !0,
      default: i.default === !0
    };
    typeof i.id == "string" && (r.id = i.id), typeof i.icon == "string" && (r.icon = i.icon), n.push(r);
  }
  return n.length > 0 ? ne(n) : void 0;
}
const An = /\[\s*([0-9a-f]{4}|[0-9a-f]{6})\s*(»|Â»|>>|>)\s*([0-9a-f]{4}|[0-9a-f]{6})\s*\]/i, kn = /^\s*,?\s*type\s*[:=]?\s*(?:0x)?([0-9a-f]{1,2})(?![0-9a-f])/i, xn = /^\s*,?\s*data\s*[:=]?\s*(.*?)\s*$/i, Sn = /((?:[0-9a-f]{2}[.:\s]){2,}[0-9a-f]{2})\s*(?:\(\s*(\d+)\s*\))?\s*$/i;
function zn(t) {
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
function Ct(t) {
  const e = (f) => ({ ok: !1, line: t, reason: f });
  if (typeof t != "string") return e("not a string");
  const n = An.exec(t);
  if (!n) return e("no address block");
  const [, s, i, r] = n, o = t.slice(n.index + n[0].length), d = kn.exec(o);
  if (!d) return e("no message type");
  const a = o.slice(d[0].length);
  let u = [];
  if (a.trim() !== "") {
    const f = xn.exec(a);
    if (!f) return e("unexpected text after type");
    const l = zn(f[1]);
    if (!l) return e("invalid data bytes");
    u = l;
  }
  const h = {
    src: parseInt(s, 16),
    dst: parseInt(r, 16),
    type: parseInt(d[1], 16),
    data: u,
    threeByte: s.length === 6 || r.length === 6,
    retransmission: i !== ">"
  }, p = Sn.exec(t.slice(0, n.index));
  return p && (h.raw = p[1].toUpperCase().replace(/[:\s]/g, "."), p[2] !== void 0 && (h.rawLength = parseInt(p[2], 10))), { ok: !0, frame: h };
}
const ot = 1, En = 10, at = 17, Dt = 13, Ot = 14, Se = 128, dt = [1, 129, 10, 17, 145], Tn = (t) => `Klingel „${t.name}“`, ze = (t) => `Öffnen „${t.name}“`, Q = (t, e) => t[e] ?? [], Ee = (t) => t.toString(16).toUpperCase().padStart(2, "0"), ue = (t) => `${t.src}|${t.dst}|${t.type}|${t.data.join(",")}`;
function Cn(t) {
  const e = (n) => n === void 0 ? "*" : n.toString(16);
  return `${Ee(t.type)}|${e(t.src)}|${e(t.dst)}|${t.data ? t.data.map(Ee).join("") : "*"}`;
}
function ye(t, e) {
  let n = null;
  for (const s of t)
    (!n || s[1] > n[1] || s[1] === n[1] && e && e(s[0], n[0]) < 0) && (n = s);
  return n;
}
function L(t, e, n = 1) {
  t.set(e, (t.get(e) ?? 0) + n);
}
function Dn(t, e) {
  let n = 0;
  const s = {};
  for (const [i, r] of Object.entries(t.steps))
    s[i] = r.captures.map(
      (o) => o.lines.flatMap((d) => {
        n++;
        const a = Ct(d.line);
        return a.ok ? [a.frame] : (e.push(d.line), []);
      })
    );
  return { steps: s, total: n };
}
function On(t, e, n) {
  const s = /* @__PURE__ */ new Map();
  for (const a of e.filter((u) => u.open))
    for (const u of Q(t, T(a)))
      for (const h of u)
        (h.type === Dt || h.type === Ot) && Ae(h.src, h.threeByte) && L(s, h.src);
  const i = (a, u) => a === n ? -1 : u === n ? 1 : a - u, r = ye(s, i);
  if (r) return { address: r[0], method: "open", count: r[1] };
  const o = /* @__PURE__ */ new Map();
  for (const a of Object.values(t))
    for (const u of a)
      for (const h of u)
        Ae(h.src, h.threeByte) && L(o, h.src), Ae(h.dst, h.threeByte) && h.dst !== h.src && L(o, h.dst);
  const d = ye(o, i);
  return d ? { address: d[0], method: "frequency", count: d[1] } : null;
}
function In(t, e, n) {
  const s = (i) => gn(i, e.threeByte) ? i : void 0;
  return t === "floor" ? e.type === at && e.src === n ? { type: e.type, src: e.src } : e.type === (at | Se) && e.dst === n ? { type: e.type, dst: e.dst } : null : e.type === ot && e.dst === n ? { type: e.type, src: e.src, dst: e.dst, outdoor: s(e.src) } : e.type === (ot | Se) && e.src === n ? { type: e.type, src: e.src, dst: e.dst, outdoor: s(e.dst) } : e.type === En && Et(e, n) ? { type: e.type, src: e.src, dst: e.dst, data: [...e.data], outdoor: s(e.src) } : null;
}
function Fn(t, e) {
  return e.score - t.score || dt.indexOf(t.type) - dt.indexOf(e.type) || (t.key < e.key ? -1 : t.key > e.key ? 1 : 0);
}
function It(t, e, n) {
  const s = t.session.steps[e]?.skipped === !0;
  t.warnings.push({
    code: s ? "step_skipped" : "step_missing",
    severity: "info",
    step: e,
    message: `${n}: ${s ? "übersprungen" : "keine Aufnahme vorhanden"}.`
  });
}
function Pn(t, e) {
  const n = E(e), s = Tn(e), i = Q(t.steps, n), r = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
  i.forEach((u, h) => {
    for (const p of u) {
      if (t.baseline.has(ue(p))) {
        t.stats.baselineFiltered++;
        continue;
      }
      if (!Ke(p, t.indoor)) {
        t.stats.neighbourFiltered++;
        continue;
      }
      const f = In(e.type, p, t.indoor);
      if (!f) {
        o.has(ue(p)) || o.set(ue(p), p);
        continue;
      }
      const l = Cn(f), m = r.get(l) ?? { match: f, in: /* @__PURE__ */ new Set() };
      m.in.add(h), r.set(l, m);
    }
  });
  const d = [...r].map(([u, { match: h, in: p }]) => ({
    key: u,
    ...h,
    occurrences: p.size,
    score: p.size / i.length,
    reliable: p.size === i.length
  }));
  d.sort(Fn);
  let a = d.filter((u) => u.reliable);
  if (i.length === 0)
    It(t, n, s);
  else if (d.length === 0)
    t.warnings.push({
      code: "no_ring_candidates",
      severity: "warning",
      step: n,
      message: `${s}: keine passenden Frames gefunden (erwartet: ${e.type === "floor" ? "Typ 11/91" : "Typ 01/81/0A"} mit Bezug zu ${$(t.indoor, t.threeByte)}).`
    });
  else {
    if (a.length === 0) {
      const u = d[0].score;
      a = d.filter((h) => h.score === u), t.warnings.push({
        code: "unstable_candidates",
        severity: "warning",
        step: n,
        message: `${s}: kein Kandidat kam in allen ${i.length} Aufnahmen vor; verwende die besten (${Math.round(u * 100)} %).`
      });
    }
    i.length === 1 && t.warnings.push({
      code: "single_capture",
      severity: "info",
      step: n,
      message: `${s}: nur eine Aufnahme – Stabilität nicht prüfbar. 2–3 Wiederholungen empfohlen.`
    });
  }
  return {
    door: e.key,
    captures: i.length,
    candidates: d,
    selected: a,
    outdoorAddress: Ft(a),
    otherFrames: [...o.values()]
  };
}
function Ft(t) {
  const e = /* @__PURE__ */ new Map();
  for (const n of t) n.outdoor !== void 0 && L(e, n.outdoor);
  return ye(e, (n, s) => n - s)?.[0];
}
function Bn(t, e, n) {
  const s = e.filter((a) => a.type === "outdoor" && n[a.key].selected.length > 0), i = /* @__PURE__ */ new Map();
  for (const a of s) for (const u of n[a.key].selected) L(i, u.key);
  const r = new Set([...i].filter(([, a]) => a > 1).map(([a]) => a)), o = (a) => n[a.key].selected.filter((u) => !r.has(u.key));
  let d = 0;
  for (let a = 0; a < s.length; a++)
    for (let u = a + 1; u < s.length; u++) {
      const [h, p] = [s[a], s[u]], f = n[h.key], l = n[p.key], m = new Set(l.selected.map((k) => k.key)), b = f.selected.some((k) => m.has(k.key)), y = f.outdoorAddress !== void 0 && f.outdoorAddress === l.outdoorAddress;
      !y && !(b && (o(h).length === 0 || o(p).length === 0)) || (d++, t.warnings.push({
        code: "doors_indistinguishable",
        severity: "warning",
        message: `„${h.name}“ und „${p.name}“ nicht unterscheidbar: beide Klingeln erzeugen dieselben Frames` + (y ? ` (Außenstation ${$(f.outdoorAddress, t.threeByte)})` : "") + ". Beide Klingel-Sensoren würden gemeinsam auslösen."
      }));
    }
  if (!(d > 0 || r.size === 0)) {
    for (const a of s) {
      const u = n[a.key];
      u.selected = o(a), u.outdoorAddress = Ft(u.selected);
    }
    t.warnings.push({
      code: "shared_candidates_removed",
      severity: "info",
      message: `${r.size} Kandidat(en) kamen bei mehreren Türen vor und wurden nicht verwendet.`
    });
  }
}
function Nn(t, e) {
  const n = T(e), s = ze(e), i = Q(t.steps, n);
  if (i.length === 0)
    return It(t, n, s), null;
  const r = /* @__PURE__ */ new Map();
  i.forEach((m, b) => {
    for (const y of m) {
      if (y.src !== t.indoor || y.type !== Dt && y.type !== Ot) continue;
      const k = `${y.dst}|${y.type}|${y.data.join(",")}`, x = r.get(k) ?? { frame: y, in: /* @__PURE__ */ new Set() };
      x.in.add(b), r.set(k, x);
    }
  });
  let o;
  for (const m of r.values()) (!o || m.in.size > o.in.size) && (o = m);
  if (!o)
    return t.warnings.push({
      code: "no_open_frame",
      severity: "warning",
      step: n,
      message: `${s}: kein 0D/0E-Frame von ${$(t.indoor, t.threeByte)} gefunden.`
    }), null;
  r.size > 1 && t.warnings.push({
    code: "multiple_open_frames",
    severity: "info",
    step: n,
    message: `${s}: ${r.size} verschiedene Öffnen-Frames gefunden, verwende den häufigsten.`
  }), o.in.size < i.length && t.warnings.push({
    code: "unstable_open",
    severity: "warning",
    step: n,
    message: `${s}: Öffnen-Frame nur in ${o.in.size} von ${i.length} Aufnahmen.`
  });
  const { frame: d } = o, a = {
    door: e.key,
    captures: i.length,
    destination: d.dst,
    messageType: d.type,
    data: [...d.data],
    occurrences: o.in.size,
    score: o.in.size / i.length
  }, u = d.type | Se, h = [...o.in].map((m) => i[m].filter((b) => b.type === u)), p = h.some((m) => m.some((b) => b.dst === t.indoor)), f = /* @__PURE__ */ new Map();
  for (const m of h) {
    const b = new Set(m.filter((y) => !p || y.dst === t.indoor).map((y) => y.src));
    for (const y of b) L(f, y);
  }
  const l = f.has(d.dst) ? [d.dst, f.get(d.dst)] : ye(f, (m, b) => m - b);
  return l ? a.confirmation = {
    source: l[0],
    messageType: u,
    occurrences: l[1],
    ...p ? { destination: t.indoor } : {}
  } : t.warnings.push({
    code: "no_confirmation",
    severity: "info",
    step: n,
    message: `${s}: keine Bestätigung (${Ee(u)}) gefunden – das Schloss meldet dann keinen Status.`
  }), a;
}
function Rn(t) {
  return { door: t.key, captures: 0, candidates: [], selected: [], otherFrames: [] };
}
function Mn(t, e = {}) {
  const n = [], { steps: s, total: i } = Dn(t, n), r = [], o = {
    totalLines: i,
    parsedFrames: i - n.length,
    unparsedLines: n,
    baselineFiltered: 0,
    neighbourFiltered: 0
  }, d = Object.values(s).flat(2), a = e.expectedApartment ?? le(t.dials), u = d.filter((v) => v.threeByte).length * 2 > d.length, h = a !== void 0 ? me(a, u) : void 0;
  n.length > 0 && r.push({
    code: "unparsed_lines",
    severity: "info",
    message: `${n.length} Zeile(n) konnten nicht als Frame gelesen werden.`
  });
  const p = e.indoorAddress ?? t.indoorAddress, f = p !== void 0 ? { address: p, method: "manual", count: 0 } : On(s, t.doors, h), l = {
    indoor: null,
    threeByte: u,
    rings: Object.fromEntries(t.doors.map((v) => [v.key, Rn(v)])),
    opens: Object.fromEntries(t.doors.filter((v) => v.open).map((v) => [v.key, null])),
    warnings: r,
    stats: o
  };
  if (!f)
    return r.push({
      code: "no_indoor",
      severity: "error",
      message: "Keine Innenstationsadresse (10XX / 0001XX) gefunden. Wurden Frames aufgenommen?"
    }), l;
  const m = d.filter((v) => Ke(v, f.address)), b = m.length > 0 ? m.some((v) => v.threeByte) : f.address > 65535 || u;
  f.method === "manual" && m.length === 0 && d.length > 0 && r.push({
    code: "manual_indoor_unseen",
    severity: "warning",
    message: `Die eingestellte Innenstation ${$(f.address, b)} kommt in keinem aufgenommenen Frame vor.`
  }), m.some((v) => v.threeByte !== b) && r.push({
    code: "mixed_address_length",
    severity: "warning",
    message: "Gemischte 2- und 3-Byte-Adressen gefunden – bitte Aufnahmen prüfen."
  }), l.threeByte = b;
  const y = { ...f };
  a !== void 0 && (y.expected = me(a, b), y.matchesExpected = y.expected === f.address, y.matchesExpected || r.push({
    code: "indoor_mismatch",
    severity: "warning",
    message: `Ermittelte Innenstation ${$(f.address, b)} weicht von der erwarteten Adresse ${$(y.expected, b)} (Wohnung ${a}) ab. Drehregler prüfen.`
  })), f.method === "frequency" && r.push({
    code: "indoor_by_frequency",
    severity: "info",
    message: `Innenstation ${z(f.address, b)} nur anhand der Häufigkeit bestimmt (kein Öffnen-Frame aufgenommen).`
  }), l.indoor = y;
  const k = {
    session: t,
    steps: s,
    indoor: f.address,
    threeByte: b,
    baseline: new Set(Q(s, M).flat().map(ue)),
    warnings: r,
    stats: o
  };
  Q(s, M).length === 0 && r.push({
    code: "no_baseline",
    severity: "info",
    step: M,
    message: "Keine Baseline aufgenommen – Frames einer normalen Sprechverbindung können nicht ausgefiltert werden."
  });
  for (const v of t.doors) l.rings[v.key] = Pn(k, v);
  Bn(k, t.doors, l.rings);
  const x = t.doors.filter((v) => v.open);
  for (const v of x) l.opens[v.key] = Nn(k, v);
  for (let v = 0; v < x.length; v++)
    for (let se = v + 1; se < x.length; se++) {
      const ie = l.opens[x[v].key], re = l.opens[x[se].key];
      ie && re && ie.destination === re.destination && ie.messageType === re.messageType && q(ie.data) === q(re.data) && r.push({
        code: "same_open_frame",
        severity: "warning",
        message: `${ze(x[v])} und ${ze(x[se])} senden denselben Frame – beide Schlösser würden dieselbe Tür öffnen.`
      });
    }
  return l;
}
var Ln = Object.defineProperty, Kn = Object.getOwnPropertyDescriptor, je = (t, e, n, s) => {
  for (var i = s > 1 ? void 0 : s ? Kn(e, n) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (i = (s ? o(e, n, i) : o(i)) || i);
  return s && i && Ln(e, n, i), i;
};
const Pt = "abb-welcome-wizard-card-editor", Hn = [
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
], Un = {
  entity: "Debug-Textsensor des ESP32",
  title: "Titel (optional)",
  capture_seconds: "Aufnahmedauer",
  indoor_address: "Innenstationsadresse (optional)"
}, jn = {
  entity: "Der Sensor, der jeden Bus-Frame anzeigt, z. B. „Doorbell Intercom“.",
  indoor_address: "Nur nötig, wenn die automatische Erkennung danebenliegt, z. B. 0x1010."
};
let ve = class extends R {
  setConfig(t) {
    this.config = t;
  }
  onValueChanged(t) {
    t.stopPropagation();
    const e = { ...this.config, ...t.detail.value };
    for (const n of ["title", "indoor_address", "capture_seconds"])
      (e[n] === "" || e[n] === void 0 || e[n] === null) && delete e[n];
    this.config = e, this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config: e }, bubbles: !0, composed: !0 })
    );
  }
  render() {
    return this.config ? c`
      <ha-form
        .hass=${this.hass}
        .data=${this.config}
        .schema=${Hn}
        .computeLabel=${(t) => Un[t.name] ?? t.name}
        .computeHelper=${(t) => jn[t.name]}
        @value-changed=${this.onValueChanged}
      ></ha-form>
      <p style="color:var(--secondary-text-color);font-size:0.875rem;margin:12px 0 0">
        Die Türen (Namen, Öffner, Standard-Tür) richtest du direkt in der Karte auf der Startseite ein.
      </p>
    ` : g;
  }
};
je([
  _()
], ve.prototype, "hass", 2);
je([
  _()
], ve.prototype, "config", 2);
ve = je([
  zt(Pt)
], ve);
const Wn = /* @__PURE__ */ new Set(["", "unknown", "unavailable"]);
function Bt(t, e) {
  if (t.event_type !== "state_changed" || t.data?.entity_id !== e) return null;
  const n = t.data.new_state?.state;
  return typeof n != "string" || Wn.has(n.trim()) ? null : { time: t.time_fired || (/* @__PURE__ */ new Date()).toISOString(), line: n };
}
function oe(t) {
  if (typeof t == "number")
    return Number.isInteger(t) && t > 0 && t <= 16777215 ? t : void 0;
  if (typeof t != "string") return;
  const e = t.trim().replace(/^0x/i, "");
  if (/^([0-9a-f]{4}|[0-9a-f]{6})$/i.test(e))
    return parseInt(e, 16);
}
const We = 6e3, G = 2e3;
function Vn(t, e, n, s) {
  return n ? { step: t, phase: "armed", armedAt: s, lines: [] } : {
    step: t,
    phase: "recording",
    armedAt: s,
    startedAt: new Date(s).toISOString(),
    endsAt: s + e * 1e3,
    lines: []
  };
}
function qn(t, e, n, s) {
  return t.phase === "armed" ? {
    ...t,
    phase: "recording",
    startedAt: new Date(s).toISOString(),
    endsAt: s + n * 1e3,
    lines: [e]
  } : { ...t, lines: [...t.lines, e] };
}
function Gn(t, e) {
  return t.phase === "recording" && t.endsAt !== void 0 && e >= t.endsAt && !t.missed;
}
function ct(t) {
  return { ...t, missed: !0, syncAfter: void 0 };
}
function lt(t, e) {
  return t.missed ? { ...t, syncAfter: e + We } : t;
}
function Yn(t, e) {
  const n = t.phase === "armed" ? t.armedAt : Date.parse(t.startedAt ?? ""), s = t.endsAt !== void 0 ? Math.min(e, t.endsAt + G) : e;
  return { start: (Number.isNaN(n) ? t.armedAt : n) - G, end: s };
}
function Zn(t, e) {
  const n = [...t];
  for (const s of e) {
    const i = Date.parse(s.time);
    n.some((r) => r.line === s.line && Math.abs(Date.parse(r.time) - i) < 1e3) || n.push(s);
  }
  return n.sort((s, i) => Date.parse(s.time) - Date.parse(i.time));
}
function Jn(t, e, n, s) {
  let i = t;
  if (i.phase === "armed") {
    const d = e.find((a) => Date.parse(a.time) >= i.armedAt - G);
    if (d) {
      const a = Date.parse(d.time);
      i = { ...i, phase: "recording", startedAt: d.time, endsAt: a + n * 1e3 };
    }
  }
  if (i.phase === "recording") {
    const d = Date.parse(i.startedAt ?? "") - G, a = (i.endsAt ?? s) + G, u = e.filter((h) => {
      const p = Date.parse(h.time);
      return p >= d && p <= a;
    });
    i = { ...i, lines: Zn(i.lines, u) };
  }
  const r = i.phase === "recording" && i.endsAt !== void 0 && s >= i.endsAt;
  return i.syncAfter !== void 0 && s >= i.syncAfter && (!r || s >= (i.endsAt ?? 0) + We) ? { ...i, missed: !1, syncAfter: void 0 } : i;
}
function Xn(t, e) {
  return (t?.[e] ?? []).flatMap((n) => {
    const s = Bt(
      {
        event_type: "state_changed",
        time_fired: new Date((n.lc ?? n.lu) * 1e3).toISOString(),
        data: {
          entity_id: e,
          old_state: null,
          new_state: {
            entity_id: e,
            state: n.s,
            last_changed: "",
            last_updated: "",
            attributes: {}
          }
        }
      },
      e
    );
    return s ? [s] : [];
  });
}
async function Qn(t, e, n, s) {
  const i = await t.sendMessagePromise({
    type: "history/history_during_period",
    start_time: new Date(n).toISOString(),
    end_time: new Date(s).toISOString(),
    entity_ids: [e],
    include_start_time_state: !1,
    significant_changes_only: !1,
    minimal_response: !1,
    no_attributes: !0
  });
  return Xn(i, e);
}
const Te = "abb-welcome-wizard-session", Ce = 2, es = Object.freeze({ skipped: !1, captures: [] }), ts = {
  baseline: M,
  ring_gate: E("tor"),
  ring_house: E("haustuer"),
  ring_apartment: E("wohnung"),
  open_gate: T("tor"),
  open_house: T("haustuer")
};
function ut(t, e = He, n = /* @__PURE__ */ new Date()) {
  const s = n.toISOString();
  return {
    format: Te,
    version: Ce,
    entity: t,
    createdAt: s,
    updatedAt: s,
    dials: {},
    doors: ne(e),
    steps: {}
  };
}
function S(t, e) {
  return t.steps[e] ?? es;
}
function we(t, e) {
  return { ...t, updatedAt: e.toISOString() };
}
function Ve(t, e, n, s) {
  return we({ ...t, steps: { ...t.steps, [e]: n(S(t, e)) } }, s);
}
function ns(t, e, n, s = /* @__PURE__ */ new Date()) {
  return Ve(t, e, (i) => ({ skipped: !1, captures: [...i.captures, n] }), s);
}
function ht(t, e, n, s = /* @__PURE__ */ new Date()) {
  return Ve(
    t,
    e,
    (i) => ({ ...i, captures: i.captures.filter((r, o) => o !== n) }),
    s
  );
}
function ss(t, e, n, s = /* @__PURE__ */ new Date()) {
  return Ve(t, e, (i) => ({ ...i, skipped: n }), s);
}
function pt(t, e, n = /* @__PURE__ */ new Date()) {
  const s = we({ ...t }, n);
  return e === void 0 ? delete s.indoorAddress : s.indoorAddress = e, s;
}
function is(t, e, n = /* @__PURE__ */ new Date()) {
  return we({ ...t, dials: { ...e } }, n);
}
function j(t, e, n = /* @__PURE__ */ new Date()) {
  const s = ne(e), i = /* @__PURE__ */ new Set([M]);
  for (const o of s)
    i.add(E(o)), o.open && i.add(T(o));
  const r = Object.fromEntries(Object.entries(t.steps).filter(([o]) => i.has(o)));
  return we({ ...t, doors: s, steps: r }, n);
}
function mt(t, e) {
  return S(t, E(e)).captures.length + S(t, T(e)).captures.length;
}
function rs(t) {
  const e = t.doors.flatMap(
    (s) => s.open && !s.default ? [E(s), T(s)] : [E(s)]
  );
  let n;
  for (const s of e)
    for (const i of S(t, s).captures) {
      const r = Date.parse(i.endedAt);
      !Number.isNaN(r) && (n === void 0 || r > n) && (n = r);
    }
  return n === void 0 ? void 0 : new Date(n);
}
function Nt(t) {
  return JSON.stringify(t, null, 2);
}
const B = (t) => typeof t == "object" && t !== null, ae = (t) => typeof t == "number" && Number.isInteger(t) ? t : void 0;
function os(t) {
  const e = Array.isArray(t.captures) ? t.captures : [];
  return {
    skipped: t.skipped === !0,
    captures: e.filter(B).map((n) => ({
      startedAt: String(n.startedAt ?? ""),
      endedAt: String(n.endedAt ?? ""),
      lines: (Array.isArray(n.lines) ? n.lines : []).filter(B).filter((s) => typeof s.line == "string").map((s) => ({ time: String(s.time ?? ""), line: s.line }))
    }))
  };
}
function Rt(t) {
  let e;
  try {
    e = JSON.parse(t);
  } catch {
    throw new Error("Datei ist kein gültiges JSON.");
  }
  if (!B(e) || e.format !== Te)
    throw new Error("Datei ist keine ABB-Welcome-Wizard-Sitzung.");
  if (e.version !== 1 && e.version !== Ce)
    throw new Error(`Nicht unterstützte Sitzungsversion: ${String(e.version)}.`);
  if (typeof e.entity != "string") throw new Error("Sitzung ohne Entität.");
  const n = e.version === 1, s = !n && _n(e.doors) || ne(He), i = {};
  for (const [d, a] of Object.entries(B(e.steps) ? e.steps : {})) {
    const u = n ? ts[d] : d;
    u && B(a) && (i[u] = os(a));
  }
  const r = B(e.dials) ? e.dials : {}, o = {
    format: Te,
    version: Ce,
    entity: e.entity,
    createdAt: String(e.createdAt ?? ""),
    updatedAt: String(e.updatedAt ?? ""),
    dials: { station: ae(r.station), x10: ae(r.x10), x1: ae(r.x1) },
    doors: s,
    steps: i
  };
  return ae(e.indoorAddress) !== void 0 && (o.indoorAddress = e.indoorAddress), { ...j(o, s), updatedAt: o.updatedAt };
}
const ft = 3, N = (t) => `„${t.name}“`;
function as(t, e) {
  const n = t.type === "floor";
  return {
    id: E(t),
    kind: "ring",
    door: t,
    title: `Klingeln: ${t.name}`,
    short: t.name,
    icon: ge(t),
    todo: [
      "Auf „Aufnahme starten“ tippen – die Aufnahme beginnt erst, wenn der erste Frame ankommt.",
      n ? `Den Klingeltaster an ${N(t)} (Etagenruf) drücken.` : `Zu ${N(t)} gehen und einmal klingeln. Nicht abheben, nicht öffnen.`,
      "Für eine zuverlässige Erkennung 2–3 Mal wiederholen (jeweils neue Aufnahme)."
    ],
    why: n ? "Der Etagenruf ist direkt an die Innenstation angeschlossen. Sie meldet ihn mit Typ 11 auf dem Bus, die Antwort hat Typ 91." : "Frames, die in jeder Wiederholung auftauchen, sind zuverlässige Kandidaten für den Klingel-Sensor." + (e > 1 ? " Jede Außentür hat in der Regel eine eigene Außenstation – darüber werden die Türen unterschieden." : ""),
    repetitions: 3,
    waitForFrame: !0,
    needsPause: !1
  };
}
function gt(t) {
  const e = {
    id: T(t),
    kind: "open",
    door: t,
    title: `Öffnen: ${t.name}`,
    short: `${t.name} öffnen`,
    icon: "mdi:key-variant",
    repetitions: 2,
    waitForFrame: !1
  };
  return t.default ? {
    ...e,
    todo: [
      "Einige Minuten nach dem letzten Klingeln warten.",
      "Auf „Aufnahme starten“ tippen.",
      `An der Innenstation die Schlüssel-Taste drücken – ${N(t)} wird dabei wirklich geöffnet.`
    ],
    why: `Ohne vorheriges Klingeln öffnet die Schlüssel-Taste die Standard-Außenstation (${N(t)}). Liegt das letzte Klingeln zu kurz zurück, würde sie noch die zuletzt rufende Tür öffnen.`,
    needsPause: !0
  } : {
    ...e,
    todo: [
      `An ${N(t)} klingeln (lassen).`,
      "Sofort danach auf „Aufnahme starten“ tippen.",
      `An der Innenstation die Schlüssel-Taste drücken – ${N(t)} wird dabei wirklich geöffnet.`
    ],
    why: "Nach einem Klingeln öffnet die Schlüssel-Taste die rufende Außenstation. Gesucht wird der Frame vom Typ 0D/0E deiner Innenstation und die Bestätigung 8D/8E.",
    needsPause: !1
  };
}
function ds(t) {
  const e = t.filter((s) => s.type === "outdoor").length, n = t.filter((s) => s.open);
  return [
    {
      id: M,
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
    ...t.map((s) => as(s, e)),
    // Doors opened after a doorbell first, the default door (needs a pause after ringing) last.
    ...n.filter((s) => !s.default).map(gt),
    ...n.filter((s) => s.default).map(gt)
  ];
}
const qe = (t) => `abb-welcome-wizard-card:session:${t}`;
function cs(t) {
  try {
    const e = window.localStorage.getItem(qe(t));
    return e ? Rt(e) : void 0;
  } catch {
    return;
  }
}
function ls(t) {
  try {
    window.localStorage.setItem(qe(t.entity), Nt(t));
  } catch {
  }
}
function us(t) {
  try {
    window.localStorage.removeItem(qe(t));
  } catch {
  }
}
const De = (t) => `abb-welcome-wizard-card:capture:${t}`;
function yt(t, e) {
  try {
    e ? window.localStorage.setItem(De(t), JSON.stringify(e)) : window.localStorage.removeItem(De(t));
  } catch {
  }
}
function hs(t) {
  try {
    const e = JSON.parse(window.localStorage.getItem(De(t)) ?? "null");
    if (e && typeof e.step == "string" && (e.phase === "armed" || e.phase === "recording") && typeof e.armedAt == "number" && Array.isArray(e.lines))
      return e;
  } catch {
  }
}
function vt(t, e, n) {
  const s = URL.createObjectURL(new Blob([e], { type: n })), i = document.createElement("a");
  i.href = s, i.download = t, document.body.appendChild(i), i.click(), i.remove(), setTimeout(() => URL.revokeObjectURL(s), 1e3);
}
async function ps(t) {
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
const ms = Ht`
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
`;
function Mt(t) {
  const e = Tt(t);
  return t.map((n) => ({
    door: n,
    id: `klingel_${e[n.key]}`,
    name: `Klingel ${n.name}`,
    icon: "mdi:bell"
  }));
}
function Lt(t) {
  const e = Tt(t);
  return t.filter((n) => n.open).map((n) => ({ door: n, id: e[n.key], name: n.name, icon: ge(n) }));
}
const Oe = "TÜRCODE – nicht öffentlich teilen!";
class fs {
  constructor() {
    this.lines = [];
  }
  line(e, n = "") {
    return this.lines.push(n === "" ? "" : " ".repeat(e) + n), this;
  }
  comment(e, n) {
    return this.line(e, `# ${n.replace(/[\r\n]+/g, " ")}`.trimEnd());
  }
  toString() {
    return this.lines.join(`
`) + `
`;
  }
}
function bt(t) {
  return `"${t.replace(/[\r\n]+/g, " ").replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
function Ie(t) {
  return t.toString(16).toUpperCase().padStart(2, "0");
}
function gs(t, e) {
  const n = [`(x.get_message_type() == ${V(t.type)})`];
  t.src !== void 0 && n.push(`(x.get_source_address() == ${$(t.src, e)})`), t.dst !== void 0 && n.push(`(x.get_destination_address() == ${$(t.dst, e)})`);
  let s = "";
  return t.data !== void 0 && (s = `std::vector<uint8_t> d = {${t.data.map(V).join(", ")}}; `, n.push("(x.get_data() == d)")), `'${s}return ${n.join(" && ")};'`;
}
function ys(t, e, n) {
  let s = `Typ ${Ie(t.type)}`;
  return t.src !== void 0 && t.dst !== void 0 ? s += `: ${z(t.src, n)} > ${z(t.dst, n)}` : t.src !== void 0 ? s += `, Quelle: ${z(t.src, n)}` : t.dst !== void 0 && (s += `, Ziel: ${z(t.dst, n)}`), t.data !== void 0 && (s += `, Data: ${t.data.map((i) => Ie(i)).join(" ")}`), `${s} (${t.occurrences}/${e} Aufnahmen)`;
}
function O(t, e, n, s, i) {
  t.line(e, `- ${n}.template.publish:`), t.line(e + 4, `id: ${s}`), t.line(e + 4, `state: ${i}`);
}
function $t(t, e, n, s) {
  O(t, e, "lock", n, "UNLOCKING"), t.line(e, `- delay: ${s}s`), O(t, e, "lock", n, "LOCKED");
}
function vs(t, e, n) {
  const { indoor: s, threeByte: i } = e;
  if (t.comment(0, "ABB-Welcome Wizard – generierte ESPHome-Konfiguration"), s) {
    const o = n.apartment !== void 0 ? `, Wohnung ${n.apartment}` : "";
    t.comment(0, `Innenstation: ${$(s.address, i)}${o}`);
  }
  t.comment(0, `Adresslänge: ${i ? "3 Byte (three_byte_address: true)" : "2 Byte"}`), t.comment(0, ""), t.comment(0, "Diese Abschnitte ersetzen die gleichnamigen Abschnitte der Demo-Firmware:"), t.comment(0, "esphome.on_boot, remote_receiver.on_abbwelcome, binary_sensor und lock."), t.comment(0, "Alle übrigen Einstellungen (wifi, api, ota, remote_transmitter, Pins von"), t.comment(0, "remote_receiver, text_sensor ...) unverändert lassen."), t.comment(0, ""), t.comment(0, "Voraussetzung (in der Demo-Firmware bereits gesetzt):"), t.comment(0, "esp32:"), t.comment(0, "  framework:"), t.comment(0, "    type: esp-idf"), Object.values(e.opens).some((o) => o !== null) && (t.comment(0, ""), t.comment(
    0,
    n.maskDoorCode ? "Türcodes sind durch Platzhalter ersetzt – vor dem Flashen die echten Werte eintragen!" : `ACHTUNG: "data" der Öffnen-Befehle ist euer ${Oe}`
  ));
  const r = e.warnings.filter((o) => o.severity !== "info");
  if (r.length > 0) {
    t.comment(0, "");
    for (const o of r) t.comment(0, `${o.severity === "error" ? "FEHLER" : "Warnung"}: ${o.message}`);
  }
  t.line(0);
}
function bs(t, e, n = {}) {
  const s = new fs(), { indoor: i, threeByte: r } = t, o = n.debugSensorId === void 0 ? "doorbell_intercom" : n.debugSensorId, d = n.unlockSeconds ?? 3;
  if (vs(s, t, n), !i)
    return s.comment(0, "Keine Innenstationsadresse ermittelt – es kann keine Konfiguration erzeugt werden."), s.toString();
  const a = Mt(e), u = Lt(e), h = a.filter((l) => (t.rings[l.door.key]?.selected.length ?? 0) > 0), p = u.map((l) => ({ ...l, open: t.opens[l.door.key] ?? null })).filter((l) => l.open !== null), f = [
    ...a.filter((l) => !h.includes(l)).map((l) => l.name),
    ...u.filter((l) => !t.opens[l.door.key]).map((l) => `Öffnen ${l.name}`)
  ];
  if (h.length + p.length > 0) {
    s.line(0, "esphome:"), s.line(2, "on_boot:");
    for (const l of h) O(s, 4, "binary_sensor", l.id, "OFF");
    for (const l of p) O(s, 4, "lock", l.id, "LOCKED");
    s.line(0);
  }
  s.line(0, "remote_receiver:"), s.comment(2, "pin, dump, filter, tolerance, idle, buffer_size ... aus der bestehenden Konfiguration"), s.line(2, "on_abbwelcome:"), s.line(4, "then:"), o && (s.comment(6, "Debug-Textsensor (id ggf. an eure Firmware anpassen)"), s.line(6, `- lambda: 'char buf[192]; x.format_to(buf, 192); id(${o}).publish_state(buf);'`));
  for (const l of h) {
    const m = t.rings[l.door.key], b = m.outdoorAddress !== void 0 ? ` – ${z(m.outdoorAddress, r)}` : "";
    s.comment(6, `${l.name}${b}`), s.line(6, "- if:"), s.line(10, "condition:"), s.line(12, "or:");
    for (const y of m.selected)
      s.comment(14, ys(y, m.captures, r)), s.line(14, `- lambda: ${gs(y, r)}`);
    s.line(10, "then:"), O(s, 12, "binary_sensor", l.id, "ON"), O(s, 12, "binary_sensor", l.id, "OFF");
  }
  for (const l of p) {
    const m = l.open.confirmation;
    m && (s.comment(6, `${l.name} geöffnet (Bestätigung Typ ${Ie(m.messageType)})`), s.line(6, "- if:"), s.line(10, "condition:"), s.line(12, "and:"), s.line(14, `- lambda: 'return (x.get_message_type() == ${V(m.messageType)});'`), s.line(
      14,
      `- lambda: 'return (x.get_source_address() == ${$(m.source, r)});'`
    ), m.destination !== void 0 && s.line(
      14,
      `- lambda: 'return (x.get_destination_address() == ${$(m.destination, r)});'`
    ), s.line(10, "then:"), $t(s, 12, l.id, d));
  }
  if (f.length > 0 && s.comment(6, `Nicht ermittelt: ${f.join(", ")}`), s.line(0), h.length > 0) {
    s.line(0, "binary_sensor:");
    for (const l of h)
      s.line(2, "- platform: template"), s.line(4, `name: ${bt(l.name)}`), s.line(4, `id: ${l.id}`), s.line(4, `icon: ${l.icon}`), s.line(4, "filters:"), s.line(6, "- delayed_off: 1s");
    s.line(0);
  }
  if (p.length > 0) {
    s.line(0, "lock:");
    for (const l of p) {
      const { open: m } = l, b = n.maskDoorCode ? m.data.map(() => 0) : m.data;
      s.line(2, "- platform: template"), s.line(4, `name: ${bt(l.name)}`), s.line(4, `id: ${l.id}`), s.line(4, `icon: ${l.icon}`), s.line(4, "lock_action:"), O(s, 6, "lock", l.id, "LOCKED"), s.line(4, "unlock_action:"), s.line(6, "- remote_transmitter.transmit_abbwelcome:"), s.line(10, `source_address: ${$(i.address, r)} # Innenstation`), s.line(
        10,
        `destination_address: ${$(m.destination, r)} # ${z(m.destination, r)}`
      ), s.line(10, `three_byte_address: ${r}`), s.line(
        10,
        `message_type: ${V(m.messageType)} # ${m.messageType === 14 ? "Schiebetür" : "Türöffner"}`
      );
      const y = n.maskDoorCode ? `PLATZHALTER: ${b.length} Byte ${Oe}` : Oe;
      s.line(10, `data: [${b.map(V).join(", ")}] # ${y}`), m.confirmation || (s.comment(6, "Keine Bestätigung vom Bus aufgenommen – Status wird nur angenommen"), $t(s, 6, l.id, d));
    }
  }
  return s.toString();
}
var $s = Object.defineProperty, ws = Object.getOwnPropertyDescriptor, A = (t, e, n, s) => {
  for (var i = s > 1 ? void 0 : s ? ws(e, n) : e, r = t.length - 1, o; r >= 0; r--)
    (o = t[r]) && (i = (s ? o(e, n, i) : o(i)) || i);
  return s && i && $s(e, n, i), i;
};
const ee = "abb-welcome-wizard-card", _s = "0.3.0", wt = 10, As = 40, ks = 900 * 1e3, xs = {
  info: "mdi:information-outline",
  warning: "mdi:alert-outline",
  error: "mdi:alert-circle-outline"
};
function xe(t) {
  const e = new Date(t);
  return Number.isNaN(e.getTime()) ? "--:--:--" : e.toLocaleTimeString("de-DE", { hour12: !1 });
}
const de = (t) => t.toString(16).toUpperCase().padStart(2, "0");
let w = class extends R {
  constructor() {
    super(...arguments), this.page = 0, this.live = [], this.capture = null, this.now = Date.now(), this.toast = "", this.maskDoorCode = !1, this.showDoorCode = !1, this.indoorInput = "", this.receivedCount = 0, this.syncing = !1, this.lastSyncAt = 0, this.syncFailed = !1, this.onVisibilityChange = () => {
      this.capture && (this.capture = document.visibilityState === "hidden" ? ct(this.capture) : lt(this.capture, Date.now()));
    };
  }
  // ---- Lovelace API --------------------------------------------------------------------------------
  static getConfigElement() {
    return document.createElement(Pt);
  }
  static getStubConfig(t) {
    return { entity: Object.keys(t?.states ?? {}).filter(
      (n) => n.startsWith("sensor.") && /intercom|abb|welcome|frame|doorbell/i.test(n)
    )[0] ?? "sensor.doorbell_intercom", capture_seconds: wt };
  }
  setConfig(t) {
    if (!t || typeof t.entity != "string" || !t.entity.includes("."))
      throw new Error('Bitte "entity" auf den Debug-Textsensor setzen, z. B. sensor.doorbell_intercom.');
    if (t.capture_seconds !== void 0 && (typeof t.capture_seconds != "number" || t.capture_seconds < 2 || t.capture_seconds > 120))
      throw new Error('"capture_seconds" muss eine Zahl zwischen 2 und 120 sein.');
    if (t.indoor_address !== void 0 && oe(t.indoor_address) === void 0)
      throw new Error('"indoor_address" muss eine Adresse wie 0x1010 oder 0x000110 sein.');
    t.doors !== void 0 && rt(t.doors);
    const e = this.config?.entity !== t.entity;
    this.config = t, e && (this.resubscribe(), this.session = cs(t.entity) ?? ut(t.entity, this.configDoors), this.indoorInput = this.session.indoorAddress !== void 0 ? $(this.session.indoorAddress, this.session.indoorAddress > 65535) : "", this.live = [], this.capture = null, this.resumeCapture(t.entity));
  }
  getCardSize() {
    return 10;
  }
  set hass(t) {
    const e = !this._hass, n = this.online;
    this._hass = t, this.capture && n !== this.online && (this.capture = this.online ? lt(this.capture, Date.now()) : ct(this.capture)), e && this.subscribe(), this.requestUpdate();
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
  updated(t) {
    this.session && this.page > this.resultPage && (this.page = this.resultPage), t.has("page") && t.get("page") !== void 0 && this.renderRoot.querySelector(".stepper .current")?.scrollIntoView?.({ block: "nearest", inline: "center", behavior: "smooth" }), t.has("capture") && (this.capture ? this.startTimer() : this.stopTimer(), this.config && yt(this.config.entity, this.capture));
  }
  // ---- Event subscription (read-only: the card never calls services or sends frames) ---------------
  subscribe() {
    this.unsubscribe || !this._hass?.connection || !this.config || !this.isConnected || (this.unsubscribe = this._hass.connection.subscribeEvents((t) => this.onStateChanged(t), "state_changed").catch((t) => {
      console.error(`${ee}: subscribing to state_changed failed`, t), this.unsubscribe = void 0;
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
    const e = Bt(t, this.config.entity);
    e && (this.receivedCount++, this.live = [e, ...this.live].slice(0, As), this.capture && (this.capture = qn(this.capture, e, this.captureSeconds, Date.now())));
  }
  // ---- Capture -------------------------------------------------------------------------------------
  get captureSeconds() {
    return this.config?.capture_seconds ?? wt;
  }
  startTimer() {
    this.timer === void 0 && (this.timer = window.setInterval(() => {
      this.now = Date.now(), this.capture && (this.capture.missed ? this.syncFromHistory() : Gn(this.capture, this.now) && this.finishCapture());
    }, 250));
  }
  stopTimer() {
    this.timer !== void 0 && window.clearInterval(this.timer), this.timer = void 0;
  }
  beginCapture(t) {
    const e = this.currentStep;
    e && (this.now = Date.now(), this.syncFailed = !1, this.capture = Vn(e.id, this.captureSeconds, t, this.now));
  }
  /** Fill in frames missed while offline from the recorder history (read-only). */
  async syncFromHistory() {
    const t = this.capture, e = Date.now();
    if (!(!t?.missed || t.syncAfter === void 0 || !this.online || !this._hass?.connection || !this.config || this.syncing || e - this.lastSyncAt < 2e3)) {
      this.syncing = !0, this.lastSyncAt = e;
      try {
        const { start: n, end: s } = Yn(t, e), i = await Qn(this._hass.connection, this.config.entity, n, s);
        this.capture?.armedAt === t.armedAt && (this.capture = Jn(this.capture, i, this.captureSeconds, Date.now()));
      } catch (n) {
        console.warn(`${ee}: reading history failed`, n), this.capture?.armedAt === t.armedAt && !this.syncFailed && (this.syncFailed = !0, this.capture = { ...this.capture, missed: !1, syncAfter: void 0 }, this.showToast("Verpasste Frames konnten nicht aus dem Verlauf geladen werden."));
      } finally {
        this.syncing = !1;
      }
    }
  }
  /** Continue a capture that was interrupted by reloading the page or app. */
  resumeCapture(t) {
    const e = hs(t);
    if (!e) return;
    const n = this.steps.findIndex((s) => s.id === e.step);
    if (n < 0 || Date.now() - e.armedAt > ks) {
      yt(t, null);
      return;
    }
    this.page = n + 1, this.capture = { ...e, missed: !0, syncAfter: Date.now() + We }, this.showToast("Unterbrochene Aufnahme wird fortgesetzt.");
  }
  finishCapture() {
    const t = this.capture;
    if (this.capture = null, !t || t.phase !== "recording") return;
    const e = Math.min(Date.now(), t.endsAt ?? Date.now());
    this.updateSession(
      ns(this.session, t.step, {
        startedAt: t.startedAt ?? (/* @__PURE__ */ new Date()).toISOString(),
        endedAt: new Date(e).toISOString(),
        lines: t.lines
      })
    ), this.showToast(
      t.lines.length > 0 ? `Aufnahme gespeichert (${t.lines.length} Frames).` : "Aufnahme gespeichert – es kamen keine Frames an."
    );
  }
  cancelCapture() {
    this.capture = null;
  }
  // ---- Session -------------------------------------------------------------------------------------
  updateSession(t) {
    this.session = t, ls(t);
  }
  /** Doors from the card config (`doors:`), otherwise the default gate / house door / apartment setup. */
  get configDoors() {
    return this.config?.doors !== void 0 ? rt(this.config.doors) : [...He];
  }
  get steps() {
    return this.stepsCache?.doors !== this.session.doors && (this.stepsCache = { doors: this.session.doors, steps: ds(this.session.doors) }), this.stepsCache.steps;
  }
  /** Page 0 is the start page, 1..steps.length are the recording steps, the last page is the result. */
  get resultPage() {
    return this.steps.length + 1;
  }
  get configIndoor() {
    return oe(this.config?.indoor_address);
  }
  get result() {
    const t = this.session.indoorAddress ?? this.configIndoor, e = this.analysisCache;
    if (e && e.session === this.session && e.indoor === t) return e.result;
    const n = Mn(this.session, { indoorAddress: t });
    return this.analysisCache = { session: this.session, indoor: t, result: n }, n;
  }
  /** Address used to highlight own frames: detected, manual or expected from the dials. */
  get highlightAddress() {
    const t = this.result.indoor?.address;
    if (t !== void 0) return t;
    const e = le(this.session.dials);
    return e !== void 0 ? me(e, !1) : void 0;
  }
  exportSession() {
    const t = (/* @__PURE__ */ new Date()).toISOString().slice(0, 16).replace(/[:T]/g, "-");
    vt(`abb-welcome-session-${t}.json`, Nt(this.session), "application/json");
  }
  importSession() {
    this.renderRoot.querySelector("#import")?.click();
  }
  async onImportFile(t) {
    const e = t.target, n = e.files?.[0];
    if (e.value = "", !(!n || !this.config))
      try {
        const s = Rt(await n.text());
        this.updateSession({ ...s, entity: this.config.entity }), this.indoorInput = s.indoorAddress !== void 0 ? $(s.indoorAddress, s.indoorAddress > 65535) : "", this.page = this.resultPage, this.showToast("Sitzung importiert.");
      } catch (s) {
        this.showToast(s instanceof Error ? s.message : String(s));
      }
  }
  resetSession() {
    this.config && window.confirm("Alle Aufnahmen dieser Sitzung löschen und neu beginnen?") && (us(this.config.entity), this.updateSession(ut(this.config.entity, this.configDoors)), this.indoorInput = "", this.capture = null, this.page = 0);
  }
  onDialInput(t, e) {
    const n = e.target.value, s = n === "" ? void 0 : Number(n);
    this.updateSession(
      is(this.session, {
        ...this.session.dials,
        [t]: s !== void 0 && Number.isInteger(s) ? s : void 0
      })
    );
  }
  onIndoorInput(t) {
    this.indoorInput = t.target.value;
    const e = this.indoorInput.trim();
    if (e === "") this.updateSession(pt(this.session, void 0));
    else {
      const n = oe(e);
      n !== void 0 && this.updateSession(pt(this.session, n));
    }
  }
  updateDoor(t, e) {
    let n = this.session.doors.map((s) => s.key === t ? { ...s, ...e } : s);
    e.default && (n = n.map((s) => s.key === t ? s : { ...s, default: !1 })), this.updateSession(j(this.session, n));
  }
  renameDoor(t, e) {
    const n = e.target, s = n.value.trim();
    s === "" ? n.value = t.name : s !== t.name && this.updateDoor(t.key, { name: s });
  }
  addDoor() {
    this.session.doors.length >= X || this.updateSession(j(this.session, [...this.session.doors, wn(this.session.doors)]));
  }
  removeDoor(t) {
    if (this.session.doors.length <= 1) return;
    const e = mt(this.session, t);
    e > 0 && !window.confirm(`„${t.name}“ und ${e} Aufnahme(n) dieser Tür löschen?`) || this.updateSession(
      j(
        this.session,
        this.session.doors.filter((n) => n.key !== t.key)
      )
    );
  }
  resetDoors() {
    const t = this.configDoors, e = this.session.doors.filter((n) => !t.some((s) => s.key === n.key)).reduce((n, s) => n + mt(this.session, s), 0);
    e > 0 && !window.confirm(`Dabei gehen ${e} Aufnahme(n) entfernter Türen verloren. Fortfahren?`) || this.updateSession(j(this.session, t));
  }
  showToast(t) {
    this.toast = t, window.clearTimeout(this.toastTimer), this.toastTimer = window.setTimeout(() => this.toast = "", 4e3);
  }
  // ---- Navigation ----------------------------------------------------------------------------------
  get currentStep() {
    const t = this.steps;
    return this.page >= 1 && this.page <= t.length ? t[this.page - 1] : void 0;
  }
  goTo(t) {
    this.capture || (this.page = Math.max(0, Math.min(this.resultPage, t)), this.waitForFrame = void 0);
  }
  skipStep() {
    const t = this.currentStep;
    t && this.updateSession(ss(this.session, t.id, !0)), this.goTo(this.page + 1);
  }
  // ---- Rendering -----------------------------------------------------------------------------------
  render() {
    return !this.config || !this.session ? g : c`
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
          ${this.capture ? g : this.renderConnectionStatus()}
          ${this.page === 0 ? this.renderStart() : this.page >= this.resultPage ? this.renderResult() : this.renderStep(this.steps[this.page - 1])}
        </div>
        ${this.renderFooter()}
      </ha-card>
    `;
  }
  renderStepper() {
    const t = [
      { label: "Start", icon: "mdi:play", status: "" },
      ...this.steps.map((e) => {
        const n = S(this.session, e.id), s = n.captures.length > 0 ? "done" : n.skipped ? "skipped" : "";
        return { label: e.short, icon: s === "done" ? "mdi:check" : e.icon, status: s };
      }),
      { label: "Ergebnis", icon: "mdi:file-code-outline", status: "" }
    ];
    return c`
      <nav class="stepper" aria-label="Schritte">
        ${t.map(
      (e, n) => c`
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
    const t = this.currentStep, e = t ? S(this.session, t.id).captures.length > 0 : !1;
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
        ${this.toast ? c`<span class="toast" role="status">${this.toast}</span>` : g}
        <span class="spacer"></span>
        ${t && !e ? c`<button class="btn text" ?disabled=${!!this.capture} @click=${this.skipStep}>
                Überspringen
              </button>` : g}
        ${this.page < this.resultPage ? c`<button
                class="btn ${!t || e ? "primary" : ""}"
                ?disabled=${!!this.capture}
                @click=${() => this.goTo(this.page + 1)}
              >
                ${this.page === this.steps.length ? "Auswerten" : "Weiter"}<ha-icon
                  icon="mdi:chevron-right"
                ></ha-icon>
              </button>` : g}
      </div>
    `;
  }
  // ---- Start page ----------------------------------------------------------------------------------
  renderStart() {
    const t = this.config.entity, e = this.hass?.states[t], n = le(this.session.dials), s = this.result.threeByte, i = n !== void 0 ? me(n, s) : void 0, r = this.indoorInput.trim() !== "" && oe(this.indoorInput) === void 0, o = this.configIndoor;
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
        ${e ? c`<div class="callout ${this.receivedCount > 0 ? "ok" : "info"}">
                <ha-icon
                  icon=${this.receivedCount > 0 ? "mdi:check-circle-outline" : "mdi:timer-sand"}
                ></ha-icon>
                <span>
                  <b>${e.attributes.friendly_name ?? t}</b> gefunden.
                  ${this.receivedCount > 0 ? c`${this.receivedCount} Frame(s) seit dem Öffnen der Karte empfangen.` : c`Noch keine neuen Frames – drück zum Test kurz eine Taste an der Innenstation.`} <br /><span class="muted small">Letzter Wert: <code>${e.state}</code></span>
                </span>
              </div>` : c`<div class="callout error">
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
                Wohnung <b>${n}</b> → erwartete Innenstationsadresse
                <span class="badge accent">${$(i, s)}</span>
              </p>` : g}
      </div>

      <details ?open=${o !== void 0 || this.session.indoorAddress !== void 0}>
        <summary>Innenstationsadresse manuell festlegen (für Profis)</summary>
        <div class="panel" style="border:none;padding:0">
          <p class="muted small">
            Normalerweise ermittelt der Assistent die Adresse selbst. Falls du sie kennst oder die Erkennung
            danebenliegt, kannst du sie hier
            vorgeben${o !== void 0 ? c` (Karten-Konfiguration:
                    <code>${$(o, o > 65535)}</code>)` : g}.
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
    const t = this.session.doors;
    return c`
      <div class="panel">
        <h3>3 · Türen deiner Anlage</h3>
        <p class="muted small">
          Für jede Tür gibt es einen Klingel-Schritt, für Türen mit Öffner zusätzlich einen Öffnen-Schritt.
          Namen frei wählbar – sie werden auch für die Sensoren und Schlösser in ESPHome verwendet.
        </p>
        <div class="doors">
          ${t.map(
      (e) => c`
              <div class="door-row">
                <div class="door-main">
                  <ha-icon icon=${ge(e)}></ha-icon>
                  <input
                    type="text"
                    aria-label="Name der Tür"
                    maxlength="40"
                    .value=${e.name}
                    @change=${(n) => this.renameDoor(e, n)}
                  />
                  <button
                    class="icon"
                    title="Tür entfernen"
                    ?disabled=${t.length <= 1}
                    @click=${() => this.removeDoor(e)}
                  >
                    <ha-icon icon="mdi:delete-outline"></ha-icon>
                  </button>
                </div>
                <div class="door-options">
                  <select
                    aria-label="Art der Klingel"
                    .value=${e.type}
                    @change=${(n) => this.updateDoor(e.key, {
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
                      .checked=${e.open}
                      ?disabled=${e.type === "floor"}
                      @change=${(n) => this.updateDoor(e.key, { open: n.target.checked })}
                    />Türöffner
                  </label>
                  <label
                    class="switch"
                    title="Öffnet sich mit der Schlüssel-Taste auch ohne vorheriges Klingeln"
                  >
                    <input
                      type="checkbox"
                      .checked=${e.default}
                      ?disabled=${!e.open}
                      @change=${(n) => this.updateDoor(e.key, { default: n.target.checked })}
                    />Standard-Tür
                  </label>
                </div>
              </div>
            `
    )}
        </div>
        <div class="actions">
          <button class="btn" ?disabled=${t.length >= X} @click=${this.addDoor}>
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
    const t = this.session.doors.filter((e) => !e.open).map((e) => `„${e.name}“`);
    return t.length === 0 ? g : c`<p class="muted small">Ohne elektrischen Öffner (nur Klingel): ${t.join(", ")}.</p>`;
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
  renderLive(t, e = this.live) {
    const n = this.live.length > 0;
    return c`
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
    if (t.length === 0) return c`<div class="empty">${e}</div>`;
    const n = this.highlightAddress;
    return c`
      <div class="frames" role="log">
        ${t.map((s) => {
      const i = Ct(s.line);
      if (!i.ok)
        return c`<div class="frame unparsed" title="Nicht erkannt">
              <span class="time">${xe(s.time)}</span><span class="route">?</span
              ><span class="detail">${s.line}</span>
            </div>`;
      const r = i.frame, o = n !== void 0 && Ke(r, n);
      return c`<div class="frame ${n === void 0 ? "" : o ? "own" : "foreign"}" title=${s.line}>
            <span class="time">${xe(s.time)}</span>
            <span class="route"
              >${ke(r.src, r.threeByte)} ${r.retransmission ? "»" : "›"}
              ${ke(r.dst, r.threeByte)}</span
            >
            <span class="detail"
              ><span class="type">${de(r.type)}</span>${r.data.length ? c` · ${q(r.data)}` : g}</span
            >
          </div>`;
    })}
      </div>
    `;
  }
  // ---- Recording step ------------------------------------------------------------------------------
  renderStep(t) {
    const n = S(this.session, t.id).captures.length;
    return c`
      <h2><ha-icon icon=${t.icon}></ha-icon>${t.title}</h2>
      <ol class="todo">
        ${t.todo.map((s) => c`<li>${s}</li>`)}
      </ol>
      <details>
        <summary>Warum?</summary>
        <p class="small">${t.why}</p>
      </details>
      ${t.needsPause ? this.renderPauseHint() : g}
      ${t.kind === "open" ? c`<div class="callout warning">
              <ha-icon icon="mdi:door-open"></ha-icon>
              <span
                >Die Tür öffnet sich bei diesem Schritt tatsächlich – nur ausführen, wenn das in Ordnung
                ist.</span
              >
            </div>` : g}

      <div class="panel">
        ${this.capture ? this.renderActiveCapture() : this.renderCaptureControls(t, n)}
      </div>

      ${n > 0 ? this.renderCaptures(t) : g}
      ${n > 0 ? this.renderStepFeedback(t) : g}
      ${this.capture ? this.renderLive("Frames dieser Aufnahme", [...this.capture.lines].reverse()) : this.renderLive("Live-Frames")}
    `;
  }
  renderPauseHint() {
    const t = rs(this.session);
    if (!t) return c``;
    const e = (this.now - t.getTime()) / 6e4, n = e >= ft;
    return c`<div class="callout ${n ? "ok" : "warning"}">
      <ha-icon icon="mdi:timer-outline"></ha-icon>
      <span
        >Letztes Klingeln vor
        ${e < 1 ? "weniger als einer Minute" : `${Math.floor(e)} Minute(n)`}.
        ${n ? "Passt – die Schlüssel-Taste öffnet jetzt die Standard-Außenstation." : `Bitte noch etwas warten (mindestens ${ft} Minuten).`}</span
      >
    </div>`;
  }
  renderCaptureControls(t, e) {
    const n = this.captureSeconds, s = this.waitForFrame ?? t.waitForFrame;
    return c`
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
    return c`<span class="reps" title="${t} von ${e} empfohlenen Aufnahmen">
      ${Array.from({ length: n }, (s, i) => c`<span class=${i < t ? "filled" : ""}></span>`)}
    </span>`;
  }
  renderConnectionStatus() {
    return this.online ? this.capture?.missed ? c`<div class="callout info" role="status">
        <ha-icon icon="mdi:history"></ha-icon>
        <span>Verbindung wieder da – verpasste Frames werden aus dem Verlauf nachgeladen …</span>
      </div>` : g : c`<div class="callout warning" role="status">
        <ha-icon icon="mdi:wifi-off"></ha-icon>
        <span
          >Keine Verbindung zu Home
          Assistant.${this.capture ? " Mach einfach weiter – Home Assistant zeichnet die Frames trotzdem auf. Sobald die Verbindung zurück ist, holt die Karte sie aus dem Verlauf nach." : " Live-Frames sind pausiert."}</span
        >
      </div>`;
  }
  renderActiveCapture() {
    const t = this.capture;
    if (t.phase === "armed")
      return c`${this.renderConnectionStatus()}
        <div class="capture">
          <div class="pulse"><ha-icon icon="mdi:bell-ring-outline"></ha-icon></div>
          <div style="flex:1">
            <b>Bereit – jetzt klingeln bzw. Taste drücken.</b>
            <p class="muted small">Die Aufnahme startet automatisch mit dem ersten Frame.</p>
          </div>
          <button class="btn text" @click=${this.cancelCapture}>Abbrechen</button>
        </div>`;
    const e = this.captureSeconds * 1e3, n = Math.max(0, (t.endsAt ?? this.now) - this.now), s = 2 * Math.PI * 32, i = n === 0 && t.missed;
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
              stroke-dasharray=${s}
              stroke-dashoffset=${s * (1 - n / e)}
            ></circle>
          </svg>
          <div class="value">${Math.ceil(n / 1e3)}</div>
        </div>
        <div style="flex:1">
          <b>${i ? "Aufnahme wird vervollständigt …" : "Aufnahme läuft …"}</b>
          <p class="muted small">${t.lines.length} Frame(s) empfangen</p>
        </div>
        <button class="btn" @click=${this.finishCapture}>Jetzt beenden</button>
      </div>`;
  }
  renderCaptures(t) {
    const e = S(this.session, t.id).captures;
    return c`
      <div class="captures">
        <div class="actions">
          <h3 style="margin:0;flex:1">Aufnahmen</h3>
          <button
            class="btn text danger"
            @click=${() => this.updateSession(ht(this.session, t.id, e.length - 1))}
          >
            <ha-icon icon="mdi:undo"></ha-icon>Verwerfen
          </button>
        </div>
        ${e.map(
      (n, s) => c`
            <details class="capture-row">
              <summary>
                <ha-icon icon="mdi:chevron-right"></ha-icon>
                <span class="grow">Aufnahme ${s + 1} · ${xe(n.startedAt)}</span>
                <span class="badge ${n.lines.length ? "" : "warning"}">${n.lines.length} Frames</span>
                <button
                  class="icon"
                  title="Diese Aufnahme löschen"
                  @click=${(i) => {
        i.preventDefault(), this.updateSession(ht(this.session, t.id, s));
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
      return c`<div class="callout info">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        <span>Innenstation noch nicht erkannt – sie ergibt sich spätestens aus den Öffnen-Schritten.</span>
      </div>`;
    if (t.kind === "baseline" || !t.door)
      return c`<div class="callout ok">
        <ha-icon icon="mdi:check-circle-outline"></ha-icon>
        <span
          >${S(this.session, t.id).captures.flatMap((s) => s.lines).length} Frames als Baseline
          markiert.</span
        >
      </div>`;
    if (t.kind === "ring") {
      const s = e.rings[t.door.key];
      return s.candidates.length > 0 ? c`<div class="panel">
            <h3>Erkannt</h3>
            ${this.renderCandidates(s)}
          </div>` : c`<div class="callout warning">
            <ha-icon icon="mdi:alert-outline"></ha-icon>
            <span
              >Noch keine passenden Klingel-Frames für
              ${z(e.indoor.address, e.threeByte)}.</span
            >
          </div>`;
    }
    const n = e.opens[t.door.key];
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
    const t = this.result, { indoor: e, threeByte: n } = t, s = le(this.session.dials), i = bs(t, this.session.doors, { maskDoorCode: this.maskDoorCode, apartment: s });
    return Object.values(this.session.steps).some((o) => o.captures.length > 0) ? c`
      <h2><ha-icon icon="mdi:file-code-outline"></ha-icon>Ergebnis</h2>

      <div class="grid">
        <div class="panel stat">
          <span class="muted small">Innenstation</span>
          <span class="value">${e ? $(e.address, n) : "—"}</span>
          ${e ? c`<span class="small">
                  ${e.method === "manual" ? c`<span class="badge accent">manuell</span>` : e.method === "open" ? c`<span class="badge ok">aus Öffnen-Frames</span>` : c`<span class="badge warning">nach Häufigkeit</span>`}
                  ${e.expected !== void 0 ? e.matchesExpected ? c`<span class="badge ok"
                            ><ha-icon icon="mdi:check"></ha-icon>passt zu Wohnung ${s}</span
                          >` : c`<span class="badge warning"
                            >erwartet ${$(e.expected, n)} (Wohnung
                            ${s})</span
                          >` : g}
                </span>` : g}
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
        ${Mt(this.session.doors).map((o) => {
      const d = t.rings[o.door.key], a = d.selected.length > 0;
      return c`<div class="result-row">
            <ha-icon icon=${ge(o.door)}></ha-icon>
            <div>
              <div class="row-head">
                <b>${o.name}</b>
                ${d.outdoorAddress !== void 0 ? c`<span class="muted small"
                        >${z(d.outdoorAddress, n)}</span
                      >` : g}
                <span class="spacer"></span>
                ${a ? c`<span class="badge ok">binary_sensor.${o.id}</span>` : c`<span class="badge ${d.captures ? "warning" : ""}"
                        >${d.captures ? "nicht erkannt" : "nicht aufgenommen"}</span
                      >`}
              </div>
              ${d.candidates.length > 0 ? this.renderCandidates(d) : g}
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
        ${Lt(this.session.doors).map((o) => {
      const d = t.opens[o.door.key], a = S(this.session, T(o.door)).captures.length > 0;
      return c`<div class="result-row">
            <ha-icon icon=${o.icon}></ha-icon>
            <div>
              <div class="row-head">
                <b>${o.name}</b>
                <span class="spacer"></span>
                ${d ? c`<span class="badge ok">lock.${o.id}</span>` : c`<span class="badge ${a ? "warning" : ""}"
                        >${a ? "nicht erkannt" : "nicht aufgenommen"}</span
                      >`}
              </div>
              ${d ? this.renderOpen(d) : g}
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
              @change=${(o) => this.maskDoorCode = o.target.checked}
            />Türcode maskieren
          </label>
        </h3>
        <p class="muted small">
          In der ESPHome-Konfiguration deines ESP32 die gleichnamigen Abschnitte der Demo-Firmware ersetzen
          und per OTA installieren.
          ${this.maskDoorCode ? "Türcodes sind durch Platzhalter ersetzt – gut zum Teilen in Foren." : c`<b>Enthält deinen Türcode – nicht öffentlich teilen.</b>`}
        </p>
        <div class="actions">
          <button class="btn primary" @click=${() => this.copyYaml(i)}>
            <ha-icon icon="mdi:content-copy"></ha-icon>Kopieren
          </button>
          <button class="btn" @click=${() => vt("abb-welcome.yaml", i, "text/yaml")}>
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
        ${t.stats.unparsedLines.length > 0 ? c`<p class="small">${t.stats.unparsedLines.length} nicht erkannte Zeile(n):</p>
                <div class="frames">
                  ${t.stats.unparsedLines.map((o) => c`<div class="frame unparsed"><span></span><span></span><span>${o}</span></div>`)}
                </div>` : c`<p class="small muted">Alle Zeilen wurden erkannt.</p>`}
      </details>
      ${this.renderLimitations()}
    ` : c`<h2><ha-icon icon="mdi:file-code-outline"></ha-icon>Ergebnis</h2>
        <div class="callout info">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          <span>Noch keine Aufnahmen. Geh die Schritte durch oder importiere eine gespeicherte Sitzung.</span>
        </div>`;
  }
  async copyYaml(t) {
    this.showToast(
      await ps(t) ? "YAML kopiert." : "Kopieren nicht möglich – bitte manuell markieren."
    );
  }
  renderWarnings(t) {
    const e = ["error", "warning", "info"], n = [...t.warnings].sort(
      (r, o) => e.indexOf(r.severity) - e.indexOf(o.severity)
    );
    if (n.length === 0)
      return c`<div class="callout ok">
        <ha-icon icon="mdi:check-circle-outline"></ha-icon><span>Keine Auffälligkeiten.</span>
      </div>`;
    const s = n.filter((r) => r.severity !== "info"), i = n.filter((r) => r.severity === "info");
    return c`
      ${s.length === 0 ? c`<div class="callout ok">
              <ha-icon icon="mdi:check-circle-outline"></ha-icon><span>Keine Probleme gefunden.</span>
            </div>` : g}
      ${s.map(
      (r) => c`<div class="callout ${r.severity}">
            <ha-icon icon=${xs[r.severity]}></ha-icon><span>${r.message}</span>
          </div>`
    )}
      ${i.length > 0 ? c`<details>
              <summary>${i.length} Hinweis(e)</summary>
              <ul class="small" style="margin:0;padding-left:1.2em;line-height:1.5">
                ${i.map((r) => c`<li>${r.message}</li>`)}
              </ul>
            </details>` : g}
    `;
  }
  renderCandidates(t) {
    const { threeByte: e } = this.result, n = new Set(t.selected.map((i) => i.key)), s = (i) => {
      const r = (d) => ke(d, e), o = i.src !== void 0 && i.dst !== void 0 ? `${r(i.src)} › ${r(i.dst)}` : i.src !== void 0 ? `von ${r(i.src)}` : i.dst !== void 0 ? `an ${r(i.dst)}` : "";
      return `Typ ${de(i.type)} ${o}${i.data ? ` · ${q(i.data)}` : ""}`;
    };
    return c`<div class="candidates">
      ${t.candidates.map(
      (i) => c`<div
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
    const { threeByte: e } = this.result, n = this.showDoorCode ? q(t.data) : t.data.map(() => "••").join(" ");
    return c`<dl class="kv" style="margin:6px 0 0">
      <dt>Ziel</dt>
      <dd>${z(t.destination, e)}</dd>
      <dt>Typ</dt>
      <dd>${de(t.messageType)} ${t.messageType === 14 ? "(Schiebetür)" : "(Türöffner)"}</dd>
      <dt>Türcode</dt>
      <dd>${n || "—"}</dd>
      <dt>Bestätigung</dt>
      <dd>
        ${t.confirmation ? `${de(t.confirmation.messageType)} von ${$(t.confirmation.source, e)}` : "—"}
      </dd>
      <dt>Stabilität</dt>
      <dd>${t.occurrences}/${t.captures} Aufnahmen</dd>
    </dl>`;
  }
};
w.styles = ms;
A([
  _()
], w.prototype, "config", 2);
A([
  _()
], w.prototype, "session", 2);
A([
  _()
], w.prototype, "page", 2);
A([
  _()
], w.prototype, "live", 2);
A([
  _()
], w.prototype, "capture", 2);
A([
  _()
], w.prototype, "now", 2);
A([
  _()
], w.prototype, "toast", 2);
A([
  _()
], w.prototype, "maskDoorCode", 2);
A([
  _()
], w.prototype, "showDoorCode", 2);
A([
  _()
], w.prototype, "indoorInput", 2);
A([
  _()
], w.prototype, "receivedCount", 2);
A([
  _()
], w.prototype, "waitForFrame", 2);
w = A([
  zt(ee)
], w);
window.customCards = window.customCards ?? [];
window.customCards.some((t) => t.type === ee) || window.customCards.push({
  type: ee,
  name: "ABB-Welcome Wizard",
  description: "Assistent zum Einmessen von Klingeln und Türöffnern einer Busch-/ABB-Welcome-Anlage.",
  preview: !1,
  documentationURL: "https://github.com/jako-dev/esp32-abb-wizard-card"
});
console.info(
  `%c ABB-WELCOME-WIZARD-CARD %c ${_s} `,
  "background:#03a9f4;color:#fff",
  "background:#444;color:#fff"
);
export {
  w as AbbWelcomeWizardCard
};
