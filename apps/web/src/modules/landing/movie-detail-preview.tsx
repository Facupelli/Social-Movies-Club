import Image from 'next/image';

export function MovieDetailPreview() {
  return (
    <div className="mx-auto w-full max-w-xs rounded-lg border border-border bg-card p-2">
      <Image
        alt="Detalle de La Odisea en QueVes: dos personas que seguís le dieron un promedio de 9 de 10 y vos le diste un 8."
        className="h-auto w-full rounded-md"
        height={1167}
        preload
        sizes="(max-width: 360px) calc(100vw - 3rem), 19rem"
        src="/landing/detail.webp"
        width={651}
      />
    </div>
  );
}
