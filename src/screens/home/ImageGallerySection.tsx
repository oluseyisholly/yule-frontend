const heroImages = [
  "Party / celebration",
  "Friends outdoors",
  "Couple chatting",
  "Gift giving",
];

export default function ImageGallerySection() {
  return (
    <section className="px-6 md:px-8 pb-12 md:pb-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {heroImages.map((label, i) => (
          <div
            key={i}
            className="aspect-[3/4] rounded-2xl bg-gray-200 flex items-center justify-center"
          >
            <span className="text-gray-400 text-sm text-center px-2">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
