import { cn } from "@/lib/utils";

type TextVariant = "title" | "subtitle" | "body";

interface TextProps {
  variant: TextVariant;
  children: React.ReactNode;
  className?: string;
}

const styles: Record<TextVariant, string> = {
  title: "text-2xl font-bold tracking-tight",
  subtitle: "text-sm text-muted-foreground",
  body: "text-base",
};

const tags: Record<TextVariant, keyof React.JSX.IntrinsicElements> = {
  title: "h1",
  subtitle: "p",
  body: "p",
};

export default function Text({ variant, children, className }: TextProps) {
  const Tag = tags[variant];
  return <Tag className={cn(styles[variant], className)}>{children}</Tag>;
}
