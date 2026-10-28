import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { getPricing, PRICING_STORAGE_KEY } from "./data/pricing";
import { calculateQuote } from "./utils";
import ThreeViewer from "./ThreeViewer";
import SectionTitle from "./SectionTitle";
import Icon from "./icon";
import QuoteSummary from "./QuoteSummary";

const money = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});
const decimal = new Intl.NumberFormat("it-IT", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function Configurator({ pricing }) {
  const [values, setValues] = useState({
    width: 90,
    height: 180,
    depth: 35,
    shelves: 4,
    wood: pricing.woods[3].name,
    finish: pricing.finishes[1].name,
    delivery: pricing.deliveries[1].name,
    withVat: true,
  });
  const [touched, setTouched] = useState(false);
  const wood =
    pricing.woods.find((item) => item.name === values.wood) || pricing.woods[0];
  const finish =
    pricing.finishes.find((item) => item.name === values.finish) ||
    pricing.finishes[0];
  const delivery =
    pricing.deliveries.find((item) => item.name === values.delivery) ||
    pricing.deliveries[0];
  const invalid = ["width", "height", "depth"].some(
    (key) =>
      !Number.isFinite(Number(values[key])) ||
      Number(values[key]) < pricing.minSize ||
      Number(values[key]) > pricing.maxSize,
  );
  const quote = useMemo(
    () =>
      invalid
        ? null
        : calculateQuote(
            {
              ...values,
              width: Number(values.width),
              height: Number(values.height),
              depth: Number(values.depth),
              wood,
              finish,
              delivery,
            },
            pricing,
          ),
    [values, wood, finish, delivery, pricing, invalid],
  );
  const update = (key, value) => {
    setTouched(true);
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          <strong>Legno &amp; Co.</strong>
        </div>
        <div className="topbar-meta">
          <span>Falegnameria su misura · Marco Bellini</span>
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
        <p className="intro-copy">
          Definisci misure, legno e finitura.
          <br />
          Il preventivo prende forma con le tue scelte.
        </p>
      </div>
      <div className="config-grid">
        <div className="preview-column">
          <ThreeViewer
            width={Number(values.width) || pricing.minSize}
            height={Number(values.height) || pricing.minSize}
            depth={Number(values.depth) || pricing.minSize}
            shelves={values.shelves}
            color={wood.color}
            finish={finish.name}
          />
          <div className="preview-details">
            <span>
              <strong>{wood.name}</strong> / {finish.name}
            </span>
            <span>P {values.depth} cm</span>
          </div>
        </div>
        <div className="form-column">
          <section>
            <SectionTitle number="01">Scegli le dimensioni</SectionTitle>
            <div className="dimension-grid">
              {[
                ["width", "Larghezza"],
                ["height", "Altezza"],
                ["depth", "Profondità"],
              ].map(([key, label]) => (
                <label className="field" key={key}>
                  <span>{label}</span>
                  <div>
                    <input
                      type="number"
                      min={pricing.minSize}
                      max={pricing.maxSize}
                      value={values[key]}
                      onChange={(event) => update(key, event.target.value)}
                    />
                    <small>cm</small>
                  </div>
                </label>
              ))}
            </div>
            <p className={`hint ${touched && invalid ? "error" : ""}`}>
              {touched && invalid
                ? `Inserisci valori tra ${pricing.minSize} e ${pricing.maxSize} cm per ogni misura.`
                : `Da ${pricing.minSize} a ${pricing.maxSize} cm per ogni misura. Solo valori positivi.`}
            </p>
            <div className="shelf-control">
              <span>Numero di ripiani</span>
              <div>
                <button
                  type="button"
                  aria-label="Diminuisci ripiani"
                  onClick={() =>
                    update("shelves", Math.max(0, values.shelves - 1))
                  }
                >
                  −
                </button>
                <b>{values.shelves}</b>
                <button
                  type="button"
                  aria-label="Aumenta ripiani"
                  onClick={() =>
                    update("shelves", Math.min(20, values.shelves + 1))
                  }
                >
                  +
                </button>
              </div>
            </div>
          </section>
          <section>
            <SectionTitle number="02" meta={wood.name}>
              Il legno
            </SectionTitle>
            <div className="wood-grid">
              {pricing.woods.map((item) => (
                <button
                  type="button"
                  className={`wood-choice ${item.name === wood.name ? "selected" : ""}`}
                  key={item.name}
                  onClick={() => update("wood", item.name)}
                >
                  <span style={{ backgroundColor: item.color }} />
                  <small>{item.name}</small>
                </button>
              ))}
            </div>
            <p className="selection-note">
              {wood.name} · {money.format(wood.price)} /m², IVA esclusa
            </p>
          </section>
          <section>
            <SectionTitle number="03">La finitura</SectionTitle>
            <select
              value={values.finish}
              onChange={(event) => update("finish", event.target.value)}
            >
              {pricing.finishes.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name} · +{money.format(item.price)} /m²
                </option>
              ))}
            </select>
          </section>
          <section>
            <SectionTitle number="04">La consegna</SectionTitle>
            <select
              value={values.delivery}
              onChange={(event) => update("delivery", event.target.value)}
            >
              {pricing.deliveries.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name} · {money.format(item.price)}
                </option>
              ))}
            </select>
            <p className="hint validation-hint">
              <Icon size={15}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4M12 16h.01" />
              </Icon>{" "}
              Se una misura non è valida, correggila per visualizzare il
              preventivo.
            </p>
          </section>
        </div>
      </div>
      <QuoteSummary
        quote={quote}
        values={values}
        wood={wood}
        finish={finish}
        delivery={delivery}
        pricing={pricing}
        update={update}
      />
      <footer>
        <span>
          <Icon size={15}>
            <path d="M12 3 5 6v5c0 4.5 3 7 7 9 2.5-1.2 7-4.5 7-9V6l-7-3Z" />
            <path d="m9 12 2 2 4-4" />
          </Icon>{" "}
          Nessun dato personale viene salvato o inviato.
        </span>
        <span>
          Legno &amp; Co. · Marco Bellini
          <br />
          <small>Preventivo indicativo · Listino legni 2026</small>
        </span>
      </footer>
    </main>
  );
}

export default Configurator;
