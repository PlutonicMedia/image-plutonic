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

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="da" dir="ltr">
    <Head />
    <Preview>Du er inviteret til Plutonic Media</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>Plutonic Media</Text>
        <Heading style={h1}>Du er inviteret</Heading>
        <Text style={text}>
          Du er blevet inviteret til{' '}
          <Link href={siteUrl} style={link}>
            <strong>Plutonic Media</strong>
          </Link>
          . Klik på knappen herunder for at acceptere invitationen og oprette din konto.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Acceptér Invitation
        </Button>
        <Text style={footer}>
          Hvis du ikke forventede denne invitation, kan du roligt ignorere denne email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

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
