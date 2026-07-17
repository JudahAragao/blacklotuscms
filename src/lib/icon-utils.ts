import React from 'react';
import * as LucideIcons from 'lucide-react';

// List of allowed SVG tags for sanitization
const ALLOWED_SVG_TAGS = new Set([
  'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'g', 'defs', 'clippath', 'mask', 'pattern', 'image', 'text', 'tspan', 'textpath', 'use', 'switch', 'foreignobject',
]);

// List of allowed SVG attributes
const ALLOWED_SVG_ATTRS = new Set([
  'xmlns', 'xmlns:xlink', 'viewbox', 'width', 'height', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-miterlimit', 'stroke-opacity', 'opacity', 'transform', 'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'points', 'fx', 'fy', 'gradientunits', 'gradienttransform', 'spreadmethod', 'offset', 'stop-color', 'stop-opacity', 'clippath', 'mask', 'fill-rule', 'clip-rule', 'color', 'font-family', 'font-size', 'font-weight', 'text-anchor', 'dominant-baseline', 'alignment-baseline', 'letter-spacing', 'word-spacing', 'id', 'class', 'style',
]);

// Dangerous attributes that could contain scripts
const DANGEROUS_ATTRS = new Set([
  'onclick', 'ondblclick', 'onmousedown', 'onmouseup', 'onmouseover', 'onmousemove', 'onmouseout', 'onkeypress', 'onkeydown', 'onkeyup', 'onfocus', 'onblur', 'onsubmit', 'onreset', 'onselect', 'onchange', 'onload', 'onerror', 'onresize', 'onscroll', 'onunload', 'onabort', 'onbeforeunload', 'onhashchange', 'onpageshow', 'onpagehide', 'onpopstate', 'onstorage', 'onanimationend', 'onanimationiteration', 'onanimationstart', 'ontransitionend', 'onpointerdown', 'onpointermove', 'onpointerup', 'onpointercancel', 'onpointerover', 'onpointerout', 'onpointerenter', 'onpointerleave', 'ongotpointercapture', 'onlostpointercapture', 'onwheel', 'ondrag', 'ondragend', 'ondragenter', 'ondragleave', 'ondragover', 'ondragstart', 'ondrop', 'oncopy', 'oncut', 'onpaste',
]);

/**
 * Sanitizes an SVG string by removing dangerous elements and attributes
 */
export function sanitizeSvg(svg: string): string {
  // Remove script tags
  let sanitized = svg.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers from all tags
  for (const attr of DANGEROUS_ATTRS) {
    const regex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
    sanitized = sanitized.replace(regex, '');
  }

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript\s*:/gi, '');

  // Remove data: protocol (except safe image types)
  sanitized = sanitized.replace(/data\s*:[^image]/gi, '');

  return sanitized;
}

/**
 * Renders a lucide-react icon by name
 */
export function renderLucideIcon(
  iconName: string,
  props?: {
    size?: number;
    color?: string;
    strokeWidth?: number;
    className?: string;
  }
): React.ReactNode {
  const IconComponent = (LucideIcons as any)[iconName];
  if (!IconComponent) {
    return React.createElement('span', { className: 'text-red-500' }, `[Icon not found: ${iconName}]`);
  }
  return React.createElement(IconComponent, {
    size: props?.size || 24,
    color: props?.color,
    strokeWidth: props?.strokeWidth || 2,
    className: props?.className,
  });
}

/**
 * Renders a custom SVG icon safely
 */
export function renderCustomSvgIcon(
  svg: string,
  props?: {
    size?: number;
    color?: string;
    className?: string;
  }
): React.ReactNode {
  const sanitized = sanitizeSvg(svg);

  // Try to set color if provided
  let finalSvg = sanitized;
  if (props?.color) {
    // Replace stroke="currentColor" with the actual color
    finalSvg = finalSvg.replace(/stroke="currentColor"/g, `stroke="${props.color}"`);
    // Replace fill="currentColor" with the actual color
    finalSvg = finalSvg.replace(/fill="currentColor"/g, `fill="${props.color}"`);
  }

  // Set size if provided
  if (props?.size) {
    // Try to set width and height attributes
    finalSvg = finalSvg.replace(/width="[^"]*"/, `width="${props.size}"`);
    finalSvg = finalSvg.replace(/height="[^"]*"/, `height="${props.size}"`);
  }

  return React.createElement('span', {
    className: props?.className,
    dangerouslySetInnerHTML: { __html: finalSvg },
    style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  });
}

/**
 * Main render function that handles both lucide and custom SVG icons
 */
export function renderIcon(
  iconConfig: {
    iconSource?: string;
    iconName?: string;
    iconSvg?: string;
    iconColor?: string;
    iconSize?: number;
  },
  fallbackSize?: number
): React.ReactNode {
  const size = iconConfig.iconSize || fallbackSize || 24;
  const color = iconConfig.iconColor;

  if (iconConfig.iconSource === 'custom' && iconConfig.iconSvg) {
    return renderCustomSvgIcon(iconConfig.iconSvg, { size, color });
  }

  if (iconConfig.iconName) {
    return renderLucideIcon(iconConfig.iconName, { size, color });
  }

  return null;
}

/**
 * Gets the SVG string for a lucide icon (for export/download)
 */
export function getLucideSvgString(iconName: string, props?: { size?: number; color?: string }): string {
  const IconComponent = (LucideIcons as any)[iconName];
  if (!IconComponent) return '';

  // This is a simplified version - in production you might want to use a proper SVG generator
  const size = props?.size || 24;
  const color = props?.color || 'currentColor';

  // Return a placeholder - actual implementation would need to extract SVG path data
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><!-- ${iconName} icon --></svg>`;
}

/**
 * Renders an icon based on stored icon data from post type settings.
 * Falls back to FileText if no icon is configured.
 */
export function renderPostTypeIcon(settings: any, size = 16): React.ReactNode {
  const iconData = settings?.icon as {
    iconName?: string;
    iconSource?: string;
    iconSvg?: string;
  } | undefined;
  
  if (!iconData?.iconName && !iconData?.iconSvg) {
    const { FileText } = require('lucide-react');
    return React.createElement(FileText, { size });
  }

  // Custom SVG
  if (iconData.iconSource === 'custom' && iconData.iconSvg) {
    return React.createElement('span', {
      className: 'flex items-center justify-center',
      style: { width: size, height: size },
      dangerouslySetInnerHTML: { __html: iconData.iconSvg },
    });
  }

  // Lucide icon
  if (iconData.iconName) {
    const IconComponent = (LucideIcons as any)[iconData.iconName];
    if (IconComponent) {
      return React.createElement(IconComponent, { size });
    }
  }

  // Fallback
  const { FileText } = require('lucide-react');
  return React.createElement(FileText, { size });
}
