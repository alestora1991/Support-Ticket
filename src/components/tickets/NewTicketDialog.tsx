import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import { Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface NewTicketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated: () => void;
  userName: string;
}

export default function NewTicketDialog({
  isOpen,
  onClose,
  onTicketCreated,
  userName,
}: NewTicketDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const imageFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        imageFiles.push(file);
      }
    }

    setAttachments([...attachments, ...imageFiles]);
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category || !priority) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // We've created the bucket in migrations, so we can skip the check

      // Create the ticket
      const { data: ticketData, error: ticketError } = await supabase
        .from("support_tickets")
        .insert([
          {
            title,
            description,
            category,
            priority,
            status: "open",
            user_id: user?.id,
          },
        ])
        .select();

      if (ticketError) throw ticketError;
      if (!ticketData || ticketData.length === 0)
        throw new Error("Failed to create ticket");

      const ticketId = ticketData[0].id;

      // Upload attachments if any
      if (attachments.length > 0) {
        try {
          for (const file of attachments) {
            const filePath = `attachments/${ticketId}/${file.name}`;

            // Upload file to storage
            const { error: uploadError } = await supabase.storage
              .from("ticket-attachments")
              .upload(filePath, file, {
                cacheControl: "3600",
                upsert: true,
              });

            if (uploadError) {
              console.error("Upload error:", uploadError);
              throw uploadError;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
              .from("ticket-attachments")
              .getPublicUrl(filePath);

            // Save attachment record
            const { error: attachmentError } = await supabase
              .from("ticket_attachments")
              .insert([
                {
                  ticket_id: ticketId,
                  user_id: user?.id,
                  file_name: file.name,
                  file_path: filePath,
                  file_type: file.type,
                  file_size: file.size,
                },
              ]);

            if (attachmentError) throw attachmentError;
          }
        } catch (attachError) {
          console.error("Error handling attachments:", attachError);
          // Continue with ticket creation even if attachments fail
          toast({
            variant: "destructive",
            title: "Attachment Upload Failed",
            description:
              "Your ticket was created but we couldn't upload the attachments.",
          });
        }
      }

      // Send notification email to user and admin in a single request to reduce potential failures
      try {
        // Always send notification to admin regardless of user email status
        const adminEmail = "it@sos.com.om";

        // Send admin notification
        const { data: adminEmailData, error: adminEmailError } =
          await supabase.functions.invoke(
            "supabase-functions-send-notification-email",
            {
              body: {
                to: adminEmail,
                subject: "New IT Support Ticket Created",
                ticketId: ticketId,
                ticketTitle: title,
                userName: userName || "User",
                userEmail: user?.email || "No email provided",
                type: "admin-notification",
              },
            },
          );

        console.log(
          "Admin email notification result:",
          adminEmailData || adminEmailError,
        );

        if (adminEmailError) {
          console.error("Error sending admin email:", adminEmailError);
          throw adminEmailError;
        }

        // If user has email, also send them a confirmation
        if (user?.email) {
          const { data: userEmailData, error: userEmailError } =
            await supabase.functions.invoke(
              "supabase-functions-send-notification-email",
              {
                body: {
                  to: user.email,
                  subject: "Your IT Support Ticket Has Been Received",
                  ticketId: ticketId,
                  ticketTitle: title,
                  userName: userName || "User",
                  type: "user-confirmation",
                },
              },
            );

          console.log(
            "User email notification result:",
            userEmailData || userEmailError,
          );

          if (userEmailError) {
            console.error("Error sending user email:", userEmailError);
            // Don't throw here, we already sent admin notification
          }
        }
      } catch (emailError) {
        console.error("Failed to send notification emails:", emailError);
        // Continue with ticket creation even if emails fail
        toast({
          variant: "warning",
          title: "Email Notification Issue",
          description:
            "Your ticket was created but we couldn't send confirmation emails. Our team has been notified and will address this issue.",
        });
      }

      // Show success message and close dialog
      toast({
        variant: "success",
        title: "Ticket Created Successfully",
        description:
          "Thank you for submitting your ticket. Our IT team has received your request and will start working on it shortly.",
      });
      onTicketCreated();
      resetForm();
    } catch (error: any) {
      console.error("Error creating ticket:", error);
      setError(error.message || "Failed to create ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setPriority("medium");
    setAttachments([]);
    setError("");
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          if (!isSubmitting) resetForm();
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Create New Support Ticket
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input id="name" value={userName} disabled className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">
              Ticket Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Brief summary of the issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Please provide details about your issue"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
              disabled={isSubmitting}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">
                Department <span className="text-red-500">*</span>
              </Label>
              <Select
                value={category || ""}
                onValueChange={setCategory}
                disabled={isSubmitting}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="HR and Admin">HR and Admin</SelectItem>
                  <SelectItem value="Procurement">Procurement</SelectItem>
                  <SelectItem value="Accounting and Warehouse">
                    Accounting and Warehouse
                  </SelectItem>
                  <SelectItem value="Operation QHSSE and Maintenance">
                    Operation QHSSE and Maintenance
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">
                Priority <span className="text-red-500">*</span>
              </Label>
              <Select
                value={priority}
                onValueChange={setPriority}
                disabled={isSubmitting}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachments">Attachments (Images only)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="file"
                id="attachments"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isSubmitting}
              />
              <label
                htmlFor="attachments"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-6 w-6 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Click to upload images
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to 10MB
                </span>
              </label>
            </div>

            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                <Label>Uploaded Files</Label>
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                    >
                      <div className="flex items-center space-x-2 overflow-hidden">
                        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            className="w-8 h-8 object-cover rounded"
                          />
                        </div>
                        <span className="text-sm truncate">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-gray-500 hover:text-red-500"
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && <div className="text-sm text-red-500">{error}</div>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Ticket"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
