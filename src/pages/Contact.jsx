import { ContactForm, NewsletterForm } from '../components/forms.jsx';

export default function Contact() {
  return (
    <>
      <section className="page-hero">
        <div className="container fade-in">
          <div className="eyebrow">Say hello</div>
          <h1>Let’s talk flowers.</h1>
          <p>
            Have a pickup question, event request, or a very specific shade of
            blush in mind? Send a note and our team will get back to you.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container split">
          <div className="fade-in">
            <div className="eyebrow">Contact details</div>
            <h2>Come by, message us, or send a little note.</h2>
            <p className="text-muted">
              Drop by the studio, send a message, or give us a call — we love
              talking through colors, occasions, and pickup timing before
              your bouquet is made.
            </p>
            <div style={{display: 'grid', gap: '16px', marginTop: '26px'}}>
              <div>
                <strong>Studio</strong>
                <p className="text-muted">
                  Nowhere St.,<br />
                  Somewhere City, Philippines, 1234
                </p>
              </div>
              <div>
                <strong>Email</strong>
                <p className="text-muted">hello@blushblooms.example</p>
              </div>
              <div>
                <strong>Phone</strong>
                <p className="text-muted">0931 753 6909</p>
              </div>
              <div>
                <strong>Hours</strong>
                <p className="text-muted">Tue–Sun · 9:00 AM–6:00 PM</p>
              </div>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
      <section className="section-sm" id="newsletter">
        <div className="container">
          <div className="newsletter fade-in">
            <div>
              <div className="eyebrow">Newsletter</div>
              <h2>Flower mail, the nice kind.</h2>
              <p>
                Fresh arrivals, seasonal notes, and occasional last-minute
                bouquet drops.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
