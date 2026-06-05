import { deletePost, type PostWithAuthor } from "@/actions/post.actions";
import { DeleteButton } from "@/components/delete-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function PostList({ posts }: { posts: PostWithAuthor[] }) {
  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No posts yet. Write one above!
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Posts</CardTitle>
        <CardDescription>
          {posts.length} post{posts.length !== 1 ? "s" : ""} in the database.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {posts.map((post, i) => (
          <div key={post.id}>
            {i > 0 && <Separator className="my-3" />}
            <div className="py-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{post.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    by {post.author?.name ?? "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {post.content}
                  </p>
                </div>
                <DeleteButton
                  label="Delete"
                  deleteAction={deletePost.bind(null, post.id)}
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
