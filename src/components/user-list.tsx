import { deleteUser, type User } from "@/actions/user.actions";
import { DeleteButton } from "@/components/delete-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function UserList({ users }: { users: User[] }) {
  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No users yet. Create one above!
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>
          {users.length} user{users.length !== 1 ? "s" : ""} in the database.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {users.map((user, i) => (
          <div key={user.id}>
            {i > 0 && <Separator className="my-2" />}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  ID: {user.id}
                </Badge>
                <DeleteButton
                  label="Delete"
                  deleteAction={deleteUser.bind(null, user.id)}
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
