'use client';

import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Highlight from '@tiptap/extension-highlight';
import { 
  Bold, Italic, Underline as UnderlineIcon, 
  List, ListOrdered, Quote, Link as LinkIcon, 
  Undo, Redo, Type, Image as ImageIcon, 
  Strikethrough, Eraser, Heading1, Heading2, Heading3
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
}

const MenuButton = ({ 
  onClick, 
  isActive = false, 
  disabled = false, 
  children,
  title 
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  disabled?: boolean; 
  children: React.ReactNode;
  title: string;
}) => (
  <button
    type="button"
    onClick={(e) => { e.preventDefault(); onClick(); }}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded transition-all duration-200 flex items-center justify-center ${
      isActive
      ? 'bg-action text-white'
      : 'text-text-muted hover:bg-surface-muted hover:text-text-heading'
    } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
);

export default function RichTextEditor({ value, onChange, readOnly }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        code: false,
        codeBlock: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-action underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: 'Comece a escrever sua história...',
      }),
      Image,
      Highlight,
    ],
    content: value,
    editable: !readOnly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL do Link:', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className={`bl-tiptap-container flex flex-col bg-surface-card border border-border-input rounded overflow-hidden transition-all duration-500 group focus-within:border-border-focus focus-within:shadow-[0_0_0_1px_var(--color-border-focus)] ${readOnly ? 'read-only' : ''}`}>
      {!readOnly && (
        <div className="bl-tiptap-toolbar bg-surface-muted p-2 border-b border-border-input flex flex-wrap gap-1 items-center sticky top-0 z-10">
          <div className="flex items-center gap-1 pr-2 border-r border-white/5">
            <MenuButton 
              title="Título 1"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
            >
              <Heading1 size={18} />
            </MenuButton>
            <MenuButton 
              title="Título 2"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
            >
              <Heading2 size={18} />
            </MenuButton>
            <MenuButton 
              title="Título 3"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
            >
              <Heading3 size={18} />
            </MenuButton>
            <MenuButton 
              title="Texto Normal"
              onClick={() => editor.chain().focus().setParagraph().run()}
              isActive={editor.isActive('paragraph')}
            >
              <Type size={18} />
            </MenuButton>
          </div>

          <div className="flex items-center gap-1 px-2 border-r border-white/5">
            <MenuButton 
              title="Negrito"
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
            >
              <Bold size={18} />
            </MenuButton>
            <MenuButton 
              title="Itálico"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
            >
              <Italic size={18} />
            </MenuButton>
            <MenuButton 
              title="Sublinhado"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
            >
              <UnderlineIcon size={18} />
            </MenuButton>
            <MenuButton 
              title="Riscado"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
            >
              <Strikethrough size={18} />
            </MenuButton>
          </div>

          <div className="flex items-center gap-1 px-2 border-r border-white/5">
            <MenuButton 
              title="Lista com Marcadores"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
            >
              <List size={18} />
            </MenuButton>
            <MenuButton 
              title="Lista Numerada"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
            >
              <ListOrdered size={18} />
            </MenuButton>
            <MenuButton 
              title="Citação"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
            >
              <Quote size={18} />
            </MenuButton>
          </div>

          <div className="flex items-center gap-1 px-2 border-r border-white/5">
            <MenuButton 
              title="Inserir Link"
              onClick={setLink}
              isActive={editor.isActive('link')}
            >
              <LinkIcon size={18} />
            </MenuButton>
            <MenuButton 
              title="Limpar Formatação"
              onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            >
              <Eraser size={18} />
            </MenuButton>
          </div>

          <div className="flex items-center gap-1 pl-2 ml-auto">
            <MenuButton 
              title="Desfazer"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo size={18} />
            </MenuButton>
            <MenuButton 
              title="Refazer"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo size={18} />
            </MenuButton>
          </div>
        </div>
      )}

      <div className="bl-tiptap-content bg-surface-card min-h-[450px] relative">
        <EditorContent editor={editor} className="p-4 text-sm max-w-none focus:outline-none text-text-heading" />
      </div>

      <style jsx global>{`
        .ProseMirror {
          min-height: 400px;
          outline: none !important;
          color: var(--color-text-heading, #1d2327);
          font-family: var(--font-sans);
          font-size: 14px;
          line-height: 1.7;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--color-text-muted, #787c82);
          pointer-events: none;
          height: 0;
          font-style: italic;
        }
        .ProseMirror h1 { font-size: 1.75em; margin-bottom: 0.5em; color: var(--color-text-heading, #1d2327); font-weight: 700; }
        .ProseMirror h2 { font-size: 1.35em; margin-bottom: 0.5em; color: var(--color-text-heading, #1d2327); font-weight: 600; }
        .ProseMirror h3 { font-size: 1.15em; margin-bottom: 0.5em; color: var(--color-text-heading, #1d2327); font-weight: 600; }
        .ProseMirror blockquote {
          border-left: 3px solid var(--color-action, #2271b1);
          padding-left: 1rem;
          font-style: italic;
          color: var(--color-text-body, #50575e);
          margin: 1em 0;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 1em 0;
        }
        .ProseMirror li {
          margin-bottom: 0.4em;
        }
        .ProseMirror a {
          color: var(--color-action, #2271b1);
          text-decoration: underline;
        }

        .read-only .ProseMirror {
          cursor: default;
        }
      `}</style>
    </div>
  );
}
