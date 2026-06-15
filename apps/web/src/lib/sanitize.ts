import DOMPurify from "isomorphic-dompurify";

const CONFIG = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "s",
    "h1",
    "h2",
    "h3",
    "ul",
    "ol",
    "li",
    "blockquote",
    "pre",
    "code",
    "a",
    "img",
    "hr",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "class"],
};

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, CONFIG);
}
