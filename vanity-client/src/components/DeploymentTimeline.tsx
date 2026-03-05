type Props = {
  status: string;
};

export default function DeploymentTimeline({ status }: Props) {
  const stages = ["created", "building", "deploying", "deployed"];

  return (
    <div className="flex items-center justify-between mt-6">

      {stages.map((stage, index) => {
        const isActive = stages.indexOf(status) >= index;

        return (
          <div key={stage} className="flex-1 text-center">
            <div
              className={`w-6 h-6 mx-auto rounded-full ${
                isActive ? "bg-green-500" : "bg-gray-300"
              }`}
            ></div>

            <p className="text-xs mt-2 capitalize">
              {stage}
            </p>
          </div>
        );
      })}

    </div>
  );
}
