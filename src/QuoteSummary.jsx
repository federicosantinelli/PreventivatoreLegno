const money = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});

function QuoteSummary({
  quote,
  values,
  delivery,
  pricing,
  update,
}) {
  return (
  <section className="quote">
    <div className="quote-heading">
      <h2>Il tuo preventivo</h2>
      <span className="updated">
        <span>✓</span> Aggiornato con le tue scelte
      </span>
    </div>
    {quote ? (
      <div className="quote-grid">
        <div className="breakdown">
          <div>
            <span>Libreria</span>
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
        </div>
      </div>
    ) : (
      <div className="invalid-quote">
        Correggi le misure per visualizzare il preventivo.
      </div>
    )}
  </section>
  );
}

export default QuoteSummary;
