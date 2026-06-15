"use client";

import { useEditor, EditorContent, type Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, ListOrdered, Quote, Code, Image as ImageIcon, Link as LinkIcon, Heading2 } from "lucide-react";
import { cn } from "@/lib/utils";

type EditorProps = {
  initialContent?: string;
  onChange?: (html: string) => void;
};

export function Editor({
  initialContent = "<p>Start writing your post here...</p>",
  onChange,
}: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg border border-border/50 max-w-full h-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline decoration-primary/50 underline-offset-4 cursor-pointer',
        },
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor: ed }) => onChange?.(ed.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl mx-auto focus:outline-none dark:prose-invert min-h-[500px] w-full max-w-none p-4",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-border/60 rounded-2xl bg-card shadow-sm group focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all overflow-hidden">
      <MenuBar editor={editor} />
      <div className="p-4 sm:p-8">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function MenuBar({ editor }: { editor: TiptapEditor }) {
  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border/50 bg-background/80 backdrop-blur-md rounded-t-2xl sticky top-[4.1rem] z-40 shadow-sm">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        icon={Bold}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        icon={Italic}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        icon={Heading2}
      />

      <div className="w-px h-6 bg-border mx-2" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        icon={List}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        icon={ListOrdered}
      />

      <div className="w-px h-6 bg-border mx-2" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        icon={Quote}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
        icon={Code}
      />

      <div className="w-px h-6 bg-border mx-2" />

      <ToolbarButton
        onClick={() => {
          const url = window.prompt("URL");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
        isActive={editor.isActive("link")}
        icon={LinkIcon}
      />
      <ToolbarButton
        onClick={() => {
          const url = window.prompt("Image URL");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}
        isActive={editor.isActive("image")}
        icon={ImageIcon}
      />
    </div>
  );
}

function ToolbarButton({ onClick, isActive, icon: Icon }: { onClick: () => void; isActive: boolean; icon: any }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn(
        "h-9 w-9 rounded-xl transition-all duration-200",
        isActive 
          ? "bg-primary/15 text-primary shadow-inner" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      <Icon className={cn("h-4 w-4", isActive && "stroke-[2.5px]")} />
    </Button>
  );
}
