import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ContentFormSheet } from "./content-form-sheet";

type ContentType = "BANNER" | "SOCIAL_LINK" | "PARTNER" | "CHEF_POSTER";

interface SiteContent {
  id: string;
  type: ContentType;
  title: string | null;
  subtitle: string | null;
  imageUrl: string | null;
  link: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface SiteContentTableProps {
  type: ContentType;
}

export function SiteContentTable({ type }: SiteContentTableProps) {
  const [contents, setContents] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<SiteContent | null>(
    null,
  );

  const fetchContents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/contents?type=${type}`);
      const json = await res.json();
      if (json.success) {
        setContents(json.data);
      } else {
        toast.error("Failed to load contents");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [type]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await fetch(`/api/contents/${id}`, { method: "DELETE" });
      const json = await res.json();

      if (json.success) {
        toast.success("Deleted successfully");
        fetchContents();
      } else {
        toast.error(json.error || "Failed to delete");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  const handleEdit = (content: SiteContent) => {
    setSelectedContent(content);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedContent(null);
    setIsFormOpen(true);
  };

  const onFormSuccess = () => {
    setIsFormOpen(false);
    fetchContents();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Manage {type.replace("_", " ")}S
        </h3>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {(type === "BANNER" || type === "CHEF_POSTER") && <TableHead>Image</TableHead>}
              {type === "PARTNER" && <TableHead>Name</TableHead>}
              {type === "SOCIAL_LINK" && <TableHead>Platform</TableHead>}

              <TableHead>Status</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  Loading...
                </TableCell>
              </TableRow>
            ) : contents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No items found.
                </TableCell>
              </TableRow>
            ) : (
              contents.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {(type === "BANNER" || type === "CHEF_POSTER") ? (
                      item.imageUrl ? (
                        <div className="relative w-32 h-16 rounded-md overflow-hidden border">
                          <img
                            src={item.imageUrl}
                            alt={type === "BANNER" ? "Banner" : "Poster"}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No image</span>
                      )
                    ) : (
                      item.title || "Untitled"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.isActive ? "default" : "secondary"}>
                      {item.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.sortOrder}</TableCell>
                  <TableCell>
                    {format(new Date(item.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ContentFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        content={selectedContent}
        type={type}
        onSuccess={onFormSuccess}
      />
    </div>
  );
}
