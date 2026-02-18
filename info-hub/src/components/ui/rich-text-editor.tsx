"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, Link as LinkIcon, Code } from 'lucide-react';
import { useState, useCallback } from 'react';

interface RichTextEditorProps {
  content?: any;
  onChange: (json: any) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick(t => t + 1), []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Ensure BulletList and ListItem are active (they are by default in StarterKit)
        bulletList: { keepAttributes: true, keepMarks: true },
      }),
      Link.configure({ 
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer hover:opacity-80 transition-colors',
        },
      }),
      Placeholder.configure({
        placeholder: 'Write your content here...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    onSelectionUpdate: forceUpdate,
    onTransaction: forceUpdate,
    editorProps: {
      handleKeyDown: (view, event) => {
        // REVISION 2: Fix Tab key for sub-items
        if (event.key === 'Tab' && editor?.isActive('bulletList')) {
          editor.commands.sinkListItem('listItem');
          return true;
        }
        return false;
      },
      attributes: {
        // REVISION 2: Fixed class list (single line, no newlines) to avoid DOMTokenList error
        class: 'w-full min-h-[300px] bg-transparent border-none outline-none text-lg leading-relaxed focus:ring-0 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:pl-1 [&_pre]:bg-[#1e1e1e] [&_pre]:text-white [&_pre]:p-5 [&_pre]:rounded-2xl [&_pre]:my-6 [&_pre]:font-mono [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-white/10 [&_code]:bg-transparent [&_code]:p-0',
      },
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="space-y-4 relative">
      {/* REVISION 1: Ensuring form-action compatibility */}
      <input type="hidden" name="content" value={content} />

      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-primary/5">
        <EditorToolbarButton 
          icon={<Bold size={18}/>} 
          isActive={editor.isActive('bold')} 
          onClick={() => editor.chain().focus().toggleBold().run()} 
        />
        <EditorToolbarButton 
          icon={<Italic size={18}/>} 
          isActive={editor.isActive('italic')} 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
        />
        <EditorToolbarButton 
          icon={<List size={18}/>} 
          isActive={editor.isActive('bulletList')} 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
        />
        <EditorToolbarButton 
          icon={<LinkIcon size={18}/>} 
          isActive={editor.isActive('link')} 
          onClick={setLink} 
        />
        <EditorToolbarButton 
          icon={<Code size={18}/>} 
          isActive={editor.isActive('codeBlock')} 
          onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
        />
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

function EditorToolbarButton({ icon, isActive, onClick }: { icon: React.ReactNode, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      type="button" 
      onClick={onClick}
      className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center ${
        isActive 
          ? "bg-primary text-white shadow-lg scale-105" // REVISION 3: Clear Active State
          : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
      }`}
    >
      {icon}
    </button>
  );
}