import { useEffect } from "react";

export function useSEO({
  title,
  description,
  keywords,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = "website",
  schema
}) {
  useEffect(() => {
    // 1. Title
    if (title) {
      document.title = title;
    }

    // 2. Meta Description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = description;
    }

    // 3. Meta Keywords
    if (keywords) {
      let metaKeys = document.querySelector('meta[name="keywords"]');
      if (!metaKeys) {
        metaKeys = document.createElement("meta");
        metaKeys.name = "keywords";
        document.head.appendChild(metaKeys);
      }
      metaKeys.content = keywords;
    }

    // 4. Canonical URL
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.rel = "canonical";
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = canonicalUrl || window.location.href;

    // 5. Open Graph Tags
    const ogTags = {
      "og:title": ogTitle || title,
      "og:description": ogDescription || description,
      "og:image": ogImage,
      "og:type": ogType,
      "og:url": canonicalUrl || window.location.href
    };

    Object.entries(ogTags).forEach(([property, value]) => {
      if (value) {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
          meta = document.createElement("meta");
          meta.setAttribute("property", property);
          document.head.appendChild(meta);
        }
        meta.content = value;
      }
    });

    // 6. Twitter Card Tags
    const twitterTags = {
      "twitter:card": "summary_large_image",
      "twitter:title": ogTitle || title,
      "twitter:description": ogDescription || description,
      "twitter:image": ogImage
    };

    Object.entries(twitterTags).forEach(([name, value]) => {
      if (value) {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
          meta = document.createElement("meta");
          meta.setAttribute("name", name);
          document.head.appendChild(meta);
        }
        meta.content = value;
      }
    });

    // 7. JSON-LD Schema Markup
    let scriptSchema = document.getElementById("seo-schema");
    if (schema) {
      if (!scriptSchema) {
        scriptSchema = document.createElement("script");
        scriptSchema.id = "seo-schema";
        scriptSchema.type = "application/ld+json";
        document.head.appendChild(scriptSchema);
      }
      scriptSchema.innerHTML = JSON.stringify(schema);
    } else {
      if (scriptSchema) {
        scriptSchema.remove();
      }
    }

    // Cleanup function to remove page-specific schema
    return () => {
      const scriptToRemove = document.getElementById("seo-schema");
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [title, description, keywords, canonicalUrl, ogTitle, ogDescription, ogImage, ogType, schema]);
}
