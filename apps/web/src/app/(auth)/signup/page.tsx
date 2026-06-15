"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { register } from "@/lib/auth-api";
import { ApiError } from "@/lib/api";
import { Loader2 } from "lucide-react";

const YEAR_OPTIONS = [
  { value: "1", label: "1st year" },
  { value: "2", label: "2nd year" },
  { value: "3", label: "3rd year" },
  { value: "4", label: "4th year" },
  { value: "5", label: "5th year" },
  { value: "6", label: "Graduate / PG" },
];

export default function SignupPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const password = String(form.get("password"));
    const confirmPassword = String(form.get("confirmPassword"));

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const skillsRaw = String(form.get("skills") || "");
    const skills = skillsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const nickname = String(form.get("nickname"))
      .trim()
      .replace(/^@/, "")
      .toLowerCase();

    setIsSubmitting(true);
    try {
      const session = await register({
        email: String(form.get("email")),
        password,
        firstName: String(form.get("firstName")),
        lastName: String(form.get("lastName")),
        nickname,
        collegeName: String(form.get("collegeName")),
        department: String(form.get("department")),
        year: Number(form.get("year")),
        linkedinUrl: String(form.get("linkedinUrl")),
        githubUrl: String(form.get("githubUrl") || "") || undefined,
        bio: String(form.get("bio") || "") || undefined,
        skills: skills.length > 0 ? skills : undefined,
      });

      setSession(session.user, session.accessToken, session.refreshToken);
      toast.success("Welcome to StudentHub!");
      router.push("/");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Could not create account";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Join as a student</h1>
        <p className="text-sm text-muted-foreground">
          Tell us about your college and skills so peers and recruiters can find you
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 max-h-[70vh] overflow-y-auto pr-1">
        <fieldset className="grid gap-4">
          <legend className="text-sm font-semibold text-foreground mb-1">Account</legend>
          <div className="grid gap-2">
            <Label htmlFor="email">College email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@college.edu"
              autoComplete="email"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={8}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                minLength={8}
                autoComplete="new-password"
                required
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="grid gap-4">
          <legend className="text-sm font-semibold text-foreground mb-1">Profile</legend>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" name="firstName" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" required />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="nickname">Username</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                @
              </span>
              <Input
                id="nickname"
                name="nickname"
                className="pl-7"
                placeholder="alexc"
                pattern="[a-zA-Z0-9_-]+"
                title="Letters, numbers, underscores, and hyphens only"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">Your public profile URL</p>
          </div>
        </fieldset>

        <fieldset className="grid gap-4">
          <legend className="text-sm font-semibold text-foreground mb-1">
            College details
          </legend>
          <div className="grid gap-2">
            <Label htmlFor="collegeName">College / university</Label>
            <Input
              id="collegeName"
              name="collegeName"
              placeholder="MIT, IIT Delhi, Stanford..."
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="department">Department / major</Label>
              <Input
                id="department"
                name="department"
                placeholder="Computer Science"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="year">Year of study</Label>
              <select
                id="year"
                name="year"
                required
                defaultValue=""
                className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="" disabled>
                  Select year
                </option>
                {YEAR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">Short bio (optional)</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="What are you building or learning?"
              rows={2}
            />
          </div>
        </fieldset>

        <fieldset className="grid gap-4">
          <legend className="text-sm font-semibold text-foreground mb-1">
            Links & skills
          </legend>
          <div className="grid gap-2">
            <Label htmlFor="linkedinUrl">LinkedIn profile</Label>
            <Input
              id="linkedinUrl"
              name="linkedinUrl"
              type="url"
              placeholder="https://linkedin.com/in/yourname"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="githubUrl">GitHub (optional)</Label>
            <Input
              id="githubUrl"
              name="githubUrl"
              type="url"
              placeholder="https://github.com/yourname"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input
              id="skills"
              name="skills"
              placeholder="React, Python, UI/UX"
            />
          </div>
        </fieldset>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create student account"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="hover:text-primary underline underline-offset-4">
          Already have an account? Sign in
        </Link>
      </p>
    </>
  );
}
