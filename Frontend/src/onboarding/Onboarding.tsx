import StepRenderer from "./StepRenderer";

const flow = [
  { id: 1, type: "info", title: "Welcome" },
  { id: 2, type: "action", title: "Create First Project" }
];

export default function Onboarding() {
  return (
    <div>
      <h2>Onboarding Flow</h2>
      <StepRenderer step={flow[0]} />
    </div>
  );
}
