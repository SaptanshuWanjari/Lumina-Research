"use client";

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
  triggerClassName?: string;
}

export default function AddSourceDialog({
  triggerClassName,
}: AddSourceDialogProps) {
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
        <Tabs defaultValue="url" className="w-full">
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
            <Input placeholder="https://example.com/report" />
            <p className="text-xs text-slate-500">
              Example: analyst report, policy page, or market note URL.
            </p>
          </TabsContent>
          <TabsContent value="file" className="space-y-3 pt-4">
            <Input type="file" />
            <p className="text-xs text-slate-500">
              Supported: PDF and plain text files up to 25 MB.
            </p>
          </TabsContent>
          <TabsContent value="paste" className="space-y-3 pt-4">
            <Textarea
              placeholder="Paste raw source text..."
              className="min-h-[180px] rounded-[13px] border-slate-200 bg-slate-50"
            />
            <p className="text-xs text-slate-500">
              Paste long-form notes, analyst summaries, or extracted content.
            </p>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button
            onClick={() => {
              console.log("Add Source: Ingesting source...");
              alert("Add Source: Ingesting source...");
            }}
          >
            Add Source
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
