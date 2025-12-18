"use client";

import { useState, useEffect } from "react";
import { useComments, useCreateComment } from "@/lib/hooks/useComments";
import { CommentItem } from "./comment-item";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Loader2 } from "lucide-react";

interface TaskCommentsProps {
  taskId: string;
  currentUserId: string;
}

export function TaskComments({ taskId, currentUserId }: TaskCommentsProps) {
  const [commentText, setCommentText] = useState("");
  const { data, isLoading, error } = useComments(taskId);
  const createComment = useCreateComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await createComment.mutateAsync({
        taskId,
        content: commentText.trim(),
      });
      setCommentText("");
    } catch (error) {
      console.error("Failed to create comment:", error);
    }
  };

  const comments = data?.comments || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-t pt-4">
        <MessageSquare className="h-5 w-5 text-gray-600" />
        <h4 className="text-sm font-semibold">Comments ({comments.length})</h4>
      </div>

      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={!commentText.trim() || createComment.isPending}
          >
            {createComment.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post Comment"
            )}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-sm text-red-600">
            Failed to load comments. Please try again.
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              taskId={taskId}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>
    </div>
  );
}
