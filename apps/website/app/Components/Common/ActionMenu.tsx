"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ActionMenuItem {
  label: string;
  href?: string;
  onSelect?: () => void;
  destructive?: boolean;
  confirmTitle?: string;
  confirmDescription?: string;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  ariaLabel?: string;
}

export default function ActionMenu({
  items,
  ariaLabel = "Open actions menu",
}: ActionMenuProps) {
  const router = useRouter();
  const [pendingItem, setPendingItem] = useState<ActionMenuItem | null>(null);

  const runAction = (item: ActionMenuItem) => {
    item.onSelect?.();
    if (item.href) {
      router.push(item.href);
    }
  };

  const handleSelect = (item: ActionMenuItem) => {
    if (item.confirmTitle || item.confirmDescription) {
      setPendingItem(item);
      return;
    }

    runAction(item);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            aria-label={ariaLabel}
            variant="ghost"
            size="icon"
            className="touch-manipulation rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-slate-300"
          >
            <MoreHorizontal className="size-4" aria-hidden="true" />
            <span className="sr-only">Open actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {items.map((item) =>
            item.href && !item.confirmTitle && !item.confirmDescription && !item.onSelect ? (
              <DropdownMenuItem
                key={item.label}
                asChild
                variant={item.destructive ? "destructive" : "default"}
              >
                <Link href={item.href}>{item.label}</Link>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                key={item.label}
                variant={item.destructive ? "destructive" : "default"}
                onSelect={(event) => {
                  event.preventDefault();
                  handleSelect(item);
                }}
              >
                {item.label}
              </DropdownMenuItem>
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={Boolean(pendingItem)}
        onOpenChange={(open) => {
          if (!open) setPendingItem(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingItem?.confirmTitle ?? "Confirm action"}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingItem?.confirmDescription ??
                "This action can affect the current case state."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={pendingItem?.destructive ? "destructive" : "default"}
              onClick={() => {
                if (pendingItem) runAction(pendingItem);
                setPendingItem(null);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
