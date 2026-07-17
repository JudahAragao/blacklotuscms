'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Highlight from '@tiptap/extension-highlight';
import MediaPicker from './MediaPicker';
import {
  Bold, Italic, Underline as UnderlineIcon,
  List, ListOrdered, Quote, Link as LinkIcon,
  Undo, Redo, Type, ImageIcon,
  Strikethrough, Eraser, Heading1, Heading2, Heading3, Highlighter
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
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
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
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTarget, setLinkTarget] = useState('_blank');
  const linkPopoverRef = useRef<HTMLDivElement>(null);

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
        placeholder: 'Comece a escrever sua historia...',
      }),
      Image,
      Highlight.configure({
        multicolor: false,
      }),
    ],
    content: value,
    editable: !readOnly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Close link popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (linkPopoverRef.current && !linkPopoverRef.current.contains(event.target as Node)) {
        setShowLinkPopover(false);
      }
    };
    if (showLinkPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLinkPopover]);

  const openLinkPopover = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href || '';
    const previousTarget = editor.getAttributes('link').target || '_blank';
    
    setLinkUrl(previousUrl);
    setLinkTarget(previousTarget);
    setShowLinkPopover(true);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      const attrs: any = { href: linkUrl };
      if (linkTarget) {
        attrs.target = linkTarget;
      }
      editor.chain().focus().extendMarkRange('link').setLink(attrs).run();
    }
    
    setShowLinkPopover(false);
    setLinkUrl('');
  }, [editor, linkUrl, linkTarget]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setShowLinkPopover(false);
    setLinkUrl('');
  }, [editor]);

  const handleImageSelect = useCallback((media: any) => {
    if (!editor) return;
    const attrs: any = { src: media.url };
    if (media.alt) attrs.alt = media.alt;
    if (media.title) attrs.title = media.title;
    if (media.width) attrs.width = media.width;
    if (media.align) {
      attrs.style = `display: block; margin-left: auto; margin-right: auto;`;
      if (media.align === 'left') attrs.style = 'display: block; margin-right: auto;';
      if (media.align === 'right') attrs.style = 'display: block; margin-left: auto;';
    }
    editor.chain().focus().setImage(attrs).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className={`bl-tiptap-container flex flex-col bg-surface-card border border-border-input rounded overflow-hidden transition-all duration-200 group focus-within:border-border-focus focus-within:shadow-[0_0_0_1px_var(--color-border-focus)] ${readOnly ? 'read-only' : ''}`}>
      {!readOnly && (
        <div className="bl-tiptap-toolbar bg-surface-muted p-1.5 border-b border-border-input flex flex-wrap gap-0.5 items-center sticky top-0 z-10">
          <div className="flex items-center gap-0.5 pr-1.5 border-r border-border-input">
            <MenuButton
              title="Titulo 1"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
            >
              <Heading1 size={16} />
            </MenuButton>
            <MenuButton
              title="Titulo 2"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
            >
              <Heading2 size={16} />
            </MenuButton>
            <MenuButton
              title="Titulo 3"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
            >
              <Heading3 size={16} />
            </MenuButton>
            <MenuButton
              title="Texto Normal"
              onClick={() => editor.chain().focus().setParagraph().run()}
              isActive={editor.isActive('paragraph') && !editor.isActive('heading')}
            >
              <Type size={16} />
            </MenuButton>
          </div>

          <div className="flex items-center gap-0.5 px-1.5 border-r border-border-input">
            <MenuButton
              title="Negrito"
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
            >
              <Bold size={16} />
            </MenuButton>
            <MenuButton
              title="Italico"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
            >
              <Italic size={16} />
            </MenuButton>
            <MenuButton
              title="Sublinhado"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
            >
              <UnderlineIcon size={16} />
            </MenuButton>
            <MenuButton
              title="Riscado"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
            >
              <Strikethrough size={16} />
            </MenuButton>
            <MenuButton
              title="Destaque"
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              isActive={editor.isActive('highlight')}
            >
              <Highlighter size={16} />
            </MenuButton>
          </div>

          <div className="flex items-center gap-0.5 px-1.5 border-r border-border-input">
            <MenuButton
              title="Lista com Marcadores"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
            >
              <List size={16} />
            </MenuButton>
            <MenuButton
              title="Lista Numerada"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
            >
              <ListOrdered size={16} />
            </MenuButton>
            <MenuButton
              title="Citacao"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
            >
              <Quote size={16} />
            </MenuButton>
          </div>

          <div className="flex items-center gap-0.5 px-1.5 border-r border-border-input relative">
            <MenuButton
              title="Inserir Link"
              onClick={openLinkPopover}
              isActive={editor.isActive('link')}
            >
              <LinkIcon size={16} />
            </MenuButton>
            
            {/* Link Popover */}
            {showLinkPopover && (
              <div 
                ref={linkPopoverRef}
                className="absolute top-full left-0 mt-2 bg-surface-card border border-border-default rounded-lg shadow-xl p-4 z-50 w-80"
              >
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="label-field-muted">URL do Link</label>
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="field-input text-sm"
                      placeholder="https://exemplo.com"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          applyLink();
                        }
                        if (e.key === 'Escape') {
                          setShowLinkPopover(false);
                        }
                      }}
                    />
                  </div>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={linkTarget === '_blank'}
                      onChange={(e) => setLinkTarget(e.target.checked ? '_blank' : '')}
                      className="check-field"
                    />
                    <span className="text-sm text-text-body">Abrir em nova aba</span>
                  </label>
                  
                  <div className="flex items-center gap-2 pt-2 border-t border-border-default">
                    <button
                      type="button"
                      onClick={applyLink}
                      className="btn-action text-sm flex-1"
                    >
                      Aplicar
                    </button>
                    {editor.isActive('link') && (
                      <button
                        type="button"
                        onClick={removeLink}
                        className="px-3 py-2 text-sm text-status-trash hover:bg-status-trash/10 rounded transition-colors"
                      >
                        Remover
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowLinkPopover(false)}
                      className="px-3 py-2 text-sm text-text-muted hover:text-text-heading transition-colors"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            )}

            <MediaPicker onSelect={handleImageSelect}>
              <button
                type="button"
                title="Inserir Imagem"
                className="p-1.5 rounded transition-all duration-200 flex items-center justify-center text-text-muted hover:bg-surface-muted hover:text-text-heading"
              >
                <ImageIcon size={16} />
              </button>
            </MediaPicker>
            
            <MenuButton
              title="Limpar Formatacao"
              onClick={() => editor.chain().focus().unsetAllMarks().run()}
            >
              <Eraser size={16} />
            </MenuButton>
          </div>

          <div className="flex items-center gap-0.5 pl-1.5 ml-auto">
            <MenuButton
              title="Desfazer"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo size={16} />
            </MenuButton>
            <MenuButton
              title="Refazer"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo size={16} />
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
          opacity: 0.7;
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
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin: 1em 0; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; margin: 1em 0; }
        .ProseMirror li { margin-bottom: 0.4em; }
        .ProseMirror li p { margin: 0; }
        .ProseMirror ul li { list-style-type: disc; }
        .ProseMirror ul li li { list-style-type: circle; }
        .ProseMirror ol li { list-style-type: decimal; }
        .ProseMirror a {
          color: var(--color-action, #2271b1);
          text-decoration: underline;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
          margin: 1em 0;
        }
        .ProseMirror mark {
          background-color: #fef08a;
          border-radius: 2px;
          padding: 0.1em 0.2em;
        }
        .ProseMirror code {
          background: var(--color-surface-muted, #f9f9f9);
          border-radius: 3px;
          padding: 0.15em 0.3em;
          font-size: 0.9em;
        }
        .ProseMirror hr {
          border: none;
          border-top: 1px solid var(--color-border-default, #c3c4c7);
          margin: 1.5em 0;
        }

        .read-only .ProseMirror {
          cursor: default;
        }
      `}</style>
    </div>
  );
}
