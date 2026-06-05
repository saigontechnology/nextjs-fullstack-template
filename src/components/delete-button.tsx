"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

type DeleteAction = () => Promise<void>;

interface DeleteButtonProps {
  label: string;
  deleteAction: DeleteAction;
}

export function DeleteButton({ label, deleteAction }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await deleteAction();
        });
      }}
    >
      {isPending ? "..." : label}
    </Button>
  );
}
