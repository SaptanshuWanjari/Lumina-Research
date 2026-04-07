"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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

export function CreateCaseButton({ className, variant = "default", showIcon = false }: CreateCaseButtonProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [project, setProject] = useState("");

  const handleCreate = () => {
    if (!title) return;
    
    console.log(`Case Created: Successfully created case: ${title}`);
    alert(`Case Created: Successfully created case: ${title}`);

    setOpen(false);
    setTitle("");
    setProject("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className={className}>
          {showIcon && <Plus className="mr-2 size-4" />}
          New Case
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Case</DialogTitle>
          <DialogDescription>
            Start a new research investigation. You can attach sources and run analysis later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
            <Label htmlFor="project">Project / Tag (Optional)</Label>
            <Input
              id="project"
              placeholder="e.g. Equities Team"
              value={project}
              onChange={(e) => setProject(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="note">Notes (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Initial thoughts or objectives..."
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!title}>
            Create Case
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
