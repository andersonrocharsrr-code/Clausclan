"""Cria a chave de assinatura do APK a partir de uma frase secreta (segredo NEXA_SIGNING_SEED no GitHub).

A mesma frase gera sempre a mesma chave e o mesmo certificado. Por isso cada APK novo pode ser
instalado por cima do anterior, sem perder os dados, e a chave nunca precisa ser guardada em arquivo.

Uso: python make-keystore.py <saida.p12>
Lê NEXA_SIGNING_SEED do ambiente e imprime a senha do keystore (derivada da mesma frase).
"""
import datetime
import hashlib
import hmac
import os
import sys

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.serialization import pkcs12
from cryptography.x509.oid import NameOID


class Drbg:
    """Gerador de números determinístico (HMAC-SHA256 em modo contador)."""

    def __init__(self, key):
        self.key = key
        self.counter = 0

    def bytes(self, n):
        out = b''
        while len(out) < n:
            self.counter += 1
            out += hmac.new(self.key, self.counter.to_bytes(8, 'big'), hashlib.sha256).digest()
        return out[:n]

    def below(self, limit):
        size = (limit.bit_length() + 7) // 8 + 8
        return int.from_bytes(self.bytes(size), 'big') % limit


def probable_prime(n, rng, rounds=48):
    if n < 2:
        return False
    for p in (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37):
        if n % p == 0:
            return n == p
    d, r = n - 1, 0
    while d % 2 == 0:
        d //= 2
        r += 1
    for _ in range(rounds):
        x = pow(2 + rng.below(n - 3), d, n)
        if x in (1, n - 1):
            continue
        for _ in range(r - 1):
            x = pow(x, 2, n)
            if x == n - 1:
                break
        else:
            return False
    return True


def prime(bits, rng, e):
    while True:
        c = int.from_bytes(rng.bytes(bits // 8), 'big') | (3 << (bits - 2)) | 1
        if (c - 1) % e != 0 and probable_prime(c, rng):
            return c


def main():
    seed = os.environ.get('NEXA_SIGNING_SEED', '')
    if len(seed) < 16:
        sys.exit('O segredo NEXA_SIGNING_SEED precisa ter pelo menos 16 caracteres.')
    master = hashlib.scrypt(seed.encode('utf-8'), salt=b'nexa-money-apk-v1', n=2 ** 15, r=8, p=1, maxmem=64 * 1024 * 1024, dklen=64)
    rng = Drbg(master[:32])
    password = hashlib.sha256(master[32:]).hexdigest()[:32]

    e = 65537
    p = prime(1536, rng, e)
    q = prime(1536, rng, e)
    if p < q:
        p, q = q, p
    n = p * q
    d = pow(e, -1, (p - 1) * (q - 1))
    key = rsa.RSAPrivateNumbers(
        p, q, d, d % (p - 1), d % (q - 1), pow(q, -1, p), rsa.RSAPublicNumbers(e, n),
    ).private_key()

    name = x509.Name([
        x509.NameAttribute(NameOID.COMMON_NAME, 'Nexa Money'),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, 'Nexa Money'),
        x509.NameAttribute(NameOID.COUNTRY_NAME, 'BR'),
    ])
    utc = datetime.timezone.utc
    cert = (
        x509.CertificateBuilder()
        .subject_name(name)
        .issuer_name(name)
        .public_key(key.public_key())
        .serial_number(1 + rng.below(2 ** 62))
        .not_valid_before(datetime.datetime(2026, 1, 1, tzinfo=utc))
        .not_valid_after(datetime.datetime(2076, 1, 1, tzinfo=utc))
        .sign(key, hashes.SHA256())  # RSA PKCS#1 v1.5: a assinatura também é sempre a mesma
    )
    data = pkcs12.serialize_key_and_certificates(
        b'nexa', key, cert, None, serialization.BestAvailableEncryption(password.encode()),
    )
    with open(sys.argv[1], 'wb') as f:
        f.write(data)
    fingerprint = cert.fingerprint(hashes.SHA256()).hex(':').upper()
    print(f'Impressão digital do certificado (SHA-256): {fingerprint}', file=sys.stderr)
    print(password)


if __name__ == '__main__':
    main()
