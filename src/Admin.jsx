import { useState } from "react";
import { PRICING_STORAGE_KEY } from "./data/pricing";

const ADMIN_AUTH_STORAGE_KEY = "legno-co-admin-authenticated";
const ADMIN_PASSWORD_HASH = import.meta.env.VITE_ADMIN_PASSWORD_HASH;

const WOOD_TONES = [
  "#ead7ad",
  "#d3ad73",
  "#ad7d4e",
  "#b58b61",
  "#8b6348",
  "#684a36",
];

function colorToSliderValue(color) {
  const [red, green, blue] = color
    .match(/\w\w/g)
    .map((part) => parseInt(part, 16));
  let closestValue = 50;
  let closestDistance = Infinity;

  for (let value = 0; value <= 100; value += 1) {
    const [sampleRed, sampleGreen, sampleBlue] = sliderToWoodColor(value)
      .match(/\w\w/g)
      .map((part) => parseInt(part, 16));
    const distance =
      (red - sampleRed) ** 2 +
      (green - sampleGreen) ** 2 +
      (blue - sampleBlue) ** 2;
    if (distance < closestDistance) {
      closestDistance = distance;
      closestValue = value;
    }
  }

  return closestValue;
}

function sliderToWoodColor(value) {
  const position = (Number(value) / 100) * (WOOD_TONES.length - 1);
  const index = Math.min(Math.floor(position), WOOD_TONES.length - 2);
  const amount = position - index;
  const start = WOOD_TONES[index].match(/\w\w/g).map((part) => parseInt(part, 16));
  const end = WOOD_TONES[index + 1]
    .match(/\w\w/g)
    .map((part) => parseInt(part, 16));
  return `#${start
    .map((channel, channelIndex) =>
      Math.round(channel + (end[channelIndex] - channel) * amount)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function ParameterSection({ number, title, description, column, children }) {
  return (
    <section className={`parameter-section parameter-section-${column}`}>
      <div className="parameter-heading">
        <span className="parameter-number">{number}</span>
        <h2>{title}</h2>
      </div>
      <p className="parameter-description">{description}</p>
      {children}
    </section>
  );
}

function ParameterList({
  heading,
  unit,
  items,
  onChange,
  onNameChange,
  onColorChange,
  swatches = false,
  onAdd,
  onRemove,
}) {
  const [openColorIndex, setOpenColorIndex] = useState(null);

  return (
    <div className="parameter-list">
      <div className="parameter-list-header">
        <span>Parametro</span>
        <span className="parameter-list-actions">
          {heading}
          {onAdd && (
            <button type="button" className="add-parameter" onClick={onAdd}>
              + Aggiungi
            </button>
          )}
        </span>
      </div>
      {items.map((item, index) => (
        <label className="parameter-row" key={`${item.name}-${index}`}>
          <span className="parameter-name">
            {swatches && (
              <span className="wood-color-control">
                <button
                  type="button"
                  className="parameter-swatch"
                  style={{ backgroundColor: item.color }}
                  onClick={() =>
                    setOpenColorIndex(openColorIndex === index ? null : index)
                  }
                  aria-label={`Cambia colore di ${item.name}`}
                  aria-expanded={openColorIndex === index}
                />
                {openColorIndex === index && (
                  <span className="wood-color-picker">
                    <strong>Tonalità legno</strong>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={colorToSliderValue(item.color)}
                      onChange={(event) =>
                        onColorChange(
                          index,
                          sliderToWoodColor(event.target.value),
                        )
                      }
                      aria-label={`${item.name} tonalità legno`}
                    />
                    <span className="wood-color-picker-labels">
                      <small>Chiaro</small>
                      <small>Scuro</small>
                    </span>
                    <label className="custom-color-control">
                      <span>Colore personalizzato</span>
                      <input
                        type="color"
                        value={item.color}
                        onChange={(event) =>
                          onColorChange(index, event.target.value)
                        }
                        aria-label={`${item.name} colore personalizzato`}
                      />
                    </label>
                  </span>
                )}
              </span>
            )}
            <input
              value={item.name}
              onChange={(event) => onNameChange(index, event.target.value)}
              aria-label={`${item.name} nome`}
            />
          </span>
          <span className="parameter-value">
            <input
              type="number"
              min="0"
              step="0.01"
              value={item.price}
              onChange={(event) => onChange(index, event.target.value)}
              aria-label={`${item.name} ${heading}`}
            />
            <small>{unit}</small>
            {onRemove && (
              <button
                type="button"
                className="remove-parameter"
                onClick={() => onRemove(index)}
                disabled={items.length === 1}
                aria-label={`Elimina ${item.name}`}
                title="Elimina"
              >
                ×
              </button>
            )}
          </span>
        </label>
      ))}
    </div>
  );
}

function AdminPasswordGate({ onAuthenticated }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    if (!ADMIN_PASSWORD_HASH) {
      setError("Password admin non configurata.");
      return;
    }
    const encodedPassword = new TextEncoder().encode(password);
    const passwordDigest = await window.crypto.subtle.digest(
      "SHA-256",
      encodedPassword,
    );
    const passwordHash = Array.from(new Uint8Array(passwordDigest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    if (passwordHash !== ADMIN_PASSWORD_HASH) {
      setError("Password non corretta.");
      setPassword("");
      return;
    }
    window.sessionStorage.setItem(ADMIN_AUTH_STORAGE_KEY, "true");
    onAuthenticated();
  };

  return (
    <main className="admin-page admin-login-page">
      <form className="admin-login-card" onSubmit={submit}>
        <p className="eyebrow">STRUMENTI DI BOTTEGA</p>
        <h1>Area riservata</h1>
        <p>Inserisci la password per gestire i parametri del preventivatore.</p>
        <label className="admin-login-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
            autoComplete="current-password"
            autoFocus
            required
          />
        </label>
        {error && <p className="admin-login-error" role="alert">{error}</p>}
        <button type="submit" className="save-button">Accedi</button>
      </form>
    </main>
  );
}

function Admin({ pricing, setPricing }) {
  const [authenticated, setAuthenticated] = useState(
    () => window.sessionStorage.getItem(ADMIN_AUTH_STORAGE_KEY) === "true",
  );
  const [draft, setDraft] = useState(pricing);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!authenticated) {
    return <AdminPasswordGate onAuthenticated={() => setAuthenticated(true)} />;
  }

  const save = () => {
    if (saving) return;
    setSaving(true);
    setSaved(false);
    window.setTimeout(() => {
      window.localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(draft));
      setPricing(draft);
      setSaved(true);
      setSaving(false);
    }, 500);
  };
  const updateList = (key, index, field, value) => {
    setSaved(false);
    setDraft((current) => ({
      ...current,
      [key]: current[key].map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: field === "price" ? Number(value) : value }
          : item,
      ),
    }));
  };
  const updateGeneral = (key, value) => {
    setSaved(false);
    setDraft((current) => ({ ...current, [key]: Number(value) }));
  };
  const addItem = (key, item) => {
    setSaved(false);
    setDraft((current) => ({
      ...current,
      [key]: [...current[key], item],
    }));
  };
  const removeItem = (key, index) => {
    const item = draft[key][index];
    const confirmed = window.confirm(
      `Vuoi eliminare "${item.name}"? Questa modifica sarà applicata dopo il salvataggio.`,
    );
    if (!confirmed) return;
    setSaved(false);
    setDraft((current) => ({
      ...current,
      [key]: current[key].filter((_, itemIndex) => itemIndex !== index),
    }));
  };
  const cancel = () => {
    setDraft(pricing);
    setSaved(false);
  };
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
        <div className="admin-user">
          <span>MB</span>
          <span>Marco Bellini</span>
        </div>
      </header>
      <div className="admin-wrap">
        <div className="admin-heading">
          <div>
            <p className="eyebrow">STRUMENTI DI BOTTEGA / LISTINO 2026</p>
            <h1>Gestione parametri</h1>
            <p className="admin-intro">
              Aggiorna prezzi e regole del preventivatore, in un unico posto.
            </p>
          </div>
          <a href="/" className="back-link">
            ↗ &nbsp; Torna al configuratore
          </a>
        </div>
        <div className="admin-notice">
          <span>ⓘ</span>
          <p>
            Tutti i prezzi sono IVA esclusa. Legni e finiture si applicano a
            ogni m² di superficie totale, ripiani inclusi.
          </p>
          <small>Listino legni 2026</small>
        </div>
        <div className="parameter-grid">
          <ParameterSection
            number="01"
            title="Legni"
            description="Prezzo al m² della superficie totale."
            column="left"
          >
            <ParameterList
              heading="Prezzo"
              unit="€/m²"
              items={draft.woods}
              swatches
              onChange={(index, value) => updateList("woods", index, "price", value)}
              onNameChange={(index, value) =>
                updateList("woods", index, "name", value)
              }
              onColorChange={(index, value) =>
                updateList("woods", index, "color", value)
              }
              onAdd={() =>
                addItem("woods", {
                  name: `Nuovo legno ${draft.woods.length + 1}`,
                  price: 0,
                  color: "#c5a77c",
                })
              }
              onRemove={(index) => removeItem("woods", index)}
            />
          </ParameterSection>
          <ParameterSection
            number="02"
            title="Finiture"
            description="Supplemento da aggiungere al prezzo del legno."
            column="right"
          >
            <ParameterList
              heading="Supplemento"
              unit="€/m²"
              items={draft.finishes}
              onChange={(index, value) =>
                updateList("finishes", index, "price", value)
              }
              onNameChange={(index, value) =>
                updateList("finishes", index, "name", value)
              }
              onAdd={() =>
                addItem("finishes", {
                  name: `Nuova finitura ${draft.finishes.length + 1}`,
                  price: 0,
                })
              }
              onRemove={(index) => removeItem("finishes", index)}
            />
            <p className="parameter-note">＋ &nbsp; Il grezzo non prevede alcun supplemento.</p>
          </ParameterSection>
          <ParameterSection
            number="03"
            title="Consegna"
            description="Costo fisso per ciascuna zona di consegna."
            column="left"
          >
            <ParameterList
              heading="Costo fisso"
              unit="€"
              items={draft.deliveries}
              onChange={(index, value) =>
                updateList("deliveries", index, "price", value)
              }
              onNameChange={(index, value) =>
                updateList("deliveries", index, "name", value)
              }
            />
          </ParameterSection>
          <ParameterSection
            number="04"
            title="Parametri generali"
            description="IVA e limiti per larghezza, altezza e profondità."
            column="right"
          >
            <div className="parameter-list">
              <div className="parameter-list-header">
                <span>Parametro</span>
                <span>Valore</span>
              </div>
              {[
                ["IVA", "vat", "%", 100],
                ["Misura minima", "minSize", "cm", 1],
                ["Misura massima", "maxSize", "cm", 1],
              ].map(([label, key, unit, multiplier]) => (
                <label className="parameter-row" key={key}>
                  <span className="parameter-name">{label}</span>
                  <span className="parameter-value">
                    <input
                      type="number"
                      value={draft[key] * multiplier}
                      onChange={(event) =>
                        updateGeneral(
                          key,
                          Number(event.target.value) / multiplier,
                        )
                      }
                      aria-label={label}
                    />
                    <small>{unit}</small>
                  </span>
                </label>
              ))}
            </div>
          </ParameterSection>
        </div>
        <p className="admin-formula">
          ▦ &nbsp; Calcolo: superficie × (legno + finitura) + consegna. L’IVA
          si applica all’intero imponibile.
        </p>
      </div>
      <div className="admin-actions">
        <div
          className={`admin-save-status ${saved ? "is-saved" : ""}`}
          role="status"
          aria-live="polite"
        >
          <strong>
            <i aria-hidden="true">{saved ? "✓" : ""}</i>{" "}
            {saved ? "Modifiche salvate" : "Modifiche non salvate"}
          </strong>
          <small>
            {saved
              ? "I nuovi parametri sono attivi nel configuratore."
              : "I nuovi parametri saranno usati nel configuratore dopo il salvataggio."}
          </small>
        </div>
        <div className="admin-action-buttons">
          <button type="button" className="cancel-button" onClick={cancel}>
            Annulla modifiche
          </button>
          <button
            type="button"
            className="save-button"
            onClick={save}
            disabled={saving}
            aria-busy={saving}
          >
            ✓ &nbsp; Salva parametri
          </button>
        </div>
      </div>
      {saving && (
        <div className="admin-save-overlay" role="status" aria-live="assertive">
          <div className="admin-save-loader" aria-hidden="true" />
          <strong>Salvataggio in corso</strong>
          <span>Attendi, stiamo aggiornando i parametri.</span>
        </div>
      )}
    </main>
  );
}

export default Admin;
