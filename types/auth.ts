export type AuthMode = "login" | "signup";

export type AuthActionResult = { error?: string };

export type {
  SignInValues,
  SignUpValues,
  SetPasswordValues,
} from "@/lib/validation/auth";
