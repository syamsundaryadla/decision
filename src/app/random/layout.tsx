import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Decision Playground — Dice Roll & Card Draw",
  description:
    "Can't decide? Use Decisely's free instant decision tools — virtual dice rolls and card draws for those quick choices that don't need a full AI analysis.",
  openGraph: {
    title: "Decision Playground — Dice Roll & Card Draw | Decisely",
    description:
      "Free instant decision tools. Roll dice or draw cards to make quick choices.",
  },
};

export default function RandomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
