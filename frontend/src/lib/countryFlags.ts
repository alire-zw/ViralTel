export function getCountryFlagUrl(flagCode: string): string {
  return `https://countryflagsapi.netlify.app/flag/${flagCode.toLowerCase()}.svg`
}
