import { Link } from 'react-router-dom';
import '../styles/Terms.css';

export default function Terms() {
  return (
    <main className="terms-page">
      <article className="terms-card">
        <Link to="/register" className="terms-back-link">Back to registration</Link>
        <p className="terms-eyebrow">CELESTICARE</p>
        <h1>Terms &amp; Conditions</h1>
        <p className="terms-updated">Effective date: October 16, 2026</p>
        <p>
          These Terms &amp; Conditions govern your access to and use of CelestiCare.
          By creating an account or using the service, you agree to these terms.
          If you do not agree, do not use the service.
        </p>

        <section>
          <h2>1. About CelestiCare</h2>
          <p>
            CelestiCare provides astrology-themed content and personal-style
            experiences, including zodiac information, quizzes, color and style
            suggestions, outfit and moodboard features, and tarot readings.
            Features may change or become unavailable as the service develops.
          </p>
        </section>

        <section>
          <h2>2. Eligibility and your account</h2>
          <p>
            You must be legally able to accept these terms where you live. If you
            are not, use CelestiCare only with the involvement and permission of
            a parent or legal guardian who accepts these terms for you.
          </p>
          <p>
            Provide accurate registration details, keep your password
            confidential, and promptly notify us if you believe your account has
            been accessed without permission. You are responsible for activity
            performed through your account.
          </p>
        </section>

        <section>
          <h2>3. Personal information and content</h2>
          <p>
            You may provide profile details such as your name, username, email,
            gender, and birth information, and may save quiz results or other
            preferences. Provide only information you are comfortable sharing
            and keep your account details current.
          </p>
          <p>
            You retain rights to content you submit. You allow CelestiCare to
            host and use that content only as reasonably needed to operate,
            maintain, and provide the features you choose. Do not submit
            content you do not have the right to provide, or content that is
            unlawful, harmful, or infringes another person's rights.
          </p>
        </section>

        <section>
          <h2>4. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the service in violation of applicable law or another person's rights.</li>
            <li>Attempt to access another person's account or interfere with the service's security or operation.</li>
            <li>Use automated means to scrape, disrupt, or misuse the service.</li>
            <li>Copy, redistribute, or commercially exploit CelestiCare content except where allowed by law or with permission.</li>
          </ul>
        </section>

        <section>
          <h2>5. Informational content; no professional advice</h2>
          <p>
            Astrology, tarot, quiz results, and style suggestions are provided
            for general informational and entertainment purposes. They are not
            guarantees, and are not medical, mental-health, legal, financial, or
            other professional advice. Use your own judgment and consult a
            qualified professional for decisions that require expert advice.
          </p>
        </section>

        <section>
          <h2>6. Intellectual property</h2>
          <p>
            CelestiCare and its original content, branding, and software are
            owned by or licensed to the people who operate the service and are
            protected by applicable intellectual-property laws. These terms
            give you a personal, limited, revocable right to use the service;
            they do not transfer ownership to you.
          </p>
        </section>

        <section>
          <h2>7. Availability and termination</h2>
          <p>
            We may update, suspend, or discontinue features, and may restrict
            or terminate access if these terms are violated or if needed to
            protect users or the service. You may stop using CelestiCare at any
            time. Account and data deletion options, if available, are governed
            by the controls provided in the service.
          </p>
        </section>

        <section>
          <h2>8. Disclaimers and liability</h2>
          <p>
            To the extent permitted by applicable law, CelestiCare is provided
            “as is” and “as available,” without warranties that the service will
            be uninterrupted, error-free, or suitable for a particular purpose.
            Nothing in these terms excludes or limits liability that cannot
            legally be excluded or limited. Otherwise, to the extent permitted
            by law, the operators of CelestiCare are not liable for indirect or
            consequential loss arising from your use of the service.
          </p>
        </section>

        <section>
          <h2>9. Changes to these terms</h2>
          <p>
            We may revise these terms as the service changes or for legal or
            operational reasons. The revised version will be posted on this
            page with an updated effective date. Continued use after revised
            terms take effect means you accept them.
          </p>
        </section>

        <section>
          <h2>10. General</h2>
          <p>
            If any part of these terms is found unenforceable, the remaining
            parts will continue to apply to the extent permitted by law. These
            terms do not create an agency, partnership, or employment
            relationship.
          </p>
        </section>

        <p className="terms-disclaimer">
          This page is a general draft for the CelestiCare project and is not
          legal advice. Have it reviewed for the jurisdictions where the service
          will be offered before relying on it as a binding legal document.
        </p>
        <Link to="/register" className="terms-register-link">Return to create an account</Link>
      </article>
    </main>
  );
}
