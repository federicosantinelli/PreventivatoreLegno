import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { getPricing, PRICING_STORAGE_KEY } from './data/pricing'
import './App.css'

const money = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })
const decimal = new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function calculateQuote({ width, height, depth, shelves, wood, finish, delivery }, pricing) {
  const retro = width * height
  const lato = height * depth
  const ripiano = depth * width
  const externalArea = 2 * (retro + lato + ripiano) / 10000
  const shelfArea = 2 * shelves * ripiano / 10000
  const totalArea = externalArea + shelfArea
  const woodCost = totalArea * wood.price
  const finishCost = totalArea * finish.price
  const subtotal = woodCost + finishCost + delivery.price
  const vat = subtotal * pricing.vat
  return { externalArea, shelfArea, totalArea, woodCost, finishCost, subtotal, vat, total: subtotal + vat }
}

function Icon({ children, size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
}

function ThreeViewer({ width, height, depth, shelves, color, finish }) {
  const mount = useRef(null)
  useEffect(() => {
    const element = mount.current
    if (!element) return undefined
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#f2f1ed')
    const camera = new THREE.PerspectiveCamera(28, element.clientWidth / element.clientHeight, 0.1, 100)
    camera.position.set(5.4, 3.6, 7.4)
    camera.lookAt(0, 0.1, 0)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(element.clientWidth, element.clientHeight)
    element.appendChild(renderer.domElement)
    scene.add(new THREE.HemisphereLight('#fff8e9', '#8b765d', 2.4))
    const key = new THREE.DirectionalLight('#fff4d8', 3)
    key.position.set(4, 7, 5)
    scene.add(key)
    const group = new THREE.Group()
    const finishSettings = {
      Grezzo: { roughness: 0.95, clearcoat: 0 },
      'Cera naturale': { roughness: 0.72, clearcoat: 0.08 },
      'Verniciato opaco': { roughness: 0.48, clearcoat: 0.18 },
      Laccato: { roughness: 0.22, clearcoat: 0.65 },
    }[finish] || { roughness: 0.72, clearcoat: 0.08 }
    const material = new THREE.MeshPhysicalMaterial({ color, ...finishSettings })
    const backMaterial = new THREE.MeshPhysicalMaterial({ color, ...finishSettings, roughness: Math.min(1, finishSettings.roughness + 0.12) })
    const w = 3.2
    const h = Math.max(4.5, (height / width) * w)
    const d = Math.max(1.1, Math.min(2.4, depth / width * w))
    const cameraDistance = Math.max(12, h * 3.2)
    camera.position.set(cameraDistance * 0.45, cameraDistance * 0.22, cameraDistance * 0.9)
    camera.lookAt(0, 0, 0)
    const thickness = 0.16
    const box = (x, y, z, sx, sy, sz, mat = material) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat)
      mesh.position.set(x, y, z)
      group.add(mesh)
    }
    box(0, h / 2, 0, w, thickness, d)
    box(0, -h / 2, 0, w, thickness, d)
    box(-w / 2, 0, 0, thickness, h, d)
    box(w / 2, 0, 0, thickness, h, d)
    box(0, 0, -d / 2 + thickness / 2, w - thickness, h - thickness, thickness, backMaterial)
    for (let index = 0; index < shelves; index += 1) {
      const y = -h / 2 + (h / (shelves + 1)) * (index + 1)
      box(0, y, 0, w - thickness * 1.5, thickness * 0.85, d - thickness)
    }
    group.rotation.set(0, -0.3, 0)
    scene.add(group)
    const pointer = { x: 0, y: 0 }
    const onPointerMove = (event) => {
      const bounds = element.getBoundingClientRect()
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
      pointer.y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1
    }
    const onPointerLeave = () => {
      pointer.x = 0
      pointer.y = 0
    }
    element.addEventListener('pointermove', onPointerMove)
    element.addEventListener('pointerleave', onPointerLeave)
    const resize = () => {
      camera.aspect = element.clientWidth / element.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(element.clientWidth, element.clientHeight)
    }
    window.addEventListener('resize', resize)
    let frame
    const animate = () => {
      group.rotation.y += (-0.3 + pointer.x * 0.18 - group.rotation.y) * 0.08
      group.rotation.x += (pointer.y * 0.06 - group.rotation.x) * 0.08
      renderer.render(scene, camera)
      frame = requestAnimationFrame(animate)
    }
    animate()
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      element.removeEventListener('pointermove', onPointerMove)
      element.removeEventListener('pointerleave', onPointerLeave)
      renderer.dispose()
      if (renderer.domElement.parentNode === element) element.removeChild(renderer.domElement)
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose()
        if (object.material) object.material.dispose()
      })
    }
  }, [width, height, depth, shelves, color, finish])

  return <div className="viewer"><div className="viewer-label"><span className="dot" /> LIBRERIA / 01 <span>Vista illustrativa</span></div><div className="canvas" ref={mount} /><div className="viewer-measure viewer-height">{height} cm</div><div className="viewer-measure viewer-width">{width} cm</div><div className="viewer-caption"><strong>{width} × {height} × {depth} cm</strong><span>{shelves} ripiani</span></div></div>
}

function SectionTitle({ number, children, meta }) {
  return <div className="section-title"><span className="step">{number}</span><strong>{children}</strong>{meta && <span className="section-meta">{meta}</span>}</div>
}

function Configurator({ pricing }) {
  const [values, setValues] = useState({ width: 90, height: 180, depth: 35, shelves: 4, wood: pricing.woods[3].name, finish: pricing.finishes[1].name, delivery: pricing.deliveries[1].name, withVat: true })
  const [touched, setTouched] = useState(false)
  const wood = pricing.woods.find((item) => item.name === values.wood) || pricing.woods[0]
  const finish = pricing.finishes.find((item) => item.name === values.finish) || pricing.finishes[0]
  const delivery = pricing.deliveries.find((item) => item.name === values.delivery) || pricing.deliveries[0]
  const invalid = ['width', 'height', 'depth'].some((key) => !Number.isFinite(Number(values[key])) || Number(values[key]) < pricing.minSize || Number(values[key]) > pricing.maxSize)
  const quote = useMemo(() => invalid ? null : calculateQuote({ ...values, width: Number(values.width), height: Number(values.height), depth: Number(values.depth), wood, finish, delivery }, pricing), [values, wood, finish, delivery, pricing, invalid])
  const update = (key, value) => { setTouched(true); setValues((current) => ({ ...current, [key]: value })) }

  return <main>
    <header className="topbar"><div className="brand">
      <span className="brand-mark">
        <i />
        <i />
        <i />
      </span>
      <strong>Legno &amp; Co.
      </strong>
    </div>
      <div className="topbar-meta">
        <span>Falegnameria su misura · Marco Bellini
        </span>
        <b>
          <span className="dot" /> Configuratore
        </b>
      </div>
    </header>
    <div className="intro">
      <div>
        <p className="eyebrow">LIBRERIA SU MISURA</p>
        <h1>La tua libreria, a modo tuo.</h1>
      </div>
      <p className="intro-copy">Definisci misure, legno e finitura.<br />Il preventivo prende forma con le tue scelte.</p>
    </div>
    <div className="config-grid">
      <div className="preview-column">
        <ThreeViewer width={Number(values.width) || pricing.minSize} height={Number(values.height) || pricing.minSize} depth={Number(values.depth) || pricing.minSize} shelves={values.shelves} color={wood.color} finish={finish.name} />
        <div className="preview-details">
          <span>
            <strong>{wood.name}</strong> / {finish.name}
          </span>
          <span>P {values.depth} cm</span>
        </div>
      </div>
      <div className="form-column">
        <section><SectionTitle number="01">Scegli le dimensioni</SectionTitle><div className="dimension-grid">{[['width', 'Larghezza'], ['height', 'Altezza'], ['depth', 'Profondità']].map(([key, label]) => <label className="field" key={key}><span>{label}</span><div><input type="number" min={pricing.minSize} max={pricing.maxSize} value={values[key]} onChange={(event) => update(key, event.target.value)} /><small>cm</small></div></label>)}</div><p className={`hint ${touched && invalid ? 'error' : ''}`}>{touched && invalid ? `Inserisci valori tra ${pricing.minSize} e ${pricing.maxSize} cm per ogni misura.` : `Da ${pricing.minSize} a ${pricing.maxSize} cm per ogni misura. Solo valori positivi.`}</p><div className="shelf-control"><span>Numero di ripiani</span><div><button type="button" aria-label="Diminuisci ripiani" onClick={() => update('shelves', Math.max(0, values.shelves - 1))}>−</button><b>{values.shelves}</b><button type="button" aria-label="Aumenta ripiani" onClick={() => update('shelves', Math.min(20, values.shelves + 1))}>+</button></div></div></section>
        <section><SectionTitle number="02" meta={wood.name}>Il legno</SectionTitle><div className="wood-grid">{pricing.woods.map((item) => <button type="button" className={`wood-choice ${item.name === wood.name ? 'selected' : ''}`} key={item.name} onClick={() => update('wood', item.name)}><span style={{ backgroundColor: item.color }} /><small>{item.name}</small></button>)}</div><p className="selection-note">{wood.name} · {money.format(wood.price)} /m², IVA esclusa</p></section>
        <section><SectionTitle number="03">La finitura</SectionTitle><select value={values.finish} onChange={(event) => update('finish', event.target.value)}>{pricing.finishes.map((item) => <option key={item.name} value={item.name}>{item.name} · +{money.format(item.price)} /m²</option>)}</select></section>
        <section><SectionTitle number="04">La consegna</SectionTitle><select value={values.delivery} onChange={(event) => update('delivery', event.target.value)}>{pricing.deliveries.map((item) => <option key={item.name} value={item.name}>{item.name} · {money.format(item.price)}</option>)}</select><p className="hint validation-hint"><Icon size={15}><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></Icon> Se una misura non è valida, correggila per visualizzare il preventivo.</p></section>
      </div>
    </div>
    <QuoteSummary quote={quote} values={values} wood={wood} finish={finish} delivery={delivery} pricing={pricing} update={update} />
    <footer><span><Icon size={15}><path d="M12 3 5 6v5c0 4.5 3 7 7 9 2.5-1.2 7-4.5 7-9V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></Icon> Nessun dato personale viene salvato o inviato.</span><span>Legno &amp; Co. · Marco Bellini<br /><small>Preventivo indicativo · Listino legni 2026</small></span></footer>
  </main>
}

function QuoteSummary({ quote, values, wood, finish, delivery, pricing, update }) {
  return <section className="quote"><div className="quote-heading"><h2>Il tuo preventivo</h2><span className="updated"><span>✓</span> Aggiornato con le tue scelte</span></div>{quote ? <div className="quote-grid"><div className="area"><span>Superficie totale lavorata</span><strong>{decimal.format(quote.totalArea)} <small>m²</small></strong><p>{decimal.format(quote.externalArea)} m² di facce esterne<br />+ {decimal.format(quote.shelfArea)} m² di facce dei ripiani</p><p>{wood.price.toFixed(2).replace('.', ',')} € legno + {finish.price.toFixed(2).replace('.', ',')} € finitura<br />= {(wood.price + finish.price).toFixed(2).replace('.', ',')} €/m², IVA esclusa</p></div><div className="breakdown"><div><span>Libreria · {decimal.format(quote.totalArea)} m² × {(wood.price + finish.price).toFixed(2).replace('.', ',')} €</span><b>{money.format(quote.woodCost + quote.finishCost)}</b></div><div><span>Consegna · {delivery.name}</span><b>{money.format(delivery.price)}</b></div><div className="subtotal"><strong>Imponibile</strong><b>{money.format(quote.subtotal)}</b></div><div><span>IVA {Math.round(pricing.vat * 100)}%</span><b>{money.format(quote.vat)}</b></div></div><div className="total"><div className="vat-toggle"><button type="button" className={values.withVat ? 'active' : ''} onClick={() => update('withVat', true)}>Con IVA</button><button type="button" className={!values.withVat ? 'active' : ''} onClick={() => update('withVat', false)}>Senza IVA</button></div><span>{values.withVat ? 'Totale IVA inclusa' : 'Totale imponibile'}</span><strong>{money.format(values.withVat ? quote.total : quote.subtotal)}</strong><small>La scelta cambia il totale visualizzato, non le voci di calcolo.</small></div></div> : <div className="invalid-quote">Correggi le misure per visualizzare il preventivo.</div>}</section>
}

function Admin({ pricing, setPricing }) {
  const [draft, setDraft] = useState(pricing)
  const save = () => { window.localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(draft)); setPricing(draft) }
  const updateList = (key, index, field, value) => setDraft((current) => ({ ...current, [key]: current[key].map((item, itemIndex) => itemIndex === index ? { ...item, [field]: field === 'price' ? Number(value) : value } : item) }))
  return <main className="admin-page">
    <header className="topbar">
      <div className="brand"><span className="brand-mark"><i /><i /><i /></span><strong>Legno &amp; Co.</strong></div><a href="/" className="back-link">← Torna al configuratore</a></header><div className="admin-wrap"><p className="eyebrow">AREA RISERVATA · DATI LOCALI</p><h1>Gestisci il listino</h1><p className="admin-intro">Modifica i valori del configuratore. Le modifiche vengono salvate solo in questo browser e non vengono inviate a nessun server.</p><div className="admin-card"><h2>Legni</h2>{draft.woods.map((item, index) => <div className="admin-row" key={`${item.name}-${index}`}><label>Nome<input value={item.name} onChange={(event) => updateList('woods', index, 'name', event.target.value)} /></label><label>€/m²<input type="number" value={item.price} onChange={(event) => updateList('woods', index, 'price', event.target.value)} /></label></div>)}<h2>Finiture</h2>{draft.finishes.map((item, index) => <div className="admin-row" key={`${item.name}-${index}`}><label>Nome<input value={item.name} onChange={(event) => updateList('finishes', index, 'name', event.target.value)} /></label><label>Supplemento €/m²<input type="number" value={item.price} onChange={(event) => updateList('finishes', index, 'price', event.target.value)} /></label></div>)}<h2>Consegne</h2>{draft.deliveries.map((item, index) => <div className="admin-row" key={`${item.name}-${index}`}><label>Zona<input value={item.name} onChange={(event) => updateList('deliveries', index, 'name', event.target.value)} /></label><label>Costo €<input type="number" value={item.price} onChange={(event) => updateList('deliveries', index, 'price', event.target.value)} /></label></div>)}<h2>Parametri</h2><div className="admin-row"><label>IVA (es. 0,22)<input type="number" step="0.01" value={draft.vat} onChange={(event) => setDraft({ ...draft, vat: Number(event.target.value) })} /></label><label>Misura minima cm<input type="number" value={draft.minSize} onChange={(event) => setDraft({ ...draft, minSize: Number(event.target.value) })} /></label><label>Misura massima cm<input type="number" value={draft.maxSize} onChange={(event) => setDraft({ ...draft, maxSize: Number(event.target.value) })} /></label></div><button type="button" className="save-button" onClick={save}>Salva listino</button></div></div></main>
}

function App() {
  const [pricing] = useState(() => getPricing())
  return window.location.pathname === '/admin' ? <Admin pricing={pricing} setPricing={() => { }} /> : <Configurator pricing={pricing} />
}

export default App
