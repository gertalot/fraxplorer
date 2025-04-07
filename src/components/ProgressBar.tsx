import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar = ({ progress }: ProgressBarProps) => {
  if (progress <= 0 || progress >= 1) return null;
  
  return (
    <div className="fixed bottom-6 left-12 w-48">
      <Progress value={progress * 100} />
    </div>
  );
};