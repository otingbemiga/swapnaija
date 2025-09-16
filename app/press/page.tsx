import Head from 'next/head';

export default function PressKitPage() {
  return (
    <>
      <Head>
        <title>Press Kit | YourAppName</title>
        <meta name="description" content="Download logos, photos, and brand assets for YourAppName." />
        <meta name="robots" content="index, follow" />

        {/* Open Graph / Facebook */}
        <meta property="og:title" content="Press Kit | YourAppName" />
        <meta property="og:description" content="Download logos, photos, and brand assets for YourAppName." />
        <meta property="og:image" content="https://yourapp.com/images/press-og-image.jpg" />
        <meta property="og:url" content="https://yourapp.com/press-kit" />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Press Kit | YourAppName" />
        <meta name="twitter:description" content="Download logos, photos, and brand assets for YourAppName." />
        <meta name="twitter:image" content="https://yourapp.com/images/press-og-image.jpg" />
      </Head>

      <main className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-4">Press Kit</h1>
        <p>Download official logos, screenshots, and media assets below.</p>
        {/* Add your press-kit content here */}
      </main>
    </>
  );
}
