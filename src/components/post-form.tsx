"use client";

import { useState } from "react";
import { createPost } from "@/actions/post.actions";
import type { User } from "@/actions/user.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PostForm({ users }: { users: User[] }) {
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      const userId = formData.get("userId") as string;
      if (!userId) return;
      await createPost({
        title: formData.get("title") as string,
        content: formData.get("content") as string,
        userId: parseInt(userId),
      });
      (document.getElementById("post-form") as HTMLFormElement).reset();
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Post</CardTitle>
        <CardDescription>
          Write a new post as one of the existing users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="post-form" action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="post-user">Author</Label>
            <Select name="userId" required>
              <SelectTrigger id="post-user">
                <SelectValue placeholder="Select a user..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={String(user.id)}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="My awesome post"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Write your post content here..."
              rows={4}
              required
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Publishing..." : "Publish Post"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
