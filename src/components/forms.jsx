import { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REQUIRED = ['name', 'email', 'topic', 'message'];

export function ContactForm() {
  const { showToast } = useCart();
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const MSG = 'Thank you — your message is on its way to the shop.';

  const submit = e => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const next = {};
    REQUIRED.forEach(k => {
      const v = String(data.get(k) || '');
      if (!v.trim()) next[k] = 'This field is required.';
      else if (k === 'email' && !EMAIL.test(v)) next[k] = 'Please enter a valid email.';
    });
    setErrors(next);
    if (Object.keys(next).length) return;
    form.reset();
    setSuccess(MSG);
    showToast(MSG);
  };

  const err = k => <div className="form-error">{errors[k] || ''}</div>;

  return (
    <form id="contactForm" className="form-card fade-in" noValidate onSubmit={submit}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" required placeholder="Your name" />
          {err('name')}
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required placeholder="you@example.com" />
          {err('email')}
        </div>
        <div className="field">
          <label htmlFor="topic">What can we help with?</label>
          <select id="topic" name="topic" required defaultValue="">
            <option value="">Choose one</option>
            <option>Order question</option>
            <option>Custom bouquet</option>
            <option>Event flowers</option>
            <option>Pickup</option>
            <option>Something else</option>
          </select>
          {err('topic')}
        </div>
        <div className="field">
          <label htmlFor="date">Preferred date</label>
          <input id="date" name="date" type="date" />
          <div className="form-error"></div>
        </div>
        <div className="field full">
          <label htmlFor="message">Message</label>
          <textarea id="message" name="message" required placeholder="Tell us what you have in mind..."></textarea>
          {err('message')}
        </div>
      </div>
      <button className="btn btn-dark" style={{ width: '100%', marginTop: '12px' }}>Send message</button>
      <div className={`form-success${success ? ' show' : ''}`}>{success}</div>
    </form>
  );
}

export function NewsletterForm() {
  const { showToast } = useCart();
  const submit = e => {
    e.preventDefault();
    e.currentTarget.reset();
    showToast('You are on the list for fresh flower notes.');
  };
  return (
    <form className="newsletter-form" id="newsletterForm" onSubmit={submit}>
      <input type="email" required placeholder="you@example.com" aria-label="Email address" />
      <button className="btn btn-dark">Subscribe</button>
    </form>
  );
}
