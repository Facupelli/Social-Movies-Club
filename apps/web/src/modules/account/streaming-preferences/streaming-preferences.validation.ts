import z from 'zod';

const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;

const StreamingCountrySchema = z.object({
  countryCode: z
    .string({ error: 'Ingresa un código de país.' })
    .regex(
      COUNTRY_CODE_PATTERN,
      'Ingresa un código de país válido (dos letras mayúsculas, ej. AR).'
    ),
});

export type StreamingCountryInput = z.infer<typeof StreamingCountrySchema>;

export function validateStreamingCountry(
  formData: FormData
): StreamingCountryInput {
  const data = Object.fromEntries(formData.entries());
  return StreamingCountrySchema.parse(data);
}

const StreamingProviderIdSchema = z.uuid('Ingresa un proveedor válido.');

export type StreamingProvidersInput = {
  providerIds: string[];
};

/**
 * Parses the complete desired provider selection from a form submission.
 *
 * Each selected provider is submitted as a repeated `providerId` form field.
 * An empty submission is valid and means "no selected providers".
 */
export function validateStreamingProviders(
  formData: FormData
): StreamingProvidersInput {
  const providerIds = formData.getAll('providerId');
  return {
    providerIds: z.array(StreamingProviderIdSchema).parse(providerIds),
  };
}
