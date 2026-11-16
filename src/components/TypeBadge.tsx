import { TYPE_LABEL } from "@/lib/validation/listing";

const TYPE_CLASS: Record<keyof typeof TYPE_LABEL, string> = {
  JOB: "badge-job",
  TRAINING: "badge-training",
  PROGRAM: "badge-program",
};

// The kind of opportunity, colour-coded so a list can be scanned quickly. The word is always
// shown, so the colour is never the only signal.
export function TypeBadge({ type }: { type: keyof typeof TYPE_LABEL }) {
  return <span className={`badge ${TYPE_CLASS[type]}`}>{TYPE_LABEL[type]}</span>;
}
