import FeedbackForm from "@/features/feedback/FeedbackForm";

export default function FeedbackPage() {
  return (
    <>
      <section className="page-hero" aria-labelledby="feedback-heading">
        <div className="page-hero__shell">
          <span className="eyebrow">Feedback</span>
          <h1 id="feedback-heading">Help improve the Learning Hub.</h1>
          <p>Your feedback helps us improve the public training experience.</p>
        </div>
      </section>
      <section className="section">
        <div className="section-shell feedback-shell"><FeedbackForm /></div>
      </section>
    </>
  );
}
