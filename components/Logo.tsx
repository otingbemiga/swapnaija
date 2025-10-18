import Image from 'next/image';


export default function Logo() {
// Provide width AND height; mark priority if above-the-fold
return (
<Image
src="/logo.png" // prefer a stable path in /public
alt="Site logo"
width={160}
height={48}
priority={true}
style={{ height: 'auto' }} // if you manipulate width/height with CSS
/>
);
}