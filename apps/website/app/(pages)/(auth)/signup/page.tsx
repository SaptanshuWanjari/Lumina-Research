import AuthShell from "../../../Components/Auth/auth-shell";

export default function SignupPage(props: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  return <AuthShell variant="signup" searchParams={props.searchParams} />;
}
