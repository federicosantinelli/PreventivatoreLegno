function SectionTitle({ number, children, meta }) {
  return <div className="section-title"><span className="step">{number}</span><strong>{children}</strong>{meta && <span className="section-meta">{meta}</span>}</div>
}

export default SectionTitle