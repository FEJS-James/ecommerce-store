import TrackPageView from "@/components/TrackPageView";
import { notFound } from "next/navigation";
import { queryOne, queryAll } from "@/lib/db";
import { formatPrice, CATEGORIES, CATEGORY_FAQS } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import GeoPrice from "@/components/GeoPrice";
import PurchaseActions from "@/components/PurchaseActions";
import CategoryIcon from "@/components/CategoryIcon";
import ImageGallery from "@/components/ImageGallery";
import FAQAccordion from "@/components/FAQAccordion";
import MobilePurchaseBar from "@/components/MobilePurchaseBar";
import {
  Zap,
  Lock,
  ShieldCheck,
  Mail,
  FileText,
  HardDrive,
  Check,
  Home,
} from "lucide-react";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function parseDescriptionSections(text: string): {
  description: string;
  whatsInside: Array<{ name: string; detail: string }>;
  howToUse: Array<{ step: number; description: string }>;
} {
  const whatsInside: Array<{ name: string; detail: string }> = [];
  const howToUse: Array<{ step: number; description: string }> = [];
  const descriptionParts: string[] = [];

  const sections = text.split(/(?=^## )/m);

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    if (/^## what['\u2019]?s inside/i.test(trimmed)) {
      const lines = trimmed.split("\n").slice(1);
      for (const line of lines) {
        const match = line.match(
          /^[-*]\s+\*{0,2}(.+?)\*{0,2}\s*[-\u2014:]\s*(.+)$/,
        );
        if (match) {
          whatsInside.push({
            name: match[1].replace(/\*\*/g, "").trim(),
            detail: match[2].trim(),
          });
        } else {
          const simpleMatch = line.match(/^[-*]\s+(.+)$/);
          if (simpleMatch) {
            whatsInside.push({
              name: simpleMatch[1].replace(/\*\*/g, "").trim(),
              detail: "",
            });
          }
        }
      }
    } else if (/^## how to use/i.test(trimmed)) {
      const lines = trimmed.split("\n").slice(1);
      let stepNum = 0;
      for (const line of lines) {
        const numberedMatch = line.match(/^(\d+)[.)]\s+(.+)$/);
        const bulletMatch = line.match(/^[-*]\s+(.+)$/);
        if (numberedMatch && stepNum < 4) {
          stepNum++;
          howToUse.push({
            step: stepNum,
            description: numberedMatch[2].replace(/\*\*/g, "").trim(),
          });
        } else if (bulletMatch && stepNum < 4) {
          stepNum++;
          howToUse.push({
            step: stepNum,
            description: bulletMatch[1].replace(/\*\*/g, "").trim(),
          });
        }
      }
    } else {
      descriptionParts.push(trimmed);
    }
  }

  return { description: descriptionParts.join("\n\n"), whatsInside, howToUse };
}

function renderDescription(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul
          key={`list-${elements.length}`}
          className="list-disc list-inside space-y-1 text-zinc-400 mb-4 ml-1"
        >
          {listItems.map((item, i) => (
            <li
              key={i}
              dangerouslySetInnerHTML={{ __html: formatInline(item) }}
            />
          ))}
        </ul>,
      );
      listItems = [];
    }
  }

  function formatInline(inlineText: string): string {
    return inlineText
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(
        /`(.+?)`/g,
        '<code class="bg-white/[0.06] px-1.5 py-0.5 rounded text-sm text-indigo-300 font-mono">$1</code>',
      );
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(
        <h1
          key={elements.length}
          className="text-3xl font-bold text-white mb-4"
        >
          {trimmed.slice(2)}
        </h1>,
      );
    } else if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h2
          key={elements.length}
          className="text-xl font-semibold text-white mt-8 mb-3"
        >
          {trimmed.slice(3)}
        </h2>,
      );
    } else if (trimmed.startsWith("- ")) {
      listItems.push(trimmed.slice(2));
    } else if (trimmed === "") {
      flushList();
    } else {
      flushList();
      elements.push(
        <p
          key={elements.length}
          className="text-zinc-400 mb-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
        />,
      );
    }
  }
  flushList();
  return elements;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  const product = await queryOne<Product>(
    "SELECT * FROM products WHERE slug = ? AND status = 'active'",
    [slug],
  );

  if (!product) notFound();

  const relatedProducts = await queryAll<Product>(
    "SELECT * FROM products WHERE category = ? AND id != ? AND status = 'active' LIMIT 3",
    [product.category, product.id],
  );

  const category = CATEGORIES[product.category];
  const faqs = CATEGORY_FAQS[product.category] || [];

  let previewImages: string[] = [];
  try {
    const parsed = JSON.parse(product.preview_images || "[]");
    previewImages = Array.isArray(parsed) ? parsed : [];
  } catch {
    /* ignore */
  }

  const { description, whatsInside, howToUse } = parseDescriptionSections(
    product.description,
  );
  const hasFileInfo = product.file_name || product.file_size_bytes > 0;
  const fileSizeFormatted =
    product.file_size_bytes > 0
      ? formatFileSize(product.file_size_bytes)
      : null;
  const savingsText = product.compare_price_cents
    ? `Save ${formatPrice(Number(product.compare_price_cents) - Number(product.price_cents))} (${Math.round((1 - Number(product.price_cents) / Number(product.compare_price_cents)) * 100)}% off)`
    : null;

  return (
    <>
      <TrackPageView event="product_view" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 pb-28 lg:pb-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-zinc-500 mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center flex-wrap gap-1">
            <li className="flex items-center">
              <a
                href="/"
                className="hover:text-indigo-400 transition-colors flex items-center gap-1"
              >
                <Home className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Home</span>
              </a>
            </li>
            <li className="flex items-center">
              <span className="mx-2 text-zinc-700">/</span>
              <a
                href="/products"
                className="hover:text-indigo-400 transition-colors"
              >
                Products
              </a>
            </li>
            {category && (
              <li className="flex items-center">
                <span className="mx-2 text-zinc-700">/</span>
                <a
                  href={`/products?category=${product.category}`}
                  className="hover:text-indigo-400 transition-colors"
                >
                  {category.label}
                </a>
              </li>
            )}
            <li className="flex items-center">
              <span className="mx-2 text-zinc-700">/</span>
              <span className="text-zinc-300 truncate max-w-[200px]">
                {product.name}
              </span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2">
            {category && (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full mb-4"
                style={{
                  background: "rgba(99, 102, 241, 0.1)",
                  color: "#A5B4FC",
                }}
              >
                <CategoryIcon
                  name={category.iconName}
                  className="w-3.5 h-3.5"
                  aria-hidden="true"
                />
                {category.label}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {product.name}
            </h1>

            {product.short_description && (
              <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                {product.short_description}
              </p>
            )}

            <ImageGallery
              mainImage={product.thumbnail_url}
              previewImages={previewImages}
              productName={product.name}
            />

            {description && (
              <div className="max-w-none mb-12">
                {renderDescription(description)}
              </div>
            )}

            {whatsInside.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">
                  What&apos;s Inside
                </h2>
                <div className="glass rounded-2xl p-6 space-y-4">
                  {whatsInside.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div
                        className="mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(16, 185, 129, 0.15)" }}
                      >
                        <Check
                          className="w-3.5 h-3.5 text-emerald-400"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="text-sm leading-relaxed">
                        <span className="font-semibold text-white">
                          {item.name}
                        </span>
                        {item.detail && (
                          <span className="text-zinc-400">
                            {" "}
                            &mdash; {item.detail}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {howToUse.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">
                  How To Use
                </h2>
                <div className="space-y-4">
                  {howToUse.map((step) => (
                    <div key={step.step} className="flex items-start gap-4">
                      <div
                        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                        style={{
                          background:
                            "linear-gradient(135deg, #6366F1, #8B5CF6)",
                          color: "white",
                        }}
                      >
                        {step.step}
                      </div>
                      <p className="text-zinc-300 pt-1 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {Array.isArray(faqs) && faqs.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Frequently Asked Questions
                </h2>
                <FAQAccordion items={faqs} />
              </section>
            )}
          </div>

          {/* RIGHT COLUMN: Sticky Purchase Card */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="glass rounded-2xl p-6 sticky top-24">
              {category && (
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full mb-4"
                  style={{
                    background: "rgba(99, 102, 241, 0.1)",
                    color: "#A5B4FC",
                  }}
                >
                  <CategoryIcon
                    name={category.iconName}
                    className="w-3 h-3"
                    aria-hidden="true"
                  />
                  {category.label}
                </span>
              )}

              <h2 className="text-xl font-bold text-white mb-2">
                {product.name}
              </h2>
              {product.short_description && (
                <p className="text-zinc-500 text-sm mb-5">
                  {product.short_description}
                </p>
              )}

              <div className="flex items-baseline gap-3 mb-2">
                <GeoPrice
                  priceCents={product.price_cents}
                  comparePriceCents={product.compare_price_cents}
                  className="text-[28px] font-bold text-white leading-tight"
                  strikethroughClassName="text-lg text-zinc-600 line-through"
                />
              </div>

              {savingsText ? (
                <div
                  className="text-sm font-medium px-4 py-2 rounded-lg mb-6 text-center"
                  style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    color: "#6EE7B7",
                  }}
                >
                  {savingsText}
                </div>
              ) : (
                <div className="mb-6" />
              )}

              <PurchaseActions
                productId={product.id}
                priceCents={product.price_cents}
                isDigitalProduct={true}
              />

              <p className="text-xs text-zinc-600 text-center mb-4">
                Instant download.{" "}
                <a
                  href="/sales-terms"
                  className="text-indigo-400 hover:text-indigo-300 underline"
                >
                  Sales Terms
                </a>{" "}
                apply.
              </p>

              <div className="space-y-3 text-sm text-zinc-500 mb-6">
                <div className="flex items-center gap-2.5">
                  <Zap
                    className="w-4 h-4 text-indigo-400 shrink-0"
                    aria-hidden="true"
                  />
                  <span>Instant download after purchase</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Lock
                    className="w-4 h-4 text-indigo-400 shrink-0"
                    aria-hidden="true"
                  />
                  <span>Lifetime access with free updates</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck
                    className="w-4 h-4 text-indigo-400 shrink-0"
                    aria-hidden="true"
                  />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail
                    className="w-4 h-4 text-indigo-400 shrink-0"
                    aria-hidden="true"
                  />
                  <span>Email support included</span>
                </div>
              </div>

              {hasFileInfo && (
                <div className="rounded-xl p-4 border-t border-white/[0.06]">
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                    File Details
                  </h3>
                  <div className="space-y-2 text-sm text-zinc-400">
                    {product.file_name && (
                      <div className="flex items-center gap-2">
                        <FileText
                          className="w-4 h-4 text-zinc-600"
                          aria-hidden="true"
                        />
                        <span className="truncate">{product.file_name}</span>
                      </div>
                    )}
                    {product.file_size_bytes > 0 && (
                      <div className="flex items-center gap-2">
                        <HardDrive
                          className="w-4 h-4 text-zinc-600"
                          aria-hidden="true"
                        />
                        <span>{fileSizeFormatted}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {product.preview_url && (
                <div className="mt-4 rounded-xl p-4 border border-indigo-500/20 bg-indigo-500/[0.04] backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText
                      className="w-4 h-4 text-indigo-400"
                      aria-hidden="true"
                    />
                    <h3 className="text-sm font-semibold text-white">
                      What&apos;s Inside
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 mb-3">
                    Preview &mdash; See what&apos;s included before you buy
                  </p>
                  <a
                    href={product.preview_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                    View Preview PDF
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {Array.isArray(relatedProducts) && relatedProducts.length > 0 && (
          <section className="mt-20 pt-16 border-t border-white/[0.06]">
            <h2 className="text-2xl font-bold text-white mb-8">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <MobilePurchaseBar
        productId={product.id}
        productName={product.name}
        priceCents={product.price_cents}
        comparePriceCents={product.compare_price_cents}
        savingsText={savingsText}
        categoryLabel={category?.label ?? null}
        categoryIconName={category?.iconName ?? null}
        fileName={product.file_name}
        fileSizeFormatted={fileSizeFormatted}
      />
    </>
  );
}
