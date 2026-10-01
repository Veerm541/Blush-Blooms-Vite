import FaqItem from '../components/FaqItem.jsx';

export default function About() {
  return (
    <>
      <section className="page-hero">
        <div className="container fade-in">
          <div className="eyebrow">Behind the stems</div>
          <h1>A small flower shop with a soft spot for ordinary days.</h1>
          <p>
            Blush Blooms began with a simple idea: fresh flowers don’t need a
            big occasion. A bunch on the kitchen table can change the whole mood
            of a Tuesday.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container about-grid">
          <img
            className="about-a fade-in"
            src="https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=1200&q=85"
            alt="Florist arranging flowers"
          /><img
            className="about-b fade-in"
            src="https://images.unsplash.com/photo-1487070183336-b863922373d4?auto=format&fit=crop&w=900&q=85"
            alt="Flowers in neutral tones"
          />
          <div className="about-c soft-panel fade-in">
            <div className="eyebrow">Our style</div>
            <h3>Loose, layered, a little wild.</h3>
            <p>
              We love combinations that feel gathered from a garden rather than
              measured with a ruler — petals, texture, scent, and plenty of
              breathing room.
            </p>
          </div>
          <img
            className="about-d fade-in"
            src="https://images.unsplash.com/photo-1455659817273-f96807779a8a?auto=format&fit=crop&w=1200&q=85"
            alt="Hands holding bouquet"
          />
        </div>
      </section>
      <section className="section-sm">
        <div className="container">
          <div className="section-head fade-in">
            <div>
              <div className="eyebrow">How we work</div>
              <h2>Care from stem to pickup box.</h2>
            </div>
            <p>
              Production-ready storefront copy can be replaced with your actual
              sourcing, fulfillment, and sustainability policies.
            </p>
          </div>
          <div className="steps">
            <article className="step fade-in">
              <div className="step-num">01</div>
              <h3>Source fresh</h3>
              <p className="text-muted">
                We prioritize fresh, seasonal stems and order in small batches
                to reduce time spent sitting in cold storage.
              </p>
            </article>
            <article className="step fade-in">
              <div className="step-num">02</div>
              <h3>Arrange softly</h3>
              <p className="text-muted">
                Bouquets are balanced by hand for movement, texture, and a
                natural silhouette that still looks beautiful tomorrow.
              </p>
            </article>
            <article className="step fade-in">
              <div className="step-num">03</div>
              <h3>Wrap with warmth</h3>
              <p className="text-muted">
                Every order leaves with a care card and optional handwritten
                note so pickup still feels personal, not transactional.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container faq">
          <div className="center fade-in">
            <div className="eyebrow">Questions, answered</div>
            <h2>Good to know.</h2>
            <p className="text-muted">
              A few common questions for your first Blush Blooms order.
            </p>
          </div>
          <div style={{marginTop: '28px'}}>
            <FaqItem question="How long do your bouquets last?">
                Most bouquets look lovely for 5–10 days with fresh water, a
                clean vase, and the included care card. Some flowers naturally
                last longer than others.
              </FaqItem>
            <FaqItem question="Can I request a color palette?">
                Yes. Leave a note at checkout or use the custom builder to start
                a palette. We’ll keep the arrangement within the chosen mood
                while working with what is in season.
              </FaqItem>
            <FaqItem question="Is same-day pickup available?">
                We're a pickup-only shop at Kaamino St. corner Ledesma St., Ozamiz
                City — no delivery yet. Same-day pickup availability depends
                on order volume; connect your real cut-off times here before
                launch.
              </FaqItem>
          </div>
        </div>
      </section>
    </>
  );
}
