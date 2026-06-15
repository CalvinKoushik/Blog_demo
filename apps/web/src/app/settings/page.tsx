"use client";

import { useState, useEffect } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/useAuthStore";
import { updateMyProfile } from "@/lib/users-api";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/upload/ImageUpload";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setSession = useAuthStore((s) => s.setSession);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [skills, setSkills] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setCollegeName(user.collegeName ?? "");
      setDepartment(user.department ?? "");
      setYear(user.year ? String(user.year) : "");
      setAvatarUrl(user.avatarUrl ?? "");
    }, 0);
    return () => clearTimeout(timer);
  }, [user]);

  const handleSave = async () => {
    if (!accessToken || !user || !refreshToken) return;
    setSaving(true);
    try {
      await updateMyProfile(accessToken, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio.trim() || undefined,
        collegeName: collegeName.trim() || undefined,
        department: department.trim() || undefined,
        year: year ? Number(year) : undefined,
        skills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        linkedinUrl: linkedinUrl.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      });
      setSession(
        {
          ...user,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          collegeName: collegeName.trim() || null,
          department: department.trim() || null,
          year: year ? Number(year) : null,
          avatarUrl: avatarUrl.trim() || null,
        },
        accessToken,
        refreshToken,
      );
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <RequireAuth>
      <main className="container mx-auto px-4 max-w-2xl py-10">
        <div className="mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back
          </Link>
          <h1 className="text-3xl font-extrabold mt-2">Profile settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Avatar URLs are validated server-side. File uploads coming soon.
          </p>
        </div>

        <div className="space-y-6 rounded-2xl border border-border/50 bg-card/50 p-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>First name</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Last name</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1 rounded-xl" />
            </div>
          </div>
          <div>
            <Label>Bio</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1 rounded-xl" rows={4} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>College</Label>
              <Input value={collegeName} onChange={(e) => setCollegeName(e.target.value)} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Department</Label>
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} className="mt-1 rounded-xl" />
            </div>
          </div>
          <div>
            <Label>Year (1–6)</Label>
            <Input type="number" min={1} max={6} value={year} onChange={(e) => setYear(e.target.value)} className="mt-1 rounded-xl max-w-[120px]" />
          </div>
          <div>
            <Label>Skills (comma separated)</Label>
            <Input value={skills} onChange={(e) => setSkills(e.target.value)} className="mt-1 rounded-xl" />
          </div>
          {accessToken && (
            <ImageUpload
              token={accessToken}
              folder="avatars"
              value={avatarUrl}
              onChange={setAvatarUrl}
              label="Profile photo"
              aspect="square"
            />
          )}
          <div>
            <Label>LinkedIn URL</Label>
            <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className="mt-1 rounded-xl" />
          </div>
          <div>
            <Label>GitHub URL</Label>
            <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className="mt-1 rounded-xl" />
          </div>
          <Button className="rounded-full w-full sm:w-auto" onClick={() => void handleSave()} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
          </Button>
        </div>
      </main>
    </RequireAuth>
  );
}
