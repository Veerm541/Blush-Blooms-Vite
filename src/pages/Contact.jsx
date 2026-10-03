import { ContactForm, NewsletterForm } from '../components/forms.jsx';

export default function Contact() {
  return (
    <>
      <section className="page-hero"><div className="container fade-in"><div className="eyebrow">Say hello</div><h1>Let’s talk flowers.</h1><p>Questions about a bouquet, pick-up, delivery availability, or a special arrangement? Send the shop a message.</p></div></section>
      <section className="section"><div className="container split">
        <div className="fade-in"><div className="eyebrow">Contact details</div><h2>Come by, message us, or send a little note.</h2><p className="text-muted">For delivery availability, custom requests, and order concerns, contact Blush Blooms Ozamiz before placing time-sensitive orders.</p>
          <div className="contact-detail-grid">
            <div><strong>Studio</strong><p className="text-muted">Kaamino St. corner Ledesma St.,<br />Ozamiz City, Philippines, 7200</p></div>
            <div><strong>Phone</strong><p className="text-muted">0931 753 6909</p></div>
            <div><strong>Online inquiries</strong><p className="text-muted">Message the official Blush Blooms Ozamiz social page.</p></div>
            <div><strong>Delivery</strong><p className="text-muted">Available for locations within the shop&apos;s serviceable area.</p></div>
          </div>
        </div>
        <ContactForm />
      </div></section>
      <section className="section-sm" id="newsletter"><div className="container"><div className="newsletter fade-in"><div><div className="eyebrow">Newsletter</div><h2>Flower mail, the nice kind.</h2><p>Fresh arrivals, seasonal notes, and occasional bouquet drops.</p></div><NewsletterForm /></div></div></section>
    </>
  );
}
