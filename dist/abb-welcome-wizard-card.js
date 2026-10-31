/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const xe = globalThis, et = xe.ShadowRoot && (xe.ShadyCSS === void 0 || xe.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, tt = Symbol(), $t = /* @__PURE__ */ new WeakMap();
let Xt = class {
  constructor(t, n, i) {
    if (this._$cssResult$ = !0, i !== tt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = n;
  }
  get styleSheet() {
    let t = this.o;
    const n = this.t;
    if (et && t === void 0) {
      const i = n !== void 0 && n.length === 1;
      i && (t = $t.get(n)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && $t.set(n, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Cn = (e) => new Xt(typeof e == "string" ? e : e + "", void 0, tt), nt = (e, ...t) => {
  const n = e.length === 1 ? e[0] : t.reduce((i, s, r) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + e[r + 1], e[0]);
  return new Xt(n, e, tt);
}, On = (e, t) => {
  if (et) e.adoptedStyleSheets = t.map((n) => n instanceof CSSStyleSheet ? n : n.styleSheet);
  else for (const n of t) {
    const i = document.createElement("style"), s = xe.litNonce;
    s !== void 0 && i.setAttribute("nonce", s), i.textContent = n.cssText, e.appendChild(i);
  }
}, wt = et ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let n = "";
  for (const i of t.cssRules) n += i.cssText;
  return Cn(n);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Bn, defineProperty: In, getOwnPropertyDescriptor: Mn, getOwnPropertyNames: Rn, getOwnPropertySymbols: Fn, getPrototypeOf: Pn } = Object, Re = globalThis, kt = Re.trustedTypes, Nn = kt ? kt.emptyScript : "", Hn = Re.reactiveElementPolyfillSupport, ie = (e, t) => e, Se = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? Nn : null;
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
} }, it = (e, t) => !Bn(e, t), xt = { attribute: !0, type: String, converter: Se, reflect: !1, useDefault: !1, hasChanged: it };
Symbol.metadata ??= Symbol("metadata"), Re.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let q = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, n = xt) {
    if (n.state && (n.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((n = Object.create(n)).wrapped = !0), this.elementProperties.set(t, n), !n.noAccessor) {
      const i = Symbol(), s = this.getPropertyDescriptor(t, i, n);
      s !== void 0 && In(this.prototype, t, s);
    }
  }
  static getPropertyDescriptor(t, n, i) {
    const { get: s, set: r } = Mn(this.prototype, t) ?? { get() {
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
    return this.elementProperties.get(t) ?? xt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(ie("elementProperties"))) return;
    const t = Pn(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(ie("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(ie("properties"))) {
      const n = this.properties, i = [...Rn(n), ...Fn(n)];
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
      for (const s of i) n.unshift(wt(s));
    } else t !== void 0 && n.push(wt(t));
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
    return On(t, this.constructor.elementStyles), t;
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
      const r = (i.converter?.toAttribute !== void 0 ? i.converter : Se).toAttribute(n, i.type);
      this._$Em = t, r == null ? this.removeAttribute(s) : this.setAttribute(s, r), this._$Em = null;
    }
  }
  _$AK(t, n) {
    const i = this.constructor, s = i._$Eh.get(t);
    if (s !== void 0 && this._$Em !== s) {
      const r = i.getPropertyOptions(s), o = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : Se;
      this._$Em = s;
      const a = o.fromAttribute(n, r.type);
      this[s] = a ?? this._$Ej?.get(s) ?? a, this._$Em = null;
    }
  }
  requestUpdate(t, n, i, s = !1, r) {
    if (t !== void 0) {
      const o = this.constructor;
      if (s === !1 && (r = this[t]), i ??= o.getPropertyOptions(t), !((i.hasChanged ?? it)(r, n) || i.useDefault && i.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, i)))) return;
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
q.elementStyles = [], q.shadowRootOptions = { mode: "open" }, q[ie("elementProperties")] = /* @__PURE__ */ new Map(), q[ie("finalized")] = /* @__PURE__ */ new Map(), Hn?.({ ReactiveElement: q }), (Re.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const st = globalThis, _t = (e) => e, ze = st.trustedTypes, At = ze ? ze.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, Yt = "$lit$", F = `lit$${Math.random().toFixed(9).slice(2)}$`, Jt = "?" + F, Ln = `<${Jt}>`, Z = document, ae = () => Z.createComment(""), de = (e) => e === null || typeof e != "object" && typeof e != "function", rt = Array.isArray, jn = (e) => rt(e) || typeof e?.[Symbol.iterator] == "function", Ne = `[ 	
\f\r]`, te = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, St = /-->/g, zt = />/g, L = RegExp(`>|${Ne}(?:([^\\s"'>=/]+)(${Ne}*=${Ne}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Et = /'/g, Tt = /"/g, Qt = /^(?:script|style|textarea|title)$/i, en = (e) => (t, ...n) => ({ _$litType$: e, strings: t, values: n }), c = en(1), Kn = en(2), J = Symbol.for("lit-noChange"), m = Symbol.for("lit-nothing"), Dt = /* @__PURE__ */ new WeakMap(), W = Z.createTreeWalker(Z, 129);
function tn(e, t) {
  if (!rt(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return At !== void 0 ? At.createHTML(t) : t;
}
const Un = (e, t) => {
  const n = e.length - 1, i = [];
  let s, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = te;
  for (let a = 0; a < n; a++) {
    const d = e[a];
    let u, p, l = -1, f = 0;
    for (; f < d.length && (o.lastIndex = f, p = o.exec(d), p !== null); ) f = o.lastIndex, o === te ? p[1] === "!--" ? o = St : p[1] !== void 0 ? o = zt : p[2] !== void 0 ? (Qt.test(p[2]) && (s = RegExp("</" + p[2], "g")), o = L) : p[3] !== void 0 && (o = L) : o === L ? p[0] === ">" ? (o = s ?? te, l = -1) : p[1] === void 0 ? l = -2 : (l = o.lastIndex - p[2].length, u = p[1], o = p[3] === void 0 ? L : p[3] === '"' ? Tt : Et) : o === Tt || o === Et ? o = L : o === St || o === zt ? o = te : (o = L, s = void 0);
    const v = o === L && e[a + 1].startsWith("/>") ? " " : "";
    r += o === te ? d + Ln : l >= 0 ? (i.push(u), d.slice(0, l) + Yt + d.slice(l) + F + v) : d + F + (l === -2 ? a : v);
  }
  return [tn(e, r + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class ce {
  constructor({ strings: t, _$litType$: n }, i) {
    let s;
    this.parts = [];
    let r = 0, o = 0;
    const a = t.length - 1, d = this.parts, [u, p] = Un(t, n);
    if (this.el = ce.createElement(u, i), W.currentNode = this.el.content, n === 2 || n === 3) {
      const l = this.el.content.firstChild;
      l.replaceWith(...l.childNodes);
    }
    for (; (s = W.nextNode()) !== null && d.length < a; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const l of s.getAttributeNames()) if (l.endsWith(Yt)) {
          const f = p[o++], v = s.getAttribute(l).split(F), h = /([.?@])?(.*)/.exec(f);
          d.push({ type: 1, index: r, name: h[2], strings: v, ctor: h[1] === "." ? Gn : h[1] === "?" ? Vn : h[1] === "@" ? Zn : Fe }), s.removeAttribute(l);
        } else l.startsWith(F) && (d.push({ type: 6, index: r }), s.removeAttribute(l));
        if (Qt.test(s.tagName)) {
          const l = s.textContent.split(F), f = l.length - 1;
          if (f > 0) {
            s.textContent = ze ? ze.emptyScript : "";
            for (let v = 0; v < f; v++) s.append(l[v], ae()), W.nextNode(), d.push({ type: 2, index: ++r });
            s.append(l[f], ae());
          }
        }
      } else if (s.nodeType === 8) if (s.data === Jt) d.push({ type: 2, index: r });
      else {
        let l = -1;
        for (; (l = s.data.indexOf(F, l + 1)) !== -1; ) d.push({ type: 7, index: r }), l += F.length - 1;
      }
      r++;
    }
  }
  static createElement(t, n) {
    const i = Z.createElement("template");
    return i.innerHTML = t, i;
  }
}
function Q(e, t, n = e, i) {
  if (t === J) return t;
  let s = i !== void 0 ? n._$Co?.[i] : n._$Cl;
  const r = de(t) ? void 0 : t._$litDirective$;
  return s?.constructor !== r && (s?._$AO?.(!1), r === void 0 ? s = void 0 : (s = new r(e), s._$AT(e, n, i)), i !== void 0 ? (n._$Co ??= [])[i] = s : n._$Cl = s), s !== void 0 && (t = Q(e, s._$AS(e, t.values), s, i)), t;
}
class Wn {
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
    const { el: { content: n }, parts: i } = this._$AD, s = (t?.creationScope ?? Z).importNode(n, !0);
    W.currentNode = s;
    let r = W.nextNode(), o = 0, a = 0, d = i[0];
    for (; d !== void 0; ) {
      if (o === d.index) {
        let u;
        d.type === 2 ? u = new fe(r, r.nextSibling, this, t) : d.type === 1 ? u = new d.ctor(r, d.name, d.strings, this, t) : d.type === 6 && (u = new qn(r, this, t)), this._$AV.push(u), d = i[++a];
      }
      o !== d?.index && (r = W.nextNode(), o++);
    }
    return W.currentNode = Z, s;
  }
  p(t) {
    let n = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, n), n += i.strings.length - 2) : i._$AI(t[n])), n++;
  }
}
class fe {
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
    t = Q(this, t, n), de(t) ? t === m || t == null || t === "" ? (this._$AH !== m && this._$AR(), this._$AH = m) : t !== this._$AH && t !== J && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : jn(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== m && de(this._$AH) ? this._$AA.nextSibling.data = t : this.T(Z.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: n, _$litType$: i } = t, s = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = ce.createElement(tn(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === s) this._$AH.p(n);
    else {
      const r = new Wn(s, this), o = r.u(this.options);
      r.p(n), this.T(o), this._$AH = r;
    }
  }
  _$AC(t) {
    let n = Dt.get(t.strings);
    return n === void 0 && Dt.set(t.strings, n = new ce(t)), n;
  }
  k(t) {
    rt(this._$AH) || (this._$AH = [], this._$AR());
    const n = this._$AH;
    let i, s = 0;
    for (const r of t) s === n.length ? n.push(i = new fe(this.O(ae()), this.O(ae()), this, this.options)) : i = n[s], i._$AI(r), s++;
    s < n.length && (this._$AR(i && i._$AB.nextSibling, s), n.length = s);
  }
  _$AR(t = this._$AA.nextSibling, n) {
    for (this._$AP?.(!1, !0, n); t !== this._$AB; ) {
      const i = _t(t).nextSibling;
      _t(t).remove(), t = i;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class Fe {
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
    if (r === void 0) t = Q(this, t, n, 0), o = !de(t) || t !== this._$AH && t !== J, o && (this._$AH = t);
    else {
      const a = t;
      let d, u;
      for (t = r[0], d = 0; d < r.length - 1; d++) u = Q(this, a[i + d], n, d), u === J && (u = this._$AH[d]), o ||= !de(u) || u !== this._$AH[d], u === m ? t = m : t !== m && (t += (u ?? "") + r[d + 1]), this._$AH[d] = u;
    }
    o && !s && this.j(t);
  }
  j(t) {
    t === m ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Gn extends Fe {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === m ? void 0 : t;
  }
}
class Vn extends Fe {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== m);
  }
}
class Zn extends Fe {
  constructor(t, n, i, s, r) {
    super(t, n, i, s, r), this.type = 5;
  }
  _$AI(t, n = this) {
    if ((t = Q(this, t, n, 0) ?? m) === J) return;
    const i = this._$AH, s = t === m && i !== m || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, r = t !== m && (i === m || s);
    s && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class qn {
  constructor(t, n, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = n, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    Q(this, t);
  }
}
const Xn = st.litHtmlPolyfillSupport;
Xn?.(ce, fe), (st.litHtmlVersions ??= []).push("3.3.3");
const Yn = (e, t, n) => {
  const i = n?.renderBefore ?? t;
  let s = i._$litPart$;
  if (s === void 0) {
    const r = n?.renderBefore ?? null;
    i._$litPart$ = s = new fe(t.insertBefore(ae(), r), r, void 0, n ?? {});
  }
  return s._$AI(e), s;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ot = globalThis;
class P extends q {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const n = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Yn(n, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return J;
  }
}
P._$litElement$ = !0, P.finalized = !0, ot.litElementHydrateSupport?.({ LitElement: P });
const Jn = ot.litElementPolyfillSupport;
Jn?.({ LitElement: P });
(ot.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Pe = (e) => (t, n) => {
  n !== void 0 ? n.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Qn = { attribute: !0, type: String, converter: Se, reflect: !1, hasChanged: it }, ei = (e = Qn, t, n) => {
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
function ti(e) {
  return (t, n) => typeof n == "object" ? ei(e, t, n) : ((i, s, r) => {
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
  return ti({ ...e, state: !0, attribute: !1 });
}
const ni = { 1: "indoor", 2: "outdoor", 3: "gateway", 4: "door" };
function ii(e, t) {
  if (t) return e >> 16 === 0 ? e >> 8 & 255 : null;
  if (e > 65535) return null;
  const n = e >> 8;
  return (n & 15) === 0 ? n >> 4 : null;
}
function at(e, t) {
  const n = ii(e, t);
  return n !== null && ni[n] || "unknown";
}
const ve = (e, t) => at(e, t) === "indoor", si = (e, t) => at(e, t) === "outdoor";
function k(e, t) {
  return "0x" + e.toString(16).padStart(t ? 6 : 4, "0");
}
function j(e, t) {
  return e.toString(16).toUpperCase().padStart(t ? 6 : 4, "0");
}
function se(e) {
  return "0x" + e.toString(16).padStart(2, "0");
}
function K(e) {
  return e.map((t) => t.toString(16).toUpperCase().padStart(2, "0")).join(" ");
}
const ri = {
  indoor: "Innenstation",
  outdoor: "Außenstation",
  gateway: "Gateway",
  door: "Türsteuergerät",
  unknown: "Gerät"
};
function D(e, t) {
  const n = ri[at(e, t)], i = k(e, t);
  return `${n} (${i})`;
}
const _e = {
  digits: "Ziffern direkt",
  decimal: "dezimal → hex"
};
function nn(e) {
  const { x10: t, x1: n } = e;
  if (!(t === void 0 || n === void 0) && !(!Number.isInteger(t) || !Number.isInteger(n) || t < 0 || t > 9 || n < 0 || n > 9))
    return [t, n];
}
function Ee(e, t) {
  const n = nn(e);
  if (!n) return [];
  const i = t ? 256 : 4096, [s, r] = n, o = [
    { reading: "digits", address: i | s << 4 | r },
    { reading: "decimal", address: i | s * 10 + r }
  ];
  return o[0].address === o[1].address ? [o[0]] : o;
}
function sn(e) {
  const t = nn(e);
  return t ? `X10=${t[0]}, X1=${t[1]}` : void 0;
}
function oi(e, t) {
  return t ? [e >> 16 & 255, e >> 8 & 255, e & 255] : [e >> 8 & 255, e & 255];
}
function ai(e, t) {
  e: for (let n = 0; n + t.length <= e.length; n++) {
    for (let i = 0; i < t.length; i++) if (e[n + i] !== t[i]) continue e;
    return !0;
  }
  return !1;
}
function rn(e, t) {
  return ai(e.data, oi(t, e.threeByte));
}
function dt(e, t) {
  return e.src === t || e.dst === t || rn(e, t);
}
const le = 8, ct = [
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
], Y = "baseline", C = (e) => `ring:${typeof e == "string" ? e : e.key}`, O = (e) => `open:${typeof e == "string" ? e : e.key}`;
function Te(e) {
  const t = e.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return t === "" ? "tuer" : /^[0-9]/.test(t) ? `tuer_${t}` : t;
}
function lt(e, t) {
  let n = e;
  for (let i = 2; t.has(n); i++) n = `${e}_${i}`;
  return t.add(n), n;
}
function on(e) {
  const t = /* @__PURE__ */ new Set(), n = {};
  for (const i of e) n[i.key] = lt(i.id ? Te(i.id) : Te(i.name), t);
  return n;
}
function di(e) {
  return e === "floor" ? "mdi:door-closed" : "mdi:door";
}
function De(e) {
  return e.icon ?? di(e.type);
}
function ge(e) {
  let t = !1;
  return e.map((n) => {
    const i = n.type === "outdoor" && n.open, s = i && n.default && !t;
    return s && (t = !0), { ...n, open: i, default: s };
  });
}
function ci(e, t = "Neue Tür", n = "outdoor") {
  return { key: lt(Te(t), new Set(e.map((s) => s.key))), name: t, type: n, open: n === "outdoor", default: !1 };
}
function Ct(e) {
  if (!Array.isArray(e) || e.length === 0)
    throw new Error('"doors" muss eine Liste mit mindestens einer Tür sein.');
  if (e.length > le) throw new Error(`Höchstens ${le} Türen möglich.`);
  const t = /* @__PURE__ */ new Set(), n = e.map((i, s) => {
    if (typeof i != "object" || i === null || typeof i.name != "string" || i.name.trim() === "")
      throw new Error(`Tür ${s + 1}: "name" fehlt.`);
    const r = i.type ?? "outdoor";
    if (r !== "outdoor" && r !== "floor")
      throw new Error(`Tür "${i.name}": "type" muss outdoor (Außentür) oder floor (Etagenruf) sein.`);
    const o = i.name.trim(), a = {
      key: lt(Te(typeof i.id == "string" ? i.id : o), t),
      name: o,
      type: r,
      open: r === "outdoor" && i.open !== !1,
      default: i.default === !0
    };
    return typeof i.id == "string" && i.id.trim() !== "" && (a.id = i.id.trim()), typeof i.icon == "string" && i.icon.trim() !== "" && (a.icon = i.icon.trim()), a;
  });
  if (n.filter((i) => i.default).length > 1) throw new Error('Nur eine Tür kann "default: true" haben.');
  return ge(n);
}
function li(e) {
  if (!Array.isArray(e)) return;
  const t = /* @__PURE__ */ new Set(), n = [];
  for (const i of e.slice(0, le)) {
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
  return n.length > 0 ? ge(n) : void 0;
}
const ui = /\[\s*([0-9a-f]{4}|[0-9a-f]{6})\s*(»|Â»|>>|>)\s*([0-9a-f]{4}|[0-9a-f]{6})\s*\]/i, pi = /^\s*,?\s*type\s*[:=]?\s*(?:0x)?([0-9a-f]{1,2})(?![0-9a-f])/i, hi = /^\s*,?\s*data\s*[:=]?\s*(.*?)\s*$/i, mi = /((?:[0-9a-f]{2}[.:\s]){2,}[0-9a-f]{2})\s*(?:\(\s*(\d+)\s*\))?\s*$/i;
function fi(e) {
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
function We(e) {
  const t = (f) => ({ ok: !1, line: e, reason: f });
  if (typeof e != "string") return t("not a string");
  const n = ui.exec(e);
  if (!n) return t("no address block");
  const [, i, s, r] = n, o = e.slice(n.index + n[0].length), a = pi.exec(o);
  if (!a) return t("no message type");
  const d = o.slice(a[0].length);
  let u = [];
  if (d.trim() !== "") {
    const f = hi.exec(d);
    if (!f) return t("unexpected text after type");
    const v = fi(f[1]);
    if (!v) return t("invalid data bytes");
    u = v;
  }
  const p = {
    src: parseInt(i, 16),
    dst: parseInt(r, 16),
    type: parseInt(a[1], 16),
    data: u,
    threeByte: i.length === 6 || r.length === 6,
    retransmission: s !== ">"
  }, l = mi.exec(e.slice(0, n.index));
  return l && (p.raw = l[1].toUpperCase().replace(/[:\s]/g, "."), l[2] !== void 0 && (p.rawLength = parseInt(l[2], 10))), { ok: !0, frame: p };
}
const Ce = 1, gi = 10, Ot = 17, an = 13, dn = 14, N = 128, Bt = [1, 129, 10, 17, 145], bi = (e) => `Klingel „${e.name}“`, Ge = (e) => `Öffnen „${e.name}“`, ue = (e, t) => e[t] ?? [], Oe = (e) => e.toString(16).toUpperCase().padStart(2, "0"), Ae = (e) => `${e.src}|${e.dst}|${e.type}|${e.data.join(",")}`;
function cn(e) {
  const t = (n) => n === void 0 ? "*" : n.toString(16);
  return `${Oe(e.type)}|${t(e.src)}|${t(e.dst)}|${e.data ? e.data.map(Oe).join("") : "*"}`;
}
function re(e, t) {
  let n = null;
  for (const i of e)
    (!n || i[1] > n[1] || i[1] === n[1] && t && t(i[0], n[0]) < 0) && (n = i);
  return n;
}
function G(e, t, n = 1) {
  e.set(t, (e.get(t) ?? 0) + n);
}
function vi(e, t) {
  let n = 0;
  const i = {};
  for (const [s, r] of Object.entries(e.steps))
    i[s] = r.captures.map(
      (o) => o.lines.flatMap((a) => {
        n++;
        const d = We(a.line);
        return d.ok ? [d.frame] : (t.push(a.line), []);
      })
    );
  return { steps: i, total: n };
}
function yi(e, t, n = []) {
  const i = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map();
  for (const u of t.filter((p) => p.open))
    for (const p of ue(e, O(u)))
      for (const l of p)
        ln(l) && ve(l.src, l.threeByte) && G(i, l.src), un(l) && ve(l.dst, l.threeByte) && G(s, l.dst);
  const r = (u, p) => n.includes(u) !== n.includes(p) ? n.includes(u) ? -1 : 1 : u - p, o = re(i, r) ?? re(s, r);
  if (o) return { address: o[0], method: "open", count: o[1] };
  const a = /* @__PURE__ */ new Map();
  for (const u of Object.values(e))
    for (const p of u)
      for (const l of p)
        ve(l.src, l.threeByte) && G(a, l.src), ve(l.dst, l.threeByte) && l.dst !== l.src && G(a, l.dst);
  const d = re(a, r);
  return d ? { address: d[0], method: "frequency", count: d[1] } : null;
}
const ln = (e) => e.type === an || e.type === dn, un = (e) => e.type === (an | N) || e.type === (dn | N);
function $i(e) {
  return { ...e, src: e.dst, dst: e.src, type: e.type & ~N, data: [...e.data] };
}
function wi(e, t, n) {
  const i = (s) => si(s, t.threeByte) ? s : void 0;
  return e === "floor" ? t.type === Ot && t.src === n ? { type: t.type, src: t.src } : t.type === (Ot | N) && t.dst === n ? { type: t.type, dst: t.dst } : null : t.type === Ce && t.dst === n ? { type: t.type, src: t.src, dst: t.dst, outdoor: i(t.src) } : t.type === (Ce | N) && t.src === n ? { type: t.type, src: t.src, dst: t.dst, outdoor: i(t.dst) } : t.type === gi && rn(t, n) ? { type: t.type, src: t.src, dst: t.dst, data: [...t.data], outdoor: i(t.src) } : null;
}
function ki(e, t) {
  return t.score - e.score || Bt.indexOf(e.type) - Bt.indexOf(t.type) || (e.key < t.key ? -1 : e.key > t.key ? 1 : 0);
}
function pn(e, t, n) {
  const i = e.session.steps[t]?.skipped === !0;
  e.warnings.push({
    code: i ? "step_skipped" : "step_missing",
    severity: "info",
    step: t,
    message: `${n}: ${i ? "übersprungen" : "keine Aufnahme vorhanden"}.`
  });
}
function xi(e, t) {
  const n = C(t), i = bi(t), s = ue(e.steps, n), r = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
  s.forEach((u, p) => {
    for (const l of u) {
      if (e.baseline.has(Ae(l))) {
        e.stats.baselineFiltered++;
        continue;
      }
      if (!dt(l, e.indoor)) {
        e.stats.neighbourFiltered++;
        continue;
      }
      const f = wi(t.type, l, e.indoor);
      if (!f) {
        o.has(Ae(l)) || o.set(Ae(l), l);
        continue;
      }
      const v = cn(f), h = r.get(v) ?? { match: f, in: /* @__PURE__ */ new Set() };
      h.in.add(p), r.set(v, h);
    }
  });
  const a = [...r].map(([u, { match: p, in: l }]) => ({
    key: u,
    ...p,
    occurrences: l.size,
    score: l.size / s.length,
    reliable: l.size === s.length
  }));
  a.sort(ki);
  let d = a.filter((u) => u.reliable);
  if (s.length === 0)
    pn(e, n, i);
  else if (a.length === 0)
    e.warnings.push({
      code: "no_ring_candidates",
      severity: "warning",
      step: n,
      message: `${i}: keine passenden Frames gefunden (erwartet: ${t.type === "floor" ? "Typ 11/91" : "Typ 01/81/0A"} mit Bezug zu ${k(e.indoor, e.threeByte)}).`
    });
  else {
    if (d.length === 0) {
      const u = a[0].score;
      d = a.filter((p) => p.score === u), e.warnings.push({
        code: "unstable_candidates",
        severity: "warning",
        step: n,
        message: `${i}: kein Kandidat kam in allen ${s.length} Aufnahmen vor; verwende die besten (${Math.round(u * 100)} %).`
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
    outdoorAddress: hn(d),
    otherFrames: [...o.values()]
  };
}
function hn(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) n.outdoor !== void 0 && G(t, n.outdoor);
  return re(t, (n, i) => n - i)?.[0];
}
function _i(e, t, n) {
  const i = t.filter((d) => d.type === "outdoor" && n[d.key].selected.length > 0), s = /* @__PURE__ */ new Map();
  for (const d of i) for (const u of n[d.key].selected) G(s, u.key);
  const r = new Set([...s].filter(([, d]) => d > 1).map(([d]) => d)), o = (d) => n[d.key].selected.filter((u) => !r.has(u.key));
  let a = 0;
  for (let d = 0; d < i.length; d++)
    for (let u = d + 1; u < i.length; u++) {
      const [p, l] = [i[d], i[u]], f = n[p.key], v = n[l.key], h = new Set(v.selected.map((w) => w.key)), y = f.selected.some((w) => h.has(w.key)), g = f.outdoorAddress !== void 0 && f.outdoorAddress === v.outdoorAddress;
      !g && !(y && (o(p).length === 0 || o(l).length === 0)) || (a++, e.warnings.push({
        code: "doors_indistinguishable",
        severity: "warning",
        message: `„${p.name}“ und „${l.name}“ nicht unterscheidbar: beide Klingeln erzeugen dieselben Frames` + (g ? ` (Außenstation ${k(f.outdoorAddress, e.threeByte)})` : "") + ". Beide Klingel-Sensoren würden gemeinsam auslösen."
      }));
    }
  if (!(a > 0 || r.size === 0)) {
    for (const d of i) {
      const u = n[d.key];
      u.selected = o(d), u.outdoorAddress = hn(u.selected);
    }
    e.warnings.push({
      code: "shared_candidates_removed",
      severity: "info",
      message: `${r.size} Kandidat(en) kamen bei mehreren Türen vor und wurden nicht verwendet.`
    });
  }
}
function Ai(e, t) {
  const n = O(t), i = Ge(t), s = ue(e.steps, n);
  if (s.length === 0)
    return pn(e, n, i), null;
  const r = (g) => {
    const w = /* @__PURE__ */ new Map();
    return s.forEach((_, b) => {
      for (const I of _) {
        const E = g(I);
        if (!E) continue;
        const H = `${E.dst}|${E.type}|${E.data.join(",")}`, yt = w.get(H) ?? { frame: E, in: /* @__PURE__ */ new Set() };
        yt.in.add(b), w.set(H, yt);
      }
    }), w;
  };
  let o = !1, a = r((g) => g.src === e.indoor && ln(g) ? g : null);
  a.size === 0 && (a = r((g) => g.dst === e.indoor && un(g) ? $i(g) : null), o = a.size > 0);
  let d;
  for (const g of a.values()) (!d || g.in.size > d.in.size) && (d = g);
  if (!d)
    return e.warnings.push({
      code: "no_open_frame",
      severity: "warning",
      step: n,
      message: `${i}: kein 0D/0E-Frame von ${k(e.indoor, e.threeByte)} gefunden.`
    }), null;
  o && e.warnings.push({
    code: "derived_open",
    severity: "warning",
    step: n,
    message: `${i}: kein 0D/0E empfangen – Befehl aus der Bestätigung ${Oe(d.frame.type | N)} abgeleitet (unbestätigt, bitte testen).`
  }), a.size > 1 && e.warnings.push({
    code: "multiple_open_frames",
    severity: "info",
    step: n,
    message: `${i}: ${a.size} verschiedene Öffnen-Frames gefunden, verwende den häufigsten.`
  }), d.in.size < s.length && e.warnings.push({
    code: "unstable_open",
    severity: "warning",
    step: n,
    message: `${i}: Öffnen-Frame nur in ${d.in.size} von ${s.length} Aufnahmen.`
  });
  const { frame: u } = d, p = {
    door: t.key,
    captures: s.length,
    destination: u.dst,
    messageType: u.type,
    data: [...u.data],
    occurrences: d.in.size,
    score: d.in.size / s.length,
    ...o ? { derived: !0 } : {}
  }, l = u.type | N, f = [...d.in].map((g) => s[g].filter((w) => w.type === l)), v = f.some((g) => g.some((w) => w.dst === e.indoor)), h = /* @__PURE__ */ new Map();
  for (const g of f) {
    const w = new Set(g.filter((_) => !v || _.dst === e.indoor).map((_) => _.src));
    for (const _ of w) G(h, _);
  }
  const y = h.has(u.dst) ? [u.dst, h.get(u.dst)] : re(h, (g, w) => g - w);
  return y ? p.confirmation = {
    source: y[0],
    messageType: l,
    occurrences: y[1],
    ...v ? { destination: e.indoor } : {}
  } : e.warnings.push({
    code: "no_confirmation",
    severity: "info",
    step: n,
    message: `${i}: keine Bestätigung (${Oe(l)}) gefunden – das Schloss meldet dann keinen Status.`
  }), p;
}
function Si(e) {
  return { door: e.key, captures: 0, candidates: [], selected: [], otherFrames: [] };
}
function zi(e, t) {
  const n = [], { steps: i, total: s } = vi(e, n), r = [], o = {
    totalLines: s,
    parsedFrames: s - n.length,
    unparsedLines: n,
    baselineFiltered: 0,
    neighbourFiltered: 0
  }, a = Object.values(i).flat(2), d = a.filter((b) => b.threeByte).length * 2 > a.length, u = Ee(e.dials, d).map((b) => b.address);
  n.length > 0 && r.push({
    code: "unparsed_lines",
    severity: "info",
    message: `${n.length} Zeile(n) konnten nicht als Frame gelesen werden.`
  });
  const p = t.indoorAddress ?? e.overrides.indoorAddress, l = p !== void 0 ? { address: p, method: "manual", count: 0 } : yi(i, e.doors, u), f = {
    indoor: null,
    threeByte: d,
    rings: Object.fromEntries(e.doors.map((b) => [b.key, Si(b)])),
    opens: Object.fromEntries(e.doors.filter((b) => b.open).map((b) => [b.key, null])),
    warnings: r,
    stats: o
  };
  if (!l)
    return r.push({
      code: "no_indoor",
      severity: "error",
      message: "Keine Innenstationsadresse (10XX / 0001XX) gefunden. Wurden Frames aufgenommen?"
    }), f;
  const v = a.filter((b) => dt(b, l.address)), h = v.length > 0 ? v.some((b) => b.threeByte) : l.address > 65535 || d;
  l.method === "manual" && v.length === 0 && a.length > 0 && r.push({
    code: "manual_indoor_unseen",
    severity: "warning",
    message: `Die eingestellte Innenstation ${k(l.address, h)} kommt in keinem aufgenommenen Frame vor.`
  }), v.some((b) => b.threeByte !== h) && r.push({
    code: "mixed_address_length",
    severity: "warning",
    message: "Gemischte 2- und 3-Byte-Adressen gefunden – bitte Aufnahmen prüfen."
  }), f.threeByte = h;
  const y = { ...l }, g = Ee(e.dials, h);
  if (g.length > 0 && (y.dialCandidates = g, y.dialMatch = g.find((b) => b.address === l.address)?.reading ?? null, y.dialMatch === null)) {
    const b = g.map((I) => `${k(I.address, h)} (${_e[I.reading]})`).join(" oder ");
    r.push({
      code: "indoor_mismatch",
      severity: "warning",
      message: `Ermittelte Innenstation ${k(l.address, h)} passt nicht zu den Drehreglern ${sn(e.dials)} – erwartet ${b}. Drehregler prüfen.`
    });
  }
  l.method === "frequency" && r.push({
    code: "indoor_by_frequency",
    severity: "info",
    message: `Innenstation ${D(l.address, h)} nur anhand der Häufigkeit bestimmt (kein Öffnen-Frame aufgenommen).`
  }), f.indoor = y;
  const w = {
    session: e,
    steps: i,
    indoor: l.address,
    threeByte: h,
    baseline: new Set(ue(i, Y).flat().map(Ae)),
    warnings: r,
    stats: o
  };
  ue(i, Y).length === 0 && r.push({
    code: "no_baseline",
    severity: "info",
    step: Y,
    message: "Keine Baseline aufgenommen – Frames einer normalen Sprechverbindung können nicht ausgefiltert werden."
  });
  for (const b of e.doors) f.rings[b.key] = xi(w, b);
  _i(w, e.doors, f.rings);
  const _ = e.doors.filter((b) => b.open);
  for (const b of _) f.opens[b.key] = Ai(w, b);
  for (let b = 0; b < _.length; b++)
    for (let I = b + 1; I < _.length; I++) {
      const E = f.opens[_[b].key], H = f.opens[_[I].key];
      E && H && E.destination === H.destination && E.messageType === H.messageType && K(E.data) === K(H.data) && r.push({
        code: "same_open_frame",
        severity: "warning",
        message: `${Ge(_[b])} und ${Ge(_[I])} senden denselben Frame – beide Schlösser würden dieselbe Tür öffnen. Meist war der Ruf beim Drücken der Schlüssel-Taste schon abgelaufen, sodass die Standard-Tür geöffnet wurde: Aufnahme verwerfen und direkt nach dem Klingeln wiederholen (oder jemanden klingeln lassen).`
      });
    }
  return f;
}
const Ei = /* @__PURE__ */ new Set([
  "no_ring_candidates",
  "unstable_candidates",
  "single_capture",
  "step_missing",
  "step_skipped"
]), Ti = /* @__PURE__ */ new Set([
  "no_open_frame",
  "derived_open",
  "unstable_open",
  "multiple_open_frames",
  "no_confirmation",
  "step_missing",
  "step_skipped"
]);
function Di(e, t) {
  const { overrides: n } = t, i = { ...e, rings: { ...e.rings }, opens: { ...e.opens } };
  let s = [...e.warnings];
  n.threeByte !== void 0 && (i.threeByte = n.threeByte, i.threeByteManual = !0, s = s.filter((r) => r.code !== "mixed_address_length"));
  for (const r of t.doors) {
    const o = n.rings?.[r.key];
    if (o) {
      const u = { ...i.rings[r.key] ?? {
        door: r.key,
        captures: 0,
        candidates: [],
        selected: [],
        otherFrames: []
      } };
      o.conditions && (u.selected = o.conditions.map((p) => ({
        ...p,
        key: cn(p),
        outdoor: p.type === Ce ? p.src : p.type === (Ce | N) ? p.dst : void 0,
        occurrences: 0,
        score: 1,
        reliable: !0,
        manual: !0
      })), u.manual = !0, s = s.filter((p) => !(p.step === C(r) && Ei.has(p.code)))), o.outdoorAddress !== void 0 && (u.outdoorAddress = o.outdoorAddress, u.outdoorManual = !0), i.rings[r.key] = u;
    }
    const a = r.open ? n.opens?.[r.key] : void 0;
    if (a) {
      const d = e.opens[r.key], u = d && d.destination === a.destination && d.messageType === a.messageType;
      i.opens[r.key] = {
        door: r.key,
        captures: d?.captures ?? 0,
        destination: a.destination,
        messageType: a.messageType,
        data: [...a.data],
        occurrences: 0,
        score: 1,
        manual: !0,
        ...u && d.confirmation ? { confirmation: d.confirmation } : {}
      }, s = s.filter((p) => !(p.step === O(r) && Ti.has(p.code)));
    }
  }
  return i.warnings = s, i;
}
function Ci(e, t = {}) {
  return Di(zi(e, t), e);
}
var Oi = Object.defineProperty, Bi = Object.getOwnPropertyDescriptor, ut = (e, t, n, i) => {
  for (var s = i > 1 ? void 0 : i ? Bi(t, n) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (s = (i ? o(t, n, s) : o(s)) || s);
  return i && s && Oi(t, n, s), s;
};
const mn = "abb-welcome-wizard-card-editor", Ii = [
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
], Mi = {
  entity: "Debug-Textsensor des ESP32",
  title: "Titel (optional)",
  capture_seconds: "Aufnahmedauer",
  indoor_address: "Innenstationsadresse (optional)"
}, Ri = {
  entity: "Der Sensor, der jeden Bus-Frame anzeigt, z. B. „Doorbell Intercom“.",
  indoor_address: "Nur nötig, wenn die automatische Erkennung danebenliegt, z. B. 0x1010."
};
let Be = class extends P {
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
        .schema=${Ii}
        .computeLabel=${(e) => Mi[e.name] ?? e.name}
        .computeHelper=${(e) => Ri[e.name]}
        @value-changed=${this.onValueChanged}
      ></ha-form>
      <p style="color:var(--secondary-text-color);font-size:0.875rem;margin:12px 0 0">
        Die Türen (Namen, Öffner, Standard-Tür) richtest du direkt in der Karte auf der Startseite ein.
      </p>
    ` : m;
  }
};
ut([
  $()
], Be.prototype, "hass", 2);
ut([
  $()
], Be.prototype, "config", 2);
Be = ut([
  Pe(mn)
], Be);
const fn = "send_frame", Fi = 6e3, It = (e) => `${e.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${fn}`;
function Pi(e, t) {
  const n = Object.keys(e?.esphome ?? {});
  if (t && n.includes(It(t))) return It(t);
  const i = n.filter((s) => s.endsWith(`_${fn}`));
  return i.length === 1 ? i[0] : void 0;
}
function Ni(e, t, n) {
  return {
    source: e,
    destination: t.destination,
    message_type: t.messageType,
    data: [...t.data],
    three_byte: n
  };
}
async function Hi(e, t, n) {
  await e.callService("esphome", t, n);
}
function Li(e, t) {
  return e.type === (t.message_type | 128) && e.dst === t.source;
}
const ji = /* @__PURE__ */ new Set(["", "unknown", "unavailable"]);
function gn(e, t) {
  if (e.event_type !== "state_changed" || e.data?.entity_id !== t) return null;
  const n = e.data.new_state?.state;
  return typeof n != "string" || ji.has(n.trim()) ? null : { time: e.time_fired || (/* @__PURE__ */ new Date()).toISOString(), line: n };
}
function ye(e) {
  if (typeof e == "number")
    return Number.isInteger(e) && e > 0 && e <= 16777215 ? e : void 0;
  if (typeof e != "string") return;
  const t = e.trim().replace(/^0x/i, "");
  if (/^([0-9a-f]{4}|[0-9a-f]{6})$/i.test(t))
    return parseInt(t, 16);
}
const pt = 6e3, oe = 2e3;
function Ki(e, t, n, i) {
  return n ? { step: e, phase: "armed", armedAt: i, lines: [] } : {
    step: e,
    phase: "recording",
    armedAt: i,
    startedAt: new Date(i).toISOString(),
    endsAt: i + t * 1e3,
    lines: []
  };
}
function Ui(e, t, n, i) {
  return e.phase === "armed" ? {
    ...e,
    phase: "recording",
    startedAt: new Date(i).toISOString(),
    endsAt: i + n * 1e3,
    lines: [t]
  } : { ...e, lines: [...e.lines, t] };
}
function Wi(e, t) {
  return e.phase === "recording" && e.endsAt !== void 0 && t >= e.endsAt && !e.missed;
}
function Mt(e) {
  return { ...e, missed: !0, syncAfter: void 0 };
}
function Rt(e, t) {
  return e.missed ? { ...e, syncAfter: t + pt } : e;
}
function Gi(e, t) {
  const n = e.phase === "armed" ? e.armedAt : Date.parse(e.startedAt ?? ""), i = e.endsAt !== void 0 ? Math.min(t, e.endsAt + oe) : t;
  return { start: (Number.isNaN(n) ? e.armedAt : n) - oe, end: i };
}
function Vi(e, t) {
  const n = [...e];
  for (const i of t) {
    const s = Date.parse(i.time);
    n.some((r) => r.line === i.line && Math.abs(Date.parse(r.time) - s) < 1e3) || n.push(i);
  }
  return n.sort((i, s) => Date.parse(i.time) - Date.parse(s.time));
}
function Zi(e, t, n, i) {
  let s = e;
  if (s.phase === "armed") {
    const a = t.find((d) => Date.parse(d.time) >= s.armedAt - oe);
    if (a) {
      const d = Date.parse(a.time);
      s = { ...s, phase: "recording", startedAt: a.time, endsAt: d + n * 1e3 };
    }
  }
  if (s.phase === "recording") {
    const a = Date.parse(s.startedAt ?? "") - oe, d = (s.endsAt ?? i) + oe, u = t.filter((p) => {
      const l = Date.parse(p.time);
      return l >= a && l <= d;
    });
    s = { ...s, lines: Vi(s.lines, u) };
  }
  const r = s.phase === "recording" && s.endsAt !== void 0 && i >= s.endsAt;
  return s.syncAfter !== void 0 && i >= s.syncAfter && (!r || i >= (s.endsAt ?? 0) + pt) ? { ...s, missed: !1, syncAfter: void 0 } : s;
}
function qi(e, t) {
  return (e?.[t] ?? []).flatMap((n) => {
    const i = gn(
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
async function bn(e, t, n, i) {
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
async function Xi(e, t, n, i) {
  return qi(await bn(e, [t], n, i), t);
}
function Yi(e) {
  const t = {};
  for (const [n, i] of Object.entries(e))
    for (const s of i) s.s === "on" && (t[n] = (s.lc ?? s.lu) * 1e3);
  return t;
}
const Ve = "abb-welcome-wizard-session", Ze = 3, Ji = Object.freeze({ skipped: !1, captures: [] }), Qi = {
  baseline: Y,
  ring_gate: C("tor"),
  ring_house: C("haustuer"),
  ring_apartment: C("wohnung"),
  open_gate: O("tor"),
  open_house: O("haustuer")
};
function Ft(e, t = ct, n = /* @__PURE__ */ new Date()) {
  const i = n.toISOString();
  return {
    format: Ve,
    version: Ze,
    entity: e,
    createdAt: i,
    updatedAt: i,
    dials: {},
    doors: ge(t),
    steps: {},
    overrides: {},
    exportSettings: {}
  };
}
function T(e, t) {
  return e.steps[t] ?? Ji;
}
function be(e, t) {
  return { ...e, updatedAt: t.toISOString() };
}
function ht(e, t, n, i) {
  return be({ ...e, steps: { ...e.steps, [t]: n(T(e, t)) } }, i);
}
function es(e, t, n, i = /* @__PURE__ */ new Date()) {
  return ht(e, t, (s) => ({ skipped: !1, captures: [...s.captures, n] }), i);
}
function Pt(e, t, n, i = /* @__PURE__ */ new Date()) {
  return ht(
    e,
    t,
    (s) => ({ ...s, captures: s.captures.filter((r, o) => o !== n) }),
    i
  );
}
function ts(e, t, n, i = /* @__PURE__ */ new Date()) {
  return ht(e, t, (s) => ({ ...s, skipped: n }), i);
}
function Nt(e, t, n = /* @__PURE__ */ new Date()) {
  return vn(e, { ...e.overrides, indoorAddress: t }, n);
}
function vn(e, t, n = /* @__PURE__ */ new Date()) {
  return be({ ...e, overrides: mt(t) }, n);
}
function ns(e, t, n = /* @__PURE__ */ new Date()) {
  const i = Object.fromEntries(Object.entries(t).filter(([, s]) => s !== void 0 && s !== ""));
  return be({ ...e, exportSettings: i }, n);
}
function mt(e) {
  const t = {};
  e.indoorAddress !== void 0 && (t.indoorAddress = e.indoorAddress), e.threeByte !== void 0 && (t.threeByte = e.threeByte);
  const n = Object.entries(e.rings ?? {}).filter(
    ([, i]) => i.outdoorAddress !== void 0 || i.conditions !== void 0
  );
  return n.length > 0 && (t.rings = Object.fromEntries(n)), e.opens && Object.keys(e.opens).length > 0 && (t.opens = { ...e.opens }), t;
}
function is(e, t, n = /* @__PURE__ */ new Date()) {
  return be({ ...e, dials: { ...t } }, n);
}
function ne(e, t, n = /* @__PURE__ */ new Date()) {
  const i = ge(t), s = /* @__PURE__ */ new Set([Y]);
  for (const l of i)
    s.add(C(l)), l.open && s.add(O(l));
  const r = Object.fromEntries(Object.entries(e.steps).filter(([l]) => s.has(l))), o = new Set(i.map((l) => l.key)), a = new Set(i.filter((l) => l.open).map((l) => l.key)), { rings: d, opens: u } = e.overrides, p = mt({
    ...e.overrides,
    rings: d && Object.fromEntries(Object.entries(d).filter(([l]) => o.has(l))),
    opens: u && Object.fromEntries(Object.entries(u).filter(([l]) => a.has(l)))
  });
  return be({ ...e, doors: i, steps: r, overrides: p }, n);
}
function Ht(e, t) {
  return T(e, C(t)).captures.length + T(e, O(t)).captures.length;
}
function ss(e) {
  const t = e.doors.flatMap(
    (i) => i.open && !i.default ? [C(i), O(i)] : [C(i)]
  );
  let n;
  for (const i of t)
    for (const s of T(e, i).captures) {
      const r = Date.parse(s.endedAt);
      !Number.isNaN(r) && (n === void 0 || r > n) && (n = r);
    }
  return n === void 0 ? void 0 : new Date(n);
}
function yn(e) {
  return JSON.stringify(e, null, 2);
}
const S = (e) => typeof e == "object" && e !== null, He = (e) => typeof e == "number" && Number.isInteger(e) ? e : void 0, ee = (e) => typeof e == "number" && Number.isInteger(e) && e >= 0 && e <= 16777215, ft = (e) => typeof e == "number" && Number.isInteger(e) && e >= 0 && e <= 255, $n = (e) => Array.isArray(e) && e.length <= 15 && e.every(ft) ? [...e] : void 0;
function rs(e) {
  if (!S(e) || !ft(e.type)) return;
  const t = { type: e.type };
  ee(e.src) && (t.src = e.src), ee(e.dst) && (t.dst = e.dst);
  const n = $n(e.data);
  return n && (t.data = n), t;
}
function os(e) {
  if (!(!S(e) || !ee(e.destination) || !ft(e.messageType)))
    return { destination: e.destination, messageType: e.messageType, data: $n(e.data) ?? [] };
}
function as(e) {
  if (!S(e)) return {};
  const t = {};
  if (ee(e.indoorAddress) && (t.indoorAddress = e.indoorAddress), typeof e.threeByte == "boolean" && (t.threeByte = e.threeByte), S(e.rings)) {
    t.rings = {};
    for (const [n, i] of Object.entries(e.rings)) {
      if (!S(i)) continue;
      const s = {};
      ee(i.outdoorAddress) && (s.outdoorAddress = i.outdoorAddress), Array.isArray(i.conditions) && (s.conditions = i.conditions.map(rs).filter((r) => !!r)), t.rings[n] = s;
    }
  }
  if (S(e.opens)) {
    t.opens = {};
    for (const [n, i] of Object.entries(e.opens)) {
      const s = os(i);
      s && (t.opens[n] = s);
    }
  }
  return mt(t);
}
function ds(e) {
  if (!S(e)) return {};
  const t = {};
  (e.mode === "full" || e.mode === "snippet") && (t.mode = e.mode);
  for (const n of ["name", "friendlyName", "debugSensorName"])
    typeof e[n] == "string" && e[n] !== "" && (t[n] = e[n]);
  return typeof e.nameAddMacSuffix == "boolean" && (t.nameAddMacSuffix = e.nameAddMacSuffix), t;
}
function cs(e) {
  const t = Array.isArray(e.captures) ? e.captures : [];
  return {
    skipped: e.skipped === !0,
    captures: t.filter(S).map((n) => ({
      startedAt: String(n.startedAt ?? ""),
      endedAt: String(n.endedAt ?? ""),
      lines: (Array.isArray(n.lines) ? n.lines : []).filter(S).filter((i) => typeof i.line == "string").map((i) => ({ time: String(i.time ?? ""), line: i.line }))
    }))
  };
}
function wn(e) {
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    throw new Error("Datei ist kein gültiges JSON.");
  }
  if (!S(t) || t.format !== Ve)
    throw new Error("Datei ist keine ABB-Welcome-Wizard-Sitzung.");
  if (t.version !== 1 && t.version !== 2 && t.version !== Ze)
    throw new Error(`Nicht unterstützte Sitzungsversion: ${String(t.version)}.`);
  if (typeof t.entity != "string") throw new Error("Sitzung ohne Entität.");
  const n = t.version === 1, i = !n && li(t.doors) || ge(ct), s = {};
  for (const [a, d] of Object.entries(S(t.steps) ? t.steps : {})) {
    const u = n ? Qi[a] : a;
    u && S(d) && (s[u] = cs(d));
  }
  const r = S(t.dials) ? t.dials : {}, o = {
    format: Ve,
    version: Ze,
    entity: t.entity,
    createdAt: String(t.createdAt ?? ""),
    updatedAt: String(t.updatedAt ?? ""),
    dials: { station: He(r.station), x10: He(r.x10), x1: He(r.x1) },
    doors: i,
    steps: s,
    overrides: as(t.overrides),
    exportSettings: ds(t.exportSettings)
  };
  return t.version === 2 && ee(t.indoorAddress) && (o.overrides = { ...o.overrides, indoorAddress: t.indoorAddress }), { ...ne(o, i), updatedAt: o.updatedAt };
}
const Lt = 3, X = (e) => `„${e.name}“`;
function ls(e, t) {
  const n = e.type === "floor";
  return {
    id: C(e),
    kind: "ring",
    door: e,
    title: `Klingeln: ${e.name}`,
    short: e.name,
    icon: De(e),
    todo: [
      "Auf „Aufnahme starten“ tippen – die Aufnahme beginnt erst, wenn der erste Frame ankommt.",
      n ? `Den Klingeltaster an ${X(e)} (Etagenruf) drücken.` : `Zu ${X(e)} gehen und einmal klingeln. Nicht abheben, nicht öffnen.`,
      "Für eine zuverlässige Erkennung 2–3 Mal wiederholen (jeweils neue Aufnahme)."
    ],
    why: n ? "Der Etagenruf ist direkt an die Innenstation angeschlossen. Sie meldet ihn mit Typ 11 auf dem Bus, die Antwort hat Typ 91." : "Frames, die in jeder Wiederholung auftauchen, sind zuverlässige Kandidaten für den Klingel-Sensor." + (t > 1 ? " Jede Außentür hat in der Regel eine eigene Außenstation – darüber werden die Türen unterschieden." : ""),
    repetitions: 3,
    waitForFrame: !0,
    needsPause: !1
  };
}
function jt(e) {
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
      `An der Innenstation die Schlüssel-Taste drücken – ${X(e)} wird dabei wirklich geöffnet.`
    ],
    why: `Ohne vorheriges Klingeln öffnet die Schlüssel-Taste die Standard-Außenstation (${X(e)}). Liegt das letzte Klingeln zu kurz zurück, würde sie noch die zuletzt rufende Tür öffnen.`,
    needsPause: !0
  } : {
    ...t,
    todo: [
      `An ${X(e)} klingeln – oder klingeln lassen. Allein: klingeln und zügig zur Innenstation gehen.`,
      "Erst an der Innenstation auf „Aufnahme starten“ tippen (das Klingeln muss nicht mit aufgenommen werden).",
      `Sofort die Schlüssel-Taste drücken, solange der Ruf noch aktiv ist – ${X(e)} wird dabei wirklich geöffnet.`
    ],
    why: "Nach einem Klingeln öffnet die Schlüssel-Taste die rufende Außenstation – aber nur, solange der Ruf an der Innenstation noch aktiv ist. Ist er schon abgelaufen, öffnet sie die Standard-Tür; die Auswertung warnt dann. Gesucht wird der Frame vom Typ 0D/0E deiner Innenstation und die Bestätigung 8D/8E.",
    needsPause: !1
  };
}
function us(e) {
  const t = e.filter((i) => i.type === "outdoor").length, n = e.filter((i) => i.open);
  return [
    {
      id: Y,
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
    ...e.map((i) => ls(i, t)),
    // Doors opened after a doorbell first, the default door (needs a pause after ringing) last.
    ...n.filter((i) => !i.default).map(jt),
    ...n.filter((i) => i.default).map(jt)
  ];
}
const gt = (e) => `abb-welcome-wizard-card:session:${e}`, kn = (e) => `abb-welcome-wizard-card:backup:${e}`;
function ps(e) {
  let t = null;
  try {
    t = window.localStorage.getItem(gt(e));
  } catch {
    return;
  }
  if (t)
    try {
      return wn(t);
    } catch (n) {
      console.warn("abb-welcome-wizard-card: stored session could not be read, keeping a backup", n);
      try {
        window.localStorage.setItem(kn(e), t);
      } catch {
      }
      return;
    }
}
function hs(e) {
  try {
    return window.localStorage.getItem(kn(e)) !== null;
  } catch {
    return !1;
  }
}
function ms(e) {
  try {
    window.localStorage.setItem(gt(e.entity), yn(e));
  } catch {
  }
}
function fs(e) {
  try {
    window.localStorage.removeItem(gt(e));
  } catch {
  }
}
const qe = (e) => `abb-welcome-wizard-card:capture:${e}`;
function Kt(e, t) {
  try {
    t ? window.localStorage.setItem(qe(e), JSON.stringify(t)) : window.localStorage.removeItem(qe(e));
  } catch {
  }
}
function gs(e) {
  try {
    const t = JSON.parse(window.localStorage.getItem(qe(e)) ?? "null");
    if (t && typeof t.step == "string" && (t.phase === "armed" || t.phase === "recording") && typeof t.armedAt == "number" && Array.isArray(t.lines))
      return t;
  } catch {
  }
}
function Ut(e, t, n) {
  const i = URL.createObjectURL(new Blob([t], { type: n })), s = document.createElement("a");
  s.href = i, s.download = e, document.body.appendChild(s), s.click(), s.remove(), setTimeout(() => URL.revokeObjectURL(i), 1e3);
}
async function bs(e) {
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
const vs = nt`
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

  /* Manual values */
  .edit-head {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  button.icon.edit {
    width: 28px;
    height: 28px;
    --mdc-icon-size: 16px;
  }
  .editor {
    display: grid;
    gap: 10px;
    margin-top: 8px;
    padding: 12px;
    border-radius: 8px;
    background: var(--wiz-surface);
  }
  .condition-row {
    display: grid;
    grid-template-columns: 64px repeat(2, minmax(80px, 1fr)) minmax(100px, 1.4fr) auto;
    gap: 8px;
    align-items: end;
  }
  .condition-row.open-row {
    grid-template-columns: minmax(90px, 1fr) 64px minmax(120px, 2fr);
  }
  @media (max-width: 520px) {
    .condition-row,
    .condition-row.open-row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  .condition-row input {
    width: 100%;
    box-sizing: border-box;
    font-family: var(--wiz-mono);
  }
  .field-error {
    color: var(--wiz-error);
    font-size: 0.75rem;
  }
  button.btn.small-btn {
    min-height: 30px;
    padding: 0 10px;
    font-size: 0.8rem;
    justify-self: start;
  }
  .stat select {
    justify-self: start;
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
`, V = {
  name: "abb-welcome-demo",
  friendlyName: "ABB Welcome Demo",
  debugSensorName: "Doorbell Intercom",
  board: "esp32dev"
};
function Xe(e) {
  return e.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || V.name;
}
function xn(e) {
  const t = e?.toLowerCase().replace(/[^0-9a-f]/g, "");
  return t && t.length === 12 ? t.slice(6) : void 0;
}
function Ye(e, t) {
  const n = xn(t);
  return e.nameAddMacSuffix && n ? `${e.name}-${n}` : e.name;
}
function ys(e, t) {
  if (!t.name) return;
  const n = Xe(t.name), i = xn(t.mac), s = Ye(e, t.mac);
  if (s !== n) {
    if (i && n.endsWith(`-${i}`)) {
      const r = n.slice(0, -i.length - 1);
      return e.name === r && !e.nameAddMacSuffix ? `Das Gerät heißt in Home Assistant „${n}“ – „name_add_mac_suffix“ aktivieren.` : `Das Gerät heißt in Home Assistant „${n}“ – Gerätename „${r}“ mit „name_add_mac_suffix“ verwenden.`;
    }
    return e.nameAddMacSuffix && e.name === n ? `Das Gerät heißt in Home Assistant „${n}“ ohne MAC-Suffix – „name_add_mac_suffix“ ausschalten.` : `Gerätename „${s}“ passt nicht zum Gerät „${t.name}“ in Home Assistant (erwartet „${n}“). Ein anderer Name ist für ESPHome ein neues Gerät – im ESPHome Device Builder prüfen.`;
  }
}
const $s = ["wifi_ssid", "wifi_password", "api_encryption_key", "ota_password", "ap_password"];
function _n(e) {
  const t = on(e);
  return e.map((n) => ({
    door: n,
    id: `klingel_${t[n.key]}`,
    name: `Klingel ${n.name}`,
    icon: "mdi:bell"
  }));
}
function An(e) {
  const t = on(e);
  return e.filter((n) => n.open).map((n) => ({ door: n, id: t[n.key], name: n.name, icon: De(n) }));
}
const Je = "TÜRCODE – nicht öffentlich teilen!";
class ws {
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
function $e(e) {
  return `"${e.replace(/[\r\n]+/g, " ").replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
function Ie(e) {
  return e.toString(16).toUpperCase().padStart(2, "0");
}
function ks(e, t) {
  const n = [`(x.get_message_type() == ${se(e.type)})`];
  e.src !== void 0 && n.push(`(x.get_source_address() == ${k(e.src, t)})`), e.dst !== void 0 && n.push(`(x.get_destination_address() == ${k(e.dst, t)})`);
  let i = "";
  return e.data !== void 0 && (i = `std::vector<uint8_t> d = {${e.data.map(se).join(", ")}}; `, n.push("(x.get_data() == d)")), `'${i}return ${n.join(" && ")};'`;
}
function xs(e, t, n) {
  let i = `Typ ${Ie(e.type)}`;
  return e.src !== void 0 && e.dst !== void 0 ? i += `: ${D(e.src, n)} > ${D(e.dst, n)}` : e.src !== void 0 ? i += `, Quelle: ${D(e.src, n)}` : e.dst !== void 0 && (i += `, Ziel: ${D(e.dst, n)}`), e.data !== void 0 && (i += `, Data: ${e.data.map((s) => Ie(s)).join(" ")}`), `${i} (${e.occurrences}/${t} Aufnahmen)`;
}
function U(e, t, n, i, s) {
  e.line(t, `- ${n}.template.publish:`), e.line(t + 4, `id: ${i}`), e.line(t + 4, `state: ${s}`);
}
function _s(e, t, n, i) {
  U(e, t, "lock", n, "UNLOCKING"), e.line(t, `- delay: ${i}s`), U(e, t, "lock", n, "LOCKED");
}
function As(e, t, n) {
  const { indoor: i, threeByte: s } = t;
  e.comment(0, "ABB-Welcome Wizard – generierte ESPHome-Konfiguration"), i && e.comment(0, `Innenstation: ${k(i.address, s)}`), e.comment(0, `Adresslänge: ${s ? "3 Byte (three_byte_address: true)" : "2 Byte"}`), e.comment(0, ""), n.device ? (e.comment(0, "Komplette Gerätekonfiguration auf Basis der ABB-Welcome-Demo-Firmware (Mat931)."), e.comment(0, `Im ESPHome Device Builder den Inhalt von ${n.device.name}.yaml hierdurch ersetzen.`), e.comment(0, "WICHTIG: esphome.name muss zum bestehenden Gerät passen – sonst ist es per OTA und"), e.comment(0, "in Home Assistant nicht mehr erreichbar."), e.comment(0, ""), e.comment(0, `Benötigt in secrets.yaml: ${$s.join(", ")}.`), e.comment(0, "Den API-Schlüssel aus der bisherigen Konfiguration übernehmen, sonst muss das Gerät in"), e.comment(0, "Home Assistant neu verbunden werden. Scheitert das Hochladen am OTA-Passwort, den"), e.comment(0, "ota-Abschnitt aus der bisherigen Datei übernehmen.")) : (e.comment(0, "Diese Abschnitte ersetzen die gleichnamigen Abschnitte der Demo-Firmware:"), e.comment(0, "esphome.on_boot, remote_receiver.on_abbwelcome, binary_sensor und lock."), e.comment(0, "Alle übrigen Einstellungen (wifi, api, ota, remote_transmitter, Pins von"), e.comment(0, "remote_receiver, text_sensor ...) unverändert lassen."), e.comment(0, ""), e.comment(0, "Voraussetzung (in der Demo-Firmware bereits gesetzt):"), e.comment(0, "esp32:"), e.comment(0, "  framework:"), e.comment(0, "    type: esp-idf")), Object.values(t.opens).some((o) => o !== null) && (e.comment(0, ""), e.comment(
    0,
    n.maskDoorCode ? "Türcodes sind durch Platzhalter ersetzt – vor dem Flashen die echten Werte eintragen!" : `ACHTUNG: "data" der Öffnen-Befehle ist euer ${Je}`
  ));
  const r = t.warnings.filter((o) => o.severity !== "info");
  if (r.length > 0) {
    e.comment(0, "");
    for (const o of r) e.comment(0, `${o.severity === "error" ? "FEHLER" : "Warnung"}: ${o.message}`);
  }
  e.line(0);
}
function Ss(e, t, n = {}) {
  const i = new ws(), { indoor: s, threeByte: r } = e, o = n.device ? { ...V, ...n.device } : void 0, a = o || n.debugSensorId === void 0 ? "doorbell_intercom" : n.debugSensorId, d = n.unlockSeconds ?? 3;
  if (As(i, e, n), !s)
    return i.comment(0, "Keine Innenstationsadresse ermittelt – es kann keine Konfiguration erzeugt werden."), i.toString();
  const u = _n(t), p = An(t), l = u.filter((h) => (e.rings[h.door.key]?.selected.length ?? 0) > 0), f = p.map((h) => ({ ...h, open: e.opens[h.door.key] ?? null })).filter((h) => h.open !== null), v = [
    ...u.filter((h) => !l.includes(h)).map((h) => h.name),
    ...p.filter((h) => !e.opens[h.door.key]).map((h) => `Öffnen ${h.name}`)
  ];
  if (o && (i.line(0, "esp32:"), i.line(2, `board: ${o.board}`), i.line(2, "framework:"), i.line(4, "type: esp-idf"), i.comment(4, "sdkconfig_options:"), i.comment(4, "  CONFIG_FREERTOS_UNICORE: y # nur bei Single-Core-ESP32 nötig"), i.line(0)), o || l.length + f.length > 0) {
    if (i.line(0, "esphome:"), o && (i.line(2, `name: ${o.name}`), i.line(2, `friendly_name: ${$e(o.friendlyName)}`), o.nameAddMacSuffix && i.line(2, "name_add_mac_suffix: true # hängt die letzten 6 Stellen der MAC an")), l.length + f.length > 0) {
      i.line(2, "on_boot:");
      for (const h of l) U(i, 4, "binary_sensor", h.id, "OFF");
      for (const h of f) U(i, 4, "lock", h.id, "LOCKED");
    }
    i.line(0);
  }
  o && zs(i), i.line(0, "remote_receiver:"), o ? Es(i) : i.comment(2, "pin, dump, filter, tolerance, idle, buffer_size ... aus der bestehenden Konfiguration"), i.line(2, "on_abbwelcome:"), i.line(4, "then:"), a && (i.comment(6, "Debug-Textsensor (id ggf. an eure Firmware anpassen)"), i.line(6, `- lambda: 'char buf[192]; x.format_to(buf, 192); id(${a}).publish_state(buf);'`));
  for (const h of l) {
    const y = e.rings[h.door.key], g = y.outdoorAddress !== void 0 ? ` – ${D(y.outdoorAddress, r)}` : "";
    i.comment(6, `${h.name}${g}`), i.line(6, "- if:"), i.line(10, "condition:"), i.line(12, "or:");
    for (const w of y.selected)
      i.comment(14, xs(w, y.captures, r)), i.line(14, `- lambda: ${ks(w, r)}`);
    i.line(10, "then:"), U(i, 12, "binary_sensor", h.id, "ON"), U(i, 12, "binary_sensor", h.id, "OFF");
  }
  for (const h of f) {
    const y = h.open.confirmation, g = y ?? {
      source: h.open.destination,
      messageType: h.open.messageType | 128,
      destination: s.address
    };
    i.comment(
      6,
      `${h.name} geöffnet (Bestätigung Typ ${Ie(g.messageType)}${y ? "" : ", angenommen – nicht aufgenommen"})`
    ), i.line(6, "- if:"), i.line(10, "condition:"), i.line(12, "and:"), i.line(14, `- lambda: 'return (x.get_message_type() == ${se(g.messageType)});'`), i.line(
      14,
      `- lambda: 'return (x.get_source_address() == ${k(g.source, r)});'`
    ), g.destination !== void 0 && i.line(
      14,
      `- lambda: 'return (x.get_destination_address() == ${k(g.destination, r)});'`
    ), i.line(10, "then:"), _s(i, 12, h.id, d);
  }
  if (v.length > 0 && i.comment(6, `Nicht ermittelt: ${v.join(", ")}`), i.line(0), l.length > 0) {
    i.line(0, "binary_sensor:");
    for (const h of l)
      i.line(2, "- platform: template"), i.line(4, `name: ${$e(h.name)}`), i.line(4, `id: ${h.id}`), i.line(4, `icon: ${h.icon}`), i.line(4, "filters:"), i.line(6, "- delayed_off: 1s");
    i.line(0);
  }
  if (o && (i.line(0, "sensor:"), i.line(2, "- platform: internal_temperature"), i.line(4, 'name: "Internal Temperature"'), i.line(0), i.line(0, "text_sensor:"), i.line(2, "- platform: template"), i.line(
    4,
    `name: ${$e(o.debugSensorName ?? V.debugSensorName)} # Debug-Sensor für diese Karte`
  ), i.line(4, "id: doorbell_intercom"), i.line(4, "icon: mdi:bell-circle"), i.line(4, "update_interval: never"), i.line(0)), f.length > 0) {
    i.line(0, "lock:");
    for (const h of f) {
      const { open: y } = h, g = n.maskDoorCode ? y.data.map(() => 0) : y.data;
      y.manual && i.comment(2, `${h.name}: Öffnen-Frame manuell eingetragen`), y.derived && i.comment(
        2,
        `${h.name}: abgeleitet aus der Bestätigung ${Ie(y.messageType | 128)} – unbestätigt, bitte testen`
      ), i.line(2, "- platform: template"), i.line(4, `name: ${$e(h.name)}`), i.line(4, `id: ${h.id}`), i.line(4, `icon: ${h.icon}`), i.line(4, "lock_action:"), U(i, 6, "lock", h.id, "LOCKED"), i.line(4, "unlock_action:"), i.line(6, "- remote_transmitter.transmit_abbwelcome:"), i.line(10, `source_address: ${k(s.address, r)} # Innenstation`), i.line(
        10,
        `destination_address: ${k(y.destination, r)} # ${D(y.destination, r)}`
      ), i.line(10, `three_byte_address: ${r}`), i.line(
        10,
        `message_type: ${se(y.messageType)} # ${y.messageType === 14 ? "Schiebetür" : "Türöffner"}`
      );
      const w = n.maskDoorCode ? `PLATZHALTER: ${g.length} Byte ${Je}` : Je;
      i.line(10, `data: [${g.map(se).join(", ")}] # ${w}`);
    }
  }
  return o && (f.length > 0 && i.line(0), i.line(0, "button:"), i.line(2, "- platform: restart"), i.line(4, 'name: "Reboot"'), i.line(2, "- platform: safe_mode"), i.line(4, 'name: "Reboot (Safe Mode)"'), i.line(0), i.line(0, "status_led:"), i.line(2, "pin:"), i.line(4, "number: GPIO2"), i.line(4, "ignore_strapping_warning: true")), i.toString();
}
function zs(e) {
  e.line(0, "wifi:"), e.line(2, "ssid: !secret wifi_ssid"), e.line(2, "password: !secret wifi_password"), e.line(2, "ap:"), e.line(4, "password: !secret ap_password"), e.line(0), e.line(0, "captive_portal:"), e.line(0), e.line(0, "logger:"), e.line(0), e.line(0, "api:"), e.line(2, "encryption:"), e.line(4, "key: !secret api_encryption_key"), e.line(2, "batch_delay: 0ms # jeden Bus-Frame einzeln an Home Assistant senden"), e.comment(
    2,
    "Für den „Testen“-Button des Wizards: sendet einen Frame (Aktion esphome.<gerät>_send_frame)."
  ), e.line(2, "actions:"), e.line(4, "- action: send_frame"), e.line(6, "variables:"), e.line(8, "source: int"), e.line(8, "destination: int"), e.line(8, "message_type: int"), e.line(8, "data: int[]"), e.line(8, "three_byte: bool"), e.line(6, "then:"), e.line(8, "- remote_transmitter.transmit_abbwelcome:"), e.line(12, "source_address: !lambda 'return source;'"), e.line(12, "destination_address: !lambda 'return destination;'"), e.line(12, "three_byte_address: !lambda 'return three_byte;'"), e.line(12, "message_type: !lambda 'return message_type;'"), e.line(12, "data: !lambda 'return std::vector<uint8_t>(data.begin(), data.end());'"), e.line(0), e.line(0, "ota:"), e.line(2, "- platform: esphome"), e.line(4, "password: !secret ota_password"), e.line(0), e.line(0, "remote_transmitter:"), e.line(2, "pin: GPIO26"), e.line(2, "carrier_duty_percent: 100%"), e.line(2, "non_blocking: true"), e.line(0);
}
function Es(e) {
  e.line(2, "pin:"), e.line(4, "number: GPIO25"), e.line(4, "mode:"), e.line(6, "input: true"), e.line(2, "dump: [abbwelcome]"), e.line(2, "filter: 8us"), e.line(2, "tolerance:"), e.line(4, "type: time"), e.line(4, "value: 26us"), e.line(2, "idle: 1500us"), e.line(2, "buffer_size: 15kB"), e.line(2, "rmt_symbols: 320"), e.line(2, "clock_resolution: 500000");
}
function Sn(e) {
  const t = e.trim().replace(/^0x/i, "");
  return /^[0-9a-f]{1,2}$/i.test(t) ? parseInt(t, 16) : void 0;
}
function zn(e) {
  const t = e.trim().split(/[\s.,:;-]+/).filter((i) => i !== "").map((i) => i.replace(/^0x/i, "")), n = [];
  for (const i of t) {
    if (!/^[0-9a-f]+$/i.test(i)) return;
    if (i.length <= 2) n.push(parseInt(i, 16));
    else if (i.length % 2 === 0)
      for (let s = 0; s < i.length; s += 2) n.push(parseInt(i.slice(s, s + 2), 16));
    else return;
  }
  return n.length <= 15 ? n : void 0;
}
function Me(e) {
  const t = e.trim().replace(/^0x/i, "");
  return /^([0-9a-f]{4}|[0-9a-f]{6})$/i.test(t) ? parseInt(t, 16) : void 0;
}
const bt = (e) => e.toString(16).toUpperCase().padStart(2, "0"), En = (e) => e.map(bt).join(" "), pe = (e, t) => e.toString(16).toUpperCase().padStart(t ? 6 : 4, "0");
function Ts(e, t) {
  return {
    type: bt(e.type),
    src: e.src !== void 0 ? pe(e.src, t) : "",
    dst: e.dst !== void 0 ? pe(e.dst, t) : "",
    data: e.data ? En(e.data) : ""
  };
}
function Ds(e, t) {
  return e ? {
    destination: pe(e.destination, t),
    type: bt(e.messageType),
    data: En(e.data)
  } : { destination: "", type: "0D", data: "" };
}
function Cs(e) {
  const t = {}, n = Sn(e.type);
  n === void 0 && (t.type = "Typ: ein Hex-Byte, z. B. 01");
  const i = e.src.trim() === "" ? void 0 : Me(e.src);
  e.src.trim() !== "" && i === void 0 && (t.src = "Quelle: 4 oder 6 Hex-Ziffern, z. B. 2001");
  const s = e.dst.trim() === "" ? void 0 : Me(e.dst);
  e.dst.trim() !== "" && s === void 0 && (t.dst = "Ziel: 4 oder 6 Hex-Ziffern, z. B. 1016");
  const r = e.data.trim() === "" ? void 0 : zn(e.data);
  if (e.data.trim() !== "" && r === void 0 && (t.data = "Data: Hex-Bytes, z. B. 01 10 16"), Object.keys(t).length > 0 || n === void 0) return { errors: t };
  if (i === void 0 && s === void 0 && r === void 0)
    return {
      errors: {
        src: "Mindestens Quelle, Ziel oder Data angeben – sonst passt die Bedingung auf jeden Frame."
      }
    };
  const o = { type: n };
  return i !== void 0 && (o.src = i), s !== void 0 && (o.dst = s), r !== void 0 && (o.data = r), { condition: o, errors: t };
}
function Os(e) {
  const t = {}, n = Me(e.destination);
  n === void 0 && (t.destination = "Ziel: 4 oder 6 Hex-Ziffern, z. B. 4002");
  const i = Sn(e.type);
  i === void 0 && (t.type = "Typ: ein Hex-Byte, meist 0D oder 0E");
  const s = zn(e.data);
  return s === void 0 && (t.data = "Data: Hex-Bytes, z. B. 1C 41 68 (höchstens 15)"), n === void 0 || i === void 0 || s === void 0 ? { errors: t } : { open: { destination: n, messageType: i, data: s }, errors: t };
}
var Bs = Object.defineProperty, Is = Object.getOwnPropertyDescriptor, A = (e, t, n, i) => {
  for (var s = i > 1 ? void 0 : i ? Is(t, n) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (s = (i ? o(t, n, s) : o(s)) || s);
  return i && s && Bs(t, n, s), s;
};
const he = "abb-welcome-wizard-card", Ms = "0.8.0", Wt = 10, Rs = 40, Fs = 900 * 1e3, Ps = {
  info: "mdi:information-outline",
  warning: "mdi:alert-outline",
  error: "mdi:alert-circle-outline"
};
function Le(e) {
  const t = new Date(e);
  return Number.isNaN(t.getTime()) ? "--:--:--" : t.toLocaleTimeString("de-DE", { hour12: !1 });
}
const R = (e) => e.toString(16).toUpperCase().padStart(2, "0");
let x = class extends P {
  constructor() {
    super(...arguments), this.page = 0, this.live = [], this.capture = null, this.now = Date.now(), this.toast = "", this.maskDoorCode = !1, this.showDoorCode = !1, this.indoorInput = "", this.receivedCount = 0, this.syncing = !1, this.lastSyncAt = 0, this.syncFailed = !1, this.onVisibilityChange = () => {
      this.capture && (this.capture = document.visibilityState === "hidden" ? Mt(this.capture) : Rt(this.capture, Date.now()));
    };
  }
  // ---- Lovelace API --------------------------------------------------------------------------------
  static getConfigElement() {
    return document.createElement(mn);
  }
  static getStubConfig(e) {
    return { entity: Object.keys(e?.states ?? {}).filter(
      (n) => n.startsWith("sensor.") && /intercom|abb|welcome|frame|doorbell/i.test(n)
    )[0] ?? "sensor.doorbell_intercom", capture_seconds: Wt };
  }
  setConfig(e) {
    if (!e || typeof e.entity != "string" || !e.entity.includes("."))
      throw new Error('Bitte "entity" auf den Debug-Textsensor setzen, z. B. sensor.doorbell_intercom.');
    if (e.capture_seconds !== void 0 && (typeof e.capture_seconds != "number" || e.capture_seconds < 2 || e.capture_seconds > 120))
      throw new Error('"capture_seconds" muss eine Zahl zwischen 2 und 120 sein.');
    if (e.indoor_address !== void 0 && ye(e.indoor_address) === void 0)
      throw new Error('"indoor_address" muss eine Adresse wie 0x1010 oder 0x000110 sein.');
    e.doors !== void 0 && Ct(e.doors);
    const t = this.config?.entity !== e.entity;
    if (this.config = e, t) {
      this.resubscribe();
      const n = ps(e.entity);
      this.session = n ?? Ft(e.entity, this.configDoors), !n && hs(e.entity) && this.showToast("Gespeicherte Sitzung nicht lesbar – eine Sicherung wurde im Browser abgelegt."), this.indoorInput = this.session.overrides.indoorAddress !== void 0 ? k(this.session.overrides.indoorAddress, this.session.overrides.indoorAddress > 65535) : "", this.live = [], this.capture = null, this.resumeCapture(e.entity);
    }
  }
  getCardSize() {
    return 10;
  }
  set hass(e) {
    const t = !this._hass, n = this.online;
    this._hass = e, this.capture && n !== this.online && (this.capture = this.online ? Rt(this.capture, Date.now()) : Mt(this.capture)), t && this.subscribe(), this.requestUpdate();
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
    this.session && this.page > this.resultPage && (this.page = this.resultPage), e.has("page") && e.get("page") !== void 0 && this.renderRoot.querySelector(".stepper .current")?.scrollIntoView?.({ block: "nearest", inline: "center", behavior: "smooth" }), e.has("capture") && (this.capture ? this.startTimer() : this.stopTimer(), this.config && Kt(this.config.entity, this.capture));
  }
  // ---- Event subscription (read-only: the card never calls services or sends frames) ---------------
  subscribe() {
    this.unsubscribe || !this._hass?.connection || !this.config || !this.isConnected || (this.unsubscribe = this._hass.connection.subscribeEvents((e) => this.onStateChanged(e), "state_changed").catch((e) => {
      console.error(`${he}: subscribing to state_changed failed`, e), this.unsubscribe = void 0;
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
    const t = gn(e, this.config.entity);
    if (!t) return;
    this.receivedCount++, this.live = [t, ...this.live].slice(0, Rs);
    const n = this.frameTest;
    if (n && (n.phase === "sending" || n.phase === "waiting")) {
      const i = We(t.line);
      if (i.ok && Li(i.frame, n.payload)) {
        const { frame: s } = i;
        this.frameTest = {
          ...n,
          phase: "confirmed",
          message: `${R(s.type)} von ${k(s.src, s.threeByte)}`
        }, window.clearTimeout(this.frameTestTimer);
      }
    }
    this.capture && (this.capture = Ui(this.capture, t, this.captureSeconds, Date.now()));
  }
  // ---- Capture -------------------------------------------------------------------------------------
  get captureSeconds() {
    return this.config?.capture_seconds ?? Wt;
  }
  startTimer() {
    this.timer === void 0 && (this.timer = window.setInterval(() => {
      this.now = Date.now(), this.capture && (this.capture.missed ? this.syncFromHistory() : Wi(this.capture, this.now) && this.finishCapture());
    }, 250));
  }
  stopTimer() {
    this.timer !== void 0 && window.clearInterval(this.timer), this.timer = void 0;
  }
  beginCapture(e) {
    const t = this.currentStep;
    t && (this.now = Date.now(), this.syncFailed = !1, this.capture = Ki(t.id, this.captureSeconds, e, this.now));
  }
  /** Fill in frames missed while offline from the recorder history (read-only). */
  async syncFromHistory() {
    const e = this.capture, t = Date.now();
    if (!(!e?.missed || e.syncAfter === void 0 || !this.online || !this._hass?.connection || !this.config || this.syncing || t - this.lastSyncAt < 2e3)) {
      this.syncing = !0, this.lastSyncAt = t;
      try {
        const { start: n, end: i } = Gi(e, t), s = await Xi(this._hass.connection, this.config.entity, n, i);
        this.capture?.armedAt === e.armedAt && (this.capture = Zi(this.capture, s, this.captureSeconds, Date.now()));
      } catch (n) {
        console.warn(`${he}: reading history failed`, n), this.capture?.armedAt === e.armedAt && !this.syncFailed && (this.syncFailed = !0, this.capture = { ...this.capture, missed: !1, syncAfter: void 0 }, this.showToast("Verpasste Frames konnten nicht aus dem Verlauf geladen werden."));
      } finally {
        this.syncing = !1;
      }
    }
  }
  /** Continue a capture that was interrupted by reloading the page or app. */
  resumeCapture(e) {
    const t = gs(e);
    if (!t) return;
    const n = this.steps.findIndex((i) => i.id === t.step);
    if (n < 0 || Date.now() - t.armedAt > Fs) {
      Kt(e, null);
      return;
    }
    this.page = n + 1, this.capture = { ...t, missed: !0, syncAfter: Date.now() + pt }, this.showToast("Unterbrochene Aufnahme wird fortgesetzt.");
  }
  finishCapture() {
    const e = this.capture;
    if (this.capture = null, !e || e.phase !== "recording") return;
    const t = Math.min(Date.now(), e.endsAt ?? Date.now());
    this.updateSession(
      es(this.session, e.step, {
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
    this.session = e, ms(e);
  }
  /** Doors from the card config (`doors:`), otherwise the default gate / house door / apartment setup. */
  get configDoors() {
    return this.config?.doors !== void 0 ? Ct(this.config.doors) : [...ct];
  }
  get steps() {
    return this.stepsCache?.doors !== this.session.doors && (this.stepsCache = { doors: this.session.doors, steps: us(this.session.doors) }), this.stepsCache.steps;
  }
  /** Page 0 is the start page, 1..steps.length are the recording steps, the last page is the result. */
  get resultPage() {
    return this.steps.length + 1;
  }
  get configIndoor() {
    return ye(this.config?.indoor_address);
  }
  get result() {
    const e = this.session.overrides.indoorAddress ?? this.configIndoor, t = this.analysisCache;
    if (t && t.session === this.session && t.indoor === e) return t.result;
    const n = Ci(this.session, { indoorAddress: e });
    return this.analysisCache = { session: this.session, indoor: e, result: n }, n;
  }
  /** Addresses used to highlight own frames: detected or manual, otherwise those the dials stand for. */
  get highlightAddresses() {
    const e = this.result.indoor?.address;
    return e !== void 0 ? [e] : Ee(this.session.dials, !1).map((t) => t.address);
  }
  exportSession() {
    const e = (/* @__PURE__ */ new Date()).toISOString().slice(0, 16).replace(/[:T]/g, "-");
    Ut(`abb-welcome-session-${e}.json`, yn(this.session), "application/json");
  }
  importSession() {
    this.renderRoot.querySelector("#import")?.click();
  }
  async onImportFile(e) {
    const t = e.target, n = t.files?.[0];
    if (t.value = "", !(!n || !this.config))
      try {
        const i = wn(await n.text());
        this.updateSession({ ...i, entity: this.config.entity }), this.indoorInput = i.overrides.indoorAddress !== void 0 ? k(i.overrides.indoorAddress, i.overrides.indoorAddress > 65535) : "", this.page = this.resultPage, this.showToast("Sitzung importiert.");
      } catch (i) {
        this.showToast(i instanceof Error ? i.message : String(i));
      }
  }
  resetSession() {
    this.config && window.confirm("Alle Aufnahmen dieser Sitzung löschen und neu beginnen?") && (fs(this.config.entity), this.updateSession(Ft(this.config.entity, this.configDoors)), this.indoorInput = "", this.capture = null, this.page = 0);
  }
  onDialInput(e, t) {
    const n = t.target.value, i = n === "" ? void 0 : Number(n);
    this.updateSession(
      is(this.session, {
        ...this.session.dials,
        [e]: i !== void 0 && Number.isInteger(i) ? i : void 0
      })
    );
  }
  onIndoorInput(e) {
    this.indoorInput = e.target.value;
    const t = this.indoorInput.trim();
    if (t === "") this.updateSession(Nt(this.session, void 0));
    else {
      const n = ye(t);
      n !== void 0 && this.updateSession(Nt(this.session, n));
    }
  }
  updateDoor(e, t) {
    let n = this.session.doors.map((i) => i.key === e ? { ...i, ...t } : i);
    t.default && (n = n.map((i) => i.key === e ? i : { ...i, default: !1 })), this.updateSession(ne(this.session, n));
  }
  renameDoor(e, t) {
    const n = t.target, i = n.value.trim();
    i === "" ? n.value = e.name : i !== e.name && this.updateDoor(e.key, { name: i });
  }
  addDoor() {
    this.session.doors.length >= le || this.updateSession(ne(this.session, [...this.session.doors, ci(this.session.doors)]));
  }
  removeDoor(e) {
    if (this.session.doors.length <= 1) return;
    const t = Ht(this.session, e);
    t > 0 && !window.confirm(`„${e.name}“ und ${t} Aufnahme(n) dieser Tür löschen?`) || this.updateSession(
      ne(
        this.session,
        this.session.doors.filter((n) => n.key !== e.key)
      )
    );
  }
  resetDoors() {
    const e = this.configDoors, t = this.session.doors.filter((n) => !e.some((i) => i.key === n.key)).reduce((n, i) => n + Ht(this.session, i), 0);
    t > 0 && !window.confirm(`Dabei gehen ${t} Aufnahme(n) entfernter Türen verloren. Fortfahren?`) || this.updateSession(ne(this.session, e));
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
    e && this.updateSession(ts(this.session, e.id, !0)), this.goTo(this.page + 1);
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
        const n = T(this.session, t.id), i = n.captures.length > 0 ? "done" : n.skipped ? "skipped" : "";
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
    const e = this.currentStep, t = e ? T(this.session, e.id).captures.length > 0 : !1;
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
    const e = this.config.entity, t = this.hass?.states[e], n = this.result.threeByte, i = Ee(this.session.dials, n), s = this.result.indoor?.method === "manual" ? void 0 : this.result.indoor?.address, r = this.indoorInput.trim() !== "" && ye(this.indoorInput) === void 0, o = this.configIndoor;
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
          Auf der Rückseite deiner Innenstation. Je nach Anlage stehen X10/X1 direkt als Ziffern in der
          Adresse (1/6 → 0x1016) oder werden dezimal umgerechnet (16 → 0x1010). Beides wird mit der gemessenen
          Adresse verglichen – nur zur Kontrolle, die echte Adresse kommt aus den Frames.
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
        ${i.length > 0 ? c`<div class="small" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
                ${sn(this.session.dials)} →
                ${i.map((a) => {
      const d = s === a.address;
      return c`<span
                    class="badge ${d ? "ok" : s !== void 0 && !d ? "" : "accent"}"
                    title=${d ? "passt zur gemessenen Adresse" : _e[a.reading]}
                    >${d ? c`<ha-icon icon="mdi:check"></ha-icon>` : m}${k(a.address, n)}
                    · ${_e[a.reading]}</span
                  >`;
    })}
                ${s !== void 0 && !i.some((a) => a.address === s) ? c`<span class="badge warning"
                        >gemessen ${k(s, n)} – passt zu keiner</span
                      >` : m}
              </div>` : m}
      </div>

      <details ?open=${o !== void 0 || this.session.overrides.indoorAddress !== void 0}>
        <summary>Innenstationsadresse manuell festlegen (für Profis)</summary>
        <div class="panel" style="border:none;padding:0">
          <p class="muted small">
            Normalerweise ermittelt der Assistent die Adresse selbst. Falls du sie kennst oder die Erkennung
            danebenliegt, kannst du sie hier
            vorgeben${o !== void 0 ? c` (Karten-Konfiguration:
                    <code>${k(o, o > 65535)}</code>)` : m}.
          </p>
          <label class="field"
            >Adresse (z. B. 0x1010 oder 0x000110)
            <input
              type="text"
              class=${r ? "invalid" : ""}
              placeholder=${o !== void 0 ? k(o, o > 65535) : "automatisch"}
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
                  <ha-icon icon=${De(t)}></ha-icon>
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
          <button class="btn" ?disabled=${e.length >= le} @click=${this.addDoor}>
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
    const n = this.highlightAddresses;
    return c`
      <div class="frames" role="log">
        ${e.map((i) => {
      const s = We(i.line);
      if (!s.ok)
        return c`<div class="frame unparsed" title="Nicht erkannt">
              <span class="time">${Le(i.time)}</span><span class="route">?</span
              ><span class="detail">${i.line}</span>
            </div>`;
      const r = s.frame, o = n.some((d) => dt(r, d)), a = n.length === 0 ? "" : o ? "own" : "foreign";
      return c`<div class="frame ${a}" title=${i.line}>
            <span class="time">${Le(i.time)}</span>
            <span class="route"
              >${j(r.src, r.threeByte)} ${r.retransmission ? "»" : "›"}
              ${j(r.dst, r.threeByte)}</span
            >
            <span class="detail"
              ><span class="type">${R(r.type)}</span>${r.data.length ? c` · ${K(r.data)}` : m}</span
            >
          </div>`;
    })}
      </div>
    `;
  }
  // ---- Recording step ------------------------------------------------------------------------------
  renderStep(e) {
    const n = T(this.session, e.id).captures.length;
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
    const e = ss(this.session);
    if (!e) return c``;
    const t = (this.now - e.getTime()) / 6e4, n = t >= Lt;
    return c`<div class="callout ${n ? "ok" : "warning"}">
      <ha-icon icon="mdi:timer-outline"></ha-icon>
      <span
        >Letztes Klingeln vor
        ${t < 1 ? "weniger als einer Minute" : `${Math.floor(t)} Minute(n)`}.
        ${n ? "Passt – die Schlüssel-Taste öffnet jetzt die Standard-Außenstation." : `Bitte noch etwas warten (mindestens ${Lt} Minuten).`}</span
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
    const t = T(this.session, e.id).captures;
    return c`
      <div class="captures">
        <div class="actions">
          <h3 style="margin:0;flex:1">Aufnahmen</h3>
          <button
            class="btn text danger"
            @click=${() => this.updateSession(Pt(this.session, e.id, t.length - 1))}
          >
            <ha-icon icon="mdi:undo"></ha-icon>Verwerfen
          </button>
        </div>
        ${t.map(
      (n, i) => c`
            <details class="capture-row">
              <summary>
                <ha-icon icon="mdi:chevron-right"></ha-icon>
                <span class="grow">Aufnahme ${i + 1} · ${Le(n.startedAt)}</span>
                <span class="badge ${n.lines.length ? "" : "warning"}">${n.lines.length} Frames</span>
                <button
                  class="icon"
                  title="Diese Aufnahme löschen"
                  @click=${(s) => {
        s.preventDefault(), this.updateSession(Pt(this.session, e.id, i));
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
          >${T(this.session, e.id).captures.flatMap((i) => i.lines).length} Frames als Baseline
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
              ${D(t.indoor.address, t.threeByte)}.</span
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
    const e = this.result, { indoor: t, threeByte: n } = e, i = this.device, s = Ss(e, this.session.doors, {
      maskDoorCode: this.maskDoorCode,
      device: this.exportSettings.mode === "full" ? i : void 0
    }), r = Object.values(this.session.steps).some((a) => a.captures.length > 0), o = this.session.overrides;
    return c`
      <h2><ha-icon icon="mdi:file-code-outline"></ha-icon>Ergebnis</h2>
      ${r ? m : c`<div class="callout info">
              <ha-icon icon="mdi:information-outline"></ha-icon>
              <span
                >Noch keine Aufnahmen. Geh die Schritte durch, importiere eine Sitzung – oder trag die Werte
                unten mit dem Stift von Hand ein.</span
              >
            </div>`}

      <div class="grid">
        <div class="panel stat">
          <span class="muted small edit-head"
            >Innenstation
            ${this.editButton(
      "Innenstationsadresse bearbeiten",
      () => this.startEdit({
        kind: "indoor",
        value: t ? pe(t.address, n) : ""
      })
    )}</span
          >
          ${this.editing?.kind === "indoor" ? this.renderAddressEditor(
      this.editing.value,
      this.editing.error,
      o.indoorAddress !== void 0
    ) : c`<span class="value">${t ? k(t.address, n) : "—"}</span>`}
          ${t ? c`<span class="small">
                  ${t.method === "manual" ? c`<span class="badge accent">manuell</span>` : t.method === "open" ? c`<span class="badge ok">aus Öffnen-Frames</span>` : c`<span class="badge warning">nach Häufigkeit</span>`}
                  ${t.dialMatch ? c`<span class="badge ok"
                          ><ha-icon icon="mdi:check"></ha-icon>passt zu den Drehreglern
                          (${_e[t.dialMatch]})</span
                        >` : t.dialMatch === null ? c`<span class="badge warning">passt nicht zu den Drehreglern</span>` : m}
                </span>` : c`<span class="muted small">Ohne Innenstation kein Export – bitte eintragen.</span>`}
        </div>
        <div class="panel stat">
          <label class="muted small edit-head" for="three-byte">Adresslänge</label>
          <select
            id="three-byte"
            @change=${(a) => {
      const d = a.target.value;
      this.updateOverrides({
        ...o,
        threeByte: d === "auto" ? void 0 : d === "3"
      });
    }}
          >
            <option value="auto" ?selected=${o.threeByte === void 0}>Automatisch</option>
            <option value="2" ?selected=${o.threeByte === !1}>2 Byte (XXXX)</option>
            <option value="3" ?selected=${o.threeByte === !0}>3 Byte (XXXXXX)</option>
          </select>
          <span class="small">
            <span class="value" style="font-size:1rem">${n ? "3 Byte" : "2 Byte"}</span>
            ${e.threeByteManual ? c`<span class="badge accent">manuell</span>` : m}
          </span>
        </div>
      </div>

      ${this.renderWarnings(e)}

      <div class="panel">
        <h3>Klingeln</h3>
        ${_n(this.session.doors).map((a) => this.renderRingResult(a, e))}
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
        ${An(this.session.doors).map((a) => this.renderOpenResult(a, e))}
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
                aria-checked=${this.exportSettings.mode === a}
                class=${this.exportSettings.mode === a ? "active" : ""}
                @click=${() => this.updateExportSettings({ mode: a })}
              >
                ${d}
              </button>`
    )}
        </div>
        ${this.exportSettings.mode === "full" ? this.renderDeviceFields(i) : m}
        <p class="muted small">
          ${this.exportSettings.mode === "full" ? c`Im ESPHome Device Builder beim Gerät auf <b>Bearbeiten</b>, den gesamten Inhalt durch
                  diese Datei ersetzen und <b>Installieren</b> (drahtlos). Benötigt in
                  <code>secrets.yaml</code>: wifi_ssid, wifi_password, api_encryption_key, ota_password,
                  ap_password – den API-Schlüssel aus der bisherigen Datei übernehmen.` : "In der ESPHome-Konfiguration deines ESP32 die gleichnamigen Abschnitte der Demo-Firmware ersetzen und per OTA installieren."}
          ${this.maskDoorCode ? "Türcodes sind durch Platzhalter ersetzt – gut zum Teilen in Foren." : c`<b>Enthält deinen Türcode – nicht öffentlich teilen.</b>`}
        </p>
        <div class="actions">
          <button class="btn primary" @click=${() => this.copyYaml(s)}>
            <ha-icon icon="mdi:content-copy"></ha-icon>Kopieren
          </button>
          <button
            class="btn"
            @click=${() => Ut(
      this.exportSettings.mode === "full" ? `${i.name}.yaml` : "abb-welcome-abschnitte.yaml",
      s,
      "text/yaml"
    )}
          >
            <ha-icon icon="mdi:download"></ha-icon>Herunterladen
          </button>
        </div>
        <pre class="yaml">${s}</pre>
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
    `;
  }
  /** Device settings: user edits, otherwise suggested from the debug sensor's device in Home Assistant. */
  /** Export settings of the session; the full device file is the default. */
  get exportSettings() {
    return { mode: "full", ...this.session.exportSettings };
  }
  updateExportSettings(e) {
    this.updateSession(ns(this.session, { ...this.session.exportSettings, ...e }));
  }
  /** The ESP32 as Home Assistant knows it (device registry of the debug sensor). */
  get registeredDevice() {
    const e = this.config ? this._hass?.entities?.[this.config.entity] : void 0, t = e?.device_id ? this._hass?.devices?.[e.device_id] : void 0, n = t?.connections?.find(([i]) => i === "mac")?.[1];
    return {
      name: t?.name ?? void 0,
      friendlyName: t?.name_by_user || t?.name || void 0,
      mac: n
    };
  }
  /** Device settings: saved values, otherwise suggested from the device in Home Assistant. */
  get device() {
    const e = this.registeredDevice, t = e.friendlyName ?? V.friendlyName, n = this.config ? this._hass?.states[this.config.entity]?.attributes.friendly_name : void 0, i = typeof n == "string" && n.startsWith(`${t} `) ? n.slice(t.length + 1) : V.debugSensorName, s = this.session.exportSettings;
    return {
      ...V,
      name: s.name ?? (e.name ? Xe(e.name) : V.name),
      friendlyName: s.friendlyName ?? t,
      debugSensorName: s.debugSensorName ?? i,
      nameAddMacSuffix: s.nameAddMacSuffix ?? !1
    };
  }
  renderDeviceFields(e) {
    const t = (s, r, o) => c`<label class="field"
        >${r}
        <input
          type="text"
          .value=${e[s] ?? ""}
          @change=${(a) => {
      const d = a.target.value.trim();
      this.updateExportSettings({
        [s]: d === "" ? void 0 : s === "name" ? Xe(d) : d
      });
    }}
        />
        ${o ? c`<span>${o}</span>` : m}
      </label>`, n = this.registeredDevice, i = ys(e, n);
    return c`<div class="fields device-fields">
        ${t("name", "Gerätename", "esphome name – muss zum bestehenden Gerät passen")}
        ${t("friendlyName", "Anzeigename")}
        ${t("debugSensorName", "Debug-Sensor", "Unverändert lassen, damit diese Karte ihn findet")}
      </div>
      <label class="switch">
        <input
          type="checkbox"
          .checked=${!!e.nameAddMacSuffix}
          @change=${(s) => this.updateExportSettings({ nameAddMacSuffix: s.target.checked })}
        />
        <span
          >name_add_mac_suffix
          <span class="muted"
            >– hängt die letzten 6 Stellen der MAC an den Namen
            an${n.mac ? ` (→ ${Ye({ ...e, nameAddMacSuffix: !0 }, n.mac)})` : ""}.
            Die Demo-Firmware nutzt das nicht.</span
          ></span
        >
      </label>
      ${i ? c`<div class="callout warning">
              <ha-icon icon="mdi:alert-outline"></ha-icon><span>${i}</span>
            </div>` : m}`;
  }
  async copyYaml(e) {
    this.showToast(
      await bs(e) ? "YAML kopiert." : "Kopieren nicht möglich – bitte manuell markieren."
    );
  }
  // ---- Manual values ----------------------------------------------------------------------------
  updateOverrides(e) {
    this.updateSession(vn(this.session, e));
    const t = this.session.overrides.indoorAddress;
    this.indoorInput = t !== void 0 ? k(t, t > 65535) : "";
  }
  startEdit(e) {
    this.editing = e;
  }
  editButton(e, t) {
    return c`<button class="icon edit" title=${e} aria-label=${e} @click=${t}>
      <ha-icon icon="mdi:pencil-outline"></ha-icon>
    </button>`;
  }
  editActions(e, t) {
    return c`<div class="actions">
      <button class="btn primary" @click=${e}><ha-icon icon="mdi:check"></ha-icon>Übernehmen</button>
      <button class="btn text" @click=${() => this.editing = void 0}>Abbrechen</button>
      ${t ? c`<button class="btn text danger" @click=${t}>
              <ha-icon icon="mdi:restore"></ha-icon>Analyse verwenden
            </button>` : m}
    </div>`;
  }
  /** Inline editor for the indoor station or an outdoor station address. */
  renderAddressEditor(e, t, n) {
    const i = () => this.editing, s = i(), r = () => {
      const a = Me(i().value);
      if (a === void 0) {
        this.editing = { ...i(), error: "4 oder 6 Hex-Ziffern, z. B. 1016" };
        return;
      }
      const d = this.session.overrides;
      if (s.kind === "indoor") this.updateOverrides({ ...d, indoorAddress: a });
      else {
        const u = d.rings?.[s.door] ?? {};
        this.updateOverrides({
          ...d,
          rings: { ...d.rings, [s.door]: { ...u, outdoorAddress: a } }
        });
      }
      this.editing = void 0;
    }, o = () => {
      const a = this.session.overrides;
      if (s.kind === "indoor") this.updateOverrides({ ...a, indoorAddress: void 0 });
      else {
        const d = { ...a.rings?.[s.door] ?? {} };
        delete d.outdoorAddress, this.updateOverrides({ ...a, rings: { ...a.rings, [s.door]: d } });
      }
      this.editing = void 0;
    };
    return c`<div class="editor">
      <label class="field"
        >Adresse (hex)
        <input
          type="text"
          class=${t ? "invalid" : ""}
          placeholder="1016"
          .value=${e}
          @input=${(a) => this.editing = { ...i(), value: a.target.value, error: void 0 }}
          @keydown=${(a) => a.key === "Enter" && r()}
        />
        ${t ? c`<span class="field-error">${t}</span>` : m}
      </label>
      ${this.editActions(r, n ? o : void 0)}
    </div>`;
  }
  renderRingResult(e, t) {
    const n = t.rings[e.door.key], { threeByte: i } = t, s = n.selected.length > 0, r = this.editing, o = r?.kind === "ring" && r.door === e.door.key ? r : void 0, a = r?.kind === "outdoor" && r.door === e.door.key ? r : void 0, d = e.door.type === "outdoor";
    return c`<div class="result-row">
      <ha-icon icon=${De(e.door)}></ha-icon>
      <div>
        <div class="row-head">
          <b>${e.name}</b>
          ${d && n.outdoorAddress !== void 0 && !a ? c`<span class="muted small">${D(n.outdoorAddress, i)}</span>` : m}
          ${n.outdoorManual ? c`<span class="badge accent">manuell</span>` : m}
          ${d && !a ? this.editButton(
      `Außenstation ${e.door.name} bearbeiten`,
      () => this.startEdit({
        kind: "outdoor",
        door: e.door.key,
        value: n.outdoorAddress !== void 0 ? pe(n.outdoorAddress, i) : ""
      })
    ) : m}
          <span class="spacer"></span>
          ${n.manual ? c`<span class="badge accent">manuell</span>` : m}
          ${s ? c`<span class="badge ok">binary_sensor.${e.id}</span>` : c`<span class="badge ${n.captures ? "warning" : ""}"
                  >${n.captures ? "nicht erkannt" : "nicht aufgenommen"}</span
                >`}
        </div>
        ${a ? this.renderAddressEditor(
      a.value,
      a.error,
      this.session.overrides.rings?.[e.door.key]?.outdoorAddress !== void 0
    ) : m}
        ${o ? this.renderRingEditor(o, n) : c`${n.manual ? this.renderManualConditions(n) : n.candidates.length > 0 ? this.renderCandidates(n) : m}
                <button
                  class="btn text small-btn"
                  @click=${() => this.startEdit({
      kind: "ring",
      door: e.door.key,
      rows: n.selected.map((u) => Ts(u, i)),
      errors: []
    })}
                >
                  <ha-icon icon="mdi:pencil-outline"></ha-icon>Bedingungen bearbeiten
                </button>`}
      </div>
    </div>`;
  }
  renderManualConditions(e) {
    const { threeByte: t } = this.result;
    return c`<div class="candidates">
      ${e.selected.map(
      (n) => c`<div class="candidate">
            <code
              >Typ ${R(n.type)} ${n.src !== void 0 ? `von ${j(n.src, t)}` : ""}
              ${n.dst !== void 0 ? `an ${j(n.dst, t)}` : ""}
              ${n.data ? `· ${K(n.data)}` : ""}</code
            >
            <span class="badge accent">manuell</span>
          </div>`
    )}
    </div>`;
  }
  renderRingEditor(e, t) {
    const n = () => this.editing, i = (a) => this.editing = { ...n(), rows: a, errors: [] }, s = () => {
      const a = n().rows.map(Cs);
      if (a.some((p) => !p.condition)) {
        this.editing = { ...n(), errors: a.map((p) => p.errors) };
        return;
      }
      const d = this.session.overrides, u = d.rings?.[e.door] ?? {};
      this.updateOverrides({
        ...d,
        rings: {
          ...d.rings,
          [e.door]: { ...u, conditions: a.map((p) => p.condition) }
        }
      }), this.editing = void 0;
    }, r = () => {
      const a = this.session.overrides, d = { ...a.rings?.[e.door] ?? {} };
      delete d.conditions, this.updateOverrides({ ...a, rings: { ...a.rings, [e.door]: d } }), this.editing = void 0;
    }, o = (a, d, u, p, l) => {
      const f = e.errors[d]?.[u];
      return c`<label class="field"
        >${p}
        <input
          type="text"
          class=${f ? "invalid" : ""}
          placeholder=${l}
          .value=${a[u]}
          @input=${(v) => i(
        n().rows.map(
          (h, y) => y === d ? { ...h, [u]: v.target.value } : h
        )
      )}
        />
        ${f ? c`<span class="field-error">${f}</span>` : m}
      </label>`;
    };
    return c`<div class="editor">
      <p class="muted small">
        Eine Bedingung passt, wenn Typ und alle ausgefüllten Felder übereinstimmen; leer = beliebig. Der
        Klingel-Sensor löst aus, wenn irgendeine Bedingung passt.
      </p>
      ${e.rows.map(
      (a, d) => c`<div class="condition-row">
            ${o(a, d, "type", "Typ", "01")} ${o(a, d, "src", "Quelle", "beliebig")}
            ${o(a, d, "dst", "Ziel", "beliebig")} ${o(a, d, "data", "Data", "beliebig")}
            <button
              class="icon"
              title="Bedingung entfernen"
              aria-label="Bedingung entfernen"
              @click=${() => i(n().rows.filter((u, p) => p !== d))}
            >
              <ha-icon icon="mdi:delete-outline"></ha-icon>
            </button>
          </div>`
    )}
      <button
        class="btn text small-btn"
        @click=${() => i([...n().rows, { type: "01", src: "", dst: "", data: "" }])}
      >
        <ha-icon icon="mdi:plus"></ha-icon>Bedingung hinzufügen
      </button>
      ${this.editActions(s, t.manual ? r : void 0)}
    </div>`;
  }
  renderOpenResult(e, t) {
    const n = t.opens[e.door.key], i = T(this.session, O(e.door)).captures.length > 0, s = this.editing?.kind === "open" && this.editing.door === e.door.key ? this.editing : void 0;
    return c`<div class="result-row">
      <ha-icon icon=${e.icon}></ha-icon>
      <div>
        <div class="row-head">
          <b>${e.name}</b>
          ${n?.manual ? c`<span class="badge accent">manuell</span>` : m}
          ${s ? m : this.editButton(
      `Öffnen-Frame ${e.door.name} bearbeiten`,
      () => this.startEdit({
        kind: "open",
        door: e.door.key,
        draft: Ds(n ?? void 0, t.threeByte),
        errors: {}
      })
    )}
          <span class="spacer"></span>
          ${n ? c`<span class="badge ok">lock.${e.id}</span>` : c`<span class="badge ${i ? "warning" : ""}"
                  >${i ? "nicht erkannt" : "nicht aufgenommen"}</span
                >`}
        </div>
        ${s ? this.renderOpenEditor(s, !!n?.manual) : n ? this.renderOpen(n) : m}
        ${n ? this.renderFrameTest(e, n) : m}
      </div>
    </div>`;
  }
  async runFrameTest(e, t, n) {
    if (this._hass) {
      this.frameTest = { door: e, phase: "sending", payload: n };
      try {
        await Hi(this._hass, t, n), this.frameTest?.door === e && this.frameTest.phase === "sending" && (this.frameTest = { ...this.frameTest, phase: "waiting" }), window.clearTimeout(this.frameTestTimer), this.frameTestTimer = window.setTimeout(() => {
          this.frameTest?.door === e && this.frameTest.phase === "waiting" && (this.frameTest = { ...this.frameTest, phase: "noreply" });
        }, Fi);
      } catch (i) {
        const s = i instanceof Error ? i.message : i?.message ?? String(i);
        this.frameTest = { door: e, phase: "error", payload: n, message: s };
      }
    }
  }
  /** "Testen": send the shown open frame through the firmware's send_frame action, after confirmation. */
  renderFrameTest(e, t) {
    const n = this.result.indoor;
    if (!n || this.editing) return m;
    const { threeByte: i } = this.result;
    if (this._hass?.user?.is_admin !== !0)
      return c`<p class="muted small">Live-Test nur für Administratoren.</p>`;
    const s = Pi(
      this._hass.services,
      Ye(this.device, this.registeredDevice.mac)
    );
    if (!s)
      return c`<p class="muted small">
        <button class="btn text small-btn" disabled><ha-icon icon="mdi:send"></ha-icon>Testen</button>
        Zum Testen die komplette Datei (mit Aktion <code>send_frame</code>) auf den ESP32 spielen – danach
        erscheint der Test hier.
      </p>`;
    const r = Ni(n.address, t, i), o = this.frameTest?.door === e.door.key ? this.frameTest : void 0, a = `[${j(r.source, i)} > ${j(
      r.destination,
      i
    )}] ${R(r.message_type)} ${this.showDoorCode ? K(r.data) : r.data.map(() => "••").join(" ")}`, d = () => this.frameTest = void 0;
    switch (o?.phase) {
      case "confirm":
        return c`<div class="callout warning">
          <ha-icon icon="mdi:door-open"></ha-icon>
          <span
            >Sendet <code>${a}</code> auf den Bus – „${e.door.name}“ öffnet sich wirklich.
            <span class="actions" style="margin-top:8px">
              <button class="btn primary" @click=${() => this.runFrameTest(e.door.key, s, r)}>
                <ha-icon icon="mdi:send"></ha-icon>Senden
              </button>
              <button class="btn text" @click=${d}>Abbrechen</button>
            </span></span
          >
        </div>`;
      case "sending":
      case "waiting":
        return c`<div class="callout info" role="status">
          <ha-icon icon="mdi:timer-sand"></ha-icon><span>Gesendet – warte auf die Bestätigung der Tür …</span>
        </div>`;
      case "confirmed":
        return c`<div class="callout ok" role="status">
          <ha-icon icon="mdi:check-circle-outline"></ha-icon>
          <span
            >Bestätigt: ${o.message}. Der Öffnen-Frame funktioniert.
            <button class="btn text small-btn" @click=${d}>OK</button></span
          >
        </div>`;
      case "noreply":
        return c`<div class="callout warning" role="status">
          <ha-icon icon="mdi:help-circle-outline"></ha-icon>
          <span
            >Keine Bestätigung (${R(r.message_type | 128)}) empfangen. Ging die Tür trotzdem auf,
            stimmt der Befehl; sonst Ziel, Typ und Data prüfen.
            <button class="btn text small-btn" @click=${d}>OK</button></span
          >
        </div>`;
      case "error":
        return c`<div class="callout error" role="status">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <span
            >Senden fehlgeschlagen: ${o.message}
            <button class="btn text small-btn" @click=${d}>OK</button></span
          >
        </div>`;
      default:
        return c`<button
          class="btn small-btn"
          ?disabled=${!!this.frameTest && ["confirm", "sending", "waiting"].includes(this.frameTest.phase)}
          @click=${() => this.frameTest = { door: e.door.key, phase: "confirm", payload: r }}
        >
          <ha-icon icon="mdi:send"></ha-icon>Testen
        </button>`;
    }
  }
  renderOpenEditor(e, t) {
    const n = () => this.editing, i = () => {
      const o = Os(n().draft);
      if (!o.open) {
        this.editing = { ...n(), errors: o.errors };
        return;
      }
      const a = this.session.overrides;
      this.updateOverrides({ ...a, opens: { ...a.opens, [e.door]: o.open } }), this.editing = void 0;
    }, s = () => {
      const o = { ...this.session.overrides.opens };
      delete o[e.door], this.updateOverrides({ ...this.session.overrides, opens: o }), this.editing = void 0;
    }, r = (o, a, d) => {
      const u = e.errors[o];
      return c`<label class="field"
        >${a}
        <input
          type="text"
          class=${u ? "invalid" : ""}
          placeholder=${d}
          .value=${e.draft[o]}
          @input=${(p) => this.editing = {
        ...n(),
        draft: { ...n().draft, [o]: p.target.value },
        errors: {}
      }}
        />
        ${u ? c`<span class="field-error">${u}</span>` : m}
      </label>`;
    };
    return c`<div class="editor">
      <p class="muted small">
        Der Befehl, den die Innenstation zum Öffnen sendet (Quelle ist immer die Innenstation). Data ist der
        Türcode – nicht öffentlich teilen.
      </p>
      <div class="condition-row open-row">
        ${r("destination", "Ziel", "4002")} ${r("type", "Typ", "0D")}
        ${r("data", "Data", "1C 41 68")}
      </div>
      ${this.editActions(i, t ? s : void 0)}
    </div>`;
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
            <ha-icon icon=${Ps[r.severity]}></ha-icon><span>${r.message}</span>
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
      const r = (a) => j(a, t), o = s.src !== void 0 && s.dst !== void 0 ? `${r(s.src)} › ${r(s.dst)}` : s.src !== void 0 ? `von ${r(s.src)}` : s.dst !== void 0 ? `an ${r(s.dst)}` : "";
      return `Typ ${R(s.type)} ${o}${s.data ? ` · ${K(s.data)}` : ""}`;
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
    const { threeByte: t } = this.result, n = this.showDoorCode ? K(e.data) : e.data.map(() => "••").join(" ");
    return c`${e.derived ? c`<span class="badge warning" title="Kein 0D/0E empfangen – aus der Bestätigung abgeleitet"
              >abgeleitet – unbestätigt</span
            >` : m}
      <dl class="kv" style="margin:6px 0 0">
        <dt>Ziel</dt>
        <dd>${D(e.destination, t)}</dd>
        <dt>Typ</dt>
        <dd>${R(e.messageType)} ${e.messageType === 14 ? "(Schiebetür)" : "(Türöffner)"}</dd>
        <dt>Türcode</dt>
        <dd>${n || "—"}</dd>
        <dt>Bestätigung</dt>
        <dd>
          ${e.confirmation ? `${R(e.confirmation.messageType)} von ${k(e.confirmation.source, t)}` : "—"}
        </dd>
        <dt>Stabilität</dt>
        <dd>${e.occurrences}/${e.captures} Aufnahmen</dd>
      </dl>`;
  }
};
x.styles = vs;
A([
  $()
], x.prototype, "config", 2);
A([
  $()
], x.prototype, "session", 2);
A([
  $()
], x.prototype, "page", 2);
A([
  $()
], x.prototype, "live", 2);
A([
  $()
], x.prototype, "capture", 2);
A([
  $()
], x.prototype, "now", 2);
A([
  $()
], x.prototype, "toast", 2);
A([
  $()
], x.prototype, "maskDoorCode", 2);
A([
  $()
], x.prototype, "showDoorCode", 2);
A([
  $()
], x.prototype, "editing", 2);
A([
  $()
], x.prototype, "frameTest", 2);
A([
  $()
], x.prototype, "indoorInput", 2);
A([
  $()
], x.prototype, "receivedCount", 2);
A([
  $()
], x.prototype, "waitForFrame", 2);
x = A([
  Pe(he)
], x);
window.customCards = window.customCards ?? [];
window.customCards.some((e) => e.type === he) || window.customCards.push({
  type: he,
  name: "ABB-Welcome Wizard",
  description: "Assistent zum Einmessen von Klingeln und Türöffnern einer Busch-/ABB-Welcome-Anlage.",
  preview: !1,
  documentationURL: "https://github.com/jako-dev/esp32-abb-wizard-card"
});
console.info(
  `%c ABB-WELCOME-WIZARD-CARD %c ${Ms} `,
  "background:#03a9f4;color:#fff",
  "background:#444;color:#fff"
);
const Qe = "abb-welcome-door-card", we = {
  layout: "tiles",
  ring_window: 60,
  hold_time: 800,
  action: "unlock"
}, ke = (e, t, n) => {
  if (e !== void 0) {
    if (typeof e == "string" && t.includes(e)) return e;
    throw new Error(`"${n}" muss einer dieser Werte sein: ${t.join(", ")}.`);
  }
}, je = (e, t, n) => {
  if (!(e === void 0 || e === "" || e === null)) {
    if (typeof e != "string" || !e.startsWith(`${t}.`))
      throw new Error(`"${n}" muss eine ${t}-Entität sein (z. B. ${t}.haustuer).`);
    return e;
  }
};
function Ns(e) {
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
    const d = o, u = typeof d.name == "string" && d.name.trim() !== "" ? d.name.trim() : void 0, p = `Tür ${u ? `„${u}“` : a + 1}`;
    try {
      const l = {
        name: u ?? `Tür ${a + 1}`,
        lock: je(d.lock, "lock", "lock"),
        doorbell: je(d.doorbell, "binary_sensor", "doorbell"),
        camera: je(d.camera, "camera", "camera"),
        camera_view: ke(d.camera_view, ["ring", "always"], "camera_view"),
        confirm: ke(d.confirm, ["slide", "hold", "tap", "dialog"], "confirm"),
        action: ke(d.action, ["unlock", "open"], "action")
      };
      if (typeof d.icon == "string" && d.icon !== "" && (l.icon = d.icon), d.users !== void 0) {
        if (!Array.isArray(d.users) || d.users.some((f) => typeof f != "string"))
          throw new Error('"users" muss eine Liste von Benutzer-IDs sein.');
        l.users = d.users;
      }
      if (!l.lock && !l.doorbell) throw new Error('braucht mindestens "lock" oder "doorbell".');
      for (const f of Object.keys(l))
        l[f] === void 0 && delete l[f];
      return l;
    } catch (l) {
      throw new Error(`${p}: ${l.message}`);
    }
  }), r = t.layout === "compact" ? "bar" : t.layout;
  return {
    ...t,
    layout: ke(r, ["tiles", "rows", "buttons", "bar"], "layout"),
    doors: s
  };
}
function Ke(e, t, n = "main") {
  const i = e.confirm ?? (t === "buttons" ? "hold" : "slide");
  return i === "slide" && n === "main" && (t === "buttons" || t === "bar") ? "hold" : i;
}
const Gt = (e, t) => typeof e?.attributes.friendly_name == "string" ? e.attributes.friendly_name : t;
function Tn(e) {
  const t = Object.keys(e).sort(), n = t.filter((r) => r.startsWith("lock.")), i = /* @__PURE__ */ new Set(), s = [];
  for (const r of t.filter((o) => /^binary_sensor\..*klingel_?/.test(o))) {
    const o = r.replace(/^binary_sensor\..*klingel_?/, ""), a = o ? n.find((u) => !i.has(u) && u.endsWith(o)) : void 0;
    a && i.add(a);
    const d = Gt(e[r], o).replace(/^.*Klingel\s*/i, "") || o;
    s.push({ name: d, doorbell: r, ...a ? { lock: a } : {} });
  }
  for (const r of n.filter((o) => !i.has(o)))
    s.push({ name: Gt(e[r], r), lock: r });
  return s;
}
function Vt(e) {
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
const Ue = (e) => e === "unlocking" || e === "unlocked" || e === "opening" || e === "open", Hs = (e) => e === "unlocked" || e === "open";
function Ls(e, t, n) {
  if (e === void 0 || n <= 0) return 0;
  const i = Math.ceil((e + n * 1e3 - t) / 1e3);
  return i > 0 ? Math.min(i, n) : 0;
}
function js(e, t) {
  const n = Math.max(0, Math.round((t - e) / 1e3));
  if (n < 45) return "gerade eben";
  if (n < 3600) return `vor ${Math.max(1, Math.round(n / 60))} min`;
  const i = new Date(e), s = i.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }), r = new Date(t), o = Math.round(
    (new Date(r.getFullYear(), r.getMonth(), r.getDate()).getTime() - new Date(i.getFullYear(), i.getMonth(), i.getDate()).getTime()) / 864e5
  );
  return o === 0 ? n < 6 * 3600 ? `vor ${Math.round(n / 3600)} h` : `heute ${s}` : o === 1 ? `gestern ${s}` : `${i.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })} ${s}`;
}
function Zt(e, t) {
  return !e.users || e.users.length === 0 || t !== void 0 && e.users.includes(t);
}
function Ks(e, t, n) {
  return e.map((i, s) => ({ door: i, index: s })).sort((i, s) => {
    const r = t(i.door) > 0, o = t(s.door) > 0;
    return r !== o ? r ? -1 : 1 : r && o ? n(s.door) - n(i.door) : i.index - s.index;
  }).map((i) => i.door);
}
var Us = Object.defineProperty, Ws = Object.getOwnPropertyDescriptor, vt = (e, t, n, i) => {
  for (var s = i > 1 ? void 0 : i ? Ws(t, n) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (s = (i ? o(t, n, s) : o(s)) || s);
  return i && s && Us(t, n, s), s;
};
const Dn = "abb-welcome-door-card-editor", Gs = [
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
], Vs = [
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
], Zs = {
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
}, qs = {
  lock: "Schloss aus dem ABB-Welcome-Wizard oder jedes andere, z. B. Aqara.",
  doorbell: "z. B. binary_sensor.klingel_tor – hebt die Tür beim Klingeln hervor.",
  action: "„Öffnen“ nur für Schlösser mit Falle (z. B. Nuki „Tür aufziehen“)."
};
let me = class extends P {
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
    const e = Tn(this.hass?.states ?? {}), t = new Set(this.config.doors.flatMap((i) => [i.lock, i.doorbell]).filter(Boolean)), n = e.filter((i) => !t.has(i.lock) && !t.has(i.doorbell));
    this.updateDoors([...this.config.doors, ...n]);
  }
  render() {
    if (!this.config) return m;
    const e = this.config.doors, t = (i) => Zs[i.name] ?? i.name, n = (i) => qs[i.name];
    return c`
      <ha-form
        .hass=${this.hass}
        .data=${this.config}
        .schema=${Gs}
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
              .schema=${Vs}
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
me.styles = nt`
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
vt([
  $()
], me.prototype, "hass", 2);
vt([
  $()
], me.prototype, "config", 2);
me = vt([
  Pe(Dn)
], me);
const Xs = nt`
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
var Ys = Object.defineProperty, Js = Object.getOwnPropertyDescriptor, B = (e, t, n, i) => {
  for (var s = i > 1 ? void 0 : i ? Js(t, n) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (s = (i ? o(t, n, s) : o(s)) || s);
  return i && s && Ys(t, n, s), s;
};
const Qs = 8e3, er = 4e3, tr = 6e3, nr = 168 * 3600 * 1e3, ir = 0.85, sr = 4, qt = 2 * Math.PI * 48, M = (e) => c`<ha-icon icon=${e}></ha-icon>`;
let z = class extends P {
  constructor() {
    super(...arguments), this.now = Date.now(), this.lastRings = {}, this.dismissed = {}, this.pending = {};
  }
  static getConfigElement() {
    return document.createElement(Dn);
  }
  static getStubConfig(e) {
    const t = Tn(e?.states ?? {});
    return { doors: t.length > 0 ? t : [{ name: "Haustür", lock: "lock.haustuer" }] };
  }
  setConfig(e) {
    this.config = Ns(e), this.pending = {}, this.confirming = void 0, this.loadRingHistory();
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
    return this.config?.layout ?? we.layout;
  }
  /** Last ring per doorbell from the recorder, so "klingelte vor …" survives reloads and restarts. */
  async loadRingHistory() {
    const e = (this.config?.doors ?? []).flatMap((n) => n.doorbell ? [n.doorbell] : []), t = e.join(",");
    if (!(!this._hass?.connection?.sendMessagePromise || e.length === 0 || this.historyLoadedFor === t)) {
      this.historyLoadedFor = t;
      try {
        const n = Date.now(), i = await bn(this._hass.connection, e, n - nr, n), s = { ...Yi(i) };
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
      i.phase === "sent" && this.now - i.at > Qs ? (t[s] = { phase: "noresponse", at: this.now }, e = !0) : i.phase !== "sending" && i.phase !== "sent" && this.now - i.at > er && (delete t[s], e = !0);
    }
    e && (this.pending = t);
  }
  updatePending(e) {
    if (!this.config) return;
    let t = !1;
    const n = { ...this.pending };
    this.config.doors.forEach((i, s) => {
      n[s]?.phase === "sent" && i.lock && Ue(e.states[i.lock]?.state) && (n[s] = { phase: "done", at: Date.now() }, this.haptic("success"), t = !0);
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
        const i = n === "lock" || Ue(this._hass.states[t.lock]?.state);
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
    this.confirming = void 0, this.callLock(e, t, t.action ?? we.action);
  }
  holdTime() {
    return this.config?.hold_time ?? we.hold_time;
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
        this.confirming?.index === e || n === "tap" ? this.openDoor(e, t) : this.confirming = { index: e, until: Date.now() + tr };
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
      s.getBoundingClientRect().width - i.getBoundingClientRect().width - 2 * sr
    );
    i.setPointerCapture?.(n.pointerId), this.drag = { id: e, x: 0, max: r, start: n.clientX };
  }
  slideMove(e, t) {
    this.drag?.id === e && (this.drag = { ...this.drag, x: Math.min(this.drag.max, Math.max(0, t.clientX - this.drag.start)) });
  }
  slideEnd(e, t, n) {
    if (this.drag?.id !== e) return;
    const i = this.drag.x >= this.drag.max * ir;
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
    const n = this._hass?.states[e.doorbell]?.state === "on", i = this.config?.ring_window ?? we.ring_window;
    return Math.max(n ? i : 0, Ls(t, this.now, i));
  }
  dismiss(e) {
    e.doorbell && (this.dismissed = { ...this.dismissed, [e.doorbell]: this.lastRing(e) });
  }
  lockState(e) {
    return e.lock ? this._hass?.states[e.lock]?.state : void 0;
  }
  tone(e) {
    return e.lock ? Vt(this.lockState(e)).tone : "locked";
  }
  operable(e) {
    return !!e.lock && Zt(e, this._hass?.user?.id);
  }
  doorIcon(e, t) {
    return e.icon ? e.icon : t ? "mdi:bell-ring" : e.lock ? Ue(this.lockState(e)) ? "mdi:lock-open-variant" : "mdi:lock" : "mdi:bell";
  }
  stateLine(e, t = !1) {
    const n = [];
    if (e.lock && n.push(Vt(this.lockState(e)).label), this.remaining(e) > 0) n.push("klingelt");
    else if (!t) {
      const i = this.lastRing(e);
      i > 0 ? n.push(`klingelte ${js(i, this.now)}`) : e.lock || n.push("Klingel");
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
    const e = Ks(
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
          >${M(this.doorIcon(e, t))}</span
        >
        <span class="txt">
          <span class="name">${e.name}</span>
          <span class="state">${this.stateLine(e)}</span>
        </span>
      </button>
      ${t ? c`<span class="badge">${M("mdi:bell-ring")}${this.remaining(e)} s</span>` : m}
      ${n ?? m}
    </div>`;
  }
  renderLockAgain(e, t) {
    return !this.operable(e) || !Hs(this.lockState(e)) ? m : c`<button
      class="mini"
      title="${e.name} verriegeln"
      aria-label="${e.name} verriegeln"
      @click=${() => this.callLock(t, e, "lock")}
    >
      ${M("mdi:lock")}
    </button>`;
  }
  renderHint(e, t) {
    const n = this.pending[t];
    return n?.phase === "error" ? c`<div class="hint error">Fehler: ${n.message}</div>` : this.hint?.index === t ? c`<div class="hint">${this.hint.text}</div>` : e.lock && !Zt(e, this._hass?.user?.id) ? c`<div class="hint">Öffnen nur für berechtigte Personen</div>` : m;
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
    const i = this.tone(e) === "unavailable", s = Ke(e, this.layout, n.place), r = n.size ?? "full", o = n.filled ? "filled" : "";
    if (s === "slide") {
      const u = `${n.place ?? "main"}-${t}`, p = this.drag?.id === u, l = p ? this.drag.x : 0, f = p ? 1 - l / this.drag.max : 1, v = this.feedbackClass(t);
      return c`<div
        class="slider ${r} ${o} ${v} ${p ? "dragging" : ""} ${i ? "disabled" : ""}"
        style="--x:${l}px;--fade:${f}"
      >
        <span class="slabel"
          >${this.actionLabel(t, r === "small" ? "Öffnen" : "Zum Öffnen schieben")}</span
        >
        <button
          class="knob"
          aria-label="${e.name} öffnen – schieben oder Eingabetaste"
          ?disabled=${i || this.isBusy(t)}
          @pointerdown=${(h) => this.slideStart(u, t, h)}
          @pointermove=${(h) => this.slideMove(u, h)}
          @pointerup=${() => this.slideEnd(u, t, e)}
          @pointercancel=${() => this.drag = void 0}
          @keydown=${(h) => {
        (h.key === "Enter" || h.key === " " || h.key === "ArrowRight") && (h.preventDefault(), this.openDoor(t, e));
      }}
        >
          ${M(v === "done" ? "mdi:check" : v === "failed" ? "mdi:alert" : "mdi:chevron-double-right")}
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
      ${M(this.pending[t]?.phase === "done" ? "mdi:check" : "mdi:door-open")}
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
      const i = this.remaining(t) > 0, s = Ke(t, "buttons"), r = this.pressHandlers(n, t, s), o = this.tone(t) === "unavailable" || this.isBusy(n), a = this.pending[n]?.phase;
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
                      ${Kn`<circle class="ring-bg" cx="52" cy="52" r="48"></circle>
                    <circle class="ring-fg" cx="52" cy="52" r="48" style="stroke-dasharray:${qt};stroke-dashoffset:${qt}"></circle>`}
                    </svg>
                    <span class="face"
                      >${M(a === "done" ? "mdi:check" : t.icon ?? "mdi:key-variant")}</span
                    >
                  </button>
                  <span class="keyhint"
                    >${this.actionLabel(n, s === "hold" ? "Gedrückt halten" : "Tippen zum Öffnen")}</span
                  >` : c`<span class="face idle">${M(this.doorIcon(t, i))}</span>`}
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
        <span class="hero-ico">${M(n ? "mdi:check" : "mdi:bell-ring")}</span>
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
    const i = this.operable(e) && this.tone(e) !== "unavailable", s = Ke(e, "bar"), r = i ? this.pressHandlers(t, e, s) : { click: () => this.moreInfo(e.doorbell) }, o = this.pending[t] || this.confirming?.index === t ? this.actionLabel(t, "") : this.stateLine(e, !0);
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
        >${M(this.doorIcon(e, n))}</span
      >
      <span class="txt"><span class="name">${e.name}</span><span class="state">${o}</span></span>
    </button>`;
  }
};
z.styles = Xs;
B([
  $()
], z.prototype, "config", 2);
B([
  $()
], z.prototype, "now", 2);
B([
  $()
], z.prototype, "lastRings", 2);
B([
  $()
], z.prototype, "dismissed", 2);
B([
  $()
], z.prototype, "pending", 2);
B([
  $()
], z.prototype, "holding", 2);
B([
  $()
], z.prototype, "drag", 2);
B([
  $()
], z.prototype, "confirming", 2);
B([
  $()
], z.prototype, "hint", 2);
z = B([
  Pe(Qe)
], z);
window.customCards = window.customCards ?? [];
window.customCards.some((e) => e.type === Qe) || window.customCards.push({
  type: Qe,
  name: "ABB-Welcome Türen",
  description: "Türen öffnen und verriegeln, mit Klingel-Anzeige – für ABB-Welcome-Schlösser und jedes andere Schloss.",
  preview: !0,
  documentationURL: "https://github.com/jako-dev/esp32-abb-wizard-card"
});
