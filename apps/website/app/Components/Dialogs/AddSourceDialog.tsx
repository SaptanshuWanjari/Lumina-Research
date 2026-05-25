"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, Upload, FileText, Workflow } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

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
    } else if (tab === "url" || tab === "n8n") {
      response = await fetch(`/api/cases/${caseId}/sources`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_type: tab,
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
    if (!response.ok) {
      let detail = "Failed to add source.";
      try {
        const payload = (await response.json()) as { detail?: string };
        if (payload.detail) {
          detail = payload.detail;
        }
      } catch {}
      setError(detail);
      return;
    }

    setUrl("");
    setTitle("");
    setNoteText("");
    setFile(null);
    setError(null);
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
          <TabsList className="grid w-full grid-cols-4 rounded-full bg-slate-100">
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
            <TabsTrigger value="n8n">
              <Workflow className="size-4" />
              n8n
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
          <TabsContent value="n8n" className="space-y-3 pt-4">
            <Input
              placeholder="Workflow title (optional)"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <Input
              placeholder="n8n Webhook URL"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
            <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
              <p className="mb-2 font-semibold">n8n Workflow Requirements:</p>
              <ul className="list-inside list-disc space-y-1">
                <li>Use a <strong>Webhook Trigger</strong> (supports POST requests).</li>
                <li>Respond <strong>synchronously</strong> with a "Respond to Webhook" node.</li>
                <li>Return valid <strong>JSON</strong> containing a <code>text</code>, <code>content</code>, or <code>markdown</code> field.</li>
                <li><strong>Tip:</strong> Use a Function node to validate/clean JSON before responding.</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !caseId ||
              submitting ||
              (tab === "url" || tab === "n8n" ? !url : tab === "file" ? !file : !noteText)
            }
          >
            {submitting ? "Adding..." : "Add Source"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
