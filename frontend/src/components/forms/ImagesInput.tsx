import React, { useEffect, useMemo, useRef, useState } from "react";

type ImagesInputProps = {
  files: File[];
  existingImages?: string[];
  onChange: (files: File[], existingImages: string[], error?: string) => void;
  max?: number;
  maxSizeMB?: number;
};

const ImagesInput: React.FC<ImagesInputProps> = ({
  files,
  existingImages = [],
  onChange,
  max = 10,
  maxSizeMB = 15,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const previews = useMemo(() => {
    const filePreviews = files.map((f) => {
      const key = `${f.name}-${f.size}-${f.lastModified}`;
      const isUnsupported = ["image/heic", "image/heif", "image/tiff"].includes(
        f.type,
      );
      return {
        key,
        url: isUnsupported ? null : URL.createObjectURL(f),
        isUnsupported,
        name: f.name,
        isExisting: false,
      };
    });
    const existingPreviews = existingImages.map((url, index) => ({
      key: `existing-${index}-${url}`,
      url,
      isUnsupported: false,
      name: url.split("/").pop() || `Image ${index + 1}`,
      isExisting: true,
    }));
    return [...filePreviews, ...existingPreviews];
  }, [files, existingImages]);

  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        if (p.url && !p.isExisting) URL.revokeObjectURL(p.url);
      });
    };
  }, [previews]);

  const addFiles = (incoming: File[]) => {
    if (!incoming.length) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/heic",
      "image/heif",
      "image/gif",
      "image/bmp",
      "image/tiff",
    ];

    const valid = incoming.filter((f) => {
      const okType = allowedTypes.includes(f.type);
      const okSize = f.size <= maxSizeMB * 1024 * 1024;
      const okExtension =
        /\.(jpe?g|png|webp|avif|heic|heif|gif|bmp|tif?t)$/i.test(f.name);
      return okType && okSize && okExtension;
    });

    if (valid.length !== incoming.length) {
      const error = `Some files were skipped (must be JPEG, PNG, WEBP, AVIF, HEIC, GIF, BMP, or TIFF, ≤ ${maxSizeMB}MB, with valid extensions).`;
      onChange(files, existingImages, error);
      return;
    }

    const allFiles = [...files, ...valid];
    const map = new Map<string, File>();
    for (const f of allFiles) {
      if (!f.name.startsWith("existing-image-")) {
        map.set(`${f.name}-${f.size}-${f.lastModified}`, f);
      }
    }
    const nextFiles = Array.from(map.values());

    if (nextFiles.length + existingImages.length > max) {
      onChange(files, existingImages, `You can select up to ${max} images.`);
      return;
    }

    onChange(nextFiles, existingImages);
  };

  const onSelect: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const incoming = Array.from(e.target.files || []);
    addFiles(incoming);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const incoming = Array.from(e.dataTransfer.files || []);
    addFiles(incoming);
  };

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const removeAt = (index: number) => {
    if (previews[index].isExisting) {
      const nextExistingImages = [...existingImages];
      const urlIndex = index - files.length;
      nextExistingImages.splice(urlIndex, 1);
      onChange(files, nextExistingImages);
    } else {
      const nextFiles = [...files];
      nextFiles.splice(index, 1);
      onChange(nextFiles, existingImages);
    }
  };

  return (
    <div className="space-y-3">
      <div
        className={`rounded-md border-2 border-dashed p-6 text-center transition ${
          isDragging ? "border-[#2DB8D1] bg-[#E6F7F3]" : "border-gray-300"
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <p className="text-sm text-gray-600">Drag and drop images here, or</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2DB8D1]"
        >
          Select Images
        </button>
        <p className="mt-1 text-xs text-gray-500">
          JPEG, PNG, WEBP, AVIF, HEIC, GIF, BMP, TIFF
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/avif,image/heic,image/heif,image/gif,image/bmp,image/tiff,image/tif"
          multiple
          hidden
          onChange={onSelect}
        />
      </div>

      {(files.length > 0 || existingImages.length > 0) && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {previews.map((p, idx) => (
            <div
              key={p.key}
              className="group relative overflow-hidden rounded border"
            >
              {p.url ? (
                <img
                  src={p.url}
                  className="h-28 w-full object-cover"
                  alt={`image-${idx}`}
                  onError={(e) => {
                    console.error(`Failed to load image: ${p.url}`);
                    e.currentTarget.style.display = "none";
                    (
                      e.currentTarget.nextElementSibling as HTMLElement
                    ).style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`flex h-28 w-full items-center justify-center bg-gray-100 text-xs text-gray-600 ${
                  p.url ? "hidden" : "flex"
                }`}
                title={p.name}
              >
                {p.isUnsupported
                  ? `${p.name} (Preview not available)`
                  : `Image failed to load: ${p.name}`}
              </div>
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="absolute right-1 top-1 rounded bg-black/60 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100"
                aria-label="Remove image"
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImagesInput;
