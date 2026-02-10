export default function StepRenderer({ step, onNext }: any) {
  if (!step) return null;

  if (step.type === "info") {
    return (
      <div>
        <p>{step.title}</p>
        <button onClick={onNext}>Next</button>
      </div>
    );
  }

  if (step.type === "action") {
    return (
      <div>
        <button onClick={onNext}>{step.title}</button>
      </div>
    );
  }

  return null;
}
