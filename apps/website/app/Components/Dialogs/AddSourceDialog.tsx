"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, Upload, FileText } from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface AddSourceDialogProps {
  caseId?: string;
  triggerClassName?: string;
}

export default function AddSourceDialog({
  caseId,
  triggerClassName,
}: AddSourceDialogProps) {
  const router = useRouter();
  const [tab, setTab] = useState("url");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);

    let response: Response;
    if (!caseId) {
      setSubmitting(false);
      return;
    }

    if (tab === "file" && file) {
      const formData = new FormData();
      formData.set("file", file);
      response = await fetch(`/api/cases/${caseId}/sources`, {
        method: "POST",
        body: formData,
      });
    } else if (tab === "url") {
      response = await fetch(`/api/cases/${caseId}/sources`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_type: "url",
          title: title || null,
          url,
        }),
      });
    } else {
      response = await fetch(`/api/cases/${caseId}/sources`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_type: "note",
          title: title || null,
          note_text: noteText,
        }),
      });
    }

    setSubmitting(false);
    if (!response.ok) return;

    setUrl("");
    setTitle("");
    setNoteText("");
    setFile(null);
    router.refresh();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={triggerClassName ?? "h-10 rounded-full px-5 text-sm font-semibold"}
        >
          Add Source
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Source</DialogTitle>
          <DialogDescription>
            Ingest a URL, upload a file, or paste raw text into the local research desk.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-full bg-slate-100">
            <TabsTrigger value="url">
              <Link2 className="size-4" />
              URL
            </TabsTrigger>
            <TabsTrigger value="file">
              <Upload className="size-4" />
              Upload file
            </TabsTrigger>
            <TabsTrigger value="paste">
              <FileText className="size-4" />
              Paste text
            </TabsTrigger>
          </TabsList>
          <TabsContent value="url" className="space-y-3 pt-4">
            <Input
              placeholder="Source title (optional)"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <Input
              placeholder="https://example.com/report"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
            <p className="text-xs text-slate-500">
              Example: analyst report, policy page, or market note URL.
            </p>
          </TabsContent>
          <TabsContent value="file" className="space-y-3 pt-4">
            <Input
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-slate-500">
              Supported: PDF and plain text files up to 25 MB.
            </p>
          </TabsContent>
          <TabsContent value="paste" className="space-y-3 pt-4">
            <Input
              placeholder="Source title (optional)"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <Textarea
              placeholder="Paste raw source text..."
              className="min-h-[180px] rounded-[13px] border-slate-200 bg-slate-50"
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
            />
            <p className="text-xs text-slate-500">
              Paste long-form notes, analyst summaries, or extracted content.
            </p>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !caseId ||
              submitting ||
              (tab === "url" ? !url : tab === "file" ? !file : !noteText)
            }
          >
            {submitting ? "Adding..." : "Add Source"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
