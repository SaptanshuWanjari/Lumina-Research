"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RunConfigDialogProps {
  triggerLabel?: string;
  triggerClassName?: string;
}

export default function RunConfigDialog({
  triggerLabel = "Run Analysis",
  triggerClassName,
}: RunConfigDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className={
            triggerClassName ??
            "h-10 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
          }
        >
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Run Analysis</DialogTitle>
          <DialogDescription>
            Configure depth, citation strictness, and review controls.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="run-name">Run name</Label>
            <Input id="run-name" placeholder="Optional run label" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Depth</Label>
              <Select defaultValue="standard">
                <SelectTrigger className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 px-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">Quick</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="deep">Deep</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Citation strictness</Label>
              <Select defaultValue="strict">
                <SelectTrigger className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 px-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lenient">Lenient</SelectItem>
                  <SelectItem value="strict">Strict</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <label className="flex items-center gap-3 rounded-[13px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <Checkbox defaultChecked />
            <span>Enable human review gate before publish</span>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button
            onClick={() => {
              console.log("Start Run: Starting analysis run...");
              alert("Start Run: Starting analysis run...");
            }}
          >
            Start Run
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
