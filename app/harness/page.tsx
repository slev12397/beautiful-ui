import type { Metadata } from "next";
import IceCreamHarness from "@/components/site/IceCreamHarness";

export const metadata: Metadata = {
  title: "Ice Cream Harness — Beautiful UI",
  description:
    "An interactive chat window built entirely from Beautiful UI primitives. Ask a question and watch the agent think, stream, and build the answer out of live components.",
};

export default function HarnessPage() {
  return <IceCreamHarness />;
}
