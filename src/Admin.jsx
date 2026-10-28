import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { getPricing, PRICING_STORAGE_KEY } from "./data/pricing";

function Admin({ pricing, setPricing }) {
  const [draft, setDraft] = useState(pricing);
  const save = () => {
    window.localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(draft));
    setPricing(draft);
  };
  const updateList = (key, index, field, value) =>
    setDraft((current) => ({
      ...current,
      [key]: current[key].map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: field === "price" ? Number(value) : value }
          : item,
      ),
    }));
  return (
    <main className="admin-page">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          <strong>Legno &amp; Co.</strong>
        </div>
        <a href="/" className="back-link">
          ← Torna al configuratore
        </a>
      </header>
      <div className="admin-wrap">
        <p className="eyebrow">AREA RISERVATA · DATI LOCALI</p>
        <h1>Gestisci il listino</h1>
        <p className="admin-intro">
          Modifica i valori del configuratore. Le modifiche vengono salvate solo
          in questo browser e non vengono inviate a nessun server.
        </p>
        <div className="admin-card">
          <h2>Legni</h2>
          {draft.woods.map((item, index) => (
            <div className="admin-row" key={`${item.name}-${index}`}>
              <label>
                Nome
                <input
                  value={item.name}
                  onChange={(event) =>
                    updateList("woods", index, "name", event.target.value)
                  }
                />
              </label>
              <label>
                €/m²
                <input
                  type="number"
                  value={item.price}
                  onChange={(event) =>
                    updateList("woods", index, "price", event.target.value)
                  }
                />
              </label>
            </div>
          ))}
          <h2>Finiture</h2>
          {draft.finishes.map((item, index) => (
            <div className="admin-row" key={`${item.name}-${index}`}>
              <label>
                Nome
                <input
                  value={item.name}
                  onChange={(event) =>
                    updateList("finishes", index, "name", event.target.value)
                  }
                />
              </label>
              <label>
                Supplemento €/m²
                <input
                  type="number"
                  value={item.price}
                  onChange={(event) =>
                    updateList("finishes", index, "price", event.target.value)
                  }
                />
              </label>
            </div>
          ))}
          <h2>Consegne</h2>
          {draft.deliveries.map((item, index) => (
            <div className="admin-row" key={`${item.name}-${index}`}>
              <label>
                Zona
                <input
                  value={item.name}
                  onChange={(event) =>
                    updateList("deliveries", index, "name", event.target.value)
                  }
                />
              </label>
              <label>
                Costo €
                <input
                  type="number"
                  value={item.price}
                  onChange={(event) =>
                    updateList("deliveries", index, "price", event.target.value)
                  }
                />
              </label>
            </div>
          ))}
          <h2>Parametri</h2>
          <div className="admin-row">
            <label>
              IVA (es. 0,22)
              <input
                type="number"
                step="0.01"
                value={draft.vat}
                onChange={(event) =>
                  setDraft({ ...draft, vat: Number(event.target.value) })
                }
              />
            </label>
            <label>
              Misura minima cm
              <input
                type="number"
                value={draft.minSize}
                onChange={(event) =>
                  setDraft({ ...draft, minSize: Number(event.target.value) })
                }
              />
            </label>
            <label>
              Misura massima cm
              <input
                type="number"
                value={draft.maxSize}
                onChange={(event) =>
                  setDraft({ ...draft, maxSize: Number(event.target.value) })
                }
              />
            </label>
          </div>
          <button type="button" className="save-button" onClick={save}>
            Salva listino
          </button>
        </div>
      </div>
    </main>
  );
}

export default Admin;
