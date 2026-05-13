import AuthShell from "../../../Components/Auth/auth-shell";

export default function LoginPage(props: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  return <AuthShell variant="login" searchParams={props.searchParams} />;
}
