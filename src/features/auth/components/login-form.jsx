import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineEye, HiOutlineLockClosed, HiOutlineMail } from "react-icons/hi";
import { HiOutlineEyeSlash } from "react-icons/hi2";
import { PiShoppingCartSimpleFill } from "react-icons/pi";

import { useLogin } from "../use-login";
import { useAuth } from "../auth-context";
import { getApiErrorMessage } from "../../../lib/error-utils";
import { getRememberedEmail, setRememberedEmail } from "../../../lib/storage";

const initialForm = {
  email: getRememberedEmail(),
  password: "",
};

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formValues, setFormValues] = useState(initialForm);

  const redirectPath = location.state?.from?.pathname ?? "/app/dashboard";
  const errorMessage = loginMutation.error
    ? getApiErrorMessage(loginMutation.error)
    : null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const data = await loginMutation.mutateAsync(formValues);
    signIn(data);

    setRememberedEmail(rememberMe ? formValues.email : "");

    navigate(redirectPath, { replace: true });
  };

  return (
    <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-panel backdrop-blur sm:p-8">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 shadow-sm">
          <PiShoppingCartSimpleFill className="text-3xl" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-brand-600">
          ShopDesk
        </p>
        <h1 className="mt-3 text-2xl font-extrabold text-ink sm:text-3xl">POS System Login</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Sign in to manage sales, inventory, customers, and daily operations.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-600">
            Email
          </span>
          <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-brand-500 focus-within:bg-white">
            <HiOutlineMail className="mr-3 shrink-0 text-lg text-slate-400" />
            <input
              required
              autoComplete="email"
              className="h-14 w-full border-none bg-transparent text-sm outline-none placeholder:text-slate-400 sm:text-base"
              name="email"
              placeholder="name@shopdesk.com"
              type="email"
              value={formValues.email}
              onChange={handleChange}
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-600">
            Password
          </span>
          <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-brand-500 focus-within:bg-white">
            <HiOutlineLockClosed className="mr-3 shrink-0 text-lg text-slate-400" />
            <input
              required
              autoComplete="current-password"
              className="h-14 w-full border-none bg-transparent text-sm outline-none placeholder:text-slate-400 sm:text-base"
              name="password"
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              value={formValues.password}
              onChange={handleChange}
            />
            <button
              className="shrink-0 text-slate-400 transition hover:text-slate-600"
              type="button"
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? <HiOutlineEyeSlash className="text-xl" /> : <HiOutlineEye className="text-xl" />}
            </button>
          </div>
        </label>

        <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <label className="flex items-center gap-2 text-slate-500">
            <input
              checked={rememberMe}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              type="checkbox"
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            Remember me
          </label>

          <Link className="font-semibold text-brand-600 hover:text-brand-700 sm:text-right" to="/login">
            Forgot Password?
          </Link>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </div>
        ) : null}

        <button
          className="flex h-14 w-full items-center justify-center rounded-2xl bg-brand-600 px-4 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={loginMutation.isPending}
          type="submit"
        >
          {loginMutation.isPending ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
