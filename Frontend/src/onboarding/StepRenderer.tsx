export default function StepRenderer({ step }: any) {
  if (step.type === "info") {
    return <p>{step.title}</p>;
  }

  if (step.type === "action") {
    return <button>{step.title}</button>;
  }

  return null;
}
