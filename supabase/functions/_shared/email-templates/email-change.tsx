/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="da" dir="ltr">
    <Head />
    <Preview>Bekræft din email-ændring for Plutonic Media</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>Plutonic Media</Text>
        <Heading style={h1}>Bekræft din email-ændring</Heading>
        <Text style={text}>
          Du har anmodet om at ændre din email for Plutonic Media fra{' '}
          <Link href={`mailto:${email}`} style={link}>
            {email}
          </Link>{' '}
          til{' '}
          <Link href={`mailto:${newEmail}`} style={link}>
            {newEmail}
          </Link>
          .
        </Text>
        <Text style={text}>
          Klik på knappen herunder for at bekræfte ændringen:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Bekræft Email-ændring
        </Button>
        <Text style={footer}>
          Hvis du ikke har anmodet om denne ændring, bedes du sikre din konto med det samme.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '40px 25px' }
const brand = {
  fontSize: '18px',
  fontWeight: 'bold' as const,
  fontFamily: "'Space Grotesk', Arial, sans-serif",
  color: '#093128',
  margin: '0 0 30px',
  letterSpacing: '-0.02em',
}
const h1 = {
  fontSize: '22px',
  fontWeight: '600' as const,
  fontFamily: "'Space Grotesk', Arial, sans-serif",
  color: '#093128',
  margin: '0 0 20px',
  letterSpacing: '-0.02em',
}
const text = {
  fontSize: '14px',
  color: '#526b64',
  lineHeight: '1.6',
  margin: '0 0 25px',
}
const link = { color: '#093128', textDecoration: 'underline' }
const button = {
  backgroundColor: '#093128',
  color: '#EBFBF7',
  fontSize: '14px',
  fontWeight: '600' as const,
  fontFamily: "'Space Grotesk', Arial, sans-serif",
  borderRadius: '10px',
  padding: '12px 24px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
