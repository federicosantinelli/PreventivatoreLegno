function QuoteSummary({
  quote,
  values,
  wood,
  finish,
  delivery,
  pricing,
  update,
}) {
  return
  <section className="quote">
    <div className="quote-heading">
      <h2>Il tuo preventivo</h2>
      <span className="updated">
        <span>✓</span> Aggiornato con le tue scelte
      </span>
    </div>
    {quote ? (
      <div className="quote-grid">
        <div className="area">
          <span>Superficie totale lavorata</span>
          <strong>
            {decimal.format(quote.totalArea)} <small>m²</small>
          </strong>
          <p>
            {decimal.format(quote.externalArea)} m² di facce esterne
            <br />+ {decimal.format(quote.shelfArea)} m² di facce dei ripiani
          </p>
          <p>
            {wood.price.toFixed(2).replace(".", ",")} € legno +{" "}
            {finish.price.toFixed(2).replace(".", ",")} € finitura
            <br />= {(wood.price + finish.price)
              .toFixed(2)
              .replace(".", ",")}{" "}
            €/m², IVA esclusa
          </p>
        </div>
        <div className="breakdown">
          <div>
            <span>
              Libreria · {decimal.format(quote.totalArea)} m² ×{" "}
              {(wood.price + finish.price).toFixed(2).replace(".", ",")} €
            </span>
            <b>{money.format(quote.woodCost + quote.finishCost)}</b>
          </div>
          <div>
            <span>Consegna · {delivery.name}</span>
            <b>{money.format(delivery.price)}</b>
          </div>
          <div className="subtotal">
            <strong>Imponibile</strong>
            <b>{money.format(quote.subtotal)}</b>
          </div>
          <div>
            <span>IVA {Math.round(pricing.vat * 100)}%</span>
            <b>{money.format(quote.vat)}</b>
          </div>
        </div>
        <div className="total">
          <div className="vat-toggle">
            <button
              type="button"
              className={values.withVat ? "active" : ""}
              onClick={() => update("withVat", true)}
            >
              Con IVA
            </button>
            <button
              type="button"
              className={!values.withVat ? "active" : ""}
              onClick={() => update("withVat", false)}
            >
              Senza IVA
            </button>
          </div>
          <span>
            {values.withVat ? "Totale IVA inclusa" : "Totale imponibile"}
          </span>
          <strong>
            {money.format(values.withVat ? quote.total : quote.subtotal)}
          </strong>
          <small>
            La scelta cambia il totale visualizzato, non le voci di calcolo.
          </small>
        </div>
      </div>
    ) : (
      <div className="invalid-quote">
        Correggi le misure per visualizzare il preventivo.
      </div>
    )}
  </section>;
}

export default QuoteSummary;
