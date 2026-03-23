import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HiOutlineShieldCheck, HiOutlineUserPlus } from "react-icons/hi2";

import { fetchUsers, registerUserRequest } from "../features/auth/auth-api";
import { getApiErrorMessage } from "../lib/error-utils";

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "cashier",
};

export function UsersPage() {
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState(initialForm);

  const usersQuery = useQuery({
    queryKey: ["auth", "users"],
    queryFn: fetchUsers,
  });

  const registerMutation = useMutation({
    mutationFn: registerUserRequest,
    onSuccess: async () => {
      setFormValues(initialForm);
      await queryClient.invalidateQueries({ queryKey: ["auth", "users"] });
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await registerMutation.mutateAsync(formValues);
  };

  const users = usersQuery.data ?? [];

  return (
    <section className="p-4 sm:p-6 lg:p-8">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3 sm:items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <HiOutlineUserPlus className="text-2xl" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600">
                Admin Only
              </p>
              <h1 className="text-2xl font-extrabold leading-tight text-ink">Register new staff user</h1>
            </div>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">
                Full name
              </span>
              <input
                required
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-brand-500 focus:bg-white"
                name="name"
                value={formValues.name}
                onChange={handleChange}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">
                Email
              </span>
              <input
                required
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-brand-500 focus:bg-white"
                name="email"
                type="email"
                value={formValues.email}
                onChange={handleChange}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">
                Password
              </span>
              <input
                required
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-brand-500 focus:bg-white"
                minLength={6}
                name="password"
                type="password"
                value={formValues.password}
                onChange={handleChange}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">
                Role
              </span>
              <select
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-brand-500 focus:bg-white"
                name="role"
                value={formValues.role}
                onChange={handleChange}
              >
                <option value="cashier">Cashier</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            {registerMutation.error ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {getApiErrorMessage(registerMutation.error)}
              </div>
            ) : null}

            <button
              className="w-full rounded-2xl bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={registerMutation.isPending}
              type="submit"
            >
              {registerMutation.isPending ? "Creating user..." : "Create user"}
            </button>
          </form>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-start gap-3 border-b border-slate-200 px-6 py-5 sm:items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <HiOutlineShieldCheck className="text-2xl" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600">
                Access Overview
              </p>
              <h2 className="text-2xl font-extrabold text-ink">Current system users</h2>
            </div>
          </div>

          {usersQuery.isError ? (
            <div className="px-6 py-6 text-red-700">
              {getApiErrorMessage(usersQuery.error)}
            </div>
          ) : usersQuery.isLoading ? (
            <div className="space-y-3 px-6 py-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-3 px-6 py-5 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-bold text-ink">{user.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-600">
                      {user.role}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                      }).format(new Date(user.created_at))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
