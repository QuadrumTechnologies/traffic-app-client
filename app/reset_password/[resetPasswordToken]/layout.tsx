// Built once with "_" for the token; see hooks/useRealParams.ts.
export function generateStaticParams() {
  return [{ resetPasswordToken: "_" }];
}

export default function TokenLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
