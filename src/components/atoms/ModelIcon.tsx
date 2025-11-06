// src/components/atoms/ModelIcon.tsx
import { Brain, Cpu } from "lucide-react";

export function ModelIcon({ type }: { type: string }) {
  return type === "ml" ? (
    <Brain className="text-udea.green w-5 h-5" />
  ) : (
    <Cpu className="text-udea.light w-5 h-5" />
  );
}
