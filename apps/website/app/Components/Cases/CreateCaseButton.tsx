"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateCaseButtonProps {
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  showIcon?: boolean;
}

export function CreateCaseButton({
  className,
  variant = "default",
  showIcon = false,
}: CreateCaseButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!title) return;

    setSubmitting(true);
    setError(null);
    const response = await fetch("/api/cases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        question: question || null,
        tags: tag ? [tag] : [],
      }),
    });

    setSubmitting(false);
    if (!response.ok) {
      let detail = "Failed to create case.";
      try {
        const payload = (await response.json()) as { detail?: string };
        if (payload.detail) {
          detail = payload.detail;
        }
      } catch { }
      setError(detail);
      return;
    }

    const created = (await response.json()) as { id: string };

    setOpen(false);
    setTitle("");
    setTag("");
    setQuestion("");
    setError(null);
    router.push(`/cases/${created.id}/details`);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className={className}>
          {showIcon && <Plus className="mr-2 size-4" />}
          New Case
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-180">
        <DialogHeader>
          <DialogTitle>Create New Case</DialogTitle>
          <DialogDescription>
            Start a new research investigation. You can attach sources and run
            analysis later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 py-4">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Case Title</Label>

              <Input
                id="title"
                placeholder="e.g. Q4 Market Analysis"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="project">Primary Tag (Optional)</Label>

              <Input
                id="project"
                placeholder="e.g. equities"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="note">Research Question (Optional)</Label>

            <Textarea
              id="note"
              placeholder="What decision or analysis should this case answer?"
              className="min-h-[120px] resize-none"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!title || submitting}>
            {submitting ? "Creating..." : "Create Case"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
